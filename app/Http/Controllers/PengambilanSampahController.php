<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\LogPengambilan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengambilanSampahController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['date' => 'nullable|date_format:Y-m-d']);
        $selectedDate = Carbon::parse($request->input('date', 'today'));
        $user = auth()->user();
        $kelurahanId = $user->kelurahan_id;

        // --- REVISI UTAMA: Pastikan locale adalah 'id' ---
        // Ini memastikan Carbon menghasilkan "Senin", "Selasa", dll.
        $namaHari = $selectedDate->locale('id')->translatedFormat('l');

        // Ambil jadwal zona untuk hari dan kelurahan tersebut
        $zonaDijadwalkan = Jadwal::where('kelurahan_id', $kelurahanId)
            ->where('hari', $namaHari)
            ->pluck('zona');

        // Ambil log pengambilan yang sudah dilakukan
        $logSudahDiambil = LogPengambilan::where('kelurahan_id', $kelurahanId)
            ->where('tanggal_ambil', $selectedDate->toDateString())
            ->pluck('zona');

        // Gabungkan data untuk dikirim ke frontend
        $checklistData = $zonaDijadwalkan->map(function ($zona) use ($logSudahDiambil) {
            return [
                'zona' => $zona,
                'status' => $logSudahDiambil->contains($zona) ? 'Sudah Diambil' : 'Menunggu',
            ];
        });

        return Inertia::render('lps/pengambilan-sampah/Index', [
            'checklistData' => $checklistData,
            'selectedDate' => $selectedDate->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'zona' => 'required|string',
        ]);
        $user = auth()->user();

        LogPengambilan::firstOrCreate(
            [
                'kelurahan_id' => $user->kelurahan_id,
                'zona' => $validated['zona'],
                'tanggal_ambil' => $validated['date'],
            ],
            [
                'status' => 'Diambil',
                'diinput_oleh' => $user->username,
            ]
        );
        // --- BEST PRACTICE: Gunakan to_route untuk refresh data ---
        return to_route('pengambilan-sampah.index', ['date' => $validated['date']])
            ->with('success', 'Status berhasil diperbarui.');
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'zona' => 'required|string',
        ]);
        $user = auth()->user();

        LogPengambilan::where('kelurahan_id', $user->kelurahan_id)
            ->where('zona', $validated['zona'])
            ->where('tanggal_ambil', $validated['date'])
            ->delete();

        // --- BEST PRACTICE: Gunakan to_route untuk refresh data ---
        return to_route('pengambilan-sampah.index', ['date' => $validated['date']])
            ->with('success', 'Status berhasil dibatalkan.');
    }
}