<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\KartuKeluarga;
use App\Models\Pembayaran;
use App\Models\Zona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // <-- IMPORT DB
use Inertia\Inertia;
use Carbon\Carbon; // Import Carbon

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $selectedYear = $request->input('year', date('Y'));
        $kelurahanId = auth()->user()->kelurahan_id ?? null;

        $kartuKeluarga = KartuKeluarga::with([
            'kelurahan',
            'kecamatan',
            'zona',
            // Load pembayaran hanya untuk tahun terpilih
            'pembayaran' => fn($q) => $q->where('tahun', $selectedYear)
        ])
            ->where('kelurahan_id', $kelurahanId)
            ->orderBy('nama')->get();

        // REVISI: Ambil SEMUA data iuran yang relevan
        $iuranPeriods = Iuran::where('kelurahan_id', $kelurahanId)
            ->orderBy('tanggal_mulai_berlaku', 'desc')
            ->get();

        $zonas = Zona::where('kelurahan_id', $kelurahanId)->get(); // Hanya zona di kelurahan user

        return Inertia::render('lps/pembayaran/Index', [
            'kartuKeluarga' => $kartuKeluarga,
            'selectedYear' => (int) $selectedYear,
            'iuranTerbaru' => $iuranPeriods->first(), // Tetap kirim untuk fallback (walau frontend baru tak pakai)
            'semuaPeriodeIuran' => $iuranPeriods, // <-- REVISI: Kirim semua periode ke frontend
            'zonas' => $zonas,
        ]);
    }

    public function store(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $validated = $request->validate([
            'bulan' => 'required|array|min:1',
            'bulan.*' => 'required|integer|between:1,12',
            'tahun' => 'required|integer',
            'tanggal' => 'required|date', // Ini adalah tanggal pencatatan pembayaran
            'catatan' => 'nullable|string|max:255',
        ]);

        // Cek dulu bulan yang sudah dibayar (Logika ini tetap penting)
        $bulanSudahDibayar = Pembayaran::where('kartu_keluarga_id', $kartuKeluarga->id)
            ->where('tahun', $validated['tahun'])
            ->whereIn('bulan', $validated['bulan'])
            ->pluck('bulan');

        if ($bulanSudahDibayar->isNotEmpty()) {
            return back()->withErrors(['bulan' => 'Bulan ' . $bulanSudahDibayar->implode(', ') . ' sudah pernah dibayar.']);
        }

        $dataToInsert = [];
        $now = now();
        $diinputOleh = Auth::user()->username; // Nanti diganti user ID

        // --- REVISI UTAMA: Gunakan Transaksi dan Cek Iuran Per Bulan ---
        try {
            DB::beginTransaction();

            foreach ($validated['bulan'] as $bulan) {
                // Buat tanggal representatif untuk bulan yang dibayar (misal: 1 Januari 2025)
                $tanggalBulanBerlaku = Carbon::create($validated['tahun'], $bulan, 1)->startOfDay();

                // Cari iuran yang berlaku untuk bulan tersebut
                $iuranBerlaku = Iuran::where('kelurahan_id', $kartuKeluarga->kelurahan_id)
                    ->where('tanggal_mulai_berlaku', '<=', $tanggalBulanBerlaku)
                    ->where('tanggal_akhir_berlaku', '>=', $tanggalBulanBerlaku)
                    ->first(); // Ambil satu yang cocok

                // Jika tidak ada iuran yang di-set untuk bulan itu, batalkan semua
                if (!$iuranBerlaku) {
                    DB::rollBack();
                    $namaBulan = $tanggalBulanBerlaku->locale('id')->monthName;
                    return back()->withErrors(['bulan' => "Tidak ada tarif iuran yang berlaku untuk bulan {$namaBulan} {$validated['tahun']}. Silakan atur di menu Iuran."]);
                }

                // Kumpulkan data untuk insert
                $dataToInsert[] = [
                    'kartu_keluarga_id' => $kartuKeluarga->id,
                    'iuran_id' => $iuranBerlaku->id, 
                    'tahun' => $validated['tahun'],
                    'bulan' => $bulan,
                    'jumlah' => $iuranBerlaku->nominal_iuran, 
                    'tanggal' => $validated['tanggal'], 
                    'catatan' => $validated['catatan'],
                    'diinput_oleh' => $diinputOleh,
                    'status_validasi' => 'pending',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Insert semua data sekaligus jika loop berhasil
            if (!empty($dataToInsert)) {
                Pembayaran::insert($dataToInsert);
            }

            DB::commit(); // Semua sukses, simpan ke DB
        } catch (\Exception $e) {
            DB::rollBack(); // Ada error, batalkan
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage());
        }

        return redirect()->route('pembayaran.index', ['year' => $validated['tahun']])
            ->with('success', 'Pembayaran berhasil disimpan.');
    }
}