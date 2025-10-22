import { Iuran } from "./iuran";
import { KartuKeluarga } from "./kartukeluarga";

export namespace Pembayaran {
    export interface Default {
        id: number;
        tahun: string;
        bulan: number;
        kartu_keluarga_id: number;
        kartuKeluarga?: KartuKeluarga.Default;
        iuran_id: number;
        iuran?: Iuran.Default;
        jumlah: number;
        tanggal: string;
    }
}