import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ResultsPage from '@/pages/ResultsPage';
import AddResultPage from '@/pages/AddResultPage';
import ImportResultsPage from '@/pages/ImportResultsPage';
import RecordsPage from '@/pages/RecordsPage';
import RecordDetailPage from '@/pages/RecordDetailPage';
import VerifyRecordsPage from '@/pages/VerifyRecordsPage';
import AthletesPage from '@/pages/AthletesPage';
import AthleteProfilePage from '@/pages/AthleteProfilePage';
import StatisticsPage from '@/pages/StatisticsPage';
import DisciplinesPage from '@/pages/DisciplinesPage';
import AdminPage from '@/pages/AdminPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminDisciplinesPage from '@/pages/AdminDisciplinesPage';
import AdminAuditLogPage from '@/pages/AdminAuditLogPage';
import VideosPage from '@/pages/VideosPage';
import GamesPage from '@/pages/GamesPage';
import HistoricalEntryPage from '@/pages/HistoricalEntryPage';
import MyStatsPage from '@/pages/MyStatsPage';
import RankingPage from '@/pages/RankingPage';
import { Toaster } from '@/components/ui/toaster';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/results/add" element={<PrivateRoute roles={['ADMIN', 'MODERATOR', 'ATHLETE']}><AddResultPage /></PrivateRoute>} />
                    <Route path="/results/import" element={<PrivateRoute roles={['ADMIN', 'MODERATOR']}><ImportResultsPage /></PrivateRoute>} />
                    <Route path="/records" element={<RecordsPage />} />
                    <Route path="/records/:id" element={<RecordDetailPage />} />
                    <Route path="/records/verify" element={<PrivateRoute roles={['ADMIN', 'MODERATOR']}><VerifyRecordsPage /></PrivateRoute>} />
                    <Route path="/athletes" element={<AthletesPage />} />
                    <Route path="/athletes/:id" element={<AthleteProfilePage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/my-stats" element={<MyStatsPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/disciplines" element={<DisciplinesPage />} />
                    <Route path="/videos" element={<VideosPage />} />
                    <Route path="/games" element={<GamesPage />} />
                    <Route path="/admin/historical-entry" element={<PrivateRoute roles={['ADMIN', 'MODERATOR']}><HistoricalEntryPage /></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminPage /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><AdminUsersPage /></PrivateRoute>} />
                    <Route path="/admin/disciplines" element={<PrivateRoute roles={['ADMIN', 'MODERATOR']}><AdminDisciplinesPage /></PrivateRoute>} />
                    <Route path="/admin/audit-log" element={<PrivateRoute roles={['ADMIN', 'MODERATOR']}><AdminAuditLogPage /></PrivateRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
        </>
    );
}
