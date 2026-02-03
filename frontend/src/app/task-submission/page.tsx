'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Hexagon, Send, CheckCircle, Clock, Target, AlertTriangle } from 'lucide-react';
import { useSwarmVilleStore } from '@/lib/store';

// Character styles for mini avatars
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

// Sample task templates
const TASK_TEMPLATES = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review a pull request or code changes',
    placeholder: 'Review the latest PR for the authentication module. Check for security issues, code quality, and test coverage.',
  },
  {
    id: 'research',
    name: 'Research Task',
    description: 'Investigate a topic and compile findings',
    placeholder: 'Research best practices for implementing rate limiting in a Node.js API. Compile findings into a summary document.',
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Write documentation, articles, or copy',
    placeholder: 'Write a technical blog post about our new feature launch. Include code examples and screenshots.',
  },
  {
    id: 'bug-fix',
    name: 'Bug Investigation',
    description: 'Investigate and propose fixes for bugs',
    placeholder: 'Investigate the login timeout issue reported in JIRA-1234. Identify root cause and propose a fix.',
  },
];

export default function TaskSubmissionPage() {
  const router = useRouter();
  const { agents, setCurrentTask, addTask } = useSwarmVilleStore();
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const managerAgent = agents.find((a) => a.is_manager);
  const specialistAgents = agents.filter((a) => !a.is_manager);

  const handleTemplateClick = (template: typeof TASK_TEMPLATES[0]) => {
    setTaskDescription(template.placeholder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;

    setIsSubmitting(true);

    // Create task
    const newTask = {
      id: `task_${Date.now()}`,
      user_id: 'demo_user',
      workflow_id: 'default',
      description: taskDescription,
      status: 'pending' as const,
      progress: 0,
      created_at: new Date().toISOString(),
      total_cost: 0,
      subtasks: [],
    };

    addTask(newTask);
    setCurrentTask(newTask);

    // Simulate brief loading
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/handoff-spec" className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-amber-800" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-amber-900 font-mono tracking-wide">SwarmVille</h1>
            </div>
          </div>
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
            <div className="w-12 h-0.5 bg-green-500"></div>
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Handoff Spec</span>
            </div>
            <div className="w-12 h-0.5 bg-coral"></div>
            <div className="flex items-center gap-2 text-coral">
              <div className="w-6 h-6 bg-coral text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="font-bold">Task Submission</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Left Panel - Team Overview */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Team Ready Card */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-mono font-bold text-amber-900">Team Ready</span>
            </div>

            {/* Mini Team Display */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {/* Manager */}
              {managerAgent && (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-12 relative" style={{ imageRendering: 'pixelated' }}>
                    <svg viewBox="0 0 16 20" className="w-full h-full">
                      <rect x="5" y="0" width="6" height="2" fill="#F1C40F" />
                      <rect x="4" y="3" width="8" height="3" fill={MANAGER_STYLE.hair} />
                      <rect x="4" y="5" width="8" height="5" fill={MANAGER_STYLE.skin} />
                      <rect x="3" y="10" width="10" height="5" fill={MANAGER_STYLE.shirt} />
                      <rect x="4" y="15" width="3" height="4" fill={MANAGER_STYLE.pants} />
                      <rect x="9" y="15" width="3" height="4" fill={MANAGER_STYLE.pants} />
                    </svg>
                  </div>
                  <span className="text-[8px] font-mono text-amber-700 truncate w-10 text-center">{managerAgent.name}</span>
                </div>
              )}
              {/* Specialists */}
              {specialistAgents.map((agent, index) => {
                const style = CHARACTER_STYLES[index % CHARACTER_STYLES.length];
                return (
                  <div key={agent.id} className="flex flex-col items-center">
                    <div className="w-10 h-12" style={{ imageRendering: 'pixelated' }}>
                      <svg viewBox="0 0 16 20" className="w-full h-full">
                        <rect x="4" y="1" width="8" height="3" fill={style.hair} />
                        <rect x="4" y="3" width="8" height="5" fill={style.skin} />
                        <rect x="3" y="8" width="10" height="5" fill={style.shirt} />
                        <rect x="4" y="13" width="3" height="4" fill={style.pants} />
                        <rect x="9" y="13" width="3" height="4" fill={style.pants} />
                      </svg>
                    </div>
                    <span className="text-[8px] font-mono text-amber-700 truncate w-10 text-center">{agent.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-sm text-amber-600 font-mono">
              {agents.length} agents ready to work
            </div>
          </div>

          {/* Task Templates */}
          <div className="bg-white rounded-xl border-2 border-amber-800 p-4 shadow-lg">
            <span className="font-mono font-bold text-amber-900 block mb-3">Quick Templates</span>
            <div className="space-y-2">
              {TASK_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all border border-transparent hover:border-coral"
                >
                  <p className="font-mono text-sm font-bold text-amber-900">{template.name}</p>
                  <p className="text-xs text-amber-600">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Task Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-amber-800 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-coral" />
              <h2 className="font-mono font-bold text-amber-900 text-xl">Submit Task</h2>
            </div>

            <div className="space-y-6">
              {/* Task Description */}
              <div>
                <label className="block text-sm font-mono text-amber-700 mb-2 uppercase">
                  Task Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg font-mono text-amber-900 focus:border-coral focus:outline-none resize-none"
                  rows={6}
                  placeholder="Describe what you want your AI team to accomplish..."
                  required
                />
                <p className="mt-1 text-xs text-amber-500 font-mono">
                  Be specific about deliverables and success criteria
                </p>
              </div>

              {/* Priority & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-amber-700 mb-2 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Priority
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-lg font-mono text-sm font-bold transition-all ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-red-500 text-white'
                              : p === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono text-amber-700 mb-2 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Est. Time (min)
                  </label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg font-mono text-amber-900 focus:border-coral focus:outline-none"
                    min="5"
                    max="480"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !taskDescription.trim()}
                className="w-full bg-coral text-white py-4 rounded-lg font-bold font-mono tracking-wide hover:bg-coral/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deploying Team...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Deploy Team & Start Task
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Card */}
          <div className="mt-4 p-4 bg-mint/10 rounded-xl border-2 border-mint/30">
            <p className="text-mint font-mono text-sm">
              <strong>What happens next:</strong> Your task will be assigned to the manager agent, who will break it down into subtasks and delegate to specialist agents. You can monitor progress in real-time from the virtual office view.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
