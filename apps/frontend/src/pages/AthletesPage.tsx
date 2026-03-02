import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi } from '@/services/api';
import { Card, CardContent, Input, Select, Button, Skeleton, Badge } from '@/components/ui';
import { Search, User, Trophy } from 'lucide-react';

export default function AthletesPage() {
    const [search, setSearch] = useState('');
    const [gender, setGender] = useState('');
    const [faculty, setFaculty] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['athletes', page, search, gender, faculty],
        queryFn: () => usersApi.getAll({
            page, limit: 20, role: 'ATHLETE',
            search: search || undefined,
            gender: gender || undefined,
            faculty: faculty || undefined,
        }).then(r => r.data.data),
        placeholderData: prev => prev,
    });

    return (
        <div className="page-container space-y-5">
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Szukaj zawodnika..." className="pl-9"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }} className="w-40">
                    <option value="">Obie płcie</option>
                    <option value="MALE">Mężczyźni</option>
                    <option value="FEMALE">Kobiety</option>
                </Select>
                <Input placeholder="Wydział..." value={faculty}
                    onChange={e => { setFaculty(e.target.value); setPage(1); }} className="w-52" />
            </div>

            {/* Athletes grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(data?.data || []).length === 0 ? (
                            <div className="col-span-3 text-center py-20 text-muted-foreground">Brak zawodników spełniających kryteria</div>
                        ) : (
                            (data?.data || []).map((athlete: {
                                id: string; firstName: string; lastName: string;
                                gender: string; faculty?: string; specialization?: string;
                                studentId?: string; yearOfStudy?: number;
                            }) => (
                                <Link key={athlete.id} to={`/athletes/${athlete.id}`}
                                    className="block rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group card-glow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary/25 transition-colors">
                                            {athlete.firstName[0]}{athlete.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">{athlete.firstName} {athlete.lastName}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {athlete.gender === 'MALE' ? '♂ Mężczyzna' : '♀ Kobieta'}
                                                </Badge>
                                                {athlete.yearOfStudy && (
                                                    <span className="text-xs text-muted-foreground">{athlete.yearOfStudy} rok</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {(athlete.faculty || athlete.specialization) && (
                                        <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                                            {athlete.faculty && (
                                                <div className="text-xs text-muted-foreground truncate">{athlete.faculty}</div>
                                            )}
                                            {athlete.specialization && (
                                                <div className="text-xs text-muted-foreground truncate">{athlete.specialization}</div>
                                            )}
                                        </div>
                                    )}
                                    {athlete.studentId && (
                                        <div className="mt-2 text-xs text-muted-foreground font-mono">Nr albumu: {athlete.studentId}</div>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{data.total} zawodników</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Następna</Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
