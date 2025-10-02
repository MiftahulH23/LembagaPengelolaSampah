import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableControls } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';

// Tipe Data
interface Zona {
    id: number;
    nama_zona: string;
}

interface PageProps {
    zonas: Zona[];
}

const ZonaIndex: React.FC<PageProps> = ({ zonas }) => {
    // Form untuk Tambah
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_zona: '',
    });

    // Form untuk Edit
    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        nama_zona: '',
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('zona.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Zona berhasil ditambahkan.');
            },
            onError: () => {
                toast.error('Gagal menambahkan zona. Periksa kembali data Anda.');
            },
        });
    };

    const openEditModal = (zona: Zona) => {
        setSelectedZona(zona);
        setEditData('nama_zona', zona.nama_zona);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedZona) return;
        put(route('zona.update', selectedZona.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetEditForm();
                setIsEditModalOpen(false);
                toast.success('Zona berhasil diubah.');
            },
            onError: () => {
                toast.error('Gagal mengubah zona.');
            },
        });
    };

    const handleDelete = (id: number) => {
        router.delete(route('zona.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Zona berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus zona.'),
            onFinish: () => setDeleteId(null),
        });
    };

    const columns: ColumnDef<Zona>[] = [
        {
            accessorKey: 'nama_zona',
            header: 'Nama Zona',
        },
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditModal(row.original)}>
                        <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeleteId(row.original.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const breadcrumb = [{ title: 'Data Zona', href: '/zona' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Data Zona" />
            <div className="container">
                <h1>Data Zona</h1>
                <DataTable columns={columns} data={zonas}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <Button onClick={() => { data.nama_zona= "" ; setIsAddModalOpen(true); }}>
                                    Tambah Zona
                                </Button>
                            }
                        />
                    )}
                </DataTable>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Zona Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="nama_zona">Nama Zona</Label>
                            <Input id="nama_zona" value={data.nama_zona} onChange={(e) => setData('nama_zona', e.target.value)} autoFocus />
                            {errors.nama_zona && <p className="mt-1 text-sm text-red-500">{errors.nama_zona}</p>}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Zona</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit_nama_zona">Nama Zona</Label>
                            <Input id="edit_nama_zona" value={editData.nama_zona} onChange={(e) => setEditData('nama_zona', e.target.value)} autoFocus />
                            {editErrors.nama_zona && <p className="mt-1 text-sm text-red-500">{editErrors.nama_zona}</p>}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Hapus */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <div className="flex flex-col items-center justify-center gap-3 pt-4">
                        <TriangleAlert size={48} className="text-destructive" />
                        <DialogTitle className="text-center">Konfirmasi Hapus</DialogTitle>
                        <DialogDescription className="text-center">
                            Apakah Anda yakin ingin menghapus zona ini? <br/> Data KK yang terkait juga bisa terpengaruh.
                        </DialogDescription>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
                        <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default ZonaIndex;