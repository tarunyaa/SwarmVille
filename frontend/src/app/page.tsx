'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Hexagon } from 'lucide-react';

// Dynamically import GameCanvas for empty office view
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-amber-50">
      <div className="text-amber-700 font-mono">Loading office...</div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-amber-900 font-mono tracking-wide">SwarmVille</h1>
        </div>
      </header>

      {/* Main Content - Empty Office View */}
      <main className="flex-1 flex flex-col">
        {/* Tagline */}
        <div className="text-center py-6 bg-amber-50 border-b-2 border-amber-200">
          <p className="text-lg text-amber-800 font-mono tracking-wider font-bold">
            The Control Plane for AI Agent Labor
          </p>
        </div>

        {/* Empty Virtual Office */}
        <div className="flex-1 relative">
          <GameCanvas isEmpty />

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center border-4 border-amber-800">
              <div className="w-16 h-16 bg-coral rounded-xl flex items-center justify-center mx-auto mb-4">
                <Hexagon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 font-mono mb-2">
                Your Office Awaits
              </h2>
              <p className="text-amber-700 mb-6 max-w-sm">
                Create your team of AI agents and watch them work in real-time
              </p>
              <Link
                href="/team-builder"
                className="inline-block bg-coral text-white px-8 py-3 rounded-lg font-bold font-mono tracking-wide hover:bg-coral/90 transition-all shadow-lg"
              >
                Populate
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
