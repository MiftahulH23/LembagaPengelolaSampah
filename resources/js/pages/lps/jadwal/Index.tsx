import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

// --- Tipe Data ---
type JadwalTersimpan = Record<string, string[]>;

interface Zona {
    id: number;
    nama_zona: string;
}

interface PageProps {
    semuaZona: Zona[]; 
    jadwalTersimpan: JadwalTersimpan;
}

const EditJadwalModal: React.FC<{
    hari: string;
    semuaZona: Zona[]; 
    zonaTerpilihAwal: string[];
}> = ({ hari, semuaZona, zonaTerpilihAwal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        hari: hari,
        zona: zonaTerpilihAwal,
    });

    useEffect(() => {
        if (isModalOpen) {
            reset();
            setData('zona', zonaTerpilihAwal);
        }
    }, [isModalOpen, zonaTerpilihAwal]);

    const handleCheckboxChange = (namaZona: string, checked: boolean) => {
        setData('zona', checked ? [...data.zona, namaZona] : data.zona.filter((z) => z !== namaZona));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('jadwal.store'), {
            preserveScroll: false, 
            onSuccess: () => {
                setIsModalOpen(false);
            },
            onError: (err) => {
                toast.error('Gagal menyimpan jadwal.');
                console.error(err);
            }
        });
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Atur Jadwal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Atur Jadwal untuk Hari {hari}</DialogTitle>
                    </DialogHeader>
                    <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-6">
                        {semuaZona.length > 0 ? (
                            semuaZona.map((zona) => (
                                <div key={zona.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${hari}-${zona.nama_zona}`}
                                        checked={data.zona.includes(zona.nama_zona)}
                                        onCheckedChange={(checked) => handleCheckboxChange(zona.nama_zona, !!checked)}
                                    />
                                    <Label htmlFor={`${hari}-${zona.nama_zona}`} className="text-sm font-medium">
                                        {zona.nama_zona}
                                    </Label>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-muted-foreground">
                                Tidak ada data zona yang tersedia. <br/>
                                Silakan tambahkan data zona terlebih dahulu di menu "Data Zona".
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// --- Komponen Utama Halaman ---
const JadwalIndex: React.FC<PageProps> = ({ semuaZona, jadwalTersimpan }) => {
    const breadcrumb = [{ title: 'Jadwal Pengambilan', href: '/jadwal' }];
    const daftarHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Atur Jadwal Pengambilan" />
            <div className="container space-y-6">
                <div>
                    <h1>Atur Jadwal Pengambilan Sampah per Zona</h1>
                    <p className="text-muted-foreground">
                        Klik "Atur Jadwal" pada setiap hari untuk memilih zona mana saja yang akan diambil sampahnya.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {daftarHari.map((hari) => (
                        <Card key={hari}>
                            <CardHeader>
                                <CardTitle>{hari}</CardTitle>
                                <CardDescription>Jadwal untuk hari {hari}.</CardDescription>
                            </CardHeader>
                            <CardContent className="min-h-[40px]">
                                {jadwalTersimpan[hari] && jadwalTersimpan[hari].length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {jadwalTersimpan[hari].map((zona) => (
                                            <span
                                                key={zona}
                                                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                                            >
                                                {zona}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Belum ada jadwal.</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <EditJadwalModal
                                    hari={hari}
                                    semuaZona={semuaZona}
                                    zonaTerpilihAwal={jadwalTersimpan[hari] || []}
                                />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default JadwalIndex;