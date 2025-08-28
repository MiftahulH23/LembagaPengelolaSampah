import { DataTable, DataTableControls } from '@/components/data-table';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { KartuKeluarga } from '@/types/data/kartukeluarga';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFnOption } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Kecamatan {
    id: number;
    nama_kecamatan: string;
}
interface Kelurahan {
    id: number;
    nama_kelurahan: string;
    kecamatan_id: number;
}

const Index = (props: { kartukeluarga: KartuKeluarga.Default[]; kecamatan: Kecamatan[]; kelurahan: Kelurahan[] }) => {
    const { kartukeluarga, kecamatan, kelurahan } = props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nik: '',
        nomor_kk: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        zona: '',
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
        nomor_kk: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        zona: '',
        kelurahan_id: '',
        kecamatan_id: '',
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedKartuKeluarga, setSelectedKartuKeluarga] = useState<KartuKeluarga.Default | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filteredKelurahan, setFilteredKelurahan] = useState<Kelurahan[]>([]);
    const [filteredEditKelurahan, setFilteredEditKelurahan] = useState<Kelurahan[]>([]);

    useEffect(() => {
        if (data.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(data.kecamatan_id));
            setFilteredKelurahan(filtered);
        } else {
            setFilteredKelurahan([]);
        }
        setData('kelurahan_id', '');
    }, [data.kecamatan_id, kelurahan]);

    useEffect(() => {
        if (editData.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(editData.kecamatan_id));
            setFilteredEditKelurahan(filtered);
        } else {
            setFilteredEditKelurahan([]);
        }
    }, [editData.kecamatan_id, kelurahan]);

    const columns: ColumnDef<KartuKeluarga.Default>[] = [
        { accessorKey: 'nik', header: 'NIK' },
        { accessorKey: 'nomor_kk', header: 'No. KK' },
        { accessorKey: 'nama_kepala_keluarga', header: 'Nama Kepala Keluarga' },
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
        { accessorKey: 'alamat', header: 'Alamat' },
        { accessorKey: 'rt', header: 'RT' },
        { accessorKey: 'rw', header: 'RW' },
        { accessorKey: 'zona', header: 'Zona' },
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
                toast.error('Gagal menambahkan Kartu Keluarga. Periksa kembali data Anda.');
            },
        });
    };

    const openEditModal = (kk: KartuKeluarga.Default) => {
        setSelectedKartuKeluarga(kk);
        setEditData({
            nik: kk.nik,
            nomor_kk: kk.nomor_kk,
            nama_kepala_keluarga: kk.nama_kepala_keluarga,
            alamat: kk.alamat,
            rt: kk.rt,
            rw: kk.rw,
            zona: kk.zona,
            kelurahan_id: String(kk.kelurahan_id),
            kecamatan_id: String(kk.kecamatan_id),
        });

        const initialFiltered = kelurahan.filter((k) => k.kecamatan_id === Number(kk.kecamatan_id));
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
                toast.error('Gagal mengubah Kartu Keluarga. Periksa kembali data Anda.');
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

    const zonaOptions = Array.from({ length: 10 }, (_, i) => `Zona ${i + 1}`);
    const dataKecamatan = kecamatan.map((item) => item.nama_kecamatan);
    const dataKelurahan = kelurahan.map((item) => item.nama_kelurahan);
    const breadcrumb = [{ title: 'Kartu Keluarga', href: '/kartukeluarga' }];

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
                                    { id: 'kecamatan_id', label: 'Kecamatan', data: dataKecamatan },
                                    { id: 'kelurahan_id', label: 'Kelurahan', data: dataKelurahan },
                                ]}
                            />
                        </DataTableControls>
                    )}
                </DataTable>

                {/* Modal Tambah Data */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogTitle>Tambah Kartu Keluarga</DialogTitle>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="nik">NIK</Label>
                                    <Input id="nik" value={data.nik} onChange={(e) => setData('nik', e.target.value)} />
                                    {errors.nik && <p className="text-sm text-red-500">{errors.nik}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="nomor_kk">Nomor Kartu Keluarga</Label>
                                    <Input id="nomor_kk" value={data.nomor_kk} onChange={(e) => setData('nomor_kk', e.target.value)} />
                                    {errors.nomor_kk && <p className="text-sm text-red-500">{errors.nomor_kk}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="nama_kepala_keluarga">Nama Kepala Keluarga</Label>
                                <Input
                                    id="nama_kepala_keluarga"
                                    value={data.nama_kepala_keluarga}
                                    onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                                />
                                {errors.nama_kepala_keluarga && <p className="text-sm text-red-500">{errors.nama_kepala_keluarga}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="kecamatan_id">Kecamatan (Lokasi Rumah)</Label>
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
                                    {errors.kecamatan_id && <p className="text-sm text-red-500">{errors.kecamatan_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="kelurahan_id">Kelurahan (Lokasi Rumah)</Label>
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
                                    {errors.kelurahan_id && <p className="text-sm text-red-500">{errors.kelurahan_id}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="rt">RT</Label>
                                    <Input id="rt" value={data.rt} onChange={(e) => setData('rt', e.target.value)} />
                                    {errors.rt && <p className="text-sm text-red-500">{errors.rt}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="rw">RW</Label>
                                    <Input id="rw" value={data.rw} onChange={(e) => setData('rw', e.target.value)} />
                                    {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
                                </div>
                                <div className="col-span-3 md:col-span-1">
                                    <Label htmlFor="zona">Zona</Label>
                                    <Select value={data.zona} onValueChange={(value) => setData('zona', value)}>
                                        <SelectTrigger id="zona">
                                            <SelectValue placeholder="Pilih Zona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zonaOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.zona && <p className="text-sm text-red-500">{errors.zona}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="alamat">Alamat (Domisili/Lokasi Rumah)</Label>
                                <Input id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Isi dengan alamat fisik rumah yang akan dilayani, bukan alamat KTP jika berbeda.
                                </p>
                                {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
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
                    <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogTitle>Edit Kartu Keluarga</DialogTitle>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="edit_nik">NIK</Label>
                                    <Input id="edit_nik" value={editData.nik} onChange={(e) => setEditData('nik', e.target.value)} />
                                    {editErrors.nik && <p className="text-sm text-red-500">{editErrors.nik}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_nomor_kk">Nomor Kartu Keluarga</Label>
                                    <Input id="edit_nomor_kk" value={editData.nomor_kk} onChange={(e) => setEditData('nomor_kk', e.target.value)} />
                                    {editErrors.nomor_kk && <p className="text-sm text-red-500">{editErrors.nomor_kk}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="edit_nama_kepala_keluarga">Nama Kepala Keluarga</Label>
                                <Input
                                    id="edit_nama_kepala_keluarga"
                                    value={editData.nama_kepala_keluarga}
                                    onChange={(e) => setEditData('nama_kepala_keluarga', e.target.value)}
                                />
                                {editErrors.nama_kepala_keluarga && <p className="text-sm text-red-500">{editErrors.nama_kepala_keluarga}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="edit_kecamatan_id">Kecamatan (Lokasi Rumah)</Label>
                                    <Select
                                        value={editData.kecamatan_id}
                                        onValueChange={(value) => {
                                            setEditData('kecamatan_id', value);
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
                                    {editErrors.kecamatan_id && <p className="text-sm text-red-500">{editErrors.kecamatan_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_kelurahan_id">Kelurahan (Lokasi Rumah)</Label>
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
                                    {editErrors.kelurahan_id && <p className="text-sm text-red-500">{editErrors.kelurahan_id}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edit_rt">RT</Label>
                                    <Input id="edit_rt" value={editData.rt} onChange={(e) => setEditData('rt', e.target.value)} />
                                    {editErrors.rt && <p className="text-sm text-red-500">{editErrors.rt}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_rw">RW</Label>
                                    <Input id="edit_rw" value={editData.rw} onChange={(e) => setEditData('rw', e.target.value)} />
                                    {editErrors.rw && <p className="text-sm text-red-500">{editErrors.rw}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_zona">Zona</Label>
                                    <Select value={editData.zona} onValueChange={(value) => setEditData('zona', value)}>
                                        <SelectTrigger id="edit_zona">
                                            <SelectValue placeholder="Pilih Zona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zonaOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editErrors.zona && <p className="text-sm text-red-500">{editErrors.zona}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="edit_alamat">Alamat (Domisili/Lokasi Rumah)</Label>
                                <Input id="edit_alamat" value={editData.alamat} onChange={(e) => setEditData('alamat', e.target.value)} />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Isi dengan alamat fisik rumah yang akan dilayani, bukan alamat KTP jika berbeda.
                                </p>
                                {editErrors.alamat && <p className="text-sm text-red-500">{editErrors.alamat}</p>}
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
