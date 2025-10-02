import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableControls } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Check, HandCoins, X } from 'lucide-react';

// --- Tipe Data ---
interface Pembayaran {
    id: number;
    tahun: string;
    bulan: number;
}
interface Zona {
    id: number;
    nama_zona: string;
}
interface KartuKeluarga {
    id: number;
    nama_kepala_keluarga: string;
    alamat: string;
    rt: string;
    rw: string;
    zona:  Zona | null;
    pembayaran: Pembayaran[];
}
// REVISI: Tipe baru untuk prop iuran
interface Iuran {
    id: number;
    nominal_iuran: number;
}
interface IuranPageProps {
    kartuKeluarga: KartuKeluarga[];
    selectedYear: number;
    iuranTerbaru: Iuran | null; // Prop baru dari controller
}

function DialogTambahPembayaran({
    months,
    selectedYear,
    selectedKK,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    nominalIuran, // REVISI: Terima prop nominalIuran
}: {
    months: string[];
    selectedYear: number;
    selectedKK: KartuKeluarga | null;
    isPaymentModalOpen: boolean;
    setIsPaymentModalOpen: (open: boolean) => void;
    nominalIuran: number; // REVISI: Tipe prop
}) {
    const getPaidMonths = (kk: KartuKeluarga | null): number[] => {
        if (!kk || !kk.pembayaran) return [];
        return kk.pembayaran.map((item) => item.bulan);
    };

    // REVISI: Hapus `jumlah` dari form, karena tidak lagi dikirim
    const { data, setData, post, processing, errors, reset } = useForm({
        bulan: [] as number[],
        tahun: selectedYear,
        tanggal: new Date().toISOString().split('T')[0],
        catatan: '',
    });

    useEffect(() => {
        if (isPaymentModalOpen && selectedKK) {
            reset();
            // REVISI: Tidak perlu set `jumlah` lagi
            setData({
                bulan: [],
                tahun: selectedYear,
                tanggal: new Date().toISOString().split('T')[0],
                catatan: '',
            });
        }
    }, [isPaymentModalOpen, selectedKK, selectedYear]);

    const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedKK) return;

        const paidMonths = getPaidMonths(selectedKK);
        const newMonthsToPay = data.bulan.filter((month) => !paidMonths.includes(month));

        if (newMonthsToPay.length === 0) {
            toast.info('Tidak ada bulan baru yang dipilih untuk dibayar.');
            return;
        }

        const originalBulanSelection = data.bulan;
        setData('bulan', newMonthsToPay);

        post(route('pembayaran.store', selectedKK.id), {
            preserveScroll: false,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                // Toast success ditangani oleh flash message backend, tidak perlu toast di sini.
            },
            onError: (formErrors: any) => {
                toast.error(formErrors.bulan || formErrors.jumlah || 'Gagal menyimpan pembayaran.');
                setData('bulan', originalBulanSelection);
            },
        });
    };

    const paidMonths = getPaidMonths(selectedKK);

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Input Pembayaran</DialogTitle>
                <DialogDescription>
                    Untuk: <strong>{selectedKK?.nama_kepala_keluarga}</strong> <br />
                    Tahun Iuran: <strong>{selectedYear}</strong>
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePaymentSubmit} className="space-y-4 py-4">
                <div>
                    <Label>Pilih Bulan yang Dibayar</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {months.map((monthName, index) => {
                            const monthNumber = index + 1;
                            const isAlreadyPaid = paidMonths.includes(monthNumber);
                            return (
                                <div key={monthNumber} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`bulan-${monthNumber}`}
                                        checked={data.bulan.includes(monthNumber)}
                                        disabled={isAlreadyPaid}
                                        onCheckedChange={(checked) => {
                                            setData('bulan', checked ? [...data.bulan, monthNumber] : data.bulan.filter((m) => m !== monthNumber));
                                        }}
                                    />
                                    <label
                                        htmlFor={`bulan-${monthNumber}`}
                                        className={cn('text-sm leading-none font-medium', {
                                            'cursor-not-allowed text-muted-foreground line-through decoration-red-500': isAlreadyPaid,
                                        })}
                                    >
                                        {monthName}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    {errors.bulan && <p className="mt-1 text-sm text-red-500">{errors.bulan}</p>}
                </div>

                <div>
                    <Label htmlFor="tanggal">Tanggal Pembayaran</Label>
                    <Input id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} />
                    {errors.tanggal && <p className="mt-1 text-sm text-red-500">{errors.tanggal}</p>}
                </div>

                <div>
                    <Label htmlFor="jumlah">Jumlah Iuran Per Bulan</Label>
                    <Input id="jumlah" type="number" value={nominalIuran} disabled />
                    <p className="mt-1 text-xs text-muted-foreground">Nominal iuran diambil dari data terbaru.</p>
                </div>

                <div>
                    <Label htmlFor="catatan">Catatan (Opsional)</Label>
                    <Textarea id="catatan" value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} />
                    {errors.catatan && <p className="mt-1 text-sm text-red-500">{errors.catatan}</p>}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={processing || data.bulan.filter((m) => !paidMonths.includes(m)).length === 0}>
                        {processing ? 'Menyimpan...' : `Simpan ${data.bulan.filter((m) => !paidMonths.includes(m)).length} Bulan`}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}

