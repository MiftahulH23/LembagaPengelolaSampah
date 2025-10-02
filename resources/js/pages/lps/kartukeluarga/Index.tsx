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

// Tipe data yang diterima dari Controller
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

const Index = (props: {
    kartukeluarga: KartuKeluarga.Default[];
    kecamatan: Kecamatan[];
    kelurahan: Kelurahan[];
    zonas: Zona[]; // <-- Prop baru
}) => {
    const { kartukeluarga, kecamatan, kelurahan, zonas } = props;

    // --- REVISI: Sesuaikan useForm dengan 'zona_id' ---
    const { data, setData, post, processing, errors, reset } = useForm({
        nik: '',
        nomor_kk: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        zona_id: '', // <-- REVISI
        kelurahan_id: '',
        kecamatan_id: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        nik: '',
        nomor_kk: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        zona_id: '', // <-- REVISI
        kelurahan_id: '',
        kecamatan_id: '',
    });

    // State lainnya tetap sama
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
        // ... (kolom nik, nomor_kk, nama_kepala_keluarga tetap sama)
        { accessorKey: 'nik', header: 'NIK' },
        { accessorKey: 'nomor_kk', header: 'No. KK' },
        { accessorKey: 'nama_kepala_keluarga', header: 'Nama Kepala Keluarga' },
        { id: 'kelurahan_id', accessorKey: 'kelurahan.nama_kelurahan', header: 'Kelurahan' },
        { id: 'kecamatan_id', accessorKey: 'kecamatan.nama_kecamatan', header: 'Kecamatan' },
        { accessorKey: 'alamat', header: 'Alamat' },
        { accessorKey: 'rt', header: 'RT' },
        { accessorKey: 'rw', header: 'RW' },
        // --- REVISI: Tampilkan nama zona dari relasi ---
        {
            id: 'zona_id',
            accessorKey: 'zona.nama_zona',
            header: 'Zona',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kartukeluarga.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
                toast.success('Kartu Keluarga berhasil ditambahkan');
            },
            onError: () => toast.error('Gagal menambahkan Kartu Keluarga.'),
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
            zona_id: String(kk.zona_id), // <-- REVISI
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
            onError: () => toast.error('Gagal mengubah Kartu Keluarga.'),
        });
    };

    const handleDelete = (id: string) => {
        router.delete(route('kartukeluarga.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Kartu Keluarga berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus Kartu Keluarga'),
            onFinish: () => setDeleteId(null),
        });
    };

    const breadcrumb = [{ title: 'Kartu Keluarga', href: '/kartukeluarga' }];

    // --- FORM MODAL UTAMA ---
    const FormModalContent = ({ isEdit = false }: { isEdit?: boolean }) => {
        // Pilih state yang sesuai
        const currentData = isEdit ? editData : data;
        const setCurrentData = isEdit ? setEditData : setData;
        const currentErrors = isEdit ? editErrors : errors;
        const currentFilteredKelurahan = isEdit ? filteredEditKelurahan : filteredKelurahan;

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor={isEdit ? 'edit_nik' : 'nik'}>NIK</Label>
                        <Input id={isEdit ? 'edit_nik' : 'nik'} value={currentData.nik} onChange={(e) => setCurrentData('nik', e.target.value)} />
                        {currentErrors.nik && <p className="text-sm text-red-500">{currentErrors.nik}</p>}
                    </div>
                    <div>
                        <Label htmlFor={isEdit ? 'edit_nomor_kk' : 'nomor_kk'}>Nomor Kartu Keluarga</Label>
                        <Input id={isEdit ? 'edit_nomor_kk' : 'nomor_kk'} value={currentData.nomor_kk} onChange={(e) => setCurrentData('nomor_kk', e.target.value)} />
                        {currentErrors.nomor_kk && <p className="text-sm text-red-500">{currentErrors.nomor_kk}</p>}
                    </div>
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_nama_kepala_keluarga' : 'nama_kepala_keluarga'}>Nama Kepala Keluarga</Label>
                    <Input id={isEdit ? 'edit_nama_kepala_keluarga' : 'nama_kepala_keluarga'} value={currentData.nama_kepala_keluarga} onChange={(e) => setCurrentData('nama_kepala_keluarga', e.target.value)} />
                    {currentErrors.nama_kepala_keluarga && <p className="text-sm text-red-500">{currentErrors.nama_kepala_keluarga}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor={isEdit ? 'edit_kecamatan_id' : 'kecamatan_id'}>Kecamatan</Label>
                        <Select
                            value={currentData.kecamatan_id}
                            onValueChange={(value) => {
                                setCurrentData('kecamatan_id', value);
                                setCurrentData('kelurahan_id', '');
                            }}
                        >
                            <SelectTrigger id={isEdit ? 'edit_kecamatan_id' : 'kecamatan_id'}><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                            <SelectContent>
                                {kecamatan.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>{option.nama_kecamatan}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentErrors.kecamatan_id && <p className="text-sm text-red-500">{currentErrors.kecamatan_id}</p>}
                    </div>
                    <div>
                        <Label htmlFor={isEdit ? 'edit_kelurahan_id' : 'kelurahan_id'}>Kelurahan</Label>
                        <Select
                            value={currentData.kelurahan_id}
                            onValueChange={(value) => setCurrentData('kelurahan_id', value)}
                            disabled={!currentData.kecamatan_id || currentFilteredKelurahan.length === 0}
                        >
                            <SelectTrigger id={isEdit ? 'edit_kelurahan_id' : 'kelurahan_id'}><SelectValue placeholder="Pilih Kelurahan" /></SelectTrigger>
                            <SelectContent>
                                {currentFilteredKelurahan.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>{option.nama_kelurahan}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentErrors.kelurahan_id && <p className="text-sm text-red-500">{currentErrors.kelurahan_id}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor={isEdit ? 'edit_rt' : 'rt'}>RT</Label>
                        <Input id={isEdit ? 'edit_rt' : 'rt'} value={currentData.rt} onChange={(e) => setCurrentData('rt', e.target.value)} />
                        {currentErrors.rt && <p className="text-sm text-red-500">{currentErrors.rt}</p>}
                    </div>
                    <div>
                        <Label htmlFor={isEdit ? 'edit_rw' : 'rw'}>RW</Label>
                        <Input id={isEdit ? 'edit_rw' : 'rw'} value={currentData.rw} onChange={(e) => setCurrentData('rw', e.target.value)} />
                        {currentErrors.rw && <p className="text-sm text-red-500">{currentErrors.rw}</p>}
                    </div>
                    <div>
                        <Label htmlFor={isEdit ? 'edit_zona_id' : 'zona_id'}>Zona</Label>
                        <Select value={currentData.zona_id} onValueChange={(value) => setCurrentData('zona_id', value)}>
                            <SelectTrigger id={isEdit ? 'edit_zona_id' : 'zona_id'}><SelectValue placeholder="Pilih Zona" /></SelectTrigger>
                            <SelectContent>
                                {zonas.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>{option.nama_zona}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentErrors.zona_id && <p className="text-sm text-red-500">{currentErrors.zona_id}</p>}
                    </div>
                </div>
                <div>
                    <Label htmlFor={isEdit ? 'edit_alamat' : 'alamat'}>Alamat</Label>
                    <Input id={isEdit ? 'edit_alamat' : 'alamat'} value={currentData.alamat} onChange={(e) => setCurrentData('alamat', e.target.value)} />
                    {currentErrors.alamat && <p className="text-sm text-red-500">{currentErrors.alamat}</p>}
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Kartu Keluarga" />
            <div className="container">
                <h1>Kartu Keluarga</h1>
                <DataTable columns={columns} data={kartukeluarga}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={<Button onClick={() => { reset(); setIsAddModalOpen(true); }}>Tambah</Button>}
                        />
                    )}
                </DataTable>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogTitle>Tambah Kartu Keluarga</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <FormModalContent />
                        <div className="mt-4 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogTitle>Edit Kartu Keluarga</DialogTitle>
                    <form onSubmit={handleEditSubmit}>
                        <FormModalContent isEdit />
                        <div className="mt-4 flex justify-end">
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing ? 'Menyimpan...' : 'Simpan'}
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
                        <DialogDescription className="text-center">Apakah Anda yakin ingin menghapus data ini?</DialogDescription>
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

export default Index;