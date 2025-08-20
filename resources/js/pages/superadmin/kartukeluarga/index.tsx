import { DataTable, DataTableControls } from '@/components/data-table';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// --- PERUBAHAN 1: Import komponen Select dari Shadcn ---
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Asumsikan path ini benar
import AppLayout from '@/layouts/app-layout';
import { KartuKeluarga } from '@/types/data/kartukeluarga';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFnOption } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- PERUBAHAN 2: Definisikan tipe data untuk props kecamatan dan kelurahan ---
interface Kecamatan {
    id: number;
    nama_kecamatan: string;
}

interface Kelurahan {
    id: number;
    nama_kelurahan: string;
    kecamatan_id: number;
}

const Index = (props: {
    kartukeluarga: KartuKeluarga.Default[];
    kecamatan: Kecamatan[]; // Anda perlu mengirim data ini dari controller
    kelurahan: Kelurahan[]; // Anda perlu mengirim data ini dari controller
}) => {
    // Ambil semua data dari props
    const { kartukeluarga, kecamatan, kelurahan } = props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nik: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        kelurahan_id: '',
        kecamatan_id: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEditForm,
    } = useForm({
        nik: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        kelurahan_id: '',
        kecamatan_id: '',
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedKartuKeluarga, setSelectedKartuKeluarga] = useState<KartuKeluarga.Default | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null); // State untuk modal delete

    const [filteredKelurahan, setFilteredKelurahan] = useState<Kelurahan[]>([]);
    const [filteredEditKelurahan, setFilteredEditKelurahan] = useState<Kelurahan[]>([]); // State kelurahan terfilter untuk modal EDIT

    // useEffect untuk cascading dropdown di modal TAMBAH
    useEffect(() => {
        if (data.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(data.kecamatan_id));
            setFilteredKelurahan(filtered);
        } else {
            setFilteredKelurahan([]);
        }
        setData('kelurahan_id', ''); // Reset pilihan kelurahan setiap kali kecamatan berubah
    }, [data.kecamatan_id, kelurahan]);

    // useEffect untuk cascading dropdown di modal EDIT
    useEffect(() => {
        if (editData.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(editData.kecamatan_id));
            setFilteredEditKelurahan(filtered);
        } else {
            setFilteredEditKelurahan([]);
        }
    }, [editData.kecamatan_id, kelurahan]);

    const columns: ColumnDef<KartuKeluarga.Default>[] = [
        {
            accessorKey: 'nik',
            header: 'NIK',
        },
        {
            accessorKey: 'nama_kepala_keluarga',
            header: 'Nama Kepala Keluarga',
        },
        {
            id: 'kelurahan_id',
            accessorKey: 'kelurahan.nama_kelurahan',
            header: 'Kelurahan',
            filterFn: 'checkbox' as FilterFnOption<KartuKeluarga.Default>,
        },
        {
            id: 'kecamatan_id',
            accessorKey: 'kecamatan.nama_kecamatan',
            header: 'Kecamatan',
            filterFn: 'checkbox' as FilterFnOption<KartuKeluarga.Default>,
        },
        {
            accessorKey: 'alamat',
            header: 'Alamat',
        },
        {
            accessorKey: 'rt',
            header: 'RT',
        },
        {
            accessorKey: 'rw',
            header: 'RW',
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

    const breadcrumb = [{ title: 'Kartu Keluarga', href: '/kartukeluarga' }];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kartukeluarga.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Kartu Keluarga berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan Kartu Keluarga.');
            },
        });
    };

    const openEditModal = (kartuKeluarga: KartuKeluarga.Default) => {
        setSelectedKartuKeluarga(kartuKeluarga);
        setEditData({
            nik: kartuKeluarga.nik,
            nama_kepala_keluarga: kartuKeluarga.nama_kepala_keluarga,
            alamat: kartuKeluarga.alamat,
            rt: kartuKeluarga.rt,
            rw: kartuKeluarga.rw,
            kelurahan_id: String(kartuKeluarga.kelurahan_id),
            kecamatan_id: String(kartuKeluarga.kecamatan_id),
        });

        // Langsung filter kelurahan saat modal edit dibuka
        const initialFiltered = kelurahan.filter((k) => k.kecamatan_id === Number(kartuKeluarga.kecamatan_id));
        setFilteredEditKelurahan(initialFiltered);

        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKartuKeluarga) return;

        put(route('kartukeluarga.update', selectedKartuKeluarga.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetEditForm();
                setIsEditModalOpen(false);
                toast.success('Kartu Keluarga berhasil diubah');
            },
            onError: () => {
                toast.error('Gagal mengubah Kartu Keluarga.');
            },
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('kartukeluarga.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Kartu Keluarga berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus Kartu Keluarga'),
            onFinish: () => {
                if (deleteId) setDeleteId(null);
            },
        });
    };
    const dataKecamatan = kecamatan.map((item) => item.nama_kecamatan);
    const dataKelurahan = kelurahan.map((item) => item.nama_kelurahan);
    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Kartu Keluarga" />
            <div className="container">
                <h1>Kartu Keluarga</h1>
                <DataTable columns={columns} data={kartukeluarga}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <Button
                                    onClick={() => {
                                        reset();
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    Tambah
                                </Button>
                            }
                        >
                            <DataTableFilter
                                table={table}
                                extend={[
                                    {
                                        id: 'kecamatan_id',
                                        label: 'Kecamatan',
                                        data: dataKecamatan,
                                    },
                                    {
                                        id: 'kelurahan_id',
                                        label: 'Kelurahan',
                                        data: dataKelurahan,
                                    }
                                ]}
                            />
                        </DataTableControls>
                    )}
                </DataTable>

                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogTitle>Tambah Kartu Keluarga</DialogTitle>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* NIK */}
                            <div>
                                <Label htmlFor="nik">NIK</Label>
                                <Input id="nik" value={data.nik} placeholder="Masukkan NIK" onChange={(e) => setData('nik', e.target.value)} />
                                {errors.nik && <p className="mt-1 text-sm text-red-500">{errors.nik}</p>}
                            </div>
                            {/* Nama Kepala Keluarga */}
                            <div>
                                <Label htmlFor="nama_kepala_keluarga">Nama Kepala Keluarga</Label>
                                <Input
                                    id="nama_kepala_keluarga"
                                    value={data.nama_kepala_keluarga}
                                    placeholder="Masukkan Nama Kepala Keluarga"
                                    onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                                />
                                {errors.nama_kepala_keluarga && <p className="mt-1 text-sm text-red-500">{errors.nama_kepala_keluarga}</p>}
                            </div>
                            {/* Select Kecamatan */}
                            <div>
                                <Label htmlFor="kecamatan_id">Kecamatan</Label>
                                <Select value={data.kecamatan_id} onValueChange={(value) => setData('kecamatan_id', value)}>
                                    <SelectTrigger id="kecamatan_id">
                                        <SelectValue placeholder="Pilih Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kecamatan.map((option) => (
                                            <SelectItem key={option.id} value={String(option.id)}>
                                                {option.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.kecamatan_id && <p className="mt-1 text-sm text-red-500">{errors.kecamatan_id}</p>}
                            </div>

                            {/* Select Kelurahan (Cascading) */}
                            <div>
                                <Label htmlFor="kelurahan_id">Kelurahan</Label>
                                <Select
                                    value={data.kelurahan_id}
                                    onValueChange={(value) => setData('kelurahan_id', value)}
                                    disabled={!data.kecamatan_id || filteredKelurahan.length === 0}
                                >
                                    <SelectTrigger id="kelurahan_id">
                                        <SelectValue placeholder="Pilih Kelurahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredKelurahan.map((option) => (
                                            <SelectItem key={option.id} value={String(option.id)}>
                                                {option.nama_kelurahan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.kelurahan_id && <p className="mt-1 text-sm text-red-500">{errors.kelurahan_id}</p>}
                            </div>
                            {/* RT / RW */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="rt">RT</Label>
                                    <Input id="rt" value={data.rt} placeholder="Masukkan RT" onChange={(e) => setData('rt', e.target.value)} />
                                    {errors.rt && <p className="mt-1 text-sm text-red-500">{errors.rt}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="rw">RW</Label>
                                    <Input id="rw" value={data.rw} placeholder="Masukkan RW" onChange={(e) => setData('rw', e.target.value)} />
                                    {errors.rw && <p className="mt-1 text-sm text-red-500">{errors.rw}</p>}
                                </div>
                            </div>
                            {/* Alamat */}
                            <div>
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input
                                    id="alamat"
                                    value={data.alamat}
                                    placeholder="Masukkan Alamat"
                                    onChange={(e) => setData('alamat', e.target.value)}
                                />
                                {errors.alamat && <p className="mt-1 text-sm text-red-500">{errors.alamat}</p>}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit Data */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogTitle>Edit Kartu Keluarga</DialogTitle>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* NIK */}
                            <div>
                                <Label htmlFor="edit_nik">NIK</Label>
                                <Input id="edit_nik" name="nik" value={editData.nik} onChange={(e) => setEditData('nik', e.target.value)} />
                                {editErrors.nik && <p className="mt-1 text-sm text-red-500">{editErrors.nik}</p>}
                            </div>
                            {/* Nama Kepala Keluarga */}
                            <div>
                                <Label htmlFor="edit_nama_kepala_keluarga">Nama Kepala Keluarga</Label>
                                <Input
                                    id="edit_nama_kepala_keluarga"
                                    value={editData.nama_kepala_keluarga}
                                    onChange={(e) => setEditData('nama_kepala_keluarga', e.target.value)}
                                />
                                {editErrors.nama_kepala_keluarga && <p className="mt-1 text-sm text-red-500">{editErrors.nama_kepala_keluarga}</p>}
                            </div>
                            {/* Select Kecamatan (Edit) */}
                            <div>
                                <Label htmlFor="edit_kecamatan_id">Kecamatan</Label>
                                <Select
                                    value={editData.kecamatan_id}
                                    onValueChange={(value) => {
                                        setEditData('kecamatan_id', value);
                                        // Reset kelurahan saat kecamatan diubah
                                        setEditData('kelurahan_id', '');
                                    }}
                                >
                                    <SelectTrigger id="edit_kecamatan_id">
                                        <SelectValue placeholder="Pilih Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kecamatan.map((option) => (
                                            <SelectItem key={option.id} value={String(option.id)}>
                                                {option.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.kecamatan_id && <p className="mt-1 text-sm text-red-500">{editErrors.kecamatan_id}</p>}
                            </div>

                            {/* Select Kelurahan (Cascading Edit) */}
                            <div>
                                <Label htmlFor="edit_kelurahan_id">Kelurahan</Label>
                                <Select
                                    value={editData.kelurahan_id}
                                    onValueChange={(value) => setEditData('kelurahan_id', value)}
                                    disabled={!editData.kecamatan_id || filteredEditKelurahan.length === 0}
                                >
                                    <SelectTrigger id="edit_kelurahan_id">
                                        <SelectValue placeholder="Pilih Kelurahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredEditKelurahan.map((option) => (
                                            <SelectItem key={option.id} value={String(option.id)}>
                                                {option.nama_kelurahan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.kelurahan_id && <p className="mt-1 text-sm text-red-500">{editErrors.kelurahan_id}</p>}
                            </div>

                            {/* RT / RW */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit_rt">RT</Label>
                                    <Input id="edit_rt" value={editData.rt} onChange={(e) => setEditData('rt', e.target.value)} />
                                    {editErrors.rt && <p className="mt-1 text-sm text-red-500">{editErrors.rt}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_rw">RW</Label>
                                    <Input id="edit_rw" value={editData.rw} onChange={(e) => setEditData('rw', e.target.value)} />
                                    {editErrors.rw && <p className="mt-1 text-sm text-red-500">{editErrors.rw}</p>}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div>
                                <Label htmlFor="edit_alamat">Alamat</Label>
                                <Input id="edit_alamat" value={editData.alamat} onChange={(e) => setEditData('alamat', e.target.value)} />
                                {editErrors.alamat && <p className="mt-1 text-sm text-red-500">{editErrors.alamat}</p>}
                            </div>

                            <div className="mt-4 flex justify-end">
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
                        <div className="flex flex-col items-center justify-center gap-3 pt-4">
                            <TriangleAlert size={48} className="text-destructive" />
                            <DialogTitle className="text-center">Konfirmasi Hapus</DialogTitle>
                            <DialogDescription className="text-center">Apakah Anda yakin ingin menghapus data kartu keluarga ini?</DialogDescription>
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
