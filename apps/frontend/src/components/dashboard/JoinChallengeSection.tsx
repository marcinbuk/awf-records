import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { disciplineApi, recordApi, gamesApi } from '@/services/api';
import { Skeleton, Badge } from '@/components/ui';
import { Zap, Target, ChevronRight, Dumbbell, Users, Timer, TrendingUp, Rocket, Flame, Award } from 'lucide-react';

export default function JoinChallengeSection() {
    const navigate = useNavigate();
    const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

    const { data: disciplines, isLoading: loadingDisciplines } = useQuery({
        queryKey: ['disciplines-active'],
        queryFn: () => disciplineApi.getAll({ isActive: 'true' }).then(r => r.data.data),
    });

    const { data: currentRecord, isLoading: loadingRecord } = useQuery({
        queryKey: ['currentRecord', selectedDiscipline],
        queryFn: () => recordApi.getAll({
            disciplineId: selectedDiscipline,
            recordType: 'UNIVERSITY',
            status: 'VERIFIED',
            limit: 1,
        }).then(r => r.data.data?.[0] || null),
        enabled: !!selectedDiscipline,
    });

    const { data: activeGames } = useQuery({
        queryKey: ['activeGames'],
        queryFn: () => gamesApi.getEditions({ status: 'ACTIVE' }).then(r => r.data.data || []),
    });

    const selectedDisc = disciplines?.find((d: any) => d.id === selectedDiscipline);

    return (
        <div className="relative flex flex-col h-full rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(165deg, #0a0f0a 0%, #0a150d 30%, #0d1a10 60%, #0a120a 100%)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
        >
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-green-400/15 flex items-center justify-center border border-emerald-500/25 hero-pulse">
                        <Flame size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Podejmij wyzwanie AWF!</h2>
                        <p className="text-xs text-emerald-400/70">Pobij rekord · Zapisz historię</p>
                    </div>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

                {/* Motivational banner */}
                <div className="relative rounded-xl p-4 overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(34, 197, 94, 0.12) 50%, rgba(16, 185, 129, 0.06) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.15)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Target size={16} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-300">Masz to w sobie! 💪</p>
                            <p className="text-xs text-emerald-400/60 mt-0.5 leading-relaxed">
                                Wybierz dyscyplinę, sprawdź aktualny rekord i zgłoś swój wynik. Każdy rekord czeka na pobicie.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Discipline selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Dumbbell size={12} />
                        Wybierz dyscyplinę
                    </label>
                    {loadingDisciplines ? (
                        <Skeleton className="h-11 rounded-xl bg-emerald-900/20" />
                    ) : (
                        <select
                            value={selectedDiscipline}
                            onChange={(e) => setSelectedDiscipline(e.target.value)}
                            className="w-full h-11 rounded-xl px-4 text-sm font-medium text-white bg-white/[0.04] border border-emerald-500/20 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2334d399' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                            }}
                        >
                            <option value="" className="bg-[#0d1a0d] text-white">— Wybierz dyscyplinę —</option>
                            {disciplines?.map((d: any) => (
                                <option key={d.id} value={d.id} className="bg-[#0d1a0d] text-white">
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Current record display */}
                {selectedDiscipline && (
                    <div className="rounded-xl p-4 bg-white/[0.02] border border-emerald-900/40 space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp size={12} />
                                Aktualny rekord uczelni
                            </span>
                            {selectedDisc && (
                                <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400/60">
                                    {selectedDisc.recordDirection === 'HIGHER_IS_BETTER' ? '↑ Wyżej = Lepiej' : '↓ Niżej = Lepiej'}
                                </Badge>
                            )}
                        </div>

                        {loadingRecord ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-24 bg-emerald-900/20" />
                                <Skeleton className="h-4 w-40 bg-emerald-900/20" />
                            </div>
                        ) : currentRecord ? (
                            <div>
                                <div className="text-2xl font-black text-emerald-400 tabular-nums">
                                    {currentRecord.result?.displayValue || currentRecord.result?.value}
                                </div>
                                <div className="text-xs text-emerald-400/50 mt-1 flex items-center gap-2">
                                    <Users size={11} />
                                    <span>
                                        {currentRecord.result?.user?.firstName} {currentRecord.result?.user?.lastName}
                                    </span>
                                    <span className="text-emerald-700">·</span>
                                    <span>{currentRecord.gender === 'MALE' ? 'Mężczyźni' : 'Kobiety'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-sm text-emerald-400/50 italic">Brak rekordu — bądź pierwszy! 🏆</p>
                            </div>
                        )}
                    </div>
                )}

                {/* CTA Button — pulsing */}
                <button
                    onClick={() => navigate(selectedDiscipline ? `/results/add?discipline=${selectedDiscipline}` : '/results/add')}
                    className="group relative w-full py-4 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cta-pulse"
                    style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
                    }}
                >
                    {/* Shine sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <div className="relative flex items-center justify-center gap-2">
                        <Rocket size={18} className="group-hover:animate-bounce" />
                        <span className="text-base font-extrabold tracking-wide">Zgłoś swój wynik!</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                {/* Quick stats strip */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: Target, label: 'Dyscyplin', value: disciplines?.length || 0 },
                        { icon: Timer, label: 'Aktywne gry', value: activeGames?.length || 0 },
                        { icon: Award, label: 'Twoje szanse', value: '∞' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="rounded-lg p-3 bg-white/[0.02] border border-emerald-900/30 text-center">
                            <Icon size={14} className="text-emerald-500/50 mx-auto mb-1" />
                            <div className="text-sm font-bold text-emerald-400">{value}</div>
                            <div className="text-[10px] text-emerald-500/40">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Active Games */}
                {activeGames && activeGames.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap size={12} />
                            Aktywne Igrzyska
                        </span>
                        {activeGames.map((game: any) => (
                            <button
                                key={game.id}
                                onClick={() => navigate(`/games`)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.1] transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <Zap size={14} className="text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{game.name}</div>
                                    <div className="text-[10px] text-emerald-400/50">
                                        {game._count?.participations || 0} uczestników
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-emerald-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
