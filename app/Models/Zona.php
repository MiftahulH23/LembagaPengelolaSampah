<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zona extends Model
{
    protected $table = "zona";
    protected $guarded = [] ;

    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }
}
