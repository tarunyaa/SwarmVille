import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// For client components - returns a mock client if not configured
export const createSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    // Return a mock client for demo mode
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Demo mode - use demo login' } }),
        signUp: async () => ({ data: null, error: { message: 'Demo mode - use demo login' } }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as unknown as ReturnType<typeof createClientComponentClient>;
  }
  return createClientComponentClient();
};

// For server-side usage with explicit credentials - returns null if not configured
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// Type for database tables (we'll expand this as we build)
export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      workflows: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['workflows']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workflows']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          workflow_id: string;
          description: string;
          status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
          current_agent_id: string | null;
          progress: number;
          total_cost: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
    };
  };
};
