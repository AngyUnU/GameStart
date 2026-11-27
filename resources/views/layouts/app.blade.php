<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="description" content="GameStart: catálogo de videojuegos, biblioteca personal offline y radar gaming.">
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GameStart">

    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/icons/icon-192.png">
    <link rel="stylesheet" href="/css/app.css">

    <title>@yield('title', 'GameStart - Catálogo Gamer PWA')</title>
</head>
<body class="app-shell">
    <!-- App Shell: Cabecera fija -->
    <header class="shell-header">
        <div class="header-brand">
            <img src="/icons/icon-192.png" alt="Logo GameStart" class="brand-logo" width="36" height="36">
            <div>
                <h1 class="brand-title">GameStart</h1>
                <span class="brand-subtitle">Catálogo &amp; Biblioteca PWA</span>
            </div>
        </div>

        <nav class="desktop-nav" aria-label="Navegación principal">
            <button type="button" class="nav-tab is-active" data-view="catalog">Catálogo</button>
            <button type="button" class="nav-tab" data-view="library">Mi Biblioteca <span id="library-badge" class="badge">0</span></button>
            <button type="button" class="nav-tab" data-view="radar">Radar Gaming</button>
        </nav>

        <div class="header-actions">
            <span id="connection-status" class="status-pill status-online">En línea</span>
            <button type="button" id="btn-install-pwa" class="btn btn-primary btn-sm" hidden>Instalar App</button>
        </div>
    </header>

    <!-- Contenedor dinámico del App Shell -->
    <main id="app-content" class="shell-main">
        @yield('content')
    </main>

    <!-- App Shell: Barra de navegación inferior para móvil -->
    <nav class="mobile-nav" aria-label="Navegación móvil">
        <button type="button" class="nav-tab is-active" data-view="catalog">
            <span class="nav-icon">&#127918;</span>
            <span>Catálogo</span>
        </button>
        <button type="button" class="nav-tab" data-view="library">
            <span class="nav-icon">&#11088;</span>
            <span>Biblioteca</span>
        </button>
        <button type="button" class="nav-tab" data-view="radar">
            <span class="nav-icon">&#128225;</span>
            <span>Radar</span>
        </button>
    </nav>

    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <script src="/js/install.js" defer></script>
    <script src="/js/db.js" defer></script>
    <script src="/js/app.js" defer></script>
</body>
</html>
