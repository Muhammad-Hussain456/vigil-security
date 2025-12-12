import React, { useState, useEffect, useRef } from 'react';
import { Shield, Server, ArrowRight, Mail, Phone, Smartphone, AlertTriangle, RefreshCw, Hash, Terminal, User, Lock, CheckCircle, Send, Key } from 'lucide-react';
import { authService } from '../../services/authService.ts';

interface SignUpProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

interface ConsoleLine {
  text: string;
  type?: 'info' | 'warn' | 'error' | 'success' | 'link' | 'system' | 'plain' | 'cmd';
  action?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onLogin, onNavigate }) => {
  // Console State
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([]);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleStep, setConsoleStep] = useState<'boot' | 'privileges' | 'email' | 'done'>('boot');
  const [consoleSessionToken, setConsoleSessionToken] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    emailCode: '',
    sessionToken: ''
  });

  // Verification State
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'verified'>('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ----------------------------------------------------------------------
  // CONSOLE LOGIC (Simulates Device Boot & Email Server)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const bootSequence: ConsoleLine[] = [
      { text: 'C:\\Program Files\\VIGIL\\Agent> vigil-agent.exe', type: 'cmd' },
      { text: '[INFO] Integrity Check: EV SIGNATURE VALID', type: 'system' },
      { text: '---------------------------------------------------', type: 'plain' },
      { text: '[REQUEST] ELEVATED PRIVILEGES REQUIRED', type: 'warn' },
      { text: 'The backend requires permission to access:', type: 'plain' },
      { text: '1. Active User Identity & Allowed/Blocked Action Lists', type: 'plain' },
      { text: '2. Real-time Event Detection (Process, File, Network)', type: 'plain' },
      { text: '3. Alert Transmission to bound Frontend Account', type: 'plain' },
      { text: '---------------------------------------------------', type: 'plain' },
      { text: '[PROMPT] Grant Access? (y/n):', type: 'success' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        setConsoleLogs(prev => [...prev, bootSequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setConsoleStep('privileges');
      }
    }, 150); // Faster boot for better UX
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const handleConsoleInput = (e: React.FormEvent) => {
    e.preventDefault();
    const input = consoleInput.trim(); // Keep case for email
    const inputLower = input.toLowerCase();
    
    setConsoleLogs(prev => [...prev, { text: `> ${consoleInput}`, type: 'plain' }]);
    setConsoleInput('');

    if (consoleStep === 'privileges') {
      if (inputLower === 'y' || inputLower === 'yes') {
         setConsoleLogs(prev => [
            ...prev,
            { text: '[SUCCESS] Access Granted. Monitoring Subsystems Active.', type: 'success' },
            { text: '[PROMPT] Enter Administrator Email for Binding:', type: 'success' } // Purple prompt in prompt desc, usually green/purple
         ]);
         setConsoleStep('email');
      } else {
         setConsoleLogs(prev => [
            ...prev, 
            { text: '[ERROR] Permission Denied. Agent cannot start.', type: 'error' },
            { text: '[PROMPT] Grant Access? (y/n):', type: 'success' }
         ]);
      }
    } else if (consoleStep === 'email') {
       // Proceed regardless of email validity in simulation, usually user types their email
       const token = generateSessionToken();
       setConsoleSessionToken(token);
       setConsoleStep('done');

       setConsoleLogs(prev => [
         ...prev,
         { text: '[INFO] Device Registration Pending...', type: 'system' },
         { text: '---------------------------------------------------', type: 'plain' },
         { text: 'OPTION 1: REACTIVATING A SESSION?', type: 'warn' },
         { text: 'Instruction: Enter the token below into the "Re-bind" field on your Dashboard.', type: 'plain' },
         { text: '[LINK] >> Click here to go to LOGIN PAGE', type: 'link', action: () => onNavigate('login') },
         { text: 'OPTION 2: BINDING TO A NEW ACCOUNT?', type: 'warn' },
         { text: 'Instruction: Enter the token below into the "Device Session Token" field on the Sign Up page.', type: 'plain' },
         { text: `Important: Please manually enter the email you used (${input}) into the form on the right.`, type: 'info' },
         { text: 'Note: If device is already bound, login and remove it first. Monitoring one device by two accounts is not allowed.', type: 'plain' },
         { text: '---------------------------------------------------', type: 'plain' },
         { text: `SESSION TOKEN: ${token}`, type: 'success' },
         { text: 'waiting for handshake...', type: 'plain' }
       ]);
       
       // Removed auto-fill logic as requested
    }
  };

  const generateSessionToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
       if (i === 3) result += '-';
       result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // ----------------------------------------------------------------------
  // FORM LOGIC
  // ----------------------------------------------------------------------

  // Auto-suggest username based on Full Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updates = { fullName: val };
    
    // Only auto-update username if user hasn't heavily modified it
    // or if it's still empty/default
    const currentSlug = formData.username.replace('_ops', '').replace(/[^a-z0-9]/g, '');
    const nameSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Simple heuristic: if the current username looks like it was generated from the name (or is empty), update it
    if (!formData.username || currentSlug === nameSlug.slice(0, currentSlug.length) || formData.username.endsWith('_ops')) {
       // @ts-ignore
       updates.username = val ? `${nameSlug}_ops` : '';
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Trigger Email Verification Code
  const sendEmailCode = () => {
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address first.');
      return;
    }
    
    setError('');
    setEmailStatus('sending');
    
    // Simulate API delay
    setTimeout(() => {
      const code = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
      setGeneratedCode(code);
      setEmailStatus('sent');
      
      // Log to console to simulate email delivery
      setConsoleLogs(prev => [
        ...prev,
        { text: `[EMAIL_GATEWAY] Request received for ${formData.email}`, type: 'system' },
        { text: `[EMAIL_GATEWAY] Sending 8-digit verification code...`, type: 'plain' },
        { text: `[EMAIL_GATEWAY] CODE: ${code}`, type: 'success' }
      ]);
    }, 1500);
  };

  const verifyEmailCode = () => {
    if (formData.emailCode === generatedCode) {
      setEmailStatus('verified');
      setConsoleLogs(prev => [...prev, { text: '[AUTH] Identity verified successfully.', type: 'success' }]);
    } else {
      setError('Incorrect verification code. Check the console output.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (emailStatus !== 'verified') {
      setError('Please verify your email address.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (formData.sessionToken !== consoleSessionToken) {
      setError('Invalid Session Token. Please check the console output on the left.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      await authService.signUp({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: 'N/A' // Removed phone from this flow
      });
      onLogin();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: CONSOLE */}
        <div className="bg-black rounded-xl border border-gray-800 shadow-2xl flex flex-col font-mono text-sm h-[600px] lg:h-[800px] overflow-hidden sticky top-24">
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
             </div>
             <span className="text-gray-500 text-xs">vigil-agent.exe — SYSTEM</span>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar font-mono">
             {consoleLogs.map((l, i) => (
               <div 
                  key={i} 
                  onClick={l?.action}
                  className={`mb-1 break-words ${l?.action ? 'cursor-pointer hover:underline' : ''} ${
                    l?.type === 'error' ? 'text-red-500' : 
                    l?.type === 'success' ? 'text-green-400 font-bold' : 
                    l?.type === 'warn' ? 'text-yellow-400 font-bold' : 
                    l?.type === 'system' ? 'text-blue-400 font-bold' :
                    l?.type === 'link' ? 'text-blue-400 underline' :
                    l?.type === 'info' ? 'text-blue-400 font-bold' :
                    l?.type === 'cmd' ? 'text-gray-400 mb-4' :
                    'text-gray-300'
                  }`}
               >
                 {l?.text}
               </div>
             ))}
             
             {consoleStep !== 'done' && (
               <form onSubmit={handleConsoleInput} className="flex mt-2">
                 <span className="text-green-500 mr-2">➜</span>
                 <input 
                    autoFocus 
                    className="bg-transparent outline-none text-white flex-1 caret-green-500" 
                    value={consoleInput} 
                    onChange={e => setConsoleInput(e.target.value)} 
                    placeholder={consoleStep === 'email' ? 'example964@gmail.com' : '...'}
                 />
               </form>
             )}
             {consoleStep === 'done' && (
               <div className="mt-2 text-gray-500 animate-pulse">_</div>
             )}
             <div ref={consoleEndRef} />
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl relative animate-in fade-in slide-in-from-right-4 duration-500">
             
             <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Initialize your analyst profile and bind this terminal.</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
             </div>

             {error && (
               <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start">
                 <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" /> 
                 <span>{error}</span>
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g. Muhammad Hussain"
                      value={formData.fullName}
                      onChange={handleNameChange}
                    />
                  </div>
                </div>

                {/* 2. Username (Small, Suggestion) */}
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 dark:text-gray-500 font-bold mb-1 ml-1">Analyst Handle (Username)</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 pl-8 text-sm text-gray-700 dark:text-gray-300 font-mono focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="username_ops"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">Unique identifier within the organization.</p>
                </div>

                {/* 3. Passwords */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1.5">Password</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                       <input 
                         required
                         type="password" 
                         className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-9 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1.5">Re-enter</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                       <input 
                         required
                         type="password" 
                         className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-9 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                         value={formData.confirmPassword}
                         onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                       />
                     </div>
                   </div>
                </div>

                {/* 4. Email & Verification */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1.5">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                          required
                          type="email" 
                          disabled={emailStatus === 'verified'}
                          className={`w-full bg-white dark:bg-gray-900 border rounded-lg p-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all ${emailStatus === 'verified' ? 'border-green-500 text-green-600 dark:text-green-400 opacity-75' : 'border-gray-300 dark:border-gray-700'}`}
                          placeholder="Enter the email used in terminal"
                          value={formData.email}
                          onChange={(e) => {
                             setFormData({...formData, email: e.target.value});
                             if (emailStatus !== 'idle') setEmailStatus('idle'); // Reset if email changes
                          }}
                        />
                        {emailStatus === 'verified' && <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />}
                      </div>
                    </div>

                    {/* Verification Field - Appears when email is entered */}
                    {formData.email && formData.email.includes('@') && emailStatus !== 'verified' && (
                       <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs uppercase text-primary-600 dark:text-primary-400 font-bold mb-1.5">Verification Code</label>
                          <div className="flex gap-2">
                             {emailStatus === 'idle' || emailStatus === 'sending' ? (
                                <button
                                  type="button"
                                  onClick={sendEmailCode}
                                  disabled={emailStatus === 'sending'}
                                  className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
                                >
                                  {emailStatus === 'sending' ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                  {emailStatus === 'sending' ? 'Sending Code...' : 'Send 8-Digit Code'}
                                </button>
                             ) : (
                                <>
                                  <input 
                                    type="text" 
                                    maxLength={8}
                                    placeholder="XXXXXXXX"
                                    className="flex-1 bg-white dark:bg-gray-900 border border-primary-300 dark:border-primary-700 rounded-lg p-2.5 text-center font-mono tracking-widest uppercase focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.emailCode}
                                    onChange={(e) => setFormData({...formData, emailCode: e.target.value})}
                                  />
                                  <button
                                    type="button"
                                    onClick={verifyEmailCode}
                                    className="px-6 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-colors text-sm"
                                  >
                                    Verify
                                  </button>
                                </>
                             )}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2">
                            {emailStatus === 'sent' ? 'Check the console on the left for the simulation code.' : 'We will send an 8-digit verification code to the email above.'}
                          </p>
                       </div>
                    )}
                </div>

                {/* 5. Session Token */}
                <div>
                   <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1.5">Device Session Token</label>
                   <div className="relative">
                      <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        className="w-full bg-black text-green-400 border border-gray-600 rounded-lg p-3 pl-10 font-mono tracking-widest uppercase focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="XXXXXX-XXXXXX"
                        value={formData.sessionToken}
                        onChange={(e) => setFormData({...formData, sessionToken: e.target.value})}
                      />
                      <div className="absolute right-2 top-2">
                        {consoleSessionToken && (
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, sessionToken: consoleSessionToken})}
                             className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded hover:bg-gray-700 border border-gray-600"
                           >
                             AUTOFILL
                           </button>
                        )}
                      </div>
                   </div>
                   <p className="text-[10px] text-gray-500 mt-1">
                     Enter the token generated in the terminal on the left (Initialize Binding).
                   </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || emailStatus !== 'verified'}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Complete Registration'} <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <div className="text-center pt-2">
                   <button 
                     type="button"
                     onClick={() => onNavigate('login')}
                     className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                   >
                     Already have an account? <span className="underline">Log In</span>
                   </button>
                </div>

             </form>
          </div>
        </div>
      </div>
    </div>
  );
};