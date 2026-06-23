// js/ui.js — UI glue skeleton (modal adapter, ribbon toggles)
// selgitus: haldab modalite ning tööriistariba ja külgriba nähtavust nii, et need ei jääks peidetud kuid fookusesse
(function(window){
  // selgitus: util — märgib/eemaldab inert või teeb nupud non-focusable kui inert pole toetatud
  function setInert(el, on){
    if (!el) return;
    try{
      if ('inert' in HTMLElement.prototype){ el.inert = !!on; return; }
    }catch(e){ /* ignore */ }
    // fallback: aria-hidden + disable focusable children
    if (on) {
      el.setAttribute('aria-hidden','true');
      const focusables = el.querySelectorAll('button,a,input,select,textarea,[tabindex]');
      focusables.forEach((f)=>{ f.dataset._savedTabIndex = f.hasAttribute('tabindex') ? f.getAttribute('tabindex') : null; f.setAttribute('tabindex','-1'); f.setAttribute('data-disabled-by-inert','true'); });
    } else {
      el.removeAttribute('aria-hidden');
      const focusables = el.querySelectorAll('[data-disabled-by-inert]');
      focusables.forEach((f)=>{ const prev = f.dataset._savedTabIndex; if (prev===null) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', prev); f.removeAttribute('data-disabled-by-inert'); delete f.dataset._savedTabIndex; });
    }
  }

  function modalAdapter(){
    const logo = document.getElementById('orchid-logo-svg');
    const adminModal = document.getElementById('admin-modal');
    const loginBadge = document.getElementById('login-badge');
    const loginModal = document.getElementById('login-modal');
    const adminClose = document.getElementById('admin-close');

    // Ribbon/sidebar elements
    const ribbonTab = document.getElementById('ribbon-tab');
    const toolRibbon = document.getElementById('tool-ribbon');
    const sidebarTab = document.getElementById('sidebar-tab');
    const slidingSidebar = document.getElementById('sliding-sidebar');

    // Admin modal
    if (logo && adminModal){
      logo.addEventListener('click', function(e){ e && e.stopPropagation(); setInert(document.querySelector('main') || document.body, true); adminModal.classList.add('open'); adminModal.style.display='flex'; adminModal.setAttribute('aria-hidden','false'); });
    }
    if (adminClose) adminClose.addEventListener('click', function(){ adminModal.classList.remove('open'); adminModal.style.display='none'; adminModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); });
    if (loginBadge) loginBadge.addEventListener('click', function(){ if (loginModal){ loginModal.classList.add('open'); loginModal.style.display='flex'; loginModal.setAttribute('aria-hidden','false'); setInert(document.querySelector('main') || document.body, true); } });
    document.getElementById('login-close')?.addEventListener('click', function(){ if (loginModal){ loginModal.classList.remove('open'); loginModal.style.display='none'; loginModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); } });

    // Ribbon toggle — kasutame setInert, et toolbar ei jääks peidetuna fookusesse
    if (ribbonTab && toolRibbon){
      // algseis: pane toolbar inertiks, kui see on hidden
      if (toolRibbon.classList.contains('hidden')) setInert(toolRibbon, true);
      ribbonTab.addEventListener('click', function(){ const isHidden = toolRibbon.classList.toggle('hidden'); if (isHidden) setInert(toolRibbon, true); else setInert(toolRibbon, false); });
    }

    // Sidebar toggle
    if (sidebarTab && slidingSidebar){
      if (!slidingSidebar.classList.contains('open')) setInert(slidingSidebar, true);
      sidebarTab.addEventListener('click', function(){ const willOpen = slidingSidebar.classList.toggle('open'); if (willOpen) setInert(slidingSidebar, false); else setInert(slidingSidebar, true); sidebarTab.textContent = slidingSidebar.classList.contains('open') ? '✕' : '☰'; });
    }

    // global clicks to close modals
    window.addEventListener('click', (ev) => {
      if (ev.target === adminModal) { adminModal.classList.remove('open'); adminModal.style.display='none'; adminModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); }
      if (ev.target === loginModal) { loginModal.classList.remove('open'); loginModal.style.display='none'; loginModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); }
    });

    // Escape key handling
    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (loginModal && loginModal.style.display === 'flex') { ev.preventDefault(); loginModal.classList.remove('open'); loginModal.style.display='none'; loginModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); }
        else if (adminModal && adminModal.style.display === 'flex') { ev.preventDefault(); adminModal.classList.remove('open'); adminModal.style.display='none'; adminModal.setAttribute('aria-hidden','true'); setInert(document.querySelector('main') || document.body, false); }
      }
    });
  }

  window.UIModule = { modalAdapter };
  window.addEventListener('DOMContentLoaded', function(){ /* init called from kaart-app after map-core ready */ });

})(window);
