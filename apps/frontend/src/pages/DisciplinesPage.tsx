import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { disciplinesApi } from '@/services/api';
import { Card, CardContent, Badge, Skeleton } from '@/components/ui';
import { Trophy, ChevronRight } from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from '@/lib/utils';

const categoryColors: Record<string, string> = {
    TRACK: 'text-blue-400 bg-blue-400/10',
    FIELD: 'text-green-400 bg-green-400/10',
    SWIMMING: 'text-cyan-400 bg-cyan-400/10',
    GYMNASTICS: 'text-purple-400 bg-purple-400/10',
    TEAM_SPORT: 'text-orange-400 bg-orange-400/10',
    STRENGTH: 'text-red-400 bg-red-400/10',
    OTHER: 'text-gray-400 bg-gray-400/10',
};

export default function DisciplinesPage() {
    const { data: disciplines, isLoading } = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => disciplinesApi.getAll().then(r => r.data.data),
    });

    // Group by category
    const grouped: Record<string, typeof disciplines> = {};
    if (disciplines) {
        for (const d of disciplines) {
            if (!grouped[d.category]) grouped[d.category] = [];
            grouped[d.category].push(d);
        }
    }

    if (isLoading) {
        return (
            <div className="page-container space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="page-container space-y-6">
            {Object.entries(grouped).map(([category, discs]) => (
                <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide ${categoryColors[category] || 'text-gray-400 bg-gray-400/10'}`}>
                            {CATEGORY_LABELS[category] || category}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(discs as Array<{ id: string; name: string; category: string; measurementUnit: string; recordDirection: string; description?: string }>).map((d) => (
                            <Card key={d.id} className="hover:border-primary/40 transition-all duration-200 card-glow group cursor-pointer">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Trophy size={18} className="text-yellow-400" />
                                                <h3 className="font-semibold text-sm">{d.name}</h3>
                                            </div>
                                            {d.description && (
                                                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{d.description}</p>
                                            )}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Jednostka:</span>
                                                    <Badge variant="outline" className="text-xs">{UNIT_LABELS[d.measurementUnit] || d.measurementUnit}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Kierunek:</span>
                                                    <span>{d.recordDirection === 'LOWER_IS_BETTER' ? '↓ Mniej = lepiej' : '↑ Więcej = lepiej'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
