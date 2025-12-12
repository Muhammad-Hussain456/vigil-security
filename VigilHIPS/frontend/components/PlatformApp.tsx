import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './Layout.tsx';
import { Dashboard } from './Dashboard.tsx';
import { AlertFeed } from './AlertFeed.tsx';
import { Forensics } from './Forensics.tsx';
import { PolicyManager } from './PolicyManager.tsx';
import { SOCAssistant } from './SOCAssistant.tsx';
import { AgentFleet } from './AgentFleet.tsx';
import { Alert, Endpoint, Policy, AIForensicsAnalysis, AttackType } from '../types.ts';
import { MOCK_ENDPOINTS, INITIAL_POLICIES } from '../constants.ts';
import { SimulationEngine } from '../services/simulationService.ts';
import { Activity, XCircle, RefreshCw } from 'lucide-react';

interface PlatformAppProps {
  onNavigate: (page: string) => void;
  isDemoUser?: boolean;
}

const DEMO_ENDPOINTS: Endpoint[] = [
  { 
    id: 'ep-demo-1', 
    hostname: 'ADMIN-DEVICE-01 (Lenovo X1)', 
    os: 'Windows 11 Enterprise', 
    status: 'online', 
    ip: '10.0.0.5', 
    policyVersion: 'v1.0.0',
    sessionCount: 8,
    lastSeen: new Date(),
    currentSession: {
      username: 'muhammad.hussain',
      privilegeLevel: 'ADMINISTRATOR',
      groups: ['Domain Admins', 'Debuggers'],
      interactive: true,
      loginTime: new Date(Date.now() - 3600000),
      allowedActions: ['powershell.exe', 'net.exe', 'services.msc', 'nmap.exe'],
      explicitDeny: ['mimikatz.exe', 'ransomware.exe', 'tor.exe']
    }
  },
  { 
    id: 'ep-demo-2', 
    hostname: 'FINANCE-SYS-04 (Dell OptiPlex)', 
    os: 'Windows 10 Pro', 
    status: 'online', 
    ip: '10.0.0.12', 
    policyVersion: 'v1.0.0',
    sessionCount: 3,
    lastSeen: new Date(),
    currentSession: {
      username: 'kiosk_guest',
      privilegeLevel: 'GUEST',
      groups: ['Restricted Users'],
      interactive: true,
      loginTime: new Date(Date.now() - 7200000),
      allowedActions: ['chrome.exe', 'calc.exe', 'notepad.exe'],
      explicitDeny: ['powershell.exe', 'cmd.exe', 'net.exe', 'regedit.exe', '*'] 
    }
  },
  { 
    id: 'ep-demo-3', 
    hostname: 'BUILD-SERVER-09 (Offline)', 
    os: 'Ubuntu 22.04 LTS', 
    status: 'offline', 
    ip: '192.168.1.45', 
    policyVersion: 'v1.0.0',
    sessionCount: 1, 
    lastSeen: new Date(Date.now() - 172800000),
    currentSession: undefined
  } 
];

