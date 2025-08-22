import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, User, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookA, BookOpen, Folder, HandCoins, Landmark, Layers, LayoutGrid, Map, Recycle, UserRoundPlus } from 'lucide-react';
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

const adminNavItems: NavItem[] = [
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
        title: 'Data KK',
        href: '/kartukeluarga',
        icon: BookA,
    },
    {
        title: 'Pembayaran Iuran',
        href: '/pembayaran',
        icon: HandCoins,
    },
    {
        title: 'Pengambilan Sampah',
        href: '/pengambilan-sampah',
        icon: Recycle,
    },
    {
        title: 'Akun LPS',
        href: '/register',
        icon: UserRoundPlus,
    },
];
const lpsNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Data KK',
        href: '/kartukeluarga',
        icon: BookA,
    },
    {
        title: 'Pembayaran Iuran',
        href: '/pembayaran',
        icon: HandCoins,
    },
    {
        title: 'Pengambilan Sampah',
        href: '/pengambilan-sampah',
        icon: Recycle,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];



export function AppSidebar({ ...props }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const role = user.role;
    const menu = {
        superadmin: adminNavItems,
        lps: lpsNavItems,
    };
    console.log('User Role:', role);
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
