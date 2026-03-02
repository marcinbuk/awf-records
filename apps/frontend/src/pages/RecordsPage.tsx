import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recordsApi, disciplinesApi } from '@/services/api';
import { Card, CardContent, Button, Select, Badge, Skeleton } from '@/components/ui';
import { Trophy, Filter } from 'lucide-react';
import { getStatusColor, getStatusEmoji, STATUS_LABELS, GENDER_LABELS, RECORD_TYPE_LABELS, formatDate } from '@/lib/utils';

export default function RecordsPage() {
    const [disciplineId, setDisciplineId] = useState('');
    const [gender, setGender] = useState('');
    const [recordType, setRecordType] = useState('UNIVERSITY');

    const { data: disciplines } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    const { data: records, isLoading } = useQuery({
        queryKey: ['records', disciplineId, gender, recordType],
        queryFn: () => recordsApi.getAll({
            disciplineId: disciplineId || undefined,
            gender: gender || undefined,
            recordType: recordType || undefined,
        }).then(r => r.data.data),
    });

    return (
        <div className="page-container space-y-5">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Filter size={16} className="text-muted-foreground" />
                <Select value={recordType} onChange={e => setRecordType(e.target.value)} className="w-44">
                    <option value="UNIVERSITY">Rekord Uczelni</option>
                    <option value="FACULTY">Rekord Wydziału</option>
                    <option value="PERSONAL_BEST">Rekord Osobisty</option>
                    <option value="">Wszystkie typy</option>
                </Select>
                <Select value={gender} onChange={e => setGender(e.target.value)} className="w-40">
                    <option value="">Obie płcie</option>
                    <option value="MALE">Mężczyźni</option>
                    <option value="FEMALE">Kobiety</option>
                </Select>
                <Select value={disciplineId} onChange={e => setDisciplineId(e.target.value)} className="w-52">
                    <option value="">Wszystkie dyscypliny</option>
                    {(disciplines || []).map((d: { id: string; name: string }) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </Select>
            </div>

            {/* Records table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Dyscyplina</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Rekord</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Zawodnik</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Płeć</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Typ</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>)}
                                        </tr>
                                    ))
                                ) : (records || []).length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Brak rekordów spełniających kryteria</td></tr>
                                ) : (
                                    (records || []).map((rec: {
                                        id: string;
                                        discipline: { name: string };
                                        result: { displayValue: string; date: string; user: { id: string; firstName: string; lastName: string } };
                                        gender: string; recordType: string; status: string;
                                    }) => (
                                        <tr key={rec.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Trophy size={16} className="text-yellow-400" />
                                                    <span className="font-medium text-sm">{rec.discipline.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-lg font-bold text-primary">{rec.result.displayValue}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link to={`/athletes/${rec.result.user?.id}`} className="text-sm hover:text-primary font-medium">
                                                    {rec.result.user?.firstName} {rec.result.user?.lastName}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">{GENDER_LABELS[rec.gender]}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{RECORD_TYPE_LABELS[rec.recordType]}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(rec.status)}`}>
                                                    {getStatusEmoji(rec.status)} {STATUS_LABELS[rec.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(rec.result.date)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
