<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('log_pengambilan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kartu_keluarga_id');
            $table->foreign('kartu_keluarga_id')->references('id')->on('kartu_keluarga')->onDelete('cascade');
            $table->date('tanggal_ambil');
            $table->string('status')->default('Diambil'); // Misal: Diambil, Rumah Kosong
            $table->string('diinput_oleh');
            $table->timestamps();
            // Kunci unik untuk memastikan satu rumah hanya punya satu log per hari
            $table->unique(['kartu_keluarga_id', 'tanggal_ambil']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('log_pengambilan');
    }
};
