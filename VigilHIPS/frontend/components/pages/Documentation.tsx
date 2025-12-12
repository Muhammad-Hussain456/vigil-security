import React, { useState } from 'react';
import { Book, Cpu, Layers, Code, Shield, Terminal, FileText, Server, Lock, ChevronRight, Monitor, Activity, Zap, AlertTriangle, UserCheck, LayoutDashboard, MousePointerClick, Sparkles, RefreshCw, Database, Box, Key, Globe, BrainCircuit, Search, List, Settings, Command, Bot, Link } from 'lucide-react';

const DocSection = ({ title, children, id }: any) => (
  <section id={id} className="mb-16 scroll-mt-24 border-b border-gray-200 dark:border-gray-800 pb-12 last:border-0">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
      <span className="w-1 h-8 bg-gradient-to-b from-primary-500 to-indigo-600 rounded-full mr-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
      {title}
    </h2>
    {children}
  </section>
);

const CodeBlock = ({ code, lang = 'bash' }: { code: string, lang?: string }) => (
  <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden my-6 shadow-xl">
    <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex justify-between items-center backdrop-blur-sm">
      <span className="text-xs text-gray-400 font-mono uppercase font-bold">{lang}</span>
      <div className="flex space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
      </div>
    </div>
    <div className="p-5 overflow-x-auto bg-black/40">
      <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  </div>
);

const GuideStep = ({ number, title, children, icon: Icon }: any) => (
  <div className="flex gap-4 mb-8">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-700/50">
       {Icon ? <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <span className="font-bold text-indigo-600 dark:text-indigo-400">{number}</span>}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 text-sm">
        {children}
      </div>
    </div>
  </div>
);

