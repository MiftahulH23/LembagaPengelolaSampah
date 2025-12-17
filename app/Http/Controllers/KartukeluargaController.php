<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;

use App\Imports\DataWargaImport;
use App\Models\KartuKeluarga;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Zona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KartukeluargaController extends Controller
{
    
    public function index()
    {
        $kelurahanId = auth()->user()->kelurahan_id ?? null;

        $kartukeluarga = KartuKeluarga::with(['kecamatan', 'kelurahan', 'zona'])
            ->where('kelurahan_id', $kelurahanId)
            ->orderBy('created_at', 'desc')
            ->get();
        $kelurahan = Kelurahan::where('id', $kelurahanId)->get();
        $kecamatanId = $kelurahan->first()->kecamatan_id ?? null;
        $kecamatan = Kecamatan::where('id', $kecamatanId)->get();
        $zonas = Zona::where('kelurahan_id', $kelurahanId)->orderBy('nama_zona')->get();

        return Inertia::render('lps/kartukeluarga/Index', [
            'kartukeluarga' => $kartukeluarga,
            'kelurahan' => $kelurahan,
            'kecamatan' => $kecamatan,
            'zonas' => $zonas,
        ]);
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:255',
            'blok' => 'nullable|string|max:255',
            'rt' => 'nullable|string|max:255',
            'rw' => 'nullable|string|max:255',
            'no_rumah' => 'nullable|string|max:255',
            'zona_id' => 'required|exists:zona,id',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ]);

        KartuKeluarga::create($validated);

        return redirect()->route('kartukeluarga.index');
    }

    
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:255',
            'blok' => 'nullable|string|max:255',
            'rt' => 'nullable|string|max:255',
            'rw' => 'nullable|string|max:255',
            'no_rumah' => 'nullable|string|max:255',
            'zona_id' => 'required|exists:zona,id',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'kecamatan_id' => 'required|exists:kecamatan,id',
        ]);

        KartuKeluarga::where('id', $id)->update($validated);

        return redirect()->route('kartukeluarga.index');
    }

    
    public function destroy(string $id)
    {
        KartuKeluarga::where('id', $id)->delete();
        return redirect()->route('kartukeluarga.index');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls']);
    
        try {
            $user = Auth::user();
            $kelurahan = Kelurahan::find($user->kelurahan_id);
    
            if (!$kelurahan) {
                return redirect()->back()->withErrors(['file' => 'Data kelurahan tidak ditemukan.']);
            }
    
            $kecamatanId = $kelurahan->kecamatan_id;
            Excel::import(new DataWargaImport($user->kelurahan_id, $kecamatanId), $request->file('file'));
    
        } catch (\Throwable $e) {
            Log::error("EXCEPTION SAAT IMPOR LANGSUNG: " . $e->getMessage() . " di file " . $e->getFile() . " baris " . $e->getLine());
            return redirect()->back()->withErrors(['file' => 'Terjadi error saat impor. Silakan cek log untuk detail.']);
        }
    
        return redirect()->route('kartukeluarga.index')->with('success', 'Data berhasil diimpor!');
    }
}