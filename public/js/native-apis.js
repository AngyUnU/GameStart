// Integracion de Web APIs nativas con validacion de soporte y permisos
function getNotifLabel(state) {
  if (state === 'granted') return 'Concedido';
  if (state === 'denied') return 'Denegado';
  if (state === 'default') return 'Pendiente';
  return 'No soportado';
}

function updateNotificationStatusUI() {
  const el = document.getElementById('notif-permission-state');
  if (!el) return;
  if (!('Notification' in window)) {
    el.textContent = 'No soportado';
    return;
  }
  el.textContent = getNotifLabel(Notification.permission);
}

async function showLocalNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'gamestart-alert'
  };

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  }

  new Notification(title, options);
  return true;
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    updateNotificationStatusUI();
    window.showToast?.('Este navegador no soporta notificaciones.');
    return false;
  }

  if (Notification.permission === 'granted') {
    updateNotificationStatusUI();
    window.showToast?.('Las notificaciones ya están activadas.');
    return true;
  }

  if (Notification.permission === 'denied') {
    updateNotificationStatusUI();
    window.showToast?.('Permiso bloqueado. Habilítalo en la configuración del navegador.');
    return false;
  }

  const result = await Notification.requestPermission();
  updateNotificationStatusUI();

  if (result === 'granted') {
    await showLocalNotification('GameStart', 'Alertas de lanzamientos y torneos activadas.');
    window.showToast?.('Notificaciones activadas correctamente.');
    return true;
  }

  window.showToast?.('Permiso de notificaciones no concedido.');
  return false;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function renderNearbyHubs(lat, lon, accuracy) {
  const container = document.getElementById('geo-results');
  if (!container) return;

  const hubs = [
    { name: 'Arena GameStart Centro', lat: lat + 0.012, lon: lon + 0.008, event: 'Torneo Smash & FIFA - Sábado 17:00' },
    { name: 'Pixel Store & Arcade', lat: lat - 0.018, lon: lon + 0.015, event: 'Intercambio de cartuchos y demos' },
    { name: 'CyberLounge Norte', lat: lat + 0.025, lon: lon - 0.021, event: 'Noche Indie & Cooperativo' }
  ];

  container.innerHTML = `
    <div class="geo-item">
      <strong>Tu ubicación:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)} (&plusmn;${Math.round(accuracy)} m)
    </div>
    ${hubs.map((hub) => {
      const km = haversineKm(lat, lon, hub.lat, hub.lon).toFixed(2);
      return `
        <div class="geo-item">
          <strong>${hub.name}</strong> &bull; ${km} km<br>
          <span class="muted">${hub.event}</span>
        </div>
      `;
    }).join('')}
  `;
}

async function initGeolocationStatus() {
  const el = document.getElementById('geo-permission-state');
  if (!el) return;
  if (!('geolocation' in navigator)) {
    el.textContent = 'No soportado';
    return;
  }
  if (navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      el.textContent = status.state === 'granted' ? 'Concedido' : status.state === 'denied' ? 'Denegado' : 'Pendiente';
    } catch (_) {
      el.textContent = 'Disponible';
    }
  }
}

function detectUserLocation() {
  const stateEl = document.getElementById('geo-permission-state');
  const resultsEl = document.getElementById('geo-results');

  if (!('geolocation' in navigator)) {
    if (stateEl) stateEl.textContent = 'No soportado';
    window.showToast?.('Geolocalización no disponible en este dispositivo.');
    return;
  }

  if (stateEl) stateEl.textContent = 'Solicitando permiso...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      if (stateEl) stateEl.textContent = 'Concedido';
      renderNearbyHubs(latitude, longitude, accuracy);
      window.showToast?.('Ubicación detectada correctamente.');
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        if (stateEl) stateEl.textContent = 'Permiso denegado';
        window.showToast?.('Permiso de ubicación denegado por el usuario.');
      } else if (error.code === error.TIMEOUT) {
        if (stateEl) stateEl.textContent = 'Tiempo agotado';
        window.showToast?.('No se pudo obtener la ubicación a tiempo.');
      } else {
        if (stateEl) stateEl.textContent = 'No disponible';
        window.showToast?.('Ubicación no disponible en este momento.');
      }
      if (resultsEl) resultsEl.innerHTML = '';
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
  );
}

async function shareGame(game) {
  const shareText = `${game.title} (${game.platform}) - ${game.price}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `GameStart: ${game.title}`,
        text: shareText,
        url: window.location.href
      });
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      window.showToast?.('Enlace copiado al portapapeles.');
      return;
    } catch (_) {
      // Sin permiso de portapapeles
    }
  }

  window.showToast?.(shareText);
}

window.NativeAPIs = {
  shareGame
};

document.addEventListener('DOMContentLoaded', () => {
  updateNotificationStatusUI();
  initGeolocationStatus();

  document.getElementById('btn-enable-notif')?.addEventListener('click', requestNotificationPermission);
  document.getElementById('btn-test-notif')?.addEventListener('click', async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await showLocalNotification('Nuevo lanzamiento en GameStart', 'Revisa las novedades del catálogo hoy.');
    }
  });

  document.getElementById('btn-get-location')?.addEventListener('click', detectUserLocation);
});