export const Documentation = () => {
  const [activeNav, setActiveNav] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = ['Overview', 'Architecture', 'Installation', 'Dashboard Guide', 'Zero Trust Auth', 'Gemini Integration', 'VIGIL Copilot'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex transition-colors duration-300">
      
      <div className="hidden lg:block w-72 fixed left-0 top-20 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-8 overflow-y-auto z-10 transition-colors duration-300">
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Documentation</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const id = item.toLowerCase().replace(/ /g, '-');
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  activeNav === id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChevronRight className={`w-3 h-3 mr-2 transition-transform ${activeNav === id ? 'rotate-90 text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500'}`} />
                {item}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 lg:ml-72 max-w-5xl mx-auto px-8 py-12">
        <div className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-500">Docs</span></h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            Complete reference for the VIGIL Host Intrusion Prevention System v1.0.0. Learn how to deploy agents, configure zero-trust policies, and integrate with the gRPC telemetry stream.
          </p>
        </div>

        <DocSection title="Overview" id="overview">
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p className="leading-relaxed mb-6">
              VIGIL represents a paradigm shift in endpoint security, moving from static signatures to <strong>dynamic, AI-driven intent analysis</strong>. 
              Traditional HIPS relies on rigid rule databases that often fail against zero-day exploits. VIGIL solves this by introducing a cognitive layer into the defense loop.
            </p>
            <p className="leading-relaxed">
              By combining a high-performance Rust agent with Google's Gemini 3 Pro reasoning capabilities, VIGIL creates a closed-loop system that detects, analyzes, and neutralizes threats in milliseconds—often before they can execute their final payload.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
               <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-colors shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2 text-blue-500" /> Sentinel Agent</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A lightweight, Rust-based kernel driver that hooks into OS calls (syscalls) to monitor process creation, file modifications, and network sockets in real-time.</p>
               </div>
               <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-colors shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 flex items-center"><Cpu className="w-5 h-5 mr-2 text-purple-500" /> VIGIL Cloud</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A SaaS dashboard that ingests telemetry, visualizes kill chains, and utilizes <strong>Gemini 3 Pro</strong> to reason about threats and generate remediation policies.</p>
               </div>
            </div>
          </div>
        </DocSection>

        <DocSection title="System Architecture" id="architecture">
           <div className="relative p-8 bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
             
             {/* Tech Stack Grid */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Terminal className="w-16 h-16"/></div>
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Backend (Agent)</div>
                   <div className="text-lg font-bold text-orange-600 dark:text-orange-500">Rust</div>
                   <div className="text-xs text-gray-500 mt-1">Chosen for memory safety and zero-overhead kernel hooking.</div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Server className="w-16 h-16"/></div>
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Backend (API)</div>
                   <div className="text-lg font-bold text-blue-600 dark:text-blue-500">FastAPI + Node</div>
                   <div className="text-xs text-gray-500 mt-1">Native support for Gemini 3 SDK and async processing.</div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Monitor className="w-16 h-16"/></div>
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Frontend</div>
                   <div className="text-lg font-bold text-gray-900 dark:text-white">Next.js</div>
                   <div className="text-xs text-gray-500 mt-1">React-based server-side rendering for dashboard components.</div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Database className="w-16 h-16"/></div>
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Databases</div>
                   <div className="text-lg font-bold text-indigo-600 dark:text-indigo-500">Cluster</div>
                   <div className="text-xs text-gray-500 mt-1">Postgres (Users), ClickHouse (Logs), Redis (Cache).</div>
                </div>
             </div>

             {/* Connection Diagram */}
             <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-x-auto">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">System Connection Topology</h4>
               <div className="min-w-[700px] flex justify-center">
                 <svg viewBox="0 0 800 280" className="w-full max-w-4xl">
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" className="fill-gray-400 dark:fill-gray-600" />
                      </marker>
                    </defs>

                    {/* Agent Node */}
                    <rect x="20" y="100" width="140" height="70" rx="8" className="fill-orange-50 dark:fill-orange-900/20 stroke-orange-500 stroke-2" />
                    <text x="90" y="135" textAnchor="middle" className="text-sm font-bold fill-gray-900 dark:fill-white">Sentinel Agent</text>
                    <text x="90" y="152" textAnchor="middle" className="text-[10px] fill-orange-600 dark:fill-orange-400 font-mono">Kernel Mode (Rust)</text>

                    {/* Arrow Agent -> Gateway */}
                    <line x1="160" y1="135" x2="230" y2="135" className="stroke-gray-300 dark:stroke-gray-600 stroke-2" markerEnd="url(#arrow)" />
                    <text x="195" y="125" textAnchor="middle" className="text-[10px] font-mono fill-gray-500">mTLS / gRPC</text>

                    {/* API Gateway Node */}
                    <rect x="230" y="90" width="160" height="90" rx="8" className="fill-blue-50 dark:fill-blue-900/20 stroke-blue-500 stroke-2" />
                    <text x="310" y="130" textAnchor="middle" className="text-sm font-bold fill-gray-900 dark:fill-white">Orchestrator API</text>
                    <text x="310" y="148" textAnchor="middle" className="text-[10px] fill-blue-600 dark:fill-blue-400 font-mono">FastAPI / Node</text>

                    {/* Arrow API -> AI */}
                    <line x1="310" y1="90" x2="310" y2="60" className="stroke-purple-300 dark:stroke-purple-600 stroke-2 stroke-dashed" markerEnd="url(#arrow)" />

                    {/* AI Node */}
                    <rect x="250" y="10" width="120" height="40" rx="20" className="fill-purple-50 dark:fill-purple-900/20 stroke-purple-500 stroke-2" />
                    <text x="310" y="35" textAnchor="middle" className="text-xs font-bold fill-purple-700 dark:fill-purple-300">Gemini 3 Pro</text>

                    {/* Arrow API -> DB */}
                    <line x1="310" y1="180" x2="310" y2="210" className="stroke-gray-300 dark:stroke-gray-600 stroke-2" />
                    
                    {/* DB Node */}
                    <path d="M250,220 C250,210 370,210 370,220 L370,260 C370,270 250,270 250,260 Z" className="fill-gray-100 dark:fill-gray-800 stroke-gray-400 stroke-2" />
                    <ellipse cx="310" cy="220" rx="60" ry="10" className="fill-gray-200 dark:fill-gray-700 stroke-gray-400 stroke-2" />
                    <text x="310" y="255" textAnchor="middle" className="text-xs font-bold fill-gray-600 dark:fill-gray-400">Telemetry Store</text>

                    {/* Arrow API -> Dashboard */}
                    <line x1="390" y1="135" x2="480" y2="135" className="stroke-green-300 dark:stroke-green-600 stroke-2" markerEnd="url(#arrow)" />
                    <text x="435" y="125" textAnchor="middle" className="text-[10px] font-mono fill-gray-500">SSE Stream</text>

                    {/* Dashboard Node */}
                    <rect x="480" y="100" width="140" height="70" rx="8" className="fill-green-50 dark:fill-green-900/20 stroke-green-500 stroke-2" />
                    <text x="550" y="135" textAnchor="middle" className="text-sm font-bold fill-gray-900 dark:fill-white">Dashboard</text>
                    <text x="550" y="152" textAnchor="middle" className="text-[10px] fill-green-600 dark:fill-green-400 font-mono">React / Next.js</text>

                    {/* Arrow Dashboard -> User */}
                    <line x1="620" y1="135" x2="680" y2="135" className="stroke-gray-300 dark:stroke-gray-600 stroke-2" markerEnd="url(#arrow)" />

                    {/* User Node */}
                    <circle cx="710" cy="135" r="25" className="fill-gray-100 dark:fill-gray-800 stroke-gray-400 stroke-2" />
                    <text x="710" y="180" textAnchor="middle" className="text-xs font-bold fill-gray-600 dark:fill-gray-400">SecOps</text>
                 </svg>
               </div>
             </div>

           </div>
        </DocSection>

        <DocSection title="Installation" id="installation">
           <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
             Follow the standard 3-step deployment procedure for your operating system. Ensure you have administrator privileges.
           </p>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Windows */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                    <h3 className="text-lg font-bold flex items-center mb-4 text-gray-900 dark:text-white">
                      <Monitor className="mr-2 w-5 h-5 text-blue-500"/> Windows
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-3">
                          <span className="font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">1</span> 
                          <span><strong>Download</strong> the Backend .exe file from the Download page.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">2</span> 
                          <span><strong>Install</strong> by double-clicking the .exe file to initialize the service.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">3</span> 
                          <div className="w-full">
                            <strong>Run</strong> via Command Prompt: 
                            <code className="bg-gray-900 text-gray-300 px-3 py-2 rounded mt-2 block font-mono text-xs">vigil-agent.exe </code>
                          </div>
                        </li>
                    </ul>
                </div>

                {/* macOS */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <h3 className="text-lg font-bold flex items-center mb-4 text-gray-900 dark:text-white">
                      <Command className="mr-2 w-5 h-5 text-gray-500 dark:text-gray-400"/> macOS
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-3">
                          <span className="font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">1</span> 
                          <span><strong>Download</strong> the Backend .pkg file from the Download page.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">2</span> 
                          <span><strong>Install</strong> by double-clicking the file to mount the daemon.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">3</span> 
                          <div className="w-full">
                            <strong>Run</strong> via Terminal: 
                            <code className="bg-gray-900 text-gray-300 px-3 py-2 rounded mt-2 block font-mono text-xs">./vigil-agent </code>
                          </div>
                        </li>
                    </ul>
                </div>

                {/* Linux */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                    <h3 className="text-lg font-bold flex items-center mb-4 text-gray-900 dark:text-white">
                      <Server className="mr-2 w-5 h-5 text-orange-500"/> Linux
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-3">
                          <span className="font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">1</span> 
                          <span><strong>Download</strong> the Backend binary file from the Download page.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">2</span> 
                          <span><strong>Install</strong> via Package Manager (apt/yum) or click to execute.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">3</span> 
                          <div className="w-full">
                            <strong>Run</strong> via Shell: 
                            <code className="bg-gray-900 text-gray-300 px-3 py-2 rounded mt-2 block font-mono text-xs">./vigil-agent </code>
                          </div>
                        </li>
                    </ul>
                </div>
            </div>
        </DocSection>

        <DocSection title="Dashboard Guide" id="dashboard-guide">
           <p className="text-gray-600 dark:text-gray-300 mb-10 leading-relaxed text-lg">
             The VIGIL interface provides a centralized command center for monitoring endpoints, investigating threats, and enforcing policies.
           </p>

           <div className="space-y-12">
             
             {/* 1. Live Dashboard */}
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center">
                 <Activity className="w-6 h-6 mr-3 text-primary-500" />
                 1. Live Dashboard
               </h3>
               
               <GuideStep title="Strategic Metrics" icon={LayoutDashboard}>
                 <p>
                   Top-level cards provide immediate health status:
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                     <li><strong>Security Score:</strong> Dynamic postural integrity metric (0-100) calculated from critical alerts and device states.</li>
                     <li><strong>Active Threats:</strong> Real-time counter of unmitigated alerts.</li>
                     <li><strong>Devices:</strong> Count of currently online agents versus total monitored fleet.</li>
                   </ul>
                 </p>
               </GuideStep>

               <GuideStep title="Device Inspector" icon={Monitor}>
                 <p>
                   Clicking on any device card in the "Active Fleet" grid opens the <strong>Detail View</strong>. This view contains:
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                     <li><strong>Live Stream:</strong> A scrolling log of process executions and network connections.</li>
                     <li><strong>Quick Actions:</strong> Buttons to Isolate Host, Kill Network, or Remote Shell.</li>
                     <li><strong>Status Indicators:</strong> Devices marked as <strong>"Alerts Available"</strong> require immediate forensic review.</li>
                   </ul>
                 </p>
               </GuideStep>

               <GuideStep title="Identity Dossier" icon={UserCheck}>
                 <p>
                   Inside the Device Detail view, click the <strong>"Identity Dossier"</strong> button. This opens a modal report showing:
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                     <li><strong>Session Context:</strong> Current logged-in user, privilege level (SYSTEM/USER), and groups.</li>
                     <li><strong>Allowed Actions:</strong> Green list of permitted executables.</li>
                     <li><strong>Explicit Deny:</strong> Red list of processes strictly blocked by policy.</li>
                   </ul>
                 </p>
               </GuideStep>
             </div>

             {/* 2. Forensics & AI */}
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center">
                 <Search className="w-6 h-6 mr-3 text-purple-500" />
                 2. Forensics & AI
               </h3>

               <GuideStep title="Investigate Threats" icon={BrainCircuit}>
                 <p>
                   Select any alert from the feed to open the workbench. Click <strong>"Investigate with Gemini 3"</strong> to trigger the AI Reasoning Engine.
                   The model will analyze the process tree, command line arguments, and severity to calculate a <strong>Threat Score</strong>.
                 </p>
               </GuideStep>

               <GuideStep title="Multimodal Evidence" icon={Sparkles}>
                 <p>
                   You can drag-and-drop screenshots of terminal outputs or ransom notes into the "Evidence Locker". 
                   Gemini Vision will extract text (OCR) and include it in the analysis.
                 </p>
               </GuideStep>

               <GuideStep title="Incident Reporting" icon={FileText}>
                 <p>
                   Once analysis is complete, click <strong>"Generate Report"</strong>. The system will produce a professional Markdown report 
                   summarizing the Kill Chain phase, MITRE Tactic, and recommended remediation steps.
                 </p>
               </GuideStep>
             </div>

             {/* 3. Policy Manager */}
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center">
                 <FileText className="w-6 h-6 mr-3 text-green-500" />
                 3. Policy Manager
               </h3>

               <GuideStep title="AI Policy Architect" icon={Sparkles}>
                 <p>
                   Instead of writing complex regex, simply describe the rule in English.
                   <br/>
                   <em>Example: "Block any process named malware.exe if it tries to access the network."</em>
                   <br/>
                   Click "Generate Policy" and Gemini will convert this into a valid JSON enforcement object.
                 </p>
               </GuideStep>

               <GuideStep title="Deployment" icon={Zap}>
                 <p>
                   Review the generated JSON in the preview window. Click <strong>"Deploy Rule"</strong> to push it to the active fleet via the real-time websocket channel.
                 </p>
               </GuideStep>
             </div>

             {/* 4. Configuration */}
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center">
                 <Settings className="w-6 h-6 mr-3 text-gray-500" />
                 4. Configuration
               </h3>

               <GuideStep title="Agent Fleet" icon={Server}>
                 <p>
                   View a list of all registered endpoints. The <strong>Session</strong> column tracks the number of times a device has established a secure handshake (e.g., Session #5), providing visibility into restart cycles.
                 </p>
               </GuideStep>

               <GuideStep title="Zero Trust Re-binding" icon={Link}>
                 <p>
                   If a device loses its trust token (e.g., after a re-image), it will appear as <strong>RECONNECT REQUIRED</strong>.
                   Enter the new 6-digit token generated by the agent CLI to re-establish the secure mTLS tunnel.
                 </p>
               </GuideStep>
             </div>

           </div>
        </DocSection>

        <DocSection title="Zero Trust Auth" id="zero-trust-auth">
           <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 mb-8">
             <p className="text-sm text-blue-800 dark:text-blue-200">
               <strong>Architecture:</strong> VIGIL employs a strict Zero Trust model where no device is trusted by default, even if inside the perimeter.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><Key className="w-5 h-5 mr-2 text-yellow-500" /> Mutual TLS (mTLS)</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                   Every agent is issued a unique X.509 certificate upon registration. Communication with the Cloud API uses <code>TLS 1.3</code> with mutual authentication, ensuring that only valid agents can send telemetry.
                 </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><UserCheck className="w-5 h-5 mr-2 text-green-500" /> Identity Binding</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                   Device telemetry is inextricably linked to the OS User Session. Alerts include the active <code>User Context</code>, allowing analysts to distinguish between System actions and User actions.
                 </p>
              </div>
           </div>

           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Device Registration & Handshake</h3>
           <p className="text-gray-600 dark:text-gray-400 mb-4">
             When deploying the agent for the first time, the CLI initiates a secure cryptographic handshake. The administrator must grant process monitoring permissions and bind the device to the organization.
           </p>
           
           <div className="bg-black rounded-lg border border-gray-800 p-6 shadow-2xl mb-8">
              <div className="font-mono text-sm space-y-2">
                 <div className="text-gray-400">C:\Program Files\VIGIL\Agent> vigil-agent.exe </div>
                 <div className="text-blue-400">[INFO] Integrity Check: EV SIGNATURE VALID</div>
                 <div className="text-gray-600">---------------------------------------------------</div>
                 <div className="text-yellow-400 font-bold">[REQUEST] ELEVATED PRIVILEGES REQUIRED</div>
                 <div className="text-gray-400">The backend requires permission to access:</div>
                 <div className="text-gray-500 ml-4">1. Active User Identity & Allowed/Blocked Action Lists</div>
                 <div className="text-gray-500 ml-4">2. Real-time Event Detection (Process, File, Network)</div>
                 <div className="text-gray-500 ml-4">3. Alert Transmission to bound Frontend Account</div>
                 <div className="text-gray-600">---------------------------------------------------</div>
                 <div className="text-white">> y</div>
                 <div className="text-green-500 font-bold">[SUCCESS] Access Granted. Monitoring Subsystems Active.</div>
                 <div className="text-purple-400 font-bold">[PROMPT] Enter Administrator Email for Binding:</div>
                 <div className="text-white">> example964@gmail.com</div>
                 <div className="text-blue-400">[INFO] Device Registration Pending...</div>
                 <div className="text-gray-600">---------------------------------------------------</div>
                 <div className="text-yellow-400 font-bold">OPTION 1: REACTIVATING A SESSION?</div>
                 <div className="text-gray-400">Instruction: Enter the token below into the "Re-bind" field on your Dashboard.</div>
                 <div className="text-blue-400 underline cursor-pointer">[LINK] >> Click here to go to LOGIN PAGE</div>
                 <div className="text-yellow-400 font-bold mt-2">OPTION 2: BINDING TO A NEW ACCOUNT?</div>
                 <div className="text-gray-400">Instruction: Enter the token below into the "Device Session Token" field on the Sign Up page.</div>
                 <div className="text-gray-400">Note: If device is already bound, login and remove it first. Monitoring one device by two accounts is not allowed.</div>
                 <div className="text-gray-600">---------------------------------------------------</div>
                 <div className="text-green-400 font-bold text-lg mt-2">SESSION TOKEN: 366-969</div>
                 <div className="text-gray-500 animate-pulse">waiting for handshake...</div>
              </div>
           </div>
        </DocSection>

        <DocSection title="Gemini Integration" id="gemini-integration">
           <div className="flex items-center mb-6">
              <BrainCircuit className="w-8 h-8 text-purple-500 mr-3" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                VIGIL uses <strong>Gemini 3 Pro</strong> as its cognitive engine, not just a chatbot.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-2">Reasoning</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   The model analyzes the <code>killChainPhase</code> by correlating process ancestry (parent/child) with command-line arguments.
                 </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-2">Vision</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   Uploaded screenshots of terminal errors or ransom notes are processed via Gemini Vision to extract IOCs (Indicators of Compromise).
                 </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-2">Generation</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   Natural language requests ("Block Bitcoin miners") are converted into valid, syntax-checked JSON enforcement rules.
                 </p>
              </div>
           </div>
        </DocSection>

        <DocSection title="VIGIL Copilot" id="vigil-copilot">
           <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-6">
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg shrink-0">
                    <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your AI Security Analyst</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                       VIGIL Copilot is an always-on assistant powered by <strong>Gemini 3 Pro</strong>. It acts as a bridge between complex telemetry and human decision-making. You can ask Copilot anything about the VIGIL Security HIPS SaaS platform, active threats, or security best practices.
                    </p>
                 </div>
              </div>
           </div>

           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Capabilities</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                 <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><Search className="w-4 h-4 mr-2 text-blue-500"/> Platform Knowledge</div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">"How do I deploy a new agent?" or "What does the 'Security Score' metric mean?"</p>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                 <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><BrainCircuit className="w-4 h-4 mr-2 text-purple-500"/> Threat Correlation</div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">"Is the PowerShell activity on Device A related to the network scan on Device B?"</p>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                 <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><Shield className="w-4 h-4 mr-2 text-green-500"/> Policy Advice</div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">"Draft a policy to block outbound traffic to non-corporate DNS servers."</p>
              </div>
           </div>

           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Use</h3>
           <ol className="list-decimal list-inside space-y-4 text-gray-600 dark:text-gray-400 mb-8 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <li>
                 <strong>Activate:</strong> Click the floating <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold mx-1"><Sparkles className="w-3 h-3 mr-1"/> Copilot</span> button in the bottom-right corner of the Dashboard.
              </li>
              <li>
                 <strong>Query:</strong> Type your natural language question. You can ask about specific alerts, request summaries of fleet health, or ask general questions about how to use the VIGIL platform.
              </li>
              <li>
                 <strong>Response:</strong> Gemini 3 Pro will reason over the available context and your query to provide a precise, helpful response.
              </li>
           </ol>
        </DocSection>

        <footer className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 text-sm">
           <p>VIGIL Security Platform Documentation v1.0.0</p>
           <p>&copy; 2025 Google DeepMind Hackathon Submission</p>
        </footer>

      </div>
    </div>
  );
};