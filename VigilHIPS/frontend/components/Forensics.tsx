import React, { useState, useRef, useMemo } from 'react';
import { Alert, AIForensicsAnalysis, Policy, Severity } from '../types.ts';
import { analyzeThreatWithGemini, generateIncidentReport } from '../services/geminiService.ts';
import { Bot, Terminal, ShieldCheck, Loader2, Activity, ListChecks, Lock, Skull, Upload, ImageIcon, X, FileText, Download, Copy, Send, Users, Check, Briefcase, Gavel, Server, ChevronRight, XCircle, Maximize2, Sparkles, AlertTriangle } from 'lucide-react';

interface ForensicsProps {
  alert: Alert | null;
  alerts?: Alert[];
  onSelectAlert?: (alert: Alert) => void;
  onAnalysisComplete: (alertId: string, analysis: AIForensicsAnalysis) => void;
  onBlockThreat?: (threatDescription: string) => void;
  policies?: Policy[];
  endpointActions?: Record<string, { isolated: boolean; networkKilled: boolean; shellActive: boolean }>;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-red-600 dark:text-red-500 border-red-500';
  if (score >= 70) return 'text-orange-600 dark:text-orange-500 border-orange-500';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-500 border-yellow-500';
  return 'text-green-600 dark:text-green-500 border-green-500';
};

const KILL_CHAIN_STEPS = ['Recon', 'Weaponize', 'Deliver', 'Exploit', 'Install', 'C2', 'Actions'];

