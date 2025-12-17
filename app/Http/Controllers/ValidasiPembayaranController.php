<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ValidasiPembayaranController extends Controller
{
    public function index(Request $request)
    {
        // Ambil tanggal dari request, jika tidak ada, pakai hari ini
        $tanggalFilter = $request->input('tanggal', Carbon::today()->toDateString());
        $tanggal = Carbon::parse($tanggalFilter);

        // 1. Ambil semua pembayaran PENDING pada tanggal tersebut
        $pendingPembayaran = Pembayaran::where('status_validasi', 'pending')
            ->whereDate('tanggal', $tanggal) // Filter berdasarkan 'tanggal' bayar
            ->with(['kartuKeluarga:id,nama,blok,no_rumah', 'iuran:id,nominal_iuran'])
            ->orderBy('created_at', 'asc')
            ->get();

        // 2. Kelompokkan berdasarkan petugas (diinput_oleh)
        $grouped = $pendingPembayaran->groupBy('diinput_oleh');

        // 3. Buat summary untuk dikirim ke frontend
        $summarySetoran = $grouped->map(function ($payments, $username) {
            return [
                'username' => $username,
                'total' => $payments->sum('jumlah'),
                'count' => $payments->count(),
                'payments' => $payments, 
            ];
        })->values(); 

        // Ambil juga data setoran yang SUDAH divalidasi hari ini
        $validatedPembayaran = Pembayaran::where('status_validasi', 'validated')
            ->whereDate('tanggal', $tanggal)
            ->with('validator:id,name,username') 
            ->get()
            ->groupBy('diinput_oleh'); 
        $summaryValidated = $validatedPembayaran->map(function ($payments, $username) {
             return [
                'username' => $username,
                'total' => $payments->sum('jumlah'),
                'count' => $payments->count(),
                'validator' => $payments->first()->validator->name ?? $payments->first()->validator->username ?? 'N/A',
                'validated_at' => $payments->first()->validated_at->format('H:i'),
            ];
        })->values();


        return Inertia::render('lps/validasi/Index', [
            'summarySetoranPending' => $summarySetoran,
            'summarySetoranValidated' => $summaryValidated,
            'tanggalFilter' => $tanggal->toDateString(),
            'totalPending' => $pendingPembayaran->sum('jumlah'),
        ]);
    }

    public function validateSetoran(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date_format:Y-m-d',
            'username' => 'required|string|exists:users,username',
        ]);

        $adminId = Auth::id();
        $now = Carbon::now();

        // Update semua pembayaran pending dari petugas tsb di tanggal tsb
        Pembayaran::where('status_validasi', 'pending')
            ->whereDate('tanggal', $validated['tanggal'])
            ->where('diinput_oleh', $validated['username'])
            ->update([
                'status_validasi' => 'validated',
                'validated_at' => $now,
                'validated_by' => $adminId,
            ]);

        return redirect()->back()->with('success', 'Setoran dari ' . $validated['username'] . ' berhasil divalidasi.');
    }
}