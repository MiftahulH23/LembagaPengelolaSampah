<?php
namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\Jadwal;
use App\Models\KartuKeluarga;
use App\Models\LogPengambilan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard utama.
     */
    public function index()
    {
        $user = auth()->user();
        $kelurahanId = optional($user)->kelurahan_id;
        $tahunIni = Carbon::now()->year;

        // Panggil private method untuk setiap set data
        $statistik = $this->getStatistikData($kelurahanId, $tahunIni);
        $grafikIuran = $this->getGrafikIuranData($kelurahanId, $tahunIni);
        $grafikPengambilan = $this->getGrafikPengambilanData($kelurahanId);

        return Inertia::render('dashboard', [
            'statistik' => $statistik,
            'grafikIuran' => $grafikIuran['data'],
            'dataMaxIuran' => $grafikIuran['max_iuran'],
            'grafikPengambilan' => $grafikPengambilan,
        ]);
    }

    /**
     * Mengambil dan memformat data untuk kartu statistik.
     */

    private function getStatistikData(?int $kelurahanId, int $tahunIni): array
    {
        
        $totalKK = KartuKeluarga::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))->count();

       
        $potensiPemasukanTahunan = 0;
        if ($totalKK > 0) {
            $totalNominalSatuTahun = 0;

            // Looping untuk setiap bulan dari Januari (1) hingga Desember (12)
            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $tanggalAkhirBulan = Carbon::create($tahunIni, $bulan, 1)->endOfMonth();

                $iuranBerlaku = Iuran::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))
                    ->where('created_at', '<=', $tanggalAkhirBulan) 
                    ->orderBy('created_at', 'desc') 
                    ->first();

                if ($iuranBerlaku) {
                    $totalNominalSatuTahun += $iuranBerlaku->nominal_iuran;
                }
            }

            $potensiPemasukanTahunan = $totalKK * $totalNominalSatuTahun;
        }
       
        $pemasukanTahunIni = Pembayaran::when(
            $kelurahanId,
            fn($q) => $q->whereHas('kartuKeluarga', fn($k) => $k->where('kelurahan_id', $kelurahanId))
        )
            ->where('tahun', $tahunIni)
            ->sum('jumlah');

        $tanggalHariIni = Carbon::today();
        $namaHariIni = $tanggalHariIni->locale('id')->translatedFormat('l');

        $totalZonaHariIni = Jadwal::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))
            ->where('hari', $namaHariIni)
            ->count();

        $zonaSudahDiambilHariIni = LogPengambilan::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))
            ->where('tanggal_ambil', $tanggalHariIni->toDateString())
            ->count();

        $persentaseSudahDiambil = $totalZonaHariIni > 0 ? ($zonaSudahDiambilHariIni / $totalZonaHariIni) * 100 : 0;

        return [
            'totalKK' => $totalKK,
            'persentaseSudahDiambil' => round($persentaseSudahDiambil),
            'potensiPemasukanTahunan' => 'Rp ' . number_format($potensiPemasukanTahunan, 0, ',', '.'),
            'pemasukanTahunIni' => 'Rp ' . number_format($pemasukanTahunIni, 0, ',', '.'),
        ];
    }

    /**
     * Mengambil dan memformat data untuk grafik iuran.
     */
    private function getGrafikIuranData(?int $kelurahanId, int $tahunIni): array
    {
        $iuranPerBulan = Pembayaran::when(
            $kelurahanId,
            fn($q) => $q->whereHas('kartuKeluarga', fn($k) => $k->where('kelurahan_id', $kelurahanId))
        )
            ->where('tahun', $tahunIni)
            ->select(DB::raw('bulan as bulan'), DB::raw('SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->orderBy('bulan', 'asc')
            ->get()
            ->mapWithKeys(fn($item) => [$item->bulan => $item->total]);

        $maxIuran = $iuranPerBulan->max();
        $dataMaxIuran = $maxIuran > 0 ? (ceil($maxIuran / 20000) * 20000) : 80000;

        $grafikData = [];
        for ($i = 1; $i <= 12; $i++) {
            $grafikData[] = [
                'name' => Carbon::create()->month($i)->translatedFormat('M'),
                'pendapatan' => $iuranPerBulan->get($i, 0),
            ];
        }

        return [
            'data' => $grafikData,
            'max_iuran' => $dataMaxIuran,
        ];
    }

    /**
     * Mengambil dan memformat data untuk grafik pengambilan sampah.
     */
    private function getGrafikPengambilanData(?int $kelurahanId): array
    {
        $startOfWeek = Carbon::now()->startOfWeek();

        $jadwalSeminggu = Jadwal::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))
            ->whereIn('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'])
            ->select('hari', DB::raw('COUNT(zona) as total_zona'))
            ->groupBy('hari')
            ->get()
            ->keyBy('hari');

        $logSeminggu = LogPengambilan::when($kelurahanId, fn($q) => $q->where('kelurahan_id', $kelurahanId))
            ->whereBetween('tanggal_ambil', [$startOfWeek, Carbon::now()->endOfWeek()])
            ->select(DB::raw('DATE(tanggal_ambil) as tanggal'), DB::raw('COUNT(DISTINCT zona) as total_diambil'))
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        $grafikData = [];
        for ($i = 0; $i < 7; $i++) {
            $tanggal = $startOfWeek->copy()->addDays($i);
            $namaHari = $tanggal->locale('id')->translatedFormat('l');

            $totalDijadwalkan = $jadwalSeminggu->get($namaHari)['total_zona'] ?? 0;
            $sudahDiambil = $logSeminggu->get($tanggal->toDateString())['total_diambil'] ?? 0;

            $grafikData[] = [
                'name' => $tanggal->translatedFormat('D'),
                'dijadwalkan' => $totalDijadwalkan,
                'diambil' => $sudahDiambil,
            ];
        }

        return $grafikData;
    }
}
