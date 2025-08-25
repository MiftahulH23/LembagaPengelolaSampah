<?php

namespace App\Http\Controllers;

use App\Models\KartuKeluarga;
use App\Models\Pembayaran;
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
        $yearNow = date('Y');
        $selectedYear = $request->input('year', $yearNow);
        $kecamatanId = auth()->user()->kecamatan_id ?? null;


        $kartuKeluarga = KartuKeluarga::with([
            'kelurahan',
            'kecamatan',
            'pembayaran' => function ($query) use ($selectedYear) {
                $query->where('tahun', $selectedYear);
            }
        ])->where('kecamatan_id', $kecamatanId)
            ->orderBy('nama_kepala_keluarga')->get();
        // dd($kartuKeluarga->toArray());

        return Inertia::render('lps/pembayaran/Index', [
            'kartuKeluarga' => $kartuKeluarga,
            'selectedYear' => (int) $selectedYear,
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
            'jumlah' => 'required|numeric|min:0',
            'catatan' => 'nullable|string|max:255',
        ]);

        // Pengecekan duplikasi tetap sama
        $bulanSudahDibayar = Pembayaran::where('kartu_keluarga_id', $kartuKeluarga->id)
            ->where('tahun', $request->tahun)
            ->whereIn('bulan', $request->bulan)
            ->pluck('bulan');

        if ($bulanSudahDibayar->isNotEmpty()) {
            return back()->withErrors(['bulan' => 'Bulan ' . $bulanSudahDibayar->implode(', ') . ' sudah pernah dibayar.']);
        }

        // --- OPTIMASI: Siapkan data untuk bulk insert ---
        $dataToInsert = [];
        $now = now(); // Waktu saat ini untuk timestamp
        $diinputOleh = Auth::user()->username;

        foreach ($request->bulan as $bulan) {
            $dataToInsert[] = [
                'kartu_keluarga_id' => $kartuKeluarga->id,
                'tahun' => $request->tahun,
                'bulan' => $bulan,
                'jumlah' => $request->jumlah,
                'tanggal' => $request->tanggal,
                'catatan' => $request->catatan,
                'diinput_oleh' => $diinputOleh,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- BEST PRACTICE: Jalankan SATU query untuk semua data ---
        if (!empty($dataToInsert)) {
            Pembayaran::insert($dataToInsert);
        }

        // --- BEST PRACTICE: Redirect kembali untuk me-refresh props ---
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
