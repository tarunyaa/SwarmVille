'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hexagon, Key, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [slackToken, setSlackToken] = useState('');

  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showSlack, setShowSlack] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving API keys...');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-800" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-amber-900 font-mono tracking-wide">Settings</h1>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-coral text-white px-4 py-2 rounded-lg font-mono font-bold flex items-center gap-2 hover:bg-coral/90 transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* API Keys Section */}
        <section className="bg-white rounded-xl border-2 border-amber-800 p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-coral" />
            <h2 className="text-lg font-mono font-bold text-amber-900">
              LLM API Keys
            </h2>
          </div>
          <p className="text-sm text-amber-600 font-mono mb-4">
            Enter your API keys to enable agent execution. Keys are stored securely.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">OpenAI API Key</label>
              <div className="relative">
                <input
                  type={showOpenai ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-coral"
                >
                  {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-500 font-mono mt-1">
                Required for GPT-4, GPT-4 Turbo, and GPT-3.5 models
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">Anthropic API Key</label>
              <div className="relative">
                <input
                  type={showAnthropic ? 'text' : 'password'}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none"
                  placeholder="sk-ant-..."
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-coral"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-500 font-mono mt-1">
                Required for Claude 3 Opus, Sonnet, and Haiku models
              </p>
            </div>
          </div>
        </section>

        {/* Tool Integrations Section */}
        <section className="bg-white rounded-xl border-2 border-amber-800 p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-mint" />
            <h2 className="text-lg font-mono font-bold text-amber-900">
              Tool Integrations
            </h2>
          </div>
          <p className="text-sm text-amber-600 font-mono mb-4">
            Connect external services for your agents to use.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">GitHub Personal Access Token</label>
              <div className="relative">
                <input
                  type={showGithub ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none"
                  placeholder="ghp_..."
                />
                <button
                  type="button"
                  onClick={() => setShowGithub(!showGithub)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-coral"
                >
                  {showGithub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-500 font-mono mt-1">
                For PR review, code analysis, and repository operations
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">Slack Bot Token</label>
              <div className="relative">
                <input
                  type={showSlack ? 'text' : 'password'}
                  value={slackToken}
                  onChange={(e) => setSlackToken(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none"
                  placeholder="xoxb-..."
                />
                <button
                  type="button"
                  onClick={() => setShowSlack(!showSlack)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-coral"
                >
                  {showSlack ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-500 font-mono mt-1">
                For sending messages and reading channels
              </p>
            </div>
          </div>
        </section>

        {/* Budget Section */}
        <section className="bg-white rounded-xl border-2 border-amber-800 p-6 shadow-lg mb-6">
          <h2 className="text-lg font-mono font-bold text-amber-900 mb-4">
            Budget Limits
          </h2>
          <div>
            <label className="block text-xs font-mono text-amber-700 mb-1 uppercase">Monthly Budget ($)</label>
            <input
              type="number"
              defaultValue={50}
              min={1}
              max={1000}
              className="w-32 px-3 py-2 border-2 border-amber-300 rounded-lg font-mono focus:border-coral focus:outline-none"
            />
            <p className="text-xs text-amber-500 font-mono mt-1">
              You'll get a warning when approaching this limit
            </p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl border-2 border-red-300 p-6 shadow-lg">
          <h2 className="text-lg font-mono font-bold text-red-500 mb-4">
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-amber-900">Delete All Data</p>
              <p className="text-sm text-amber-600 font-mono">
                Remove all agents, workflows, and tasks
              </p>
            </div>
            <button className="px-4 py-2 bg-red-50 text-red-500 rounded-lg font-mono font-bold hover:bg-red-100 transition-colors">
              Delete Everything
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
