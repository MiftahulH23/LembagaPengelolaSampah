<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KecamatanController extends Controller
{
    
    public function index()
    {
        $kecamatan = Kecamatan::orderBy('nama_kecamatan', 'asc')->get();
        return Inertia::render('superadmin/kecamatan/Index', [
            'kecamatan' => $kecamatan
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        
        $request->validate([
            'nama_kecamatan' => 'required|string|max:255',
        ],[
            'nama_kecamatan.required' => 'Nama Kecamatan harus diisi.',
            'nama_kecamatan.string' => 'Nama Kecamatan harus berupa teks.',
            'nama_kecamatan.max' => 'Nama Kecamatan tidak boleh lebih dari 255 karakter.',
        ]);

        Kecamatan::create($request->all());

        return redirect()->route('kecamatan.index')->with('success', 'Kecamatan created successfully.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'nama_kecamatan' => 'required|string|max:255',
        ],[
            'nama_kecamatan.required' => 'Nama Kecamatan harus diisi.',
            'nama_kecamatan.string' => 'Nama Kecamatan harus berupa teks.',
            'nama_kecamatan.max' => 'Nama Kecamatan tidak boleh lebih dari 255 karakter.',
        ]);
        $kecamatan = Kecamatan::findOrFail($id);
        $kecamatan->update($request->all());
        return redirect()->route('kecamatan.index')->with('success', 'Kecamatan updated successfully.');

    }

    public function destroy(string $id)
    {
        Kecamatan::destroy($id);
        return redirect()->route('kecamatan.index')->with('success', 'Kecamatan deleted successfully.');
    }
}
