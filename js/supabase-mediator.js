// js/supabase-mediator.js — TAVALINE JA KIIRE SÜNKROONNE SKRIPT
// Ei mingeid importe ega eksporte — töötab reaalajas!

(function(window) {
  // Loeb klienti otse aknast, kuhu sinu supabase-client.js selle pani
  const supabase = window.supabase || null;

  async function initAuth(onChange) {
    if (typeof window.initAuth === 'function') return window.initAuth(onChange);
    if (onChange) onChange(null);
    return null;
  }

  async function getSession() {
    try {
      if (window.supabase) {
        const { data } = await window.supabase.auth.getSession();
        return data?.session || null;
      }
    } catch(e) { }
    return null;
  }

  async function loadUserProfile() {
    if (typeof window.loadUserRow === 'function') return window.loadUserRow();
    return null;
  }

  /**
   * Sinu andmebaasi RLS poliitikad sorteerivad andmeid ise!
   * Päring tõmbab lihtsalt read alla ilma koodipoolsete piiranguteta.
   */
  async function listAllActiveFeatures() {
    if (!window.supabase) return { data: [], error: new Error('supabase missing') };
    return window.supabase
      .from('vaatlus_objektid')
      .select('*'); 
  }

  // Fallbackid
  async function listPublicFeatures() { return listAllActiveFeatures(); }
  async function listUserFeatures() { return listAllActiveFeatures(); }
  async function insertFeature(row) { return window.supabase.from('vaatlus_objektid').insert(row).select().single(); }
  async function updateFeature(id, row) { return window.supabase.from('vaatlus_objektid').update(row).eq('id', id).select().single(); }
  async function deleteFeature(id) { return window.supabase.from('vaatlus_objektid').delete().eq('id', id); }

  // PANEME API KOHESELT AKNALE KÄTTESAADAVAKS!
  window.supabaseAPI = {
    initAuth, getSession, loadUserProfile,
    listPublicFeatures, listAllActiveFeatures, listUserFeatures,
    insertFeature, updateFeature, deleteFeature
  };
  
  console.log("✅ Mediator: window.supabaseAPI on sünkroonse skriptina mällu loodud!");

})(window);
