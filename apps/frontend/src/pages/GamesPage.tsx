import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesApi, disciplineApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Card, Button, Input, Textarea } from '@/components/ui';

export default function GamesPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data: editionsData, isLoading } = useQuery({
        queryKey: ['games-editions'],
        queryFn: () => gamesApi.getEditions(),
    });

    const { data: editionDetail } = useQuery({
        queryKey: ['game-edition', selectedEdition],
        queryFn: () => gamesApi.getEditionById(selectedEdition!),
        enabled: !!selectedEdition,
    });

    const editions = editionsData?.data?.data || [];
    const detail = editionDetail?.data?.data;

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-500', UPCOMING: 'bg-blue-500', ACTIVE: 'bg-green-500',
        SCORING: 'bg-yellow-500', COMPLETED: 'bg-purple-500', CANCELLED: 'bg-red-500',
    };

    const statusLabels: Record<string, string> = {
        DRAFT: 'Szkic', UPCOMING: 'Nadchodzące', ACTIVE: 'Aktywne',
        SCORING: 'Punktowanie', COMPLETED: 'Zakończone', CANCELLED: 'Anulowane',
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">🏆 Igrzyska Ogólne — Wielobój</h1>
                    <p className="text-muted-foreground">Miesięczne zawody z przelicznikami punktowymi dla każdej dyscypliny</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-primary hover:bg-primary/80 text-primary-foreground">
                    + Nowa edycja
                </Button>
            </div>

            {showCreateForm && <CreateEditionForm onClose={() => setShowCreateForm(false)} />}

            {/* Editions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {editions.map((edition: any) => (
                    <Card key={edition.id} className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${selectedEdition === edition.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedEdition(edition.id)}>
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-foreground">{edition.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[edition.status] || 'bg-gray-400'}`}>
                                {statusLabels[edition.status] || edition.status}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{edition.description || 'Brak opisu'}</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>📋 {edition.disciplines?.length || 0} dyscyplin</span>
                            <span>👥 {edition._count?.participations || 0} uczestników</span>
                        </div>
                        <div className="text-xs text-muted-foreground/60 mt-2">
                            {new Date(edition.startDate).toLocaleDateString('pl-PL')} – {new Date(edition.endDate).toLocaleDateString('pl-PL')}
                        </div>
                    </Card>
                ))}
                {editions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <p className="text-lg">Brak edycji igrzysk</p>
                        <p className="text-sm">Utwórz nową edycję z przelicznikami punktowymi</p>
                    </div>
                )}
            </div>

            {/* Edition Detail with Leaderboard and Point Formulas */}
            {detail && (
                <div className="space-y-6">
                    {/* Point conversion overview */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4">📊 Przeliczniki punktowe — {detail.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detail.disciplines?.map((d: any) => {
                                const cfg = d.pointsConfig;
                                return (
                                    <div key={d.id} className="p-4 bg-secondary/50 rounded-lg border border-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-foreground">{d.discipline.name}</h4>
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">max {d.maxPoints} pkt</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p><strong>Formuła:</strong> {formulaLabel(cfg.formulaType)}</p>
                                            {cfg.formulaType === 'LINEAR' && (
                                                <>
                                                    <p>Baza: {cfg.basePoints} pkt, Ref: {cfg.referenceValue}, Mnożnik: {cfg.multiplier}</p>
                                                    <p className="text-muted-foreground/60 italic">Punkty = {cfg.basePoints} {cfg.multiplier >= 0 ? '+' : ''} {cfg.multiplier} × (wynik - {cfg.referenceValue})</p>
                                                </>
                                            )}
                                            {cfg.formulaType === 'PERCENTAGE' && (
                                                <>
                                                    <p>Wartość referencyjna: {cfg.referenceValue}</p>
                                                    <p className="text-muted-foreground/60 italic">Punkty = (wynik / {cfg.referenceValue}) × {cfg.maxPoints}</p>
                                                </>
                                            )}
                                            {cfg.formulaType === 'TABLE' && cfg.table && (
                                                <div className="mt-1">
                                                    <p className="font-medium mb-1">Tabela przelicznikowa:</p>
                                                    <table className="w-full text-xs">
                                                        <thead><tr className="bg-secondary"><th className="p-1 text-left text-muted-foreground">Od</th><th className="p-1 text-left text-muted-foreground">Do</th><th className="p-1 text-right text-muted-foreground">Punkty</th></tr></thead>
                                                        <tbody>
                                                            {cfg.table.map((row: any, i: number) => (
                                                                <tr key={i} className="border-b border-border/50"><td className="p-1 text-foreground">{row.min}</td><td className="p-1 text-foreground">{row.max}</td><td className="p-1 text-right font-medium text-primary">{row.points}</td></tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {cfg.formulaType === 'CUSTOM' && (
                                                <p>Mnożnik: {cfg.multiplier}</p>
                                            )}
                                            <p className="text-muted-foreground/60">Kierunek: {d.discipline.recordDirection === 'LOWER_IS_BETTER' ? '⬇️ mniej = lepiej' : '⬆️ więcej = lepiej'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Status controls */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-foreground">{detail.name} — Tabela wyników</h2>
                            <div className="flex gap-2">
                                {['UPCOMING', 'ACTIVE', 'SCORING', 'COMPLETED'].map((status) => (
                                    <Button key={status} onClick={() => gamesApi.updateStatus(detail.id, status).then(() => queryClient.invalidateQueries({ queryKey: ['game-edition', selectedEdition] }))}
                                        className={`text-xs px-3 py-1 ${detail.status === status ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'}`}>
                                        {statusLabels[status]}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/50">
                                        <th className="text-left p-3 text-muted-foreground">#</th>
                                        <th className="text-left p-3 text-muted-foreground">Zawodnik</th>
                                        <th className="text-left p-3 text-muted-foreground">Wydział</th>
                                        <th className="text-left p-3 text-muted-foreground">Status</th>
                                        {detail.disciplines?.map((d: any) => (
                                            <th key={d.id} className="text-center p-3 text-xs text-muted-foreground">{d.discipline.name}</th>
                                        ))}
                                        <th className="text-right p-3 font-bold text-muted-foreground">Suma pkt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.participations?.sort((a: any, b: any) => b.totalPoints - a.totalPoints).map((p: any, idx: number) => (
                                        <tr key={p.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}>
                                            <td className="p-3 font-bold text-foreground">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                            </td>
                                            <td className="p-3 font-medium text-foreground">{p.user.firstName} {p.user.lastName}</td>
                                            <td className="p-3 text-muted-foreground text-xs">{p.user.faculty || '—'}</td>
                                            <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${p.user.userStatus === 'ALUMNI' ? 'bg-amber-400/10 text-amber-400' : 'bg-green-400/10 text-green-400'}`}>{p.user.userStatus === 'ALUMNI' ? 'Absolwent' : 'Student'}</span></td>
                                            {detail.disciplines?.map((d: any) => {
                                                const result = p.results?.find((r: any) => r.gameDisciplineId === d.id);
                                                return (
                                                    <td key={d.id} className="text-center p-3 text-xs">
                                                        {result ? (
                                                            <div>
                                                                <div className="font-medium text-foreground">{result.rawValue}</div>
                                                                <div className="text-primary">{result.points.toFixed(1)} pkt</div>
                                                            </div>
                                                        ) : <span className="text-muted-foreground/50">—</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-right p-3 font-bold text-primary text-lg">{p.totalPoints.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!detail.participations || detail.participations.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">Brak uczestników w tej edycji</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

function formulaLabel(type: string): string {
    const labels: Record<string, string> = {
        LINEAR: 'Liniowa', TABLE: 'Tabelaryczna',
        PERCENTAGE: 'Procentowa', CUSTOM: 'Własna',
    };
    return labels[type] || type;
}

function CreateEditionForm({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: '', description: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        startDate: '', endDate: '', maxParticipants: '', isOpenForAlumni: true,
    });
    const [selectedDiscs, setSelectedDiscs] = useState<any[]>([]);

    const { data: allDiscs } = useQuery({ queryKey: ['disciplines'], queryFn: () => disciplineApi.getAll({ isActive: true }) });
    const disciplines = allDiscs?.data?.data || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => gamesApi.createEdition(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['games-editions'] }); onClose(); },
    });

    const addDiscipline = (discId: string) => {
        if (!discId || selectedDiscs.find((d) => d.disciplineId === discId)) return;
        const disc = disciplines.find((d: any) => d.id === discId);
        const isLowerBetter = disc?.recordDirection === 'LOWER_IS_BETTER';
        setSelectedDiscs([...selectedDiscs, {
            disciplineId: discId, disciplineName: disc?.name || '', order: selectedDiscs.length + 1, isRequired: false,
            pointsConfig: {
                formulaType: 'LINEAR',
                basePoints: isLowerBetter ? 100 : 0,
                referenceValue: 0,
                multiplier: isLowerBetter ? -1 : 1,
                maxPoints: 100,
                table: [{ min: 0, max: 10, points: 50 }, { min: 11, max: 20, points: 100 }],
            },
        }]);
    };

    const updateDiscConfig = (index: number, field: string, value: any) => {
        const updated = [...selectedDiscs];
        const keys = field.split('.');
        if (keys.length === 1) {
            updated[index].pointsConfig[field] = value;
        }
        setSelectedDiscs(updated);
    };

    const updateTableRow = (discIndex: number, rowIndex: number, field: string, value: number) => {
        const updated = [...selectedDiscs];
        if (!updated[discIndex].pointsConfig.table) updated[discIndex].pointsConfig.table = [];
        updated[discIndex].pointsConfig.table[rowIndex][field] = value;
        setSelectedDiscs(updated);
    };

    const addTableRow = (discIndex: number) => {
        const updated = [...selectedDiscs];
        if (!updated[discIndex].pointsConfig.table) updated[discIndex].pointsConfig.table = [];
        const table = updated[discIndex].pointsConfig.table;
        const lastMax = table.length > 0 ? table[table.length - 1].max : 0;
        table.push({ min: lastMax + 1, max: lastMax + 10, points: 0 });
        setSelectedDiscs(updated);
    };

    const removeTableRow = (discIndex: number, rowIndex: number) => {
        const updated = [...selectedDiscs];
        updated[discIndex].pointsConfig.table.splice(rowIndex, 1);
        setSelectedDiscs(updated);
    };

    const handleSubmit = () => {
        if (!form.name || !form.startDate || !form.endDate || selectedDiscs.length === 0) return;
        createMutation.mutate({
            ...form,
            month: Number(form.month), year: Number(form.year),
            maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
            disciplines: selectedDiscs.map((d) => ({
                disciplineId: d.disciplineId, order: d.order, isRequired: d.isRequired,
                pointsConfig: d.pointsConfig,
            })),
        });
    };

    return (
        <Card className="p-6 space-y-6 border-2 border-primary/30 bg-primary/5">
            <h3 className="text-lg font-bold text-foreground">📝 Nowa edycja wieloboju</h3>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nazwa edycji *</label>
                    <Input placeholder="np. Wielobój Luty 2026" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Maks. uczestników</label>
                    <Input type="number" value={form.maxParticipants} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, maxParticipants: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Data rozpoczęcia *</label>
                    <Input type="date" value={form.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Data zakończenia *</label>
                    <Input type="date" value={form.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endDate: e.target.value })} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Opis</label>
                <Textarea placeholder="Opis edycji..." value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Discipline selector */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-2">🏅 Dyscypliny wieloboju z przelicznikami</label>
                <select onChange={(e) => { addDiscipline(e.target.value); e.target.value = ''; }} className="w-full p-2 border border-border rounded text-sm bg-secondary text-foreground">
                    <option value="">Dodaj dyscyplinę wieloboju...</option>
                    {disciplines.filter((d: any) => !selectedDiscs.find((s) => s.disciplineId === d.id)).map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.category} — {d.recordDirection === 'LOWER_IS_BETTER' ? '⬇️ mniej=lepiej' : '⬆️ więcej=lepiej'})</option>
                    ))}
                </select>
            </div>

            {/* Per-discipline point config */}
            {selectedDiscs.map((disc, i) => (
                <Card key={i} className="p-4 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-foreground">#{i + 1} {disc.disciplineName}</h4>
                        <button onClick={() => setSelectedDiscs(selectedDiscs.filter((_, j) => j !== i))} className="text-red-400 text-sm hover:text-red-300">✕ Usuń</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Typ przelicznika</label>
                            <select className="w-full p-2 border border-border rounded text-sm bg-secondary text-foreground" value={disc.pointsConfig.formulaType}
                                onChange={(e) => updateDiscConfig(i, 'formulaType', e.target.value)}>
                                <option value="LINEAR">Liniowa (linear)</option>
                                <option value="TABLE">Tabelaryczna</option>
                                <option value="PERCENTAGE">Procentowa</option>
                                <option value="CUSTOM">Własna (mnożnik)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Maks. punktów</label>
                            <Input type="number" value={disc.pointsConfig.maxPoints}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'maxPoints', Number(e.target.value))} />
                        </div>
                    </div>

                    {/* LINEAR config */}
                    {disc.pointsConfig.formulaType === 'LINEAR' && (
                        <div className="space-y-2 p-3 bg-secondary/50 rounded">
                            <p className="text-xs text-muted-foreground italic">Punkty = bazaPkt + mnożnik × (wynik - wartośćRef)</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs text-muted-foreground">Baza punktów</label>
                                    <Input type="number" value={disc.pointsConfig.basePoints}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'basePoints', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground">Wartość referencyjna</label>
                                    <Input type="number" step="0.01" value={disc.pointsConfig.referenceValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'referenceValue', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground">Mnożnik</label>
                                    <Input type="number" step="0.1" value={disc.pointsConfig.multiplier}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'multiplier', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PERCENTAGE config */}
                    {disc.pointsConfig.formulaType === 'PERCENTAGE' && (
                        <div className="space-y-2 p-3 bg-secondary/50 rounded">
                            <p className="text-xs text-muted-foreground italic">Punkty = (wynik / wartośćRef) × maxPkt</p>
                            <div>
                                <label className="block text-xs text-muted-foreground">Wartość referencyjna (100% = maxPkt)</label>
                                <Input type="number" step="0.01" value={disc.pointsConfig.referenceValue}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'referenceValue', Number(e.target.value))} />
                            </div>
                        </div>
                    )}

                    {/* TABLE config */}
                    {disc.pointsConfig.formulaType === 'TABLE' && (
                        <div className="space-y-2 p-3 bg-secondary/50 rounded">
                            <p className="text-xs text-muted-foreground italic">Wynik wpada w przedział → przypisane punkty</p>
                            <table className="w-full text-sm">
                                <thead><tr className="bg-secondary text-xs"><th className="p-2 text-left text-muted-foreground">Od</th><th className="p-2 text-left text-muted-foreground">Do</th><th className="p-2 text-left text-muted-foreground">Punkty</th><th className="p-2 w-8"></th></tr></thead>
                                <tbody>
                                    {(disc.pointsConfig.table || []).map((row: any, rowIdx: number) => (
                                        <tr key={rowIdx} className="border-b border-border/50">
                                            <td className="p-1"><Input type="number" step="0.01" value={row.min} className="text-xs h-8"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTableRow(i, rowIdx, 'min', Number(e.target.value))} /></td>
                                            <td className="p-1"><Input type="number" step="0.01" value={row.max} className="text-xs h-8"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTableRow(i, rowIdx, 'max', Number(e.target.value))} /></td>
                                            <td className="p-1"><Input type="number" value={row.points} className="text-xs h-8"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTableRow(i, rowIdx, 'points', Number(e.target.value))} /></td>
                                            <td className="p-1"><button onClick={() => removeTableRow(i, rowIdx)} className="text-red-400 text-xs hover:text-red-300">✕</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Button onClick={() => addTableRow(i)} className="text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground py-1 px-3">+ Dodaj wiersz</Button>
                        </div>
                    )}

                    {/* CUSTOM config */}
                    {disc.pointsConfig.formulaType === 'CUSTOM' && (
                        <div className="p-3 bg-secondary/50 rounded">
                            <p className="text-xs text-muted-foreground italic mb-2">Punkty = wynik × mnożnik (do max)</p>
                            <div>
                                <label className="block text-xs text-muted-foreground">Mnożnik</label>
                                <Input type="number" step="0.1" value={disc.pointsConfig.multiplier}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDiscConfig(i, 'multiplier', Number(e.target.value))} />
                            </div>
                        </div>
                    )}
                </Card>
            ))}

            <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || selectedDiscs.length === 0}
                    className="bg-primary hover:bg-primary/80 text-primary-foreground px-6">
                    {createMutation.isPending ? 'Tworzenie...' : `🏆 Utwórz wielobój (${selectedDiscs.length} dyscyplin)`}
                </Button>
                <Button onClick={onClose} className="bg-secondary hover:bg-secondary/80 text-muted-foreground">Anuluj</Button>
            </div>
        </Card>
    );
}
