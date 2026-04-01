import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://oppsgmrrevopldozgtkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcHNnbXJyZXZvcGxkb3pndGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTU0NDgsImV4cCI6MjA5MDUzMTQ0OH0.PHvwF3ALBAAvXTjnzpPi0zY0jPOWSCB2TeVcy0CrRcQ';

export function createClient() {
  return createSupabaseBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = createClient();
