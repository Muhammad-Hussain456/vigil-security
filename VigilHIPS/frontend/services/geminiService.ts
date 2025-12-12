import { GoogleGenAI } from "@google/genai";
import { Alert, AIForensicsAnalysis, ChatMessage } from '../types.ts';

// Using gemini-3-pro-preview for advanced reasoning on forensics AND policy generation
const FORENSICS_MODEL = 'gemini-3-pro-preview'; 
const POLICY_MODEL = 'gemini-3-pro-preview'; 
const COPILOT_MODEL = 'gemini-3-pro-preview';
const REPORT_MODEL = 'gemini-3-pro-preview';

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

// Helper to clean JSON output from markdown blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeThreatWithGemini = async (alert: Alert, imageBase64?: string): Promise<AIForensicsAnalysis> => {
  try {
    const ai = getAiClient();
    const promptText = `
      You are a Tier 3 SOC Analyst. Analyze this security alert ${imageBase64 ? 'and the attached evidence screenshot' : ''}.
      
      ALERT METADATA:
      - Title: ${alert.title}
      - Process: ${alert.processName}
      - CommandLine: ${alert.commandLine}
      - Severity: ${alert.severity}
      
      TASK:
      1. If an image is provided, extract any visible text (OCR) or visual anomalies (error codes, hex dumps).
      2. Decode encoded commands if present in text or image.
      3. Assess intent and map to MITRE ATT&CK.
      4. Assign a Threat Score (0-100).

      RESPONSE FORMAT (JSON ONLY):
      {
        "summary": "Technical explanation including insights from visual evidence if present.",
        "threatScore": number,
        "mitreTactic": "string",
        "mitreTechnique": "string",
        "remediationSteps": ["step1", "step2"],
        "killChainPhase": "string"
      }
    `;

    const parts: any[] = [{ text: promptText }];
    
    // Add image part if provided (Multimodality)
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: FORENSICS_MODEL,
      contents: { parts }, // Use 'parts' array for multimodal
      config: {
        temperature: 0.2, 
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJson(text)) as AIForensicsAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "AI Analysis failed. Please check API Key or Image format.",
      threatScore: 0,
      mitreTactic: "Error",
      mitreTechnique: "Error",
      remediationSteps: ["Retry analysis", "Check logs"],
      killChainPhase: "Unknown"
    };
  }
};

export const generatePolicyWithGemini = async (description: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are a Senior Security Engineer. Convert the following natural language intent into a specific JSON HIPS Policy Rule.
      
      INTENT: "${description}"
      
      REQUIREMENTS:
      - The rule must be strict and precise.
      - Use standard EDR-like syntax fields (process, file, network).
      
      RESPONSE FORMAT (JSON ONLY):
      {
        "ruleName": "Short descriptive name (Snake_Case)",
        "severity": "CRITICAL|HIGH|MEDIUM",
        "action": "BLOCK_PROCESS|QUARANTINE_FILE|BLOCK_NETWORK",
        "target": {
           "type": "PROCESS|FILE|NETWORK",
           "identifiers": ["list", "of", "identifiers"]
        },
        "conditions": [
           "condition_1 (e.g., 'process.command_line contains X')",
           "condition_2"
        ],
        "description": "Technical description of what this rule catches."
      }
    `;

    const response = await ai.models.generateContent({
      model: POLICY_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });
    
    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Policy Error:", error);
    return JSON.stringify({ error: "Failed to generate policy", details: error });
  }
};

export const queryCopilot = async (
  history: ChatMessage[], 
  context: { alerts: Alert[], systemStats: any }
): Promise<string> => {
  try {
    const ai = getAiClient();
    const alertSummary = context.alerts.map(a => 
      `[${a.severity}] ${a.title} on ${a.hostname} (${a.processName})`
    ).join('\n');

    const systemPrompt = `
      You are VIGIL COPILOT, an advanced AI security assistant.
      
      SYSTEM CONTEXT:
      - Active Alerts: ${context.alerts.length}
      - Compromised Hosts: ${context.systemStats.compromised}
      - Recent Telemetry:
      ${alertSummary}

      ROLE:
      - Answer questions about security posture.
      - Correlate events.
      - Be concise and tactical.
    `;

    const lastUserMessage = history[history.length - 1].content;

    const response = await ai.models.generateContent({
      model: COPILOT_MODEL,
      contents: `${systemPrompt}\n\nUSER QUESTION: ${lastUserMessage}`,
      config: { temperature: 0.4 }
    });

    return response.text || "System offline.";

  } catch (error) {
    console.error("Copilot Error:", error);
    return "I am currently unable to access the neural core. Please check your connection.";
  }
};

export const generateIncidentReport = async (alert: Alert, analysis: AIForensicsAnalysis): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are a Senior Incident Responder (CSIRT Lead). Generate a formal, legally valid **Forensic Incident Report (FIR)** for the following threat.
      
      This report must be suitable for C-Level executives, Legal Counsel, and Insurance Auditors. It must follow NIST SP 800-61 Rev 2 guidelines.

      INCIDENT DATA:
      - Incident ID: ${alert.id}
      - Timestamp: ${new Date().toISOString()}
      - Hostname: ${alert.hostname}
      - User Context: ${alert.userContext || 'SYSTEM/Unknown'}
      - Detection Engine: ${alert.engine}
      - Executable: ${alert.processPath}
      - Command Line: ${alert.commandLine}
      - Verdict: ${alert.contextVerdict || 'Confirmed Malicious'}
      
      AI ANALYSIS FINDINGS:
      - Threat Score: ${analysis.threatScore}/100
      - Kill Chain Phase: ${analysis.killChainPhase}
      - MITRE Tactic/Technique: ${analysis.mitreTactic} / ${analysis.mitreTechnique}
      - Technical Summary: ${analysis.summary}
      
      REPORT STRUCTURE (Use strict Markdown formatting):
      
      # FORENSIC INCIDENT REPORT
      **Classification:** INTERNAL USE ONLY | **Status:** CLOSED/CONTAINED
      
      ## 1. Executive Summary
      (A high-level overview of the incident, business impact, and resolution status in plain business language.)
      
      ## 2. Technical Findings & Indicators of Compromise (IOCs)
      (Detailed technical breakdown. Use code blocks for paths/hashes. Explain the mechanism of attack.)
      
      ## 3. Impact Assessment
      (Data confidentiality, integrity, and availability impact. Identity context analysis.)
      
      ## 4. Remediation & Recovery Actions
      (List immediate containment steps taken and long-term hardening recommendations.)
      
      ## 5. Chain of Custody & Disclaimer
      (Standard legal disclaimer regarding automated analysis and preservation of digital evidence.)
    `;

    const response = await ai.models.generateContent({
      model: REPORT_MODEL,
      contents: prompt,
      config: { temperature: 0.3 }
    });

    return response.text || "Failed to generate report.";
  } catch (error) {
    return "Error generating report.";
  }
};