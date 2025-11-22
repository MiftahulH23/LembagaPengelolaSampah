<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Carbon\Carbon; 

class IuranController extends Controller
{
    public function index()
    {
        $kelurahanId = auth()->user()->kelurahan_id;
        $iuran = Iuran::where('kelurahan_id', $kelurahanId)
            ->orderBy('tanggal_mulai_berlaku', 'desc')
            ->get();
        return Inertia::render('lps/iuran/Index', ['iuran' => $iuran]);
    }


    public function store(Request $request)
    {
        $kelurahanId = auth()->user()->kelurahan_id;

        if ($request->has(['bulan_mulai', 'tahun_mulai', 'bulan_akhir', 'tahun_akhir'])) {
            $request->merge([
                'tanggal_mulai_berlaku' => Carbon::create($request->tahun_mulai, $request->bulan_mulai, 1)
                                                  ->startOfMonth()
                                                  ->toDateString(),
                'tanggal_akhir_berlaku' => Carbon::create($request->tahun_akhir, $request->bulan_akhir, 1)
                                                  ->endOfMonth() 
                                                  ->toDateString(),
            ]);
        }

        $validated = $request->validate([
            'nominal_iuran' => 'required|numeric|min:0',
            // Validasi input baru dari form
            'bulan_mulai' => 'required|integer|between:1,12',
            'tahun_mulai' => 'required|integer|min:2020|max:2050',
            'bulan_akhir' => 'required|integer|between:1,12',
            'tahun_akhir' => 'required|integer|min:2020|max:2050',
            'tanggal_mulai_berlaku' => [
                'required',
                'date',
                Rule::unique('iuran')->where(function ($query) use ($request, $kelurahanId) {
                    return $query->where('kelurahan_id', $kelurahanId)
                        ->where(function ($q) use ($request) {
                            // Logika ini tidak berubah sama sekali
                            $q->whereBetween('tanggal_mulai_berlaku', [$request->tanggal_mulai_berlaku, $request->tanggal_akhir_berlaku])
                                ->orWhereBetween('tanggal_akhir_berlaku', [$request->tanggal_mulai_berlaku, $request->tanggal_akhir_berlaku])
                                ->orWhere(function ($sub) use ($request) {
                                    $sub->where('tanggal_mulai_berlaku', '<', $request->tanggal_mulai_berlaku)
                                        ->where('tanggal_akhir_berlaku', '>', $request->tanggal_akhir_berlaku);
                                });
                        });
                }),
            ],
            'tanggal_akhir_berlaku' => 'required|date|after_or_equal:tanggal_mulai_berlaku',
        ], [
            'nominal_iuran.required' => 'Nominal Iuran harus diisi.',
            'bulan_mulai.required' => 'Bulan Mulai wajib diisi.',
            'tahun_mulai.required' => 'Tahun Mulai wajib diisi.',
            'bulan_akhir.required' => 'Bulan Akhir wajib diisi.',
            'tahun_akhir.required' => 'Tahun Akhir wajib diisi.',
            'tanggal_mulai_berlaku.unique' => 'Periode iuran tidak boleh tumpang tindih dengan periode yang sudah ada.',
            'tanggal_akhir_berlaku.after_or_equal' => 'Periode Akhir harus sama atau setelah Periode Mulai.',
        ]);

        $validated['kelurahan_id'] = $kelurahanId;
       
        Iuran::create($validated);

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil ditambahkan.');
    }

 
    public function update(Request $request, string $id)
    {
        $iuran = Iuran::findOrFail($id);
        $kelurahanId = auth()->user()->kelurahan_id;

        if ($iuran->kelurahan_id !== $kelurahanId) {
            abort(403, 'Unauthorized action.');
        }

        if ($request->has(['bulan_mulai', 'tahun_mulai', 'bulan_akhir', 'tahun_akhir'])) {
            $request->merge([
                'tanggal_mulai_berlaku' => Carbon::create($request->tahun_mulai, $request->bulan_mulai, 1)
                                                  ->startOfMonth()
                                                  ->toDateString(),
                'tanggal_akhir_berlaku' => Carbon::create($request->tahun_akhir, $request->bulan_akhir, 1)
                                                  ->endOfMonth()
                                                  ->toDateString(),
            ]);
        }

        $validated = $request->validate([
            'nominal_iuran' => 'required|numeric|min:0',
            'bulan_mulai' => 'required|integer|between:1,12',
            'tahun_mulai' => 'required|integer|min:2020|max:2050',
            'bulan_akhir' => 'required|integer|between:1,12',
            'tahun_akhir' => 'required|integer|min:2020|max:2050',
            'tanggal_mulai_berlaku' => [
                'required',
                'date',
                Rule::unique('iuran')->where(function ($query) use ($request, $kelurahanId, $id) {
                    return $query->where('kelurahan_id', $kelurahanId)
                        ->where('id', '!=', $id) 
                        ->where(function ($q) use ($request) {
                            $q->whereBetween('tanggal_mulai_berlaku', [$request->tanggal_mulai_berlaku, $request->tanggal_akhir_berlaku])
                                ->orWhereBetween('tanggal_akhir_berlaku', [$request->tanggal_mulai_berlaku, $request->tanggal_akhir_berlaku])
                                ->orWhere(function ($sub) use ($request) {
                                    $sub->where('tanggal_mulai_berlaku', '<', $request->tanggal_mulai_berlaku)
                                        ->where('tanggal_akhir_berlaku', '>', $request->tanggal_akhir_berlaku);
                                });
                        });
                }),
            ],
            'tanggal_akhir_berlaku' => 'required|date|after_or_equal:tanggal_mulai_berlaku',
        ], [
            'nominal_iuran.required' => 'Nominal Iuran harus diisi.',
            'bulan_mulai.required' => 'Bulan Mulai wajib diisi.',
            'tahun_mulai.required' => 'Tahun Mulai wajib diisi.',
            'bulan_akhir.required' => 'Bulan Akhir wajib diisi.',
            'tahun_akhir.required' => 'Tahun Akhir wajib diisi.',
            'tanggal_mulai_berlaku.unique' => 'Periode iuran tidak boleh tumpang tindih dengan periode yang sudah ada.',
            'tanggal_akhir_berlaku.after_or_equal' => 'Periode Akhir harus sama atau setelah Periode Mulai.',
        ]);
        $iuran->update($validated);

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $iuran = Iuran::findOrFail($id);
        if ($iuran->kelurahan_id !== auth()->user()->kelurahan_id) {
            abort(403, 'Unauthorized action.');
        }
        $iuran->delete();

        return redirect()->route('iuran.index')->with('success', 'Iuran berhasil dihapus.');
    }
}