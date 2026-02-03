'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Hexagon, Key, Wrench, Eye, EyeOff, CheckCircle, Trash2, Plus } from 'lucide-react';
import { useSwarmVilleStore } from '@/lib/store';
import { AVAILABLE_TOOLS } from '@/types';

// Character styles for avatars
const CHARACTER_STYLES = [
  { hair: '#8B4513', skin: '#FFDAB9', shirt: '#FF6B6B', pants: '#4A4A4A' },
  { hair: '#2C1810', skin: '#DEB887', shirt: '#4ECDC4', pants: '#2C3E50' },
  { hair: '#DAA520', skin: '#FFE4C4', shirt: '#9B59B6', pants: '#34495E' },
  { hair: '#8B0000', skin: '#FFDAB9', shirt: '#3498DB', pants: '#2C3E50' },
  { hair: '#4A4A4A', skin: '#D2691E', shirt: '#2ECC71', pants: '#4A4A4A' },
  { hair: '#FFD700', skin: '#FFDAB9', shirt: '#E67E22', pants: '#2C3E50' },
  { hair: '#800080', skin: '#FFE4C4', shirt: '#E91E63', pants: '#34495E' },
  { hair: '#1E90FF', skin: '#DEB887', shirt: '#F1C40F', pants: '#4A4A4A' },
];

const MANAGER_STYLE = { hair: '#2C1810', skin: '#FFDAB9', shirt: '#9B59B6', pants: '#2C3E50' };

// API Key configurations
const API_CONFIGS = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 models', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude models', placeholder: 'sk-ant-...' },
  { id: 'github', name: 'GitHub', description: 'Repository access', placeholder: 'ghp_...' },
  { id: 'slack', name: 'Slack', description: 'Channel messaging', placeholder: 'xoxb-...' },
];

