<?php

namespace Database\Seeders;

use App\Models\Kecamatan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KecamatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Daftar nama kecamatan di Kota Pekanbaru
        $kecamatans = [
            'Bukit Raya',
            'Kulim',
            'Lima Puluh',
            'Marpoyan Damai',
            'Payung Sekaki',
            'Pekanbaru Kota',
            'Rumbai',
            'Rumbai Barat',
            'Rumbai Timur',
            'Sail',
            'Senapelan',
            'Sukajadi',
            'Tampan',
            'Tenayan Raya',
            'Tuah Madani',
        ];

        // Looping untuk memasukkan data ke database
        foreach ($kecamatans as $nama_kecamatan) {
            // Menggunakan updateOrCreate untuk menghindari duplikasi data
            // Jika nama_kecamatan sudah ada, data akan di-update (atau dilewati).
            // Jika belum ada, data baru akan dibuat.
            Kecamatan::updateOrCreate(['nama_kecamatan' => $nama_kecamatan]);
        }
    }
}
