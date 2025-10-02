import { Wilayah } from './wilayah';
import { Zona } from './zona';

export namespace KartuKeluarga {
    export interface Default {
        id: string;
        nik: string;
        nomor_kk: string; // Baru
        nama_kepala_keluarga: string;
        alamat: string;
        rt: string;
        rw: string;
        zona_id: string; // Baru
        zona?: Zona.Default
        kelurahan_id: string;
        kelurahan?: Wilayah.Kelurahan;
        kecamatan_id: string;
        kecamatan?: Wilayah.Kecamatan;
        created_at: string;
        updated_at: string;
    }
}
