import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, RefreshCw, HelpCircle, Layers } from 'lucide-react';

interface DissonanceLog {
  id: number;
  synapse_1: { id: number; content: string };
  synapse_2: { id: number; content: string };
  description: string;
  status: string;
  method: string;
  timestamp: string;
}

interface DissonanceProps {
  token: string;
}

export const Dissonance: React.FC<DissonanceProps> = ({ token }) => {
  const [logs, setLogs] = useState<DissonanceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const API_URL = 'http://localhost:8000/api';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/synapses/dissonance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert size={22} className="text-red-400 animate-pulse" />
          Cognitive Dissonance Engine
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Monitor logical contradictions detected between incoming user instructions and historical synaptic memory nodes.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-500 text-xs font-mono">
          <RefreshCw size={14} className="animate-spin mr-2" /> Indexing cognitive clash logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/5 p-8 text-center text-zinc-500 bg-black/10 text-xs space-y-2">
          <CheckCircle className="text-emerald-400 mx-auto" size={24} />
          <p className="font-semibold text-zinc-300">System aligned. No Cognitive Dissonance detected.</p>
          <p className="text-zinc-500 font-light max-w-sm mx-auto">
            If you feed contradicting facts to the AI during chat (e.g. "I love React" then later "I hate React"), the clash will log here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div 
              key={log.id} 
              className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Status flag banner */}
              <div className="absolute top-0 right-0">
                <span className={`text-[8px] font-bold tracking-widest uppercase px-3 py-1 block ${
                  log.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {log.status}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Clash Description</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono bg-black/30 p-2.5 rounded border border-white/2">
                    {log.description}
                  </p>
                </div>

                {/* Node clashing diagram preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <div className="p-3 bg-red-950/10 border border-red-500/15 rounded-xl text-xs space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold block">Historical Preference</span>
                    <p className="text-zinc-300 italic">"{log.synapse_1.content}"</p>
                    <span className="text-[9px] text-zinc-500 font-mono block">Node ID: #{log.synapse_1.id}</span>
                  </div>
                  <div className="p-3 bg-indigo-950/10 border border-indigo-500/15 rounded-xl text-xs space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block">Incoming Override</span>
                    <p className="text-zinc-300 italic">"{log.synapse_2.content}"</p>
                    <span className="text-[9px] text-zinc-500 font-mono block">Node ID: #{log.synapse_2.id}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <h5 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Auto-Resolution Strategy</h5>
                  <p className="text-xs text-emerald-400 mt-1 leading-relaxed flex items-center gap-1.5 font-medium">
                    <CheckCircle size={12} />
                    {log.method || 'Archived older synapse node and registered new override.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
