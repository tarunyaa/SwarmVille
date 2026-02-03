import { create } from 'zustand';
import type { Agent, Workflow, Task, AgentState, ApprovalRequest } from '@/types';

interface SwarmVilleStore {
  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;

  // Workflows
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;

  // Tasks
  tasks: Task[];
  currentTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Real-time agent states (for game visualization)
  agentStates: Record<string, AgentState>;
  setAgentState: (agentId: string, state: AgentState) => void;
  setAllAgentStates: (states: Record<string, AgentState>) => void;

  // Approvals
  pendingApprovals: ApprovalRequest[];
  setPendingApprovals: (approvals: ApprovalRequest[]) => void;
  addApproval: (approval: ApprovalRequest) => void;
  removeApproval: (id: string) => void;

  // UI State
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;

  // Budget
  totalBudget: number;
  spentBudget: number;
  setTotalBudget: (budget: number) => void;
  setSpentBudget: (spent: number) => void;
}

export const useSwarmVilleStore = create<SwarmVilleStore>((set) => ({
  // Agents
  agents: [],
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    })),

  // Workflows
  workflows: [],
  currentWorkflow: null,
  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  addWorkflow: (workflow) =>
    set((state) => ({ workflows: [...state.workflows, workflow] })),
  updateWorkflow: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
      currentWorkflow:
        state.currentWorkflow?.id === id
          ? { ...state.currentWorkflow, ...updates }
          : state.currentWorkflow,
    })),

  // Tasks
  tasks: [],
  currentTask: null,
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (task) => set({ currentTask: task }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTask:
        state.currentTask?.id === id
          ? { ...state.currentTask, ...updates }
          : state.currentTask,
    })),

  // Real-time agent states
  agentStates: {},
  setAgentState: (agentId, state) =>
    set((s) => ({
      agentStates: { ...s.agentStates, [agentId]: state },
    })),
  setAllAgentStates: (states) => set({ agentStates: states }),

  // Approvals
  pendingApprovals: [],
  setPendingApprovals: (approvals) => set({ pendingApprovals: approvals }),
  addApproval: (approval) =>
    set((state) => ({
      pendingApprovals: [...state.pendingApprovals, approval],
    })),
  removeApproval: (id) =>
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
    })),

  // UI State
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  isChatOpen: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  isPaused: false,
  setIsPaused: (paused) => set({ isPaused: paused }),

  // Budget
  totalBudget: 50,
  spentBudget: 0,
  setTotalBudget: (budget) => set({ totalBudget: budget }),
  setSpentBudget: (spent) => set({ spentBudget: spent }),
}));
