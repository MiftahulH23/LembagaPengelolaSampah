import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, User, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookA, BookOpen, CalendarClock, Coins, Folder, HandCoins, Landmark, LaptopMinimalCheck, Layers, LayoutGrid, Map, MapPinHouse, Recycle, UserRoundPlus } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kecamatan',
        href: '/kecamatan',
        icon: LayoutGrid,
    },
    {
        title: 'Data KK',
        href: '/menu',
        icon: LayoutGrid,
    },
];

const superadminNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kecamatan',
        href: '/kecamatan',
        icon: Layers,
    },
    {
        title: 'Kelurahan',
        href: '/kelurahan',
        icon: Map,
    },
    {
        title: 'Akun LPS',
        href: '/register',
        icon: UserRoundPlus,
    },
];
const adminLpsNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Zona',
        href: '/zona',
        icon: MapPinHouse,
    },
    {
        title: 'Data KK',
        href: '/kartukeluarga',
        icon: BookA,
    },
    {
        title: 'Iuran',
        href: '/iuran',
        icon: Coins,
    },
    {
        title: 'Validasi Pembayaran',
        href: '/validasi-pembayaran',
        icon: LaptopMinimalCheck
    },
    {
        title: 'Jadwal Pengambilan',
        href: '/jadwal-pengambilan',
        icon: CalendarClock,
    },
    {
        title: 'Manajemen Akun',
        href: '/register',
        icon: UserRoundPlus,
    },
];

const petugasSampahNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pengambilan Sampah',
        href: '/pengambilan-sampah',
        icon: Recycle,
    },
];

const petugasIuranNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pembayaran Iuran',
        href: '/pembayaran',
        icon: HandCoins,
    },
];


export function AppSidebar({ ...props }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const role = user.role;
    const menu = {
        superadmin: superadminNav,
        adminLPS: adminLpsNav,
        petugasSampah : petugasSampahNav,
        petugasIuran : petugasIuranNav,
    };
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={menu[role as keyof typeof menu]} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
