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
            $table->unsignedBigInteger('kelurahan_id');
            $table->foreign('kelurahan_id')->references('id')->on('kelurahan')->onDelete('cascade');
            $table->string('zona');
            $table->date('tanggal_ambil');
            $table->string('status')->default('Diambil'); // Misal: Diambil, Rumah Kosong
            $table->string('diinput_oleh');
            $table->timestamps();
            // Kunci unik untuk memastikan satu rumah hanya punya satu log per hari
            $table->unique(['kelurahan_id','zona', 'tanggal_ambil']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('log_pengambilan');
    }
};
