// Controlador del App Shell, catalogo, biblioteca IndexedDB y Service Worker
let catalogGames = [];
let libraryItems = [];

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function updateConnectionBadge() {
  const badge = document.getElementById('connection-status');
  if (!badge) return;
  const online = navigator.onLine;
  badge.textContent = online ? 'En línea' : 'Sin conexión';
  badge.className = `status-pill ${online ? 'status-online' : 'status-offline'}`;
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.toggle('is-active', sec.id === `view-${viewName}`);
  });
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === viewName);
  });
}

function renderCatalog(games) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  if (!games.length) {
    grid.innerHTML = '<p class="muted">No se encontraron videojuegos con ese filtro.</p>';
    return;
  }

  const savedIds = new Set(libraryItems.map((item) => item.id));

  grid.innerHTML = games.map((game) => {
    const isSaved = savedIds.has(game.id);
    return `
      <article class="game-card" data-id="${escapeHtml(game.id)}">
        <img src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.title)}" class="game-cover" loading="lazy">
        <div class="game-body">
          <div class="game-meta">
            <span class="tag">${escapeHtml(game.genre)}</span>
            <span class="rating">&#9733; ${Number(game.rating).toFixed(1)}</span>
          </div>
          <h3 class="game-title">${escapeHtml(game.title)}</h3>
          <p class="game-platform">${escapeHtml(game.platform)} &bull; ${escapeHtml(game.year)}</p>
          <p class="game-desc">${escapeHtml(game.description)}</p>
          <div class="game-footer">
            <span class="game-price">${escapeHtml(game.price)}</span>
            <div class="card-actions">
              <button type="button" class="btn btn-secondary btn-sm btn-save-game" data-game-id="${escapeHtml(game.id)}">
                ${isSaved ? 'En biblioteca' : 'Guardar'}
              </button>
              <button type="button" class="btn btn-ghost btn-sm btn-share-game" data-game-id="${escapeHtml(game.id)}">Compartir</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderLibrary() {
  const container = document.getElementById('library-list');
  const badge = document.getElementById('library-badge');
  const statusFilter = document.getElementById('library-status-filter')?.value || 'all';

  if (badge) {
    badge.textContent = String(libraryItems.length);
  }
  if (!container) return;

  const filtered = libraryItems.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter
  );

  if (!filtered.length) {
    container.innerHTML = '<p class="muted">Tu biblioteca está vacía. Guarda juegos del catálogo o agrega una nota offline.</p>';
    return;
  }

  container.innerHTML = filtered.map((item) => `
    <article class="card-panel" data-library-id="${escapeHtml(item.id)}">
      <div class="game-meta">
        <span class="tag">${escapeHtml(item.genre || 'Personal')}</span>
        <span class="muted">${escapeHtml(item.platform || 'Multiplataforma')}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="muted">${escapeHtml(item.note || 'Guardado en biblioteca local.')}</p>
      <div class="form-row">
        <select class="select library-status-select" data-id="${escapeHtml(item.id)}" aria-label="Estado del juego">
          <option value="Por jugar" ${item.status === 'Por jugar' ? 'selected' : ''}>Por jugar</option>
          <option value="Jugando" ${item.status === 'Jugando' ? 'selected' : ''}>Jugando</option>
          <option value="Completado" ${item.status === 'Completado' ? 'selected' : ''}>Completado</option>
        </select>
        <button type="button" class="btn btn-danger btn-sm btn-remove-library" data-id="${escapeHtml(item.id)}">Eliminar</button>
      </div>
    </article>
  `).join('');
}

function applyCatalogFilters() {
  const query = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const genre = document.getElementById('genre-filter')?.value || 'all';

  const filtered = catalogGames.filter((game) => {
    const matchesQuery =
      !query ||
      game.title.toLowerCase().includes(query) ||
      game.platform.toLowerCase().includes(query);
    const matchesGenre = genre === 'all' || game.genre === genre;
    return matchesQuery && matchesGenre;
  });

  renderCatalog(filtered);
}

async function refreshLibraryUI() {
  if (!window.GameDB) return;
  libraryItems = await window.GameDB.getLibrary();
  renderLibrary();
  applyCatalogFilters();
}

async function loadCatalogData() {
  try {
    const response = await fetch('/data/games.json');
    if (response.ok) {
      catalogGames = await response.json();
      if (window.GameDB) {
        await window.GameDB.saveCatalog(catalogGames);
      }
      applyCatalogFilters();
      return;
    }
  } catch (_) {
    // Fallback offline desde IndexedDB
  }

  if (window.GameDB) {
    catalogGames = await window.GameDB.getCatalog();
    applyCatalogFilters();
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('Nueva versión lista. Recarga para actualizar.');
          }
        });
      });
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  });
}

registerServiceWorker();

document.addEventListener('DOMContentLoaded', async () => {
  updateConnectionBadge();
  window.addEventListener('online', () => {
    updateConnectionBadge();
    showToast('Conexión restablecida.');
  });
  window.addEventListener('offline', () => {
    updateConnectionBadge();
    showToast('Modo offline activado. Datos disponibles localmente.');
  });

  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('btn-install-pwa')?.addEventListener('click', () => {
    window.triggerPwaInstall?.();
  });

  document.getElementById('search-input')?.addEventListener('input', applyCatalogFilters);
  document.getElementById('genre-filter')?.addEventListener('change', applyCatalogFilters);
  document.getElementById('library-status-filter')?.addEventListener('change', renderLibrary);

  // Acciones en tarjetas del catalogo (guardar en IndexedDB / compartir)
  document.getElementById('games-grid')?.addEventListener('click', async (event) => {
    const saveBtn = event.target.closest('.btn-save-game');
    if (saveBtn) {
      const game = catalogGames.find((g) => g.id === saveBtn.dataset.gameId);
      if (!game || !window.GameDB) return;
      await window.GameDB.saveToLibrary({
        id: game.id,
        title: game.title,
        genre: game.genre,
        platform: game.platform,
        status: 'Por jugar',
        note: game.description
      });
      await refreshLibraryUI();
      showToast(`"${game.title}" guardado en tu biblioteca offline.`);
      return;
    }

    const shareBtn = event.target.closest('.btn-share-game');
    if (shareBtn && window.NativeAPIs) {
      const game = catalogGames.find((g) => g.id === shareBtn.dataset.gameId);
      if (game) {
        await window.NativeAPIs.shareGame(game);
      }
    }
  });

  // Formulario de nota personalizada offline
  document.getElementById('custom-note-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!window.GameDB) return;
    const titleInput = document.getElementById('note-game-title');
    const statusSelect = document.getElementById('note-game-status');
    const noteInput = document.getElementById('note-game-text');

    const title = titleInput.value.trim();
    const note = noteInput.value.trim();
    if (!title || !note) return;

    await window.GameDB.saveToLibrary({
      id: `custom-${Date.now()}`,
      title,
      genre: 'Nota personal',
      platform: 'Local',
      status: statusSelect.value,
      note
    });

    event.target.reset();
    await refreshLibraryUI();
    showToast('Nota guardada en IndexedDB.');
  });

  // Actualizar estado o eliminar de biblioteca
  const libraryList = document.getElementById('library-list');
  libraryList?.addEventListener('change', async (event) => {
    const select = event.target.closest('.library-status-select');
    if (!select || !window.GameDB) return;
    const item = libraryItems.find((entry) => entry.id === select.dataset.id);
    if (!item) return;
    item.status = select.value;
    await window.GameDB.saveToLibrary(item);
    await refreshLibraryUI();
    showToast('Estado actualizado.');
  });

  libraryList?.addEventListener('click', async (event) => {
    const removeBtn = event.target.closest('.btn-remove-library');
    if (!removeBtn || !window.GameDB) return;
    await window.GameDB.removeFromLibrary(removeBtn.dataset.id);
    await refreshLibraryUI();
    showToast('Elemento eliminado de la biblioteca.');
  });

  await refreshLibraryUI();
  await loadCatalogData();
});
