<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Iuran extends Model
{
    protected $table = 'iuran';
    protected $guarded = [];

    protected $casts = [
        'tanggal_mulai_berlaku' => 'date:Y-m-d', // Format YYYY-MM-DD
        'tanggal_akhir_berlaku' => 'date:Y-m-d', // Format YYYY-MM-DD
    ];

    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }
}
