import React, { useState, useEffect } from 'react';
import { Endpoint } from '../types.ts';
import { Server, Wifi, WifiOff, Shield, Activity, HardDrive, Cpu, GitBranch, RefreshCw, UserCheck, Key, AlertTriangle, Signal, XCircle } from 'lucide-react';

interface AgentFleetProps {
  endpoints: Endpoint[];
  highlightEndpointId?: string | null;
}

export const AgentFleet: React.FC<AgentFleetProps> = ({ endpoints, highlightEndpointId }) => {
  const onlineCount = endpoints.filter(e => e.status === 'online').length;
  const compromisedCount = endpoints.filter(e => e.status === 'compromised').length;
  const offlineCount = endpoints.filter(e => e.status === 'offline').length;
  
  const [rebindTokens, setRebindTokens] = useState<Record<string, string>>({});
  const [rebindStatus, setRebindStatus] = useState<Record<string, 'idle' | 'verifying' | 'success' | 'error'>>({});
  
  // Fake ticker for animation ref
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (highlightEndpointId) {
      const element = document.getElementById(`row-${highlightEndpointId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add temporary highlight class
        element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
        }, 3000);
      }
    }
  }, [highlightEndpointId]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  const handleTokenChange = (id: string, val: string) => {
    setRebindTokens(prev => ({...prev, [id]: val.toUpperCase()}));
    // Reset error on type
    if (rebindStatus[id] === 'error') {
       setRebindStatus(prev => ({...prev, [id]: 'idle'}));
    }
  };

  const handleRebind = (id: string) => {
    const token = rebindTokens[id];
    if (!token || token.length < 7) return;

    setRebindStatus(prev => ({...prev, [id]: 'verifying'}));
    
    // DEMO CONSTRAINT: The backend is not running on a real device.
    // Therefore, any token entered is technically "incorrect" because it cannot be validated against a live agent signature.
    // As per requirements: "For demo, on entering any token, it must say incorrect token".
    setTimeout(() => {
       const isValid = false; // Always fail in demo
       
       if (isValid) {
         setRebindStatus(prev => ({...prev, [id]: 'success'}));
         alert(`Session Re-established for ${id}. Secure Tunnel Active.`);
       } else {
         setRebindStatus(prev => ({...prev, [id]: 'error'}));
         alert("Incorrect Token: Backend agent not reachable. (Demo Mode: No active kernel driver found)");
       }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white">{endpoints.length}</div>
             <div className="text-xs text-gray-500 uppercase tracking-wider">Total Agents</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-green-600 dark:text-green-500" />
          </div>
          <div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white">{onlineCount}</div>
             <div className="text-xs text-gray-500 uppercase tracking-wider">Online</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-500" />
          </div>
          <div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white">{compromisedCount}</div>
             <div className="text-xs text-gray-500 uppercase tracking-wider">Alerts Active</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
          </div>
          <div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white">v1.0.0</div>
             <div className="text-xs text-gray-500 uppercase tracking-wider">Latest Version</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <HardDrive className="w-5 h-5 mr-3 text-gray-400" />
            Zero-Trust Fleet
          </h2>
          <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors shadow-lg shadow-indigo-500/20">
            <RefreshCw className="w-4 h-4 mr-2" /> Push Agent Update
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Hostname / ID</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider">Managed By</th>
                <th className="px-6 py-4 font-medium tracking-wider">Network IP</th>
                <th className="px-6 py-4 font-medium tracking-wider">Session</th>
                <th className="px-6 py-4 font-medium text-right tracking-wider">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
              {endpoints.map((ep) => (
                <tr 
                  key={ep.id} 
                  id={`row-${ep.id}`}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-500 group ${
                    highlightEndpointId === ep.id ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 text-gray-400">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{ep.hostname}</div>
                        <div className="text-xs text-gray-500 font-mono">{ep.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {ep.status === 'online' && <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>}
                      {ep.status === 'compromised' && <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-ping"></div>}
                      {ep.status === 'offline' && <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>}
                      <span className={`text-xs font-bold uppercase ${
                        ep.status === 'online' ? 'text-green-600 dark:text-green-400' : 
                        ep.status === 'compromised' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {ep.status === 'compromised' ? 'Alerts Available' : ep.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                       <UserCheck className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                       <span className="text-xs font-mono">example964@gmail.com</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {ep.ip}
                  </td>
                  <td className="px-6 py-4">
                    {ep.status === 'offline' && rebindStatus[ep.id] !== 'success' ? (
                      <div className="flex flex-col space-y-1 animate-in fade-in">
                         {rebindStatus[ep.id] === 'error' ? (
                           <div className="flex items-center text-red-600 dark:text-red-500 text-[10px] font-bold">
                             <XCircle className="w-3 h-3 mr-1" /> INVALID IDENTITY TOKEN
                           </div>
                         ) : (
                           <div className="flex items-center text-yellow-600 dark:text-yellow-500 text-[10px] font-bold">
                             <AlertTriangle className="w-3 h-3 mr-1" /> RECONNECT REQUIRED
                           </div>
                         )}
                         <div className="flex space-x-1">
                           <input 
                             type="text" 
                             placeholder="NEW TOKEN" 
                             className={`bg-white dark:bg-black border rounded px-2 py-1 text-xs text-gray-900 dark:text-white w-24 font-mono uppercase shadow-sm ${rebindStatus[ep.id] === 'error' ? 'border-red-500' : 'border-yellow-500/50'}`}
                             value={rebindTokens[ep.id] || ''}
                             onChange={(e) => handleTokenChange(ep.id, e.target.value)}
                           />
                           <button 
                             onClick={() => handleRebind(ep.id)}
                             disabled={rebindStatus[ep.id] === 'verifying'}
                             className={`${rebindStatus[ep.id] === 'error' ? 'bg-red-500 hover:bg-red-400' : 'bg-yellow-500 hover:bg-yellow-400'} text-white rounded px-2 py-1 text-xs font-bold shadow-sm`}
                           >
                             {rebindStatus[ep.id] === 'verifying' ? '...' : 'BIND'}
                           </button>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                         <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
                           Session #{rebindStatus[ep.id] === 'success' ? ep.sessionCount + 1 : ep.sessionCount}
                         </span>
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ep.status === 'offline' ? (
                      <div className="flex flex-col items-end opacity-50">
                         <div className="flex justify-end space-x-1 h-4 items-center">
                            <WifiOff className="w-4 h-4 text-gray-400" />
                            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                         </div>
                         <div className="text-[10px] text-gray-400 mt-1 uppercase font-mono tracking-wider">Signal Lost</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="flex justify-end space-x-1 h-4 items-end">
                          {[1,2,3,4,5].map(i => (
                            <div 
                              key={i} 
                              className={`w-1 rounded-sm transition-all duration-300 ${ep.status === 'compromised' ? 'bg-red-500/60' : 'bg-primary-500/60 dark:bg-primary-400/60'}`} 
                              style={{ 
                                height: `${Math.max(20, Math.random() * 100)}%`,
                                opacity: Math.random() + 0.3
                              }}
                            ></div>
                          ))}
                        </div>
                        <div className={`text-[10px] mt-1 uppercase font-bold animate-pulse flex items-center ${ep.status === 'compromised' ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'}`}>
                           {ep.status === 'compromised' ? 'THREAT DETECTED' : 'LIVE STREAM'}
                           <Activity className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};