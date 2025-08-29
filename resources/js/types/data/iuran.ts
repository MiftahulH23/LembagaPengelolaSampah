import { Wilayah } from "./wilayah";

export namespace Iuran {
    export interface Default {
        id: string;
        nominal_iuran: number;
        kelurahan_id: string;
        kelurahan?: Wilayah.Kelurahan; 
        created_at: string;
        updated_at: string;
    }
}
