<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\KartuKeluarga;
use App\Models\Pembayaran;
use App\Models\Zona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $selectedYear = $request->input('year', date('Y'));
        $kelurahanId = auth()->user()->kelurahan_id ?? null;

        $kartuKeluarga = KartuKeluarga::with([
            'kelurahan',
            'kecamatan',
            'zona',
            'pembayaran' => fn($q) => $q->where('tahun', $selectedYear)
        ])
            ->where('kelurahan_id', $kelurahanId)
            ->orderBy('nama')->get();

        // REVISI: Ambil data iuran terbaru untuk kelurahan yang login
        $iuranTerbaru = Iuran::where('kelurahan_id', $kelurahanId)
            ->orderBy('created_at', 'desc')
            ->first();

        $zonas = Zona::all();

        return Inertia::render('lps/pembayaran/Index', [
            'kartuKeluarga' => $kartuKeluarga,
            'selectedYear' => (int) $selectedYear,
            'iuranTerbaru' => $iuranTerbaru, // Kirim iuran terbaru sebagai prop
            'zonas' => $zonas,
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $request->validate([
            'bulan' => 'required|array|min:1',
            'bulan.*' => 'required|integer|between:1,12',
            'tahun' => 'required|integer',
            'tanggal' => 'required|date',
            'catatan' => 'nullable|string|max:255',
        ]);

        // REVISI: Ambil iuran terbaru dari database, bukan dari request
        $iuran = Iuran::where('kelurahan_id', $kartuKeluarga->kelurahan_id)
            ->orderBy('created_at', 'desc')
            ->firstOrFail();

            // dd($iuran->toArray()); // Gagal jika tidak ada iuran yang terdaftar untuk kelurahan tsb

        $bulanSudahDibayar = Pembayaran::where('kartu_keluarga_id', $kartuKeluarga->id)
            ->where('tahun', $request->tahun)
            ->whereIn('bulan', $request->bulan)
            ->pluck('bulan');

        if ($bulanSudahDibayar->isNotEmpty()) {
            return back()->withErrors(['bulan' => 'Bulan ' . $bulanSudahDibayar->implode(', ') . ' sudah pernah dibayar.']);
        }

        $dataToInsert = [];
        $now = now();
        $diinputOleh = Auth::user()->username;

        foreach ($request->bulan as $bulan) {
            $dataToInsert[] = [
                'kartu_keluarga_id' => $kartuKeluarga->id,
                'iuran_id' => $iuran->id, // Simpan ID iuran yang digunakan
                'tahun' => $request->tahun,
                'bulan' => $bulan,
                'jumlah' => $iuran->nominal_iuran, // Gunakan nominal dari iuran
                'tanggal' => $request->tanggal,
                'catatan' => $request->catatan,
                'diinput_oleh' => $diinputOleh,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($dataToInsert)) {
            Pembayaran::insert($dataToInsert);
        }

        return to_route('pembayaran.index', ['year' => $request->tahun])
            ->with('success', 'Pembayaran berhasil disimpan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
