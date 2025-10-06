import { Wilayah } from './wilayah';
import { Zona } from './zona';

export namespace KartuKeluarga {
    export interface Default {
        id: number;
        // Kolom disesuaikan dengan skema database
        nama: string;
        no_hp: string | null;
        blok: string | null;
        rt: string | null;
        rw: string | null;
        no_rumah: string | null;

        // Foreign Keys & Relasi
        zona_id: number;
        zona?: Zona.Default;
        kelurahan_id: number;
        kelurahan?: Wilayah.Kelurahan;
        kecamatan_id: number;
        kecamatan?: Wilayah.Kecamatan;
        
        // Timestamps
        created_at: string;
        updated_at: string;
    }
}