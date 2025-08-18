import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types';

export type TypedSupabaseClient = SupabaseClient<Database>;