import { Endpoint, Policy } from './types.ts';

const DEVICE_MODELS = [
  'Dell XPS 15', 'HP EliteBook 840', 'Lenovo ThinkPad X1', 'MacBook Pro M2', 'Dell Latitude 5420', 'Surface Laptop 4'
];

export const MOCK_ENDPOINTS: Endpoint[] = [
  {
    id: 'dev-001',
    hostname: 'HQ-WORKSTATION-01',
    os: 'Windows 11 Enterprise',
    ip: '10.20.4.15',
    status: 'online',
    lastSeen: new Date(),
    policyVersion: 'v1.0.0',
    sessionCount: 5,
    currentSession: {
      username: 'muhammad.hussain',
      privilegeLevel: 'USER',
      groups: ['Developers', 'Docker Users'],
      interactive: true,
      loginTime: new Date(Date.now() - 3600000), // 1 hour ago
      allowedActions: ['code.exe', 'chrome.exe', 'node.exe', 'git.exe'],
      explicitDeny: ['powershell.exe', 'psexec.exe']
    }
  },
  {
    id: 'dev-002',
    hostname: 'HQ-WORKSTATION-02',
    os: 'macOS Sonoma 14.2',
    ip: '10.20.4.16',
    status: 'online',
    lastSeen: new Date(),
    policyVersion: 'v1.0.0',
    sessionCount: 12,
    currentSession: {
      username: 'john.reese',
      privilegeLevel: 'ADMINISTRATOR',
      groups: ['SecOps', 'Wheel'],
      interactive: true,
      loginTime: new Date(Date.now() - 7200000), // 2 hours ago
      allowedActions: ['*'],
      explicitDeny: ['nc', 'nmap']
    }
  },
  {
    id: 'dev-003',
    hostname: 'LEGACY-DB-SERVER',
    os: 'Ubuntu 20.04 LTS',
    ip: '192.168.1.55',
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000), // 24 hours ago
    policyVersion: 'v1.0.0',
    sessionCount: 2,
    currentSession: undefined // No active session
  }
];

export const INITIAL_POLICIES: Policy[] = [
  { id: 'pol-1', name: 'Global Ransomware Block', description: 'Prevents mass file encryption patterns.', status: 'active', rules: 142, lastUpdated: new Date(), aiGenerated: false },
  { id: 'pol-2', name: 'Web Server Hardening', description: 'Strict process containment for IIS/Nginx.', status: 'active', rules: 56, lastUpdated: new Date(Date.now() - 86400000), aiGenerated: true },
  { id: 'pol-3', name: 'DevOps Container Policy', description: 'Draft policy for Docker hosts.', status: 'draft', rules: 12, lastUpdated: new Date(Date.now() - 172800000), aiGenerated: true },
];
