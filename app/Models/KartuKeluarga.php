<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KartuKeluarga extends Model
{
    protected $table = 'kartu_keluarga';
    protected $guarded = [];

    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class);
    }

    public function logPengambilanHariIni()
    {
        return $this->hasOne(LogPengambilan::class);
    }
    public function zona()
    {
        return $this->belongsTo(Zona::class);
    }
}