export const Forensics: React.FC<ForensicsProps> = ({ alert, alerts = [], onSelectAlert, onAnalysisComplete, onBlockThreat, policies, endpointActions }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deviceAlerts = useMemo(() => {
    if (!alert) return [];
    return alerts.filter(a => a.endpointId === alert.endpointId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [alert, alerts]);

  if (!alert) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-gray-500 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
        <Bot className="w-24 h-24 mb-6 opacity-20 text-gray-900 dark:text-white" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Forensics Workbench</h3>
        <p className="max-w-md text-center text-gray-500 dark:text-gray-400">Select an alert from the <strong>Dashboard</strong> to initiate investigation.</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const rawBase64 = base64String.split(',')[1];
        setEvidenceImage(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeThreatWithGemini(alert, evidenceImage || undefined);
    onAnalysisComplete(alert.id, result);
    setAnalyzing(false);
    setShowAnalysisModal(true);
  };

  const handleGenerateReport = async () => {
    if (!alert.aiAnalysis) return;
    setGeneratingReport(true);
    const report = await generateIncidentReport(alert, alert.aiAnalysis);
    setReportMarkdown(report);
    setGeneratingReport(false);
  };

  const handleBlock = () => {
    if (onBlockThreat && alert) {
      const description = `Create a strict blocking rule for the process "${alert.processName}" (Hash: ${alert.hash}).`;
      onBlockThreat(description);
      setShowAnalysisModal(false);
    }
  };

  const analysis = alert.aiAnalysis;
  const currentStepIndex = analysis ? KILL_CHAIN_STEPS.findIndex(step => 
    analysis.killChainPhase.toUpperCase().includes(step.toUpperCase())
  ) : -1;
  const effectiveStepIndex = currentStepIndex === -1 ? 3 : currentStepIndex;

  const renderModalContent = () => {
    if (!analysis) return null;

    if (reportMarkdown) {
      return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-b-2xl overflow-hidden relative">
             <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center text-green-600 dark:text-green-400 font-bold text-sm">
                   <FileText className="w-4 h-4 mr-2" />
                   FINAL REPORT - {alert.id}
                </div>
                <button 
                   onClick={() => setReportMarkdown(null)}
                   className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xs font-bold rounded"
                >
                   Back to Analysis
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-200 dark:bg-black custom-scrollbar relative">
                <div className="bg-white p-12 shadow-2xl min-h-full mx-auto max-w-3xl rounded-sm text-gray-900 border border-gray-300">
                   <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{reportMarkdown}</pre>
                </div>
             </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
           <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center flex-col shadow-inner bg-gray-50 dark:bg-transparent flex-shrink-0 ${getScoreColor(analysis.threatScore)}`}>
                <span className="text-2xl font-bold">{analysis.threatScore}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Threat Score</span>
              </div>
              <div className="flex-1 w-full">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kill Chain Phase</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{analysis.killChainPhase || 'Unknown'}</div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-red-500 transition-all" style={{ width: `${(effectiveStepIndex + 1) / KILL_CHAIN_STEPS.length * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-mono uppercase">
                   <span>Recon</span>
                   <span>Exfil</span>
                </div>
              </div>
           </div>

           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm">
                <span className="text-purple-600 dark:text-purple-400 font-bold mr-2">ANALYSIS:</span>
                {analysis.summary}
              </p>
           </div>

           <div>
              <h4 className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                <ListChecks className="w-4 h-4 mr-2" /> Recommended Actions
              </h4>
              <ul className="space-y-2">
                {analysis.remediationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 p-2 rounded border border-gray-200 dark:border-gray-800">
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
           <button 
             onClick={handleBlock}
             className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-lg shadow-red-500/20"
           >
             <Lock className="w-4 h-4 mr-2" /> Block Process
           </button>
           <button 
             onClick={handleGenerateReport}
             disabled={generatingReport}
             className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/20"
           >
             {generatingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
             Generate Report
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {showAnalysisModal && analysis && (
         <div className="fixed inset-0 z-50 bg-gray-900/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
                 <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center relative z-10 shrink-0">
                      <div className="flex items-center">
                         <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">GEMINI REASONING ENGINE</h3>
                           <p className="text-xs text-purple-500 dark:text-purple-400 font-mono mt-0.5">
                              THREAT ANALYSIS FOR {alert.id}
                           </p>
                         </div>
                      </div>
                      <button onClick={() => setShowAnalysisModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <XCircle className="w-8 h-8" />
                      </button>
                 </div>
                 {renderModalContent()}
             </div>
         </div>
      )}

      {/* Main Header Panel */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="w-64 h-64 text-primary-500" />
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
               <span className={`px-2 py-0.5 rounded text-xs font-bold border ${alert.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20'}`}>
                 {alert.severity}
               </span>
               <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">{alert.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{alert.title}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Terminal className="w-3 h-3 mr-1" />
              {alert.hostname} 
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              {alert.engine}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`w-full lg:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
              analysis && !analyzing
                ? 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transform hover:scale-105 active:scale-95 shadow-indigo-500/20'
            }`}
          >
            {analyzing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Deep Reasoning...</>
            ) : analysis ? (
              <><Maximize2 className="w-5 h-5 mr-2" /> View Analysis Results</>
            ) : (
              <><Bot className="w-5 h-5 mr-2" /> Investigate with Gemini 3</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 lg:min-h-0">
        
        {/* Device Activity Stream */}
        <div className="flex flex-col space-y-4 lg:h-full lg:min-h-0">
           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm h-full">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-200">Device Activity</h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {deviceAlerts.map(a => (
                   <div 
                     key={a.id} 
                     onClick={() => onSelectAlert && onSelectAlert(a)}
                     className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        a.id === alert.id 
                          ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 dark:border-blue-500/50' 
                          : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                           a.severity === Severity.CRITICAL ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 
                           a.severity === Severity.HIGH ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                           'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                           {a.severity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{a.timestamp.toLocaleTimeString()}</span>
                     </div>
                     <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{a.processName}</div>
                   </div>
                ))}
                {deviceAlerts.length === 0 && (
                   <div className="text-center py-8 text-gray-400 text-xs">No activity recorded.</div>
                )}
             </div>
           </div>
        </div>

        {/* Telemetry */}
        <div className="flex flex-col space-y-6 lg:overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-200">Process Telemetry</h3>
            </div>
            <div className="p-4 space-y-4 font-mono text-sm">
              <div className="group">
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Executable</label>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300 break-all whitespace-pre-wrap">
                  {alert.processPath}
                </div>
              </div>
              <div className="group">
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Command Arguments</label>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-yellow-700 dark:text-yellow-400 break-all whitespace-pre-wrap leading-relaxed">
                  {alert.commandLine}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col min-h-[250px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-200">Evidence Locker</h3>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">MULTIMODAL</span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              {!evidenceImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all p-6 text-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Upload Screenshot</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Drop terminal logs or errors here for Vision analysis</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center group h-full border border-gray-800">
                  <img 
                    src={`data:image/png;base64,${evidenceImage}`} 
                    className="max-h-64 object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt="Evidence" 
                  />
                  <button 
                    onClick={() => setEvidenceImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-xs text-green-400 font-mono rounded">
                    EVIDENCE_LOADED
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investigation Status */}
        <div className="flex flex-col space-y-6 lg:h-full lg:min-h-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm h-full relative">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center">
               <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
               <h3 className="font-semibold text-gray-900 dark:text-gray-200">Investigation Status</h3>
             </div>
             
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
               {!analysis ? (
                 <>
                   <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-6 border border-gray-200 dark:border-gray-600">
                      <Skull className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                   </div>
                   <h4 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Awaiting Analysis</h4>
                   <p className="text-sm max-w-xs text-gray-500 dark:text-gray-400">
                     Click "Investigate with Gemini 3" above to initiate the full reasoning engine and policy checks.
                   </p>
                 </>
               ) : (
                 <>
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 shadow-lg ${getScoreColor(analysis.threatScore).replace('text-', 'bg-').replace('border-', 'border-').replace('500', '100 dark:bg-gray-800')}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.threatScore)}`}>{analysis.threatScore}</span>
                   </div>
                   <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Complete</h4>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                     Threat Score calculated. Reasoning Engine has generated remediation steps.
                   </p>
                   <button 
                     onClick={() => setShowAnalysisModal(true)}
                     className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center"
                   >
                     <Maximize2 className="w-4 h-4 mr-2" />
                     Open Results Modal
                   </button>
                 </>
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};