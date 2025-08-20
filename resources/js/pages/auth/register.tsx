import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

// --- Komponen UI Anda ---
// Catatan: Path diubah menjadi relatif untuk mengatasi masalah resolusi path.
// Sesuaikan path ini jika struktur folder Anda berbeda.
import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import AuthLayout from '../../layouts/auth-layout';

// Definisikan tipe data untuk form, tambahkan 'role'
type RegisterForm = {
    username: string;
    nohp: string;
    role: string; // Ditambahkan
    password: string;
    password_confirmation: string;
};

export default function Register() {
    // Tambahkan 'role' ke dalam state useForm
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        username: '',
        nohp: '',
        role: '', // State awal untuk role
        password: '',
        password_confirmation: '',
    });

    // Reset password fields setelah submit selesai
    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <form method="POST" className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Input untuk Username */}
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

                    {/* Input untuk No HP */}
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

                    {/* Komponen Select untuk Role */}
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select required disabled={processing} value={data.role} onValueChange={(value) => setData('role', value)}>
                            <SelectTrigger id="role" tabIndex={3}>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lps">LPS</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                                {/* Tambahkan role lain jika perlu */}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>

                    {/* Input untuk Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Input Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Input untuk Konfirmasi Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Input Konfirmasi Password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={processing}>
                        {processing ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={7}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
