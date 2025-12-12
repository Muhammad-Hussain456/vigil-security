import React, { useMemo, useState } from 'react';
import { Alert, Endpoint, Severity } from '../types.ts';
import { Shield, Zap, Activity, Globe, Server, Info, Laptop, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Lock, Power, Terminal, Network, Search, Eye, User, Fingerprint, List, FileText, Ban, TrendingUp, TrendingDown, FileCheck, FileWarning, WifiOff, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeContext.tsx';

interface DashboardProps {
  alerts: Alert[];
  endpoints: Endpoint[];
  onSelectAlert: (alert: Alert) => void;
  onQuickAction?: (endpointId: string, action: 'isolate' | 'killnet' | 'shell' | 'reboot') => void;
  endpointActions?: Record<string, { isolated: boolean; networkKilled: boolean; shellActive: boolean }>;
  onRemoveEndpoint?: (id: string) => void;
  onNavigateToSettings?: (endpointId?: string) => void;
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => (
  <div className="h-10 w-24 flex items-end space-x-1">
    {data.map((h, i) => (
      <div 
        key={i} 
        style={{ height: `${h}%` }} 
        className={`w-1.5 rounded-t-sm opacity-80 ${color}`}
      />
    ))}
  </div>
);

const StatCard = ({ title, value, sub, icon: Icon, color, trend, trendData }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-xl">
    <div className={`absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-transform transform group-hover:scale-110 duration-500 ${color}`}>
      <Icon className="w-32 h-32" />
    </div>
    
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
          <Icon className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-mono tracking-tight">{value}</div>
        <div className="flex items-center">
           {trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-500 mr-1" /> : <TrendingDown className="w-3 h-3 text-red-500 mr-1" />}
           <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{sub}</div>
        </div>
      </div>
      {trendData && (
        <div className="mt-2">
          <Sparkline data={trendData} color={trend === 'up' ? 'bg-green-500' : 'bg-red-500'} />
        </div>
      )}
    </div>
  </div>
);

// Simple CSS Bar Chart to replace Recharts
const SimpleBarChart = ({ data, theme }: { data: { name: string, count: number }[], theme: string }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="w-full space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium">{d.name}</span>
            <span className="text-gray-500 font-mono">{d.count}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${(d.count / max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple SVG Area Chart to replace Recharts
const SimpleAreaChart = ({ data }: { data: { time: string, threats: number, blocked: number }[] }) => {
  if (!data || data.length === 0) return null;
  
  const width = 100;
  const height = 100;
  const maxVal = Math.max(...data.map(d => Math.max(d.threats, d.blocked)), 10) * 1.2;
  
  const getPoints = (key: 'threats' | 'blocked') => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d[key] / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const pointsThreats = getPoints('threats');
  const pointsBlocked = getPoints('blocked');

  return (
    <div className="w-full h-64 relative">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Gradients */}
        <defs>
          <linearGradient id="gradThreats" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradBlocked" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Areas */}
        <polygon points={`0,${height} ${pointsThreats} ${width},${height}`} fill="url(#gradThreats)" />
        <polygon points={`0,${height} ${pointsBlocked} ${width},${height}`} fill="url(#gradBlocked)" />

        {/* Lines */}
        <polyline points={pointsThreats} fill="none" stroke="#ef4444" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={pointsBlocked} fill="none" stroke="#3b82f6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono uppercase">
        {data.map((d, i) => (
          <span key={i}>{d.time}</span>
        ))}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ alerts, endpoints, onSelectAlert, onQuickAction, endpointActions, onRemoveEndpoint, onNavigateToSettings }) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [showAccessReport, setShowAccessReport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme } = useTheme();
  
  const activeAlerts = alerts.length;
  const compromisedEndpoints = endpoints.filter(e => e.status === 'compromised');
  const healthyEndpoints = endpoints.filter(e => e.status === 'online');
  const offlineEndpoints = endpoints.filter(e => e.status === 'offline');
  const attentionEndpoints = endpoints.filter(e => e.status === 'action_needed');
  const criticalThreats = alerts.filter(a => a.severity === Severity.CRITICAL).length;

  // DYNAMIC CALCULATIONS
  const securityScore = Math.max(0, 100 - (criticalThreats * 2) - (compromisedEndpoints.length * 15) - (attentionEndpoints.length * 5));
  const totalMonitored = endpoints.length;
  const onlineCount = healthyEndpoints.length + compromisedEndpoints.length + attentionEndpoints.length;
  // Simulated events per second based on online devices + some jitter
  const eventsPerSec = (onlineCount * 12.4 + (Math.random() * 2)).toFixed(1); 

  const selectedDevice = endpoints.find(e => e.id === selectedEndpointId);
  const deviceAlerts = useMemo(() => 
    selectedEndpointId ? alerts.filter(a => a.endpointId === selectedEndpointId) : [], 
    [alerts, selectedEndpointId]
  );

  const actionsState = (selectedEndpointId && endpointActions?.[selectedEndpointId]) || { isolated: false, networkKilled: false, shellActive: false };

  const handleDeleteDevice = () => {
    if (selectedEndpointId && onRemoveEndpoint) {
      onRemoveEndpoint(selectedEndpointId);
      setSelectedEndpointId(null);
      setShowDeleteConfirm(false);
    }
  };

  const activityData = useMemo(() => {
    const STATIC_TIMELINE = [
      { time: '00:00', threats: 12, blocked: 10 },
      { time: '04:00', threats: 8, blocked: 8 },
      { time: '08:00', threats: 45, blocked: 42 },
      { time: '12:00', threats: 89, blocked: 80 },
      { time: '16:00', threats: 65, blocked: 62 },
      { time: '20:00', threats: 34, blocked: 34 },
    ];
    const current = { 
      time: 'NOW', 
      threats: activeAlerts + 20, 
      blocked: Math.floor((activeAlerts + 20) * 0.9) 
    };
    return [...STATIC_TIMELINE, current];
  }, [activeAlerts]);

  const attackVectors = useMemo(() => {
    const counts: Record<string, number> = {
      'PowerShell': 12, // Reduced base for demo
      'Ransomware': 5,
      'Lateral Move': 3,
      'Data Exfil': 2
    };
    alerts.forEach(a => {
      if (a.processName?.includes('powershell')) counts['PowerShell']++;
      if (a.title?.includes('Ransom')) counts['Ransomware']++;
      if (a.title?.includes('Service') || a.title?.includes('Scanner')) counts['Lateral Move']++;
      if (a.title?.includes('Transfer') || a.title?.includes('Access')) counts['Data Exfil']++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  }, [alerts]);

  // --- DETAIL VIEW ---
  if (selectedDevice) {
    const session = selectedDevice.currentSession;
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative">
        
        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-gray-900/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-500 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                   <div className="flex items-center space-x-3 text-red-600 dark:text-red-500 mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                         <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">Remove Device?</h3>
                   </div>
                   <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">{selectedDevice.hostname}</span>?
                   </p>
                   <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 mb-6">
                      <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase mb-2">Warning: Irreversible Action</h4>
                      <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc pl-4">
                         <li>All telemetry history will be deleted from HIPS database.</li>
                         <li>Forensic evidence associated with this endpoint will be lost.</li>
                         <li>The agent will need to be re-installed to rejoin.</li>
                      </ul>
                   </div>
                   <div className="flex space-x-3">
                      <button 
                         onClick={() => setShowDeleteConfirm(false)}
                         className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                         onClick={handleDeleteDevice}
                         className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 transition-colors flex items-center justify-center"
                      >
                         <Trash2 className="w-4 h-4 mr-2" /> Confirm Removal
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* IDENTITY DOSSIER MODAL */}
        {showAccessReport && session && (
            <div className="fixed inset-0 z-50 bg-gray-900/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center relative z-10 shrink-0">
                         <div className="flex items-center">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/20">
                               <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">IDENTITY DOSSIER</h3>
                              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-mono mt-0.5">
                                 REF: {selectedDevice.id.toUpperCase()}
                              </p>
                            </div>
                         </div>
                         <button onClick={() => setShowAccessReport(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                             <XCircle className="w-8 h-8" />
                         </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-white dark:bg-gray-900 relative z-10">
                        {/* Session details */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-xl border border-white/10 shrink-0">
                                <span className="text-4xl font-bold font-mono">{session.username.slice(0,2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Subject</div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">{session.username}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Privilege</div>
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{session.privilegeLevel}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Login Time</div>
                                    <div className="text-sm font-mono text-gray-600 dark:text-gray-400">{session.loginTime.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Groups</div>
                                    <div className="flex flex-wrap gap-1">
                                        {session.groups.map(g => (
                                            <span key={g} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] text-gray-700 dark:text-gray-300">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ALLOWED / DENIED LISTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-green-200 dark:border-green-800 bg-green-100/50 dark:bg-green-900/20 flex items-center justify-between">
                                    <h4 className="font-bold text-green-800 dark:text-green-400 flex items-center text-sm">
                                        <FileCheck className="w-4 h-4 mr-2" /> ALLOWED ACTIONS
                                    </h4>
                                    <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">{session.allowedActions.length}</span>
                                </div>
                                <div className="p-4 h-64 overflow-y-auto custom-scrollbar">
                                    {session.allowedActions.map((action, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-700 dark:text-gray-300 py-2 border-b border-green-100 dark:border-green-800/30 last:border-0">
                                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-red-200 dark:border-red-800 bg-red-100/50 dark:bg-red-900/20 flex items-center justify-between">
                                    <h4 className="font-bold text-red-800 dark:text-red-400 flex items-center text-sm">
                                        <FileWarning className="w-4 h-4 mr-2" /> EXPLICIT DENY
                                    </h4>
                                    <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">{session.explicitDeny.length}</span>
                                </div>
                                <div className="p-4 h-64 overflow-y-auto custom-scrollbar">
                                    {session.explicitDeny.map((action, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-700 dark:text-gray-300 py-2 border-b border-red-100 dark:border-red-800/30 last:border-0">
                                            <Ban className="w-3 h-3 text-red-500 mr-2" />
                                            <span className="font-mono text-red-700 dark:text-red-400">{action}</span>
                                        </div>
                                    ))}
                                    {session.explicitDeny.length === 0 && (
                                        <div className="text-center text-gray-400 text-xs italic mt-4">No explicit blocks configured.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Device Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedEndpointId(null)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {selectedDevice.hostname}
                <span className={`ml-3 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedDevice.status === 'online' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 
                  selectedDevice.status === 'compromised' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 
                  selectedDevice.status === 'offline' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                }`}>
                  {selectedDevice.status === 'compromised' ? 'Alerts Available' : selectedDevice.status}
                </span>
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1 font-mono">
                 <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {selectedDevice.ip}</span>
                 <span className="flex items-center"><Server className="w-3 h-3 mr-1" /> {selectedDevice.policyVersion}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
             <button 
               onClick={() => setShowAccessReport(true)}
               disabled={!session}
               className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Fingerprint className="w-4 h-4 mr-2" /> Identity Dossier
             </button>
          </div>
        </div>

        {/* Alerts & Actions Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-4">
             {/* Stats Box */}
             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-xs uppercase">Pending Alerts</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{deviceAlerts.length}</div>
                </div>
                <div className="bg-red-500/10 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
             </div>
             
             {/* Quick Actions Panel */}
             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <Shield className="w-3 h-3 mr-2" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onQuickAction && onQuickAction(selectedDevice.id, 'isolate')}
                      disabled={selectedDevice.status === 'offline'}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                        actionsState.isolated 
                          ? 'bg-red-500 text-white border-red-600' 
                          : 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/30'
                      }`}
                    >
                      <Lock className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{actionsState.isolated ? 'ISOLATED' : 'Isolate Host'}</span>
                    </button>
                    
                    <button 
                       onClick={() => onQuickAction && onQuickAction(selectedDevice.id, 'killnet')}
                       disabled={selectedDevice.status === 'offline'}
                       className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                        actionsState.networkKilled
                          ? 'bg-orange-500 text-white border-orange-600'
                          : 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border-orange-200 dark:border-orange-500/30'
                       }`}
                    >
                      <Network className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{actionsState.networkKilled ? 'NET KILLED' : 'Cut Network'}</span>
                    </button>

                    <button 
                       onClick={() => onQuickAction && onQuickAction(selectedDevice.id, 'shell')}
                       disabled={selectedDevice.status === 'offline'}
                       className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                        actionsState.shellActive
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                       }`}
                    >
                      <Terminal className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{actionsState.shellActive ? 'SHELL ACTIVE' : 'Remote Shell'}</span>
                    </button>

                    <button 
                       onClick={() => onQuickAction && onQuickAction(selectedDevice.id, 'reboot')}
                       disabled={selectedDevice.status === 'offline'}
                       className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Power className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">Reboot</span>
                    </button>
                </div>
             </div>
          </div>

          {/* Activity Stream */}
          <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-800/50 flex justify-between items-center">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                 <Activity className="w-4 h-4 mr-2 text-primary-500" /> Live Activity Stream
               </h3>
               <span className="text-xs text-gray-500 font-mono">REALTIME</span>
             </div>
             
             {selectedDevice.status === 'offline' ? (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <WifiOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Endpoint Offline</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                        To reconnect this device, run the backend agent manually. You will receive a new session token which must be entered in the configuration panel.
                    </p>
                    <div className="flex space-x-4 w-full max-w-md">
                        <button 
                          onClick={() => onNavigateToSettings && onNavigateToSettings(selectedDevice.id)}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center text-sm"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Reconnect / Re-Authenticate
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center text-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Remove Device
                        </button>
                    </div>
                </div>
             ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto custom-scrollbar flex-1">
                 {deviceAlerts.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 h-full">
                      <Shield className="w-16 h-16 mb-4 text-gray-200 dark:text-gray-700" />
                      <p className="font-medium">No active threats detected.</p>
                      <p className="text-xs">System is operating within normal parameters.</p>
                   </div>
                 ) : (
                   deviceAlerts.map(alert => (
                   <div 
                     key={alert.id} 
                     onClick={() => onSelectAlert(alert)}
                     className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-primary-500"
                   >
                      <div className="flex justify-between items-start mb-1">
                         <div className="flex items-center space-x-2">
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                alert.severity === Severity.CRITICAL ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                                alert.severity === Severity.HIGH ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                             }`}>
                                {alert.severity}
                             </span>
                             <span className="text-xs text-gray-400 font-mono">{alert.timestamp.toLocaleTimeString()}</span>
                         </div>
                         <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="font-bold text-sm text-gray-900 dark:text-gray-200 mb-1">{alert.title}</div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-mono space-x-2">
                          <span className="truncate max-w-[200px]">{alert.processName}</span>
                          <span>•</span>
                          <span>{alert.engine}</span>
                      </div>
                   </div>
                   ))
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- FLEET VIEW (Main Dashboard) ---
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-2">
      
      {/* 1. Global Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Security Score" 
          value={`${securityScore}/100`}
          sub="Postural Integrity" 
          icon={Shield} 
          color={securityScore > 80 ? "text-emerald-500" : securityScore > 50 ? "text-yellow-500" : "text-red-500"} 
          trend="up"
          trendData={[85, 88, 92, 90, 95, 98, securityScore]}
        />
        <StatCard 
          title="Active Threats" 
          value={activeAlerts} 
          sub={`${criticalThreats} Critical`} 
          icon={Zap} 
          color="text-red-500" 
          trend={activeAlerts > 10 ? 'up' : 'down'}
          trendData={[5, 12, 8, 15, 20, 25, activeAlerts]}
        />
        <StatCard 
          title="Devices" 
          value={`${onlineCount}/${totalMonitored}`}
          sub="Monitoring Active" 
          icon={Server} 
          color="text-blue-500" 
          trend="up"
          trendData={[90, 90, 95, 95, 98, 98, 98]}
        />
        <StatCard 
          title="Events/Sec" 
          value={eventsPerSec} 
          sub="Peak Traffic" 
          icon={Activity} 
          color="text-purple-500" 
          trend="up"
          trendData={[12, 15, 18, 22, 19, 23, parseFloat(eventsPerSec)]}
        />
      </div>

      {/* 2. Fleet Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Server className="w-5 h-5 mr-2 text-gray-500" />
            Active Fleet
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {healthyEndpoints.map(endpoint => (
             <div 
               key={endpoint.id}
               onClick={() => setSelectedEndpointId(endpoint.id)}
               className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
             >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Protected</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <h3 className="font-bold text-gray-900 dark:text-white truncate">{endpoint.hostname}</h3>
               <p className="text-xs text-gray-500 font-mono mb-3">{endpoint.ip}</p>
             </div>
           ))}
           {compromisedEndpoints.map(endpoint => (
             <div 
               key={endpoint.id}
               onClick={() => setSelectedEndpointId(endpoint.id)}
               className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-500 cursor-pointer transition-all shadow-sm group"
             >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                     <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Alerts Available</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <h3 className="font-bold text-gray-900 dark:text-white truncate">{endpoint.hostname}</h3>
               <p className="text-xs text-gray-500 font-mono mb-3">{endpoint.ip}</p>
             </div>
           ))}
           {attentionEndpoints.map(endpoint => (
             <div 
               key={endpoint.id}
               onClick={() => setSelectedEndpointId(endpoint.id)}
               className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:border-yellow-500 cursor-pointer transition-all shadow-sm group"
             >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                     <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Action Needed</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <h3 className="font-bold text-gray-900 dark:text-white truncate">{endpoint.hostname}</h3>
               <p className="text-xs text-gray-500 font-mono mb-3">{endpoint.ip}</p>
             </div>
           ))}
           {offlineEndpoints.map(endpoint => (
             <div 
               key={endpoint.id}
               onClick={() => setSelectedEndpointId(endpoint.id)}
               className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-all shadow-inner group opacity-80"
             >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                     <WifiOff className="w-3 h-3 text-gray-400" />
                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Backend Stopped</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <h3 className="font-bold text-gray-600 dark:text-gray-300 truncate">{endpoint.hostname}</h3>
               <p className="text-xs text-gray-400 font-mono mb-3">{endpoint.ip}</p>
             </div>
           ))}
        </div>
      </div>

      {/* 3. Analytics Charts (Native) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4 uppercase tracking-wider">Global Threat Volume</h3>
          <div className="h-64 w-full">
             <SimpleAreaChart data={activityData} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
           <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4 uppercase tracking-wider">Top Vectors</h3>
           <div className="h-64 w-full">
             <SimpleBarChart data={attackVectors} theme={theme} />
           </div>
        </div>
      </div>
    </div>
  );
};