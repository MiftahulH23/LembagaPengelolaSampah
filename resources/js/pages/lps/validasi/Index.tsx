// resources/js/Pages/lps/validasi/Index.tsx

import { DataTable } from '@/components/data-table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Pembayaran } from '@/types/data/pembayaran';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, CircleOff, Hourglass, TriangleAlert } from 'lucide-react';

interface ValidasiProps {
    summarySetoranPending: Pembayaran.SummaryPending[];
    summarySetoranValidated: Pembayaran.SummaryValidated[];
    tanggalFilter: string;
    totalPending: number;
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const ValidateButton = ({ username, tanggal, total }: { username: string; tanggal: string; total: number }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { post, processing } = useForm({
        tanggal: tanggal,
        username: username,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('validasi.store'), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    return (
        <>
            <div className="mt-4 text-right">
                <Button
                    type="button"
                    onClick={() => setIsModalOpen(true)} 
                    variant="default"
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Validasi Setoran Ini
                </Button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <TriangleAlert className="h-6 w-6 text-yellow-500" />
                                Konfirmasi Validasi
                            </DialogTitle>
                            <DialogDescription className="pt-4">
                                Apakah Anda yakin ingin memvalidasi setoran dari petugas <strong>{username}</strong>?
                                <br />
                                Total setoran yang tercatat: <strong>{formatRupiah(total)}</strong>
                                <br />
                                <br />
                                <span className="text-red-600">Tindakan ini tidak dapat dibatalkan.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)} 
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                variant="default"
                            >
                                {processing ? 'Memvalidasi...' : 'Ya, Validasi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

const detailColumns: ColumnDef<Pembayaran.Default>[] = [
    {
        accessorFn: (row) => row.kartu_keluarga?.nama,
        header: 'Nama KK',
        cell: ({ row }) => {
            const kk = row.original.kartu_keluarga;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{kk?.nama ?? 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">
                        {kk?.blok ? `Blok ${kk.blok}` : ''} {kk?.no_rumah ? `No ${kk.no_rumah}` : ''}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'bulan',
        header: 'Bulan',
        cell: ({ row }) => {
            const monthName = new Date(Number(row.original.tahun), Number(row.original.bulan) - 1, 1).toLocaleString('id-ID', { month: 'short' });
            return `${monthName} ${row.original.tahun}`;
        },
    },
    {
        accessorKey: 'jumlah',
        header: 'Jumlah',
        cell: ({ row }) => formatRupiah(row.original.jumlah),
    },
];

// --- KOMPONEN UTAMA ---
const ValidasiIndex: React.FC<ValidasiProps> = ({ summarySetoranPending, summarySetoranValidated, tanggalFilter, totalPending }) => {
    const breadcrumb = [{ title: 'Validasi Pembayaran', href: route('validasi.index') }];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        router.get(route('validasi.index'), { tanggal: newDate }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Validasi Pembayaran" />
            <div className="container">
                <h1 className="mb-4 text-2xl font-semibold">Validasi Setoran Harian</h1>

                <div className="mb-6 max-w-xs space-y-2">
                    <Label htmlFor="tanggalFilter">Pilih Tanggal Setoran</Label>
                    <Input id="tanggalFilter" type="date" value={tanggalFilter} onChange={handleDateChange} />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hourglass className="h-5 w-5 text-yellow-500" />
                                Menunggu Validasi ({formatRupiah(totalPending)})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summarySetoranPending.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {summarySetoranPending.map((item) => (
                                        <AccordionItem value={item.username} key={item.username}>
                                            <AccordionTrigger className="font-semibold">
                                                <div className="flex w-full items-center justify-between pr-4">
                                                    <span>Petugas: {item.username}</span>
                                                    <div className="flex flex-col items-end">
                                                        <span>{formatRupiah(item.total)}</span>
                                                        <span className="text-xs font-normal text-muted-foreground">{item.count} transaksi</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <DataTable columns={detailColumns} data={item.payments}  />
                                                <ValidateButton
                                                    username={item.username}
                                                    tanggal={tanggalFilter}
                                                    total={item.total} 
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-center text-muted-foreground">
                                    <CircleOff className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    Tidak ada setoran menunggu validasi untuk tanggal ini.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Sudah Tervalidasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summarySetoranValidated.length > 0 ? (
                                <ul className="divide-y">
                                    {summarySetoranValidated.map((item) => (
                                        <li key={item.username} className="flex items-center justify-between py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">Petugas: {item.username}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.count} transaksi | Valid by {item.validator} @ {item.validated_at}
                                                </span>
                                            </div>
                                            <Badge variant="default" className="text-base">
                                                {formatRupiah(item.total)}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground">
                                    <CircleOff className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    Belum ada setoran yang divalidasi hari ini.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ValidasiIndex;
