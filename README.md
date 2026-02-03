# SwarmVille

**Control Plane for AI Agent Labor** - Run AI workers like real teams in a visual, game-like interface.

![SwarmVille](docs/preview.png)

## Overview

SwarmVille is a real-time control plane where humans supervise, reassign, and govern fleets of AI workers doing production work. Think: **Kubernetes + Workday for AI labor**.

### Key Features

- **Squad Composition**: Create AI agents with unique roles, goals, and tools
- **Visual Office**: Pixel-art office view showing agents working in real-time
- **Workflow Builder**: Node-based graph editor to define agent hierarchies
- **Manager Agent**: Auto-created orchestrator that breaks down tasks
- **Approval Workflows**: Agents request permission before risky actions
- **Real-Time Updates**: WebSocket-powered live status updates

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Phaser.js** for pixel-art game visualization
- **Zustand** for state management
- **Socket.io** for real-time updates

### Backend
- **Python FastAPI**
- **LangChain** for agent orchestration
- **Socket.io** for WebSocket support
- **Supabase** (PostgreSQL + Auth)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd swarmville
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Get your project URL and keys from Settings > API

### 3. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and fill in your values
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
uvicorn main:socket_app --reload --host 0.0.0.0 --port 8000
```

### 4. Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

### 5. Open SwarmVille

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
swarmville/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── login/               # Auth pages
│   │   │   ├── dashboard/           # Main office view
│   │   │   ├── squad-builder/       # Agent creation
│   │   │   └── workflow-builder/    # Workflow editor
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and stores
│   │   ├── types/           # TypeScript types
│   │   └── game/            # Phaser.js game code
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── models/          # Pydantic models
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   │       ├── manager_agent.py     # Manager orchestration
│   │       ├── agent_executor.py    # Agent execution
│   │       ├── orchestrator.py      # Task orchestration
│   │       └── mock_tools.py        # Simulated tools
│   ├── main.py              # FastAPI app entry
│   └── requirements.txt
│
├── supabase/
│   └── schema.sql           # Database schema
│
└── README.md
```

## Usage

### Creating Your Squad

1. Navigate to **Squad Builder** from the dashboard
2. Click **Add Agent** to create a specialist
3. Configure:
   - Name and role
   - Goal and backstory
   - Tools (GitHub, Slack, Jira, etc.)
   - LLM model
   - Avatar colors
4. A Manager Agent is automatically created when you add your first specialist

### Building a Workflow

1. Navigate to **Workflow Builder**
2. Add agents from the sidebar
3. Drag to position them on the canvas
4. Click connection dots to link agents (defines handoff order)
5. Save and deploy

### Running Tasks

1. From the Dashboard, click **New Task**
2. Enter a high-level description (e.g., "Review and merge PR #234")
3. Watch agents work in the pixel-art office:
   - **At desk**: Working on subtask
   - **Walking to another desk**: Handing off work
   - **Walking to you**: Requesting approval
4. Approve or deny agent requests as they arise

### Management Controls

- **Pause All**: Stop all agent work temporarily
- **Click Agent**: Open chat to redirect their work
- **Drag Task Badge**: Reassign work to different agent

## API Endpoints

### Agents
- `GET /agents` - List all agents
- `POST /agents` - Create new agent
- `GET /agents/{id}` - Get agent details
- `PUT /agents/{id}` - Update agent
- `DELETE /agents/{id}` - Delete agent

### Workflows
- `GET /workflows` - List all workflows
- `POST /workflows` - Create workflow
- `GET /workflows/{id}` - Get workflow details
- `PUT /workflows/{id}` - Update workflow
- `DELETE /workflows/{id}` - Delete workflow

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create and start task
- `PUT /tasks/{id}/pause` - Pause task
- `PUT /tasks/{id}/resume` - Resume task
- `PUT /tasks/{id}/reassign` - Reassign current subtask

### Approvals
- `GET /approvals` - List pending approvals
- `PUT /approvals/{id}/approve` - Approve request
- `PUT /approvals/{id}/deny` - Deny request

### WebSocket Events
- `agent_states` - All agent current states
- `agent_state_update` - Single agent state change
- `task_progress` - Task progress update
- `approval_request` - New approval needed
- `chat_message` - Agent speech

## Color Palette

SwarmVille uses a warm, pastel color scheme inspired by cozy games:

- **Peach**: `#FFD4B2`
- **Cream**: `#FFF8E7`
- **Warm Brown**: `#D4A574`
- **Warm Gray**: `#C9B8A8`
- **Coral** (accent): `#FF9B85`
- **Mint** (success): `#B5E8D3`

## Development

### Running Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```

### Building for Production

```bash
# Frontend
cd frontend && npm run build

# Backend is deployment-ready with uvicorn
```

## Roadmap

### Phase 1-3 (MVP) - Complete
- [x] Project scaffolding
- [x] Agent CRUD
- [x] Visual office with Phaser.js
- [x] Workflow builder
- [x] Manager Agent orchestration
- [x] Mock tool execution

### Phase 4-7 (Post-MVP)
- [ ] Approval workflows with guardrails
- [ ] Task reassignment UI
- [ ] Agent chat interface
- [ ] Pause/Resume controls
- [ ] Cost tracking dashboard
- [ ] Audit logs view
- [ ] Workflow templates
- [ ] Onboarding flow

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
