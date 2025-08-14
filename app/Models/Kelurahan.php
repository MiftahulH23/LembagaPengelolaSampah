<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model
{
    protected $table = 'kelurahan';
    protected $guarded = [];

    // Define any relationships or additional methods if needed
    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }
}
