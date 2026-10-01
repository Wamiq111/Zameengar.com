import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PublicLayout = () => {
    const { session, profile, isLoading } = useAuth();

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!session) return <Outlet />;

    if (profile?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
};
