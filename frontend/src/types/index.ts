// User types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  api_keys?: {
    openai?: string;
    anthropic?: string;
    github?: string;
    slack?: string;
    jira?: string;
  };
}

// Agent types
export interface Agent {
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
  avatar_style: AvatarStyle;
  created_at: string;
}

export interface AvatarStyle {
  hair_color: string;
  clothing_color: string;
  skin_tone: string;
}

// Workflow types
export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  agent_id: string;
  position: { x: number; y: number };
  complexity_weight: number;
}

export interface WorkflowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  handoff_config: HandoffConfig;
}

export interface HandoffConfig {
  include_output: boolean;
  include_summary: boolean;
  include_flags: boolean;
  include_context: boolean;
}

// Task types
export interface Task {
  id: string;
  user_id: string;
  workflow_id: string;
  description: string;
  status: TaskStatus;
  current_agent_id?: string;
  progress: number;
  total_cost: number;
  created_at: string;
  completed_at?: string;
  subtasks: Subtask[];
}

export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

export interface Subtask {
  id: string;
  task_id: string;
  agent_id: string;
  description: string;
  status: SubtaskStatus;
  output?: string;
  cost_incurred: number;
  started_at?: string;
  completed_at?: string;
}

export type SubtaskStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed';

// Approval types
export interface ApprovalRequest {
  id: string;
  task_id: string;
  subtask_id: string;
  agent_id: string;
  action: string;
  reason: string;
  status: ApprovalStatus;
  created_at: string;
  resolved_at?: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'denied';

// Audit log types
export interface AuditLog {
  id: string;
  user_id: string;
  task_id?: string;
  agent_id?: string;
  event_type: AuditEventType;
  details: Record<string, unknown>;
  timestamp: string;
}

export type AuditEventType =
  | 'task_created'
  | 'task_assigned'
  | 'agent_completed'
  | 'approval_requested'
  | 'approval_granted'
  | 'error'
  | 'human_intervention'
  | 'workflow_modified';

// Real-time agent state (for game visualization)
export interface AgentState {
  agent_id: string;
  status: AgentVisualStatus;
  current_location: { x: number; y: number };
  target_location?: { x: number; y: number };
  current_action?: string;
  current_subtask_id?: string;
  speech_bubble?: {
    text: string;
    target_agent_id?: string;
  };
  last_updated: string;
}

export type AgentVisualStatus = 'idle' | 'working' | 'waiting_approval' | 'communicating' | 'error';

// Handoff protocol
export interface Handoff {
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

// Available tools
export const AVAILABLE_TOOLS = [
  { id: 'github', name: 'GitHub', description: 'Repository access, PR management' },
  { id: 'slack', name: 'Slack', description: 'Send messages, read channels' },
  { id: 'jira', name: 'Jira', description: 'Issue tracking, ticket management' },
  { id: 'code_linter', name: 'Code Linter', description: 'Analyze code quality' },
  { id: 'security_scanner', name: 'Security Scanner', description: 'Check for vulnerabilities' },
] as const;

// Available LLM models
export const LLM_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', cost_per_1k: 0.03 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', cost_per_1k: 0.01 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', cost_per_1k: 0.0005 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', cost_per_1k: 0.015 },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic', cost_per_1k: 0.003 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', cost_per_1k: 0.00025 },
] as const;

// Color options for avatars
export const AVATAR_COLORS = {
  hair: ['#2C1810', '#8B4513', '#DAA520', '#FF6B35', '#9932CC', '#1E90FF', '#FF69B4'],
  clothing: ['#4169E1', '#32CD32', '#FF6347', '#9370DB', '#20B2AA', '#FF8C00', '#778899'],
  skin: ['#FFDAB9', '#DEB887', '#D2691E', '#8B4513', '#F5DEB3', '#FFE4C4'],
};
