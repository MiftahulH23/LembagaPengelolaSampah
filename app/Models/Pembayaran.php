<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';
    protected $guarded = [];
    
 
    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class);
    }

    public function iuran() {
        return $this->belongsTo(Iuran::class);
    }

    protected $casts = [
        'tanggal' => 'date',
        'validated_at' => 'datetime', // <-- TAMBAHKAN
    ];

    public function diinputOlehUser()
    {
        // Gunakan 'username' sebagai foreign key
        return $this->belongsTo(User::class, 'diinput_oleh', 'username'); 
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
