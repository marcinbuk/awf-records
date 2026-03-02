import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard, Dumbbell, Medal, Users, BarChart3,
    ChevronRight, LogOut, Trophy, ShieldCheck, Award, User, ListOrdered
} from 'lucide-react';

const nav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/results', icon: Dumbbell, label: 'Wyniki' },
    { to: '/records', icon: Trophy, label: 'Rekordy' },
    { to: '/athletes', icon: Users, label: 'Zawodnicy' },
    { to: '/disciplines', icon: Medal, label: 'Dyscypliny' },
    { to: '/statistics', icon: BarChart3, label: 'Statystyki' },
    { to: '/my-stats', icon: User, label: 'Moje statystyki' },
    { to: '/ranking', icon: ListOrdered, label: 'Ranking' },
];

const modNav = [
    { to: '/records/verify', icon: ShieldCheck, label: 'Weryfikacja' },
];

const adminOnlyNav = [
    { to: '/games', icon: Award, label: 'Igrzyska' },
];

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'ADMIN';
    const isAdminOrMod = isAdmin || user?.role === 'MODERATOR';
    const roleLabel: Record<string, string> = {
        ADMIN: 'Administrator', MODERATOR: 'Moderator', ATHLETE: 'Zawodnik', VIEWER: 'Widz',
    };

    return (
        <aside className="w-60 flex-shrink-0 flex flex-col bg-card border-r border-border">
            {/* Logo */}
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-base">
                        AWF
                    </div>
                    <div>
                        <div className="font-bold text-sm text-foreground">AWF Records</div>
                        <div className="text-xs text-muted-foreground">System rekordów</div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {nav.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary/15 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </NavLink>
                ))}

                {isAdminOrMod && (
                    <>
                        <div className="pt-3 pb-1 px-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zarządzanie</span>
                        </div>
                        {modNav.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span className="flex-1">{label}</span>
                            </NavLink>
                        ))}
                        {isAdmin && adminOnlyNav.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span className="flex-1">{label}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* User info */}
            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{roleLabel[user?.role || ''] || user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                    <LogOut size={16} />
                    Wyloguj się
                </button>
            </div>
        </aside>
    );
}
