import { Wilayah } from './wilayah';

export namespace Iuran {
    export interface Default {
        id: string;
        nominal_iuran: number;
        bulan_mulai: number;
        bulan_akhir: number;
        tahun_mulai: number;
        tahun_akhir: number;
        tanggal_mulai_berlaku: string; // Format YYYY-MM-DD
        tanggal_akhir_berlaku: string; // Format YYYY-MM-DD
        kelurahan_id: string;
        kelurahan?: Wilayah.Kelurahan;
        created_at: string;
        updated_at: string;
    }
}
