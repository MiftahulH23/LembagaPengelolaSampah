import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Error403({ message }: { message?: string }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Akses Ditolak', href: '#' }]}>
            <Head title="403 Akses Ditolak" />
            <div className="flex h-[80vh] flex-col items-center justify-center text-center">
                <ShieldAlert className="mb-6 h-24 w-24 text-red-500" />
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Akses Ditolak!</h1>
                <p className="mb-8 text-lg text-muted-foreground max-w-md">
                    {message || 'Maaf, Anda tidak memiliki izin (role yang sesuai) untuk mengakses halaman ini.'}
                </p>
                <Button asChild size="lg">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Kembali ke Dashboard
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
