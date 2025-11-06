<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Rotte pubbliche (non richiedono autenticazione)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotte protette (richiedono autenticazione via Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Gestione utenti (CRUD)
    Route::get('/users', [UserController::class, 'index']);        // lista utenti
    Route::get('/users/{user}', [UserController::class, 'show']); // dettaglio utente
    Route::post('/users', [UserController::class, 'store']);      // crea utente
    Route::put('/users/{user}', [UserController::class, 'update']);   // aggiorna utente
    Route::delete('/users/{user}', [UserController::class, 'destroy']); // elimina utente

    // Assegna ruolo a un utente
    Route::post('/users/{user}/assign-role', [UserController::class, 'assignRole']);
});
