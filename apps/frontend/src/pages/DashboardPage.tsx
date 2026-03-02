import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { statisticsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge } from '@/components/ui';
import { Trophy, Users, Dumbbell, TrendingUp, ArrowRight, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, getStatusEmoji, CATEGORY_LABELS } from '@/lib/utils';

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];

export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => statisticsApi.getDashboard().then(r => r.data.data),
    });

    const tiles = [
        { label: 'Aktywnych rekordów', value: data?.totalRecords ?? 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Zawodników', value: data?.totalAthletes ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Dyscyplin', value: data?.totalDisciplines ?? 0, icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Wyników w tym miesiącu', value: data?.resultsThisMonth ?? 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    if (isLoading) {
        return (
            <div className="page-container space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-6">
            {/* Stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {tiles.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card rounded-xl p-5 flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={22} className={color} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-foreground">{value}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            Wyniki w ciągu ostatnich 12 miesięcy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={data?.monthlyResults || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                />
                                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dumbbell size={18} className="text-primary" />
                            Wyniki wg dyscyplin
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={220}>
                            <PieChart>
                                <Pie data={data?.disciplineDistribution || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" strokeWidth={0}>
                                    {(data?.disciplineDistribution || []).map((_: unknown, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                            {(data?.disciplineDistribution || []).map((d: { name: string; count: number }, i: number) => (
                                <div key={d.name} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-muted-foreground truncate flex-1">{d.name}</span>
                                    <span className="font-medium">{d.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent records */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Medal size={18} className="text-yellow-400" />
                                Ostatnie rekordy
                            </CardTitle>
                            <Link to="/records" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                                Wszystkie <ArrowRight size={12} />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(data?.recentRecords || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Brak rekordów</p>
                        )}
                        {(data?.recentRecords || []).map((rec: {
                            id: string; discipline: { name: string }; result: { displayValue: string; date: string; user: { firstName: string; lastName: string } }; gender: string
                        }) => (
                            <Link key={rec.id} to={`/records/${rec.id}`}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                                <div className="w-9 h-9 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                                    <Trophy size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{rec.discipline.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {rec.result.user.firstName} {rec.result.user.lastName} · {rec.gender === 'MALE' ? 'M' : 'K'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-primary">{rec.result.displayValue}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(rec.result.date)}</div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent results */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Dumbbell size={18} className="text-blue-400" />
                                Ostatnie wyniki
                            </CardTitle>
                            <Link to="/results" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                                Wszystkie <ArrowRight size={12} />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(data?.recentResults || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Brak wyników</p>
                        )}
                        {(data?.recentResults || []).map((r: {
                            id: string; discipline: { name: string }; user: { firstName: string; lastName: string }; displayValue: string; date: string
                        }) => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {r.user.firstName} {r.user.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{r.discipline.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold">{r.displayValue}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(r.date)}</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
