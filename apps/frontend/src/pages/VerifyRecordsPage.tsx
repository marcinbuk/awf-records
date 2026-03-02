import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Skeleton, Textarea } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Shield, CheckCircle, XCircle, Video, Calendar, User, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function VerifyRecordsPage() {
    const queryClient = useQueryClient();
    const [comments, setComments] = useState<Record<string, string>>({});

    const { data: pending, isLoading } = useQuery({
        queryKey: ['records-pending'],
        queryFn: () => recordsApi.getPending().then(r => r.data.data),
    });

    const verifyMutation = useMutation({
        mutationFn: ({ id, status, comment }: { id: string; status: string; comment: string }) =>
            recordsApi.verify(id, { status, comment }),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['records-pending'] });
            queryClient.invalidateQueries({ queryKey: ['records'] });
            toast({
                title: vars.status === 'VERIFIED' ? '✅ Rekord zweryfikowany' : '❌ Rekord odrzucony',
                variant: vars.status === 'VERIFIED' ? 'success' : 'destructive',
            });
        },
    });

    const RECORD_TYPE_PL: Record<string, string> = {
        UNIVERSITY: 'Rekord Uczelni', FACULTY: 'Rekord Wydziału', PERSONAL_BEST: 'Rekord Osobisty',
    };

    if (isLoading) {
        return (
            <div className="page-container space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="page-container space-y-6">
            <div className="flex items-center gap-3">
                <Shield size={20} className="text-primary" />
                <div>
                    <h2 className="font-semibold">Panel weryfikacji rekordów</h2>
                    <p className="text-sm text-muted-foreground">
                        {(pending || []).length} rekord(ów) oczekuje na weryfikację
                    </p>
                </div>
            </div>

            {(pending || []).length === 0 ? (
                <div className="text-center py-20">
                    <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Wszystkie rekordy zweryfikowane!</p>
                    <p className="text-muted-foreground text-sm mt-1">Brak oczekujących rekordów do weryfikacji</p>
                </div>
            ) : (
                (pending || []).map((rec: {
                    id: string;
                    recordType: string;
                    gender: string;
                    result: {
                        displayValue: string; date: string; location: string; competition?: string;
                        user: { firstName: string; lastName: string; faculty?: string };
                        discipline: { name: string };
                        videos?: Array<{ id: string; videoUrl: string; status: string }>;
                    };
                }) => (
                    <Card key={rec.id} className="border-yellow-400/20">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Trophy size={20} className="text-yellow-400" />
                                    <span>{rec.result.discipline?.name || 'Nieznana'}</span>
                                    <Badge variant="warning">{RECORD_TYPE_PL[rec.recordType]}</Badge>
                                    <Badge variant="secondary">{rec.gender === 'MALE' ? 'Mężczyźni' : 'Kobiety'}</Badge>
                                </div>
                                <span className="text-2xl font-bold text-primary">{rec.result.displayValue}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Info grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User size={14} />
                                    <span>{rec.result.user.firstName} {rec.result.user.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>{formatDate(rec.result.date)}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">{rec.result.location}</div>
                            </div>

                            {/* Video */}
                            {rec.result.videos && rec.result.videos.length > 0 ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                                        <Video size={14} className="text-primary" />
                                        Wideo weryfikacyjne
                                    </div>
                                    <video controls className="w-full rounded-xl border border-border max-h-60">
                                        <source src={rec.result.videos[0].videoUrl} />
                                    </video>
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm text-orange-300">
                                    ⚠️ Brak wideo weryfikacyjnego dla tego rekordu
                                </div>
                            )}

                            {/* Comment */}
                            <Textarea
                                placeholder="Komentarz weryfikatora..."
                                value={comments[rec.id] || ''}
                                onChange={e => setComments(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                className="text-sm"
                            />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                                    onClick={() => verifyMutation.mutate({ id: rec.id, status: 'REJECTED', comment: comments[rec.id] || '' })}
                                    disabled={verifyMutation.isPending}
                                >
                                    <XCircle size={16} /> Odrzuć rekord
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => verifyMutation.mutate({ id: rec.id, status: 'VERIFIED', comment: comments[rec.id] || '' })}
                                    disabled={verifyMutation.isPending}
                                >
                                    <CheckCircle size={16} /> Zatwierdź rekord
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
