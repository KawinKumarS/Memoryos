import React from 'react';
import { motion } from 'framer-motion';
import { Award, Briefcase, Calendar, CheckCircle2, ChevronRight, Cpu, GraduationCap, Users } from 'lucide-react';

interface TimelineEvent {
  title: string;
  desc: string;
  date: string;
  icon: React.ReactNode;
  status: string;
}

export const Timeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      title: "Syntax Scaffolding",
      desc: "Registered foundational preferences: React functional code patterns, dark mode layout preferences, and TypeScript compiler overrides.",
      date: "Jul 11, 2026",
      icon: <GraduationCap size={16} />,
      status: "Consolidated"
    },
    {
      title: "Team Calibration",
      desc: "Associated Stripe Ventures partner relations. Logged lead designer details. Established vector edges linking Stripe context to coding configurations.",
      date: "Jul 12, 2026",
      icon: <Users size={16} />,
      status: "Consolidated"
    },
    {
      title: "Cognitive Dissonance Resolved",
      desc: "Detected logical clash: archived obsolete database configurations in favor of indexed SQLite structures. Consolidated system schemas.",
      date: "Jul 13, 2026",
      icon: <Cpu size={16} />,
      status: "Resolved"
    },
    {
      title: "Skill Synthesis Run",
      desc: "Sleep Cycle compiled repetitive formatting commands into a single executable micro-skill: automatically injecting glassmorphism tokens in styling outputs.",
      date: "Jul 13, 2026",
      icon: <Award size={16} />,
      status: "Synthesized"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar size={22} className="text-indigo-400" />
          Memory Timeline
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Chronological visualization illustrating how the agent's long-term understanding and workspace model evolves.
        </p>
      </div>

      <div className="relative max-w-3xl pl-8 space-y-8">
        {/* Timeline bar (vertical) */}
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-zinc-800 pointer-events-none" />

        {events.map((evt, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12 }}
            className="relative"
          >
            {/* Timeline point indicator */}
            <div className="absolute -left-[37px] top-1.5 w-5 h-5 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center shadow-md">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                    {evt.icon}
                  </div>
                  <h4 className="text-white font-bold text-sm leading-none">{evt.title}</h4>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                  <Calendar size={10} /> {evt.date}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                {evt.desc}
              </p>

              <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={11} /> {evt.status}
                </span>
                <span className="flex items-center hover:text-white transition-colors cursor-pointer">
                  Inspect Synapse Diff <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
