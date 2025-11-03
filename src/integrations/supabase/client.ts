import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axdmvtnpgdqawbixnegy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZG12dG5wZ2RxYXdiaXhuZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzI2MzEsImV4cCI6MjA3NzcwODYzMX0.uCIkO1kBPVbcLJETuhTEF7HZp_T8ck9ZxFAQfC3goOw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
