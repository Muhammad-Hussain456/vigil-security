import React, { useState } from 'react';
import { Navbar } from './components/landing/Navbar.tsx';
import { Home } from './components/pages/Home.tsx';
import { Login } from './components/pages/Login.tsx';
import { SignUp } from './components/pages/SignUp.tsx';
import { Documentation } from './components/pages/Documentation.tsx';
import { Download } from './components/pages/Download.tsx';
import { PlatformApp } from './components/PlatformApp.tsx';
import { ThemeProvider } from './components/ThemeContext.tsx';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const handleNavigate = (page: string) => {
    if (page === 'dashboard' && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    if (page === 'home' && currentPage === 'dashboard') {
      setIsAuthenticated(false);
      setIsDemoUser(false);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (isDemo: boolean = false) => {
    setIsAuthenticated(true);
    setIsDemoUser(isDemo);
    setCurrentPage('dashboard');
  };

  return (
    <ThemeProvider>
      <div className="font-sans min-h-screen transition-colors duration-300">
        {currentPage === 'dashboard' && isAuthenticated ? (
          <PlatformApp onNavigate={handleNavigate} isDemoUser={isDemoUser} />
        ) : (
          <>
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
            <main>
              {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
              {currentPage === 'login' && <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />}
              {currentPage === 'signup' && <SignUp onLogin={() => handleLoginSuccess(false)} onNavigate={handleNavigate} />}
              {currentPage === 'docs' && <Documentation />}
              {currentPage === 'download' && <Download />}
            </main>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;