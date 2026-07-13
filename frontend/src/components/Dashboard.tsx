import React, { useState, useEffect } from 'react';
import { 
  Brain, MessageSquare, Database, Network, Calendar, 
  BarChart2, Moon, ShieldAlert, Settings as SettingsIcon, 
  LogOut, Globe, CheckCircle, RefreshCw, Bell, User 
} from 'lucide-react';
import { ChatConsole } from './ChatConsole';
import { MemoryInspector } from './MemoryInspector';
import { GraphCanvas } from './GraphCanvas';
import { Timeline } from './Timeline';
import { Pipeline } from './Pipeline';
import { Analytics } from './Analytics';
import { SleepCycle } from './SleepCycle';
import { Dissonance } from './Dissonance';
import { Settings } from './Settings';

interface DashboardProps {
  token: string;
  username: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ token, username, onLogout }) => {
  const [view, setView] = useState<string>('chat');
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [retrievedNodeIds, setRetrievedNodeIds] = useState<number[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('connecting');

  const API_URL = 'http://localhost:8000/api';

  const fetchGraphData = async () => {
    try {
      const res = await fetch(`${API_URL}/synapses/graph`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        setHealthStatus('healthy');
      } else {
        setHealthStatus('offline');
      }
    } catch (err) {
      setHealthStatus('offline');
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [token, refreshTrigger]);

  const handleRefreshGraph = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleForgetNode = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/synapses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        handleRefreshGraph();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'chat':
        return <ChatConsole token={token} onRefreshGraph={handleRefreshGraph} />;
      case 'inspector':
        return <MemoryInspector token={token} refreshTrigger={refreshTrigger} onRefreshGraph={handleRefreshGraph} />;
      case 'graph':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Database size={22} className="text-indigo-400" />
                Synaptic Memory Graph
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
                Interact with the agent's subconscious map. Drag nodes, zoom in on links, or click a node to inspect and delete individual memories.
              </p>
            </div>
            <GraphCanvas 
              graphData={graphData} 
              retrievedNodeIds={retrievedNodeIds}
              onForgetNode={handleForgetNode}
            />
          </div>
        );
      case 'timeline':
        return <Timeline />;
      case 'pipeline':
        return <Pipeline />;
      case 'analytics':
        return <Analytics token={token} />;
      case 'reflection':
        return <SleepCycle token={token} onCycleComplete={handleRefreshGraph} />;
      case 'dissonance':
        return <Dissonance token={token} />;
      case 'settings':
        return <Settings />;
      default:
        return <ChatConsole token={token} onRefreshGraph={handleRefreshGraph} />;
    }
  };

  const sidebarItems = [
    { id: 'chat', label: 'AI Chat Console', icon: <MessageSquare size={16} /> },
    { id: 'inspector', label: 'Memory Inspector', icon: <Database size={16} /> },
    { id: 'graph', label: 'Memory Graph', icon: <Brain size={16} /> },
    { id: 'timeline', label: 'Timeline Model', icon: <Calendar size={16} /> },
    { id: 'pipeline', label: 'Agent Pipeline', icon: <Network size={16} /> },
    { id: 'analytics', label: 'Analytics Board', icon: <BarChart2 size={16} /> },
    { id: 'reflection', label: 'Reflection Engine', icon: <Moon size={16} /> },
    { id: 'dissonance', label: 'Conflict Shield', icon: <ShieldAlert size={16} /> },
    { id: 'settings', label: 'Settings Vault', icon: <SettingsIcon size={16} /> }
  ];

  return (
    <div className="flex h-screen overflow-hidden text-zinc-300 relative">
      {/* Background elements */}
      <div className="radial-glows">
        <div className="radial-glow-1" />
        <div className="radial-glow-2" />
      </div>

      {/* Sidebar Panel */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col justify-between shrink-0 z-10 bg-black/30">
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5 bg-black/20">
            <div className="w-6.5 h-6.5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/10">
              <Brain size={15} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">Memory<span className="text-indigo-400">OS</span></span>
          </div>

          {/* Navigation link list */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  view === item.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border border-indigo-400/20' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/3 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Account info bottom */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
                <User size={14} />
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white leading-none truncate">{username}</span>
                <span className="text-[9px] text-zinc-500 font-mono">Registry User</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/3 transition-all"
              title="Logout session"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Dashboard Wrapper */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 px-6 flex justify-between items-center bg-black/10 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-500">Registry System:</span>
            <span className="font-semibold text-zinc-300 bg-white/3 px-2 py-0.5 rounded border border-white/5">default-swarm</span>
            <div className="flex items-center gap-1 ml-2">
              <span className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`} />
              <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wide">
                {healthStatus === 'healthy' ? 'API Active' : 'API Connection error'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-200 relative hover:bg-white/2 rounded-lg transition-colors">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <div className="border-l border-white/5 h-4" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300 font-mono">SQLite Vault</span>
              <Globe size={13} className="text-indigo-400" />
            </div>
          </div>
        </header>

        {/* Dynamic subview display area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};
