import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videosApi } from '@/services/api';
import { Card, CardContent, Button, Badge, Skeleton, Select, Input } from '@/components/ui';
import { Video, Search } from 'lucide-react';
import { formatDate, getStatusColor, STATUS_LABELS } from '@/lib/utils';

export default function VideosPage() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['videos', page, status],
        queryFn: () => videosApi.getAll({ page, limit: 20, status: status || undefined }).then(r => r.data.data),
        placeholderData: prev => prev,
    });

    const { data: selectedVideoData } = useQuery({
        queryKey: ['video', selectedVideo],
        queryFn: () => videosApi.getById(selectedVideo!).then(r => r.data.data),
        enabled: !!selectedVideo,
    });

    return (
        <div className="page-container space-y-5">
            {/* Filters */}
            <div className="flex gap-3">
                <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-44">
                    <option value="">Wszystkie statusy</option>
                    <option value="UPLOADED">Przesłane</option>
                    <option value="VERIFIED">Zweryfikowane</option>
                    <option value="REJECTED">Odrzucone</option>
                </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video list */}
                <div className="space-y-3">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
                    ) : (data?.data || []).length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Video size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Brak materiałów wideo</p>
                        </div>
                    ) : (
                        (data?.data || []).map((v: {
                            id: string; videoUrl: string; status: string; createdAt: string;
                            result: { displayValue: string; discipline: { name: string }; user: { firstName: string; lastName: string } };
                        }) => (
                            <button key={v.id} onClick={() => setSelectedVideo(v.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedVideo === v.id ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                                        <Video size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                            {v.result.user.firstName} {v.result.user.lastName} · {v.result.discipline.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{v.result.displayValue} · {formatDate(v.createdAt)}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(v.status)}`}>
                                        {STATUS_LABELS[v.status] || v.status}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}

                    {data && data.totalPages > 1 && (
                        <div className="flex justify-between pt-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                            <span className="text-sm text-muted-foreground">Strona {page}/{data.totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Następna</Button>
                        </div>
                    )}
                </div>

                {/* Video player */}
                <div>
                    {selectedVideoData ? (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <video controls className="w-full rounded-xl border border-border" style={{ maxHeight: '350px' }}>
                                    <source src={selectedVideoData.videoUrl} />
                                    Przeglądarka nie obsługuje odtwarzacza wideo.
                                </video>
                                <div>
                                    <div className="font-medium">{selectedVideoData.result?.user?.firstName} {selectedVideoData.result?.user?.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedVideoData.result?.discipline?.name} · {selectedVideoData.result?.displayValue}</div>
                                    <Badge variant={selectedVideoData.status === 'VERIFIED' ? 'success' : selectedVideoData.status === 'REJECTED' ? 'destructive' : 'warning'} className="mt-2">
                                        {STATUS_LABELS[selectedVideoData.status]}
                                    </Badge>
                                    {selectedVideoData.reviewerComment && (
                                        <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                                            Komentarz: {selectedVideoData.reviewerComment}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed border-border rounded-xl">
                            <Video size={40} className="mb-2 opacity-30" />
                            <p className="text-sm">Wybierz wideo z listy</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
