<?php
// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\KartuKeluarga;
use App\Models\LogPengambilan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;
        $user = auth()->user();
        $kelurahanId = optional($user)->kelurahan_id;

        // --- 1) DATA STATISTIK UTAMA (KARTU) ---
        $totalKK = KartuKeluarga::when($kelurahanId, fn ($q) => $q->where('kelurahan_id', $kelurahanId))->count();

        $iuranPerBulanStatis = 25000;
        $potensiPemasukanTahunan = $totalKK * $iuranPerBulanStatis * 12;

        $pemasukanTahunIni = Pembayaran::when(
            $kelurahanId,
            fn ($q) => $q->whereHas('kartuKeluarga', fn ($k) => $k->where('kelurahan_id', $kelurahanId))
        )
            ->where('tahun', $tahunIni)
            ->sum('jumlah');

        // --- REVISI UTAMA: LOGIKA PENGAMBILAN SAMPAH ---
        $tanggalHariIni = Carbon::today();
        $namaHariIni = $tanggalHariIni->locale('id')->translatedFormat('l'); // 'Senin', 'Selasa', etc.

        // Hitung total zona yang dijadwalkan hari ini
        $totalZonaHariIni = Jadwal::where('kelurahan_id', $kelurahanId)
            ->where('hari', $namaHariIni)
            ->count();

        // Hitung zona yang sudah diambil log-nya hari ini
        $zonaSudahDiambilHariIni = LogPengambilan::where('kelurahan_id', $kelurahanId)
            ->where('tanggal_ambil', $tanggalHariIni->toDateString())
            ->count();
        
        $persentaseSudahDiambil = $totalZonaHariIni > 0 ? ($zonaSudahDiambilHariIni / $totalZonaHariIni) * 100 : 0;


        // --- 3. DATA GRAFIK IURAN (TIDAK BERUBAH BANYAK) ---
        $iuranPerBulan = Pembayaran::when(
            $kelurahanId,
            fn ($q) => $q->whereHas('kartuKeluarga', fn ($k) => $k->where('kelurahan_id', $kelurahanId))
        )
            ->where('tahun', $tahunIni)
            ->select(DB::raw('bulan as bulan'), DB::raw('SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->orderBy('bulan', 'asc')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->bulan => $item->total]);

        $maxIuran = $iuranPerBulan->max();
        $dataMaxIuran = $maxIuran > 0 ? (ceil($maxIuran / 20000) * 20000) : 80000;

        $grafikIuranData = [];
        for ($i = 1; $i <= 12; $i++) {
            $grafikIuranData[] = [
                'name' => Carbon::create()->month($i)->translatedFormat('M'),
                'pendapatan' => $iuranPerBulan->get($i, 0),
            ];
        }

        // --- 4. REVISI UTAMA: DATA GRAFIK PENGAMBILAN SAMPAH (BARU) ---
        // Menampilkan perbandingan jumlah zona dijadwalkan vs. yang sudah diambil
        $startOfWeek = Carbon::now()->startOfWeek();
        
        // Ambil semua jadwal dalam seminggu
        $jadwalSeminggu = Jadwal::where('kelurahan_id', $kelurahanId)
            ->whereIn('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'])
            ->select('hari', DB::raw('COUNT(zona) as total_zona'))
            ->groupBy('hari')
            ->get()
            ->keyBy('hari');

        // Ambil semua log dalam seminggu
        $logSeminggu = LogPengambilan::where('kelurahan_id', $kelurahanId)
            ->whereBetween('tanggal_ambil', [$startOfWeek, Carbon::now()->endOfWeek()])
            ->select(DB::raw('DATE(tanggal_ambil) as tanggal'), DB::raw('COUNT(DISTINCT zona) as total_diambil'))
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        $grafikPengambilanData = [];
        for ($i = 0; $i < 7; $i++) {
            $tanggal = $startOfWeek->copy()->addDays($i);
            $namaHari = $tanggal->locale('id')->translatedFormat('l');
            
            $totalDijadwalkan = $jadwalSeminggu->get($namaHari)['total_zona'] ?? 0;
            $sudahDiambil = $logSeminggu->get($tanggal->toDateString())['total_diambil'] ?? 0;

            $grafikPengambilanData[] = [
                'name' => $tanggal->translatedFormat('D'), // Sen, Sel, ...
                'dijadwalkan' => $totalDijadwalkan,
                'diambil' => $sudahDiambil,
            ];
        }

        return Inertia::render('dashboard', [
            'statistik' => [
                'totalKK' => $totalKK,
                'persentaseSudahDiambil' => round($persentaseSudahDiambil),
                'potensiPemasukanTahunan' => 'Rp ' . number_format($potensiPemasukanTahunan, 0, ',', '.'),
                'pemasukanTahunIni' => 'Rp ' . number_format($pemasukanTahunIni, 0, ',', '.'),
            ],
            'grafikIuran' => $grafikIuranData,
            'grafikPengambilan' => $grafikPengambilanData,
            'dataMaxIuran' => $dataMaxIuran,
        ]);
    }
}