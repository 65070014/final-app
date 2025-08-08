import { createClient } from '@/utils/supabase/server';

export default async function Education() {
  const supabase = await createClient();
  const { data: education } = await supabase.from("education").select();

  return <pre>{JSON.stringify(education, null, 2)}</pre>
}