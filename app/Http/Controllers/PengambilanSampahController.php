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

        // 1. Tentukan hari berdasarkan tanggal yang dipilih
        $namaHari = $selectedDate->translatedFormat('l'); // 'Senin', 'Selasa', etc.

        // 2. Ambil jadwal zona untuk hari dan kelurahan tersebut
        $zonaDijadwalkan = Jadwal::where('kelurahan_id', $kelurahanId)
            ->where('hari', $namaHari)
            ->pluck('zona');

        // 3. Ambil log pengambilan yang sudah dilakukan untuk tanggal dan kelurahan tersebut
        $logSudahDiambil = LogPengambilan::where('kelurahan_id', $kelurahanId)
            ->where('tanggal_ambil', $selectedDate->toDateString())
            ->pluck('zona');

        // 4. Gabungkan data untuk dikirim ke frontend
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
        return back(); // Inertia akan me-refresh props secara otomatis
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

        return back();
    }
}