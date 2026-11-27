<?php

namespace Tests\Feature;

use Tests\TestCase;

class GameStartPwaTest extends TestCase
{
    public function test_home_renders_app_shell_and_manifest_link(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('GameStart');
        $response->assertSee('/manifest.json');
        $response->assertSee('/css/app.css');
        $response->assertSee('/js/db.js');
        $response->assertSee('/js/native-apis.js');
        $response->assertSee('Seleccionar imagen');
        $response->assertSee('Tomar foto');
        $response->assertSee('Guardar en IndexedDB');
    }

    public function test_games_api_returns_catalog_json(): void
    {
        $response = $this->get('/api/games');

        $response->assertStatus(200);
        $response->assertJsonCount(6);
    }
}
