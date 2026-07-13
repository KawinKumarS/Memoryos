import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, User, Eye, EyeOff, Loader2, ArrowLeft, Brain } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (token: string, username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_URL = 'http://localhost:8000/api';

  const handleDemoAccess = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', 'demo');
      formData.append('password', 'password123');

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) throw new Error('Demo login failed. Make sure backend is running.');
      const data = await res.json();
      onLoginSuccess(data.access_token, data.username);
    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register API call
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed.');
        
        onLoginSuccess(data.access_token, data.username);
      } else {
        // Login API call (using URLSearchParams for OAuth2PasswordRequestForm standard form-data)
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Invalid username or password.');
        
        onLoginSuccess(data.access_token, data.username);
      }
    } catch (err: any) {
      setError(err.message || 'Connection to API core failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid-bg flex items-center justify-center p-6 text-zinc-300">
      {/* Background radial glows */}
      <div className="radial-glows">
        <div className="radial-glow-1" />
        <div className="radial-glow-2" />
      </div>

      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Back to Hub
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/30">
            <Brain size={20} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Register Synaptic Node' : 'Initialize Session'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-[280px]">
            Connect to the MemoryOS subconscious interface registry.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/25 text-red-400 text-xs text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. agent_dev" 
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-black/40 border border-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Password</label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-9 pr-10 py-2 text-xs rounded-lg bg-black/40 border border-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 border border-indigo-400/20"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Validating Node...
              </>
            ) : (
              isRegister ? 'Register & Initialize' : 'Establish Connection'
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#070709] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">OR</span>
        </div>

        <button
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-white/5 text-zinc-200 text-xs font-semibold transition-all hover:border-zinc-700 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} className="text-indigo-400" />}
          Access Seeded Sandbox (Demo)
        </button>

        <div className="mt-6 text-center text-xs">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            {isRegister ? 'Already registered? Establish session' : 'Create new credential registration'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
