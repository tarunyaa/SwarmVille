const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Agent API
export const agentAPI = {
  list: () => fetchAPI<Agent[]>('/agents'),

  get: (id: string) => fetchAPI<Agent>(`/agents/${id}`),

  create: (data: CreateAgentRequest) =>
    fetchAPI<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateAgentRequest) =>
    fetchAPI<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/agents/${id}`, {
      method: 'DELETE',
    }),
};

// Workflow API
export const workflowAPI = {
  list: () => fetchAPI<Workflow[]>('/workflows'),

  get: (id: string) => fetchAPI<Workflow>(`/workflows/${id}`),

  create: (data: CreateWorkflowRequest) =>
    fetchAPI<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateWorkflowRequest) =>
    fetchAPI<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/workflows/${id}`, {
      method: 'DELETE',
    }),
};

// Task API
export const taskAPI = {
  list: () => fetchAPI<Task[]>('/tasks'),

  get: (id: string) => fetchAPI<Task>(`/tasks/${id}`),

  create: (data: CreateTaskRequest) =>
    fetchAPI<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  pause: (id: string) =>
    fetchAPI<Task>(`/tasks/${id}/pause`, {
      method: 'PUT',
    }),

  resume: (id: string) =>
    fetchAPI<Task>(`/tasks/${id}/resume`, {
      method: 'PUT',
    }),

  reassign: (id: string, newAgentId: string, transferContext: boolean) =>
    fetchAPI<Task>(`/tasks/${id}/reassign`, {
      method: 'PUT',
      body: JSON.stringify({ new_agent_id: newAgentId, transfer_context: transferContext }),
    }),
};

// Approval API
export const approvalAPI = {
  list: () => fetchAPI<ApprovalRequest[]>('/approvals'),

  approve: (id: string) =>
    fetchAPI<ApprovalRequest>(`/approvals/${id}/approve`, {
      method: 'PUT',
    }),

  deny: (id: string) =>
    fetchAPI<ApprovalRequest>(`/approvals/${id}/deny`, {
      method: 'PUT',
    }),
};

// Type definitions for API requests
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

interface CreateAgentRequest {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  llm_model: string;
  avatar_style: {
    hair_color: string;
    clothing_color: string;
    skin_tone: string;
  };
}

interface UpdateAgentRequest extends Partial<CreateAgentRequest> {}

interface Workflow {
  id: string;
  user_id: string;
  name: string;
  nodes: Array<{
    id: string;
    agent_id: string;
    position: { x: number; y: number };
    complexity_weight: number;
  }>;
  edges: Array<{
    id: string;
    source_node_id: string;
    target_node_id: string;
    handoff_config: {
      include_output: boolean;
      include_summary: boolean;
      include_flags: boolean;
      include_context: boolean;
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface CreateWorkflowRequest {
  name: string;
  nodes: Workflow['nodes'];
  edges: Workflow['edges'];
}

interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {}

interface Task {
  id: string;
  user_id: string;
  workflow_id: string;
  description: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  current_agent_id?: string;
  progress: number;
  total_cost: number;
  created_at: string;
  completed_at?: string;
}

interface CreateTaskRequest {
  workflow_id: string;
  description: string;
}

interface ApprovalRequest {
  id: string;
  task_id: string;
  subtask_id: string;
  agent_id: string;
  action: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  resolved_at?: string;
}
