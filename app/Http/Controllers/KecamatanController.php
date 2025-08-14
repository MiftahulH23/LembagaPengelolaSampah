<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KecamatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch data for the Kecamatan index page
        $kecamatan = Kecamatan::orderBy('nama_kecamatan', 'asc')->get();
        // dd($kecamatan); 
        return Inertia::render('superadmin/kecamatan/Index', [
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
        // Validate and store the new Kecamatan data
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Kecamatan::destroy($id);
        return redirect()->route('kecamatan.index')->with('success', 'Kecamatan deleted successfully.');
    }
}
