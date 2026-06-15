import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import Trash from '@/assets/images/Trash.svg';
import LogoPekanbaru from '@/assets/images/LogoPekanbaru.svg';
import DlhkLogo from '@/assets/images/dlhkLogo.jpeg';
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
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4 sm:p-8">
            <Head title="Masuk" />
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl lg:grid lg:grid-cols-2 bg-white">
                
                {/* Bagian Kiri (Gradient & Logos) - Hanya tampil di desktop */}
                <div className="relative hidden flex-col items-center justify-center bg-gradient-to-br from-sky-600 to-sky-900 p-12 lg:flex overflow-hidden">
                    {/* Tekstur dan Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex shrink-0 items-center gap-6 rounded-2xl bg-white/10 p-5 shadow-lg backdrop-blur-md border border-white/20 mb-8">
                            <img src={LogoPekanbaru} alt="Logo Pemko Pekanbaru" className="h-24 w-auto object-contain drop-shadow-lg" />
                            <div className="h-20 w-px bg-white/30"></div>
                            <img src={DlhkLogo} alt="Logo DLHK / LPS" className="h-24 w-auto rounded-xl object-contain shadow-md" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">SILEPAS PKU</h1>
                        <p className="text-sky-100 max-w-md text-lg leading-relaxed">
                            Sistem Informasi Lembaga Pengelola Sampah<br/>
                            Dinas Lingkungan Hidup dan Kebersihan<br/>
                            Kota Pekanbaru
                        </p>
                    </div>
                </div>

                {/* Bagian Kanan (Form Login) */}
                <div className="flex flex-col items-center justify-center p-8 sm:p-12">
                    <div className="w-full max-w-sm">
                        
                        {/* Logo untuk Mobile (Tampil jika layar kecil) */}
                        <div className="flex lg:hidden justify-center items-center gap-4 mb-8">
                            <img src={LogoPekanbaru} alt="Logo Pemko Pekanbaru" className="h-16 w-auto object-contain" />
                            <div className="h-12 w-px bg-slate-300"></div>
                            <img src={DlhkLogo} alt="Logo DLHK / LPS" className="h-16 w-auto rounded-lg object-contain" />
                        </div>

                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Selamat Datang</h2>
                            <p className="text-slate-500 mt-2">Silakan masuk ke akun Anda</p>
                            <p className="text-slate-500 font-medium lg:hidden mt-1">SILEPAS PKU</p>
                        </div>

                        <form method="POST" className="flex flex-col gap-5" onSubmit={submit}>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username"
                                    className="py-6"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password"
                                    className="py-6"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between text-sm mt-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember" className="font-normal cursor-pointer text-slate-600">Ingat saya</Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} tabIndex={5}>
                                        Lupa password?
                                    </TextLink>
                                )}
                            </div>

                            <Button type="submit" className="mt-6 w-full py-6 text-base font-bold bg-sky-600 hover:bg-sky-700" tabIndex={4} disabled={processing}>
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
