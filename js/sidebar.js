// js/sidebar.js
const sidebarEl = document.getElementById('sidebar');

function ensureSidebar() {
  if (!sidebarEl) throw new Error('Sidebar element with id="sidebar" not found');
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function setSidebarContent(html) {
  ensureSidebar();
  sidebarEl.innerHTML = html;
}

export function setSidebarText(title = '', text = '') {
  ensureSidebar();
  sidebarEl.innerHTML = '';
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title;
    sidebarEl.appendChild(h);
  }
  if (text) {
    const p = document.createElement('p');
    p.textContent = text;
    sidebarEl.appendChild(p);
  }
}

export function setSidebarHtml(title = '', html = '') {
  ensureSidebar();
  sidebarEl.innerHTML = '';
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title;
    sidebarEl.appendChild(h);
  }
  if (html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    sidebarEl.appendChild(wrapper);
  }
}

export function showWelcomeView() {
  setSidebarText('Tere tulemast', 'Vali objekt kaardilt või ava menüü.');
}

export function showObjectInfo(data = {}) {
  const title = data.title || 'Objekt';
  const description = data.description || '';
  let html = `<p>${escapeHtml(description)}</p>`;
  if (data.properties) {
    html += '<dl>';
    for (const k in data.properties) {
      html += `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(data.properties[k]))}</dd>`;
    }
    html += '</dl>';
  }
  setSidebarHtml(title, html);
}

export function showAdminBox(data = {}) {
  const text = data.text || '';
  const html = `
    <label for="admin-note">Iseloomustus</label>
    <textarea id="admin-note" rows="6">${escapeHtml(text)}</textarea>
    <div class="sidebar-actions">
      <button id="admin-save">Salvesta</button>
      <button id="admin-cancel">Tühista</button>
    </div>
  `;
  setSidebarHtml('Iseloomustus', html);
}

export function showModelInfo(model = {}) {
  const name = model.name || 'Mudeli info';
  const description = model.description || '';
  setSidebarHtml(name, `<p>${escapeHtml(description)}</p>`);
}

export function initSidebar({ defaultView = showWelcomeView } = {}) {
  ensureSidebar();
  if (!sidebarEl.querySelector('.sidebar-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sidebar-close';
    closeBtn.title = 'Sulge';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      sidebarEl.classList.toggle('collapsed');
    });
    sidebarEl.prepend(closeBtn);
  }
  defaultView();
}


