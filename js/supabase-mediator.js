// js/supabase-mediator.js
// Mediator between UI and supabase-client.js - provides a small API surface and fallback stubs
import * as sb from '../supabase-client.js';

const supabase = sb?.supabase || window.supabase || null;

async function initAuth(onChange){
  if (typeof sb?.initAuth === 'function') return sb.initAuth(onChange);
  if (typeof window.initAuth === 'function') return window.initAuth(onChange);
  if (onChange) onChange(null);
  return null;
}

async function getSession(){
  try{
    if (typeof sb?.supabase !== 'undefined'){
      const { data } = await sb.supabase.auth.getSession();
      return data?.session || null;
    }
    if (window.supabase){
      const { data } = await window.supabase.auth.getSession();
      return data?.session || null;
    }
  }catch(e){ console.warn('supabase-mediator.getSession error', e); }
  return null;
}

async function loadUserProfile(){
  if (typeof sb?.loadUserRow === 'function') return sb.loadUserRow();
  if (typeof window.loadUserRow === 'function') return window.loadUserRow();
  return null;
}

async function listPublicFeatures(){
  if (!supabase) return { data: [], error: new Error('supabase missing') };
  return supabase.from('vaatlus_objektid').select('*').eq('nahtavus','avalik');
}

async function listUserFeatures(userId){
  if (!supabase) return { data: [], error: new Error('supabase missing') };
  return supabase.from('vaatlus_objektid').select('*').eq('looja_id', userId);
}

async function insertFeature(row){
  if (!supabase) return { data: null, error: new Error('supabase missing') };
  return supabase.from('vaatlus_objektid').insert(row).select().single();
}

async function updateFeature(id, row){
  if (!supabase) return { data: null, error: new Error('supabase missing') };
  return supabase.from('vaatlus_objektid').update(row).eq('id', id).select().single();
}

async function deleteFeature(id){
  if (!supabase) return { data: null, error: new Error('supabase missing') };
  return supabase.from('vaatlus_objektid').delete().eq('id', id);
}

export {
  initAuth, getSession, loadUserProfile,
  listPublicFeatures, listUserFeatures,
  insertFeature, updateFeature, deleteFeature
};

// expose global for non-module scripts
window.supabaseAPI = window.supabaseAPI || {
  initAuth, getSession, loadUserProfile,
  listPublicFeatures, listUserFeatures,
  insertFeature, updateFeature, deleteFeature
};
