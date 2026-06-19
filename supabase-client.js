// supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ibnxvfuovfhnrggeicql.supabase.co'; // asenda o

const SUPABASE_ANON_KEY = 'sb_publishable_yToZd4ljWIIZPEQYHMyMug_C1NAF8jQ'; // asenda oma anon key-ga

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hoidla praeguse kasutaja kohta frontendis
export let currentUser = null;

// Lae sessioon ja kuula auth muutusi
export async function initAuth(onChange) {
  const { data } = await supabase.auth.getSession();
  currentUser = data?.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null;
  if (onChange) onChange(currentUser);

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
    if (onChange) onChange(currentUser);
  });
}

// Abifunktsioon: lae kasutaja rida users tabelist (role jms)
export async function loadUserRow() {
  if (!currentUser?.email) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', currentUser.email)
    .single();
  if (error && error.code === 'PGRST116') return null; // not found
  return data || null;
}

// Kui kasutaja puudub tabelis, loo rida
export async function ensureUserRow(email, displayName = null) {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, display_name: displayName })
    .select()
    .single();
  if (error) {
    // kui juba olemas, tagasta olemasolev
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
    return existing || null;
  }
  return data;
}
