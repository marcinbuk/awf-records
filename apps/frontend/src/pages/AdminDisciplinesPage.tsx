import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disciplinesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, FormField } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Plus, Pencil, X, Check } from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from '@/lib/utils';

interface Discipline {
    id: string; name: string; category: string; measurementUnit: string; recordDirection: string; description?: string; isActive: boolean;
}

const CATEGORIES = ['TRACK', 'FIELD', 'SWIMMING', 'GYMNASTICS', 'TEAM_SPORT', 'STRENGTH', 'OTHER'];
const UNITS = ['SECONDS', 'MINUTES', 'METERS', 'CENTIMETERS', 'KILOGRAMS', 'POINTS', 'REPETITIONS'];

export default function AdminDisciplinesPage() {
    const queryClient = useQueryClient();
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', category: 'TRACK', measurementUnit: 'SECONDS', recordDirection: 'LOWER_IS_BETTER', description: '' });

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const createMutation = useMutation({
        mutationFn: () => disciplinesApi.create(form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] });
            setShowAdd(false);
            setForm({ name: '', category: 'TRACK', measurementUnit: 'SECONDS', recordDirection: 'LOWER_IS_BETTER', description: '' });
            toast({ title: 'Dyscyplina dodana', variant: 'success' });
        },
        onError: () => toast({ title: 'Błąd dodawania', variant: 'destructive' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: object }) => disciplinesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] });
            setEditId(null);
            toast({ title: 'Zaktualizowano', variant: 'success' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => disciplinesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] });
            toast({ title: 'Dyscyplina dezaktywowana', variant: 'success' });
        },
    });

    return (
        <div className="page-container space-y-5">
            <div className="flex justify-end">
                <Button onClick={() => setShowAdd(!showAdd)}>
                    <Plus size={16} /> Dodaj dyscyplinę
                </Button>
            </div>

            {showAdd && (
                <Card className="border-primary/30">
                    <CardHeader><CardTitle>Nowa dyscyplina</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Nazwa"><Input placeholder="np. Bieg 100m" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormField>
                            <FormField label="Kategoria"><Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                            </Select></FormField>
                            <FormField label="Jednostka miary"><Select value={form.measurementUnit} onChange={e => setForm(f => ({ ...f, measurementUnit: e.target.value }))}>
                                {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                            </Select></FormField>
                            <FormField label="Kierunek rekordu"><Select value={form.recordDirection} onChange={e => setForm(f => ({ ...f, recordDirection: e.target.value }))}>
                                <option value="LOWER_IS_BETTER">Niższy = lepszy (czas)</option>
                                <option value="HIGHER_IS_BETTER">Wyższy = lepszy (odległość)</option>
                            </Select></FormField>
                        </div>
                        <FormField label="Opis (opcjonalny)"><Input placeholder="Opis dyscypliny..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowAdd(false)}>Anuluj</Button>
                            <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>Dodaj dyscyplinę</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Nazwa</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Kategoria</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Jednostka</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Kierunek</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(disciplines || []).map((d: Discipline) => (
                                <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30">
                                    <td className="px-4 py-3 font-medium text-sm">{d.name}</td>
                                    <td className="px-4 py-3 text-sm"><Badge variant="secondary">{CATEGORY_LABELS[d.category]}</Badge></td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{UNIT_LABELS[d.measurementUnit]}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.recordDirection === 'LOWER_IS_BETTER' ? '↓ Niżej = lepiej' : '↑ Wyżej = lepiej'}</td>
                                    <td className="px-4 py-3"><Badge variant={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Aktywna' : 'Nieaktywna'}</Badge></td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(d.id)} title="Dezaktywuj">
                                            <X size={14} className="text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
