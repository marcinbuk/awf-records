import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi, disciplinesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { BarChart3, TrendingUp, Award, Trophy, Medal, ArrowRight, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

export default function StatisticsPage() {
    const [disciplineId, setDisciplineId] = useState<string>('');
    const [gender, setGender] = useState<string>('');

    // Fetch queries

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const { data: trends } = useQuery({
        queryKey: ['trends', disciplineId, gender],
        queryFn: () => statisticsApi.trends({ disciplineId, gender: gender || undefined }).then(r => r.data?.data?.timeline ?? []),
        enabled: !!disciplineId,
    });

    const { data: facultyRanking } = useQuery({
        queryKey: ['faculty-ranking'],
        queryFn: () => statisticsApi.facultyRanking().then((r) => r.data?.data ?? []),
    });

    const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => statisticsApi.getDashboard().then((r) => r.data?.data ?? {}),
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <select value={disciplineId} onChange={(e: any) => setDisciplineId(e.target.value)} className="w-56 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Wybierz dyscyplinę (trendy)</option>
                    {(disciplines || []).map((d: { id: string; name: string }) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-40 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Obie płcie</option>
                    <option value="MALE">Mężczyźni</option>
                    <option value="FEMALE">Kobiety</option>
                </select>
            </div>

            {/* Trends chart */}
            {disciplineId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            Progresja rekordu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!trends || trends.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Brak danych do wykresu</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trends.map((t: { date: string; value: number; gender: string }) => ({
                                    ...t,
                                    date: new Date(t.date).toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' }),
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Global Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{dashboard?.totalRecords || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Rekordów uczelni</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{dashboard?.totalAthletes || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Zawodników</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <Activity size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{dashboard?.resultsThisMonth || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Wyników (Ten mc)</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{dashboard?.totalDisciplines || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Dyscyplin</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Records + Faculty ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy size={18} className="text-primary" />
                            Najnowsze Rekordy
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Ostatnio ustanowione i zweryfikowane rekordy uczelni</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {isDashboardLoading ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">Ładowanie rekordów...</div>
                            ) : (
                                (dashboard?.recentRecords || []).map((record: any) => (
                                    <Link key={record.id} to={`/records/${record.id}`} className="block group">
                                        <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 group-hover:bg-secondary/40 transition-colors border border-border">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center font-bold text-yellow-500 shadow-sm text-sm">
                                                {record.result.displayValue}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate">{record.result.discipline.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{record.result.user.firstName} {record.result.user.lastName}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="secondary" className="text-[10px]">{formatDate(record.createdAt)}</Badge>
                                                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {(dashboard?.recentRecords || []).length === 0 && !isDashboardLoading && (
                                <div className="text-center py-8 text-muted-foreground text-sm">Brak ustanowionych rekordów</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Faculty ranking */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award size={18} className="text-primary" />
                            Ranking Wydziałów
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Rywalizacja wydziałów wg rekordów uczelni</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Sort faculty by records first, then results */}
                            {([...(facultyRanking || [])].sort((a: any, b: any) => b.recordCount - a.recordCount || b.resultCount - a.resultCount))
                                .slice(0, 6)
                                .map((f: { faculty: string; resultCount: number; recordCount: number; athleteCount: number }, i: number) => {
                                    const maxRecords = Math.max(1, ...(facultyRanking || []).map((fr: any) => fr.recordCount));
                                    return (
                                        <div key={f.faculty} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-secondary/10">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400/20 text-yellow-500 border border-yellow-400/30' :
                                                    i === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/30' :
                                                        i === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                                                            'bg-secondary text-muted-foreground'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate leading-tight">{f.faculty}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">{f.athleteCount} aktywnych studentów</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col items-end">
                                                        <Badge className={f.recordCount > 0 ? "bg-primary text-primary-foreground" : "bg-neutral-800 text-neutral-400"}>
                                                            {f.recordCount} {f.recordCount === 1 ? 'Rekord' : [2, 3, 4].includes(f.recordCount) ? 'Rekordy' : 'Rekordów'}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground mt-1">{f.resultCount} wyników bazowych</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Faculty Activity Progress Bar based on Records vs Max Records */}
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full bg-primary transition-all rounded-full"
                                                    style={{
                                                        width: `${f.recordCount > 0 ? (f.recordCount / maxRecords) * 100 : 0}%`,
                                                        opacity: i === 0 ? 1 : i === 1 ? 0.8 : i === 2 ? 0.6 : 0.4
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            {(facultyRanking || []).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">Brak danych</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Discipline distribution */}
            {!isDashboardLoading && dashboard?.resultsByDiscipline && dashboard.resultsByDiscipline.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Popularność Dyscyplin</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Najczęściej wybierane i aktywne dyscypliny sportowe</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(dashboard.resultsByDiscipline || []).map((d: { discipline: string; count: number }, i: number) => {
                                const max = Math.max(...(dashboard.resultsByDiscipline || []).map((dd: { count: number }) => dd.count));
                                const pct = max > 0 ? (d.count / max) * 100 : 0;
                                const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
                                return (
                                    <div key={d.discipline} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{d.discipline}</span>
                                            <span className="font-medium">{d.count}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
