<?php

namespace App\Imports;

use App\Models\KartuKeluarga;
use App\Models\Zona;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithMappedCells;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;
use Illuminate\Support\Facades\Log;

class DataWargaImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading, WithEvents
{
    private $kelurahanId;
    private $kecamatanId;
    private $zona;

    public function __construct(int $kelurahanId, int $kecamatanId)
    {
        $this->kelurahanId = $kelurahanId;
        $this->kecamatanId = $kecamatanId;
    }

    public function model(array $row)
    {
        if (!$this->zona) {
            return null;
        }
        
        $nama = $row['nama'] ?? null;
        if (empty($nama)) {
            return null;
        }

        return new KartuKeluarga([
            'nama'         => $nama,
            'no_hp'        => $row['no_hp'] ?? $row['no hp'] ?? null,
            'blok'         => $row['blok'] ?? null,
            'no_rumah'     => $row['no_rumah'] ?? $row['no rumah'] ?? null,
            'rt'           => $row['rt'] ?? null,
            'rw'           => $row['rw'] ?? null,
            'zona_id'      => $this->zona->id,
            'kelurahan_id' => $this->kelurahanId,
            'kecamatan_id' => $this->kecamatanId,
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }

    public function batchSize(): int
    {
        return 500;
    }

    public function chunkSize(): int
    {
        return 500;
    }
    
    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function(BeforeSheet $event) {
                $sheetName = $event->getSheet()->getTitle();
                Log::info("MEMPROSES SHEET (EVENT): " . $sheetName);
                
                $this->zona = Zona::firstOrCreate(
                    ['nama_zona' => trim($sheetName), 'kelurahan_id' => $this->kelurahanId]
                );
            },
        ];
    }
}