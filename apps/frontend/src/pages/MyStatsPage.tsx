import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { resultApi, recordApi, userApi } from '@/services/api';
import { Card, Skeleton } from '@/components/ui';
import { Trophy, Medal, TrendingUp, Target } from 'lucide-react';

export default function MyStatsPage() {
    const { user } = useAuthStore();
    const userId = user?.id;

    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ['my-stats', userId],
        queryFn: () => userApi.getStatistics(userId!).then(r => r.data.data),
        enabled: !!userId,
    });

    const { data: personalBests, isLoading: loadingPB } = useQuery({
        queryKey: ['my-personal-bests', userId],
        queryFn: () => resultApi.getPersonalBests(userId!).then(r => r.data.data),
        enabled: !!userId,
    });

    if (loadingStats || loadingPB) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">📊 Moje statystyki</h1>
                <p className="text-muted-foreground">{user?.firstName} {user?.lastName} — {user?.faculty || 'Brak wydziału'}</p>
            </div>

            {/* Summary tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center"><TrendingUp className="text-blue-400" size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats?.totalResults ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Wyników łącznie</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center"><Trophy className="text-yellow-400" size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats?.recordCount ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Rekordów</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center"><Medal className="text-green-400" size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats?.disciplineCount ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Dyscyplin</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center"><Target className="text-purple-400" size={20} /></div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{personalBests?.length ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Najlepszych wyników (PB)</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Personal Bests table */}
            <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">🏅 Rekordy życiowe (Personal Best)</h2>
                {personalBests && personalBests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 text-muted-foreground font-medium">Dyscyplina</th>
                                    <th className="text-left p-3 text-muted-foreground font-medium">Kategoria</th>
                                    <th className="text-right p-3 text-muted-foreground font-medium">Najlepszy wynik</th>
                                    <th className="text-right p-3 text-muted-foreground font-medium">Data</th>
                                    <th className="text-left p-3 text-muted-foreground font-medium">Zawody</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personalBests.map((pb: any, idx: number) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                        <td className="p-3 font-medium text-foreground">{pb.discipline?.name || pb.disciplineName}</td>
                                        <td className="p-3 text-muted-foreground text-xs">{pb.discipline?.category || '—'}</td>
                                        <td className="p-3 text-right font-bold text-primary text-lg">{pb.displayValue || pb.value}</td>
                                        <td className="p-3 text-right text-muted-foreground">{pb.date ? new Date(pb.date).toLocaleDateString('pl-PL') : '—'}</td>
                                        <td className="p-3 text-muted-foreground text-xs">{pb.competition || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">Brak wyników — dodaj swój pierwszy wynik!</p>
                )}
            </Card>

            {/* Recent results */}
            {stats?.recentResults && stats.recentResults.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">📋 Ostatnie wyniki</h2>
                    <div className="space-y-2">
                        {stats.recentResults.map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div>
                                    <p className="font-medium text-foreground">{r.discipline?.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString('pl-PL')} • {r.location || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{r.displayValue || r.value}</p>
                                    {r.competition && <p className="text-xs text-muted-foreground">{r.competition}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
