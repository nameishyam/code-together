import { createClient } from "@supabase/supabase-js";
export const supabaseServer = createClient(
  process.env.NEXT_SUPABASE_PROJECT_URL!, 
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
);
