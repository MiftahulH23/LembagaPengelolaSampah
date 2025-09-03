<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogPengambilan extends Model
{
    protected $table = 'log_pengambilan';
     protected $fillable = [
        'kelurahan_id', 'zona', 'tanggal_ambil', 'status', 'diinput_oleh'
    ];
    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }
}
