import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Heart, MessageSquare, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function DashboardOverview() {
    const { profile } = useAuth();
    const [stats, setStats] = useState({ listings: 0, pending: 0, favorites: 0, inquiries: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) fetchStats();
    }, [profile]);

    const fetchStats = async () => {
        setLoading(true);
        const [listingsRes, pendingRes, favRes, inqRes] = await Promise.all([
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', profile?.id),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', profile?.id).eq('status', 'pending'),
            supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', profile?.id),
            supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('receiver_id', profile?.id).eq('status', 'new'),
        ]);
        setStats({
            listings: listingsRes.count || 0,
            pending: pendingRes.count || 0,
            favorites: favRes.count || 0,
            inquiries: inqRes.count || 0,
        });
        setLoading(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name || 'User'}</h1>
                    <p className="text-gray-600">Here's a snapshot of your activity.</p>
                </div>
                <Link to="/dashboard/add-property" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Add New Property
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-600 font-medium">Total Listings</h3>
                        <Home className="text-blue-500 w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.listings}</div>
                    <p className="text-sm text-gray-500 mt-2">{loading ? '' : `${stats.pending} Pending Approval`}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-600 font-medium">Saved Properties</h3>
                        <Heart className="text-red-500 w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.favorites}</div>
                    <p className="text-sm text-gray-500 mt-2">
                        <Link to="/dashboard/favorites" className="text-green-600 hover:underline">View saved →</Link>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-600 font-medium">New Inquiries</h3>
                        <MessageSquare className="text-green-500 w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.inquiries}</div>
                    <p className="text-sm text-gray-500 mt-2">
                        <Link to="/dashboard/inquiries" className="text-green-600 hover:underline">View inquiries →</Link>
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'My Properties', to: '/dashboard/properties' },
                        { label: 'Add Property', to: '/dashboard/add-property' },
                        { label: 'Saved Properties', to: '/dashboard/favorites' },
                        { label: 'Inquiries', to: '/dashboard/inquiries' },
                    ].map(link => (
                        <Link key={link.to} to={link.to} className="block p-4 bg-gray-50 rounded-lg border text-center text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition">
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
