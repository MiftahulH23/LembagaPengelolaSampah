import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFnOption } from '@tanstack/react-table';
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
import { DataTableFilter } from '@/components/data-table/data-table-filter';


import { KartuKeluarga } from '@/types/data/kartukeluarga';
import { Zona } from '@/types/data/zona';
interface Iuran {
    id: number;
    nominal_iuran: number;
    tanggal_mulai_berlaku: string;
    tanggal_akhir_berlaku: string;
}
interface IuranPageProps {
    kartuKeluarga: KartuKeluarga.Default[]; 
    selectedYear: number;
    iuranTerbaru: Iuran | null;
    zonas: Zona.Default[]; 
    semuaPeriodeIuran: Iuran[] | null;
}

// --- Komponen Modal Pembayaran ---
function DialogTambahPembayaran({
    months,
    selectedYear,
    selectedKK,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    semuaPeriodeIuran,
}: {
    months: string[];
    selectedYear: number;
    selectedKK: KartuKeluarga.Default | null; 
    isPaymentModalOpen: boolean;
    setIsPaymentModalOpen: (open: boolean) => void;
    semuaPeriodeIuran: Iuran[] | null;
}) {
    const getPaidMonths = (kk: KartuKeluarga.Default | null): number[] => {
        if (!kk || !kk.pembayaran) return [];
        return kk.pembayaran.map((item) => item.bulan);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        bulan: [] as number[],
        tahun: selectedYear,
        tanggal: new Date().toISOString().split('T')[0],
        catatan: '',
    });

    const [totalBayar, setTotalBayar] = useState(0);

    useEffect(() => {
        if (isPaymentModalOpen && selectedKK) {
            reset();
            setData({
                bulan: [],
                tahun: selectedYear,
                tanggal: new Date().toISOString().split('T')[0],
                catatan: '',
            });
            setTotalBayar(0);
        }
    }, [isPaymentModalOpen, selectedKK, selectedYear]);

    useEffect(() => {
        if (!semuaPeriodeIuran || data.bulan.length === 0) {
            setTotalBayar(0);
            return;
        }

        let newTotal = 0;
        const paidMonths = getPaidMonths(selectedKK);
        const newMonthsToPay = data.bulan.filter((month) => !paidMonths.includes(month));

        for (const month of newMonthsToPay) {
            const targetDate = new Date(data.tahun, month - 1, 1);
            const iuranForMonth = semuaPeriodeIuran.find((iuran) => {
                const [sy, sm, sd] = iuran.tanggal_mulai_berlaku.split('-').map(Number);
                const [ey, em, ed] = iuran.tanggal_akhir_berlaku.split('-').map(Number);
                const startDate = new Date(sy, sm - 1, sd);
                const endDate = new Date(ey, em - 1, ed);
                return targetDate >= startDate && targetDate <= endDate;
            });

            if (iuranForMonth) {
                newTotal += Number(iuranForMonth.nominal_iuran);
            }
        }
        setTotalBayar(newTotal);
    }, [data.bulan, data.tahun, semuaPeriodeIuran, selectedKK]);

    const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedKK) return;
        const originalBulanSelection = data.bulan;
        const paidMonths = getPaidMonths(selectedKK);
        const newMonthsToPay = data.bulan.filter((month) => !paidMonths.includes(month));

        if (newMonthsToPay.length === 0) {
            toast.info('Tidak ada bulan baru yang dipilih untuk dibayar.');
            return;
        }

        setData('bulan', newMonthsToPay);

        post(route('pembayaran.store', selectedKK.id), {
            preserveScroll: false,
            preserveState: false, 
            onSuccess: () => {
                setIsPaymentModalOpen(false);
            },
            onError: (formErrors: any) => {
                if (formErrors.tanggal) {
                    toast.error(formErrors.tanggal);
                } else if (formErrors.bulan) {
                    toast.error(formErrors.bulan);
                } else {
                    toast.error('Gagal menyimpan pembayaran. Periksa kembali data.');
                }
                setData('bulan', originalBulanSelection);
            },
        });
    };

    const paidMonths = getPaidMonths(selectedKK);
    const newMonthsCount = data.bulan.filter((m) => !paidMonths.includes(m)).length;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Input Pembayaran</DialogTitle>
                <DialogDescription>
                    Untuk: <strong>{selectedKK?.nama ?? 'Warga tidak ditemukan'}</strong> <br />
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
                                        checked={isAlreadyPaid || data.bulan.includes(monthNumber)}
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
                    <Label htmlFor="catatan">Catatan (Opsional)</Label>
                    <Textarea id="catatan" value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} />
                    {errors.catatan && <p className="mt-1 text-sm text-red-500">{errors.catatan}</p>}
                </div>

                 <div>
                    <Label>Total Pembayaran (Otomatis)</Label>
                    <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBayar)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Total dihitung otomatis berdasarkan nominal iuran yang berlaku untuk setiap bulan yang dipilih.
                    </p>
                    {totalBayar === 0 && newMonthsCount > 0 && !errors.bulan && (
                        <p className="mt-1 text-sm text-yellow-600">Pastikan periode iuran telah diatur untuk bulan yang dipilih.</p>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={processing || newMonthsCount === 0}>
                        {processing ? 'Menyimpan...' : `Simpan ${newMonthsCount} Bulan`}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}

// --- Komponen Utama Halaman ---
const IuranIndex: React.FC<IuranPageProps> = ({ kartuKeluarga, selectedYear, iuranTerbaru, zonas, semuaPeriodeIuran }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedKK, setSelectedKK] = useState<KartuKeluarga.Default | null>(null);

    const openPaymentModal = (kk: KartuKeluarga.Default) => {
        if (!semuaPeriodeIuran || semuaPeriodeIuran.length === 0) {
            toast.error('Belum ada data iuran yang diatur untuk kelurahan ini. Silakan atur di menu Iuran.');
            return;
        }
        setSelectedKK(kk);
        setIsPaymentModalOpen(true);
    };

    const getPaymentStatus = (kk: KartuKeluarga.Default, month: number): boolean => {
        return kk.pembayaran.some((p) => p.bulan === month);
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const columns: ColumnDef<KartuKeluarga.Default>[] = [
        {
            id: 'id',
            accessorKey: 'zona.nama_zona',
            header: 'Nama Kepala Keluarga',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.nama}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.zona?.nama_zona}, RT {row.original.rt}/RW {row.original.rw}, 
                    </span>
                </div>
            ),
            filterFn: 'checkbox' as FilterFnOption<KartuKeluarga.Default>,
        },
        ...months.map(
            (monthName, index) =>
                ({
                    id: monthName.toLowerCase(),
                    header: monthName,
                    size: 60,
                    cell: ({ row }) => {
                        const isPaid = getPaymentStatus(row.original, index + 1);
                        return isPaid ? (
                            <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                            <X className="mx-auto h-5 w-5 text-red-500" />
                        );
                    },
                    enableSorting: false,
                }) as ColumnDef<KartuKeluarga.Default>,
        ),
        {
            id: 'aksi',
            header: 'Aksi',
            size: 100,
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => openPaymentModal(row.original)}>
                    <HandCoins className="mr-2 h-4 w-4" /> Bayar
                </Button>
            ),
        },
    ];

    const handleYearChange = (year: number) => {
        router.get(route('pembayaran.index'), { year }, { preserveScroll: true, preserveState: false });
    };

    const breadcrumb = [{ title: 'Pembayaran Iuran', href: '/pembayaran' }];
    const dataZona = zonas.map((zona) => zona.nama_zona);

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Pembayaran Iuran" />
            <div className="container">
                <h1>Pembayaran Iuran Warga</h1>
                <p className="text-muted-foreground mb-4">
                    Rekapitulasi status pembayaran iuran warga per bulan untuk tahun {selectedYear}.
                </p>
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
                                            {[2026, 2025, 2024, 2023].map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                        >
                            <DataTableFilter table={table} extend={[{
                                id: 'id', label: 'Zona', data: dataZona
                            }]} />
                        </DataTableControls>
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
                    semuaPeriodeIuran={semuaPeriodeIuran}
                />
            </Dialog>
        </AppLayout>
    );
};

export default IuranIndex;