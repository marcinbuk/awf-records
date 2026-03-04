import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recordApi } from '@/services/api';
import { Skeleton, Badge } from '@/components/ui';
import { Trophy, Crown, Medal, Star, Flame, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatDate, RECORD_TYPE_LABELS, CATEGORY_LABELS, UNIT_LABELS } from '@/lib/utils';

const MEDAL_STYLES = [
    { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: Crown, glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' },
    { bg: 'bg-slate-300/15', border: 'border-slate-400/30', text: 'text-slate-300', icon: Medal, glow: 'shadow-[0_0_15px_rgba(148,163,184,0.1)]' },
    { bg: 'bg-amber-700/15', border: 'border-amber-600/30', text: 'text-amber-500', icon: Medal, glow: 'shadow-[0_0_15px_rgba(217,119,6,0.1)]' },
];

function formatRecordValue(value: number, displayValue: string | null, unit: string): string {
    if (displayValue) return displayValue;
    const unitSuffix = UNIT_LABELS[unit] || '';
    if (unit === 'SECONDS' || unit === 'MINUTES') {
        const mins = Math.floor(value / 60);
        const secs = (value % 60).toFixed(2);
        return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${value.toFixed(2)}s`;
    }
    return `${value} ${unitSuffix}`;
}

export default function TopRecordsBoard() {
    const { data: records, isLoading } = useQuery({
        queryKey: ['topRecords'],
        queryFn: () => recordApi.getTop(10).then(r => r.data.data),
    });

    const heroRecord = records?.[0];
    const restRecords = records?.slice(1) || [];

    return (
        <div className="relative flex flex-col h-full rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(165deg, #0a0f0a 0%, #0d1a0d 30%, #111b11 60%, #0a120a 100%)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
        >
            {/* Subtle corner glow */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-emerald-500/20 flex items-center justify-center border border-yellow-500/20">
                        <Trophy size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Największe Rekordy</h2>
                        <p className="text-xs text-emerald-400/70">Hall of Fame · Rekordy Uczelni</p>
                    </div>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            </div>

            {/* Records list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {isLoading ? (
                    <>
                        {/* Hero skeleton */}
                        <Skeleton className="h-36 rounded-xl bg-emerald-900/30 mb-3" />
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="w-8 h-8 rounded-lg bg-emerald-900/30" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4 bg-emerald-900/30" />
                                    <Skeleton className="h-3 w-1/2 bg-emerald-900/30" />
                                </div>
                                <Skeleton className="h-6 w-16 bg-emerald-900/30" />
                            </div>
                        ))}
                    </>
                ) : !records || records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Star size={28} className="text-emerald-500/40" />
                        </div>
                        <p className="text-sm text-emerald-400/60 font-medium">Brak zweryfikowanych rekordów</p>
                        <p className="text-xs text-emerald-600/40 mt-1">Dodaj wyniki, aby rekordy pojawiły się tutaj</p>
                    </div>
                ) : (
                    <>
                        {/* ===== HERO #1 — biggest record ===== */}
                        {heroRecord && (
                            <Link
                                to={`/records/${heroRecord.id}`}
                                className="group relative block rounded-xl overflow-hidden mb-3 transition-all duration-300 hover:scale-[1.01]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(234, 179, 8, 0.06) 100%)',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                    boxShadow: '0 0 30px rgba(234, 179, 8, 0.1), inset 0 1px 0 rgba(234, 179, 8, 0.1)',
                                }}
                            >
                                {/* Shimmer animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent hero-shimmer pointer-events-none" />

                                <div className="relative p-5">
                                    {/* Top badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center hero-pulse">
                                                <Crown size={18} className="text-yellow-400" />
                                            </div>
                                            <Badge variant="warning" className="text-[10px] font-bold uppercase tracking-wider">
                                                <Sparkles size={10} className="mr-1" />
                                                #1 Rekord
                                            </Badge>
                                        </div>
                                        <ArrowUpRight size={16} className="text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Discipline & value */}
                                    <div className="flex items-end justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate mb-1">
                                                {heroRecord.discipline?.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-yellow-400/60">
                                                <span>{heroRecord.result?.user?.firstName} {heroRecord.result?.user?.lastName}</span>
                                                <span className="text-yellow-700">·</span>
                                                <span>{heroRecord.gender === 'MALE' ? '♂ Mężczyźni' : '♀ Kobiety'}</span>
                                                <span className="text-yellow-700">·</span>
                                                <span>{heroRecord.result?.date ? formatDate(heroRecord.result.date) : ''}</span>
                                            </div>
                                            {/* Tags */}
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">
                                                    {CATEGORY_LABELS[heroRecord.discipline?.category] || heroRecord.discipline?.category}
                                                </span>
                                                <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium bg-yellow-500/10 text-yellow-400/70 border border-yellow-500/15">
                                                    Rekord {RECORD_TYPE_LABELS[heroRecord.recordType] || heroRecord.recordType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-3xl font-black text-yellow-400 tabular-nums tracking-tight">
                                                {formatRecordValue(
                                                    heroRecord.result?.value,
                                                    heroRecord.result?.displayValue,
                                                    heroRecord.discipline?.measurementUnit
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* ===== Rest of records (2-10) ===== */}
                        {restRecords.map((rec: any, idx: number) => {
                            const index = idx + 1; // offset by 1 since #1 is hero
                            const medal = MEDAL_STYLES[index] || null;
                            const MedalIcon = medal?.icon || Flame;

                            return (
                                <Link
                                    key={rec.id}
                                    to={`/records/${rec.id}`}
                                    className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.01] ${medal
                                            ? `${medal.bg} border ${medal.border} ${medal.glow}`
                                            : 'bg-white/[0.02] border border-emerald-900/30 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${medal ? `${medal.bg} ${medal.text}` : 'bg-emerald-500/10 text-emerald-500/60'
                                        }`}>
                                        {index < 3 ? (
                                            <MedalIcon size={18} />
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-semibold text-white truncate">
                                                {rec.discipline?.name}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/20 text-emerald-400/80 flex-shrink-0">
                                                {rec.gender === 'MALE' ? '♂ M' : '♀ K'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-emerald-400/50">
                                            <span>{rec.result?.user?.firstName} {rec.result?.user?.lastName}</span>
                                            <span className="text-emerald-700">·</span>
                                            <span>{rec.result?.date ? formatDate(rec.result.date) : ''}</span>
                                        </div>
                                        {/* Tags */}
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">
                                                {CATEGORY_LABELS[rec.discipline?.category] || rec.discipline?.category}
                                            </span>
                                            <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium bg-yellow-500/10 text-yellow-400/70 border border-yellow-500/15">
                                                Rekord {RECORD_TYPE_LABELS[rec.recordType] || rec.recordType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div className="text-right flex-shrink-0">
                                        <div className={`text-base font-bold tabular-nums ${medal ? medal.text : 'text-emerald-400'}`}>
                                            {formatRecordValue(
                                                rec.result?.value,
                                                rec.result?.displayValue,
                                                rec.discipline?.measurementUnit
                                            )}
                                        </div>
                                        <ArrowUpRight size={12} className="ml-auto mt-0.5 text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Footer */}
            {records && records.length > 0 && (
                <div className="p-4 pt-2">
                    <Link
                        to="/records"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all"
                    >
                        Zobacz wszystkie rekordy
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
}
