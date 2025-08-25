<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogPengambilan extends Model
{
    protected $table = 'log_pengambilan';
    protected $fillable = [
        'kartu_keluarga_id', 'tanggal_ambil', 'status', 'diinput_oleh'
    ];
    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class);
    }
}
