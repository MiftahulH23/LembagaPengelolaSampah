import { DataTable, DataTableControls } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { KartuKeluarga } from '@/types/data/kartukeluarga';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

const index = (props: { kartukeluarga: KartuKeluarga.Default[] }) => {
    const { kartukeluarga } = props;
    // console.log(kartukeluarga);
    const columns: ColumnDef<KartuKeluarga.Default>[] = [
        {
            accessorKey: 'nik',
            header: 'NIK',
        },
        {
            accessorKey: 'nama_kepala_keluarga',
            header: 'Nama Kepala Keluarga',
        },
        {
            accessorKey: 'alamat',
            header: 'Alamat',
        },
        {
            accessorKey: 'rt',
            header: 'RT',
        },
        {
            accessorKey: 'rw',
            header: 'RW',
        },
        {
            accessorKey: 'kelurahan.nama_kelurahan',
            header: 'Kelurahan',
        },
        {
            accessorKey: 'kecamatan.nama_kecamatan',
            header: 'Kecamatan',
        },
    ];
    const breadcrumb = [{ title: 'Kecamatan', href: '/kecamatan' }];
    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title="Kartu Keluarga" />
            <div className='container'>
                <h1>Kartu Keluarga</h1>
                <DataTable columns={columns} data={kartukeluarga}>
                    {({table}) => (
                        <DataTableControls table={table}></DataTableControls>
                    )}
                </DataTable>
            </div>
        </AppLayout>
    );
};

export default index;
