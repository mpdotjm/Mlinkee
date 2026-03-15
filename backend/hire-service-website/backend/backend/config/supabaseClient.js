import { createClient } from '@supabase/supabase-js'

// Set these in a .env file (recommended) or in your environment:
// SUPABASE_URL=https://<your-project>.supabase.co
// SUPABASE_ANON_KEY=<your-anon-key>
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
