import React, { useState, useRef, useEffect } from 'react';
import { Send, Pin, Sparkles, RefreshCw, Layers, Clock, AlertTriangle, CheckCircle, FileUp } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

interface PinnedMemory {
  id: number;
  content: string;
  importance: number;
  type: string;
}

interface ChatConsoleProps {
  token: string;
  onRefreshGraph: () => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({ token, onRefreshGraph }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'assistant',
      content: 'System activated. Accessing synaptic registry... Zero-config SQLite database loaded. Send a preference or fact (e.g., "I code in Python" or "Never expose secrets") to watch the Memory Engine compile it in real-time.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestedPrompts] = useState<string[]>([
    "I prefer functional React components and hate class-based views.",
    "Actually, I only write code in Rust instead of Go.",
    "Forget what I said about Go.",
    "Always check database indexes before writing sql."
  ]);
  
  // Real-time pipeline state triggers
  const [pinnedMemories, setPinnedMemories] = useState<PinnedMemory[]>([]);
  const [lastPipeline, setLastPipeline] = useState<any>(null);
  const [decisionAlert, setDecisionAlert] = useState<any>(null);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    setInput('');
    setLoading(true);
    setDecisionAlert(null);

    // Append User Message to local feed
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Find active session or create default
      let sessionId = sessionStorage.getItem('memoryos_session_id');
      if (!sessionId) {
        const sessionRes = await fetch(`${API_URL}/chat/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: 'Default Workspace Chat' })
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          sessionId = sessionData.id.toString();
          sessionStorage.setItem('memoryos_session_id', sessionId);
        } else {
          throw new Error("Could not create chat session.");
        }
      }

      // Send chat query to FastAPI
      const sendRes = await fetch(`${API_URL}/chat/sessions/${sessionId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      if (!sendRes.ok) throw new Error("Backend query failed.");
      
      const responseData = await sendRes.json();
      
      // Update pipeline diagnostics
      setLastPipeline(responseData.pipeline);
      setPinnedMemories(responseData.pinned_memories || []);
      setDecisionAlert(responseData.memory_decision);
      
      // Append Assistant Message to local feed
      setMessages(prev => [...prev, {
        id: responseData.assistant_message.id,
        sender: 'assistant',
        content: responseData.assistant_message.content,
        timestamp: new Date(responseData.assistant_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Refresh the outer memory graph if a save/update occurred
      if (responseData.memory_decision?.action !== 'ignore') {
        onRefreshGraph();
      }

    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        content: 'Error: Cannot establish connection to Synaptic Core backend. Verify backend is active.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick formatter to mock basic code block highlighting in Chat
  const formatMessage = (content: str) => {
    if (content.includes('```')) {
      const parts = content.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          const lines = part.split('\n');
          const lang = lines[0].trim() || 'code';
          const code = lines.slice(1).join('\n');
          return (
            <div key={index} className="my-2 border border-white/10 rounded-lg overflow-hidden bg-black/40 font-mono text-[11px]">
              <div className="bg-zinc-900 px-3 py-1 text-zinc-500 text-[9px] flex justify-between uppercase font-bold tracking-wider">
                <span>{lang}</span>
                <span>Copy</span>
              </div>
              <pre className="p-3 text-zinc-300 overflow-x-auto leading-relaxed">{code}</pre>
            </div>
          );
        }
        return <p key={index} className="whitespace-pre-wrap leading-relaxed">{part}</p>;
      });
    }
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Primary Chat Box */}
      <div className="xl:col-span-8 glass-panel rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div className={`p-4 rounded-xl text-xs ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10' 
                  : 'bg-zinc-800/80 border border-white/5 text-zinc-300 rounded-bl-none'
              }`}>
                {formatMessage(msg.content)}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] pl-2">
              <RefreshCw size={12} className="animate-spin" />
              Agent thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts Hud */}
        {messages.length === 1 && (
          <div className="px-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="p-2 text-left text-[11px] rounded-lg bg-white/2 border border-white/5 hover:bg-white/5 transition-all text-zinc-400 hover:text-zinc-200 truncate"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2 items-center">
          <button className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/50 transition-all shrink-0">
            <FileUp size={16} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Instruct the memory agent..."
            className="flex-grow bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/10"
          />
          <button 
            onClick={() => handleSendMessage(input)}
            className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Real-time Diagnostics HUD (Sidebar) */}
      <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
        {/* Active Pinned Memories in Current Context */}
        <div className="glass-panel border border-white/5 rounded-2xl p-5">
          <h4 className="text-zinc-200 font-semibold text-xs flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
            <Pin size={13} className="text-indigo-400" />
            Semantic Injected Context ({pinnedMemories.length})
          </h4>
          {pinnedMemories.length === 0 ? (
            <p className="text-[10px] text-zinc-500 italic leading-relaxed py-2">
              No active synapses triggered by the latest query. The context window remains clear.
            </p>
          ) : (
            <div className="space-y-2">
              {pinnedMemories.map(m => (
                <div key={m.id} className="p-2 rounded-lg bg-white/2 border border-white/5 text-[11px] leading-relaxed flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-zinc-500">
                    <span>{m.type}</span>
                    <span>Imp: {m.importance}</span>
                  </div>
                  <div className="text-zinc-300">"{m.content}"</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Triage Decision */}
        {decisionAlert && (
          <div className="glass-panel border border-white/5 rounded-2xl p-5">
            <h4 className="text-zinc-200 font-semibold text-xs flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
              <Sparkles size={13} className="text-indigo-400" />
              Memory Engine Action
            </h4>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
              {decisionAlert.action === 'save' || decisionAlert.action === 'update' || decisionAlert.action === 'dissonance_resolved' ? (
                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-zinc-100 uppercase tracking-widest text-[9px] block">
                  ACTION: {decisionAlert.action}
                </span>
                <span className="text-zinc-400 mt-1 block">Reason: {decisionAlert.reason}</span>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Performance Metrics */}
        {lastPipeline && (
          <div className="glass-panel border border-white/5 rounded-2xl p-5">
            <h4 className="text-zinc-200 font-semibold text-xs flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
              <Clock size={13} className="text-indigo-400" />
              Sub-Agent Pipeline Speed
            </h4>
            <div className="space-y-2 text-[10px] font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>1. Conversation Analyzer</span>
                <span className="text-zinc-300">{lastPipeline.latency_ms.analyzer}ms</span>
              </div>
              <div className="flex justify-between">
                <span>2. Semantic Retriever</span>
                <span className="text-zinc-300">{lastPipeline.latency_ms.retriever}ms</span>
              </div>
              <div className="flex justify-between">
                <span>3. Memory Triage Decision</span>
                <span className="text-zinc-300">{lastPipeline.latency_ms.decision}ms</span>
              </div>
              <div className="flex justify-between">
                <span>4. Response Generation</span>
                <span className="text-zinc-300">{lastPipeline.latency_ms.response_generation}ms</span>
              </div>
              <div className="border-t border-white/5 my-1" />
              <div className="flex justify-between text-indigo-400 font-bold">
                <span>Total Latency</span>
                <span>{lastPipeline.total_latency_ms}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
