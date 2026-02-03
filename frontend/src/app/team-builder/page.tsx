'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Trash2, X, Hexagon, Users, Shield, Sparkles } from 'lucide-react';
import { useSwarmVilleStore } from '@/lib/store';
import { AVAILABLE_TOOLS, LLM_MODELS } from '@/types';
import type { Agent, AvatarStyle } from '@/types';

// Pixel art character configurations
const CHARACTER_STYLES = [
  { id: 1, hair: '#8B4513', skin: '#FFDAB9', shirt: '#FF6B6B', pants: '#4A4A4A' },
  { id: 2, hair: '#2C1810', skin: '#DEB887', shirt: '#4ECDC4', pants: '#2C3E50' },
  { id: 3, hair: '#DAA520', skin: '#FFE4C4', shirt: '#9B59B6', pants: '#34495E' },
  { id: 4, hair: '#8B0000', skin: '#FFDAB9', shirt: '#3498DB', pants: '#2C3E50' },
  { id: 5, hair: '#4A4A4A', skin: '#D2691E', shirt: '#2ECC71', pants: '#4A4A4A' },
  { id: 6, hair: '#FFD700', skin: '#FFDAB9', shirt: '#E67E22', pants: '#2C3E50' },
  { id: 7, hair: '#800080', skin: '#FFE4C4', shirt: '#E91E63', pants: '#34495E' },
  { id: 8, hair: '#1E90FF', skin: '#DEB887', shirt: '#F1C40F', pants: '#4A4A4A' },
];

// Manager character style (fixed)
const MANAGER_STYLE = { hair: '#2C1810', skin: '#FFDAB9', shirt: '#9B59B6', pants: '#2C3E50', accessory: 'crown' };

// Team templates
const TEAM_TEMPLATES = [
  {
    id: 'dev-team',
    name: 'Development Team',
    description: 'Full-stack engineering team for software projects',
    agents: [
      { name: 'Architect', role: 'System Architect', goal: 'Design scalable system architecture', tools: ['github', 'jira'] },
      { name: 'Frontend', role: 'Frontend Developer', goal: 'Build responsive user interfaces', tools: ['github', 'slack'] },
      { name: 'Backend', role: 'Backend Developer', goal: 'Develop APIs and services', tools: ['github', 'jira'] },
      { name: 'QA', role: 'Quality Assurance', goal: 'Ensure code quality and test coverage', tools: ['github', 'jira'] },
    ],
  },
  {
    id: 'content-team',
    name: 'Content Team',
    description: 'Creative team for content creation and marketing',
    agents: [
      { name: 'Writer', role: 'Content Writer', goal: 'Create engaging written content', tools: ['google_docs', 'slack'] },
      { name: 'Editor', role: 'Content Editor', goal: 'Review and polish content', tools: ['google_docs', 'slack'] },
      { name: 'SEO', role: 'SEO Specialist', goal: 'Optimize content for search', tools: ['google_docs', 'jira'] },
    ],
  },
  {
    id: 'research-team',
    name: 'Research Team',
    description: 'Analysis and research focused team',
    agents: [
      { name: 'Researcher', role: 'Lead Researcher', goal: 'Conduct deep research and analysis', tools: ['web_search', 'google_docs'] },
      { name: 'Analyst', role: 'Data Analyst', goal: 'Analyze data and create reports', tools: ['google_docs', 'slack'] },
      { name: 'Reviewer', role: 'Peer Reviewer', goal: 'Validate findings and methodologies', tools: ['google_docs', 'slack'] },
    ],
  },
];

