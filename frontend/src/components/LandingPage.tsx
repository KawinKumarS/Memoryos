import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Shield, Zap, Sparkles, RefreshCw, Eye, Database, Code, Check } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const pipelineStages = [
    { name: "Parser", desc: "Extracts factual assertions and preferences from user text.", icon: <Code size={16} /> },
    { name: "Synapse Router", desc: "Queries embeddings to locate semantic duplicates or conflicts.", icon: <Brain size={16} /> },
    { name: "Pruning Engine", desc: "Fades weak connections and consolidates similar entries.", icon: <RefreshCw size={16} /> },
    { name: "Cognitive Shield", desc: "Blocks contradictory context leaks in real-time.", icon: <Shield size={16} /> }
  ];

  const pricingTiers = [
    {
      name: "Developer",
      price: "$0",
      desc: "Perfect for local agent scaffolding and playground testing.",
      features: ["Up to 100 active synapses", "Local-first vector storage", "Basic Semantic retrieval", "Manual sleep cycle runs"],
      cta: "Launch Sandbox"
    },
    {
      name: "SaaS Pro",
      price: "$49",
      desc: "For production agent clusters needing persistent cross-session memory.",
      features: ["Unlimited active synapses", "Distributed vector cluster", "Automated Background Sleep Cycles", "Cognitive Dissonance resolution", "API Access (Node/Python)"],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For high-scale orchestrations requiring on-prem and custom guardrails.",
      features: ["Dedicated ChromaDB clusters", "Zero-Knowledge Encryption options", "Custom Embedding training", "24/7 Agent SLA guarantees", "Multi-tenant sync registry"],
      cta: "Contact Ventures"
    }
  ];

  const faqs = [
    { q: "How is MemoryOS different from LangChain memory?", a: "LangChain memory typically stores raw conversation logs, which quickly bloat context windows and waste LLM budget. MemoryOS runs a 'subconscious engine' (inspired by human neurology) that synthesizes, deduplicates, and resolves conflicts in real-time, compressing text up to 88% while preserving core preferences." },
    { q: "Can I use my own Gemini or OpenAI API keys?", a: "Yes. MemoryOS supports simple zero-dependency local vector mapping out-of-the-box, but you can plug in your own API keys in the settings dashboard for advanced semantic indexing and live LLM integration." },
    { q: "What is the 'Sleep Cycle' or 'Dream Mode'?", a: "Just like humans sleep to organize memory, MemoryOS runs background consolidation passes. It identifies semantic overlaps (e.g. 'loves coding in Python' and 'prefers Python syntax'), merges them, prunes unused low-importance memories, and compiles repeating instructions into active executable skills." },
    { q: "Is MemoryOS secure for enterprise data?", a: "Absolutely. MemoryOS is designed local-first. Synaptic indexes reside in SQLite files, and all embedding operations can run on-premise without sending raw customer chat data to third-party endpoints." }
  ];

  return (
    <div className="relative min-h-screen grid-bg overflow-x-hidden text-zinc-300">
      {/* Background Radial Glowing Halos */}
      <div className="radial-glows">
        <div className="radial-glow-1" />
        <div className="radial-glow-2" />
      </div>

      {/* Top Banner Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Brain size={18} className="animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase font-sans">Memory<span className="text-indigo-400">OS</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="hover:text-white transition-colors">Protocol</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <button 
            onClick={onEnter} 
            className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-all font-semibold shadow-md flex items-center gap-1.5"
          >
            Launch System <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 shadow-indigo-500/10 shadow-sm"
        >
          <Sparkles size={12} /> Persist Agent Context Intelligently
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl"
        >
          AI that remembers <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            what actually matters.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed"
        >
          MemoryOS is the synaptic subconscious protocol for multi-agent systems. It triages conversations, resolves logical conflicts, and performs sleep-cycle memory consolidation to stop context bloat.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 flex gap-4 flex-col sm:flex-row"
        >
          <button 
            onClick={onEnter} 
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all text-base glow-border"
          >
            Access Dashboard <ArrowRight size={16} />
          </button>
          <a
            href="#architecture"
            className="px-6 py-3 rounded-lg bg-zinc-900 border border-white/5 text-zinc-300 hover:bg-zinc-800 transition-all font-medium text-base"
          >
            Explore Architecture
          </a>
        </motion.div>
      </section>

      {/* Interactive Memory Triage Visualization */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-10" id="visualization">
        <div className="w-full rounded-2xl glass-panel border border-white/10 p-6 md:p-8 relative shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
            Live Stream Simulation
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="text-indigo-400" size={20} />
                Cognitive Subconscious
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                As your agent conducts queries, our parser categorizes assertions. In the preview block, watch how MemoryOS automatically logs context and prunes trivialities.
              </p>
              
              <div className="space-y-2 bg-black/40 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between text-xs text-zinc-500 border-b border-white/5 pb-1.5 font-mono">
                  <span>METRIC</span>
                  <span>EFFICIENCY</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Context Compressed</span>
                  <span className="text-emerald-400 font-semibold font-mono">88.5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Semantic Recall Latency</span>
                  <span className="text-indigo-400 font-semibold font-mono">35ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Dissonance Index</span>
                  <span className="text-red-400 font-semibold font-mono">0.02</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7 space-y-3 font-mono">
              {/* User input card */}
              <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-3 text-[11px] leading-relaxed">
                <span className="text-indigo-400 font-bold block mb-1">USER MESSAGE</span>
                "I prefer using functional React components, and never use class-based structures. Also, let's host this on Vercel."
              </div>
              {/* Processing connector */}
              <div className="flex justify-center my-1 text-indigo-500 animate-pulse">
                <RefreshCw size={14} className="animate-spin duration-3000" />
              </div>
              {/* Action output card */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 text-[11px] leading-relaxed">
                <span className="text-indigo-400 font-bold block mb-1">MEMORY DECISION LOG</span>
                <div className="space-y-1">
                  <div><span className="text-emerald-400">SAVE</span> preference: "React functional component preference" (Importance: 8)</div>
                  <div><span className="text-emerald-400">SAVE</span> preference: "Host on Vercel" (Importance: 6)</div>
                  <div><span className="text-yellow-400">CREATE_EDGE</span>: "React" &lt;-&gt; "Vercel" (Distance: 0.48)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Pipeline */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28 text-center" id="architecture">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Modular Synaptic Pipeline
        </h2>
        <p className="mt-3 text-zinc-400 max-w-2xl mx-auto text-sm font-light">
          MemoryOS routes inputs through four key layers before presenting contexts back to the agent engine.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 text-left">
          {pipelineStages.map((stage, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
                  {stage.icon}
                </div>
                <h4 className="text-white font-bold text-base">{stage.name}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{stage.desc}</p>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono font-bold mt-4">STAGE 0{idx + 1}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center" id="pricing">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Flexible Pricing for Any Integration Scale
        </h2>
        <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm font-light">
          Scale from single-node local scripts up to high-concurrency vector registries seamlessly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto text-left">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-[450px] ${
                tier.popular ? 'border-indigo-500/50 shadow-indigo-500/5 ring-1 ring-indigo-500/30' : 'border-white/5'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold tracking-widest uppercase">
                  POPULAR
                </div>
              )}
              <div>
                <h4 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">{tier.name}</h4>
                <div className="flex items-baseline mt-4 mb-2">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-zinc-500 text-xs ml-1">/ month</span>}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed min-h-[35px]">{tier.desc}</p>
                <div className="border-b border-white/5 my-4" />
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={12} className="text-indigo-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={onEnter}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                  tier.popular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md' 
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-200'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20" id="faq">
        <h2 className="text-3xl font-extrabold text-white tracking-tight text-center mb-12">
          Frequently Answered Enquiries
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center text-sm font-semibold text-white hover:bg-white/2 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-indigo-400 font-bold font-mono text-lg">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            M
          </div>
          <span className="font-semibold text-zinc-300">MemoryOS Protocol</span>
        </div>
        <div>
          &copy; 2026 MemoryOS Inc. Built for agentic persistence architectures.
        </div>
      </footer>
    </div>
  );
};
