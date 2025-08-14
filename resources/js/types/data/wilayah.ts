export namespace Wilayah {
    export interface Kecamatan {
        id: string;
        nama_kecamatan: string;
    }

    export interface Kelurahan {
        id: string;
        nama_kelurahan: string;
        kecamatan_id: string;
        kecamatan?: Kecamatan;

    }
}
