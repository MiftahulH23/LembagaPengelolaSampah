<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IuranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kelurahanId = auth()->user()->kelurahan_id;
        $iuran = Iuran::where('kelurahan_id', $kelurahanId)->orderBy('created_at', 'desc')->get();
        // dd($iuran->toArray());
        return Inertia::render('lps/iuran/Index', ['iuran' => $iuran]);
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
            'nominal_iuran' => 'required|numeric',
        ], [
            'nominal_iuran.required' => 'Nominal Iuran harus diisi',
            'nominal_iuran.numeric' => 'Nominal Iuran harus berupa angka',
        ]);
        $validated['kelurahan_id'] = auth()->user()->kelurahan_id;

        Iuran::create($validated);

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil ditambahkan');
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
            'nominal_iuran' => 'required|numeric',
        ], [
            'nominal_iuran.required' => 'Nominal Iuran harus diisi',
            'nominal_iuran.numeric' => 'Nominal Iuran harus berupa angka',
        ]);

        $iuran = Iuran::findOrFail($id);
        $iuran->update($validated);

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $iuran = Iuran::findOrFail($id);
        $iuran->delete();

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil dihapus');
    }
}
