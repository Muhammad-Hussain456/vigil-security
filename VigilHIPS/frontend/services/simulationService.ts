import { Alert, Severity, DetectionEngine, Endpoint, AttackType, AttackCampaign } from '../types.ts';
import { MOCK_ENDPOINTS } from '../constants.ts';

const KILL_CHAINS: Record<AttackType, Array<Partial<Alert>>> = {
  [AttackType.RANSOMWARE]: [
    {
      title: 'Suspicious Office Macro Execution',
      severity: Severity.MEDIUM,
      processName: 'winword.exe',
      processPath: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
      commandLine: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE" /n "C:\\Users\\User\\Downloads\\invoice.docm"',
      description: 'Office application spawned a child process via macro.',
      engine: DetectionEngine.BEHAVIORAL
    },
    {
      title: 'VSSAdmin Shadow Copy Deletion',
      severity: Severity.CRITICAL,
      processName: 'vssadmin.exe',
      processPath: 'C:\\Windows\\System32\\vssadmin.exe',
      commandLine: 'vssadmin.exe Delete Shadows /All /Quiet',
      description: 'Process attempted to delete system backup shadow copies.',
      engine: DetectionEngine.EXPLOIT_GUARD
    },
    {
      title: 'Mass File Modification Detected',
      severity: Severity.CRITICAL,
      processName: 'encrypter.exe',
      processPath: 'C:\\Users\\User\\AppData\\Local\\Temp\\encrypter.exe',
      commandLine: 'encrypter.exe --start --path C:\\Users\\User\\Documents',
      description: 'Rapid modification of files matching ransomware patterns.',
      engine: DetectionEngine.BEHAVIORAL
    }
  ],
  [AttackType.APT_LATERAL]: [
    {
      title: 'Network Scanner Detected',
      severity: Severity.LOW,
      processName: 'nmap.exe',
      processPath: 'C:\\Tools\\nmap.exe',
      commandLine: 'nmap -sS -p 445 10.20.4.0/24',
      description: 'Internal network scanning activity detected.',
      engine: DetectionEngine.SIGNATURE
    },
    {
      title: 'Credential Dumping Tool',
      severity: Severity.HIGH,
      processName: 'mimikatz.exe',
      processPath: 'C:\\Windows\\Temp\\mimi.exe',
      commandLine: 'sekurlsa::logonpasswords',
      description: 'Known credential dumping signature matched.',
      engine: DetectionEngine.SIGNATURE
    },
    {
      title: 'Remote Service Creation',
      severity: Severity.CRITICAL,
      processName: 'services.exe',
      processPath: 'C:\\Windows\\System32\\services.exe',
      commandLine: 'sc create MalService binPath= "C:\\Windows\\Temp\\rat.exe"',
      description: 'Lateral movement attempt via Service Control Manager.',
      engine: DetectionEngine.BEHAVIORAL
    }
  ],
  [AttackType.DATA_EXFIL]: [
    {
      title: 'Large Outbound Data Transfer',
      severity: Severity.MEDIUM,
      processName: 'chrome.exe',
      processPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      commandLine: 'chrome.exe --headless --dump-dom https://mega.nz/upload',
      description: 'Unusual outbound traffic volume to cloud storage.',
      engine: DetectionEngine.ML_ANOMALY
    },
    {
      title: 'Sensitive File Access',
      severity: Severity.HIGH,
      processName: 'archiver.exe',
      processPath: 'C:\\Program Files\\7-Zip\\7z.exe',
      commandLine: '7z a -tzip secret.zip C:\\Users\\Admin\\Desktop\\Confidential\\*',
      description: 'Compression of sensitive data folders.',
      engine: DetectionEngine.BEHAVIORAL
    }
  ],
  [AttackType.CRYPTO_MINER]: [
    {
      title: 'High CPU Usage - Unsigned Process',
      severity: Severity.MEDIUM,
      processName: 'xmrig.exe',
      processPath: 'C:\\Windows\\Temp\\xmrig.exe',
      commandLine: 'xmrig -o pool.minexmr.com:443 -u WALLET_ID',
      description: 'Sustained high CPU usage by unknown binary.',
      engine: DetectionEngine.ML_ANOMALY
    }
  ]
};

export class SimulationEngine {
  private activeCampaigns: AttackCampaign[] = [];
  private static instance: SimulationEngine;

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public triggerAttack(endpointId: string, type: AttackType) {
    const newCampaign: AttackCampaign = {
      id: `camp-${Date.now()}-${Math.floor(Math.random()*100)}`,
      type,
      startTime: Date.now(),
      stepIndex: 0,
      targetEndpointId: endpointId,
      isActive: true
    };
    
    this.activeCampaigns.push(newCampaign);
  }

