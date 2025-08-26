import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Trash from '@/assets/images/Trash.svg';
// Pastikan AuthLayout tidak memberikan padding/margin yang berlebih jika kita ingin layoutnya full

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                toast.error('Gagal masuk. Periksa kembali username dan password Anda.')
            },
        });
    };

    return (
        <div className="h-screen w-full bg-sidebar p-4">
            <Head title="Masuk" />
            <div className="h-full w-full overflow-hidden rounded-lg shadow-2xl md:grid lg:grid-cols-2">
                <div className="hidden flex-col items-center justify-center p-12 lg:flex">
                    {/* Ganti div ini dengan komponen gambar logo Anda */}
                    <div className="mb-6 flex h-32 w-32 items-center justify-center rounded bg-white font-bold text-slate-500"><img src={Trash} alt="" /></div>
                    <h1 className="text-2xl font-bold text-slate-800">Lembaga Pengelola Sampah</h1>
                </div>

                <div className="shadow-4xl flex flex-col items-center justify-center rounded-xl bg-white p-8 sm:p-12">
                    <div className="w-full max-w-sm">
                        <h2 className="mb-8 text-center text-3xl font-bold">Masuk</h2>

                        <form method="POST" className="flex flex-col gap-5" onSubmit={submit}>
                            <div className="grid gap-2">
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Username"
                                    className="py-6" // Menambah tinggi input
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    className="py-6" // Menambah tinggi input
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">Ingat saya</Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} tabIndex={5}>
                                        Lupa password?
                                    </TextLink>
                                )}
                            </div>

                            <Button type="submit" className="mt-4 w-full py-6 text-base font-bold" tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Masuk
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </div>
    );
}
