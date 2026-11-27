<?php

use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GameController::class, 'index'])->name('home');
Route::get('/api/games', [GameController::class, 'apiIndex'])->name('api.games');
