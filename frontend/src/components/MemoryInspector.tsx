import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Shield, Sparkles, Filter, Trash2, CheckCircle2 } from 'lucide-react';

interface Synapse {
  id: number;
  content: string;
  memory_type: string;
  importance: number;
  confidence: number;
  reason_for_keeping: string;
  source: string;
  connections: number[];
  created_at: string;
  updated_at: string;
}

interface MemoryInspectorProps {
  token: string;
  refreshTrigger: number;
  onRefreshGraph: () => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({ token, refreshTrigger, onRefreshGraph }) => {
  const [synapses, setSynapses] = useState<Synapse[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Add Manual Memory modal fields
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>('');
  const [newType, setNewType] = useState<string>('fact');
  const [newImportance, setNewImportance] = useState<number>(5);

  const API_URL = 'http://localhost:8000/api';

  const fetchSynapses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/synapses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve synapses from SQLite.');
      const data = await res.json();
      setSynapses(data);
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSynapses();
  }, [token, refreshTrigger]);

  const handleForget = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/synapses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSynapses(prev => prev.filter(s => s.id !== id));
        onRefreshGraph();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSynapse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch(`${API_URL}/synapses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newContent,
          memory_type: newType,
          importance: newImportance,
          confidence: 1.0
        })
      });

      if (res.ok) {
        setNewContent('');
        setShowAddForm(false);
        fetchSynapses();
        onRefreshGraph();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter lists
  const filteredSynapses = synapses.filter(s => {
    const matchesSearch = s.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || s.memory_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Utilities */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Memory Inspector</h2>
          <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
            Manage agent long-term synapses, inspect metadata, and adjust cognitive nodes manually.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/15 border border-indigo-400/20"
        >
          <Plus size={14} /> Manually Seed Synapse
        </button>
      </div>

      {/* Filter and search utilities */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search synapses..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="md:col-span-4 relative flex items-center bg-black/40 border border-white/5 rounded-xl px-3 gap-2">
          <Filter size={12} className="text-zinc-500 shrink-0" />
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-zinc-300 focus:outline-none capitalize py-1.5"
          >
            <option value="all" className="bg-[#070709] text-zinc-300">All Categories</option>
            <option value="fact" className="bg-[#070709] text-zinc-300">Facts</option>
            <option value="preference" className="bg-[#070709] text-zinc-300">Preferences</option>
            <option value="rule" className="bg-[#070709] text-zinc-300">Rules</option>
            <option value="relation" className="bg-[#070709] text-zinc-300">Relations</option>
            <option value="skill" className="bg-[#070709] text-zinc-300">Executable Skills</option>
          </select>
        </div>
      </div>

      {/* Manual seeding modal form */}
      {showAddForm && (
        <div className="glass-panel border border-white/10 rounded-2xl p-6 relative animate-in fade-in duration-200">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setShowAddForm(false)} 
              className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
          <h3 className="text-sm font-bold text-white mb-4">Manual Synaptic Registration</h3>
          <form onSubmit={handleAddSynapse} className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Memory Context Content</label>
              <textarea 
                rows={3}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="e.g. Always format database models with snake_case and check indices." 
                className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/10 leading-relaxed"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Category Type</label>
                <select 
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/10 transition-all capitalize"
                >
                  <option value="fact" className="bg-[#070709]">Fact</option>
                  <option value="preference" className="bg-[#070709]">Preference</option>
                  <option value="rule" className="bg-[#070709]">Rule / Constraint</option>
                  <option value="relation" className="bg-[#070709]">Relation</option>
                  <option value="skill" className="bg-[#070709]">Executable Skill</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Importance Weight ({newImportance}/10)</label>
                <input 
                  type="range" 
                  min={1} 
                  max={10} 
                  value={newImportance}
                  onChange={e => setNewImportance(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10"
            >
              Seed into SQLite
            </button>
          </form>
        </div>
      )}

      {/* Grid of memory cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-500 text-xs font-mono">
          <RefreshCw size={14} className="animate-spin mr-2" /> Retrieving active synapses...
        </div>
      ) : filteredSynapses.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 border border-white/5 rounded-2xl bg-black/10 text-xs">
          No active synapses found matching search configurations.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSynapses.map(syn => (
            <div 
              key={syn.id}
              className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all relative overflow-hidden"
            >
              {/* Corner decorative light gradients depending on type */}
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-[0.03]"
                style={{
                  backgroundColor: 
                    syn.memory_type === 'preference' ? '#6366f1' :
                    syn.memory_type === 'rule' ? '#ef4444' :
                    syn.memory_type === 'skill' ? '#10b981' : '#3b82f6'
                }}
              />
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-white/5 text-zinc-400 capitalize">
                    {syn.memory_type}
                  </span>
                  <button 
                    onClick={() => handleForget(syn.id)}
                    className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
                    title="Prune / Forget Memory"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <h4 className="text-white text-sm font-semibold leading-relaxed mb-3">"{syn.content}"</h4>
                
                {/* Meta-grid details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 mb-4 bg-black/25 p-2 rounded-lg border border-white/2">
                  <div>
                    <span className="text-zinc-500 uppercase block text-[8px]">Importance</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-zinc-300">{syn.importance}/10</span>
                      <div className="w-12 h-1.5 bg-zinc-800 rounded overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${syn.importance * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[8px]">Confidence Index</span>
                    <span className="font-semibold text-zinc-300">{Math.round(syn.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 bg-white/2 p-2 rounded border border-white/2 font-mono">
                  <Sparkles size={11} className="text-indigo-400 shrink-0" />
                  <span className="truncate">Why kept: "{syn.reason_for_keeping || 'Reflected guidelines.'}"</span>
                </div>
                <div className="flex justify-between items-center text-[8px] text-zinc-600 font-mono mt-3 border-t border-white/2 pt-2">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(syn.created_at).toLocaleDateString()}</span>
                  <span>ID: #{syn.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
