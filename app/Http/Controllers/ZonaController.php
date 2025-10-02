<?php

namespace App\Http\Controllers;

use App\Models\Zona;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ZonaController extends Controller
{
    public function index()
    {
        $kelurahanId = auth()->user()->kelurahan_id;

        $zonas = Zona::where('kelurahan_id', $kelurahanId)
            ->orderBy('nama_zona')
            ->get();

        return Inertia::render('lps/zona/Index', [
            'zonas' => $zonas,
        ]);
    }

    public function store(Request $request)
    {
        $kelurahanId = auth()->user()->kelurahan_id;

        $validated = $request->validate([
            'nama_zona' => [
                'required',
                'string',
                'max:100',
                // Pastikan nama_zona unik untuk kelurahan_id yang sama
                Rule::unique('zona')->where(function ($query) use ($kelurahanId) {
                    return $query->where('kelurahan_id', $kelurahanId);
                }),
            ],
        ]);

        Zona::create([
            'nama_zona' => $validated['nama_zona'],
            'kelurahan_id' => $kelurahanId,
        ]);

        return redirect()->route('zona.index')->with('success', 'Zona berhasil ditambahkan.');
    }

    public function update(Request $request, Zona $zona)
    {
        // Otorisasi: pastikan zona yang diedit milik kelurahan user
        if ($zona->kelurahan_id !== auth()->user()->kelurahan_id) {
            abort(403);
        }

        $kelurahanId = auth()->user()->kelurahan_id;

        $validated = $request->validate([
            'nama_zona' => [
                'required',
                'string',
                'max:100',
                Rule::unique('zona')->where(function ($query) use ($kelurahanId) {
                    return $query->where('kelurahan_id', $kelurahanId);
                })->ignore($zona->id),
            ],
        ]);

        $zona->update($validated);

        return redirect()->route('zona.index')->with('success', 'Zona berhasil diubah.');
    }

    public function destroy(Zona $zona)
    {
        if ($zona->kelurahan_id !== auth()->user()->kelurahan_id) {
            abort(403);
        }

        $zona->delete();

        return redirect()->route('zona.index')->with('success', 'Zona berhasil dihapus.');
    }
}