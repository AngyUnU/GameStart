@extends('layouts.app')

@section('title', 'GameStart - Catálogo de Videojuegos')

@section('content')
    <!-- Sección Catálogo -->
    <section id="view-catalog" class="page-view active">
        <div class="section-head">
            <div>
                <h1>Catálogo de Videojuegos</h1>
                <p class="subtitle">Guarda juegos para verlos después sin internet.</p>
            </div>
            <input type="search" id="search-input" class="input" placeholder="Buscar juego..." aria-label="Buscar juego">
        </div>

        <div id="games-grid" class="grid">
            @foreach ($games as $game)
                <article class="card">
                    <img src="{{ $game['cover'] }}" alt="{{ $game['title'] }}" class="card-img">
                    <div class="card-body">
                        <small class="tag">{{ $game['genre'] }} &bull; {{ $game['platform'] }}</small>
                        <h2>{{ $game['title'] }}</h2>
                        <p>{{ $game['description'] }}</p>
                        <div class="card-footer">
                            <strong>{{ $game['price'] }}</strong>
                            <div>
                                <button type="button" class="btn btn-secondary btn-save-game" data-game-id="{{ $game['id'] }}">Guardar</button>
                                <button type="button" class="btn btn-outline btn-share-game" data-game-id="{{ $game['id'] }}">Compartir</button>
                            </div>
                        </div>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- Sección Favoritos (IndexedDB) -->
    <section id="view-library" class="page-view">
        <div class="section-head">
            <div>
                <h1>Mis Favoritos (Offline)</h1>
                <p class="subtitle">Guardados localmente con IndexedDB.</p>
            </div>
        </div>

        <form id="custom-note-form" class="box form-box">
            <h3>Agregar nota rápida</h3>
            <input type="text" id="note-game-title" class="input" placeholder="Nombre del juego" required>
            <input type="text" id="note-game-text" class="input" placeholder="Nota o comentario corto" required>
            <button type="submit" class="btn btn-primary">Guardar nota</button>
        </form>

        <div id="library-list" class="grid"></div>
    </section>

    <!-- Sección Funciones Nativas (Web APIs) -->
    <section id="view-tools" class="page-view">
        <div class="section-head">
            <div>
                <h1>Funciones del Dispositivo</h1>
                <p class="subtitle">Prueba de notificaciones y geolocalización.</p>
            </div>
        </div>

        <div class="grid">
            <div class="box">
                <h3>Notificaciones</h3>
                <p class="subtitle">Permiso actual: <strong id="notif-permission-state">Verificando...</strong></p>
                <div class="btn-group">
                    <button type="button" id="btn-enable-notif" class="btn btn-primary">Pedir permiso</button>
                    <button type="button" id="btn-test-notif" class="btn btn-secondary">Enviar alerta</button>
                </div>
            </div>

            <div class="box">
                <h3>Ubicación GPS</h3>
                <p class="subtitle">Estado: <strong id="geo-permission-state">En espera</strong></p>
                <button type="button" id="btn-get-location" class="btn btn-primary">Obtener ubicación</button>
                <div id="geo-results" class="geo-box"></div>
            </div>
        </div>
    </section>
@endsection
