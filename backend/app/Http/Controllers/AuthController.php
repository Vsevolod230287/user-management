<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrazione utente
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Assegna ruolo se passato
        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        } else {
            $user->assignRole('user');
        }

        // Carica le relazioni
        $user->load(['roles', 'permissions']);

        return response()->json([
            'message' => 'Utente registrato con successo',
            'user' => $user->toUniformArray()
        ], 201);
    }

    /**
     * Login utente
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenziali non corrette.'],
            ]);
        }

        // Carica le relazioni
        $user->load(['roles', 'permissions']);

        // Genera token personale
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->toUniformArray()
        ]);
    }

    /**
     * Logout utente (revoca tutti i token)
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout effettuato'
        ]);
    }

    /**
     * Restituisce informazioni utente loggato
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['roles', 'permissions']);

        return response()->json($user->toUniformArray());
    }
}
