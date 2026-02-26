import { Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '@/app/layout';
import { PageSkeleton } from '@/components/PageSkeleton';
import { useUpdateSW } from '@/lib/pwa/usePWA';
import { PWAUpdateBanner, PWAInstallButton } from '@/shared/components/pwa/PWAComponents';
import { AuthGuard } from '@/app/auth-guard';

// Lazy load auth pages
const SignIn = lazy(() => import('@/features/auth/sign-in'));
const SignUp = lazy(() => import('@/features/auth/sign-up'));
const ForgotPassword = lazy(() => import('@/features/auth/forgot-password'));

// Lazy load main app pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const VehiclesPage = lazy(() => import('@/features/vehicles/pages/list'));
const VehicleDetailPage = lazy(() => import('@/features/vehicles/pages/detail'));
const CategoryManagementPage = lazy(() => import('@/features/categories/pages/CategoryManagementPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const SeferDetailPage = lazy(() => import('@/features/sefers/pages/SeferDetailPage'));

function App() {
    const { needRefresh, updateServiceWorker } = useUpdateSW();

    return (
        <Suspense fallback={<PageSkeleton />}>
            <PWAUpdateBanner needRefresh={needRefresh} updateSW={updateServiceWorker} />
            <Routes>
                {/* Auth Routes */}
                <Route path="/sign-in" element={<AuthGuard requireAuth={false}><SignIn /></AuthGuard>} />
                <Route path="/sign-up" element={<AuthGuard requireAuth={false}><SignUp /></AuthGuard>} />
                <Route path="/forgot-password" element={<AuthGuard requireAuth={false}><ForgotPassword /></AuthGuard>} />

                {/* Main App Routes */}
                <Route path="/" element={<AuthGuard requireAuth={true}><Layout /></AuthGuard>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="dashboard" element={<Navigate to="/" replace />} />
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="vehicles/:vehicleId" element={<VehicleDetailPage />} />
                    <Route path="vehicles/:vehicleId/sefer/:seferId" element={<SeferDetailPage />} />
                    <Route path="categories" element={<CategoryManagementPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <PWAInstallButton />
        </Suspense>
    );
}

export default App;
