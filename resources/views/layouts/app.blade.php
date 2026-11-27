<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="GameStart: catálogo sencillo de videojuegos PWA con modo offline.">
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/icons/icon-192.png">
    <link rel="stylesheet" href="/css/app.css">

    <title>@yield('title', 'GameStart PWA')</title>
</head>
<body>
    <!-- App Shell: barra superior -->
    <header class="topbar">
        <div class="brand">
            <img src="/icons/icon-192.png" alt="GameStart" width="32" height="32">
            <strong>GameStart</strong>
        </div>

        <nav class="menu-desktop" aria-label="Menú principal">
            <button type="button" class="tab-btn active" data-view="catalog">Catálogo</button>
            <button type="button" class="tab-btn" data-view="library">Favoritos (<span id="library-badge">0</span>)</button>
            <button type="button" class="tab-btn" data-view="tools">Funciones</button>
        </nav>

        <div class="top-actions">
            <span id="connection-status" class="net-status online">Online</span>
            <button type="button" id="btn-install-pwa" class="btn btn-primary" hidden>Instalar</button>
        </div>
    </header>

    <!-- Contenido dinámico -->
    <main class="container">
        <div id="status-msg" class="status-msg" hidden></div>
        @yield('content')
    </main>

    <!-- App Shell: barra inferior en móvil -->
    <nav class="menu-mobile" aria-label="Menú móvil">
        <button type="button" class="tab-btn active" data-view="catalog">Catálogo</button>
        <button type="button" class="tab-btn" data-view="library">Favoritos</button>
        <button type="button" class="tab-btn" data-view="tools">Funciones</button>
    </nav>

    <script src="/js/db.js" defer></script>
    <script src="/js/native-apis.js" defer></script>
    <script src="/js/app.js" defer></script>
</body>
</html>
