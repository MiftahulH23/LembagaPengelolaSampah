<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kecamatan>
 */
class KecamatanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Menggunakan faker untuk menghasilkan nama kota yang unik.
            // Ini berguna untuk testing, bukan untuk data produksi.
            'nama_kecamatan' => $this->faker->unique()->city(),
        ];
    }
}
