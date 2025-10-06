import { DataTable, DataTableControls } from '@/components/data-table';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Wilayah } from '@/types/data/wilayah';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFnOption } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Index = (props: { kelurahan: Wilayah.Kelurahan[]; kecamatan: Wilayah.Kecamatan[] }) => {
    const { kelurahan, kecamatan } = props;
    const breadcrumb = [{ title: 'Kelurahan', href: '/kelurahan' }];
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_kelurahan: '',
        kecamatan_id: '',
    });
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
    } = useForm({ nama_kelurahan: '', kecamatan_id: '' });
    const columns: ColumnDef<Wilayah.Kelurahan>[] = [
        {
            id: 'nomor',
            header: 'No',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'nama_kelurahan',
            header: 'Nama Kelurahan',
        },
        {
            id: 'kecamatan_id',
            accessorKey: 'kecamatan.nama_kecamatan',
            header: 'Nama Kecamatan',
            filterFn: 'checkbox' as FilterFnOption<Wilayah.Kelurahan>,
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
    const [selectedKelurahan, setSelectedKelurahan] = useState<Wilayah.Kelurahan | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kelurahan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Kelurahan berhasil ditambahkan.');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menambahkan kelurahan.');
            },
        });
    };

    const openEditModal = (kelurahan: Wilayah.Kelurahan) => {
        setSelectedKelurahan(kelurahan);
        setEditData({
            nama_kelurahan: kelurahan.nama_kelurahan,
            kecamatan_id: String(kelurahan.kecamatan_id),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('kelurahan.update', selectedKelurahan?.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                toast.success('Kelurahan berhasil diubah.');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat mengubah kelurahan.');
            },
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('kelurahan.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Kecamatan berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus Kecamatan'),
        });
    };
    const dataKecamatan = kecamatan.map((item) => item.nama_kecamatan);
    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Kelurahan" />
            <div className="container">
                <h1>Data Kelurahan</h1>
                <DataTable columns={columns} data={kelurahan}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <Button
                                    onClick={() => {
                                        data.nama_kelurahan = '';
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    Tambah
                                </Button>
                            }
                            search
                        >
                            <DataTableFilter
                                table={table}
                                extend={[
                                    {
                                        id: 'kecamatan_id',
                                        label: 'Kecamatan',
                                        data: dataKecamatan,
                                    },
                                ]}
                            />
                        </DataTableControls>
                    )}
                </DataTable>
                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogTitle>Tambah Kelurahan</DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="kecamatan_id">Kecamatan</Label>
                                <Select value={data.kecamatan_id} onValueChange={(value) => setData('kecamatan_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kecamatan.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.kecamatan_id && <span className="text-sm text-red-500">{errors.kecamatan_id}</span>}
                            </div>
                            <div>
                                <Label htmlFor="nama_kelurahan">Nama Kelurahan</Label>
                                <Input
                                    type="text"
                                    id="nama_kelurahan"
                                    name="nama_kelurahan"
                                    placeholder="Masukkan nama kelurahan"
                                    value={data.nama_kelurahan}
                                    onChange={(e) => setData('nama_kelurahan', e.target.value)}
                                />
                                {errors.nama_kelurahan && <span className="text-sm text-red-500">{errors.nama_kelurahan}</span>}
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
                        <DialogTitle>Edit Kelurahan</DialogTitle>
                        <form onSubmit={handleEditSubmit}>
                            <div>
                                <Label>Nama Kecamatan</Label>
                                <Select value={editData.kecamatan_id} onValueChange={(value) => setEditData('kecamatan_id', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kecamatan.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.kecamatan_id && <span className="text-sm text-red-500">{editErrors.kecamatan_id}</span>}
                            </div>
                            <div>
                                <Label htmlFor="nama_kelurahan">Nama Kelurahan</Label>
                                <Input
                                    id="nama_kelurahan"
                                    name="nama_kelurahan"
                                    type="text"
                                    value={editData.nama_kelurahan}
                                    onChange={(e) => setEditData('nama_kelurahan', e.target.value)}
                                />
                                {editErrors.nama_kelurahan && <span className="text-sm text-red-500">{editErrors.nama_kelurahan}</span>}
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
