# SwarmVille Product Specification

## Product Vision
SwarmVille is "Kubernetes + Workday for AI labor" - a visual, game-like interface where humans supervise teams of AI agents collaborating on complex tasks.

---

## Core Concepts

### Agents
AI workers with specialized roles, each powered by an LLM (GPT-4, Claude, etc.)

| Property | Description |
|----------|-------------|
| Name | Unique identifier (e.g., "CodeReviewer") |
| Role | Job title (e.g., "Senior Engineer") |
| Goal | What this agent specializes in |
| LLM Model | GPT-4, Claude 3, etc. |
| Tools | Capabilities (GitHub, Slack, Jira, etc.) |
| Cost | Per-token pricing based on model |

### Manager Agent
Special agent that orchestrates the team:
- Receives high-level tasks from humans
- Decomposes into subtasks
- Assigns subtasks to specialists
- Monitors progress and handles handoffs

### Workflows
Directed graphs defining how agents collaborate:
- Nodes = Agents
- Edges = Handoff paths
- Configurable handoff data (output, summary, flags, context)

### Tasks
Work items submitted by humans:
- Description of desired outcome
- Priority level (low, medium, high)
- Progress tracking (0-100%)
- Cost accumulation
- Subtask breakdown

---

## User Interface

### Landing Page (`/`)
- Empty virtual office visualization
- Tagline: "The Control Plane for AI Agent Labor"
- CTA: "Populate" button to start team building

### Team Builder (`/team-builder`)
**Purpose:** Create and configure AI agent team

**Features:**
- Team name and role/purpose
- Approval guardrail settings (all, high-risk, none)
- Quick Start Templates
- 8 specialist slots + 1 manager
- Per-agent: name, role, goal, LLM model, cost display

### Handoff Spec (`/handoff-spec`)
**Purpose:** Define agent hierarchy and configure tools

**Features:**
- Node-graph canvas with draggable agents
- Connection system (click bottom connector → click top connector)
- Arrow visualization for hierarchy
- Per-agent tool selection (GitHub, Slack, Jira, etc.)
- API key configuration

### Task Submission (`/task-submission`)
**Purpose:** Submit work to the AI team

**Features:**
- Task description textarea
- Priority selector (low, medium, high)
- Quick task templates
- Team roster preview
- "Deploy Team & Start Task" action

### Dashboard (`/dashboard`)
**Purpose:** Monitor agents working in real-time

**Features:**
- Virtual office with agents at workstations
- Sidebar with team list
- Task progress bar
- Budget/cost display
- Pause/Resume controls
- New Task button

---

## Visual Design

### Aesthetic
- 16-bit JRPG / pixel art office simulator
- Warm color palette (cream, coral, mint, amber)
- Monospace font for retro feel
- Colorful character sprites with distinct clothing

### Virtual Office Layout
```
+------------------+------------------+------------------+
|                  |    MANAGER       |                  |
|    WORKSTATIONS  |    OFFICE        |    BREAK ROOM    |
|    (8 desks)     |                  |                  |
|                  +------------------+                  |
|                  |                  |                  |
|                  |    CARPET AREA   |   MEETING ROOM   |
|                  |                  |                  |
+------------------+------------------+------------------+
```

### Agent Visual States
| State | Visual |
|-------|--------|
| Idle | Standing at desk |
| Working | Typing animation, screen glow |
| Communicating | Speech bubble |
| Waiting Approval | Yellow highlight |
| Error | Red highlight |

---

## Data Models

### Agent
```typescript
interface Agent {
  id: string;
  user_id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  llm_model: string;
  cost_per_token: number;
  is_manager: boolean;
  avatar_style: {
    hair_color: string;
    clothing_color: string;
    skin_tone: string;
  };
  created_at: string;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  user_id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

interface WorkflowNode {
  id: string;
  agent_id: string;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  handoff_config: HandoffConfig;
}
```

### Task
```typescript
interface Task {
  id: string;
  user_id: string;
  workflow_id: string;
  description: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  total_cost: number;
  created_at: string;
  completed_at?: string;
  subtasks: Subtask[];
}
```

### Handoff Protocol
```typescript
interface Handoff {
  from_agent_id: string;
  to_agent_id: string;
  output: {
    artifact: string;
    artifact_type: 'code' | 'analysis' | 'ticket_response';
    artifact_location?: string;
  };
  summary: string;
  flags: { type: 'warning' | 'error' | 'info'; message: string }[];
  context: {
    original_task: string;
    parent_task_id: string;
  };
  metadata: {
    cost_incurred: number;
    execution_time_seconds: number;
    tools_used: string[];
  };
}
```

---

## API Endpoints

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agents | List all agents |
| POST | /api/agents | Create agent |
| GET | /api/agents/:id | Get agent details |
| PUT | /api/agents/:id | Update agent |
| DELETE | /api/agents/:id | Delete agent |

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workflows | List workflows |
| POST | /api/workflows | Create workflow |
| GET | /api/workflows/:id | Get workflow |
| PUT | /api/workflows/:id | Update workflow |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tasks | Submit new task |
| GET | /api/tasks/:id | Get task status |
| POST | /api/tasks/:id/pause | Pause task |
| POST | /api/tasks/:id/resume | Resume task |
| POST | /api/tasks/:id/cancel | Cancel task |

### Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/approvals | List pending approvals |
| POST | /api/approvals/:id/approve | Approve action |
| POST | /api/approvals/:id/deny | Deny action |

---

## Available Tools

| Tool | Description | Required API Key |
|------|-------------|------------------|
| GitHub | Repository access, PR management | GitHub PAT |
| Slack | Send messages, read channels | Slack Bot Token |
| Jira | Issue tracking, ticket management | Jira API Token |
| Code Linter | Analyze code quality | None (local) |
| Security Scanner | Check for vulnerabilities | None (local) |
| Google Docs | Document creation/editing | Google Service Account |
| Web Search | Internet research | None (mock) |

---

## LLM Models

| Model | Provider | Cost per 1K tokens |
|-------|----------|-------------------|
| GPT-4 | OpenAI | $0.03 |
| GPT-4 Turbo | OpenAI | $0.01 |
| GPT-3.5 Turbo | OpenAI | $0.0005 |
| Claude 3 Opus | Anthropic | $0.015 |
| Claude 3 Sonnet | Anthropic | $0.003 |
| Claude 3 Haiku | Anthropic | $0.00025 |

---

## Security Considerations

- API keys stored in browser localStorage (client-side only)
- Keys never transmitted to SwarmVille servers
- Each agent uses keys when executing tasks
- Approval guardrails for sensitive operations
- Audit logging of all agent actions
