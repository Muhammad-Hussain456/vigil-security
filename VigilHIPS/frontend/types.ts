export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export enum DetectionEngine {
  BEHAVIORAL = 'Behavioral Analysis',
  SIGNATURE = 'Signature Match',
  ML_ANOMALY = 'ML Anomaly',
  EXPLOIT_GUARD = 'Exploit Guard',
  IDENTITY_CONTEXT = 'Identity Context'
}

export interface OSSession {
  username: string;
  privilegeLevel: 'SYSTEM' | 'ADMINISTRATOR' | 'USER' | 'GUEST';
  groups: string[];
  interactive: boolean;
  loginTime: Date;
  allowedActions: string[];
  explicitDeny: string[];
}

export interface Endpoint {
  id: string;
  hostname: string;
  os: string;
  ip: string;
  status: 'online' | 'offline' | 'compromised' | 'action_needed';
  lastSeen: Date;
  policyVersion: string;
  sessionCount: number;
  currentSession?: OSSession;
}

export interface AIForensicsAnalysis {
  summary: string;
  threatScore: number;
  mitreTactic: string;
  mitreTechnique: string;
  remediationSteps: string[];
  killChainPhase: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: Severity;
  endpointId: string;
  hostname: string;
  engine: DetectionEngine;
  title: string;
  description: string;
  processName: string;
  processPath: string;
  commandLine: string;
  parentProcess: string;
  hash: string;
  aiAnalysis?: AIForensicsAnalysis;
  campaignId?: string;
  screenshotUrl?: string;
  contextVerdict?: 'AUTHORIZED' | 'SUSPICIOUS' | 'BLOCKED' | 'POLICY_VIOLATION';
  userContext?: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  rules: number;
  lastUpdated: Date;
  aiGenerated: boolean;
}

export enum AttackType {
  RANSOMWARE = 'RANSOMWARE',
  APT_LATERAL = 'APT_LATERAL',
  DATA_EXFIL = 'DATA_EXFIL',
  CRYPTO_MINER = 'CRYPTO_MINER'
}

export interface AttackCampaign {
  id: string;
  type: AttackType;
  startTime: number;
  stepIndex: number;
  targetEndpointId: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  mfaEnabled: boolean;
  role: 'admin' | 'analyst';
}