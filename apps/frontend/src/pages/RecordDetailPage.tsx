import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Skeleton, Textarea } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Trophy, CheckCircle, XCircle, Video, User, MapPin, Calendar, Award } from 'lucide-react';
import { formatDate, getStatusColor, STATUS_LABELS } from '@/lib/utils';
import { useState } from 'react';

export default function RecordDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');

    const { data: record, isLoading } = useQuery({
        queryKey: ['record', id],
        queryFn: () => recordsApi.getById(id!).then(r => r.data.data),
        enabled: !!id,
    });

    const verifyMutation = useMutation({
        mutationFn: ({ status, comment }: { status: string; comment: string }) =>
            recordsApi.verify(id!, { status, comment }),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['record', id] });
            queryClient.invalidateQueries({ queryKey: ['records'] });
            toast({
                title: vars.status === 'VERIFIED' ? 'Rekord zweryfikowany ✅' : 'Rekord odrzucony',
                variant: vars.status === 'VERIFIED' ? 'success' : 'destructive',
            });
        },
    });

    const canVerify = ['ADMIN', 'MODERATOR'].includes(user?.role || '');

    if (isLoading) {
        return (
            <div className="page-container space-y-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!record) return <div className="page-container text-center py-20 text-muted-foreground">Rekord nie znaleziony</div>;

    return (
        <div className="page-container max-w-3xl space-y-6">
            {/* Record hero */}
            <div className="stat-card rounded-xl p-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
                    <Trophy size={40} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Rekord {record.recordType === 'UNIVERSITY' ? 'Uczelni' : record.recordType === 'FACULTY' ? 'Wydziału' : 'Osobisty'} · {record.gender === 'MALE' ? 'Mężczyźni' : 'Kobiety'}
                    </div>
                    <div className="text-4xl font-black text-primary mb-2">{record.result.displayValue}</div>
                    <div className="text-lg font-semibold">{record.discipline.name}</div>
                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {STATUS_LABELS[record.status]}
                    </div>
                </div>
            </div>

            {/* Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Szczegóły wyniku</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                            <User size={18} className="text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Zawodnik</div>
                                <Link to={`/athletes/${record.result.user.id}`} className="font-medium text-sm hover:text-primary">
                                    {record.result.user.firstName} {record.result.user.lastName}
                                </Link>
                                {record.result.user.faculty && (
                                    <div className="text-xs text-muted-foreground">{record.result.user.faculty}</div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                            <Calendar size={18} className="text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Data</div>
                                <div className="font-medium text-sm">{formatDate(record.result.date)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                            <MapPin size={18} className="text-primary" />
                            <div>
                                <div className="text-xs text-muted-foreground">Miejsce</div>
                                <div className="font-medium text-sm">{record.result.location}</div>
                            </div>
                        </div>
                        {record.result.competition && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                <Award size={18} className="text-primary" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Zawody</div>
                                    <div className="font-medium text-sm">{record.result.competition}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Video */}
            {record.result.videos?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video size={18} className="text-primary" /> Wideo weryfikacyjne
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {record.result.videos.map((v: { id: string; videoUrl: string; status: string }) => (
                            <div key={v.id}>
                                <Badge variant={v.status === 'VERIFIED' ? 'success' : v.status === 'REJECTED' ? 'destructive' : 'warning'} className="mb-3">
                                    {v.status}
                                </Badge>
                                <video controls className="w-full rounded-xl border border-border" style={{ maxHeight: '400px' }}>
                                    <source src={v.videoUrl} />
                                    Twoja przeglądarka nie obsługuje odtwarzacza wideo.
                                </video>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Verification */}
            {canVerify && record.status === 'PENDING' && (
                <Card className="border-yellow-400/20">
                    <CardHeader>
                        <CardTitle>Weryfikacja rekordu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Komentarz weryfikatora (opcjonalny)..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-destructive hover:bg-destructive/10 text-destructive"
                                onClick={() => verifyMutation.mutate({ status: 'REJECTED', comment })}
                                disabled={verifyMutation.isPending}
                            >
                                <XCircle size={16} /> Odrzuć
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => verifyMutation.mutate({ status: 'VERIFIED', comment })}
                                disabled={verifyMutation.isPending}
                            >
                                <CheckCircle size={16} /> Zatwierdź
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timeline (previous record) */}
            {record.previousRecord && (
                <Card>
                    <CardHeader>
                        <CardTitle>Poprzedni rekord</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div>
                                <div className="font-bold text-lg text-muted-foreground">{record.previousRecord.result?.displayValue}</div>
                                <div className="text-xs text-muted-foreground">
                                    {record.previousRecord.result?.user?.firstName} {record.previousRecord.result?.user?.lastName} ·{' '}
                                    {formatDate(record.previousRecord.result?.date)}
                                </div>
                            </div>
                            <Badge variant="secondary">Pobity</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
