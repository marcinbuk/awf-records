import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi, disciplineApi } from '@/services/api';
import { Card, Button, Input, Select, Textarea } from '@/components/ui';

const FACULTIES = [
    'Wydział Wychowania Fizycznego', 'Wydział Sportu',
    'Wydział Rehabilitacji Ruchowej', 'Wydział Turystyki i Rekreacji', 'Wydział Nauk o Zdrowiu',
];

export default function HistoricalEntryPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', gender: 'MALE', disciplineId: '', value: '',
        displayValue: '', date: '', location: '', competition: '', notes: '',
        studentId: '', faculty: '', userStatus: 'ALUMNI', graduationYear: '',
    });
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const { data: disciplinesData } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplineApi.getAll({ isActive: true }),
    });
    const disciplines = disciplinesData?.data?.data || [];

    const mutation = useMutation({
        mutationFn: (data: any) => userApi.quickHistoricalEntry(data),
        onSuccess: (response) => {
            setResult(response.data.data);
            setError('');
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Błąd podczas dodawania wpisu'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...form,
            value: parseFloat(form.value),
            graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        });
    };

    const resetForm = () => {
        setForm({ firstName: '', lastName: '', gender: 'MALE', disciplineId: '', value: '', displayValue: '', date: '', location: '', competition: '', notes: '', studentId: '', faculty: '', userStatus: 'ALUMNI', graduationYear: '' });
        setResult(null);
        setError('');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📜 Wpis historyczny</h1>
                <p className="text-gray-600">Szybkie dodawanie wyników archiwalnych dla studentów i absolwentów</p>
            </div>

            {result && (
                <Card className="p-6 bg-green-50 border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Wpis dodany pomyślnie!</h3>
                    <p className="text-green-700">
                        <strong>{result.athlete?.firstName} {result.athlete?.lastName}</strong> —{' '}
                        {result.result?.discipline?.name}: <strong>{result.result?.displayValue || result.result?.value}</strong>
                    </p>
                    {result.recordDetection?.isRecord && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-yellow-800 font-semibold">🏆 Nowy rekord wykryty!</p>
                            {result.createdRecords?.map((rec: any, i: number) => (
                                <p key={i} className="text-sm text-yellow-700">• {rec.recordType}: {rec.result?.discipline?.name}</p>
                            ))}
                        </div>
                    )}
                    <Button onClick={resetForm} className="mt-3 bg-green-600 hover:bg-green-700 text-white">Dodaj kolejny wpis</Button>
                </Card>
            )}

            {!result && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">👤 Dane zawodnika</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
                                <Input required value={form.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, firstName: e.target.value })} placeholder="Jan" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
                                <Input required value={form.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lastName: e.target.value })} placeholder="Kowalski" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Płeć *</label>
                                <select className="w-full p-2 border rounded text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                    <option value="MALE">Mężczyzna</option>
                                    <option value="FEMALE">Kobieta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select className="w-full p-2 border rounded text-sm" value={form.userStatus} onChange={(e) => setForm({ ...form, userStatus: e.target.value })}>
                                    <option value="STUDENT">Student</option>
                                    <option value="ALUMNI">Absolwent</option>
                                    <option value="STAFF">Pracownik</option>
                                    <option value="EXTERNAL">Zewnętrzny</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nr albumu</label>
                                <Input value={form.studentId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, studentId: e.target.value })} placeholder="S001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wydział</label>
                                <select className="w-full p-2 border rounded text-sm" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                                    <option value="">Wybierz...</option>
                                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            {form.userStatus === 'ALUMNI' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rok ukończenia</label>
                                    <Input type="number" value={form.graduationYear} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, graduationYear: e.target.value })} placeholder="2020" />
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">📊 Wynik</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dyscyplina *</label>
                                <select required className="w-full p-2 border rounded text-sm" value={form.disciplineId} onChange={(e) => setForm({ ...form, disciplineId: e.target.value })}>
                                    <option value="">Wybierz dyscyplinę...</option>
                                    {disciplines.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.measurementUnit})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wartość wyniku *</label>
                                <Input required type="number" step="0.01" value={form.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, value: e.target.value })} placeholder="11.23" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                <Input required type="date" value={form.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Miejsce</label>
                                <Input value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, location: e.target.value })} placeholder="Stadion AWF" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zawody</label>
                                <Input value={form.competition} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, competition: e.target.value })} placeholder="Mistrzostwa AWF 2019" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
                                <Textarea value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, notes: e.target.value })} placeholder="Dodatkowe informacje..." />
                            </div>
                        </div>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                            {mutation.isPending ? 'Zapisywanie...' : '💾 Zapisz wpis'}
                        </Button>
                        <Button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700">
                            Wyczyść formularz
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
