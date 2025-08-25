<?php

namespace App\Http\Controllers;

use App\Models\KartuKeluarga;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KartukeluargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kecamatanId = auth()->user()->kecamatan_id ?? null;

        $kartukeluarga = KartuKeluarga::with(['kecamatan', 'kelurahan'])
            ->where('kecamatan_id', $kecamatanId)
            ->orderBy('created_at', 'desc')
            ->get();
        $kecamatan = Kecamatan::where('id', $kecamatanId)->get();
        $kelurahan = Kelurahan::all();
        return Inertia::render('superadmin/kartukeluarga/Index', [
            'kartukeluarga' => $kartukeluarga,
            'kecamatan' => $kecamatan,
            'kelurahan' => $kelurahan,
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|max:16|unique:kartu_keluarga,nik',
            'nama_kepala_keluarga' => 'required|string|max:100',
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:5',
            'rw' => 'required|string|max:5',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ], [
            'nik.required' => 'NIK wajib diisi.',
            'nik.string' => 'Format NIK harus berupa teks.',
            'nik.max' => 'NIK tidak boleh lebih dari 16 karakter.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nama_kepala_keluarga.required' => 'Nama Kepala Keluarga wajib diisi.',
            'nama_kepala_keluarga.string' => 'Nama Kepala Keluarga harus berupa teks.',
            'nama_kepala_keluarga.max' => 'Nama Kepala Keluarga maksimal 100 karakter.',
            'alamat.required' => 'Alamat wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'alamat.max' => 'Alamat maksimal 255 karakter.',
            'rt.required' => 'RT wajib diisi.',
            'rt.string' => 'RT harus berupa teks.',
            'rt.max' => 'RT maksimal 5 karakter.',
            'rw.required' => 'RW wajib diisi.',
            'rw.string' => 'RW harus berupa teks.',
            'rw.max' => 'RW maksimal 5 karakter.',
            'kelurahan_id.required' => 'Kelurahan wajib dipilih.',
            'kelurahan_id.exists' => 'Kelurahan yang dipilih tidak valid.',
            'kecamatan_id.required' => 'Kecamatan wajib dipilih.',
            'kecamatan_id.exists' => 'Kecamatan yang dipilih tidak valid.',
        ]);

        KartuKeluarga::create($validated);

        return redirect()->route('kartukeluarga.index');
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
        $validated = $request->validate([
            'nik' => 'required|string|max:16|unique:kartu_keluarga,nik,' . $id,
            'nama_kepala_keluarga' => 'required|string|max:100',
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:5',
            'rw' => 'required|string|max:5',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ], [
            'nik.required' => 'NIK wajib diisi.',
            'nik.string' => 'Format NIK harus berupa teks.',
            'nik.max' => 'NIK tidak boleh lebih dari 16 karakter.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nama_kepala_keluarga.required' => 'Nama Kepala Keluarga wajib diisi.',
            'nama_kepala_keluarga.string' => 'Nama Kepala Keluarga harus berupa teks.',
            'nama_kepala_keluarga.max' => 'Nama Kepala Keluarga maksimal 100 karakter.',
            'alamat.required' => 'Alamat wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'alamat.max' => 'Alamat maksimal 255 karakter.',
            'rt.required' => 'RT wajib diisi.',
            'rt.string' => 'RT harus berupa teks.',
            'rt.max' => 'RT maksimal 5 karakter.',
            'rw.required' => 'RW wajib diisi.',
            'rw.string' => 'RW harus berupa teks.',
            'rw.max' => 'RW maksimal 5 karakter.',
            'kelurahan_id.required' => 'Kelurahan wajib dipilih.',
            'kelurahan_id.exists' => 'Kelurahan yang dipilih tidak valid.',
            'kecamatan_id.required' => 'Kecamatan wajib dipilih.',
            'kecamatan_id.exists' => 'Kecamatan yang dipilih tidak valid.',
        ]);

        KartuKeluarga::where('id', $id)->update($validated);

        return redirect()->route('kartukeluarga.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        KartuKeluarga::where('id', $id)->delete();

        return redirect()->route('kartukeluarga.index');
    }
}
