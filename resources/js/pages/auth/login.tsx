import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import Trash from '@/assets/images/Trash.svg';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
                toast.error('Gagal masuk. Periksa kembali username dan password Anda.');
            },
        });
    };

    return (
        // REVISI UTAMA: Div terluar ini sekarang bertugas untuk memposisikan card di tengah
        <div className="flex h-screen w-full items-center justify-center bg-sidebar p-4">
            <Head title="Masuk" />
            {/* Container ini adalah card utama yang akan menjadi 2 kolom di layar besar */}
            <div className="w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl lg:grid lg:grid-cols-2">
                {/* Panel Kiri (Branding) */}
                <div className="hidden flex-col items-center justify-center bg-sidebar p-12 lg:flex">
                    <div className="mb-6 flex h-32 w-32 items-center justify-center rounded bg-card font-bold text-card-foreground">
                        <img src={Trash} alt="Logo LPS" />
                    </div>
                    <h1 className="text-2xl font-bold text-sidebar-foreground">Lembaga Pengelola Sampah</h1>
                </div>

                {/* Panel Kanan (Form Login) */}
                <div className="flex flex-col items-center justify-center bg-card p-8 sm:p-12 bg-white rounded-lg">
                    <div className="w-full max-w-sm">
                        <h2 className="mb-8 text-center text-3xl font-bold text-card-foreground">Masuk</h2>

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
                                    className="py-6"
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
                                    className="py-6"
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

            {status && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-green-600">{status}</div>}
        </div>
    );
}
