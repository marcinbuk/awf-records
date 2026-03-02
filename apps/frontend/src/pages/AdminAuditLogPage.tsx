import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/services/api';
import { Card, CardContent, Input, Select, Badge, Skeleton, Button } from '@/components/ui';
import { ScrollText, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'text-green-400 bg-green-400/10',
    UPDATE: 'text-blue-400 bg-blue-400/10',
    DELETE: 'text-red-400 bg-red-400/10',
    VERIFY: 'text-purple-400 bg-purple-400/10',
    REJECT: 'text-orange-400 bg-orange-400/10',
    LOGIN: 'text-cyan-400 bg-cyan-400/10',
};

export default function AdminAuditLogPage() {
    const [page, setPage] = useState(1);
    const [action, setAction] = useState('');
    const [entity, setEntity] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['audit-log', page, action, entity],
        queryFn: () => statisticsApi.auditLog({
            page, limit: 25,
            action: action || undefined,
            entityType: entity || undefined,
        }).then(r => r.data.data),
        placeholderData: prev => prev,
    });

    return (
        <div className="page-container space-y-5">
            <div className="flex flex-wrap gap-3">
                <Select value={action} onChange={e => { setAction(e.target.value); setPage(1); }} className="w-40">
                    <option value="">Wszystkie akcje</option>
                    <option value="CREATE">Tworzenie</option>
                    <option value="UPDATE">Edycja</option>
                    <option value="DELETE">Usunięcie</option>
                    <option value="VERIFY">Weryfikacja</option>
                    <option value="REJECT">Odrzucenie</option>
                    <option value="LOGIN">Logowanie</option>
                </Select>
                <Select value={entity} onChange={e => { setEntity(e.target.value); setPage(1); }} className="w-40">
                    <option value="">Wszystkie typy</option>
                    <option value="Result">Wynik</option>
                    <option value="Record">Rekord</option>
                    <option value="User">Użytkownik</option>
                    <option value="Discipline">Dyscyplina</option>
                    <option value="VideoVerification">Wideo</option>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcja</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Obiekt</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Użytkownik</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Szczegóły</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>)}
                                        </tr>
                                    ))
                                ) : (data?.data || []).length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Brak wpisów w historii</td></tr>
                                ) : (
                                    (data?.data || []).map((log: {
                                        id: string; action: string; entityType: string; entityId: string;
                                        details?: string; createdAt: string;
                                        user: { firstName: string; lastName: string; email: string };
                                    }) => (
                                        <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action] || 'text-muted-foreground bg-muted'}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{log.entityType}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{log.entityId?.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.user ? (
                                                    <>
                                                        <div className="font-medium">{log.user.firstName} {log.user.lastName}</div>
                                                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                                    </>
                                                ) : <span className="text-muted-foreground">System</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-40 truncate">
                                                {log.details}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString('pl-PL')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">{data.total} wpisów</span>
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
