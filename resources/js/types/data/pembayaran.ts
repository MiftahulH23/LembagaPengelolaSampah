import { KartuKeluarga } from './kartukeluarga';
import { Iuran } from './iuran';
import {User} from '@/types/index'
export namespace Pembayaran {
    export interface Default {
        id: number;
        kartu_keluarga_id: number;
        iuran_id: number;
        tahun: string;
        bulan: number;
        jumlah: number;
        tanggal: string; // YYYY-MM-DD
        catatan: string | null;
        diinput_oleh: string; // username petugas
        
        // --- TAMBAHAN BARU ---
        status_validasi: 'pending' | 'validated';
        validated_at: string | null; // ISO Date string
        validated_by: number | null; // admin user ID

        // --- TAMBAHAN RELASI ---
        kartu_keluarga?: KartuKeluarga.Default;
        iuran?: Iuran.Default;
        diinput_oleh_user?: User;
        validator?: User;
    }

    // Tipe data untuk summary
    export interface SummaryPending {
        username: string;
        total: number;
        count: number;
        payments: Pembayaran.Default[];
    }
    
    export interface SummaryValidated {
        username: string;
        total: number;
        count: number;
        validator: string;
        validated_at: string; // H:i
    }
}