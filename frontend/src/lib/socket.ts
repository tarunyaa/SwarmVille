import { io, Socket } from 'socket.io-client';
import { useSwarmVilleStore } from './store';
import type { AgentState, ApprovalRequest } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to SwarmVille server');
      this.reconnectAttempts = 0;
      // Request current agent states on connect
      this.socket?.emit('request_agent_states');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from SwarmVille server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
    });

    // Agent state updates
    this.socket.on('agent_states', (states: Record<string, AgentState>) => {
      const store = useSwarmVilleStore.getState();
      store.setAllAgentStates(states);
    });

    this.socket.on('agent_state_update', (data: { agent_id: string; state: AgentState }) => {
      const store = useSwarmVilleStore.getState();
      store.setAgentState(data.agent_id, data.state);
    });

    // Task progress updates
    this.socket.on('task_progress', (data: { task_id: string; progress: number; status: string }) => {
      const store = useSwarmVilleStore.getState();
      store.updateTask(data.task_id, {
        progress: data.progress,
        status: data.status as 'pending' | 'running' | 'paused' | 'completed' | 'failed',
      });
    });

    // Approval requests
    this.socket.on('approval_request', (approval: ApprovalRequest) => {
      const store = useSwarmVilleStore.getState();
      store.addApproval(approval);
    });

    this.socket.on('approval_resolved', (data: { id: string }) => {
      const store = useSwarmVilleStore.getState();
      store.removeApproval(data.id);
    });

    // Chat messages from agents
    this.socket.on('chat_message', (data: { agent_id: string; message: string }) => {
      console.log(`Agent ${data.agent_id}: ${data.message}`);
      // Update speech bubble in agent state
      const store = useSwarmVilleStore.getState();
      const currentState = store.agentStates[data.agent_id];
      if (currentState) {
        store.setAgentState(data.agent_id, {
          ...currentState,
          speech_bubble: { text: data.message },
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send chat message to agent
  sendChatMessage(agentId: string, message: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat_message', { agent_id: agentId, message });
    }
  }

  // Request agent states
  requestAgentStates() {
    if (this.socket?.connected) {
      this.socket.emit('request_agent_states');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const socketClient = new SocketClient();

// React hook for socket connection
import { useEffect, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketClient.connect();

    const checkConnection = setInterval(() => {
      setIsConnected(socketClient.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  return {
    isConnected,
    sendChatMessage: socketClient.sendChatMessage.bind(socketClient),
    requestAgentStates: socketClient.requestAgentStates.bind(socketClient),
  };
}
