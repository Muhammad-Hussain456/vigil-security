import React, { useState } from 'react';
import { Shield, Activity, FileText, Search, Settings, Menu, Bell, X, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const NavItem = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-all rounded-lg ${
      active 
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-4 border-primary-500 rounded-r-none' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
    }`}
  >
    <Icon className={`w-5 h-5 mr-3 transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 relative">
              <Shield className="w-6 h-6 text-white" />
              <span className="absolute text-white font-bold text-xs mt-0.5 font-mono">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">VIGIL</span>
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase">Security</span>
            </div>
          </div>
          <button onClick={toggleMobileMenu} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-1">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4 px-4 mt-2">Operations Center</div>
          <NavItem icon={Activity} label="Live Dashboard" id="dashboard" active={activeTab === 'dashboard'} onClick={handleNavClick} />
          <NavItem icon={Search} label="Forensics & AI" id="forensics" active={activeTab === 'forensics'} onClick={handleNavClick} />
          <NavItem icon={FileText} label="Policy Manager" id="policies" active={activeTab === 'policies'} onClick={handleNavClick} />
          
          <div className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mt-8 mb-4 px-4">System Admin</div>
          <NavItem icon={Settings} label="Configuration" id="settings" active={activeTab === 'settings'} onClick={handleNavClick} />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md">MH</div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">Muhammad Hussain</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Senior SOC Analyst</div>
            </div>
          </div>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 w-full relative h-full">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20 sticky top-0 transition-colors duration-300 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="mr-4 lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex items-center">
              {activeTab === 'dashboard' && 'Security Operations Center'}
              {activeTab === 'forensics' && 'AI Forensics Workbench'}
              {activeTab === 'policies' && 'Policy Orchestration'}
              {activeTab === 'settings' && 'Platform Settings'}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 relative custom-scrollbar bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};