  private getContextualVerdict(target: Endpoint, baseAlert: Partial<Alert>): { severity: Severity, verdict: 'AUTHORIZED' | 'SUSPICIOUS' | 'BLOCKED' | 'POLICY_VIOLATION' } {
    const session = target.currentSession;
    
    if (!session) return { severity: baseAlert.severity || Severity.MEDIUM, verdict: 'SUSPICIOUS' };

    const proc = baseAlert.processName || '';

    if (session.explicitDeny.includes(proc) || session.explicitDeny.includes('*')) {
       return { severity: Severity.CRITICAL, verdict: 'POLICY_VIOLATION' };
    }

    if (session.allowedActions.includes(proc) || session.allowedActions.includes('*')) {
       return { severity: Severity.INFO, verdict: 'AUTHORIZED' };
    }

    return { severity: baseAlert.severity || Severity.MEDIUM, verdict: 'SUSPICIOUS' };
  }

  public tick(endpoints: Endpoint[]): { newAlerts: Alert[], updatedEndpoints: Endpoint[] } {
    const newAlerts: Alert[] = [];
    let updatedEndpoints = [...endpoints];

    // DRASTICALLY REDUCED PROBABILITIES FOR DEMO STABILITY
    if (Math.random() < 0.03) { // Reduced from 0.15 (15%) to 0.03 (3%) chance to start campaign
      this.startCampaign(endpoints);
    }

    this.activeCampaigns.forEach((campaign) => {
      if (Math.random() < 0.15) { // Reduced from 0.4 (40%) to 0.15 (15%) chance to advance step
        const baseAlert = this.advanceCampaign(campaign);
        if (baseAlert) {
          const target = endpoints.find(e => e.id === campaign.targetEndpointId);
          
          if (target) {
            const { severity, verdict } = this.getContextualVerdict(target, baseAlert);

            const finalAlert: Alert = {
              ...baseAlert,
              severity,
              endpointId: target.id,
              hostname: target.hostname,
              contextVerdict: verdict,
              userContext: target.currentSession ? `User: ${target.currentSession.username} (${target.currentSession.privilegeLevel})` : 'User: Unknown'
            } as Alert;

            newAlerts.push(finalAlert);
            
            if (verdict === 'BLOCKED' || verdict === 'POLICY_VIOLATION') {
               updatedEndpoints = updatedEndpoints.map(ep => 
                 ep.id === campaign.targetEndpointId ? { ...ep, status: 'compromised' } : ep
               );
            } else if (verdict === 'SUSPICIOUS') {
               updatedEndpoints = updatedEndpoints.map(ep => 
                ep.id === campaign.targetEndpointId && ep.status !== 'compromised' ? { ...ep, status: 'action_needed' } : ep
               );
            }
          }
        }
      }
    });

    this.activeCampaigns = this.activeCampaigns.filter(c => c.isActive);

    return { newAlerts, updatedEndpoints };
  }

  private startCampaign(endpoints: Endpoint[]) {
    const onlineEps = endpoints.filter(e => e.status !== 'offline');
    if (onlineEps.length === 0) return;

    const target = onlineEps[Math.floor(Math.random() * onlineEps.length)];
    const types = Object.values(AttackType);
    const type = types[Math.floor(Math.random() * types.length)];

    const newCampaign: AttackCampaign = {
      id: `camp-${Date.now()}-${Math.floor(Math.random()*100)}`,
      type,
      startTime: Date.now(),
      stepIndex: 0,
      targetEndpointId: target.id,
      isActive: true
    };
    
    this.activeCampaigns.push(newCampaign);
  }

  private advanceCampaign(campaign: AttackCampaign): Partial<Alert> | null {
    const steps = KILL_CHAINS[campaign.type];
    
    if (campaign.stepIndex >= steps.length) {
      campaign.isActive = false;
      return null;
    }

    const stepTemplate = steps[campaign.stepIndex];
    
    const alert: Partial<Alert> = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date(),
      severity: stepTemplate.severity,
      engine: stepTemplate.engine || DetectionEngine.BEHAVIORAL,
      title: stepTemplate.title,
      description: stepTemplate.description,
      processName: stepTemplate.processName,
      processPath: stepTemplate.processPath,
      commandLine: stepTemplate.commandLine,
      parentProcess: 'explorer.exe',
      hash: 'a3f9c2d1e8b7a6c5d4e3f2a1b0c9d8e7',
      campaignId: campaign.id
    };

    campaign.stepIndex++;
    
    if (campaign.stepIndex >= steps.length) {
      campaign.isActive = false;
    }

    return alert;
  }
}
