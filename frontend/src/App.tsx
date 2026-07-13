import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [page, setPage] = useState<string>('landing');
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  // Check if session token exists in cache on reload
  useEffect(() => {
    const cachedToken = localStorage.getItem('memoryos_auth_token');
    const cachedUser = localStorage.getItem('memoryos_auth_user');
    if (cachedToken && cachedUser) {
      setToken(cachedToken);
      setUsername(cachedUser);
      setPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userToken: string, user: string) => {
    localStorage.setItem('memoryos_auth_token', userToken);
    localStorage.setItem('memoryos_auth_user', user);
    setToken(userToken);
    setUsername(user);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('memoryos_auth_token');
    localStorage.removeItem('memoryos_auth_user');
    sessionStorage.removeItem('memoryos_session_id');
    setToken('');
    setUsername('');
    setPage('landing');
  };

  return (
    <div className="relative min-h-screen bg-[#070709] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onEnter={() => setPage('login')} />
          </motion.div>
        )}

        {page === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Login 
              onBack={() => setPage('landing')} 
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {page === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard 
              token={token} 
              username={username} 
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
