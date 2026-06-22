// js/ui.js — UI glue skeleton (modal adapter, ribbon toggles)
(function(window){
  function modalAdapter(){
    const logo = document.getElementById('orchid-logo-svg');
    const adminModal = document.getElementById('admin-modal');
    const loginBadge = document.getElementById('login-badge');
    if (!logo || !adminModal) return;
    logo.addEventListener('click', function(e){ e && e.stopPropagation(); adminModal.classList.add('open'); adminModal.style.display='flex'; });
    document.getElementById('admin-close')?.addEventListener('click', function(){ adminModal.classList.remove('open'); adminModal.style.display='none'; });
    if (loginBadge) loginBadge.addEventListener('click', function(){ const lm=document.getElementById('login-modal'); if (lm) { lm.style.display='flex'; lm.classList.add('open'); } });

    // ribbon/tab handlers
    document.getElementById('ribbon-tab')?.addEventListener('click', () => { document.getElementById('tool-ribbon')?.classList.toggle('hidden'); });
    document.getElementById('sidebar-tab')?.addEventListener('click', () => { document.getElementById('sliding-sidebar')?.classList.toggle('open'); });
  }

  window.UIModule = { modalAdapter };
  window.addEventListener('DOMContentLoaded', function(){ modalAdapter(); });
})(window);
