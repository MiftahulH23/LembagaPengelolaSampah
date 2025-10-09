import { DataTable, DataTableControls } from '@/components/data-table';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { KartuKeluarga } from '@/types/data/kartukeluarga';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFnOption } from '@tanstack/react-table';
import { SquarePen, Trash2, TriangleAlert, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- Tipe Data dari Controller ---
interface Kecamatan {
    id: number;
    nama_kecamatan: string;
}
interface Kelurahan {
    id: number;
    nama_kelurahan: string;
    kecamatan_id: number;
}
interface Zona {
    id: number;
    nama_zona: string;
}

const ImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { data, setData, post, processing, errors, reset } = useForm<{ file: File | null }>({ file: null });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kartukeluarga.import'), {
            onSuccess: () => {
                onClose();
                reset();
            },
            onError: (err: any) => {
                toast.error(err.file || 'Terjadi kesalahan saat mengimpor file.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Data Kartu Keluarga</DialogTitle>
                    <DialogDescription>
                        Unggah file Excel (.xlsx). Sistem akan membaca setiap sheet sebagai Zona dan mengimpor data di dalamnya.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="file">File Excel</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                        />
                        {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!data.file || processing}>
                            {processing ? 'Mengimpor...' : 'Mulai Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const FormModalContent = ({ isEdit = false, data, setData, errors, kecamatan, kelurahan, zonas, filteredKelurahan }: any) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor={isEdit ? 'edit_nama' : 'nama'}>Nama</Label>
                    <Input id={isEdit ? 'edit_nama' : 'nama'} value={data.nama} onChange={(e) => setData('nama', e.target.value)} />
                    {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_no_hp' : 'no_hp'}>No. HP</Label>
                    <Input id={isEdit ? 'edit_no_hp' : 'no_hp'} value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                    {errors.no_hp && <p className="text-sm text-red-500">{errors.no_hp}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor={isEdit ? 'edit_kecamatan_id' : 'kecamatan_id'}>Kecamatan</Label>
                    <Select
                        value={data.kecamatan_id}
                        onValueChange={(value) => {
                            setData('kecamatan_id', value);
                            setData('kelurahan_id', '');
                        }}
                    >
                        <SelectTrigger id={isEdit ? 'edit_kecamatan_id' : 'kecamatan_id'}>
                            <SelectValue placeholder="Pilih Kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                            {kecamatan.map((option: Kecamatan) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.nama_kecamatan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.kecamatan_id && <p className="text-sm text-red-500">{errors.kecamatan_id}</p>}
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_kelurahan_id' : 'kelurahan_id'}>Kelurahan</Label>
                    <Select
                        value={data.kelurahan_id}
                        onValueChange={(value) => setData('kelurahan_id', value)}
                        disabled={!data.kecamatan_id || filteredKelurahan.length === 0}
                    >
                        <SelectTrigger id={isEdit ? 'edit_kelurahan_id' : 'kelurahan_id'}>
                            <SelectValue placeholder="Pilih Kelurahan" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredKelurahan.map((option: Kelurahan) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.nama_kelurahan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.kelurahan_id && <p className="text-sm text-red-500">{errors.kelurahan_id}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div>
                    <Label htmlFor={isEdit ? 'edit_blok' : 'blok'}>Blok</Label>
                    <Input id={isEdit ? 'edit_blok' : 'blok'} value={data.blok} onChange={(e) => setData('blok', e.target.value)} />
                    {errors.blok && <p className="text-sm text-red-500">{errors.blok}</p>}
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_no_rumah' : 'no_rumah'}>No. Rumah</Label>
                    <Input id={isEdit ? 'edit_no_rumah' : 'no_rumah'} value={data.no_rumah} onChange={(e) => setData('no_rumah', e.target.value)} />
                    {errors.no_rumah && <p className="text-sm text-red-500">{errors.no_rumah}</p>}
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_rt' : 'rt'}>RT</Label>
                    <Input id={isEdit ? 'edit_rt' : 'rt'} value={data.rt} onChange={(e) => setData('rt', e.target.value)} />
                    {errors.rt && <p className="text-sm text-red-500">{errors.rt}</p>}
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_rw' : 'rw'}>RW</Label>
                    <Input id={isEdit ? 'edit_rw' : 'rw'} value={data.rw} onChange={(e) => setData('rw', e.target.value)} />
                    {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
                </div>
                <div className="col-span-2 md:col-span-1">
                    <Label htmlFor={isEdit ? 'edit_zona_id' : 'zona_id'}>Zona</Label>
                    <Select value={data.zona_id} onValueChange={(value) => setData('zona_id', value)}>
                        <SelectTrigger id={isEdit ? 'edit_zona_id' : 'zona_id'}>
                            <SelectValue placeholder="Pilih Zona" />
                        </SelectTrigger>
                        <SelectContent>
                            {zonas.map((option: Zona) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.nama_zona}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.zona_id && <p className="text-sm text-red-500">{errors.zona_id}</p>}
                </div>
            </div>
        </div>
    );
};

// --- Komponen Utama Halaman ---
const Index = (props: { kartukeluarga: KartuKeluarga.Default[]; kecamatan: Kecamatan[]; kelurahan: Kelurahan[]; zonas: Zona[] }) => {
    const { kartukeluarga, kecamatan, kelurahan, zonas } = props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        no_hp: '',
        blok: '',
        no_rumah: '',
        rt: '',
        rw: '',
        zona_id: '',
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
        nama: '',
        no_hp: '',
        blok: '',
        no_rumah: '',
        rt: '',
        rw: '',
        zona_id: '',
        kelurahan_id: '',
        kecamatan_id: '',
    });

    // State lainnya
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedKartuKeluarga, setSelectedKartuKeluarga] = useState<KartuKeluarga.Default | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filteredKelurahan, setFilteredKelurahan] = useState<Kelurahan[]>([]);
    const [filteredEditKelurahan, setFilteredEditKelurahan] = useState<Kelurahan[]>([]);

    useEffect(() => {
        if (data.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(data.kecamatan_id));
            setFilteredKelurahan(filtered);
        } else {
            setFilteredKelurahan([]);
        }
    }, [data.kecamatan_id]);

    useEffect(() => {
        if (editData.kecamatan_id) {
            const filtered = kelurahan.filter((k) => k.kecamatan_id === Number(editData.kecamatan_id));
            setFilteredEditKelurahan(filtered);
        } else {
            setFilteredEditKelurahan([]);
        }
    }, [editData.kecamatan_id]);

    const columns: ColumnDef<KartuKeluarga.Default>[] = [
        { accessorKey: 'nama', header: 'Nama' },
        { accessorKey: 'no_hp', header: 'No. HP' },
        { id: 'zona_id', accessorKey: 'zona.nama_zona', header: 'Zona', filterFn: 'checkbox' as FilterFnOption<KartuKeluarga.Default> },
        { accessorKey: 'blok', header: 'Blok' },
        { accessorKey: 'no_rumah', header: 'No. Rumah' },
        { accessorKey: 'rt', header: 'RT' },
        { accessorKey: 'rw', header: 'RW' },
        { id: 'kelurahan_id', accessorKey: 'kelurahan.nama_kelurahan', header: 'Kelurahan' },
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
                toast.success('Data warga berhasil ditambahkan.');
            },
            onError: () => toast.error('Gagal menambahkan data. Periksa kembali form Anda.'),
        });
    };

    const openEditModal = (kk: KartuKeluarga.Default) => {
        setSelectedKartuKeluarga(kk);
        setEditData({
            nama: kk.nama || '',
            no_hp: kk.no_hp || '',
            blok: kk.blok || '',
            no_rumah: kk.no_rumah || '',
            rt: kk.rt || '',
            rw: kk.rw || '',
            zona_id: String(kk.zona_id),
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
                toast.success('Data warga berhasil diubah.');
            },
            onError: () => toast.error('Gagal mengubah data. Periksa kembali form Anda.'),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(route('kartukeluarga.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Data warga berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus data.'),
            onFinish: () => setDeleteId(null),
        });
    };

    const breadcrumb = [{ title: 'Data Warga', href: '/kartukeluarga' }];

    const dataZona = zonas.map((zona) => ({ value: String(zona.nama_zona), label: zona.nama_zona }));
    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Data Warga" />
            <div className="container">
                <h1>Data Warga</h1>
                <DataTable columns={columns} data={kartukeluarga}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                                        <Upload className="mr-2 h-4 w-4" /> Import Excel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            data.nama = '';
                                            data.no_hp = '';
                                            data.blok = '';
                                            data.no_rumah = '';
                                            data.rt = '';
                                            data.rw = '';
                                            data.zona_id = '';
                                            data.kelurahan_id = '';
                                            data.kecamatan_id = '';
                                            setIsAddModalOpen(true);
                                        }}
                                    >
                                        Tambah
                                    </Button>
                                </div>
                            }
                        >
                            <DataTableFilter table={table} extend={[{ id: 'zona_id', label: 'Zona', data: dataZona }]} />
                        </DataTableControls>
                    )}
                </DataTable>
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Data Warga</DialogTitle>
                        <DialogDescription>Isi detail di bawah ini untuk menambahkan data baru.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <FormModalContent
                            data={data}
                            setData={setData}
                            errors={errors}
                            kecamatan={kecamatan}
                            kelurahan={kelurahan}
                            zonas={zonas}
                            filteredKelurahan={filteredKelurahan}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-3xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Edit Data Warga</DialogTitle>
                        <DialogDescription>Ubah detail di bawah ini untuk memperbarui data.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <FormModalContent
                            isEdit
                            data={editData}
                            setData={setEditData}
                            errors={editErrors}
                            kecamatan={kecamatan}
                            kelurahan={kelurahan}
                            zonas={zonas}
                            filteredKelurahan={filteredEditKelurahan}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <div className="flex flex-col items-center justify-center gap-3 pt-4">
                        <TriangleAlert size={48} className="text-destructive" />
                        <DialogTitle className="text-center">Konfirmasi Hapus</DialogTitle>
                        <DialogDescription className="text-center">
                            Apakah Anda yakin ingin menghapus data ini? Aksi ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
        </AppLayout>
    );
};

export default Index;
