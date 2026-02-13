import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    // We don't throw an error here to prevent build failures if envs are missing during build time
    console.warn('Missing Supabase environment variables')
}

// Safe initialization
const internalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const internalSupabaseKey = supabaseKey || 'placeholder';

export const supabase = createClient(
    internalSupabaseUrl,
    internalSupabaseKey
);
