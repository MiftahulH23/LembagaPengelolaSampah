import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Badge } from '@/components/ui/badge';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return <Badge variant="destructive" className="text-[10px] h-[18px] px-1.5 font-semibold">SuperAdmin</Badge>;
            case 'adminLPS':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] h-[18px] px-1.5 font-semibold">Admin LPS</Badge>;
            case 'petugasIuran':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-[18px] px-1.5 font-semibold">Petugas Iuran</Badge>;
            case 'petugasSampah':
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] h-[18px] px-1.5 font-semibold text-white">Petugas Sampah</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] h-[18px] px-1.5">{role}</Badge>;
        }
    };

    return (
        <>
            <Avatar className="h-9 w-9 overflow-hidden rounded-full border border-sky-100 shadow-sm">
                <AvatarFallback className="rounded-lg bg-sky-100 text-sky-700 font-bold dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.username)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight gap-0.5">
                <span className="truncate font-bold text-slate-800">{user.username}</span>
                <div className="flex items-center gap-1">
                    {user.role && getRoleBadge(user.role)}
                    {showEmail && <span className="truncate text-xs text-muted-foreground ml-1">{user.nohp}</span>}
                </div>
            </div>
        </>
    );
}
