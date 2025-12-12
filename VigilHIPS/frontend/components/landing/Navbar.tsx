import React from 'react';
import { Shield, Github, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext.tsx';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  const links = [
    { id: 'home', label: 'Overview' },
    { id: 'docs', label: 'Documentation' },
    { id: 'download', label: 'Download Agent' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20 mr-3 relative">
              <Shield className="w-5 h-5 text-white" />
              <span className="absolute text-white font-bold text-[10px] mt-0.5 font-mono">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">VIGIL<span className="text-primary-500">Security</span></span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.id
                      ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => onNavigate('login')}
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Log In
              </button>
              
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 rounded-md text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20 transition-all hover:scale-105"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setIsOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { onNavigate('login'); setIsOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Log In
            </button>
            <button
               onClick={() => { onNavigate('signup'); setIsOpen(false); }}
               className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};