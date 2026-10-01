import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardLayout = () => {
    const { session, profile, signOut, isLoading } = useAuth();

    if (isLoading) return <div className="p-8">Loading...</div>;

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:block border-gray-200 min-h-screen flex flex-col p-4">
                <h2 className="text-xl font-bold text-green-700 mb-8 px-2">Zameengar</h2>
                <nav className="flex-1 space-y-1">
                    <Link to="/" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium">← Back to Home</Link>
                    <Link to="/properties" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium">Search Properties</Link>
                    <div className="my-2 border-b"></div>
                    <Link to="/dashboard" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700">Dashboard</Link>
                    <Link to="/dashboard/properties" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700">My Properties</Link>
                    <Link to="/dashboard/add-property" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700">Add Property</Link>
                    <Link to="/dashboard/favorites" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700">Saved Properties</Link>
                    <Link to="/dashboard/inquiries" className="block px-3 py-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-700">Inquiries</Link>
                </nav>
                <button onClick={signOut} className="block w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-red-50 hover:text-red-700">Logout</button>
            </aside>

            {/* Main content */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};
