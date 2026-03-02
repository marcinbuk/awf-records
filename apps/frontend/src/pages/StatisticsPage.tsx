import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi, disciplinesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Select, Badge } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

export default function StatisticsPage() {
    const [disciplineId, setDisciplineId] = useState('');
    const [gender, setGender] = useState('');

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const { data: trends } = useQuery({
        queryKey: ['trends', disciplineId, gender],
        queryFn: () => statisticsApi.trends({ disciplineId: disciplineId || undefined, gender: gender || undefined }).then(r => r.data.data),
        enabled: !!disciplineId,
    });

    const { data: facultyRanking } = useQuery({
        queryKey: ['faculty-ranking'],
        queryFn: () => statisticsApi.facultyRanking().then(r => r.data.data),
    });

    const { data: dashboard } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => statisticsApi.getDashboard().then(r => r.data.data),
    });

    return (
        <div className="page-container space-y-6">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <Select value={disciplineId} onChange={e => setDisciplineId(e.target.value)} className="w-56">
                    <option value="">Wybierz dyscyplinę (trendy)</option>
                    {(disciplines || []).map((d: { id: string; name: string }) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </Select>
                <Select value={gender} onChange={e => setGender(e.target.value)} className="w-40">
                    <option value="">Obie płcie</option>
                    <option value="MALE">Mężczyźni</option>
                    <option value="FEMALE">Kobiety</option>
                </Select>
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

            {/* Monthly results + Faculty ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary" />
                            Wyniki miesięcznie (12 mies.)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dashboard?.monthlyResults || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Wyników" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Faculty ranking */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award size={18} className="text-primary" />
                            Ranking wydziałów
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(facultyRanking || []).slice(0, 8).map((f: { faculty: string; totalResults: number; athleteCount: number }, i: number) => (
                                <div key={f.faculty} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-secondary text-muted-foreground'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{f.faculty}</div>
                                        <div className="text-xs text-muted-foreground">{f.athleteCount} zawodników</div>
                                    </div>
                                    <Badge variant="secondary">{f.totalResults} wyników</Badge>
                                </div>
                            ))}
                            {(facultyRanking || []).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">Brak danych</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Discipline distribution */}
            {dashboard?.disciplineDistribution && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rozkład wyników wg dyscyplin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dashboard.disciplineDistribution.map((d: { name: string; count: number }, i: number) => {
                                const max = Math.max(...dashboard.disciplineDistribution.map((dd: { count: number }) => dd.count));
                                const pct = max > 0 ? (d.count / max) * 100 : 0;
                                const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
                                return (
                                    <div key={d.name} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{d.name}</span>
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
