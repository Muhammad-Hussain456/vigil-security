import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Mail, Hash, AlertTriangle, User, RefreshCw, Smartphone, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService.ts';

interface LoginProps {
  onLogin: (isDemo?: boolean) => void;
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (identifier === 'demo' && password === 'demo') {
        onLogin(true);
        return;
      }
      const result = await authService.login(identifier, password);
      if (result.user) {
        if (result.requireMFA) {
          setStep('mfa');
        } else {
          onLogin(false);
        }
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isValid = await authService.verifyMFA(mfaCode);
    if (isValid) {
      onLogin(false);
    } else {
      setError('Invalid MFA code. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <div className="hidden lg:block">
           <div className="bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 font-mono text-sm text-gray-600 dark:text-gray-400 shadow-lg">
              <div className="text-gray-500 dark:text-gray-500 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">SYSTEM NOTIFICATIONS</div>
              <div className="space-y-2">
                <p>[INFO] Secure Gateway v1.0.0 Active</p>
                <p>[INFO] Encryption: TLS 1.3 (AES-256-GCM)</p>
                <p className="text-blue-600 dark:text-blue-400">[HINT] Use 'demo' / 'demo' for instant access if you haven't deployed an agent yet.</p>
                <br/>
                <p className="text-yellow-600 dark:text-yellow-500">[WARN] If you are reconnecting an existing agent:</p>
                <p className="pl-4">1. Log in to your dashboard.</p>
                <p className="pl-4">2. Locate the offline device.</p>
                <p className="pl-4">3. Use the 'Re-bind Session' feature with your new token.</p>
              </div>
           </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <div className="relative">
                <Shield className="w-40 h-40 text-gray-900 dark:text-white" />
                <span className="absolute inset-0 flex items-center justify-center text-gray-900 dark:text-white text-7xl font-bold mt-3 font-mono">V</span>
             </div>
          </div>

          <div className="mb-8 relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 'credentials' ? 'Analyst Login' : 'MFA Verification'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'credentials' 
                ? 'Enter your credentials to access the VIGIL Command Center.' 
                : 'Enter the 6-digit code sent to your verified device.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="example964@gmail.com"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
              
              <div className="text-center mt-4">
                <span className="text-gray-500 text-sm">Don't have an account? </span>
                <button 
                  type="button"
                  onClick={() => onNavigate('signup')} 
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm font-semibold hover:underline"
                >
                  Register New Device
                </button>
              </div>
            </form>
          )}

          {step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-6 relative z-10">
               <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-lg flex items-start space-x-3">
                  <Smartphone className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    A verification code has been sent to your registered email ending in <strong>***@gmail.com</strong>.
                  </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">One-Time Password (OTP)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pl-10 text-gray-900 dark:text-white font-mono text-xl tracking-[0.5em] text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Launch'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};