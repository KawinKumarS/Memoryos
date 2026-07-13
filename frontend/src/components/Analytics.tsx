import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { BarChart3, TrendingUp, Cpu, PieChart as PieIcon, RefreshCw, Zap } from 'lucide-react';

interface AnalyticsProps {
  token: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ token }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_URL}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          throw new Error("Could not retrieve analytics data.");
        }
      } catch (err: any) {
        setError(err.message || 'Server connection failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  const COLORS = ['#3b82f6', '#6366f1', '#ef4444', '#f59e0b', '#10b981'];

  // Latency chart formatter
  const latencyData = stats ? Object.entries(stats.system_latencies).map(([key, val]) => ({
    name: key.replace('_', ' '),
    ms: val
  })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 size={22} className="text-indigo-400" />
          Analytics Dashboard
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
          Monitor vector storage metrics, compression coefficients, semantic recall latency, and database growth.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-500 text-xs font-mono">
          <RefreshCw size={14} className="animate-spin mr-2" /> Indexing analytics metrics...
        </div>
      ) : stats ? (
        <>
          {/* Diagnostic overview metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Active Synapses</span>
              <span className="text-2xl font-extrabold text-white block">{stats.summary.total_active}</span>
              <span className="text-[9px] text-zinc-400 flex items-center gap-1"><TrendingUp size={10} className="text-emerald-400" /> +{stats.summary.growth_rate_pct}% Growth</span>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Context Budget Saved</span>
              <span className="text-2xl font-extrabold text-white block">{stats.context_efficiency.tokens_saved.toLocaleString()}</span>
              <span className="text-[9px] text-zinc-400 flex items-center gap-1"><Zap size={10} className="text-indigo-400" /> {stats.context_efficiency.savings_kb} KB compressed</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Forgetting Coefficient</span>
              <span className="text-2xl font-extrabold text-white block">
                {Math.round((stats.summary.total_forgotten / (stats.summary.total_active + stats.summary.total_forgotten || 1)) * 100)}%
              </span>
              <span className="text-[9px] text-zinc-500 block font-mono">{stats.summary.total_forgotten} pruned nodes</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Dissonances Resolved</span>
              <span className="text-2xl font-extrabold text-white block">{stats.summary.dissonance_resolved}</span>
              <span className="text-[9px] text-zinc-400 block font-mono">{stats.summary.dissonance_pending} conflicts pending</span>
            </div>
          </div>

          {/* Charts container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Growth curve */}
            <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/5 p-6 h-[340px] flex flex-col justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={13} className="text-indigo-400" /> Synaptic Growth Curve</span>
              <div className="flex-grow w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.growth_timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSyn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#070709', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="synapses" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSyn)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category distribution */}
            <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/5 p-6 h-[340px] flex flex-col justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5"><PieIcon size={13} className="text-indigo-400" /> Category Distribution</span>
              <div className="flex-grow w-full h-[180px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.category_distribution}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.category_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#070709', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-zinc-400 border-t border-white/5 pt-3">
                {stats.category_distribution.map((cat: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate">{cat.name}: {cat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Latency statistics */}
            <div className="lg:col-span-12 glass-panel rounded-2xl border border-white/5 p-6 h-[300px] flex flex-col justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5"><Cpu size={13} className="text-indigo-400" /> Pipeline Latency breakdown (ms)</span>
              <div className="flex-grow w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#070709', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="ms" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {latencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-zinc-500 text-xs">
          No analytics indicators could be loaded.
        </div>
      )}
    </div>
  );
};
