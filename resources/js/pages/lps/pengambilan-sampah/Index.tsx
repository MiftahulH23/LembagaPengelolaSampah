import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableControls } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Check, Recycle, Undo2 } from 'lucide-react';

// --- Tipe Data ---
interface LogPengambilan {
    id: number;
    tanggal_ambil: string;
    status: string;
}

interface KartuKeluarga {
    id: number;
    nama_kepala_keluarga: string;
    alamat: string;
    rt: string;
    rw: string;
    // Relasi yang di-load dari controller
    log_pengambilan_hari_ini: LogPengambilan | null;
}

interface PageProps {
    kartuKeluarga: KartuKeluarga[];
    selectedDate: string;
}

const PengambilanSampahIndex: React.FC<PageProps> = ({ kartuKeluarga: initialKartuKeluarga, selectedDate }) => {
    // State untuk Optimistic UI
    const [kkData, setKkData] = React.useState(initialKartuKeluarga);

    // Sinkronisasi state jika props dari Inertia berubah (misal saat ganti tanggal)
    React.useEffect(() => {
        setKkData(initialKartuKeluarga);
    }, [initialKartuKeluarga]);

    const handleDateChange = (date: string) => {
        router.get(
            route('pengambilan-sampah.index'),
            { date },
            {
                preserveScroll: true,
                preserveState: true, // Agar tidak kehilangan state search/filter lain
            },
        );
    };

    const handleMark = (kk: KartuKeluarga, action: 'ambil' | 'batal') => {
        // --- BEST PRACTICE: OPTIMISTIC UI ---
        // 1. Update UI secara lokal terlebih dahulu agar terasa instan.
        setKkData((currentData) =>
            currentData.map((item) => {
                if (item.id === kk.id) {
                    return {
                        ...item,
                        log_pengambilan_hari_ini:
                            action === 'ambil'
                                ? { id: -1, tanggal_ambil: selectedDate, status: 'Diambil' } // Buat data palsu
                                : null,
                    };
                }
                return item;
            }),
        );

        // 2. Kirim request ke server di belakang layar.
        const requestOptions = {
            preserveScroll: true,
            onSuccess: () => {
                const message = action === 'ambil' ? 'Status pengambilan berhasil diupdate.' : 'Status berhasil dibatalkan.';
                toast.success(message);
            },
            onError: () => {
                toast.error('Gagal memperbarui status. Memulihkan data.');
                setKkData(initialKartuKeluarga);
            },
        };

        if (action === 'ambil') {
            router.post(
                route('pengambilan-sampah.store', kk.id),
                { date: selectedDate }, 
                requestOptions, 
            );
        } else {
            router.delete(route('pengambilan-sampah.destroy', kk.id), {
                data: { date: selectedDate },
                ...requestOptions, 
            });
        }
    };

    const columns: ColumnDef<KartuKeluarga>[] = [
        {
            accessorKey: 'nama_kepala_keluarga',
            header: 'Nama Kepala Keluarga',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.nama_kepala_keluarga}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.alamat}, RT {row.original.rt}/RW {row.original.rw}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const log = row.original.log_pengambilan_hari_ini;
                return log ? (
                    <Badge variant="default">
                        <Check className="mr-1 h-4 w-4" />
                        Sudah Diambil
                    </Badge>
                ) : (
                    <Badge variant="secondary">Menunggu</Badge>
                );
            },
        },
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => {
                const log = row.original.log_pengambilan_hari_ini;
                return log ? (
                    <Button variant="destructive" size="sm" onClick={() => handleMark(row.original, 'batal')}>
                        <Undo2 className="mr-1 h-4 w-4" /> Batalkan
                    </Button>
                ) : (
                    <Button variant="default" size="sm" onClick={() => handleMark(row.original, 'ambil')}>
                        <Recycle className="mr-1 h-4 w-4" /> Ambil Sampah
                    </Button>
                );
            },
        },
    ];

    const breadcrumb = [{ title: 'Pengambilan Sampah', href: '/pengambilan-sampah' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Pengambilan Sampah" />
            <div className="container">
                <h1>Checklist Pengambilan Sampah Harian</h1>
                <DataTable columns={columns} data={kkData}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={<Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-fit" />}
                        />
                    )}
                </DataTable>
            </div>
        </AppLayout>
    );
};

export default PengambilanSampahIndex;