interface NodePosition {
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

export default function HandoffSpecPage() {
  const { agents, updateAgent } = useSwarmVilleStore();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const managerAgent = agents.find((a) => a.is_manager);
  const specialistAgents = agents.filter((a) => !a.is_manager);

  // Initialize positions for agents if not set
  const getNodePosition = (agentId: string, index: number, isManager: boolean): NodePosition => {
    if (nodePositions[agentId]) return nodePositions[agentId];

    if (isManager) {
      return { x: 300, y: 50 };
    }
    // Arrange specialists in a row below manager
    const cols = 4;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return { x: 100 + col * 160, y: 180 + row * 140 };
  };

  const handleApiKeyChange = (keyId: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [keyId]: value }));
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleToolToggle = (agentId: string, toolId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const newTools = agent.tools.includes(toolId)
      ? agent.tools.filter((t) => t !== toolId)
      : [...agent.tools, toolId];

    updateAgent(agentId, { tools: newTools });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, agentId: string) => {
    if (connectingFrom) return; // Don't drag while connecting

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingNode(agentId);
    setSelectedAgentId(agentId);
  };

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNode || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;

      setNodePositions((prev) => ({
        ...prev,
        [draggingNode]: { x: Math.max(0, x), y: Math.max(0, y) },
      }));
    },
    [draggingNode, dragOffset]
  );

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleStartConnection = (agentId: string) => {
    if (connectingFrom === agentId) {
      setConnectingFrom(null);
    } else {
      setConnectingFrom(agentId);
    }
  };

  const handleEndConnection = (agentId: string) => {
    if (!connectingFrom || connectingFrom === agentId) {
      setConnectingFrom(null);
      return;
    }

    // Check if connection already exists
    const exists = connections.some(
      (c) => c.from === connectingFrom && c.to === agentId
    );

    if (!exists) {
      setConnections([...connections, { from: connectingFrom, to: agentId }]);
    }

    setConnectingFrom(null);
  };

  const handleRemoveConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  const selectedAgent = selectedAgentId ? agents.find((a) => a.id === selectedAgentId) : null;
  const selectedAgentIndex = selectedAgent && !selectedAgent.is_manager
    ? specialistAgents.findIndex((a) => a.id === selectedAgentId)
    : -1;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/team-builder" className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-amber-800" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-amber-900 font-mono tracking-wide">SwarmVille</h1>
            </div>
          </div>
          <Link
            href="/task-submission"
            className="flex items-center gap-2 bg-coral text-white px-6 py-2 rounded-lg font-bold font-mono tracking-wide hover:bg-coral/90 transition-all shadow-lg"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-amber-50 border-b-2 border-amber-200 py-3">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 text-sm font-mono">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Team Builder</span>
            </div>
            <div className="w-12 h-0.5 bg-coral"></div>
            <div className="flex items-center gap-2 text-coral">
              <div className="w-6 h-6 bg-coral text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="font-bold">Handoff Spec</span>
            </div>
            <div className="w-12 h-0.5 bg-amber-300"></div>
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-6 h-6 bg-amber-300 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>Task Submission</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex">
        {/* Left Panel - Node Graph */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-xl border-2 border-amber-800 shadow-lg h-full flex flex-col">
            <div className="px-4 py-3 border-b border-amber-200 flex items-center justify-between">
              <span className="font-mono font-bold text-amber-900">Agent Hierarchy</span>
              <span className="text-xs text-amber-600 font-mono">
                {connectingFrom ? 'Click another agent to connect' : 'Drag agents to position • Click connector to link'}
              </span>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-auto bg-amber-50/50"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f5e6d3 1px, transparent 1px),
                  linear-gradient(to bottom, #f5e6d3 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            >
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 500 }}>
                {connections.map((conn, index) => {
                  const fromAgent = agents.find((a) => a.id === conn.from);
                  const toAgent = agents.find((a) => a.id === conn.to);
                  if (!fromAgent || !toAgent) return null;

                  const fromIsManager = fromAgent.is_manager;
                  const toIsManager = toAgent.is_manager;
                  const fromIndex = !fromIsManager ? specialistAgents.findIndex((a) => a.id === conn.from) : -1;
                  const toIndex = !toIsManager ? specialistAgents.findIndex((a) => a.id === conn.to) : -1;

                  const fromPos = getNodePosition(conn.from, fromIndex, fromIsManager);
                  const toPos = getNodePosition(conn.to, toIndex, toIsManager);

                  const startX = fromPos.x + 60;
                  const startY = fromPos.y + 80;
                  const endX = toPos.x + 60;
                  const endY = toPos.y;

                  const midY = (startY + endY) / 2;

                  return (
                    <g key={index}>
                      <path
                        d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                        stroke="#FF6B6B"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      <circle
                        cx={(startX + endX) / 2}
                        cy={midY}
                        r="10"
                        fill="#fff"
                        stroke="#FF6B6B"
                        strokeWidth="2"
                        className="cursor-pointer pointer-events-auto"
                        onClick={() => handleRemoveConnection(index)}
                      />
                      <text
                        x={(startX + endX) / 2}
                        y={midY + 4}
                        textAnchor="middle"
                        className="text-xs fill-coral pointer-events-none font-bold"
                      >
                        ×
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#FF6B6B" />
                  </marker>
                </defs>
              </svg>

              {/* Manager Node */}
              {managerAgent && (
                <AgentNode
                  agent={managerAgent}
                  position={getNodePosition(managerAgent.id, -1, true)}
                  isManager
                  isSelected={selectedAgentId === managerAgent.id}
                  isConnecting={connectingFrom !== null}
                  isConnectingFrom={connectingFrom === managerAgent.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, managerAgent.id)}
                  onStartConnection={() => handleStartConnection(managerAgent.id)}
                  onEndConnection={() => handleEndConnection(managerAgent.id)}
                  style={MANAGER_STYLE}
                />
              )}

              {/* Specialist Nodes */}
              {specialistAgents.map((agent, index) => (
                <AgentNode
                  key={agent.id}
                  agent={agent}
                  position={getNodePosition(agent.id, index, false)}
                  isSelected={selectedAgentId === agent.id}
                  isConnecting={connectingFrom !== null}
                  isConnectingFrom={connectingFrom === agent.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, agent.id)}
                  onStartConnection={() => handleStartConnection(agent.id)}
                  onEndConnection={() => handleEndConnection(agent.id)}
                  style={CHARACTER_STYLES[index % CHARACTER_STYLES.length]}
                />
              ))}

              {agents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                    <p className="text-amber-600 font-mono mb-2">No agents yet</p>
                    <Link href="/team-builder" className="text-coral font-mono hover:underline">
                      Build your team first
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Tools & API Keys */}
        <div className="w-96 p-4 space-y-4 overflow-y-auto">
          {/* Agent Tools */}
          {selectedAgent && (
            <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-mint" />
                <span className="font-mono font-bold text-amber-900">{selectedAgent.name}'s Tools</span>
              </div>
              <div className="space-y-2">
                {AVAILABLE_TOOLS.map((tool) => {
                  const isSelected = selectedAgent.tools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolToggle(selectedAgent.id, tool.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                        isSelected ? 'bg-mint/20 border-2 border-mint' : 'bg-amber-50 hover:bg-amber-100 border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-mint text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        {tool.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-sm text-amber-900">{tool.name}</p>
                        <p className="text-xs text-amber-600">{tool.description}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-mint" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedAgent && (
            <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-mint" />
                <span className="font-mono font-bold text-amber-900">Agent Tools</span>
              </div>
              <p className="text-amber-600 font-mono text-sm text-center py-4">
                Select an agent to configure tools
              </p>
            </div>
          )}

          {/* API Keys */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-coral" />
              <span className="font-mono font-bold text-amber-900">API Keys</span>
            </div>
            <div className="space-y-3">
              {API_CONFIGS.map((config) => (
                <div key={config.id}>
                  <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">
                    {config.name}
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[config.id] ? 'text' : 'password'}
                      value={apiKeys[config.id] || ''}
                      onChange={(e) => handleApiKeyChange(config.id, e.target.value)}
                      className="w-full px-3 py-2 pr-10 border-2 border-amber-300 rounded-lg font-mono text-sm focus:border-coral focus:outline-none"
                      placeholder={config.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700"
                    >
                      {showKeys[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-500 font-mono">
              Keys are stored locally in your browser
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Agent Node Component
function AgentNode({
  agent,
  position,
  isManager = false,
  isSelected,
  isConnecting,
  isConnectingFrom,
  onMouseDown,
  onStartConnection,
  onEndConnection,
  style,
}: {
  agent: { id: string; name: string; role: string };
  position: NodePosition;
  isManager?: boolean;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectingFrom: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartConnection: () => void;
  onEndConnection: () => void;
  style: { hair: string; skin: string; shirt: string; pants: string };
}) {
  return (
    <div
      className={`absolute cursor-move select-none ${isSelected ? 'z-10' : ''}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={onMouseDown}
    >
      {/* Input connector (top) */}
      <button
        className={`absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
          isConnecting && !isConnectingFrom
            ? 'bg-coral border-coral scale-125'
            : 'bg-white border-amber-400 hover:border-coral'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onEndConnection();
        }}
      />

      {/* Node Card */}
      <div
        className={`w-[120px] bg-white rounded-xl shadow-lg border-2 transition-all ${
          isSelected ? 'border-coral' : isConnectingFrom ? 'border-mint' : 'border-amber-300'
        }`}
      >
        <div className="p-3 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-12 h-14 mb-2" style={{ imageRendering: 'pixelated' }}>
            <svg viewBox="0 0 16 20" className="w-full h-full">
              {isManager && (
                <>
                  <rect x="5" y="0" width="6" height="2" fill="#F1C40F" />
                  <rect x="4" y="1" width="1" height="2" fill="#F1C40F" />
                  <rect x="11" y="1" width="1" height="2" fill="#F1C40F" />
                </>
              )}
              <rect x="4" y={isManager ? "3" : "1"} width="8" height="3" fill={style.hair} />
              <rect x="4" y={isManager ? "5" : "3"} width="8" height="5" fill={style.skin} />
              <rect x="5" y={isManager ? "6" : "4"} width="2" height="2" fill="#2C1810" />
              <rect x="9" y={isManager ? "6" : "4"} width="2" height="2" fill="#2C1810" />
              <rect x="3" y={isManager ? "10" : "8"} width="10" height="5" fill={style.shirt} />
              <rect x="4" y={isManager ? "15" : "13"} width="3" height="4" fill={style.pants} />
              <rect x="9" y={isManager ? "15" : "13"} width="3" height="4" fill={style.pants} />
            </svg>
          </div>
          <p className="font-mono font-bold text-amber-900 text-xs truncate w-full text-center">
            {agent.name}
          </p>
          <p className="text-[10px] text-amber-600 truncate w-full text-center">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Output connector (bottom) */}
      <button
        className={`absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
          isConnectingFrom
            ? 'bg-mint border-mint scale-125'
            : 'bg-white border-amber-400 hover:border-coral'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
      />
    </div>
  );
}
