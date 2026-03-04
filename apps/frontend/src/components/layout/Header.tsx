import { useLocation, Link } from 'react-router-dom';
import { Bell, Plus, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const breadcrumbs: Record<string, string> = {
    '/': 'Dashboard',
    '/results': 'Wyniki',
    '/results/add': 'Dodaj wynik',
    '/results/import': 'Import CSV',
    '/records': 'Rekordy uczelni',
    '/records/verify': 'Weryfikacja rekordów',
    '/athletes': 'Zawodnicy',
    '/statistics': 'Statystyki',
    '/disciplines': 'Dyscypliny',
    '/videos': 'Wideo',
    '/admin': 'Panel administratora',
    '/admin/users': 'Zarządzanie użytkownikami',
    '/admin/disciplines': 'Zarządzanie dyscyplinami',
    '/admin/audit-log': 'Historia zmian',
};

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const location = useLocation();
    const { user } = useAuthStore();
    const title = breadcrumbs[location.pathname] || 'AWF Records';
    const canAddResult = ['ADMIN', 'MODERATOR', 'ATHLETE'].includes(user?.role || '');

    return (
        <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
                {/* Hamburger - mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-base md:text-lg font-semibold text-foreground">{title}</h1>
                    <p className="text-xs text-muted-foreground hidden md:block">Akademia Wychowania Fizycznego</p>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                {canAddResult && (
                    <Link
                        to="/results/add"
                        className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Dodaj wynik</span>
                    </Link>
                )}
                <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Bell size={18} />
                </button>
            </div>
        </header>
    );
}
