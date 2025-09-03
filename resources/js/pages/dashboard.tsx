import { Head } from '@inertiajs/react';
import React from 'react';
import { Area, Bar, BarChart, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { Home, Recycle, TrendingUp, Wallet } from 'lucide-react';

// --- Tipe Data ---
interface StatistikProps {
    totalKK: number;
    persentaseSudahDiambil: number;
    potensiPemasukanTahunan: string;
    pemasukanTahunIni: string;
}

interface GrafikIuranData {
    name: string;
    pendapatan: number;
}

// REVISI: Tipe data baru untuk chart pengambilan
interface GrafikPengambilanData {
    name: string;
    dijadwalkan: number;
    diambil: number;
}

interface PageProps {
    statistik: StatistikProps;
    grafikIuran: GrafikIuranData[];
    grafikPengambilan: GrafikPengambilanData[];
    dataMaxIuran: number;
}

// REVISI: Konfigurasi untuk styling chart baru
const chartConfig = {
    pendapatan: { label: 'Pendapatan', color: 'var(--chart-1)' },
    dijadwalkan: { label: 'Dijadwalkan', color: 'var(--chart-1)' }, // Gunakan warna berbeda
    diambil: { label: 'Sudah Diambil', color: 'var(--chart-2)' },
};

const DashboardIndex: React.FC<PageProps> = ({ statistik, grafikIuran, grafikPengambilan, dataMaxIuran }) => {
    const breadcrumb = [{ title: 'Dashboard', href: '/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Dashboard" />
            <div className="container space-y-6">
                <div>
                    <h1>Dashboard</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Potensi Iuran */}
                    <Card>
                        {/* Beri tinggi minimum yang konsisten untuk semua header */}
                        <CardHeader className="flex min-h-[40px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potensi Iuran (Tahunan)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistik.potensiPemasukanTahunan}</div>
                            <p className="text-xs text-muted-foreground">Target pendapatan iuran tahun ini</p>
                        </CardContent>
                    </Card>

                    {/* Card 2: Pemasukan Iuran */}
                    <Card>
                        <CardHeader className="flex min-h-[40px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pemasukan Iuran (Tahun Ini)</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistik.pemasukanTahunIni}</div>
                            <p className="text-xs text-muted-foreground">Total iuran terkumpul hingga saat ini</p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Total Kartu Keluarga */}
                    <Card>
                        <CardHeader className="flex min-h-[40px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kartu Keluarga</CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistik.totalKK}</div>
                            <p className="text-xs text-muted-foreground">Jumlah kartu keluarga terdaftar</p>
                        </CardContent>
                    </Card>

                    {/* Card 4: Progres Pengambilan */}
                    <Card>
                        <CardHeader className="flex min-h-[40px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progres Pengambilan (Hari Ini)</CardTitle>
                            <Recycle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistik.persentaseSudahDiambil}%</div>
                            <p className="text-xs text-muted-foreground">Dari total zona yang dijadwalkan</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Grafik Pendapatan Iuran */}
                    <Card className="border border-muted bg-transparent">
                        <CardHeader>
                            <CardTitle>Grafik Pendapatan Iuran Tahun Ini</CardTitle>
                            <CardDescription>Tren pemasukan iuran setiap bulan.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
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
                                        // --- REVISI: Menggunakan domain dinamis ---
                                        domain={[0, dataMaxIuran]}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                indicator="dot"
                                                formatter={(value) =>
                                                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value))
                                                }
                                            />
                                        }
                                    />
                                    <Area type="monotone" dataKey="pendapatan" stroke="none" fill="url(#fillPendapatan)" tooltipType="none" />
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

                    {/* --- REVISI: Grafik Pengambilan Sampah --- */}
                    <Card className="border border-muted bg-transparent">
                        <CardHeader>
                            <CardTitle>Progres Pengambilan Sampah Minggu Ini</CardTitle>
                            <CardDescription>Perbandingan zona yang dijadwalkan vs. yang sudah diambil.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={grafikPengambilan} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="dijadwalkan" fill="var(--color-dijadwalkan)" radius={4} />
                                    <Bar dataKey="diambil" fill="var(--color-diambil)" radius={4} />
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
