// resources/js/Pages/lps/iuran/Index.tsx

import { DataTable, DataTableControls } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Iuran } from '@/types/data/iuran';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const formatMonthYear = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

// List bulan
const months = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
    { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

// Interface untuk form data
interface IuranFormData {
    [key: string]: any; 
    nominal_iuran: string;
    bulan_mulai: string;
    tahun_mulai: string;
    bulan_akhir: string;
    tahun_akhir: string;
}

// Props untuk IuranForm
interface IuranFormProps {
    data: IuranFormData;
    setData: <K extends keyof IuranFormData>(key: K, value: IuranFormData[K]) => void;
    errors: Partial<Record<keyof IuranFormData | 'tanggal_mulai_berlaku' | 'tanggal_akhir_berlaku', string>>;
}

/**
 * Komponen Form Iuran Terpisah
 * (Dengan logika format Rupiah)
 */
const IuranForm = ({ data, setData, errors }: IuranFormProps) => {
    const formatRupiah = (value: string): string => {
        if (!value) return '';
        const number = parseInt(value, 10);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('id-ID').format(number);
    };

    const cleanNumber = (value: string): string => {
        return value.replace(/[^0-9]/g, '');
    };

    const [displayValue, setDisplayValue] = useState(() => formatRupiah(data.nominal_iuran));

    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleanedValue = cleanNumber(rawValue);
        if (cleanedValue.length > 9) return;
        setData('nominal_iuran', cleanedValue);
        setDisplayValue(formatRupiah(cleanedValue));
    };

    useEffect(() => {
        setDisplayValue(formatRupiah(data.nominal_iuran));
    }, [data.nominal_iuran]);

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="nominal_iuran">Nominal Iuran (Rp)</Label>
                <Input
                    type="text"
                    id="nominal_iuran"
                    value={displayValue}
                    onChange={handleNominalChange}
                />
                {errors.nominal_iuran && <p className="mt-1 text-sm text-red-500">{errors.nominal_iuran}</p>}
            </div>

            <div>
                <Label>Periode Mulai Berlaku</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        value={data.bulan_mulai}
                        onValueChange={(value) => setData('bulan_mulai', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        placeholder="Tahun"
                        value={data.tahun_mulai}
                        onChange={(e) => setData('tahun_mulai', e.target.value)}
                        min="2020"
                        max="2050"
                    />
                </div>
                {errors.bulan_mulai && <p className="mt-1 text-sm text-red-500">{errors.bulan_mulai}</p>}
                {errors.tahun_mulai && <p className="mt-1 text-sm text-red-500">{errors.tahun_mulai}</p>}
            </div>

            <div>
                <Label>Periode Akhir Berlaku</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        value={data.bulan_akhir}
                        onValueChange={(value) => setData('bulan_akhir', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        placeholder="Tahun"
                        value={data.tahun_akhir}
                        onChange={(e) => setData('tahun_akhir', e.target.value)}
                        min="2020"
                        max="2050"
                    />
                </div>
                {errors.bulan_akhir && <p className="mt-1 text-sm text-red-500">{errors.bulan_akhir}</p>}
                {errors.tahun_akhir && <p className="mt-1 text-sm text-red-500">{errors.tahun_akhir}</p>}
            </div>
            {errors['tanggal_mulai_berlaku'] && (
                <p className="mt-1 text-sm text-red-500">
                    {errors['tanggal_mulai_berlaku']}
                </p>
            )}
            {errors['tanggal_akhir_berlaku'] && (
                <p className="mt-1 text-sm text-red-500">
                    {errors['tanggal_akhir_berlaku']}
                </p>
            )}
        </div>
    );
};


/**
 * Komponen Halaman Utama (Index)
 */
const Index = (props: { iuran: Iuran.Default[] }) => {
    const { iuran } = props;

    // State useForm untuk TAMBAH
    const { data, setData, post, processing, errors, reset } = useForm<IuranFormData>({
        nominal_iuran: '',
        bulan_mulai: '',
        tahun_mulai: String(new Date().getFullYear()),
        bulan_akhir: '',
        tahun_akhir: String(new Date().getFullYear()),
    });
    
    // State useForm untuk EDIT
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEditForm,
    } = useForm<IuranFormData>({
        nominal_iuran: '',
        bulan_mulai: '',
        tahun_mulai: '',
        bulan_akhir: '',
        tahun_akhir: '',
    });

    const breadcrumb = [{ title: 'Iuran', href: '/iuran' }];

    const columns: ColumnDef<Iuran.Default>[] = [
        { id: 'nomor', header: 'No', cell: ({ row }) => row.index + 1, size: 50 },
        {
            accessorKey: 'nominal_iuran',
            header: 'Nominal Iuran',
            cell: ({ row }) =>
                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.original.nominal_iuran),
        },
        {
            accessorKey: 'tanggal_mulai_berlaku',
            header: 'Mulai Berlaku',
            cell: ({ row }) => formatMonthYear(row.original.tanggal_mulai_berlaku),
        },
        {
            accessorKey: 'tanggal_akhir_berlaku',
            header: 'Akhir Berlaku',
            cell: ({ row }) => formatMonthYear(row.original.tanggal_akhir_berlaku),
        },
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditModal(row.original)}>
                        <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeleteId(String(row.original.id))}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            size: 100,
        },
    ];

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIuran, setSelectedIuran] = useState<Iuran.Default | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('iuran.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset(); 
                setIsAddModalOpen(false);
            },
            onError: (formErrors) => {
                Object.values(formErrors).forEach((error) => toast.error(error));
            },
        });
    };

    const openEditModal = (iuran: Iuran.Default) => {
        setSelectedIuran(iuran);
        resetEditForm();

        const [sy, sm] = iuran.tanggal_mulai_berlaku.split('-').map(Number);
        const [ey, em] = iuran.tanggal_akhir_berlaku.split('-').map(Number);

        setEditData({
            nominal_iuran: String(iuran.nominal_iuran),
            bulan_mulai: String(sm),
            tahun_mulai: String(sy),
            bulan_akhir: String(em),
            tahun_akhir: String(ey),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIuran) return;
        put(route('iuran.update', selectedIuran.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
            },
            onError: (formErrors) => {
                Object.values(formErrors).forEach((error) => toast.error(error));
            },
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('iuran.destroy', id), {
            preserveScroll: true,
            onFinish: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Iuran" />
            <div className="container">
                <h1>Pengaturan Iuran</h1>
                <DataTable columns={columns} data={iuran}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            search={false}
                            action={
                                <Button
                                    onClick={() => {
                                        reset();
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    Tambah Periode Iuran
                                </Button>
                            }
                        />
                    )}
                </DataTable>

                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Periode Iuran Baru</DialogTitle>
                            <DialogDescription>Masukkan nominal dan periode iuran yang baru.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <IuranForm 
                                data={data} 
                                setData={setData} 
                                errors={errors} 
                            />
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit Data */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Edit Periode Iuran</DialogTitle>
                            <DialogDescription>Ubah nominal atau periode iuran yang sudah ada.</DialogDescription>
                        </DialogHeader> 
                        
                        <form onSubmit={handleEditSubmit}>
                            <IuranForm 
                                data={editData} 
                                setData={setEditData} 
                                errors={editErrors} 
                            />
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent>
                        <div className="flex flex-col items-center justify-center gap-3 pt-4">
                            <TriangleAlert size={48} className="text-destructive" />
                            <DialogTitle className="text-center">Konfirmasi Hapus</DialogTitle>
                            <DialogDescription className="text-center">
                                Apakah Anda yakin ingin menghapus periode iuran ini? <br />
                                Data pembayaran yang terkait dengan iuran ini tidak akan terhapus.
                            </DialogDescription>
                        </div>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (deleteId) handleDelete(deleteId);
                                }}
                            >
                                Hapus
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default Index;