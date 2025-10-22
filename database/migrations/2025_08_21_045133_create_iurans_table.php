<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('iuran', function (Blueprint $table) {
            $table->id();
            $table->integer('nominal_iuran');
            $table->integer('bulan_mulai');
            $table->integer('bulan_akhir');
            $table->integer('tahun_mulai');
            $table->integer('tahun_akhir');
            $table->date('tanggal_mulai_berlaku');
            $table->date('tanggal_akhir_berlaku');
            $table->unsignedBigInteger('kelurahan_id');
            $table->foreign('kelurahan_id')->references('id')->on('kelurahan')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iuran');
    }
};
