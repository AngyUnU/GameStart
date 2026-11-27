// Manejo del prompt de instalacion PWA
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn) {
    installBtn.hidden = false;
  }
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn) {
    installBtn.hidden = true;
  }
});

window.triggerPwaInstall = async () => {
  if (!deferredInstallPrompt) {
    return false;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn && outcome === 'accepted') {
    installBtn.hidden = true;
  }
  return outcome === 'accepted';
};
