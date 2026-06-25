// supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ibnxvfuovfhnrggeicql.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yToZd4ljWIIZPEQYHMyMug_C1NAF8jQ';

// Lisame siia seadistuse, et sessioon aeguks brauseri tabi sulgemisel:
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.sessionStorage,
    autoRefreshToken: true,
    persistSession: true
  }
});

// ... ülejäänud kood (currentUser, initAuth jne) jääb samaks ...


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

// Abifunktsioon: lae kasutaja roll ja andmed PROFILES tabelist
// Abifunktsioon: lae kasutaja rida profiles tabelist (roll jms)
// Abifunktsioon: lae kasutaja rida profiles tabelist (roll jms)
export async function loadUserRow() {
  if (!currentUser?.email) return null;
  const { data, error } = await supabase
    .from('profiles') // Suunatud profiles tabelisse
    .select('*')
    .eq('email', currentUser.email)
    .single();
  if (error && error.code === 'PGRST116') return null; // not found
  return data || null;
}

// Kui kasutaja puudub tabelis, loo rida profiles tabelisse
export async function ensureUserRow(email, userId = null) {
  // Parandatud: display_name asendatud user_id-ga ja tabel suunatud profiles peale
  const { data, error } = await supabase
    .from('profiles')
    .insert({ email, user_id: userId || email.split('@')[0] })
    .select()
    .single();
  if (error) {
    // Kui rida on juba olemas, tagastame olemasoleva
    const { data: existing } = await supabase.from('profiles').select('*').eq('email', email).single();
    return existing || null;
  }
  return data;
}

// Teeme muutujad kättesaadavaks ka teistele skriptidele brauseris
window.supabase = supabase;
window.initAuth = initAuth;
window.loadUserRow = loadUserRow;
window.ensureUserRow = ensureUserRow;
