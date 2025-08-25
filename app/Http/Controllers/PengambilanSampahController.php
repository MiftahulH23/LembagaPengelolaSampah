<?php

namespace App\Http\Controllers;

use App\Models\KartuKeluarga;
use App\Models\LogPengambilan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengambilanSampahController extends Controller
{
    public function index(Request $request)
    {
        // Validasi tanggal, jika tidak ada, gunakan tanggal hari ini
        $request->validate(['date' => 'nullable|date_format:Y-m-d']);
        $selectedDate = $request->input('date', Carbon::today()->toDateString());
        $kecamatanId = auth()->user()->kecamatan_id ?? null;

        // Ambil semua KK dan status pengambilan HANYA untuk tanggal yang dipilih
        // Ini sangat efisien karena tidak mengambil semua riwayat log
        $kartuKeluarga = KartuKeluarga::with([
            'kelurahan',
            'kecamatan',
            'logPengambilanHariIni' => function ($query) use ($selectedDate) {
                $query->where('tanggal_ambil', $selectedDate);
            }
        ])->where('kecamatan_id', $kecamatanId)
            ->orderBy('nama_kepala_keluarga')->get();

        return Inertia::render('lps/pengambilan-sampah/Index', [
            'kartuKeluarga' => $kartuKeluarga,
            'selectedDate' => $selectedDate,
        ]);
    }

    // Aksi untuk menandai "Sudah Diambil"
    public function store(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        // findOrCreate untuk efisiensi
        LogPengambilan::firstOrCreate(
            [
                'kartu_keluarga_id' => $kartuKeluarga->id,
                'tanggal_ambil' => $request->date,
            ],
            [
                'status' => 'Diambil',
                'diinput_oleh' => Auth::user()->username,
            ]
        );

        return back()->with('success', 'Status berhasil diperbarui.');
    }

    // Aksi untuk "Batalkan" / Mengembalikan ke status "Menunggu"
    public function destroy(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        LogPengambilan::where('kartu_keluarga_id', $kartuKeluarga->id)
            ->where('tanggal_ambil', $request->date)
            ->delete();

        return back()->with('success', 'Status berhasil dibatalkan.');
    }
}