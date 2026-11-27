// Controlador base del App Shell y navegacion entre vistas
let catalogGames = [];

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

  grid.innerHTML = games.map((game) => `
    <article class="game-card" data-id="${game.id}">
      <img src="${game.cover}" alt="${game.title}" class="game-cover" loading="lazy">
      <div class="game-body">
        <div class="game-meta">
          <span class="tag">${game.genre}</span>
          <span class="rating">&#9733; ${Number(game.rating).toFixed(1)}</span>
        </div>
        <h3 class="game-title">${game.title}</h3>
        <p class="game-platform">${game.platform} &bull; ${game.year}</p>
        <p class="game-desc">${game.description}</p>
        <div class="game-footer">
          <span class="game-price">${game.price}</span>
          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-save-game" data-game-id="${game.id}">Guardar</button>
            <button type="button" class="btn btn-ghost btn-sm btn-share-game" data-game-id="${game.id}">Compartir</button>
          </div>
        </div>
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

  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn) {
    installBtn.addEventListener('click', () => window.triggerPwaInstall?.());
  }

  document.getElementById('search-input')?.addEventListener('input', applyCatalogFilters);
  document.getElementById('genre-filter')?.addEventListener('change', applyCatalogFilters);

  await loadCatalogData();
});
