@extends('layouts.app')

@section('title', 'GameStart - Catálogo y Biblioteca Gamer')

@section('content')
    <!-- Vista 1: Catálogo -->
    <section id="view-catalog" class="view-section is-active">
        <div class="section-toolbar">
            <div>
                <h2 class="section-title">Catálogo de Videojuegos</h2>
                <p class="section-desc">Explora títulos destacados y guárdalos para consultarlos incluso sin internet.</p>
            </div>
            <div class="filters-bar">
                <input
                    type="search"
                    id="search-input"
                    class="input"
                    placeholder="Buscar juego o plataforma..."
                    aria-label="Buscar videojuegos"
                >
                <select id="genre-filter" class="select" aria-label="Filtrar por género">
                    <option value="all">Todos los géneros</option>
                    <option value="Aventura">Aventura</option>
                    <option value="RPG">RPG</option>
                    <option value="Acción RPG">Acción RPG</option>
                    <option value="RPG Táctico">RPG Táctico</option>
                    <option value="Metroidvania">Metroidvania</option>
                    <option value="Roguelike">Roguelike</option>
                    <option value="Plataformas">Plataformas</option>
                </select>
            </div>
        </div>

        <div id="games-grid" class="games-grid">
            @foreach ($games as $game)
                <article class="game-card" data-id="{{ $game['id'] }}">
                    <img src="{{ $game['cover'] }}" alt="{{ $game['title'] }}" class="game-cover" loading="lazy">
                    <div class="game-body">
                        <div class="game-meta">
                            <span class="tag">{{ $game['genre'] }}</span>
                            <span class="rating">&#9733; {{ number_format($game['rating'], 1) }}</span>
                        </div>
                        <h3 class="game-title">{{ $game['title'] }}</h3>
                        <p class="game-platform">{{ $game['platform'] }} &bull; {{ $game['year'] }}</p>
                        <p class="game-desc">{{ $game['description'] }}</p>
                        <div class="game-footer">
                            <span class="game-price">{{ $game['price'] }}</span>
                            <div class="card-actions">
                                <button type="button" class="btn btn-secondary btn-sm btn-save-game" data-game-id="{{ $game['id'] }}">Guardar</button>
                                <button type="button" class="btn btn-ghost btn-sm btn-share-game" data-game-id="{{ $game['id'] }}">Compartir</button>
                            </div>
                        </div>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- Vista 2: Mi Biblioteca (IndexedDB Offline) -->
    <section id="view-library" class="view-section">
        <div class="section-toolbar">
            <div>
                <h2 class="section-title">Mi Biblioteca Offline</h2>
                <p class="section-desc">Juegos guardados y notas personales almacenadas localmente con IndexedDB.</p>
            </div>
            <div class="filters-bar">
                <select id="library-status-filter" class="select" aria-label="Filtrar estado">
                    <option value="all">Todos los estados</option>
                    <option value="Por jugar">Por jugar</option>
                    <option value="Jugando">Jugando</option>
                    <option value="Completado">Completado</option>
                </select>
            </div>
        </div>

        <form id="custom-note-form" class="note-form card-panel">
            <h3>Agregar nota o juego pendiente (Offline)</h3>
            <div class="form-row">
                <input type="text" id="note-game-title" class="input" placeholder="Título del juego" required>
                <select id="note-game-status" class="select">
                    <option value="Por jugar">Por jugar</option>
                    <option value="Jugando">Jugando</option>
                    <option value="Completado">Completado</option>
                </select>
            </div>
            <textarea id="note-game-text" class="textarea" rows="2" placeholder="Reseña rápida o progreso actual..." required></textarea>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-sm">Guardar en IndexedDB</button>
            </div>
        </form>

        <div id="library-list" class="library-grid"></div>
    </section>

    <!-- Vista 3: Radar Gaming (Web APIs Nativas) -->
    <section id="view-radar" class="view-section">
        <div class="section-toolbar">
            <div>
                <h2 class="section-title">Radar Gaming y Capacidades Nativas</h2>
                <p class="section-desc">Notificaciones de lanzamientos, ubicación para torneos/tiendas y compartir juegos.</p>
            </div>
        </div>

        <div class="radar-grid">
            <article class="card-panel">
                <h3>Notificaciones de Lanzamientos</h3>
                <p class="muted">Recibe alertas locales sobre estrenos y descuentos gamer.</p>
                <p class="permission-line">Estado del permiso: <strong id="notif-permission-state">Verificando...</strong></p>
                <div class="panel-actions">
                    <button type="button" id="btn-enable-notif" class="btn btn-primary btn-sm">Activar Notificaciones</button>
                    <button type="button" id="btn-test-notif" class="btn btn-secondary btn-sm">Probar Alerta</button>
                </div>
            </article>

            <article class="card-panel">
                <h3>Tiendas y Torneos Cercanos (GPS)</h3>
                <p class="muted">Consulta tu ubicación actual para calcular distancia a puntos gaming.</p>
                <p class="permission-line">Estado GPS: <strong id="geo-permission-state">En espera</strong></p>
                <div class="panel-actions">
                    <button type="button" id="btn-get-location" class="btn btn-primary btn-sm">Detectar Ubicación</button>
                </div>
                <div id="geo-results" class="geo-results"></div>
            </article>
        </div>
    </section>
@endsection
