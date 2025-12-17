<?php
namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\KartuKeluarga;
use App\Models\Zona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index()
    {
        $kelurahanId = auth()->user()->kelurahan_id;

        if (!$kelurahanId) {
            return redirect()->back()->with('error', 'Anda tidak terasosiasi dengan kelurahan manapun.');
        }

        // Ambil semua zona unik dari kartu_keluarga untuk kelurahan ini
       $listZona = Zona::where('kelurahan_id', $kelurahanId)
            ->orderBy('nama_zona')
            ->get(); 

        // Ambil jadwal yang sudah ada dari database
        $jadwalTersimpan = Jadwal::where('kelurahan_id', $kelurahanId)
            ->get()
            ->groupBy('hari');

        // Format data jadwal untuk dikirim ke frontend
        $jadwalData = collect(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'])
            ->mapWithKeys(function ($hari) use ($jadwalTersimpan) {
                $zonaUntukHariIni = $jadwalTersimpan->get($hari, collect())->pluck('zona');
                return [$hari => $zonaUntukHariIni];
            });

        return Inertia::render('lps/jadwal/Index', [
            'semuaZona' => $listZona,
            'jadwalTersimpan' => $jadwalData,
        ]);
    }

    public function store(Request $request)
    {
        $kelurahanId = auth()->user()->kelurahan_id;

        $validated = $request->validate([
            'hari' => 'required|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'zona' => 'nullable|array',
            'zona.*' => 'string', 
        ]);
        
        DB::transaction(function () use ($validated, $kelurahanId) {
            Jadwal::where('kelurahan_id', $kelurahanId)
                  ->where('hari', $validated['hari'])
                  ->delete();

            $dataToInsert = [];
            $now = now();
            
            if (!empty($validated['zona'])) {
                foreach ($validated['zona'] as $zona) {
                    $dataToInsert[] = [
                        'kelurahan_id' => $kelurahanId,
                        'hari' => $validated['hari'],
                        'zona' => $zona,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            
            if (!empty($dataToInsert)) {
                Jadwal::insert($dataToInsert);
            }
        });

        return to_route('jadwal.index')
            ->with('success', 'Jadwal untuk hari ' . $validated['hari'] . ' berhasil diperbarui.');
    }
}