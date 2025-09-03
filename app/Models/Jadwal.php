<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $table = 'jadwal';
    protected $fillable = [
        'kelurahan_id', 'hari', 'zona'
    ];
    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }
}
