'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Hexagon,
  Users,
  Plus,
  Bell,
  Pause,
  Play,
  Settings,
  GitBranch,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { useSwarmVilleStore } from '@/lib/store';

// Dynamically import GameCanvas to avoid SSR issues with Phaser
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-amber-50">
      <div className="text-amber-700 font-mono">Loading office...</div>
    </div>
  ),
});

export default function DashboardPage() {
  const {
    agents,
    pendingApprovals,
    isPaused,
    setIsPaused,
    totalBudget,
    spentBudget,
    currentTask,
  } = useSwarmVilleStore();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Center - Quick Stats */}
          <div className="flex items-center gap-6">
            {/* Budget */}
            <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-lg">
              <DollarSign className="w-4 h-4 text-amber-800" />
              <span className="text-sm font-mono font-bold text-amber-800">
                ${spentBudget.toFixed(2)} / ${totalBudget}
              </span>
            </div>

            {/* Active Agents */}
            <div className="flex items-center gap-2 bg-mint/30 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-amber-800" />
              <span className="text-sm font-mono font-bold text-amber-800">
                {agents.length} Agents
              </span>
            </div>

            {/* Current Task Progress */}
            {currentTask && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral transition-all duration-300"
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-amber-700">
                  {currentTask.progress}%
                </span>
              </div>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Approvals */}
            <button className="relative p-2 hover:bg-amber-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-amber-800" />
              {pendingApprovals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs rounded-full flex items-center justify-center font-mono">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <Link
              href="/settings"
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-amber-800" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-amber-800 p-4 flex flex-col">
          {/* Team Builder Link */}
          <Link
            href="/team-builder"
            className="flex items-center gap-2 p-3 bg-coral/10 text-coral rounded-lg hover:bg-coral/20 transition-colors mb-4 font-mono font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Manage Team</span>
          </Link>

          {/* Workflow Builder Link */}
          <Link
            href="/workflow-builder"
            className="flex items-center gap-2 p-3 bg-mint/30 text-amber-800 rounded-lg hover:bg-mint/50 transition-colors mb-4 font-mono font-bold"
          >
            <GitBranch className="w-5 h-5" />
            <span>Edit Workflow</span>
          </Link>

          {/* Agent List */}
          <h3 className="text-sm font-mono font-bold text-amber-700 uppercase tracking-wide mb-2">
            Your Team
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {agents.length === 0 ? (
              <p className="text-sm text-amber-500 font-mono">
                No agents yet.{' '}
                <Link href="/team-builder" className="text-coral hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              agents.map((agent) => (
                <AgentListItem key={agent.id} agent={agent} />
              ))
            )}
          </div>
        </aside>

        {/* Office View */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Control Bar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-mono font-bold text-amber-900">
              Virtual Office
            </h2>
            <div className="flex items-center gap-2">
              {/* Pause/Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold transition-colors ${
                  isPaused
                    ? 'bg-mint text-white'
                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause All
                  </>
                )}
              </button>

              {/* New Task */}
              <Link
                href="/task-submission"
                className="bg-coral text-white px-4 py-2 rounded-lg font-mono font-bold flex items-center gap-2 hover:bg-coral/90 transition-colors shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Task
              </Link>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-amber-800 overflow-hidden">
            <GameCanvas />
          </div>
        </div>
      </main>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <NewTaskModal onClose={() => setIsNewTaskModalOpen(false)} />
      )}
    </div>
  );
}

function AgentListItem({ agent }: { agent: { id: string; name: string; role: string; avatar_style: { clothing_color: string }; is_manager?: boolean } }) {
  const { selectedAgentId, setSelectedAgentId } = useSwarmVilleStore();
  const isSelected = selectedAgentId === agent.id;

  return (
    <button
      onClick={() => setSelectedAgentId(isSelected ? null : agent.id)}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
        isSelected ? 'bg-coral/10 border border-coral' : 'hover:bg-amber-100 border border-transparent'
      }`}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs font-mono"
        style={{ backgroundColor: agent.avatar_style.clothing_color }}
      >
        {agent.is_manager ? '👑' : agent.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-bold text-amber-900 truncate">
          {agent.name}
        </p>
        <p className="text-xs font-mono text-amber-600 truncate">{agent.role}</p>
      </div>
    </button>
  );
}

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Creating task:', description);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border-4 border-amber-800">
        <h2 className="text-xl font-mono font-bold text-amber-900 mb-4">New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-mono text-amber-700 mb-1 uppercase">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none resize-none"
              rows={4}
              placeholder="Describe what you want your agents to do..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg font-mono font-bold hover:bg-amber-300 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-coral text-white rounded-lg font-mono font-bold hover:bg-coral/90 transition-colors">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
