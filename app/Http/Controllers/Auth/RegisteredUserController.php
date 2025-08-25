<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        $user = User::with('kecamatan')->get();
        $kecamatan = Kecamatan::select('id', 'nama_kecamatan')->get();
        return Inertia::render('auth/register', [
            'user' => $user,
            'kecamatan' => $kecamatan
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'nohp' => 'required|string|max:255|unique:users,nohp',
            'role' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'kecamatan_id' => 'nullable|exists:kecamatan,id',
        ], [
            'username.required' => 'Username wajib diisi',
            'username.string' => 'Username harus berupa teks',
            'username.max' => 'Username tidak boleh lebih dari 255 karakter',
            'nohp.required' => 'No HP wajib diisi',
            'nohp.unique' => 'No HP sudah terdaftar',
            'role.required' => 'Role wajib diisi',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password harus memiliki minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
        ]);

        $user = User::create([
            'username' => $request->username,
            'nohp' => $request->nohp,
            'role' => $request->role,
            'kecamatan_id' => $request->kecamatan_id,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));


        return back()->with('success', 'User registered successfully.');
    }
}