export const PlatformApp: React.FC<PlatformAppProps> = ({ onNavigate, isDemoUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(isDemoUser ? DEMO_ENDPOINTS : MOCK_ENDPOINTS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [simTime, setSimTime] = useState(0);
  const [isBackendRunning, setIsBackendRunning] = useState(true);
  const [policyPrompt, setPolicyPrompt] = useState<string>('');
  const [endpointActions, setEndpointActions] = useState<Record<string, { isolated: boolean; networkKilled: boolean; shellActive: boolean }>>({});
  const [targetSettingsId, setTargetSettingsId] = useState<string | null>(null);

  const handleQuickAction = (endpointId: string, action: 'isolate' | 'killnet' | 'shell' | 'reboot') => {
    setEndpointActions(prev => {
      const current = prev[endpointId] || { isolated: false, networkKilled: false, shellActive: false };
      let updated = { ...current };

      if (action === 'isolate') updated.isolated = !updated.isolated;
      if (action === 'killnet') updated.networkKilled = !updated.networkKilled;
      if (action === 'shell') updated.shellActive = !updated.shellActive;
      if (action === 'reboot') {
         alert(`Command Queued: REBOOT ${endpointId}`);
      }

      return { ...prev, [endpointId]: updated };
    });
  };

  const handleRemoveEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(ep => ep.id !== id));
    // Also remove associated alerts for cleanliness
    setAlerts(prev => prev.filter(a => a.endpointId !== id));
  };

  const handleNavigateToSettings = (endpointId?: string) => {
    if (endpointId) {
      setTargetSettingsId(endpointId);
    }
    setActiveTab('settings');
  };

  useEffect(() => {
    const engine = SimulationEngine.getInstance();
    const interval = setInterval(() => {
      if (!isBackendRunning) return; 

      setSimTime(prev => {
        const nextTime = prev + 1;
        // DEMO SCRIPTING
        // Trigger attack on ep-demo-1 after roughly 6 seconds (3 ticks)
        if (isDemoUser && nextTime === 3) {
            engine.triggerAttack('ep-demo-1', AttackType.RANSOMWARE);
        }
        return nextTime;
      });
      
      // Pass copy of endpoints to simulation
      let { newAlerts, updatedEndpoints } = engine.tick(endpoints);
      
      // SIMULATION: Randomly toggle backend availability on devices (exclude hardcoded offline ones from coming back online automatically to preserve demo state)
      // But allow online ones to crash
      if (Math.random() < 0.005) { // 0.5% chance per tick to lose a backend
         const onlineEps = updatedEndpoints.filter(e => e.status === 'online');
         if (onlineEps.length > 0) {
             const victim = onlineEps[Math.floor(Math.random() * onlineEps.length)];
             updatedEndpoints = updatedEndpoints.map(e => e.id === victim.id ? { ...e, status: 'offline' } : e);
             newAlerts.push({
                id: `sys-${Date.now()}`,
                timestamp: new Date(),
                severity: 'HIGH',
                endpointId: victim.id,
                hostname: victim.hostname,
                engine: 'System Watchdog',
                title: 'Agent Heartbeat Lost',
                description: 'The backend service stopped communicating. Device marked as OFFLINE.',
                processName: 'vigil-agent.exe',
                processPath: 'N/A',
                commandLine: 'N/A',
                parentProcess: 'N/A',
                hash: 'N/A'
             } as any);
         }
      }

      // SIMULATION: Very small chance for an offline device (that isn't the hardcoded one) to come back online
      // This simulates a reboot or restart
      if (Math.random() < 0.002) {
         const offlineEps = updatedEndpoints.filter(e => e.status === 'offline' && !e.hostname.includes('BUILD-SERVER'));
         if (offlineEps.length > 0) {
            const recovered = offlineEps[Math.floor(Math.random() * offlineEps.length)];
            updatedEndpoints = updatedEndpoints.map(e => e.id === recovered.id ? { ...e, status: 'online', sessionCount: e.sessionCount + 1 } : e);
         }
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 100)); 
      }
      setEndpoints(updatedEndpoints);
    }, 2000);

    return () => clearInterval(interval);
  }, [isBackendRunning, endpoints, isDemoUser]);

  useEffect(() => {
    const crashSim = setInterval(() => {
      // Global backend crash simulation
      if (Math.random() < 0.05) {
        setIsBackendRunning(false);
      }
    }, 60000); // Reduced frequency of global crash
    return () => clearInterval(crashSim);
  }, []);

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setActiveTab('forensics');
  };

  const handleAnalysisComplete = useCallback((alertId: string, analysis: AIForensicsAnalysis) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, aiAnalysis: analysis } : a
    ));
    setSelectedAlert(prev => prev && prev.id === alertId ? { ...prev, aiAnalysis: analysis } : prev);
  }, []);

  const handleBlockThreat = (threatDescription: string) => {
    setPolicyPrompt(threatDescription);
    setActiveTab('policies');
  };

  const handleClearPolicyPrompt = () => {
    setPolicyPrompt('');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onSignOut={() => onNavigate('home')}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0 relative">
        <div className="col-span-1 lg:col-span-4 bg-white/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 mb-6 backdrop-blur-sm sticky top-0 z-10 shadow-sm transition-colors duration-300">
           <div className="flex items-center text-xs font-mono">
              <div className="flex items-center text-primary-600 dark:text-primary-400">
                 <Activity className="w-3 h-3 mr-2 animate-pulse" />
                 SYSTEM ONLINE | TICK: {simTime}
              </div>
           </div>
           
           <div className="hidden md:flex space-x-4 text-xs font-mono text-gray-500 dark:text-gray-400">
             <span>AGENTS: {endpoints.length}</span>
             <span>PROCESSED: {alerts.length + 1240}</span>
             <span className={alerts.length > 5 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-green-500 dark:text-green-400'}>
               THREAT: {alerts.length > 5 ? 'ELEVATED' : 'NORMAL'}
             </span>
           </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="col-span-1 lg:col-span-4 h-full overflow-y-auto pr-2 custom-scrollbar">
            <Dashboard 
              alerts={alerts} 
              endpoints={endpoints} 
              onSelectAlert={handleSelectAlert}
              onQuickAction={handleQuickAction}
              endpointActions={endpointActions}
              onRemoveEndpoint={handleRemoveEndpoint}
              onNavigateToSettings={handleNavigateToSettings}
            />
          </div>
        )}

        {activeTab === 'forensics' && (
          <div className="col-span-1 lg:col-span-4 h-full overflow-y-auto">
            <Forensics 
              alert={selectedAlert} 
              alerts={alerts}
              onSelectAlert={handleSelectAlert}
              policies={policies}
              endpointActions={endpointActions}
              onAnalysisComplete={handleAnalysisComplete}
              onBlockThreat={handleBlockThreat}
            />
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="col-span-1 lg:col-span-4 h-full overflow-y-auto">
            <PolicyManager 
              policies={policies} 
              setPolicies={setPolicies} 
              initialPrompt={policyPrompt}
              onPromptClear={handleClearPolicyPrompt}
            />
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="col-span-1 lg:col-span-4 h-full overflow-y-auto">
             <AgentFleet endpoints={endpoints} highlightEndpointId={targetSettingsId} />
           </div>
        )}

        <SOCAssistant alerts={alerts} endpointsCount={endpoints.length} />
      </div>
    </Layout>
  );
};