<?php
// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

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
        $kecamatanId = optional($user)->kecamatan_id; // null jika tidak ada

        // --- 1) DATA STATISTIK UTAMA (KARTU) ---
        $totalKK = KartuKeluarga::when(
            $kecamatanId,
            fn($q) =>
            $q->where('kecamatan_id', $kecamatanId)
        )->count();

        $iuranPerBulanStatis = 25000;
        $potensiPemasukanTahunan = $totalKK * $iuranPerBulanStatis * 12;

        $pemasukanTahunIni = Pembayaran::when(
            $kecamatanId,
            fn($q) =>
            $q->whereHas('kartuKeluarga', fn($k) => $k->where('kecamatan_id', $kecamatanId))
        )
            ->where('tahun', $tahunIni)
            ->sum('jumlah');

        // --- 2) DATA BULAN INI ---
        $queryPembayaranBulanIni = Pembayaran::where('tahun', $tahunIni)
            ->where('bulan', $bulanIni)
            ->when(
                $kecamatanId,
                fn($q) =>
                $q->whereHas('kartuKeluarga', fn($k) => $k->where('kecamatan_id', $kecamatanId))
            );

        // total iuran bulan ini (jumlah uang)
        $totalIuranBulanIni = (clone $queryPembayaranBulanIni)->sum('jumlah');

        // jumlah KK unik yang sudah bayar bulan ini
        $kkSudahBayarBulanIni = (clone $queryPembayaranBulanIni)
            ->distinct()
            ->count('kartu_keluarga_id');

        $persentaseSudahBayar = $totalKK > 0 ? ($kkSudahBayarBulanIni / $totalKK) * 100 : 0;
        $tanggalHariIni = Carbon::today()->toDateString();
        $kkSudahDiambilHariIni = LogPengambilan::where('tanggal_ambil', $tanggalHariIni)->count();
        $persentaseSudahDiambil = $totalKK > 0 ? ($kkSudahDiambilHariIni / $totalKK) * 100 : 0;

        // --- 2. DATA UNTUK GRAFIK IURAN TAHUNAN ---
        $iuranPerBulan = Pembayaran::when(
            $kecamatanId,
            fn($q) =>
            $q->whereHas('kartuKeluarga', fn($k) => $k->where('kecamatan_id', $kecamatanId))
        )
            ->where('tahun', $tahunIni)
            ->select(DB::raw('bulan as bulan'), DB::raw('SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->orderBy('bulan', 'asc')
            ->get()
            ->mapWithKeys(fn($item) => [$item->bulan => $item->total]);


        // --- REVISI: Hitung nilai maksimum untuk domain chart ---
        $maxIuran = $iuranPerBulan->max();
        // Buat buffer, bulatkan ke atas ke 20,000 terdekat agar skala terlihat bagus
        $dataMaxIuran = $maxIuran > 0 ? (ceil($maxIuran / 20000) * 20000) : 80000; // default 80k jika belum ada data

        $grafikIuranData = [];
        for ($i = 1; $i <= 12; $i++) {
            $grafikIuranData[] = [
                'name' => Carbon::create()->month($i)->translatedFormat('M'),
                'pendapatan' => $iuranPerBulan->get($i, 0),
            ];
        }

        // --- 3. DATA UNTUK GRAFIK PENGAMBILAN SAMPAH MINGGUAN ---
        $logMingguan = LogPengambilan::when(
            $kecamatanId,
            fn($q) =>
            $q->whereHas('kartuKeluarga', fn($k) => $k->where('kecamatan_id', $kecamatanId))
        )->whereBetween('tanggal_ambil', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->select(DB::raw('DATE(tanggal_ambil) as tanggal'), DB::raw('COUNT(*) as total'))
            ->groupBy('tanggal')->orderBy('tanggal', 'asc')->get()
            ->mapWithKeys(fn($item) => [$item->tanggal => $item->total]);

        $grafikPengambilanData = [];
        for ($i = 0; $i < 7; $i++) {
            $tanggal = Carbon::now()->startOfWeek()->copy()->addDays($i);
            $grafikPengambilanData[] = [
                'name' => $tanggal->translatedFormat('D'),
                'rumah' => $logMingguan->get($tanggal->toDateString(), 0),
            ];
        }

        return Inertia::render('dashboard', [
            'statistik' => [
                'totalKK' => $totalKK,
                'totalIuranBulanIni' => number_format($totalIuranBulanIni, 0, ',', '.'),
                'persentaseSudahBayar' => round($persentaseSudahBayar),
                'persentaseSudahDiambil' => round($persentaseSudahDiambil),
                'potensiPemasukanTahunan' => 'Rp ' . number_format($potensiPemasukanTahunan, 0, ',', '.'),
                'pemasukanTahunIni' => 'Rp ' . number_format($pemasukanTahunIni, 0, ',', '.'),
            ],
            'grafikIuran' => $grafikIuranData,
            'grafikPengambilan' => $grafikPengambilanData,
            // --- REVISI: Kirim dataMaxIuran sebagai prop baru ---
            'dataMaxIuran' => $dataMaxIuran,
        ]);
    }
}