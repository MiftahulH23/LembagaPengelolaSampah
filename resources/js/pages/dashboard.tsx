import { Head } from '@inertiajs/react';
import React from 'react';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { HandCoins, Home, Percent, Recycle, TrendingUp, Wallet } from 'lucide-react';

// --- Tipe Data ---
interface StatistikProps {
    totalKK: number;
    totalIuranBulanIni: string;
    persentaseSudahBayar: number;
    persentaseSudahDiambil: number;
    potensiPemasukanTahunan: string;
    pemasukanTahunIni: string;
}

interface GrafikData {
    name: string;
    pendapatan?: number;
    rumah?: number;
}

interface PageProps {
    statistik: StatistikProps;
    grafikIuran: GrafikData[];
    grafikPengambilan: GrafikData[];
}

// --- REVISI: Menghapus 'hsl()' dari definisi warna ---
const chartConfig = {
    pendapatan: {
        label: 'Pendapatan',
        color: 'var(--chart-1)', // Langsung panggil variabel CSS
    },
    rumah: {
        label: 'Rumah',
        color: 'var(--chart-1)', // Langsung panggil variabel CSS
    },
};

const DashboardIndex: React.FC<PageProps> = ({ statistik, grafikIuran, grafikPengambilan }) => {
    const breadcrumb = [{ title: 'Dashboard', href: '/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Dashboard" />
            <div className="container space-y-6">
                <div>
                    <h1>Dashboard</h1>
                </div>

                {/* --- Kartu Statistik Tetap 6 --- */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potensi Iuran (Tahunan)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{statistik.potensiPemasukanTahunan}</div>
                            <p className="text-xs text-muted-foreground">Target pendapatan iuran tahun ini</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pemasukan Iuran (Tahun Ini)</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{statistik.pemasukanTahunIni}</div>
                            <p className="text-xs text-muted-foreground">Total iuran terkumpul hingga saat ini</p>
                        </CardContent>
                    </Card>
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Iuran Terkumpul (Bulan Ini)</CardTitle>
                            <HandCoins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">Rp {statistik.totalIuranBulanIni}</div>
                            <p className="text-xs text-muted-foreground">Total pendapatan iuran bulan ini</p>
                        </CardContent>
                    </Card> */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kartu Keluarga</CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{statistik.totalKK}</div>
                            <p className="text-xs text-muted-foreground">Jumlah kartu keluarga terdaftar</p>
                        </CardContent>
                    </Card>
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kepatuhan Iuran (Bulan Ini)</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{statistik.persentaseSudahBayar}%</div>
                            <p className="text-xs text-muted-foreground">Dari total KK telah membayar</p>
                        </CardContent>
                    </Card> */}
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pengambilan Sampah (Hari Ini)</CardTitle>
                            <Recycle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <=div className="text-xl font-bold">{statistik.persentaseSudahDiambil}%</=div>
                            <p className="text-xs text-muted-foreground">Dari total KK sudah diambil</p>
                        </CardContent>
                    </Card> */}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Grafik Pendapatan Iuran */}
                    <Card className='border bg-transparent border-muted'>
                        <CardHeader>
                            <CardTitle>Grafik Pendapatan Iuran Tahun Ini</CardTitle>
                            <CardDescription>Tren pemasukan iuran setiap bulan.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-">
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <LineChart accessibilityLayer data={grafikIuran} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="fillPendapatan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-pendapatan)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-pendapatan)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `Rp${Number(value) / 1000}k`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                indicator="dot"
                                                formatter={(value) =>
                                                    new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                    }).format(Number(value))
                                                }
                                            />
                                        }
                                    />

                                    {/* <Area type="monotone" dataKey="pendapatan" stroke="none" fill="url(#fillPendapatan)" tooltipType="none" /> */}
                                    <Line
                                        type="monotone"
                                        dataKey="pendapatan"
                                        stroke="var(--color-pendapatan)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Grafik Pengambilan Sampah */}
                    <Card className='!border bg-transparent'>
                        <CardHeader>
                            <CardTitle>Progres Pengambilan Sampah Minggu Ini</CardTitle>
                            <CardDescription>Jumlah rumah yang sampahnya berhasil diambil setiap hari.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={grafikPengambilan} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="rumah" fill="var(--color-rumah)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default DashboardIndex;
