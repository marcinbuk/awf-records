import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@/components/ui';
import { Trophy, Dumbbell, Calendar, Award, TrendingUp } from 'lucide-react';
import { formatDate, formatDateShort } from '@/lib/utils';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function AthleteProfilePage() {
    const { id } = useParams<{ id: string }>();

    const { data: athlete, isLoading: loadingAthlete } = useQuery({
        queryKey: ['athlete', id],
        queryFn: () => usersApi.getById(id!).then(r => r.data.data),
        enabled: !!id,
    });
    const { data: personalBests, isLoading: loadingPB } = useQuery({
        queryKey: ['personal-bests', id],
        queryFn: () => usersApi.getPersonalBests(id!).then(r => r.data.data),
        enabled: !!id,
    });
    const { data: stats } = useQuery({
        queryKey: ['athlete-stats', id],
        queryFn: () => usersApi.getStatistics(id!).then(r => r.data.data),
        enabled: !!id,
    });
    const { data: resultsData } = useQuery({
        queryKey: ['athlete-results', id],
        queryFn: () => usersApi.getResults(id!, { limit: 50 }).then(r => r.data.data?.data || []),
        enabled: !!id,
    });
    const { data: records } = useQuery({
        queryKey: ['athlete-records', id],
        queryFn: () => usersApi.getRecords(id!).then(r => r.data.data),
        enabled: !!id,
    });

    if (loadingAthlete) {
        return (
            <div className="page-container space-y-5">
                <Skeleton className="h-40 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!athlete) return <div className="page-container text-center py-20 text-muted-foreground">Zawodnik nie znaleziony</div>;

    // Build chart data per discipline
    const resultsByDiscipline: Record<string, Array<{ date: string; value: number }>> = {};
    if (resultsData) {
        for (const r of resultsData) {
            const name = r.discipline.name;
            if (!resultsByDiscipline[name]) resultsByDiscipline[name] = [];
            resultsByDiscipline[name].push({ date: formatDateShort(r.date), value: r.value });
        }
    }

    return (
        <div className="page-container max-w-4xl space-y-6">
            {/* Profile hero */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-3xl">
                            {athlete.firstName[0]}{athlete.lastName[0]}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{athlete.firstName} {athlete.lastName}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="secondary">{athlete.gender === 'MALE' ? '♂ Mężczyzna' : '♀ Kobieta'}</Badge>
                                {athlete.role && <Badge variant="outline">{athlete.role}</Badge>}
                                {athlete.yearOfStudy && <Badge variant="outline">{athlete.yearOfStudy} rok studiów</Badge>}
                            </div>
                            {athlete.faculty && <div className="text-sm text-muted-foreground mt-2">{athlete.faculty}{athlete.specialization ? ` · ${athlete.specialization}` : ''}</div>}
                            {athlete.studentId && <div className="text-xs text-muted-foreground font-mono mt-1">Nr albumu: {athlete.studentId}</div>}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <div>W systemie od</div>
                            <div className="font-medium">{formatDate(athlete.createdAt)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats tiles */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="stat-card rounded-xl p-4 text-center">
                        <Dumbbell size={24} className="text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{stats.totalResults}</div>
                        <div className="text-xs text-muted-foreground">Wyników</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <Trophy size={24} className="text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{stats.totalRecords}</div>
                        <div className="text-xs text-muted-foreground">Rekordów</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <Award size={24} className="text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{stats.disciplineCount}</div>
                        <div className="text-xs text-muted-foreground">Dyscyplin</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal bests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-400" /> Rekordy osobiste
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingPB ? (
                            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
                        ) : (personalBests || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Brak rekordów osobistych</p>
                        ) : (
                            <div className="space-y-3">
                                {(personalBests || []).map((pb: {
                                    id: string; discipline: { name: string }; displayValue: string; date: string;
                                }) => (
                                    <div key={pb.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div>
                                            <div className="font-medium text-sm">{pb.discipline.name}</div>
                                            <div className="text-xs text-muted-foreground">{formatDate(pb.date)}</div>
                                        </div>
                                        <span className="text-lg font-bold text-primary">{pb.displayValue}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award size={18} className="text-green-400" /> Aktualne rekordy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(records || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Brak aktywnych rekordów</p>
                        ) : (
                            <div className="space-y-3">
                                {(records || []).map((rec: {
                                    id: string; recordType: string; discipline: { name: string }; result: { displayValue: string };
                                }) => (
                                    <Link key={rec.id} to={`/records/${rec.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                        <div>
                                            <div className="font-medium text-sm">{rec.discipline.name}</div>
                                            <Badge variant="warning" className="text-xs mt-1">
                                                {rec.recordType === 'UNIVERSITY' ? 'Uczelni' : rec.recordType === 'FACULTY' ? 'Wydziału' : 'Osobisty'}
                                            </Badge>
                                        </div>
                                        <span className="text-lg font-bold text-primary">{rec.result?.displayValue}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Progress charts */}
            {Object.keys(resultsByDiscipline).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" /> Progresja wyników
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.entries(resultsByDiscipline).slice(0, 3).map(([discName, chartData]) => (
                            <div key={discName} className="mb-6 last:mb-0">
                                <div className="text-sm font-medium mb-3 text-muted-foreground">{discName}</div>
                                {chartData.length < 2 ? (
                                    <div className="text-xs text-muted-foreground p-2">Za mało danych do wykresu ({chartData.length} wynik)</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={160}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                            <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                            <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recent results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar size={18} className="text-primary" /> Ostatnie wyniki
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 text-xs text-muted-foreground">Dyscyplina</th>
                                    <th className="text-left py-2 text-xs text-muted-foreground">Wynik</th>
                                    <th className="text-left py-2 text-xs text-muted-foreground">Data</th>
                                    <th className="text-left py-2 text-xs text-muted-foreground">Miejsce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.recentResults || []).map((r: {
                                    id: string; discipline: { name: string }; displayValue: string; date: string; location: string;
                                }) => (
                                    <tr key={r.id} className="border-b border-border/50">
                                        <td className="py-2">{r.discipline.name}</td>
                                        <td className="py-2 font-bold text-primary">{r.displayValue}</td>
                                        <td className="py-2 text-muted-foreground">{formatDate(r.date)}</td>
                                        <td className="py-2 text-muted-foreground truncate max-w-32">{r.location}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
