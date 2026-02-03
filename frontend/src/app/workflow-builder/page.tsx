'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Hexagon,
  ArrowLeft,
  Save,
  Play,
  Trash2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useSwarmVilleStore } from '@/lib/store';
import type { WorkflowNode, WorkflowEdge, Agent } from '@/types';

interface NodePosition {
  x: number;
  y: number;
}

interface CanvasNode extends WorkflowNode {
  agent: Agent;
}

export default function WorkflowBuilderPage() {
  const { agents, workflows, currentWorkflow, setCurrentWorkflow, addWorkflow, updateWorkflow } = useSwarmVilleStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Workflow state
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || 'My Workflow');
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  // Drag state
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });

  // Initialize nodes from agents
  useEffect(() => {
    if (currentWorkflow) {
      // Load existing workflow
      const loadedNodes = currentWorkflow.nodes.map((node) => {
        const agent = agents.find((a) => a.id === node.agent_id);
        return {
          ...node,
          agent: agent!,
        };
      }).filter((n) => n.agent);
      setNodes(loadedNodes);
      setEdges(currentWorkflow.edges);
      setWorkflowName(currentWorkflow.name);
    }
  }, [currentWorkflow, agents]);

  const handleAddAgent = (agent: Agent) => {
    // Check if agent is already in the workflow
    if (nodes.some((n) => n.agent_id === agent.id)) {
      return;
    }

    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      agent_id: agent.id,
      position: { x: 100 + nodes.length * 200, y: 200 },
      complexity_weight: 1,
      agent,
    };
    setNodes([...nodes, newNode]);
  };

  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source_node_id !== nodeId && e.target_node_id !== nodeId));
    setSelectedNode(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left click

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNode || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, position: { x: Math.max(0, x), y: Math.max(0, y) } }
            : n
        )
      );
    },
    [draggingNode, dragOffset]
  );

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectionStart(nodeId);
  };

  const handleEndConnection = (nodeId: string) => {
    if (!connectionStart || connectionStart === nodeId) {
      setConnectionStart(null);
      return;
    }

    // Check if edge already exists
    const edgeExists = edges.some(
      (e) =>
        (e.source_node_id === connectionStart && e.target_node_id === nodeId) ||
        (e.source_node_id === nodeId && e.target_node_id === connectionStart)
    );

    if (!edgeExists) {
      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}`,
        source_node_id: connectionStart,
        target_node_id: nodeId,
        handoff_config: {
          include_output: true,
          include_summary: true,
          include_flags: true,
          include_context: true,
        },
      };
      setEdges([...edges, newEdge]);
    }

    setConnectionStart(null);
  };

  const handleRemoveEdge = (edgeId: string) => {
    setEdges(edges.filter((e) => e.id !== edgeId));
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      nodes: nodes.map(({ agent, ...node }) => node),
      edges,
    };

    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, workflowData);
    } else {
      const newWorkflow = {
        id: `workflow_${Date.now()}`,
        user_id: 'demo_user',
        ...workflowData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addWorkflow(newWorkflow);
      setCurrentWorkflow(newWorkflow);
    }
  };

  // Get agents not yet in workflow
  const availableAgents = agents.filter(
    (a) => !a.is_manager && !nodes.some((n) => n.agent_id === a.id)
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-peach flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-peach/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-warm-brown" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-warm-brown" />
              </div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-xl font-bold text-warm-brown bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-coral rounded px-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveWorkflow}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <Link href="/dashboard" className="btn-primary flex items-center gap-2">
              <Play className="w-4 h-4" />
              Deploy
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Agent Pool Sidebar */}
        <aside className="w-64 bg-white border-r border-peach p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-warm-gray uppercase tracking-wide mb-4">
            Available Agents
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {availableAgents.length === 0 ? (
              <p className="text-sm text-amber-500 font-mono">
                All agents are in the workflow.{' '}
                <Link href="/team-builder" className="text-coral hover:underline">
                  Add more
                </Link>
              </p>
            ) : (
              availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAddAgent(agent)}
                  className="w-full flex items-center gap-3 p-3 bg-peach/20 rounded-lg hover:bg-peach/40 transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: agent.avatar_style.clothing_color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-brown truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-warm-gray truncate">{agent.role}</p>
                  </div>
                  <Plus className="w-4 h-4 text-coral" />
                </button>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-mint/20 rounded-lg">
            <h4 className="text-sm font-medium text-warm-brown mb-2">
              How to Build
            </h4>
            <ul className="text-xs text-warm-gray space-y-1">
              <li>1. Add agents from the list</li>
              <li>2. Drag to position them</li>
              <li>3. Click connector dots to link</li>
              <li>4. Save and deploy</li>
            </ul>
          </div>
        </aside>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-[#f9f5ef]"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e8dcc8 1px, transparent 1px),
                linear-gradient(to bottom, #e8dcc8 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* SVG for edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source_node_id);
              const targetNode = nodes.find((n) => n.id === edge.target_node_id);
              if (!sourceNode || !targetNode) return null;

              const sourceX = sourceNode.position.x + 100;
              const sourceY = sourceNode.position.y + 40;
              const targetX = targetNode.position.x;
              const targetY = targetNode.position.y + 40;

              // Curved path
              const midX = (sourceX + targetX) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                    stroke="#FF9B85"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Delete button on edge */}
                  <circle
                    cx={midX}
                    cy={(sourceY + targetY) / 2}
                    r="10"
                    fill="#fff"
                    stroke="#FF9B85"
                    strokeWidth="2"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => handleRemoveEdge(edge.id)}
                  />
                  <text
                    x={midX}
                    y={(sourceY + targetY) / 2 + 4}
                    textAnchor="middle"
                    className="text-xs fill-coral pointer-events-none"
                  >
                    ×
                  </text>
                </g>
              );
            })}
            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#FF9B85" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              isConnecting={connectionStart !== null}
              isConnectionStart={connectionStart === node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onStartConnection={() => handleStartConnection(node.id)}
              onEndConnection={() => handleEndConnection(node.id)}
              onRemove={() => handleRemoveNode(node.id)}
            />
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-white/80 rounded-xl shadow-sm">
                <p className="text-warm-gray mb-2">
                  Add agents from the sidebar to build your workflow
                </p>
                <ArrowLeft className="w-6 h-6 text-coral mx-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowNodeComponent({
  node,
  isSelected,
  isConnecting,
  isConnectionStart,
  onMouseDown,
  onStartConnection,
  onEndConnection,
  onRemove,
}: {
  node: CanvasNode;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectionStart: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartConnection: () => void;
  onEndConnection: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`absolute cursor-move select-none ${
        isSelected ? 'z-10' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Node card */}
      <div
        className={`w-[200px] bg-white rounded-xl shadow-lg border-2 transition-colors ${
          isSelected
            ? 'border-coral'
            : isConnectionStart
            ? 'border-mint'
            : 'border-peach'
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 p-3 border-b border-peach"
          style={{ backgroundColor: `${node.agent.avatar_style.clothing_color}15` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: node.agent.avatar_style.clothing_color }}
          >
            {node.agent.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-warm-brown truncate text-sm">
              {node.agent.name}
            </p>
            <p className="text-xs text-warm-gray truncate">{node.agent.role}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Tools */}
        <div className="p-3">
          <div className="flex flex-wrap gap-1">
            {node.agent.tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="text-xs bg-mint/30 text-warm-brown px-2 py-0.5 rounded"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Input connector (left) */}
      <button
        className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors ${
          isConnecting && !isConnectionStart
            ? 'bg-coral border-coral scale-125'
            : 'bg-white border-warm-gray hover:border-coral'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onEndConnection();
        }}
      />

      {/* Output connector (right) */}
      <button
        className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors ${
          isConnectionStart
            ? 'bg-mint border-mint scale-125'
            : 'bg-white border-warm-gray hover:border-coral'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
      >
        <ArrowRight className="w-2 h-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-warm-gray" />
      </button>
    </div>
  );
}
