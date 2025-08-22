<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KartukeluargaController;
use App\Http\Controllers\KecamatanController;
use App\Http\Controllers\KelurahanController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PengambilanSampahController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return Inertia::render('auth/login');
    })->name('home');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('kecamatan', KecamatanController::class);
    Route::resource('kelurahan', KelurahanController::class);
    Route::resource('kartukeluarga', KartukeluargaController::class);

    Route::get('/pembayaran', [PembayaranController::class, 'index'])->name('pembayaran.index');
    Route::post('/pembayaran/{kartuKeluarga}', [PembayaranController::class, 'store'])->name('pembayaran.store');

    Route::get('/pengambilan-sampah', [PengambilanSampahController::class, 'index'])->name('pengambilan-sampah.index');
    Route::post('/pengambilan-sampah/{kartuKeluarga}', [PengambilanSampahController::class, 'store'])->name('pengambilan-sampah.store');
    Route::delete('/pengambilan-sampah/{kartuKeluarga}', [PengambilanSampahController::class, 'destroy'])->name('pengambilan-sampah.destroy');

});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
