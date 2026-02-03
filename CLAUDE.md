# CLAUDE.md - SwarmVille Project Guidelines

## Project Overview
SwarmVille is a visual interface for managing AI agent teams - "Kubernetes + Workday for AI labor." Built with Next.js 14, FastAPI, Phaser.js, and TypeScript.

---

## Quick Start

```bash
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 8000)
cd backend && source venv/Scripts/activate && uvicorn main:app --reload
```

---

## Project Structure

```
swarmville/
├── frontend/           # Next.js 14 app
│   └── src/
│       ├── app/        # Pages (App Router)
│       ├── components/ # React components
│       ├── lib/        # Utilities (store, api, supabase)
│       └── types/      # TypeScript types
├── backend/            # FastAPI server
│   └── app/
│       ├── models/     # Pydantic models
│       ├── routes/     # API endpoints
│       └── services/   # Business logic
├── plan.md             # Implementation roadmap
├── spec.md             # Product specification
└── todo.md             # Task checklist
```

---

## Code Style Guidelines

### Naming Conventions
- Use "team" not "squad" throughout the codebase
- Pages use kebab-case: `team-builder`, `handoff-spec`, `task-submission`
- Components use PascalCase: `GameCanvas`, `AgentNode`
- Functions use camelCase: `handleCreateAgent`, `toggleShowKey`

### UI Consistency
- Header: white bg, `border-b-4 border-amber-800`
- Logo: coral rounded-lg with Hexagon icon + "SwarmVille" text
- Cards: `bg-white rounded-xl border-2 border-amber-800 shadow-lg`
- Buttons: `bg-coral text-white rounded-lg font-mono font-bold`
- Font: `font-mono` for retro pixel aesthetic
- Labels: `text-xs font-mono text-amber-700 uppercase`

### Color Palette
- cream: #FFF8E7
- coral: #FF6B6B
- mint: #4ECDC4
- amber-800: primary text
- amber-300: borders, accents

---

## Common Patterns

### Page Structure
```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-800 px-6 py-4">
        {/* Logo + Navigation */}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  );
}
```

### State Management (Zustand)
```tsx
import { useSwarmVilleStore } from '@/lib/store';

const { agents, addAgent, updateAgent, removeAgent } = useSwarmVilleStore();
```

### Agent Form Data
```tsx
// Tools are configured in handoff-spec, not team-builder
onSubmit({
  name,
  role,
  goal,
  backstory,
  tools: [], // Configured later in handoff-spec
  llm_model: llmModel,
  is_manager: false,
  avatar_style: { hair_color, clothing_color, skin_tone },
});
```

---

## Lessons Learned / Corrections

### 1. Terminology
- **WRONG:** "squad", "Squad Builder", "SQUAD_ARCHITECT"
- **RIGHT:** "team", "Team Builder"

### 2. Team Builder Page
- **WRONG:** Tools selection in agent recruitment form
- **RIGHT:** LLM Model + Cost display; tools configured in Handoff Spec

### 3. Landing Page Text
- Tagline: "The Control Plane for AI Agent Labor" (bold)
- Description: "Create your team of AI agents and watch them work in real-time"
- Button: "Populate" (not "Populate Office")

### 4. Node.js Process Management
- **WRONG:** Starting multiple dev servers without cleanup
- **RIGHT:** Kill existing processes before starting new server
  ```bash
  taskkill //F //IM node.exe  # Windows
  pkill -f node              # Unix
  ```

### 5. Handoff Spec Page
- **WRONG:** Simple list view of agents with tools
- **RIGHT:** Node-graph editor with:
  - Draggable agent nodes
  - Connection system for hierarchy arrows
  - Tools selection per selected agent
  - API keys configuration

### 6. Port Management
- Frontend default: port 3000
- Backend default: port 8000
- If port in use, specify different port: `npm run dev -- -p 3001`

---

## API Keys Configuration

Stored in browser localStorage (never sent to server):
- OpenAI: `sk-...`
- Anthropic: `sk-ant-...`
- GitHub: `ghp_...`
- Slack: `xoxb-...`

---

## File Locations

| Feature | File |
|---------|------|
| Landing page | `frontend/src/app/page.tsx` |
| Team builder | `frontend/src/app/team-builder/page.tsx` |
| Handoff spec | `frontend/src/app/handoff-spec/page.tsx` |
| Task submission | `frontend/src/app/task-submission/page.tsx` |
| Dashboard | `frontend/src/app/dashboard/page.tsx` |
| Game canvas | `frontend/src/components/GameCanvas.tsx` |
| State store | `frontend/src/lib/store.ts` |
| Types | `frontend/src/types/index.ts` |

---

## Do NOT

- Use "squad" anywhere in the UI
- Add tools selection to team-builder (it's in handoff-spec)
- Start multiple dev servers without cleanup
- Use non-monospace fonts in the UI
- Create new files when editing existing ones will do
- Add emojis unless explicitly requested
