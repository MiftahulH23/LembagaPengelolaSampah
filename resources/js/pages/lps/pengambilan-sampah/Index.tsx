import { Head, router } from '@inertiajs/react';
// REVISI: Import hook dan tipe dari tanstack/react-table
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableControls } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { CalendarX2, Check, Recycle, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Tipe Data ---
interface ChecklistItem {
    zona: string;
    status: 'Sudah Diambil' | 'Menunggu';
}

interface PageProps {
    checklistData: ChecklistItem[];
    selectedDate: string;
}

const PengambilanSampahIndex: React.FC<PageProps> = ({ checklistData: initialChecklist, selectedDate }) => {
    const [checklist, setChecklist] = React.useState(initialChecklist);

    React.useEffect(() => {
        setChecklist(initialChecklist);
    }, [initialChecklist]);

    const handleDateChange = (date: string) => {
        router.get(route('pengambilan-sampah.index'), { date }, { preserveScroll: true, preserveState: true });
    };

    const handleMark = (zona: string, action: 'ambil' | 'batal') => {
        setChecklist((current) =>
            current.map((item) =>
                item.zona === zona ? { ...item, status: action === 'ambil' ? 'Sudah Diambil' : 'Menunggu' } : item,
            ),
        );

        const requestOptions = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui status. Memulihkan data.');
                setChecklist(initialChecklist);
            },
        };

        const data = { date: selectedDate, zona };

        if (action === 'ambil') {
            router.post(route('pengambilan-sampah.store'), data, requestOptions);
        } else {
            router.delete(route('pengambilan-sampah.destroy'), { data, ...requestOptions });
        }
    };

    const columns: ColumnDef<ChecklistItem>[] = [
        {
            accessorKey: 'zona',
            header: 'Zona',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) =>
                row.original.status === 'Sudah Diambil' ? (
                    <Badge variant="default">
                        <Check className="mr-1 h-4 w-4" />
                        Sudah Diambil
                    </Badge>
                ) : (
                    <Badge variant="secondary">Menunggu</Badge>
                ),
        },
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) =>
                row.original.status === 'Sudah Diambil' ? (
                    <Button variant="destructive" size="sm" onClick={() => handleMark(row.original.zona, 'batal')}>
                        <Undo2 className="mr-1 h-4 w-4" /> Batalkan
                    </Button>
                ) : (
                    <Button variant="default" size="sm" onClick={() => handleMark(row.original.zona, 'ambil')}>
                        <Recycle className="mr-1 h-4 w-4" /> Ambil Sampah
                    </Button>
                ),
        },
    ];

    // --- REVISI UTAMA: Buat instance tabel kosong untuk kasus "Tidak Ada Jadwal" ---
    const emptyTable = useReactTable({
        data: [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const breadcrumb = [{ title: 'Pengambilan Sampah', href: '/pengambilan-sampah' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Pengambilan Sampah" />
            <div className="container">
                <h1>Checklist Pengambilan Sampah per Zona</h1>

                {/* Kondisi untuk menampilkan tabel atau card pesan kosong */}
                {checklist.length > 0 ? (
                    // Tampilkan DataTable seperti biasa jika ada data
                    <DataTable columns={columns} data={checklist}>
                        {({ table }) => (
                            <DataTableControls
                                table={table}
                                search={true} // Aktifkan search jika ada data
                                action={
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-fit"
                                    />
                                }
                            />
                        )}
                    </DataTable>
                ) : (
                    // Jika tidak ada data, render Controls dan Card secara terpisah
                    <div className="space-y-4">
                        <DataTableControls
                            table={emptyTable} // Gunakan tabel kosong
                            search={false} // Matikan search jika tidak ada data
                            action={
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-fit"
                                />
                            }
                        />
                        <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
                            <CardHeader className="w-full">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <CalendarX2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="">
                                <CardTitle className="mb-2 text-xl font-semibold">Tidak Ada Jadwal</CardTitle>
                                <p className="text-muted-foreground">
                                    Tidak ada jadwal pengambilan sampah untuk tanggal yang Anda pilih.
                                    <br />
                                    Silakan pilih tanggal lain atau atur jadwal jika diperlukan.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default PengambilanSampahIndex;