const IuranIndex: React.FC<IuranPageProps> = ({ kartuKeluarga, selectedYear, iuranTerbaru }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedKK, setSelectedKK] = useState<KartuKeluarga | null>(null);
    // REVISI: Ambil nominal iuran dari prop, dengan fallback 0
    const nominalIuran = iuranTerbaru?.nominal_iuran ?? 0;

    const openPaymentModal = (kk: KartuKeluarga) => {
        // REVISI: Tambahkan pengecekan sebelum membuka modal
        if (nominalIuran === 0 && !iuranTerbaru) {
            toast.error('Nominal iuran untuk kelurahan ini belum diatur. Silahkan atur terlebih dahulu.');
            return;
        }
        setSelectedKK(kk);
        setIsPaymentModalOpen(true);
    };

    const getPaymentStatus = (kk: KartuKeluarga, month: number): boolean => {
        return kk.pembayaran.some((p) => p.bulan === month);
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const columns: ColumnDef<KartuKeluarga>[] = [
        {
            accessorKey: 'nama_kepala_keluarga',
            header: 'Nama Kepala Keluarga',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.nama_kepala_keluarga}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.zona?.nama_zona}, {row.original.alamat}, RT {row.original.rt}/RW {row.original.rw}, 
                    </span>
                </div>
            ),
        },
        ...months.map(
            (monthName, index) =>
                ({
                    id: monthName,
                    header: monthName,
                    cell: ({ row }) => {
                        const isPaid = getPaymentStatus(row.original, index + 1);
                        return isPaid ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-red-500" />;
                    },
                }) as ColumnDef<KartuKeluarga>,
        ),
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => openPaymentModal(row.original)}>
                    <HandCoins className="mr-2 h-4 w-4" /> Bayar
                </Button>
            ),
        },
    ];

    const handleYearChange = (year: number) => {
        router.get(route('pembayaran.index'), { year }, { preserveScroll: true });
    };

    const breadcrumb = [{ title: 'Data Iuran', href: '/pembayaran' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Data Iuran" />
            <div className="container">
                <h1>Data Iuran</h1>
                <DataTable columns={columns} data={kartuKeluarga}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <div className="flex items-center gap-2">
                                    <Label>Tahun:</Label>
                                    <Select value={String(selectedYear)} onValueChange={(value) => handleYearChange(Number(value))}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2025, 2024, 2023].map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                        />
                    )}
                </DataTable>
            </div>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogTambahPembayaran
                    months={months}
                    selectedYear={selectedYear}
                    selectedKK={selectedKK}
                    isPaymentModalOpen={isPaymentModalOpen}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    nominalIuran={nominalIuran}
                />
            </Dialog>
        </AppLayout>
    );
};

export default IuranIndex;
