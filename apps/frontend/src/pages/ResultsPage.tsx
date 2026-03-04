import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { resultsApi, disciplinesApi } from '@/services/api';
import { Card, CardContent, Button, Input, Select, Badge, Skeleton } from '@/components/ui';
import { Search, Plus, Download, Filter } from 'lucide-react';
import { formatDate, CATEGORY_LABELS } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function ResultsPage() {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [disciplineId, setDisciplineId] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['results', page, search, disciplineId, sortBy],
        queryFn: () => resultsApi.getAll({ page, limit: 20, search: search || undefined, disciplineId: disciplineId || undefined, sortBy }).then(r => r.data),
        placeholderData: prev => prev,
    });

    const results = data?.data || [];
    const pagination = data?.pagination;

    const handleExport = async () => {
        const res = await resultsApi.export({ disciplineId: disciplineId || undefined });
        const url = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url; a.download = 'wyniki.csv'; a.click();
    };

    const canAdd = ['ADMIN', 'MODERATOR', 'ATHLETE'].includes(user?.role || '');

    return (
        <div className="page-container space-y-5">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj zawodnika, miejsca..."
                        className="pl-9"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <Select value={disciplineId} onChange={e => { setDisciplineId(e.target.value); setPage(1); }} className="w-52">
                    <option value="">Wszystkie dyscypliny</option>
                    {(disciplines || []).map((d: { id: string; name: string }) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </Select>
                <Select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-40">
                    <option value="date">Sortuj: data</option>
                    <option value="value">Sortuj: wynik</option>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download size={14} /> Eksport CSV
                </Button>
                {canAdd && (
                    <Link to="/results/add">
                        <Button size="sm">
                            <Plus size={14} /> Dodaj wynik
                        </Button>
                    </Link>
                )}
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zawodnik</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dyscyplina</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wynik</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Miejsce</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wideo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {[...Array(7)].map((_, j) => (
                                                <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : results.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Brak wyników spełniających kryteria</td></tr>
                                ) : (
                                    results.map((r: {
                                        id: string;
                                        user: { id: string; firstName: string; lastName: string; gender: string };
                                        discipline: { name: string; category: string };
                                        displayValue: string; date: string; location: string; isOfficial: boolean;
                                        videos?: Array<{ id: string }>;
                                    }) => (
                                        <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <Link to={`/athletes/${r.user.id}`} className="font-medium text-sm hover:text-primary">
                                                    {r.user.firstName} {r.user.lastName}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">{r.user.gender === 'MALE' ? '♂' : '♀'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">{r.discipline.name}</div>
                                                <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[r.discipline.category]}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-primary">{r.displayValue}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(r.date)}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-32 truncate">{r.location}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={r.isOfficial ? 'success' : 'secondary'}>
                                                    {r.isOfficial ? 'Oficjalny' : 'Nieoficjalny'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(r.videos?.length || 0) > 0 ? (
                                                    <Badge variant="default">📹 Wideo</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">
                                {pagination.total} wyników · Strona {page} z {pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Następna</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
