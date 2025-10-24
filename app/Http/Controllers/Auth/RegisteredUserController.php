<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Kelurahan;
use App\Models\User;
use Illuminate\Auth\Events\Registered; // Pastikan ini ada jika event dipakai
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
        $loggedInUser = Auth::user();
        $userQuery = User::with('kelurahan');
        $kelurahanQuery = Kelurahan::select('id', 'nama_kelurahan');

        // --- GUNAKAN if / elseif / else ---
        if ($loggedInUser) {
            $role = $loggedInUser->role;

            if ($role === 'superadmin') {
                // Superadmin: filter user
                $userQuery->whereIn('role', ['superadmin', 'adminLPS']);
                // Superadmin: tidak filter kelurahan
            } elseif ($role === 'adminLPS') {
                // AdminLPS: filter user
                $userQuery->whereIn('role', ['petugasSampah', 'petugasIuran'])
                          ->where('kelurahan_id', $loggedInUser->kelurahan_id);
                // AdminLPS: filter kelurahan
                $kelurahanQuery->where('id', $loggedInUser->kelurahan_id);
            } else {
                // Role lain (petugas, dll.): tidak bisa lihat user
                $userQuery->whereRaw('1 = 0');
                // Role lain: tidak bisa pilih kelurahan (query akan kosong)
                $kelurahanQuery->whereRaw('1 = 0');
            }
        } else {
             // Tidak login: tidak bisa lihat user & kelurahan
             $userQuery->whereRaw('1 = 0');
             $kelurahanQuery->whereRaw('1 = 0');
        }
        // --- AKHIR PENGGUNAAN if / elseif / else ---

        $user = $userQuery->get();
        $kelurahan = $kelurahanQuery->get();

        return Inertia::render('auth/register', [
            'user' => $user,
            'kelurahan' => $kelurahan
        ]);
    }

    /**
     * Handle an incoming registration request.
     * (Method store tidak perlu diubah)
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username', // <-- Tambahkan unique check untuk username
            'nohp' => 'required|string|max:255|unique:users,nohp',
            'role' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'kelurahan_id' => 'required|exists:kelurahan,id', // <-- Ubah ke required jika adminLPS/petugas wajib punya kelurahan
        ], [
            'username.required' => 'Username wajib diisi',
            'username.unique' => 'Username sudah terdaftar', // <-- Tambahkan pesan unique
            // ... pesan error lain ...
            'kelurahan_id.required' => 'Kelurahan wajib dipilih', // <-- Tambahkan pesan required
        ]);

        // Pastikan hanya role yang diizinkan yang bisa dibuat (optional tapi bagus)
        $allowedRolesToCreate = [];
        $loggedInUser = Auth::user();
        if ($loggedInUser) {
            if ($loggedInUser->role === 'superadmin') {
                $allowedRolesToCreate = ['adminLPS', 'superadmin'];
            } elseif ($loggedInUser->role === 'adminLPS') {
                $allowedRolesToCreate = ['petugasSampah', 'petugasIuran'];
            }
        }
        // Jika role yang dikirim tidak ada di list yg diizinkan, gagalkan (misalnya)
        if (!in_array($request->role, $allowedRolesToCreate)) {
             return back()->withErrors(['role' => 'Anda tidak diizinkan membuat akun dengan role ini.']);
        }


        $user = User::create([
            'username' => $request->username,
            'nohp' => $request->nohp,
            'role' => $request->role,
            'kelurahan_id' => $request->kelurahan_id,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        return back()->with('success', 'Akun berhasil ditambahkan.'); // <-- Pesan success lebih konsisten
    }
}