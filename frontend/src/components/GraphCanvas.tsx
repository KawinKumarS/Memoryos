import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, RotateCcw, Shield, Layers, HelpCircle } from 'lucide-react';

interface Node {
  id: number;
  label: string;
  content: string;
  type: string;
  importance: number;
  confidence: number;
  reason: string;
  created_at: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowing: boolean;
  glowTimer: number;
}

interface Link {
  source: number;
  target: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

interface GraphCanvasProps {
  graphData: { nodes: any[]; links: any[] };
  onNodeSelect?: (node: any) => void;
  retrievedNodeIds?: number[]; // nodes to highlight during chat
  onForgetNode?: (nodeId: number) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  onNodeSelect,
  retrievedNodeIds = [],
  onForgetNode
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [physicsActive, setPhysicsActive] = useState<boolean>(true);
  
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Define colors by memory type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preference': return '#6366f1'; // Indigo
      case 'rule': return '#ef4444'; // Red
      case 'skill': return '#10b981'; // Emerald
      case 'relation': return '#f59e0b'; // Amber
      case 'fact':
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Sync prop data with physics state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Maintain existing node positions if they match incoming data, otherwise generate
    const currentNodesMap = new Map(nodes.map(n => [n.id, n]));
    
    const updatedNodes = graphData.nodes.map((nodeData: any) => {
      const existing = currentNodesMap.get(nodeData.id);
      const color = getTypeColor(nodeData.type);
      const radius = 6 + (nodeData.importance || 5) * 1.2;
      
      return {
        id: nodeData.id,
        label: nodeData.label,
        content: nodeData.content,
        type: nodeData.type,
        importance: nodeData.importance,
        confidence: nodeData.confidence,
        reason: nodeData.reason || '',
        created_at: nodeData.created_at || '',
        x: existing ? existing.x : width / 2 + (Math.random() - 0.5) * 150,
        y: existing ? existing.y : height / 2 + (Math.random() - 0.5) * 150,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
        radius: radius,
        color: color,
        glowing: retrievedNodeIds.includes(nodeData.id) || (existing ? existing.glowing : false),
        glowTimer: retrievedNodeIds.includes(nodeData.id) ? 120 : (existing ? existing.glowTimer : 0)
      };
    });
    
