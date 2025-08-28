import { Wilayah } from './wilayah';

export namespace KartuKeluarga {
    export interface Default {
        id: string;
        nik: string;
        nomor_kk: string; // Baru
        nama_kepala_keluarga: string;
        alamat: string;
        rt: string;
        rw: string;
        zona: string; // Baru
        kelurahan_id: string;
        kelurahan?: Wilayah.Kelurahan;
        kecamatan_id: string;
        kecamatan?: Wilayah.Kecamatan;
        created_at: string;
        updated_at: string;
    }
}
