@extends('layouts.app')

@section('title', 'GameStart - Catálogo de Videojuegos')

@section('content')
    <!-- Catálogo -->
    <section id="view-catalog" class="page-view active">
        <div class="section-head">
            <div>
                <h1>Catálogo de Videojuegos</h1>
                <p class="subtitle">Explora títulos y guárdalos para consultarlos sin conexión.</p>
            </div>
            <input type="search" id="search-input" class="input search-input" placeholder="Buscar por título o plataforma..." aria-label="Buscar juego">
        </div>

        <div id="games-grid" class="grid">
            @foreach ($games as $game)
                <article class="card">
                    <img src="{{ $game['cover'] }}" alt="{{ $game['title'] }}" class="card-img" loading="lazy">
                    <div class="card-body">
                        <div class="card-meta">
                            <span class="tag">{{ $game['genre'] }}</span>
                            <span class="platform">{{ $game['platform'] }}</span>
                        </div>
                        <h2>{{ $game['title'] }}</h2>
                        <p>{{ $game['description'] }}</p>
                        <div class="card-footer">
                            <span class="price">{{ $game['price'] }}</span>
                            <div class="card-actions">
                                <button type="button" class="btn btn-secondary btn-save-game" data-game-id="{{ $game['id'] }}">Guardar</button>
                                <button type="button" class="btn btn-outline btn-share-game" data-game-id="{{ $game['id'] }}">Compartir</button>
                            </div>
                        </div>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- Favoritos (IndexedDB) -->
    <section id="view-library" class="page-view">
        <div class="section-head">
            <div>
                <h1>Mis Favoritos</h1>
                <p class="subtitle">Datos almacenados en IndexedDB disponibles en modo offline.</p>
            </div>
        </div>

        <form id="custom-note-form" class="box form-box">
            <h3>Agregar nota rápida</h3>
            <div class="form-grid">
                <input type="text" id="note-game-title" class="input" placeholder="Título del juego" required>
                <input type="text" id="note-game-text" class="input" placeholder="Nota o recordatorio" required>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>

        <div id="library-list" class="grid"></div>
    </section>

    <!-- Funciones Nativas (Web APIs) -->
    <section id="view-tools" class="page-view">
        <div class="section-head">
            <div>
                <h1>Funciones del Dispositivo</h1>
                <p class="subtitle">Integración de Web APIs nativas con validación de permisos.</p>
            </div>
        </div>

        <div class="grid tools-grid">
            <div class="box">
                <h3>Notificaciones</h3>
                <p class="subtitle">Recibe alertas de lanzamientos directamente en tu dispositivo.</p>
                <p class="perm-line">Permiso: <strong id="notif-permission-state">Verificando...</strong></p>
                <div class="btn-group">
                    <button type="button" id="btn-enable-notif" class="btn btn-primary">Activar permiso</button>
                    <button type="button" id="btn-test-notif" class="btn btn-secondary">Probar alerta</button>
                </div>
            </div>

            <div class="box">
                <h3>Ubicación GPS</h3>
                <p class="subtitle">Detecta tu ubicación para mostrar puntos gaming cercanos.</p>
                <p class="perm-line">Estado: <strong id="geo-permission-state">En espera</strong></p>
                <div class="btn-group">
                    <button type="button" id="btn-get-location" class="btn btn-primary">Detectar ubicación</button>
                </div>
                <div id="geo-results" class="geo-box"></div>
            </div>

            <form id="custom-game-form" class="box">
                <h3>Agregar nuevo videojuego</h3>
                <p class="subtitle">Selecciona una imagen o toma una foto y guárdalo en IndexedDB.</p>
                <input type="text" id="new-game-title" class="input" placeholder="Título del videojuego" required>
                <div class="stack-row">
                    <input type="text" id="new-game-genre" class="input" placeholder="Género (ej. Aventura)" required>
                    <input type="text" id="new-game-platform" class="input" placeholder="Plataforma (ej. PC / Switch)" required>
                </div>
                <input type="text" id="new-game-price" class="input" placeholder="Precio (ej. $799 MXN)" required>
                <input type="text" id="new-game-desc" class="input" placeholder="Descripción breve" required>

                <input type="file" id="game-image-input" accept="image/*" hidden>
                <div class="btn-group">
                    <button type="button" id="btn-select-image" class="btn btn-secondary">Seleccionar imagen</button>
                    <button type="button" id="btn-open-camera" class="btn btn-outline">Tomar foto</button>
                </div>

                <div id="camera-box" class="media-box" hidden>
                    <video id="camera-preview" class="media-preview" autoplay playsinline muted></video>
                    <div class="btn-group">
                        <button type="button" id="btn-capture-photo" class="btn btn-primary">Capturar foto</button>
                        <button type="button" id="btn-close-camera" class="btn btn-secondary">Cancelar</button>
                    </div>
                </div>

                <div id="image-preview-box" class="media-box" hidden>
                    <img id="game-image-preview" alt="Vista previa de la portada" class="media-preview">
                </div>

                <button type="submit" id="btn-save-custom-game" class="btn btn-primary">Guardar en IndexedDB</button>
            </form>
        </div>
    </section>
@endsection
