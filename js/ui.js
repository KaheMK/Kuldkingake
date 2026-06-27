// js/ui.js — UI juhtimine ja Supabase integratsioon (Sünkroonne tavaskript)
// Ei mingeid importe ega eksporte — tõrgeteta koostöö teiste failidega!

(function(window) {
  // Loeme API otse aknast, mille mediator valmis tegi
  const api = window.supabaseAPI || null;
  const supabase = window.supabase || null;

  // --- LIGIPÄÄSETAVUSE UTIL (INERT) ---
  function setInert(el, on) {
    if (!el) return;
    try {
      if ('inert' in HTMLElement.prototype) { el.inert = !!on; return; }
    } catch(e) {}
    
    if (on) {
      el.setAttribute('aria-hidden', 'true');
      const focusables = el.querySelectorAll('button,a,input,select,textarea,[tabindex]');
      focusables.forEach((f) => { 
        f.dataset._savedTabIndex = f.hasAttribute('tabindex') ? f.getAttribute('tabindex') : null; 
        f.setAttribute('tabindex', '-1'); 
        f.setAttribute('data-disabled-by-inert', 'true'); 
      });
    } else {
      el.removeAttribute('aria-hidden');
      const focusables = el.querySelectorAll('[data-disabled-by-inert]');
      focusables.forEach((f) => { 
        const prev = f.dataset._savedTabIndex; 
        if (prev === null) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', prev); 
        f.removeAttribute('data-disabled-by-inert'); 
        delete f.dataset._savedTabIndex; 
      });
    }
  }

  // --- KASUTAJA AUTH UI REAGEERIMINE ---
  const leftBtn = document.getElementById('auth-left');
  const rightBtn = document.getElementById('auth-right');
  const loginSend = document.getElementById('login-send');
  const loginEmail = document.getElementById('login-email');
  const loginMsg = document.getElementById('login-msg');
  const logoutBtn = document.getElementById('logout-btn');
  const loginModal = document.getElementById('login-modal');
  const adminModal = document.getElementById('admin-modal');

  let frontendUser = null;

  function setLoggedOutState() {
    if (leftBtn) {
      leftBtn.textContent = 'Uudistaja';
      leftBtn.title = 'Uudistaja';
      leftBtn.style.background = '';
    }
    if (rightBtn) {
      rightBtn.textContent = 'Logi sisse';
      rightBtn.onclick = (e) => {
        e.preventDefault();
        if (loginModal) {
          loginModal.classList.add('open');
          loginModal.style.display = 'flex';
          setInert(document.querySelector('main') || document.body, true);
        }
      };
    }
  }

  function setLoggedInState(email, userIdFallback) {
    const username = userIdFallback || (email || '').split('@')[0] || 'Spetsialist';
    if (leftBtn) {
      leftBtn.textContent = username;
      leftBtn.title = `Sisse logitud: ${username}`;
      leftBtn.style.background = "#e6ffe6";
    }
    if (rightBtn) {
      rightBtn.textContent = 'Logi välja';
      rightBtn.onclick = async (e) => {
        e.preventDefault();
        const kinnita = confirm("Kas olete kindel, et soovite välja logida?");
        if (kinnita && window.supabase) {
          await window.supabase.auth.signOut();
          window.location.reload();
        }
      };
    }
  }

  function updateAuthUI() {
    if (frontendUser) {
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (loginEmail) loginEmail.style.display = 'none';
      if (loginSend) loginSend.style.display = 'none';
      if (loginMsg) loginMsg.textContent = 'Sisse logitud';
      if (loginModal) {
        loginModal.classList.remove('open');
        loginModal.style.display = 'none';
        setInert(document.querySelector('main') || document.body, false);
      }
    } else {
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (loginEmail) loginEmail.style.display = 'inline-block';
      if (loginSend) loginSend.style.display = 'inline-block';
    }
  }

  // --- MODAALIDE AKTIIVNE ADAPTER ---
  // js/ui.js — TÄIELIKULT LIHVITUD modalAdapter FUKNKTSIOON
function modalAdapter() {
  // js/ui.js — Kopeeri see plokk funktsiooni modalAdapter() algusesse:

 // js/ui.js — Otsi üles esikaane nuppude juhtimise osa ja asenda see täpselt nii:

  const coverPage = document.getElementById('app-cover-page');
  const coverExploreBtn = document.getElementById('cover-explore-btn');
  const coverLoginBtn = document.getElementById('cover-login-btn');

  if (coverPage) {
    // 1. KÄSK: Mine uudistama -> võtame lukud maha ja libistame kaane eest ära!
    if (coverExploreBtn) {
      coverExploreBtn.onclick = function() {
        coverPage.classList.add('fade-out');
        console.log("✦ UI: Esikaas suletud, kasutaja läks uudistama.");
        
        // LÕPLIK PARANDUS: Võtame kaardilt ja logolt 'inert' luku maha, 
        // et kõik klikid ja admin-modal hakkaksid sekundiga reaalajas tööle!
        const mainArea = document.querySelector('main') || document.body;
        if (typeof setInert === 'function') {
          setInert(mainArea, false);
        } else {
          mainArea.removeAttribute('aria-hidden');
        }
      };
    }

    // 2. KÄSK: Spetsialisti sisselogimine -> avab sisselogimise, aga võtab ka kaardilt luku maha
    if (coverLoginBtn) {
      coverLoginBtn.onclick = function() {
        coverPage.classList.add('fade-out');
        
        // Võtame ka siit kaardi luku maha
        const mainArea = document.querySelector('main') || document.body;
        if (typeof setInert === 'function') {
          setInert(mainArea, false);
        } else {
          mainArea.removeAttribute('aria-hidden');
        }
        
        // Avame sisselogimise hüpiku
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
          loginModal.classList.add('open');
          loginModal.style.display = 'flex';
          // Lukustame tausta uuesti sisselogimise akna ajaks
          if (typeof setInert === 'function') setInert(mainArea, true);
        }
      };
    }
  }


  console.log("⏳ UI: Seon nupud ja klikid...");

  const logo = document.getElementById('orchid-logo-svg');
  const adminClose = document.getElementById('admin-close');
  const ribbonTab = document.getElementById('ribbon-tab');
  const toolRibbon = document.getElementById('tool-ribbon');
  const sidebarTab = document.getElementById('sidebar-tab');
  const slidingSidebar = document.getElementById('sliding-sidebar');

  // --- 1. LOGO JA ADMIN MODAL ---
  if (logo && adminModal) {
    logo.addEventListener('click', function(e) { 
      e && e.stopPropagation(); 
      setInert(document.querySelector('main') || document.body, true); 
      adminModal.classList.add('open'); 
      adminModal.style.display = 'flex'; 
    });
  }
  if (adminClose) {
    adminClose.addEventListener('click', function() { 
      adminModal.classList.remove('open'); 
      adminModal.style.display = 'none'; 
      setInert(document.querySelector('main') || document.body, false); 
    });
  }
  
  // Login akna sulgemine ristist
  document.getElementById('login-close')?.addEventListener('click', function() { 
    if (loginModal) { 
      loginModal.classList.remove('open'); 
      loginModal.style.display = 'none'; 
      setInert(document.querySelector('main') || document.body, false); 
    } 
  });

  // --- 2. TÖÖRIISTARIBA (RIBBON) LÜLITI ---
  if (ribbonTab && toolRibbon) {
    // Algseisund: paneme igaks juhuks paika
    if (toolRibbon.classList.contains('hidden')) {
      toolRibbon.style.display = 'none';
    }

    ribbonTab.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const onHidden = toolRibbon.classList.toggle('hidden');
      console.log("✦ UI: Tööriistariba lülitus. Peidetud =", onHidden);
      
      if (onHidden) {
        toolRibbon.style.display = 'none';
        setInert(toolRibbon, true);
      } else {
        toolRibbon.style.display = 'flex';
        setInert(toolRibbon, false);
      }
    };
  }

  // --- 3. KÜLGRIBA (SIDEBAR) LÜLITI ---
  if (sidebarTab && slidingSidebar) {
    sidebarTab.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const onOpen = slidingSidebar.classList.toggle('open');
      slidingSidebar.classList.toggle('closed', !onOpen);
      console.log("✦ UI: Külgriba lülitus. Avatud =", onOpen);
      
      if (onOpen) {
        sidebarTab.textContent = '✕';
        setInert(slidingSidebar, false);
      } else {
        sidebarTab.textContent = '☰';
        setInert(slidingSidebar, true);
      }
    };
  }

  // --- 4. TAUSTALE KLIKKIMINE ---
  window.addEventListener('click', (ev) => {
    if (ev.target === adminModal) { adminModal.classList.remove('open'); adminModal.style.display='none'; setInert(document.querySelector('main') || document.body, false); }
    if (ev.target === loginModal) { loginModal.classList.remove('open'); loginModal.style.display='none'; setInert(document.querySelector('main') || document.body, false); }
  });

  // --- 5. ESCAPE KLAHV ---
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (loginModal && loginModal.style.display === 'flex') { ev.preventDefault(); loginModal.classList.remove('open'); loginModal.style.display='none'; setInert(document.querySelector('main') || document.body, false); }
      if (adminModal && adminModal.style.display === 'flex') { ev.preventDefault(); adminModal.classList.remove('open'); adminModal.style.display='none'; setInert(document.querySelector('main') || document.body, false); }
    }
  });
  // js/ui.js — Lisa see modalAdapter() funktsiooni lõppu:

  const sciKategooria = document.getElementById('sci-kategooria');
  const sciLiikListWrapper = document.getElementById('sci-liik-list-wrapper');
  const sciLiikVabaWrapper = document.getElementById('sci-liik-vaba-wrapper');

  if (sciKategooria && sciLiikListWrapper && sciLiikVabaWrapper) {
    sciKategooria.addEventListener('change', function() {
      if (sciKategooria.value === 'orhidee') {
        sciLiikListWrapper.style.display = 'block';
        sciLiikVabaWrapper.style.display = 'none';
      } else {
        sciLiikListWrapper.style.display = 'none';
        sciLiikVabaWrapper.style.display = 'block';
      }
    });
  }

}


  // --- MAGIC LINKI SAATMINE ---
  if (loginSend) {
    loginSend.addEventListener('click', async () => {
      const email = (loginEmail?.value || '').trim();
      if (!email) { if (loginMsg) loginMsg.textContent = 'Sisesta kehtiv e‑post'; return; }
      if (loginMsg) loginMsg.textContent = 'Saadan linki…';
      
      if (window.supabase) {
        const { error } = await window.supabase.auth.signInWithOtp({ 
          email, 
          options: { emailRedirectTo: window.location.href }
        });
        if (error) { if (loginMsg) loginMsg.textContent = 'Viga: ' + error.message; }
        else { if (loginMsg) loginMsg.textContent = 'Saatsime lingi sinu e‑postile. Ava link, et sisse logida.'; }
      }
    });
  }

  // --- AUTH SEISUNDI KESKNE KUULAMINE ---
  function startAuthListening() {
    if (!api || !window.initAuth) {
      // Kui auth pole veel valmis, proovime hetke pärast uuesti
      setTimeout(startAuthListening, 100);
      return;
    }

    try {
      window.initAuth(async (sessionUser) => {
        if (!sessionUser) { 
          frontendUser = null; 
          window.frontendUser = null;
          setLoggedOutState(); 
          updateAuthUI(); 
          if (typeof window.refreshSupabaseData === 'function') window.refreshSupabaseData();
          return; 
        }

        frontendUser = sessionUser;
        window.frontendUser = sessionUser;
        
        let dbUserId = null;
        if (typeof window.loadUserRow === 'function') {
          const profile = await window.loadUserRow();
          if (profile) {
            console.log("Supabase ja UI leidsid ühise keele. Spetsialist tuvastatud.");
            dbUserId = profile.user_id;
          }
        }

        setLoggedInState(sessionUser.email, dbUserId);
        updateAuthUI();
        if (typeof window.refreshSupabaseData === 'function') window.refreshSupabaseData();
      });
    } catch (e) {
      console.error("Auth algatamise viga UI-s:", e);
    }
  }

 

  // Eksporteerime UI mooduli globaalselt
// js/ui.js — Otsi üles faili KÕIGE VIIMASED READ ja veendu, et nad on täpselt sellised:

  // Käivitame auth kuulamise
  startAuthListening();

  // PARANDUS: Paneme modalAdapteri otseselt ja globaalselt aknale (window),
  // et kaart-app.js saaks selle takistusteta üles leida ja klikid käivitada!
  window.modalAdapter = modalAdapter;
  window.UIModule = { modalAdapter: modalAdapter };

})(window);





