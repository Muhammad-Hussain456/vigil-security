import React, { useState, useEffect } from 'react';
import { generatePolicyWithGemini } from '../services/geminiService.ts';
import { Policy } from '../types.ts';
import { Sparkles, Save, Trash2, Shield, Plus, UploadCloud, CheckCircle, Code } from 'lucide-react';

interface PolicyManagerProps {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  initialPrompt?: string; 
  onPromptClear?: () => void;
}

export const PolicyManager: React.FC<PolicyManagerProps> = ({ policies, setPolicies, initialPrompt, onPromptClear }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPolicy, setPreviewPolicy] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (!isGenerating && !previewPolicy) {
         handleGenerate(initialPrompt);
      }
    }
  }, [initialPrompt]);

  const handleGenerate = async (textToUse?: string) => {
    const p = textToUse || prompt;
    if (!p.trim()) return;
    setIsGenerating(true);
    const result = await generatePolicyWithGemini(p);
    setPreviewPolicy(result);
    setIsGenerating(false);
  };

  const handleSaveAndDeploy = async () => {
    if (!previewPolicy) return;
    setDeploying(true);
    setDeployProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      setDeployProgress(i);
      await new Promise(r => setTimeout(r, 200));
    }
    try {
      const parsed = JSON.parse(previewPolicy);
      const newPolicy: Policy = {
        id: `pol-${Date.now()}`,
        name: parsed.ruleName || "AI Generated Rule",
        description: parsed.description || prompt.slice(0, 50) + "...",
        status: 'active',
        rules: parsed.conditions?.length || 1,
        lastUpdated: new Date(),
        aiGenerated: true
      };
      setPolicies([newPolicy, ...policies]);
      setPreviewPolicy(null);
      setPrompt('');
      if (onPromptClear) onPromptClear();
    } catch (e) {
      alert("AI generated invalid JSON. Please try regenerating.");
    } finally {
      setDeploying(false);
      setDeployProgress(0);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border border-indigo-200 dark:border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="flex items-center mb-4 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/40">
                 <Sparkles className="w-5 h-5 text-white" />
               </div>
               <h2 className="text-lg font-bold text-indigo-900 dark:text-white">AI Policy Architect</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 relative z-10">
              Describe the threat behavior. Gemini 3 Pro will translate it into a JSON enforcement rule.
            </p>
            
            <textarea
              className="w-full bg-white dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4 min-h-[150px] font-mono shadow-inner transition-colors"
              placeholder="e.g., Block process 'malware.exe' if command line contains 'password'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center shadow-lg"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
              {isGenerating ? 'Architecting Rule...' : 'Generate Policy'}
            </button>
          </div>

          {previewPolicy && (
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                  <div className="flex items-center text-xs font-mono text-gray-500 dark:text-gray-400">
                    <Code className="w-3 h-3 mr-2" />
                    GENERATED_RULE.JSON
                  </div>
                  {!deploying ? (
                    <button 
                      onClick={handleSaveAndDeploy} 
                      className="text-xs flex items-center bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded font-medium transition-colors shadow-lg shadow-green-500/20"
                    >
                      <UploadCloud className="w-3 h-3 mr-1.5" /> Deploy Rule
                    </button>
                  ) : (
                    <span className="text-xs text-blue-500 dark:text-blue-400 animate-pulse font-mono">UPLOADING... {deployProgress}%</span>
                  )}
                </div>
                
                {deploying && (
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${deployProgress}%` }}></div>
                  </div>
                )}

                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 relative group">
                  <pre className="text-xs font-mono text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                    {previewPolicy}
                  </pre>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-5 h-5 mr-3 text-green-500" />
              Active Policies
            </h2>
            <div className="flex space-x-3">
               <span className="text-xs text-gray-500 self-center font-mono">SYNCED: {new Date().toLocaleTimeString()}</span>
               <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-900 dark:text-white transition-colors border border-gray-200 dark:border-gray-600">
                 <Plus className="w-4 h-4 mr-2" /> Manual Entry
               </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Policy Name</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Scope</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Author</th>
                  <th className="px-6 py-4 font-medium text-right tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                {policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${policy.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{policy.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{policy.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                        policy.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                          : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">GLOBAL</td>
                    <td className="px-6 py-4">
                      {policy.aiGenerated ? (
                        <span className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded w-fit border border-indigo-100 dark:border-transparent">
                          <Sparkles className="w-3 h-3 mr-1" /> Gemini 3
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 px-2 py-1 rounded w-fit">
                          <Shield className="w-3 h-3 mr-1" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};