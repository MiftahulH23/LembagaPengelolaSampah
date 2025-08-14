<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelurahanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kelurahan = Kelurahan::with('kecamatan')->orderBy('nama_kelurahan', 'asc')->get();
        $kecamatan = Kecamatan::select('id', 'nama_kecamatan')->get();
        return Inertia::render('superadmin/kelurahan/Index', [
            'kelurahan' => $kelurahan,
            'kecamatan' => $kecamatan
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
            'nama_kelurahan' => 'required|string|max:255',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ], [
            'kecamatan_id.exists' => 'Kecamatan yang dipilih tidak valid.',
            'kecamatan_id.required' => 'Kecamatan harus dipilih.',
            'nama_kelurahan.required' => 'Nama kelurahan harus diisi.',
            'nama_kelurahan.string' => 'Nama kelurahan harus berupa teks.',
            'nama_kelurahan.max' => 'Nama kelurahan tidak boleh lebih dari 255 karakter.',
        ]);

        Kelurahan::create($validated);

        return redirect()->route('kelurahan.index')->with('success', 'Kelurahan berhasil ditambahkan.');
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
            'nama_kelurahan' => 'required|string|max:255',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ],[
            'kecamatan_id.exists' => 'Kecamatan yang dipilih tidak valid.',
            'kecamatan_id.required' => 'Kecamatan harus dipilih.',
            'nama_kelurahan.required' => 'Nama kelurahan harus diisi.',
            'nama_kelurahan.string' => 'Nama kelurahan harus berupa teks.',
            'nama_kelurahan.max' => 'Nama kelurahan tidak boleh lebih dari 255 karakter.',
        ]);

        Kelurahan::where('id', $id)->update($validated);

        return redirect()->route('kelurahan.index')->with('success', 'Kelurahan berhasil diubah.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Kelurahan::destroy($id);
        return redirect()->route('kelurahan.index')->with('success', 'Kelurahan berhasil dihapus.');
    }
}
