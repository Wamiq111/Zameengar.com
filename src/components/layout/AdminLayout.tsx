import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout = () => {
    const { session, profile, signOut, isLoading } = useAuth();

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!session) return <Navigate to="/admin/login" replace />;
    if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col p-4">
                <h2 className="text-xl font-bold text-white mb-8 px-2">Admin Panel</h2>
                <nav className="flex-1 space-y-1">
                    <Link to="/admin" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Dashboard</Link>
                    <Link to="/admin/properties" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">All Properties</Link>
                    <Link to="/admin/properties/pending" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Pending Approval</Link>
                    <Link to="/admin/users" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Users</Link>
                    <Link to="/admin/locations" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Locations</Link>
                    <Link to="/admin/reports" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Reports</Link>
                    <Link to="/admin/settings" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Settings</Link>
                </nav>
                <button onClick={signOut} className="block w-full text-left px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-red-400">Logout</button>
            </aside>

            <main className="flex-1 bg-white">
                <Outlet />
            </main>
        </div>
    );
};
