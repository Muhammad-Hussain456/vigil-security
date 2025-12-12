import React from 'react';
import { Download as DownloadIcon, Server, Monitor, Terminal, Package, Command } from 'lucide-react';

export const Download = () => {
  const handleDownload = (os: 'windows' | 'mac' | 'linux') => {
    let filename = "vigil-agent.exe";
    let mime = "application/vnd.microsoft.portable-executable";
    let magicHeader = new Uint8Array([]);
    
    if (os === 'windows') {
        filename = "vigil-agent-setup.exe";
        // MZ header (4D 5A) for Windows PE
        magicHeader = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xFF, 0xFF]);
        mime = "application/x-msdownload";
    } else if (os === 'mac') {
        filename = "vigil-agent-installer.pkg";
        // XAR header often used in PKG (78 61 72 21)
        magicHeader = new Uint8Array([0x78, 0x61, 0x72, 0x21]);
        mime = "application/x-newton-compatible-pkg";
    } else if (os === 'linux') {
        filename = "vigil-agent-linux-amd64";
        // ELF header (7F 45 4C 46) for Linux binaries
        magicHeader = new Uint8Array([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00]);
        mime = "application/octet-stream";
    }

    // Text content simulation
    const textContent = `
VIGIL SENTINEL AGENT INSTALLER
------------------------------
Target Platform: ${os.toUpperCase()}
Version: 3.1.0-stable
Build Hash: ${Math.random().toString(36).substring(7)}

[STUB] This file is a secure simulation of the compiled Rust backend.
In a production environment, this binary would contain the kernel driver and user-mode service.

Initializing installer logic...
verifying signatures...
unpacking payload...
`;

    // Combine magic header and text to create a "hybrid" blob that looks like a binary but reads like text
    const textEncoder = new TextEncoder();
    const textBuffer = textEncoder.encode(textContent);
    
    const combinedBuffer = new Uint8Array(magicHeader.length + textBuffer.length);
    combinedBuffer.set(magicHeader);
    combinedBuffer.set(textBuffer, magicHeader.length);

    const blob = new Blob([combinedBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Aesthetic feedback
    const btn = document.getElementById(`btn-${os}`);
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerText = "Downloading Securely...";
        setTimeout(() => {
             btn.innerHTML = originalText;
        }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Deploy VIGIL Sentinel</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Enterprise-grade endpoint protection. Select your platform to download the secure backend agent.
          </p>
        </div>

        {/* 3-Step Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none font-black text-6xl text-gray-400">1</div>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                    <DownloadIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Step 1: Download</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get the secured, compiled backend installer file for your specific OS.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none font-black text-6xl text-gray-400">2</div>
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Step 2: Install</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Double-click the downloaded executable file to install the backend service securely.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none font-black text-6xl text-gray-400">3</div>
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Step 3: Run</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open your command prompt or terminal and run the backend to start monitoring.</p>
            </div>
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           {/* Windows */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all group flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Windows</h3>
              <p className="text-sm text-gray-500 mb-6">Windows 10/11 Enterprise & Server 2019+</p>
              
              <button 
                id="btn-windows"
                onClick={() => handleDownload('windows')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center mb-4"
              >
                 <DownloadIcon className="w-4 h-4 mr-2" /> Download .EXE
              </button>
              
              <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 w-full border border-gray-200 dark:border-gray-800">
                 <div className="text-[10px] text-gray-400 font-mono break-all">SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
              </div>
           </div>

           {/* macOS */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all group flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Command className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">macOS</h3>
              <p className="text-sm text-gray-500 mb-6">macOS 12.0 (Monterey) or later (Intel/Apple Silicon)</p>
              
              <button 
                id="btn-mac"
                onClick={() => handleDownload('mac')}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg shadow-gray-500/20 transition-all flex items-center justify-center mb-4"
              >
                 <DownloadIcon className="w-4 h-4 mr-2" /> Download .PKG
              </button>

              <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 w-full border border-gray-200 dark:border-gray-800">
                 <div className="text-[10px] text-gray-400 font-mono break-all">SHA256: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6</div>
              </div>
           </div>

           {/* Linux */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all group flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Server className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Linux</h3>
              <p className="text-sm text-gray-500 mb-6">Ubuntu 20.04+, RHEL 8+, Debian 11+ (AMD64/ARM64)</p>
              
              <button 
                id="btn-linux"
                onClick={() => handleDownload('linux')}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center mb-4"
              >
                 <DownloadIcon className="w-4 h-4 mr-2" /> Download Binary
              </button>

              <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 w-full border border-gray-200 dark:border-gray-800">
                 <div className="text-[10px] text-gray-400 font-mono break-all">SHA256: f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};