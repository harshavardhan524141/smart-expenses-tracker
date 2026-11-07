import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isConfigured: Boolean(
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  )
};
