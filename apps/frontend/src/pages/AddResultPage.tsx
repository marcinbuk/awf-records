import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { resultsApi, disciplinesApi, usersApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Select, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Spinner, Badge } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Trophy, AlertTriangle, CheckCircle, Upload, X } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/utils';

interface NewRecord { id: string; recordType: string; gender: string }

export default function AddResultPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [newRecords, setNewRecords] = useState<NewRecord[]>([]);
    const [showRecordAlert, setShowRecordAlert] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const { data: users } = useQuery({
        queryKey: ['users-search', userSearch],
        queryFn: () => usersApi.getAll({ search: userSearch, role: 'ATHLETE', limit: 10 }).then(r => r.data.data?.data || []),
        enabled: userSearch.length >= 2,
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            userId: user?.role === 'ATHLETE' ? user.id : '',
            disciplineId: '',
            value: '',
            displayValue: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
            competition: '',
            isOfficial: true,
            notes: '',
            source: 'MANUAL_ENTRY',
        },
    });

    const selectedDisciplineId = watch('disciplineId');
    const selectedDiscipline = disciplines?.find((d: { id: string }) => d.id === selectedDisciplineId);

    useEffect(() => {
        if (user?.role === 'ATHLETE') {
            setSelectedUser({ id: user.id, firstName: user.firstName, lastName: user.lastName });
            setValue('userId', user.id);
        }
    }, [user, setValue]);

    const mutation = useMutation({
        mutationFn: (data: object) => resultsApi.create(data),
        onSuccess: async (res) => {
            const { newRecords: records, result } = res.data.data;
            if (records?.length > 0) {
                setNewRecords(records);
                setShowRecordAlert(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#60a5fa', '#a78bfa', '#fbbf24'] });

                // Upload video if provided
                if (videoFile) {
                    const fd = new FormData();
                    fd.append('video', videoFile);
                    fd.append('resultId', result.id);
                    try {
                        const { videosApi } = await import('@/services/api');
                        await videosApi.upload(fd);
                        toast({ title: 'Wideo przesłane', description: 'Wideo zostało dodane do wyniku', variant: 'success' });
                    } catch {
                        toast({ title: 'Błąd uploadu wideo', description: 'Wynik zapisany, ale wideo nie zostało przesłane', variant: 'destructive' });
                    }
                }
            } else {
                toast({ title: 'Wynik dodany pomyślnie', variant: 'success' });
                navigate('/results');
            }
        },
        onError: (err: { response?: { data?: { errors?: Array<{ message: string }>; message?: string } } }) => {
            const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Błąd dodawania wyniku';
            toast({ title: 'Błąd', description: msg, variant: 'destructive' });
        },
    });

    const onSubmit = (data: Record<string, unknown>) => {
        if (!data.userId) return toast({ title: 'Wybierz zawodnika', variant: 'destructive' });
        mutation.mutate({ ...data, value: parseFloat(data.value as string) });
    };

    const RECORD_TYPE_PL: Record<string, string> = {
        UNIVERSITY: 'Rekord Uczelni', FACULTY: 'Rekord Wydziału', PERSONAL_BEST: 'Rekord Osobisty',
    };

    if (showRecordAlert) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <div className="max-w-lg w-full text-center">
                    <div className="record-alert-enter">
                        <div className="w-24 h-24 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                            <Trophy size={48} className="text-yellow-400" />
                        </div>
                        <h2 className="text-3xl font-bold gradient-text mb-2">🏆 NOWY REKORD!</h2>
                        <p className="text-muted-foreground mb-6">Ustanowiono nowe rekordy!</p>
                        <div className="space-y-3 mb-8">
                            {newRecords.map((r) => (
                                <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 record-badge">
                                    <Trophy size={20} className="text-yellow-400" />
                                    <span className="font-semibold text-foreground">{RECORD_TYPE_PL[r.recordType] || r.recordType}</span>
                                    <Badge variant="warning">{r.gender === 'MALE' ? 'Mężczyźni' : 'Kobiety'}</Badge>
                                </div>
                            ))}
                        </div>
                        {!videoFile && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6 text-left">
                                <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-orange-200">
                                    Rekord wymaga weryfikacji wideo. Wróć i dodaj wideo lub prześlij je później przez panel weryfikacji.
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => navigate('/records')}>
                                <Trophy size={16} /> Zobacz rekordy
                            </Button>
                            <Button onClick={() => navigate('/results')}>
                                <CheckCircle size={16} /> Gotowe
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Dodaj nowy wynik</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Athlete select */}
                        {user?.role !== 'ATHLETE' && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Zawodnik</label>
                                <Input
                                    placeholder="Szukaj po imieniu, nazwisku lub nr albumu..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                                {selectedUser && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <span className="text-sm font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
                                        <button type="button" onClick={() => { setSelectedUser(null); setValue('userId', ''); setUserSearch(''); }}>
                                            <X size={14} className="text-muted-foreground hover:text-destructive" />
                                        </button>
                                    </div>
                                )}
                                {!selectedUser && users && users.length > 0 && (
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        {users.map((u: { id: string; firstName: string; lastName: string; studentId?: string }) => (
                                            <button key={u.id} type="button"
                                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary transition-colors text-sm border-b border-border/50 last:border-0"
                                                onClick={() => { setSelectedUser(u); setValue('userId', u.id); setUserSearch(''); }}
                                            >
                                                <span className="font-medium">{u.firstName} {u.lastName}</span>
                                                {u.studentId && <span className="text-muted-foreground text-xs">nr {u.studentId}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Discipline */}
                        <FormField label="Dyscyplina" error={errors.disciplineId?.message as string}>
                            <Select {...register('disciplineId', { required: 'Wybierz dyscyplinę' })}>
                                <option value="">Wybierz dyscyplinę</option>
                                {disciplines && Object.entries(
                                    disciplines.reduce((acc: Record<string, typeof disciplines>, d: { category: string }) => {
                                        if (!acc[d.category]) acc[d.category] = [];
                                        acc[d.category].push(d);
                                        return acc;
                                    }, {})
                                ).map(([cat, discs]) => (
                                    <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                                        {(discs as Array<{ id: string; name: string }>).map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Select>
                        </FormField>

                        {/* Value */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Wartość" error={errors.value?.message as string}>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={selectedDiscipline?.measurementUnit === 'SECONDS' ? 'np. 10.85' : 'np. 7.45'}
                                    {...register('value', { required: 'Wartość jest wymagana' })}
                                />
                            </FormField>
                            <FormField label="Wyświetlana wartość">
                                <Input
                                    placeholder={selectedDiscipline?.measurementUnit === 'SECONDS' ? 'np. 10.85s' : 'np. 7.45m'}
                                    {...register('displayValue', { required: true })}
                                />
                            </FormField>
                        </div>

                        {selectedDiscipline && (
                            <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground">
                                Jednostka: <strong>{selectedDiscipline.measurementUnit}</strong> ·
                                {selectedDiscipline.recordDirection === 'LOWER_IS_BETTER' ? ' Niższy wynik = lepszy' : ' Wyższy wynik = lepszy'}
                            </div>
                        )}

                        {/* Date and location */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Data" error={errors.date?.message as string}>
                                <Input type="date" {...register('date', { required: 'Data jest wymagana' })} />
                            </FormField>
                            <FormField label="Miejsce" error={errors.location?.message as string}>
                                <Input placeholder="Stadion AWF Kraków" {...register('location', { required: 'Miejsce jest wymagane' })} />
                            </FormField>
                        </div>

                        <FormField label="Zawody/wydarzenie (opcjonalne)">
                            <Input placeholder="Mistrzostwa Uczelni 2024" {...register('competition')} />
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Typ">
                                <Select {...register('source')}>
                                    <option value="MANUAL_ENTRY">Ręczne wprowadzenie</option>
                                    <option value="COMPETITION_IMPORT">Import z zawodów</option>
                                    <option value="HISTORICAL">Wynik historyczny</option>
                                </Select>
                            </FormField>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Wynik oficjalny</label>
                                <div className="flex items-center gap-3 h-9">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" {...register('isOfficial')} className="w-4 h-4 rounded" />
                                        <span className="text-sm">Tak</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <FormField label="Uwagi">
                            <Textarea placeholder="Dodatkowe informacje..." {...register('notes')} />
                        </FormField>

                        {/* Video Upload */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Wideo weryfikacyjne</label>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                                {videoFile ? (
                                    <div className="flex items-center gap-3 justify-center">
                                        <span className="text-sm font-medium">{videoFile.name}</span>
                                        <button type="button" onClick={() => setVideoFile(null)} className="text-destructive hover:text-destructive/80">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload size={24} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Kliknij lub przeciągnij plik wideo</span>
                                        <span className="text-xs text-muted-foreground">MP4, MOV, AVI, WebM · max. 500MB</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                                    </label>
                                )}
                            </div>
                            {!videoFile && (
                                <p className="text-xs text-yellow-400 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Wideo jest wymagane dla rekordu
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                Anuluj
                            </Button>
                            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                                {mutation.isPending ? <><Spinner size="sm" /> Zapisywanie...</> : 'Zapisz wynik'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
