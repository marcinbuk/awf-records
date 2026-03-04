import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/services/api';
import { Card, Skeleton } from '@/components/ui';
import { Trophy, Medal, Users as UsersIcon, TrendingUp, Gamepad2 } from 'lucide-react';

type Tab = 'faculty' | 'athletes';

export default function RankingPage() {
    const [tab, setTab] = useState<Tab>('athletes');

    const { data: facultyRanking, isLoading: loadingFaculty } = useQuery({
        queryKey: ['faculty-ranking'],
        queryFn: () => statisticsApi.getFacultyRanking().then(r => r.data.data),
    });

    const { data: athleteRanking, isLoading: loadingAthletes } = useQuery({
        queryKey: ['athlete-ranking'],
        queryFn: () => statisticsApi.getAthleteRanking().then(r => r.data.data),
    });

    const isLoading = tab === 'faculty' ? loadingFaculty : loadingAthletes;
    const sortedAthletes = athleteRanking || [];

    const podiumColors = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
    const podiumEmoji = ['🥇', '🥈', '🥉'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">🏆 Ranking Ogólny</h1>
                <p className="text-muted-foreground">Porównanie zawodników i wydziałów na podstawie wyników, rekordów i challenge'ów</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2">
                <button onClick={() => setTab('athletes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'athletes' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <UsersIcon size={14} className="inline mr-2" />Zawodnicy
                </button>
                <button onClick={() => setTab('faculty')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'faculty' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <Medal size={14} className="inline mr-2" />Wydziały
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
            ) : tab === 'athletes' ? (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-2">
                        <UsersIcon size={18} className="inline mr-2" />Ranking zawodników
                    </h2>
                    <p className="text-xs text-muted-foreground mb-4">Punkty = rekordy × 10 + wyniki + challenge × 5</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 w-12">#</th>
                                    <th className="text-left p-3">Zawodnik</th>
                                    <th className="text-left p-3">Wydział</th>
                                    <th className="text-center p-3">Wyniki</th>
                                    <th className="text-center p-3">Rekordy</th>
                                    <th className="text-center p-3">Challenge</th>
                                    <th className="text-right p-3 font-bold">Punkty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAthletes.map((athlete: any, idx: number) => (
                                    <tr key={athlete.id}
                                        className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}>
                                        <td className="p-3 font-bold text-lg">
                                            {idx < 3 ? podiumEmoji[idx] : idx + 1}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                    {athlete.firstName?.[0]}{athlete.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${idx < 3 ? podiumColors[idx] : 'text-foreground'}`}>
                                                        {athlete.firstName} {athlete.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{athlete.gender === 'MALE' ? '♂' : '♀'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground text-xs">{athlete.faculty || '—'}</td>
                                        <td className="p-3 text-center">
                                            <span className="bg-blue-400/10 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                                                {athlete.resultCount}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                                                <Trophy size={10} className="inline mr-1" />{athlete.recordCount}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="bg-purple-400/10 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                                                <Gamepad2 size={10} className="inline mr-1" />{athlete.gameResultCount}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-primary text-lg">{athlete.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedAthletes.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">Brak zawodników do wyświetlenia</p>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                        <Medal size={18} className="inline mr-2" />Ranking wydziałów
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 w-12">#</th>
                                    <th className="text-left p-3">Wydział</th>
                                    <th className="text-center p-3">Rekordy</th>
                                    <th className="text-center p-3">Zawodnicy</th>
                                    <th className="text-center p-3">Wyniki</th>
                                    <th className="text-right p-3 font-bold">Punkty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(facultyRanking || []).map((faculty: any, idx: number) => {
                                    const pts = faculty.recordCount * 10 + faculty.resultCount;
                                    return (
                                        <tr key={faculty.faculty}
                                            className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}>
                                            <td className="p-3 font-bold text-lg">
                                                {idx < 3 ? podiumEmoji[idx] : idx + 1}
                                            </td>
                                            <td className="p-3">
                                                <p className={`font-medium ${idx < 3 ? podiumColors[idx] : 'text-foreground'}`}>
                                                    {faculty.faculty}
                                                </p>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                                                    <Trophy size={12} className="inline mr-1" />{faculty.recordCount}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-blue-400/10 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                                                    {faculty.athleteCount}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-green-400/10 text-green-400 px-2 py-1 rounded text-xs font-medium">
                                                    <TrendingUp size={12} className="inline mr-1" />{faculty.resultCount}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-bold text-primary text-lg">{pts}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {(!facultyRanking || facultyRanking.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">Brak danych o wydziałach</p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
