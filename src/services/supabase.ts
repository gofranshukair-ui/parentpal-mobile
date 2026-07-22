import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

export interface SupabaseNotificationRow {
  title: string;
  body: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

const expoExtra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra) as {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
} | undefined;

const supabaseUrl = expoExtra?.SUPABASE_URL?.toString().trim() ?? 'https://your-project-ref.supabase.co';
const supabaseAnonKey = expoExtra?.SUPABASE_ANON_KEY?.toString().trim() ?? 'your-supabase-anon-key';

if (!expoExtra) {
  console.warn('Expo constants extra config is undefined. Confirm app.json expo.extra is present and bundled into this build.');
}

if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  console.warn('Supabase URL is not configured. Update app.json expo.extra.SUPABASE_URL with your project URL.');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key')) {
  console.warn('Supabase anon key is not configured. Update app.json expo.extra.SUPABASE_ANON_KEY with your anon key.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export async function fetchDailyNotificationFromSupabase(): Promise<SupabaseNotificationRow> {
  const { data, error } = await supabase
    .from('daily_notifications')
    .select('title,body,hour,minute,enabled')
    .eq('enabled', true)
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No active daily notification found in Supabase.');
  }

  return data;
}

/*
  Supabase data model recommendation:
  Table name: daily_notifications
  Columns:
  - id: bigint (primary key)
  - title: text
  - body: text
  - hour: integer
  - minute: integer
  - enabled: boolean
  This table can be edited by another person through the Supabase dashboard.
*/