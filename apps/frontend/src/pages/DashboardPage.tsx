import TopRecordsBoard from '@/components/dashboard/TopRecordsBoard';
import JoinChallengeSection from '@/components/dashboard/JoinChallengeSection';

export default function DashboardPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full min-h-[calc(100vh-7rem)]">
                {/* Left: Top Records */}
                <TopRecordsBoard />

                {/* Right: Join Challenge */}
                <JoinChallengeSection />
            </div>
        </div>
    );
}
