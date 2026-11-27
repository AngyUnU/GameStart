// Controlador principal de la PWA GameStart
let catalogGames = [];
let libraryItems = [];
let deferredInstallPrompt = null;

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showMessage(text) {
  const box = document.getElementById('status-msg');
  if (!box) return;
  box.textContent = text;
  box.hidden = false;
  setTimeout(() => {
    box.hidden = true;
  }, 3000);
}

window.showToast = showMessage;

function updateNetworkStatus() {
  const badge = document.getElementById('connection-status');
  if (!badge) return;
  const online = navigator.onLine;
  badge.textContent = online ? 'Online' : 'Offline';
  badge.className = `net-status ${online ? 'online' : 'offline'}`;
}

function switchView(viewName) {
  document.querySelectorAll('.page-view').forEach((sec) => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
}

function renderCatalog(games) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  if (!games.length) {
    grid.innerHTML = '<p class="subtitle">No se encontraron juegos.</p>';
    return;
  }

  const savedIds = new Set(libraryItems.map((item) => item.id));

  grid.innerHTML = games.map((game) => `
    <article class="card">
      <img src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.title)}" class="card-img" loading="lazy">
      <div class="card-body">
        <div class="card-meta">
          <span class="tag">${escapeHtml(game.genre)}</span>
          <span class="platform">${escapeHtml(game.platform)}</span>
        </div>
        <h2>${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.description)}</p>
        <div class="card-footer">
          <span class="price">${escapeHtml(game.price)}</span>
          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-save-game" data-game-id="${escapeHtml(game.id)}">
              ${savedIds.has(game.id) ? 'Guardado' : 'Guardar'}
            </button>
            <button type="button" class="btn btn-outline btn-share-game" data-game-id="${escapeHtml(game.id)}">Compartir</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderLibrary() {
  const list = document.getElementById('library-list');
  const badge = document.getElementById('library-badge');

  if (badge) {
    badge.textContent = String(libraryItems.length);
  }
  if (!list) return;

  if (!libraryItems.length) {
    list.innerHTML = '<p class="subtitle">Aún no tienes favoritos guardados.</p>';
    return;
  }

  list.innerHTML = libraryItems.map((item) => `
    <article class="box">
      <small class="tag">${escapeHtml(item.genre || 'Nota')} &bull; ${escapeHtml(item.platform || 'Local')}</small>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="subtitle">${escapeHtml(item.note || '')}</p>
      <div>
        <button type="button" class="btn btn-danger btn-remove-library" data-id="${escapeHtml(item.id)}">Eliminar</button>
      </div>
    </article>
  `).join('');
}

function filterCatalog() {
  const query = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const filtered = catalogGames.filter((game) =>
    !query || game.title.toLowerCase().includes(query) || game.platform.toLowerCase().includes(query)
  );
  renderCatalog(filtered);
}

async function refreshLibrary() {
  if (!window.GameDB) return;
  libraryItems = await window.GameDB.getLibrary();
  renderLibrary();
  filterCatalog();
}

async function loadCatalog() {
  try {
    const res = await fetch('/data/games.json');
    if (res.ok) {
      catalogGames = await res.json();
      await window.GameDB?.saveCatalog(catalogGames);
      filterCatalog();
      return;
    }
  } catch (_) {
    // Sin red: usar IndexedDB
  }

  if (window.GameDB) {
    catalogGames = await window.GameDB.getCatalog();
    filterCatalog();
  }
}

function setupInstallPrompt() {
  const installBtn = document.getElementById('btn-install-pwa');

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installBtn) installBtn.hidden = true;
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (outcome === 'accepted') installBtn.hidden = true;
  });
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  });
}

setupInstallPrompt();
registerSW();

document.addEventListener('DOMContentLoaded', async () => {
  updateNetworkStatus();
  window.addEventListener('online', () => {
    updateNetworkStatus();
    showMessage('Conexión restablecida.');
  });
  window.addEventListener('offline', () => {
    updateNetworkStatus();
    showMessage('Sin conexión. Trabajando en modo offline.');
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('search-input')?.addEventListener('input', filterCatalog);

  document.getElementById('games-grid')?.addEventListener('click', async (event) => {
    const saveBtn = event.target.closest('.btn-save-game');
    if (saveBtn && window.GameDB) {
      const game = catalogGames.find((g) => g.id === saveBtn.dataset.gameId);
      if (!game) return;
      await window.GameDB.saveToLibrary({
        id: game.id,
        title: game.title,
        genre: game.genre,
        platform: game.platform,
        note: game.description
      });
      await refreshLibrary();
      showMessage(`Guardado en favoritos: ${game.title}`);
      return;
    }

    const shareBtn = event.target.closest('.btn-share-game');
    if (shareBtn && window.NativeAPIs) {
      const game = catalogGames.find((g) => g.id === shareBtn.dataset.gameId);
      if (game) await window.NativeAPIs.shareGame(game);
    }
  });

  document.getElementById('custom-note-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!window.GameDB) return;
    const title = document.getElementById('note-game-title').value.trim();
    const note = document.getElementById('note-game-text').value.trim();
    if (!title || !note) return;

    await window.GameDB.saveToLibrary({
      id: `nota-${Date.now()}`,
      title,
      genre: 'Nota personal',
      platform: 'Local',
      note
    });

    event.target.reset();
    await refreshLibrary();
    showMessage('Nota guardada localmente.');
  });

  document.getElementById('library-list')?.addEventListener('click', async (event) => {
    const removeBtn = event.target.closest('.btn-remove-library');
    if (!removeBtn || !window.GameDB) return;
    await window.GameDB.removeFromLibrary(removeBtn.dataset.id);
    await refreshLibrary();
    showMessage('Elemento eliminado.');
  });

  await refreshLibrary();
  await loadCatalog();
});
