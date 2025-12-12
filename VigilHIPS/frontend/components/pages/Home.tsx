import React from 'react';
import { Shield, Cpu, Lock, Zap, ArrowRight, Activity, Terminal, ChevronRight, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div 
    className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-500/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
  >
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700 shrink-0">
      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">{description}</p>
  </div>
);

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 selection:bg-primary-500/30 transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gray-50 dark:bg-gray-900 flex items-center min-h-[80vh]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] md:w-[600px] lg:w-[800px] h-[400px] lg:h-[500px] bg-primary-200/40 dark:bg-primary-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[80vw] md:w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-full px-4 py-1.5 mb-8 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">System Operational v3.1</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
                Autonomous Defense <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-500">
                  Powered by Gemini
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto px-4">
                The first Host Intrusion Prevention System that thinks. VIGIL translates real-time telemetry into reasoning, policies, and remediation instantly using Gemini 3 Pro.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 shadow-xl shadow-primary-500/30 border border-primary-500/20"
                >
                  Launch Live Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('docs')}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                >
                  View Architecture
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Enterprise-Grade Defense</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Built for the modern SOC. VIGIL combines signature-based detection with advanced behavioral analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            <FeatureCard 
              icon={Shield} 
              title="Real-Time Protection" 
              description="Continuous monitoring of file systems, processes, and network traffic to block threats before they execute." 
            />
            <FeatureCard 
              icon={Cpu} 
              title="Gemini 3 Reasoning" 
              description="Utilizes Google's latest multimodal model to deobfuscate commands and map threats to MITRE ATT&CK." 
            />
            <FeatureCard 
              icon={Lock} 
              title="Zero-Trust Architecture" 
              description="Every agent is authenticated via mTLS. All policies are cryptographically signed before deployment." 
            />
            <FeatureCard 
              icon={Terminal} 
              title="Automated Policy Ops" 
              description="Convert natural language threat descriptions into rigorous JSON enforcement rules instantly." 
            />
            <FeatureCard 
              icon={Sparkles} 
              title="VIGIL Copilot" 
              description="Always-on AI assistant to query fleet status, correlate alerts, and generate reports using natural language." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Performance First" 
              description="Lightweight Rust-based agent (<50MB RAM) ensures security doesn't compromise productivity." 
            />
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-black py-12 border-t border-gray-200 dark:border-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-600 text-sm">&copy; 2025 VIGIL Security. Built for Google DeepMind Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};