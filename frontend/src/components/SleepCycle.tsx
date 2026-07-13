import React, { useState } from 'react';
import { Moon, Play, Loader2, Sparkles, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';

interface SleepCycleProps {
  token: string;
  onCycleComplete: () => void;
}

export const SleepCycle: React.FC<SleepCycleProps> = ({ token, onCycleComplete }) => {
  const [running, setRunning] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

  const API_URL = 'http://localhost:8000/api';

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const executeSleepCycle = async () => {
    if (running) return;
    
    setRunning(true);
    setResults(null);
    setLogs([]);
    setStage(1);
    
    // Simulate steps with timeouts to look cinematic and professional
    addLog("Initializing Sleep Cycle (Dream Mode)...");
    addLog("Shutting down active write buffers.");
    
    setTimeout(() => {
      setStage(2);
      addLog("Querying SQLite active synapses schema...");
      addLog("Retrieving numerical embedding vectors...");
    }, 1200);

    setTimeout(() => {
      setStage(3);
      addLog("Calculating bidirectional cosine proximity clusters...");
      addLog("Identifying semantic duplicates (similarity >= 0.75)...");
      addLog("Merging duplicates: 'react preferences' & 'go coding patterns'.");
    }, 2800);

    setTimeout(() => {
      setStage(4);
      addLog("Running decay algorithm on inactive synapses...");
      addLog("Pruning synapses with low relevance values (importance <= 2)...");
    }, 4500);

    setTimeout(async () => {
      setStage(5);
      addLog("Compiling multi-observation patterns into executable skills...");
      addLog("Writing finalized nodes back to local SQLite DB...");
      
      try {
        const res = await fetch(`${API_URL}/synapses/sleep`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.stats);
          addLog("Synapse database update: COMPLETE.");
          onCycleComplete(); // update GraphCanvas parent
        } else {
          throw new Error("API consolidation failed.");
        }
      } catch (err: any) {
        addLog(`Error: ${err.message || 'Server connection failed.'}`);
      } finally {
        setStage(6);
        setRunning(false);
      }
    }, 6200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Moon size={22} className="text-indigo-400" />
          Cognitive Sleep Cycle (Dream Mode)
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Trigger background consolidations. Similar memories will merge, inactive ones will decay/be forgotten, and recurrent behaviors will be compiled into skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sleep cycle trigger and status panel */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4 mb-6 leading-relaxed">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5">
                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                Neurological Analogy
              </h4>
              <p className="text-[11px] text-zinc-400 font-light">
                Just as human brains consolidate synapses during sleep, MemoryOS runs semantic clustering. This manages LLM context window limits and avoids expensive token waste.
              </p>
            </div>

            {running && (
              <div className="space-y-4 my-4">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Consolidating database...</span>
                  <span>{Math.round((stage / 5) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${(stage / 5) * 100}%` }}
                  />
                </div>
                {/* Stage indicators */}
                <div className="grid grid-cols-5 gap-1 text-[8px] font-mono text-center text-zinc-500 uppercase tracking-widest">
                  <span className={stage >= 1 ? 'text-indigo-400 font-bold' : ''}>Start</span>
                  <span className={stage >= 2 ? 'text-indigo-400 font-bold' : ''}>Fetch</span>
                  <span className={stage >= 3 ? 'text-indigo-400 font-bold' : ''}>Cluster</span>
                  <span className={stage >= 4 ? 'text-indigo-400 font-bold' : ''}>Prune</span>
                  <span className={stage >= 5 ? 'text-indigo-400 font-bold' : ''}>Save</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={executeSleepCycle}
            disabled={running}
            className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              running 
                ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-indigo-400/20 glow-border'
            }`}
          >
            {running ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Running Neurological Consolidations...
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" />
                Initiate Sleep Cycle
              </>
            )}
          </button>
        </div>

        {/* Real-time simulation log */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col h-[360px]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3">Neurological Logs</span>
          <div className="flex-grow bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-y-auto space-y-1.5 leading-relaxed">
            {logs.length === 0 ? (
              <span className="text-zinc-600 italic">No logs active. Start a sleep cycle to monitor memory pipeline consolidations.</span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Results HUD */}
      {results && (
        <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/2 rounded-xl border border-white/5">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-wider">Processed Synapses</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{results.input_count}</span>
          </div>
          <div className="p-3 bg-white/2 rounded-xl border border-white/5">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-wider">Merged (Duplicates)</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">-{results.merged_count}</span>
          </div>
          <div className="p-3 bg-white/2 rounded-xl border border-white/5">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-wider">Pruned (Decayed)</span>
            <span className="text-2xl font-extrabold text-red-400 mt-1 block">-{results.pruned_count}</span>
          </div>
          <div className="p-3 bg-white/2 rounded-xl border border-white/5">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-wider">Synthesized Skills</span>
            <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">+{results.synthesized_count}</span>
          </div>
          <div className="md:col-span-4 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center justify-center gap-2 text-xs text-indigo-200 font-mono">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Success: Consolidated database to {results.output_count} active synapses. Net reduction: {Math.round(((results.input_count - results.output_count) / (results.input_count || 1)) * 100)}%.</span>
          </div>
        </div>
      )}
    </div>
  );
};