export default function TeamBuilderPage() {
  const { agents, addAgent, removeAgent } = useSwarmVilleStore();
  const [teamName, setTeamName] = useState('My AI Team');
  const [teamRole, setTeamRole] = useState('');
  const [approvalGuardrail, setApprovalGuardrail] = useState<'all' | 'high-risk' | 'none'>('high-risk');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  const managerAgent = agents.find((a) => a.is_manager);
  const specialistAgents = agents.filter((a) => !a.is_manager);

  const handleCreateAgent = (agentData: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'cost_per_token'>) => {
    // Auto-create manager if first agent
    if (specialistAgents.length === 0 && !managerAgent) {
      const manager: Agent = {
        id: `agent_manager_${Date.now()}`,
        user_id: 'demo_user',
        name: 'Manager',
        role: 'AI Workforce Manager',
        goal: 'Orchestrate specialist agents to complete tasks efficiently',
        backstory: 'Expert at breaking down complex goals into actionable subtasks.',
        tools: ['task_decomposer', 'agent_assigner'],
        llm_model: 'gpt-4',
        cost_per_token: 0.03,
        is_manager: true,
        avatar_style: { hair_color: MANAGER_STYLE.hair, clothing_color: MANAGER_STYLE.shirt, skin_tone: MANAGER_STYLE.skin },
        created_at: new Date().toISOString(),
      };
      addAgent(manager);
    }

    const newAgent: Agent = {
      ...agentData,
      id: `agent_${Date.now()}`,
      user_id: 'demo_user',
      created_at: new Date().toISOString(),
      cost_per_token: LLM_MODELS.find((m) => m.id === agentData.llm_model)?.cost_per_1k || 0.01,
    };
    addAgent(newAgent);
    setSelectedSlot(null);
  };

  const handleDeleteAgent = (id: string) => {
    removeAgent(id);
    setSelectedSlot(null);
  };

  const handleApplyTemplate = (template: typeof TEAM_TEMPLATES[0]) => {
    // Clear existing agents
    agents.forEach(a => removeAgent(a.id));

    // Create manager
    const manager: Agent = {
      id: `agent_manager_${Date.now()}`,
      user_id: 'demo_user',
      name: 'Manager',
      role: 'Team Manager',
      goal: `Lead the ${template.name} to success`,
      backstory: 'Expert at coordinating specialist agents.',
      tools: ['task_decomposer', 'agent_assigner'],
      llm_model: 'gpt-4',
      cost_per_token: 0.03,
      is_manager: true,
      avatar_style: { hair_color: MANAGER_STYLE.hair, clothing_color: MANAGER_STYLE.shirt, skin_tone: MANAGER_STYLE.skin },
      created_at: new Date().toISOString(),
    };
    addAgent(manager);

    // Create specialists
    template.agents.forEach((agentTemplate, index) => {
      const style = CHARACTER_STYLES[index % CHARACTER_STYLES.length];
      const newAgent: Agent = {
        id: `agent_${Date.now()}_${index}`,
        user_id: 'demo_user',
        name: agentTemplate.name,
        role: agentTemplate.role,
        goal: agentTemplate.goal,
        backstory: `Specialized in ${agentTemplate.role.toLowerCase()}.`,
        tools: agentTemplate.tools,
        llm_model: 'gpt-4',
        cost_per_token: 0.03,
        is_manager: false,
        avatar_style: { hair_color: style.hair, clothing_color: style.shirt, skin_tone: style.skin },
        created_at: new Date().toISOString(),
      };
      addAgent(newAgent);
    });

    setTeamName(template.name);
    setTeamRole(template.description);
    setShowTemplates(false);
  };

  const selectedAgent = selectedSlot !== null ? specialistAgents[selectedSlot] : null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
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
            href="/handoff-spec"
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
            <div className="flex items-center gap-2 text-coral">
              <div className="w-6 h-6 bg-coral text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="font-bold">Team Builder</span>
            </div>
            <div className="w-12 h-0.5 bg-amber-300"></div>
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-6 h-6 bg-amber-300 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span>Handoff Spec</span>
            </div>
            <div className="w-12 h-0.5 bg-amber-300"></div>
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-6 h-6 bg-amber-300 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>Task Submission</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Left Panel - Team Config & Agent Form */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Team Configuration */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-coral" />
              <span className="font-mono font-bold text-amber-900">Team Configuration</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-amber-900 focus:border-coral focus:outline-none"
                  placeholder="My AI Team"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">Team Role / Purpose</label>
                <textarea
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-amber-900 text-sm focus:border-coral focus:outline-none resize-none"
                  rows={2}
                  placeholder="What does this team do?"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-amber-700 mb-1 uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Approval Guardrail
                </label>
                <select
                  value={approvalGuardrail}
                  onChange={(e) => setApprovalGuardrail(e.target.value as 'all' | 'high-risk' | 'none')}
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-amber-900 text-sm focus:border-coral focus:outline-none"
                >
                  <option value="all">Approve All Actions</option>
                  <option value="high-risk">High-Risk Only (Recommended)</option>
                  <option value="none">Autonomous (No Approval)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agent Details Panel */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple" />
              <span className="font-mono font-bold text-amber-900">Agent Recruitment</span>
            </div>

            {selectedAgent ? (
              <AgentDetailPanel
                agent={selectedAgent}
                onDelete={() => handleDeleteAgent(selectedAgent.id)}
                characterStyle={CHARACTER_STYLES[selectedSlot! % CHARACTER_STYLES.length]}
              />
            ) : selectedSlot !== null && !specialistAgents[selectedSlot] ? (
              <NewAgentForm
                onSubmit={handleCreateAgent}
                onCancel={() => setSelectedSlot(null)}
                characterStyle={CHARACTER_STYLES[selectedSlot % CHARACTER_STYLES.length]}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-amber-600 font-mono text-sm">
                  Select a slot to recruit an agent
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Character Grid & Templates */}
        <div className="flex-1 space-y-4">
          {/* Templates Section */}
          {showTemplates && specialistAgents.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-amber-900">Quick Start Templates</span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-amber-500 hover:text-amber-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {TEAM_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg border-2 border-amber-200 hover:border-coral transition-all text-left"
                  >
                    <h4 className="font-mono font-bold text-amber-900 text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-amber-600">{template.description}</p>
                    <p className="text-xs text-coral mt-2">{template.agents.length} agents</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Character Grid */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-6 shadow-lg">
            {/* Manager Agent (Fixed) */}
            <div className="mb-8">
              <div className="text-center mb-2">
                <span className="font-mono text-xs text-amber-700 uppercase">Team Manager</span>
              </div>
              <div className="flex items-center justify-center">
                <PixelCharacter
                  style={MANAGER_STYLE}
                  size="large"
                  isManager
                  name={managerAgent?.name || 'Manager'}
                  showCrown
                />
              </div>
            </div>

            {/* Specialist Grid */}
            <div className="text-center mb-4">
              <span className="font-mono text-xs text-amber-700 uppercase">Team Members ({specialistAgents.length} / 8)</span>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                const agent = specialistAgents[index];
                const style = CHARACTER_STYLES[index % CHARACTER_STYLES.length];
                const isSelected = selectedSlot === index;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(index)}
                    className={`relative bg-amber-50 border-4 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected ? 'border-coral shadow-lg' : agent ? 'border-amber-300 hover:border-coral' : 'border-dashed border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    {agent ? (
                      <PixelCharacter
                        style={style}
                        size="medium"
                        name={agent.name}
                      />
                    ) : (
                      <div className="w-16 h-20 flex items-center justify-center">
                        <span className="text-3xl text-amber-300">+</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-center mt-6">
              <p className="text-amber-600 text-xs font-mono bg-amber-50 rounded-lg py-2 px-4 inline-block">
                Click a slot to recruit specialized AI agents for your team
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Pixel Art Character Component
function PixelCharacter({
  style,
  size = 'medium',
  isManager = false,
  name,
  showCrown = false,
}: {
  style: { hair: string; skin: string; shirt: string; pants: string };
  size?: 'small' | 'medium' | 'large';
  isManager?: boolean;
  name?: string;
  showCrown?: boolean;
}) {
  const sizeClasses = {
    small: 'w-12 h-14',
    medium: 'w-16 h-20',
    large: 'w-24 h-28',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} relative`} style={{ imageRendering: 'pixelated' }}>
        <svg viewBox="0 0 16 20" className="w-full h-full">
          {/* Crown for manager */}
          {showCrown && (
            <>
              <rect x="5" y="0" width="6" height="2" fill="#F1C40F" />
              <rect x="4" y="1" width="1" height="2" fill="#F1C40F" />
              <rect x="7" y="0" width="2" height="1" fill="#F1C40F" />
              <rect x="11" y="1" width="1" height="2" fill="#F1C40F" />
            </>
          )}

          {/* Hair */}
          <rect x="4" y={showCrown ? "3" : "1"} width="8" height="3" fill={style.hair} />
          <rect x="3" y={showCrown ? "4" : "2"} width="1" height="2" fill={style.hair} />
          <rect x="12" y={showCrown ? "4" : "2"} width="1" height="2" fill={style.hair} />

          {/* Face */}
          <rect x="4" y={showCrown ? "5" : "3"} width="8" height="5" fill={style.skin} />
          <rect x="3" y={showCrown ? "6" : "4"} width="1" height="3" fill={style.skin} />
          <rect x="12" y={showCrown ? "6" : "4"} width="1" height="3" fill={style.skin} />

          {/* Eyes */}
          <rect x="5" y={showCrown ? "6" : "4"} width="2" height="2" fill="#2C1810" />
          <rect x="9" y={showCrown ? "6" : "4"} width="2" height="2" fill="#2C1810" />
          <rect x="5" y={showCrown ? "6" : "4"} width="1" height="1" fill="#FFFFFF" />
          <rect x="9" y={showCrown ? "6" : "4"} width="1" height="1" fill="#FFFFFF" />

          {/* Mouth */}
          <rect x="6" y={showCrown ? "8" : "6"} width="4" height="1" fill="#8B4513" />

          {/* Body/Shirt */}
          <rect x="3" y={showCrown ? "10" : "8"} width="10" height="5" fill={style.shirt} />
          <rect x="2" y={showCrown ? "11" : "9"} width="1" height="3" fill={style.shirt} />
          <rect x="13" y={showCrown ? "11" : "9"} width="1" height="3" fill={style.shirt} />

          {/* Arms */}
          <rect x="1" y={showCrown ? "11" : "9"} width="1" height="4" fill={style.skin} />
          <rect x="14" y={showCrown ? "11" : "9"} width="1" height="4" fill={style.skin} />

          {/* Pants */}
          <rect x="4" y={showCrown ? "15" : "13"} width="3" height="4" fill={style.pants} />
          <rect x="9" y={showCrown ? "15" : "13"} width="3" height="4" fill={style.pants} />

          {/* Feet */}
          <rect x="3" y={showCrown ? "19" : "17"} width="4" height="1" fill="#2C1810" />
          <rect x="9" y={showCrown ? "19" : "17"} width="4" height="1" fill="#2C1810" />
        </svg>
      </div>
      {name && (
        <span className="text-xs text-amber-800 mt-1 font-mono truncate max-w-20">
          {name.slice(0, 8)}
        </span>
      )}
    </div>
  );
}

