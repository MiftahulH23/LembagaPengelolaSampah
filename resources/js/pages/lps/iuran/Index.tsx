import { DataTable, DataTableControls } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Iuran } from '@/types/data/iuran';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Index = (props: { iuran: Iuran.Default[] }) => {
    const { iuran } = props;
    const { data, setData, post, processing, errors, reset } = useForm({
        nominal_iuran: '',
    });
    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors } = useForm({ nominal_iuran: '' });

    const breadcrumb = [{ title: 'Iuran', href: '/iuran' }];

    const columns: ColumnDef<Iuran.Default>[] = [
        {
            id: 'nomor',
            header: 'No',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'nominal_iuran',
            header: 'Nominal Iuran',
            cell: ({ row }) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.nominal_iuran),
        },
        {
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEditModal(row.original)}>
                        <SquarePen />
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteId(row.original.id)}>
                        <Trash2 />
                    </Button>
                </div>
            ),
        },
    ];

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIuran, setSelectedIuran] = useState<Iuran.Default | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [price, setPrice] = useState<string>();
    const [displayJumlah, setDisplayJumlah] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('iuran.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Iuran berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menambahkan Iuran');
            },
        });
    };

    const openEditModal = (iuran: Iuran.Default) => {
        setSelectedIuran(iuran);
        setEditData({ nominal_iuran: String(iuran.nominal_iuran) });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('iuran.update', selectedIuran?.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success('Iuran berhasil diperbarui');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui Iuran');
            },
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('iuran.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Iuran berhasil dihapus');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menghapus Iuran');
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Iuran" />
            <div className="container">
                <h1>Iuran</h1>
                <DataTable columns={columns} data={iuran}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={<Button onClick={() => setIsAddModalOpen(true)}>Tambah Iuran</Button>}
                        ></DataTableControls>
                    )}
                </DataTable>

                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogTitle>Tambah Iuran</DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="nominal_iuran">Nominal Iuran</Label>
                                <Input
                                    type="text"
                                    id="nominal_iuran"
                                    value={displayJumlah}
                                    onChange={(e) => {
                                    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                                    setData('nominal_iuran', raw);
                                    setDisplayJumlah(new Intl.NumberFormat('id-ID').format(Number(raw)));
                                }}
                                />
                                {/* {errors.nominal_iuran && <p className="text-sm text-red-600">{errors.nominal_iuran}</p>} */}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Modal Edit Data */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogTitle>Edit Iuran</DialogTitle>
                        <form onSubmit={handleEditSubmit}>
                            <div>
                                <Label htmlFor="nominal_iuran">Nominal Iuran</Label>
                                <Input
                                    type="text"
                                    id="nominal_iuran"
                                    value={editData.nominal_iuran}
                                    onChange={(e) => setEditData('nominal_iuran', e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Delete Data */}
                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent>
                        <div className="flex flex-col items-center justify-center gap-3">
                            <TriangleAlert size={48} className="text-destructive" />
                            <DialogTitle className="text-center">Konfirmasi Hapus</DialogTitle>
                            <DialogDescription className="text-center">Apakah Anda yakin ingin menghapus data ini?</DialogDescription>
                        </div>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={() => {
                                    if (deleteId) handleDelete(deleteId);
                                    setDeleteId(null);
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
