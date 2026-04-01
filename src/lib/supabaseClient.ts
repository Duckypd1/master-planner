import { createClient } from '@supabase/supabase-js';

// Placeholder credentials - In a real app, these would come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export type Project = {
  id: string;
  name: string;
  owner_id: string;
  shared_with?: string[];
};

export type UserStats = {
  user_id: string;
  coins: number;
  streak_days: number;
  streak_freezes: number;
};