// Agent Detail Panel
function AgentDetailPanel({
  agent,
  onDelete,
  characterStyle,
}: {
  agent: Agent;
  onDelete: () => void;
  characterStyle: { hair: string; skin: string; shirt: string; pants: string };
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <PixelCharacter style={characterStyle} size="medium" name={agent.name} />
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Name</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm">{agent.name}</div>
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Role</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm">{agent.role}</div>
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Goal</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm text-xs">{agent.goal}</div>
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">LLM Model</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm">{agent.llm_model}</div>
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Cost</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm">${agent.cost_per_token}/1k tokens</div>
        </div>
      </div>
    </div>
  );
}

// New Agent Form
function NewAgentForm({
  onSubmit,
  onCancel,
  characterStyle,
}: {
  onSubmit: (data: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'cost_per_token'>) => void;
  onCancel: () => void;
  characterStyle: { hair: string; skin: string; shirt: string; pants: string };
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [goal, setGoal] = useState('');
  const [backstory, setBackstory] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      role,
      goal,
      backstory,
      tools: [], // Tools will be configured in handoff spec
      llm_model: llmModel,
      is_manager: false,
      avatar_style: {
        hair_color: characterStyle.hair,
        clothing_color: characterStyle.shirt,
        skin_tone: characterStyle.skin,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-start justify-between mb-4">
        <PixelCharacter style={characterStyle} size="medium" name={name || '???'} />
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-amber-400 hover:bg-amber-50 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-sm focus:border-coral focus:outline-none"
            placeholder="e.g., CodeReviewer"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-sm focus:border-coral focus:outline-none"
            placeholder="e.g., Senior Engineer"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-sm focus:border-coral focus:outline-none resize-none"
            rows={2}
            placeholder="What does this agent specialize in?"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">LLM Model</label>
          <select
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono text-sm focus:border-coral focus:outline-none"
          >
            {LLM_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-amber-700 uppercase mb-1">Estimated Cost</label>
          <div className="px-3 py-2 bg-amber-50 rounded-lg font-mono text-sm text-amber-600">
            ${LLM_MODELS.find((m) => m.id === llmModel)?.cost_per_1k || 0.01}/1k tokens
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-4 bg-coral text-white py-3 rounded-lg font-bold font-mono tracking-wide hover:bg-coral/90 transition-all flex items-center justify-center gap-2"
      >
        Recruit Agent <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
