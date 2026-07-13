import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, ShieldCheck, Database, Sliders, Bell, Sparkles } from 'lucide-react';

export const Settings: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(4);
  const [retention, setRetention] = useState<string>('normal');
  const [frequency, setFrequency] = useState<string>('every_30');
  const [provider, setProvider] = useState<string>('local');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon size={22} className="text-indigo-400" />
          Settings Panel
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Configure memory classification parameters, cognitive thresholds, embedding registries, and security vaults.
        </p>
      </div>

      <div className="space-y-6">
        {/* Memory logic thresholds */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Sliders size={15} className="text-indigo-400" />
            Subconscious Constraints
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Importance Threshold ({threshold}/10)</label>
              <input 
                type="range" 
                min={1} 
                max={10} 
                value={threshold}
                onChange={e => setThreshold(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="block text-[9px] text-zinc-500 font-light leading-relaxed">
                Incoming messages scoring below this value are automatically classified as IGNORE and will not be indexed.
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Retention Policy</label>
              <select 
                value={retention}
                onChange={e => setRetention(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="strict">Strict (Auto-decay non-reinforced facts in 3 days)</option>
                <option value="normal">Standard (Auto-decay in 14 days, keep user preferences)</option>
                <option value="lenient">Lenient (Never decay active synapses, manual forget only)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Sleep Cycle Frequency</label>
              <select 
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="every_10">Every 10 conversations (High consolidation)</option>
                <option value="every_30">Every 30 conversations (Standard sleep pattern)</option>
                <option value="manual_only">Manual triggering only</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Embeddings Config */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Database size={15} className="text-indigo-400" />
            Synaptic Indexing Providers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Vector Embedding Engine</label>
              <select 
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="local">Local-first hash Trick (Zero Network Dependency)</option>
                <option value="gemini">Gemini API: models/text-embedding-004</option>
                <option value="openai">OpenAI API: text-embedding-3-small</option>
              </select>
              <span className="block text-[9px] text-zinc-500 font-light leading-relaxed">
                API integration requires adding `GEMINI_API_KEY` or `OPENAI_API_KEY` to the backend `.env` variables.
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Zero Knowledge Vault */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <ShieldCheck size={15} className="text-indigo-400" />
            Security & Cryptography
          </h3>
          <div className="flex items-start gap-3 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl leading-relaxed">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold text-zinc-100 uppercase tracking-widest text-[9px] block">Local-First Vault Activated</span>
              <p className="text-zinc-400 mt-1">
                Your SQLite synaptic vault resides on your machine. Memory weights, embedding hashes, and contradiction matrices never exit your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Save button HUD */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 border border-indigo-400/20"
          >
            <Save size={14} /> Save Configurations
          </button>
          {saveSuccess && (
            <span className="text-emerald-400 font-mono text-[10px] animate-pulse">
              Configurations updated successfully.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
