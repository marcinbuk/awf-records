import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { resultsApi, disciplinesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { Upload, CheckCircle, AlertTriangle, EyeOff } from 'lucide-react';

const CSV_TEMPLATE = `firstName,lastName,studentId,discipline,value,displayValue,date,location,competition,isOfficial
Jan,Kowalski,2021001,Bieg 100m,11.45,11.45s,2022-05-10,Stadion AWF Kraków,Mistrzostwa 2022,true
Anna,Lewandowska,2021006,Bieg 100m,12.85,12.85s,2022-05-10,Stadion AWF Kraków,,false`;

interface ProcessedRow { userId: string; value: number; displayValue: string; date: string; location: string; _userName: string; error?: string }
interface ErrorRow { row: number; error: string }

export default function ImportResultsPage() {
    const [csvText, setCsvText] = useState('');
    const [disciplineId, setDisciplineId] = useState('');
    const [preview, setPreview] = useState<{ processed: ProcessedRow[]; errors: ErrorRow[]; total: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const previewMutation = useMutation({
        mutationFn: () => resultsApi.import({ csvData: csvText, disciplineId, preview: true }).then(r => r.data.data),
        onSuccess: setPreview,
        onError: () => toast({ title: 'Błąd podglądu', variant: 'destructive' }),
    });

    const importMutation = useMutation({
        mutationFn: () => resultsApi.import({ csvData: csvText, disciplineId, preview: false }),
        onSuccess: (res) => {
            toast({ title: `Zaimportowano ${res.data.data.saved} wyników`, variant: 'success' });
            setCsvText(''); setPreview(null); setDisciplineId('');
        },
        onError: () => toast({ title: 'Błąd importu', variant: 'destructive' }),
    });

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setCsvText(ev.target?.result as string);
        reader.readAsText(file, 'UTF-8');
    };

    return (
        <div className="page-container max-w-3xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload size={18} className="text-primary" /> Import wyników z CSV
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Discipline */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Dyscyplina</label>
                        <Select value={disciplineId} onChange={e => setDisciplineId(e.target.value)}>
                            <option value="">Wybierz dyscyplinę...</option>
                            {(disciplines || []).map((d: { id: string; name: string }) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="text-sm font-medium block mb-1.5">Plik CSV</label>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileRef.current?.click()}>
                            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Kliknij aby wybrać plik CSV</p>
                            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
                        </div>
                    </div>

                    {/* Or paste CSV */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Lub wklej zawartość CSV</label>
                        <textarea
                            className="flex min-h-[140px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder={CSV_TEMPLATE}
                            value={csvText}
                            onChange={e => setCsvText(e.target.value)}
                        />
                    </div>

                    {/* Template */}
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Format CSV:</p>
                        <pre className="text-xs text-muted-foreground font-mono overflow-x-auto whitespace-pre">{CSV_TEMPLATE.split('\n')[0]}</pre>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1"
                            onClick={() => previewMutation.mutate()}
                            disabled={!csvText || !disciplineId || previewMutation.isPending}>
                            {previewMutation.isPending ? <><Spinner size="sm" /> Analizowanie...</> : <><EyeOff size={16} /> Podgląd</>}
                        </Button>
                        {preview && (
                            <Button className="flex-1"
                                onClick={() => importMutation.mutate()}
                                disabled={importMutation.isPending || preview.processed.length === 0}>
                                {importMutation.isPending ? <><Spinner size="sm" /> Importowanie...</> : <><CheckCircle size={16} /> Importuj ({preview.processed.length})</>}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            {preview && (
                <Card>
                    <CardHeader>
                        <CardTitle>Podgląd importu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 text-sm">
                            <span className="text-green-400">✓ {preview.processed.length} poprawnych</span>
                            <span className="text-red-400">✗ {preview.errors.length} błędów</span>
                            <span className="text-muted-foreground">Łącznie: {preview.total}</span>
                        </div>

                        {preview.errors.length > 0 && (
                            <div className="space-y-2">
                                {preview.errors.map((e) => (
                                    <div key={e.row} className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-red-300">Wiersz {e.row}: {e.error}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {preview.processed.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border">
                                        <tr>
                                            <th className="text-left py-2 px-2 text-xs text-muted-foreground">Zawodnik</th>
                                            <th className="text-left py-2 px-2 text-xs text-muted-foreground">Wynik</th>
                                            <th className="text-left py-2 px-2 text-xs text-muted-foreground">Data</th>
                                            <th className="text-left py-2 px-2 text-xs text-muted-foreground">Miejsce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.processed.slice(0, 20).map((r, i) => (
                                            <tr key={i} className="border-b border-border/50">
                                                <td className="py-2 px-2">{r._userName}</td>
                                                <td className="py-2 px-2 font-bold text-primary">{r.displayValue}</td>
                                                <td className="py-2 px-2 text-muted-foreground">{r.date}</td>
                                                <td className="py-2 px-2 text-muted-foreground">{r.location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.processed.length > 20 && (
                                    <p className="text-xs text-muted-foreground text-center mt-2">... i {preview.processed.length - 20} więcej</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
