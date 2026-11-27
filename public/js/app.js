// Controlador principal de la PWA GameStart
let catalogGames = [];
let customGames = [];
let libraryItems = [];
let deferredInstallPrompt = null;
let selectedGameImage = '';
let activeCameraStream = null;

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
  if (viewName !== 'tools') {
    stopCameraStream();
  }
}

function getAllGames() {
  return [...customGames, ...catalogGames];
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
            ${game.isCustom ? `<button type="button" class="btn btn-danger btn-remove-custom-game" data-game-id="${escapeHtml(game.id)}">Eliminar</button>` : ''}
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
  const filtered = getAllGames().filter((game) =>
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

async function refreshCustomGames() {
  if (!window.GameDB) return;
  customGames = await window.GameDB.getCustomGames();
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

function setPreviewImage(dataUrl) {
  selectedGameImage = dataUrl;
  const previewBox = document.getElementById('image-preview-box');
  const previewImg = document.getElementById('game-image-preview');
  if (previewImg && previewBox) {
    previewImg.src = dataUrl;
    previewBox.hidden = false;
  }
}

function clearPreviewImage() {
  selectedGameImage = '';
  const previewBox = document.getElementById('image-preview-box');
  const previewImg = document.getElementById('game-image-preview');
  if (previewImg) previewImg.removeAttribute('src');
  if (previewBox) previewBox.hidden = true;
}

function compressCanvasImage(source, width, height) {
  const maxW = 800;
  const scale = width > maxW ? maxW / width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function stopCameraStream() {
  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach((track) => track.stop());
    activeCameraStream = null;
  }
  const cameraBox = document.getElementById('camera-box');
  const video = document.getElementById('camera-preview');
  if (video) video.srcObject = null;
  if (cameraBox) cameraBox.hidden = true;
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showMessage('Tu navegador no soporta acceso directo a la cámara.');
    return;
  }

  try {
    stopCameraStream();
    activeCameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    const video = document.getElementById('camera-preview');
    const cameraBox = document.getElementById('camera-box');
    if (video && cameraBox) {
      video.srcObject = activeCameraStream;
      cameraBox.hidden = false;
    }
  } catch (error) {
    if (error?.name === 'NotAllowedError') {
      showMessage('Permiso de cámara denegado.');
    } else if (error?.name === 'NotFoundError') {
      showMessage('No se detectó cámara en este dispositivo.');
    } else {
      showMessage('No fue posible abrir la cámara.');
    }
  }
}

function captureCameraPhoto() {
  const video = document.getElementById('camera-preview');
  if (!video || !video.videoWidth) return;
  const dataUrl = compressCanvasImage(video, video.videoWidth, video.videoHeight);
  setPreviewImage(dataUrl);
  stopCameraStream();
  showMessage('Foto capturada correctamente.');
}

function handleSelectedImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showMessage('Selecciona un archivo de imagen válido.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const dataUrl = compressCanvasImage(img, img.width, img.height);
      stopCameraStream();
      setPreviewImage(dataUrl);
      showMessage('Imagen cargada en vista previa.');
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
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
      const game = getAllGames().find((g) => g.id === saveBtn.dataset.gameId);
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
      const game = getAllGames().find((g) => g.id === shareBtn.dataset.gameId);
      if (game) await window.NativeAPIs.shareGame(game);
      return;
    }

    const removeCustomBtn = event.target.closest('.btn-remove-custom-game');
    if (removeCustomBtn && window.GameDB) {
      await window.GameDB.removeCustomGame(removeCustomBtn.dataset.gameId);
      await refreshCustomGames();
      showMessage('Videojuego personalizado eliminado.');
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

  // Formulario para agregar nuevo videojuego con imagen o camara
  const imageInput = document.getElementById('game-image-input');
  document.getElementById('btn-select-image')?.addEventListener('click', () => imageInput?.click());
  imageInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) handleSelectedImageFile(file);
  });

  document.getElementById('btn-open-camera')?.addEventListener('click', openCamera);
  document.getElementById('btn-capture-photo')?.addEventListener('click', captureCameraPhoto);
  document.getElementById('btn-close-camera')?.addEventListener('click', stopCameraStream);

  document.getElementById('custom-game-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!window.GameDB) return;

    if (!selectedGameImage) {
      showMessage('Primero selecciona una imagen o toma una foto.');
      return;
    }

    const title = document.getElementById('new-game-title').value.trim();
    const genre = document.getElementById('new-game-genre').value.trim();
    const platform = document.getElementById('new-game-platform').value.trim();
    const price = document.getElementById('new-game-price').value.trim();
    const description = document.getElementById('new-game-desc').value.trim();

    if (!title || !genre || !platform || !price || !description) return;

    await window.GameDB.saveCustomGame({
      id: `custom-${Date.now()}`,
      title,
      genre,
      platform,
      year: new Date().getFullYear(),
      price,
      cover: selectedGameImage,
      description
    });

    event.target.reset();
    clearPreviewImage();
    stopCameraStream();
    await refreshCustomGames();
    showMessage(`"${title}" guardado en IndexedDB y agregado al catálogo.`);
  });

  await refreshCustomGames();
  await refreshLibrary();
  await loadCatalog();
});
