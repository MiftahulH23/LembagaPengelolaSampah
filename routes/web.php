<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\KartukeluargaController;
use App\Http\Controllers\KecamatanController;
use App\Http\Controllers\KelurahanController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PengambilanSampahController;
use App\Http\Controllers\ValidasiPembayaranController;
use App\Http\Controllers\ZonaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return Inertia::render('auth/login');
    })->name('home');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Superadmin
    Route::middleware('role:superadmin')->group(function () {
        Route::resource('kecamatan', KecamatanController::class);
        Route::resource('kelurahan', KelurahanController::class);
    });

    // AdminLPS
    Route::middleware('role:adminLPS')->group(function () {
        Route::resource('kartukeluarga', KartukeluargaController::class);
        Route::post('/kartukeluarga/import', [KartukeluargaController::class, 'import'])->name('kartukeluarga.import');
        Route::resource('iuran', IuranController::class);
        Route::resource('zona', ZonaController::class);

        Route::get('/validasi-pembayaran', [ValidasiPembayaranController::class, 'index'])->name('validasi.index');
        Route::post('/validasi-pembayaran/validate', [ValidasiPembayaranController::class, 'validateSetoran'])->name('validasi.store');
         
        Route::get('/jadwal-pengambilan', [JadwalController::class, 'index'])->name('jadwal.index');
        Route::post('/jadwal-pengambilan', [JadwalController::class, 'store'])->name('jadwal.store');
    });

    // Petugas Iuran
    Route::middleware('role:petugasIuran')->group(function () {
        Route::get('/pembayaran', [PembayaranController::class, 'index'])->name('pembayaran.index');
        Route::post('/pembayaran/{kartuKeluarga}', [PembayaranController::class, 'store'])->name('pembayaran.store');
    });

    // Petugas Sampah
    Route::middleware('role:petugasSampah')->group(function () {
        Route::get('/pengambilan-sampah', [PengambilanSampahController::class, 'index'])->name('pengambilan-sampah.index');
        Route::post('/pengambilan-sampah', [PengambilanSampahController::class, 'store'])->name('pengambilan-sampah.store');
        Route::delete('/pengambilan-sampah', [PengambilanSampahController::class, 'destroy'])->name('pengambilan-sampah.destroy');
    });
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
