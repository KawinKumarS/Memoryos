import React from 'react';
import { motion } from 'framer-motion';
import { Network, CheckCircle, Server, Zap, Cpu, Search, Sparkles } from 'lucide-react';

export const Pipeline: React.FC = () => {
  const steps = [
    {
      name: "Conversation Analyzer",
      status: "Operational",
      latency: "95ms",
      confidence: "98%",
      task: "Parse raw chat transcript, identify semantic tokens, clean syntax noise.",
      icon: <Cpu size={16} />,
      color: "border-blue-500/30 text-blue-400"
    },
    {
      name: "Memory Decision Agent",
      status: "Idle",
      latency: "70ms",
      confidence: "94%",
      task: "Classify tokens to determine memory operations (Save, Update, Forget, Ignore).",
      icon: <Network size={16} />,
      color: "border-indigo-500/30 text-indigo-400"
    },
    {
      name: "Semantic Retriever",
      status: "Idle",
      latency: "30ms",
      confidence: "99%",
      task: "Query local SQLite vector tables, locate related preferences and rules.",
      icon: <Search size={16} />,
      color: "border-purple-500/30 text-purple-400"
    },
    {
      name: "Reflection Agent",
      status: "Active",
      latency: "50ms",
      confidence: "92%",
      task: "Run local validation algorithms to detect contradictions or context drift.",
      icon: <Sparkles size={16} />,
      color: "border-emerald-500/30 text-emerald-400"
    },
    {
      name: "Response Generator",
      status: "Operational",
      latency: "220ms",
      confidence: "96%",
      task: "Inject retrieved persistent memories into LLM prompt context window and compile response.",
      icon: <Server size={16} />,
      color: "border-pink-500/30 text-pink-400"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Network size={22} className="text-indigo-400" />
          Live Agent Pipeline
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Monitor real-time execution flows of the sub-agent network compiling user statements into the Synaptic Vault.
        </p>
      </div>

      <div className="flex flex-col gap-6 relative max-w-4xl">
        {/* Connection pipe line (vertical) */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-800 pointer-events-none z-0" />

        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-5 rounded-2xl border border-white/5 relative z-10 ml-12 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-all"
          >
            {/* Round icon node floating on connection line */}
            <div className={`absolute -left-[54px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900 border-2 flex items-center justify-center shadow-lg ${step.color}`}>
              {step.icon}
            </div>

            <div className="space-y-1 flex-grow">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-bold text-sm leading-none">{step.name}</h4>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  step.status === 'Active' 
                    ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step.status}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed max-w-xl">
                {step.task}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 shrink-0 md:text-right text-[10px] font-mono text-zinc-500">
              <div>
                <span className="md:block uppercase text-[8px] text-zinc-600">Avg Latency</span>
                <span className="text-zinc-300 font-semibold">{step.latency}</span>
              </div>
              <div>
                <span className="md:block uppercase text-[8px] text-zinc-600">Decision Confidence</span>
                <span className="text-zinc-300 font-semibold">{step.confidence}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
