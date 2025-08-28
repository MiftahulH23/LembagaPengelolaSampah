import { DataTable, DataTableControls } from '@/components/data-table';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Wilayah } from '@/types/data/wilayah';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Index = (props: { kecamatan: Wilayah.Kecamatan[] }) => {
    const { kecamatan } = props;
    const breadcrumb = [{ title: 'Kecamatan', href: '/kecamatan' }];

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_kecamatan: '',
    });
    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors } = useForm({ nama_kecamatan: '' });

    const columns: ColumnDef<Wilayah.Kecamatan>[] = [
        {
            id: 'nomor',
            header: 'No',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'nama_kecamatan',
            header: 'Nama Kecamatan',
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
    const [selectedKecamatan, setSelectedKecamatan] = useState<Wilayah.Kecamatan | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kecamatan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Kecamatan berhasil ditambahkan');
            },
            onError: (errors) => {
                toast.error('Terjadi kesalahan saat menambahkan kecamatan.');
            },
        });
    };

    const openEditModal = (kecamatan: Wilayah.Kecamatan) => {
        setSelectedKecamatan(kecamatan);
        setEditData({ nama_kecamatan: kecamatan.nama_kecamatan });
        setIsEditModalOpen(true);
    };
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('kecamatan.update', selectedKecamatan?.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                toast.success('Kecamatan berhasil diubah');
            },
            onError: (errors) => {
                toast.error('Terjadi kesalahan saat mengubah kecamatan.');
            },
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('kecamatan.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Kecamatan berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus Kecamatan'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Kecamatan" />
            <div className="container">
                <h1>Data Kecamatan</h1>
                <DataTable columns={columns} data={kecamatan}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <Button
                                    onClick={() => {
                                        data.nama_kecamatan = '';
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    Tambah
                                </Button>
                            }
                            search
                        >
                            <DataTableFilter table={table} />
                        </DataTableControls>
                    )}
                </DataTable>
                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogTitle>Tambah Kecamatan</DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="nama_kecamatan">Nama Kecamatan</Label>
                                <Input
                                    type="text"
                                    id="nama_kecamatan"
                                    name="nama_kecamatan"
                                    placeholder='Masukkan nama kecamatan'
                                    value={data.nama_kecamatan}
                                    onChange={(e) => setData('nama_kecamatan', e.target.value)}
                                />
                                {errors.nama_kecamatan && <span className="text-sm text-red-500">{errors.nama_kecamatan}</span>}
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
                        <DialogTitle>Edit Kecamatan</DialogTitle>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="nama_kecamatan">Nama Kecamatan</Label>
                                <Input
                                    id="nama_kecamatan"
                                    name="nama_kecamatan"
                                    type="text"
                                    value={editData.nama_kecamatan}
                                    onChange={(e) => setEditData('nama_kecamatan', e.target.value)}
                                />
                                {editErrors.nama_kecamatan && <span className="text-sm text-red-500">{editErrors.nama_kecamatan}</span>}
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
