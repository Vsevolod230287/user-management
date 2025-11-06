<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['roles', 'permissions'])->get();

        return response()->json($users->map(function ($user) {
            return $user->toUniformArray();
        }));
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['roles', 'permissions']);

        return response()->json($user->toUniformArray());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $user->update($data);

        // Ricarica le relazioni
        $user->load(['roles', 'permissions']);

        return response()->json($user->toUniformArray());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'Utente eliminato con successo'
        ]);
    }

    /**
     * Assegna ruolo a utente
     */
    public function assignRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => 'required|string|exists:roles,name'
        ]);

        $user->syncRoles([$data['role']]);

        // Ricarica le relazioni
        $user->load(['roles', 'permissions']);

        return response()->json([
            'message' => 'Ruolo assegnato con successo',
            'user' => $user->toUniformArray()
        ]);
    }
}
