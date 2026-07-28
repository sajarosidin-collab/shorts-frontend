import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Job = {
  id: string;
  youtube_url: string;
  status: 'pending' | 'downloading' | 'processing' | 'done' | 'failed';
  error_message: string | null;
  video_title: string | null;
  video_duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};

export type Clip = {
  id: string;
  job_id: string;
  clip_index: number;
  start_seconds: number;
  end_seconds: number;
  title: string | null;
  caption: string | null;
  video_url: string | null;
  subtitle_url: string | null;
  status: 'pending' | 'ready' | 'failed';
  created_at: string;
};
