import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Card, CardContent, Button, Input, Select, Badge, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Search, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { formatDate, ROLE_LABELS } from '@/lib/utils';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, role],
        queryFn: () => usersApi.getAll({ page, limit: 20, search: search || undefined, role: role || undefined }).then(r => r.data.data),
        placeholderData: prev => prev,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: object }) => usersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Zaktualizowano użytkownika', variant: 'success' });
        },
        onError: () => toast({ title: 'Błąd aktualizacji', variant: 'destructive' }),
    });

    const deactivateMutation = useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Konto dezaktywowane', variant: 'success' });
        },
    });

    const roleOptions = ['VIEWER', 'ATHLETE', 'MODERATOR', 'ADMIN'];

    return (
        <div className="page-container space-y-5">
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Szukaj użytkownika..." className="pl-9"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="w-44">
                    <option value="">Wszystkie role</option>
                    {roleOptions.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Użytkownik</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Rola</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Wydział</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Zarejestrowany</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>)}
                                        </tr>
                                    ))
                                ) : (
                                    (data?.data || []).map((u: {
                                        id: string; firstName: string; lastName: string; email: string;
                                        role: string; faculty?: string; createdAt: string; isActive: boolean;
                                    }) => (
                                        <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-sm">{u.firstName} {u.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Select
                                                    value={u.role}
                                                    onChange={e => updateMutation.mutate({ id: u.id, data: { role: e.target.value } })}
                                                    className="h-7 text-xs w-32"
                                                >
                                                    {roleOptions.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                                </Select>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-32 truncate">{u.faculty || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(u.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={u.isActive ? 'success' : 'destructive'}>
                                                    {u.isActive ? 'Aktywny' : 'Nieaktywny'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon"
                                                        onClick={() => updateMutation.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                                                        title={u.isActive ? 'Dezaktywuj' : 'Aktywuj'}>
                                                        {u.isActive ? <UserX size={14} className="text-destructive" /> : <UserCheck size={14} className="text-green-400" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">{data.total} użytkowników</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Następna</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
