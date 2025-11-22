import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { DataTable, DataTableControls } from '@/components/data-table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Wilayah } from '@/types/data/wilayah';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import InputError from '../../components/input-error'; 
import { Button } from '../../components/ui/button'; 
import { Input } from '../../components/ui/input'; 
import { Label } from '../../components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'; // Path relatif

// Tipe AuthUser
interface AuthUser {
    id: number;
    username: string;
    role: 'superadmin' | 'adminLPS' | 'petugasSampah' | 'petugasIuran' | string;
    kelurahan_id: number | null; 
}

// Tipe data untuk form
type RegisterForm = {
    username: string;
    nohp: string;
    role: string;
    password: string;
    password_confirmation: string;
    kelurahan_id: string; 
};

export default function Register(props: { user: User[]; kelurahan: Wilayah.Kelurahan[] }) {
    const { user, kelurahan: kelurahanOptions } = props;

    const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
    const loggedInUser = auth.user; // Ambil object user lengkap

    const isKelurahanDisabled = loggedInUser.role === 'adminLPS';
    
    const initialKelurahanId =
        isKelurahanDisabled && kelurahanOptions.length === 1
            ? String(kelurahanOptions[0].id) 
            : '';


    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        username: '',
        nohp: '',
        role: '',
        password: '',
        password_confirmation: '',
        kelurahan_id: initialKelurahanId, 
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('kelurahan_id', initialKelurahanId);
                setIsAddModalOpen(false);
                toast.success('Akun berhasil ditambahkan');
            },
            onError: (formErrors) => {
                Object.values(formErrors).forEach((error) => toast.error(error as string));
            },
        });
    };

    const breadcrumb = [{ title: 'Manajemen Akun', href: route('register') }];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const availableRoles = useMemo(() => {
        if (loggedInUser.role === 'superadmin') {
            return [
                { value: 'adminLPS', label: 'LPS' },
                { value: 'superadmin', label: 'Super Admin' },
            ];
        }
        if (loggedInUser.role === 'adminLPS') {
            return [
                { value: 'petugasSampah', label: 'Petugas Sampah' },
                { value: 'petugasIuran', label: 'Petugas Iuran' },
            ];
        }
        return [];
    }, [loggedInUser.role]);

   
    const columns: ColumnDef<User>[] = [
        { id: 'no', header: 'No', cell: ({ row }) => row.index + 1 },
        { id: 'username', accessorKey: 'username', header: 'Username' },
        { id: 'nohp', accessorKey: 'nohp', header: 'No HP' },
        { id: 'role', accessorKey: 'role', header: 'Role' },
        {
            id: 'kelurahan',
            accessorKey: 'kelurahan.nama_kelurahan',
            header: 'Kelurahan',
            cell: ({ row }) => row.original.kelurahan?.nama_kelurahan || '-',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Manajemen Akun" />
            <div className="container">
                <h1>Manajemen Akun</h1>
                <DataTable columns={columns} data={user}>
                    {({ table }) => (
                        <DataTableControls
                            table={table}
                            action={
                                <Button
                                    onClick={() => {
                                        reset();
                                        setData('kelurahan_id', initialKelurahanId);
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    Tambah Akun
                                </Button>
                            }
                        ></DataTableControls>
                    )}
                </DataTable>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <form method="POST" className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        disabled={processing}
                                        placeholder="Input Username"
                                    />
                                    <InputError message={errors.username} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nohp">No HP</Label>
                                    <Input
                                        id="nohp"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="tel"
                                        value={data.nohp}
                                        onChange={(e) => setData('nohp', e.target.value)}
                                        disabled={processing}
                                        placeholder="Input Nomor Hp"
                                    />
                                    <InputError message={errors.nohp} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select required disabled={processing} value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger id="role" tabIndex={3}>
                                            {' '}
                                            <SelectValue placeholder="Pilih role" />{' '}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {' '}
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {' '}
                                                    {role.label}{' '}
                                                </SelectItem>
                                            ))}{' '}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="kelurahan_id">Kelurahan</Label>
                                    <Select
                                        required
                                        disabled={isKelurahanDisabled || processing}
                                        value={data.kelurahan_id}
                                        onValueChange={(value) => setData('kelurahan_id', value)}
                                    >
                                        <SelectTrigger id="kelurahan_id" tabIndex={4}>
                                            <SelectValue placeholder="Pilih Kelurahan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kelurahanOptions.map((item) => (
                                                <SelectItem key={item.id} value={String(item.id)}>
                                                    {item.nama_kelurahan}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.kelurahan_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Input Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={6}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Input Konfirmasi Password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button type="submit" className="mt-2 w-full" tabIndex={7} disabled={processing}>
                                    {processing ? (
                                        <>
                                            {' '}
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...{' '}
                                        </>
                                    ) : (
                                        'Buat akun'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
