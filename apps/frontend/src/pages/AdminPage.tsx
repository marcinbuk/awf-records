import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Users, Dumbbell, ScrollText, Settings } from 'lucide-react';

export default function AdminPage() {
    const { user } = useAuthStore();

    const cards = [
        { to: '/admin/users', icon: Users, label: 'Zarządzanie użytkownikami', desc: 'Edytuj role, blokuj konta' },
        { to: '/admin/disciplines', icon: Dumbbell, label: 'Zarządzanie dyscyplinami', desc: 'Dodawaj i edytuj dyscypliny' },
        { to: '/admin/audit-log', icon: ScrollText, label: 'Historia zmian', desc: 'Przeglądaj logi systemowe' },
        { to: '/records/verify', icon: Settings, label: 'Weryfikacja rekordów', desc: 'Zatwierdź oczekujące rekordy' },
    ];

    return (
        <div className="page-container space-y-6">
            <div className="p-5 rounded-xl stat-card">
                <h2 className="font-bold text-lg">Panel administracyjny</h2>
                <p className="text-muted-foreground text-sm mt-1">Zalogowany jako: <strong>{user?.firstName} {user?.lastName}</strong> · {user?.role}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map(({ to, icon: Icon, label, desc }) => (
                    <Link key={to} to={to}
                        className="block p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all card-glow group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon size={24} className="text-primary" />
                            </div>
                            <div>
                                <div className="font-semibold">{label}</div>
                                <div className="text-sm text-muted-foreground">{desc}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
