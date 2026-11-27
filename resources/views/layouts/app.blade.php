<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="description" content="GameStart: catálogo minimalista de videojuegos PWA con modo offline.">
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/icons/icon-192.png">
    <link rel="stylesheet" href="/css/app.css">

    <title>@yield('title', 'GameStart')</title>
</head>
<body>
    <!-- App Shell: cabecera fija -->
    <header class="topbar">
        <div class="topbar-inner">
            <div class="brand">
                <img src="/icons/icon-192.png" alt="GameStart" width="32" height="32">
                <span>GameStart</span>
            </div>

            <nav class="menu-desktop" aria-label="Menú principal">
                <button type="button" class="tab-btn active" data-view="catalog">Catálogo</button>
                <button type="button" class="tab-btn" data-view="library">
                    Favoritos <span id="library-badge" class="badge">0</span>
                </button>
                <button type="button" class="tab-btn" data-view="tools">Funciones</button>
            </nav>

            <div class="top-actions">
                <span id="connection-status" class="net-status online">Online</span>
                <button type="button" id="btn-install-pwa" class="btn btn-primary" hidden>Instalar</button>
            </div>
        </div>
    </header>

    <!-- Contenido dinámico del App Shell -->
    <main class="container">
        @yield('content')
    </main>

    <!-- Notificación flotante ligera -->
    <div id="status-msg" class="status-msg" role="status" aria-live="polite" hidden></div>

    <!-- App Shell: barra inferior móvil -->
    <nav class="menu-mobile" aria-label="Menú móvil">
        <button type="button" class="tab-btn active" data-view="catalog">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M7 12h4M9 10v4M15 11h.01M17 13h.01"/></svg>
            <span>Catálogo</span>
        </button>
        <button type="button" class="tab-btn" data-view="library">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21l-1.45-1.32C5.4 15.03 2 11.95 2 8.2 2 5.2 4.4 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.6 3 22 5.2 22 8.2c0 3.75-3.4 6.83-8.55 11.49L12 21z"/></svg>
            <span>Favoritos</span>
        </button>
        <button type="button" class="tab-btn" data-view="tools">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Funciones</span>
        </button>
    </nav>

    <script src="/js/db.js" defer></script>
    <script src="/js/native-apis.js" defer></script>
    <script src="/js/app.js" defer></script>
</body>
</html>
