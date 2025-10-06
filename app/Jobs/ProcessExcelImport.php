<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Imports\KartuKeluargaImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Throwable;// Pastikan ini ada
use Illuminate\Support\Facades\File;

class ProcessExcelImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;
    protected $kelurahanId;
    protected $kecamatanId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, int $kelurahanId, int $kecamatanId)
    {
        $this->filePath = $filePath;
        $this->kelurahanId = $kelurahanId;
        $this->kecamatanId = $kecamatanId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Log::info("Job Handle Dijalankan. Path file: " . $this->filePath);
        // Log::info("Apakah file ada? " . (File::exists($this->filePath) ? 'Ya' : 'Tidak'));
        // Log::info("Memulai proses impor untuk file: " . $this->filePath);
        try {
            Excel::import(new KartuKeluargaImport($this->kelurahanId, $this->kecamatanId), $this->filePath);
            Log::info("Proses impor berhasil untuk file: " . $this->filePath);
        } catch (Throwable $e) {
            // Jika ada error apapun, kita catat di file log
            Log::error("GAGAL impor file: " . $this->filePath);
            Log::error("Pesan Error: " . $e->getMessage());
            // Kamu bisa menambahkan notifikasi ke user di sini jika perlu
        }
    }
}