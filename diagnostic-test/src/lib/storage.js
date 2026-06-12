import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
const localKey = 'ai-for-psi-local-responses';

function readLocalResponses() {
  return JSON.parse(localStorage.getItem(localKey) ?? '[]');
}

function writeLocalResponses(responses) {
  localStorage.setItem(localKey, JSON.stringify(responses));
}

export async function fetchResponses() {
  if (supabase) {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  return readLocalResponses();
}

export async function saveResponse(payload) {
  if (supabase) {
    const { data, error } = await supabase.from('responses').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  const response = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  writeLocalResponses([response, ...readLocalResponses()]);
  return response;
}

export async function resetResponses() {
  if (supabase) {
    const { error } = await supabase.from('responses').delete().not('id', 'is', null);
    if (error) throw error;
    return;
  }

  writeLocalResponses([]);
}