    setNodes(updatedNodes);
    setLinks(graphData.links);
  }, [graphData]);

  // Flash nodes when retrieved Node IDs change
  useEffect(() => {
    if (retrievedNodeIds.length > 0) {
      setNodes(prev => prev.map(node => {
        if (retrievedNodeIds.includes(node.id)) {
          return { ...node, glowing: true, glowTimer: 180 };
        }
        return node;
      }));
    }
  }, [retrievedNodeIds]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Physics parameters
    const gravity = 0.05;
    const repulsion = 250;
    const linkStrength = 0.04;
    const friction = 0.90;
    
    const renderLoop = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Clear Canvas with subtle trailing effect for glow particles
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid aligned with pan & zoom
      drawGrid(ctx, width, height);
      
      // Run Physics Update
      if (physicsActive && nodes.length > 0) {
        // 1. Central Gravity
        nodes.forEach(n => {
          if (n === draggedNode) return;
          const dx = width / 2 - n.x;
          const dy = height / 2 - n.y;
          n.vx += dx * gravity * 0.15;
          n.vy += dy * gravity * 0.15;
        });
        
        // 2. Repulsion (all nodes push each other)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = n1.radius + n2.radius + 35;
            
            if (dist < minDist) {
              const force = (minDist - dist) * 0.25;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (n1 !== draggedNode) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2 !== draggedNode) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }
        
        // 3. Link Forces (connected nodes pull each other)
        const nodesMap = new Map(nodes.map(n => [n.id, n]));
        links.forEach(link => {
          const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
          const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
          
          const n1 = nodesMap.get(s);
          const n2 = nodesMap.get(t);
          
          if (n1 && n2) {
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const restLength = 80;
            const force = (dist - restLength) * linkStrength;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            if (n1 !== draggedNode) {
              n1.vx += fx;
              n1.vy += fy;
            }
            if (n2 !== draggedNode) {
              n2.vx -= fx;
              n2.vy -= fy;
            }
          }
        });
        
        // 4. Update Node position & apply friction
        nodes.forEach(n => {
          if (n === draggedNode) return;
          n.vx *= friction;
          n.vy *= friction;
          n.x += n.vx;
          n.y += n.vy;
          
          // Clamp to boundary
          n.x = Math.max(n.radius, Math.min(width - n.radius, n.x));
          n.y = Math.max(n.radius, Math.min(height - n.radius, n.y));
          
          // Manage glow timers
          if (n.glowing) {
            n.glowTimer--;
            if (n.glowTimer <= 0) {
              n.glowing = false;
            }
          }
        });
      }
      
      // Update & Draw Particles (Exploding effects)
      updateAndDrawParticles(ctx);
      
      // Save canvas state for Pan & Zoom transforms
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      
      // Draw Links (Edges)
      ctx.lineWidth = 1;
      const nodesMap = new Map(nodes.map(n => [n.id, n]));
      links.forEach(link => {
        const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
        
        const n1 = nodesMap.get(s);
        const n2 = nodesMap.get(t);
        
        if (n1 && n2) {
          const isGlowLink = n1.glowing || n2.glowing;
          ctx.strokeStyle = isGlowLink 
            ? 'rgba(99, 102, 241, 0.4)' 
            : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = isGlowLink ? 2 : 1;
          
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      });
      
      // Draw Nodes
      nodes.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id;
        
        // Glow effect
        if (node.glowing || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius + 10);
          gradient.addColorStop(0, node.color + '44');
          gradient.addColorStop(1, node.color + '00');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        // Inner Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Outer stroke for visual crispness
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0,0,0,0.3)';
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.stroke();
        
        // Label Text (above node)
        ctx.font = '9px Outfit, sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#a1a1aa';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.radius - 6);
      });
      
      ctx.restore();
      
      animationId = requestAnimationFrame(renderLoop);
    };
    
    animationId = requestAnimationFrame(renderLoop);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodes, links, pan, zoom, physicsActive, draggedNode, selectedNode, particles]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 40;
    const startX = pan.x % (gridSize * zoom);
    const startY = pan.y % (gridSize * zoom);
    
    for (let x = startX; x < width; x += gridSize * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = startY; y < height; y += gridSize * zoom) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    if (particles.length === 0) return;
    
    const activeParticles: Particle[] = [];
    
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        activeParticles.push(p);
      }
    });
    
    ctx.restore();
    
    if (activeParticles.length !== particles.length) {
      setParticles(activeParticles);
    }
  };

  // Spark an explosion of glowing particles when a node is forgotten
  const triggerForgetExplosion = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        radius: 1.5 + Math.random() * 2,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Translate click coordinates into world space coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (screenX - rect.left - pan.x) / zoom;
    const y = (screenY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const worldPos = screenToWorld(clientX, clientY);
    
    // Check if clicked a node
    let clickedNode: Node | null = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = worldPos.x - node.x;
      const dy = worldPos.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.radius + 5) {
        clickedNode = node;
        break;
      }
    }
    
    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode);
      if (onNodeSelect) onNodeSelect(clickedNode);
    } else {
      setIsDraggingCanvas(true);
      dragStartRef.current = { x: clientX - pan.x, y: clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    
    if (draggedNode) {
      const worldPos = screenToWorld(clientX, clientY);
      draggedNode.x = worldPos.x;
      draggedNode.y = worldPos.y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isDraggingCanvas) {
      setPan({
        x: clientX - dragStartRef.current.x,
        y: clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsDraggingCanvas(false);
  };

  const handleForgetClick = () => {
    if (selectedNode && onForgetNode) {
      triggerForgetExplosion(selectedNode.x, selectedNode.y, selectedNode.color);
      onForgetNode(selectedNode.id);
      setSelectedNode(null);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    // Randomize node velocities
    setNodes(prev => prev.map(n => ({
      ...n,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5
    })));
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl glass-panel overflow-hidden border border-white/5">
      {/* HUD Controller */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setPhysicsActive(!physicsActive)}
          className={`p-2 rounded-lg border transition-all ${
            physicsActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800/60 border-white/5 text-zinc-400'
          }`}
          title={physicsActive ? "Pause Physics" : "Play Physics"}
        >
          {physicsActive ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button 
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          className="p-2 rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-300 hover:bg-zinc-800 transition-all"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-2 rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-300 hover:bg-zinc-800 transition-all"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <button 
          onClick={handleReset}
          className="p-2 rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-300 hover:bg-zinc-800 transition-all"
          title="Reset Graph Position"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Floating Node Inspector Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-10 w-80 glass-panel border border-white/10 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-start mb-2">
            <span 
              className="text-[10px] px-2 py-0.5 rounded font-medium tracking-wider uppercase"
              style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color }}
            >
              {selectedNode.type}
            </span>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold px-1"
            >
              Close
            </button>
          </div>
          
          <h4 className="text-zinc-100 font-medium text-sm mb-1">{selectedNode.content}</h4>
          
          <div className="grid grid-cols-2 gap-2 my-3 text-[11px] text-zinc-400">
            <div className="bg-white/2 rounded-md p-1.5 border border-white/5">
              <span className="block text-[10px] text-zinc-500 uppercase">Importance</span>
              <span className="font-semibold text-zinc-200">{selectedNode.importance} / 10</span>
            </div>
            <div className="bg-white/2 rounded-md p-1.5 border border-white/5">
              <span className="block text-[10px] text-zinc-500 uppercase">Confidence</span>
              <span className="font-semibold text-zinc-200">{Math.round(selectedNode.confidence * 100)}%</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="block text-[10px] text-zinc-500 uppercase mb-1">Reason kept</span>
            <p className="text-xs text-zinc-300 italic bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
              "{selectedNode.reason || 'Consolidated fact from agent reflections.'}"
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleForgetClick}
              className="flex-1 py-1.5 text-xs rounded bg-red-950/40 text-red-400 border border-red-500/25 hover:bg-red-500 hover:text-white transition-all font-medium"
            >
              Forget Synapse
            </button>
          </div>
        </div>
      )}

      {/* Custom Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel border border-white/5 rounded-lg p-2 flex flex-col gap-1 text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
          <span>Preference</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>Rule / Guard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>Skill / Macro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span>Relation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <span>Fact</span>
        </div>
      </div>
    </div>
  );
};
