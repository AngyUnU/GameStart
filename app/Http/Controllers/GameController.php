<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class GameController extends Controller
{
    /**
     * Lee el catalogo base desde public/data/games.json.
     */
    private function loadGames(): array
    {
        $path = public_path('data/games.json');
        if (!file_exists($path)) {
            return [];
        }

        $decoded = json_decode(file_get_contents($path), true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Vista principal SSR con arquitectura App Shell.
     */
    public function index(): View
    {
        return view('games.index', [
            'games' => $this->loadGames(),
        ]);
    }

    /**
     * Endpoint JSON del catalogo para sincronizacion dinamica.
     */
    public function apiIndex(): JsonResponse
    {
        return response()->json($this->loadGames());
    }
}
