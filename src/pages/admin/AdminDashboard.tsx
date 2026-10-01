import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Home, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, properties: 0, pending: 0, reports: 0 });
    const [recentProperties, setRecentProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const [usersRes, propertiesRes, pendingRes, reportsRes, recentRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
            supabase.from('properties').select('id', { count: 'exact', head: true }),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('property_reports').select('id', { count: 'exact', head: true }).eq('status', 'reviewing'),
            supabase.from('properties').select('*, owner:profiles!properties_owner_id_fkey(full_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
            users: usersRes.count || 0,
            properties: propertiesRes.count || 0,
            pending: pendingRes.count || 0,
            reports: reportsRes.count || 0,
        });

        if (recentRes.data) setRecentProperties(recentRes.data);
        setLoading(false);
    };

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: <Users className="text-blue-500 w-6 h-6" />, color: 'text-blue-600' },
        { label: 'Total Properties', value: stats.properties, icon: <Home className="text-indigo-500 w-6 h-6" />, color: 'text-indigo-600' },
        { label: 'Pending Approval', value: stats.pending, icon: <AlertCircle className="text-yellow-500 w-6 h-6" />, color: 'text-yellow-600' },
        { label: 'Active Reports', value: stats.reports, icon: <FileText className="text-red-500 w-6 h-6" />, color: 'text-red-600' },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
                <p className="text-gray-600">Real-time platform statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-600 font-medium">{card.label}</h3>
                            {card.icon}
                        </div>
                        <div className={`text-3xl font-bold ${loading ? 'text-gray-300 animate-pulse' : 'text-gray-900'}`}>
                            {loading ? '...' : card.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Properties Awaiting Approval</h2>
                    <Link to="/admin/properties" className="text-sm text-green-700 hover:underline font-medium">View All →</Link>
                </div>
                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : recentProperties.length === 0 ? (
                    <p className="text-gray-500">No properties are currently pending approval.</p>
                ) : (
                    <div className="divide-y">
                        {recentProperties.map((item) => (
                            <div key={item.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-gray-900">{item.title}</div>
                                    <div className="text-sm text-gray-500">By {item.owner?.full_name || 'Unknown'} · {item.city} · PKR {item.price?.toLocaleString()}</div>
                                </div>
                                <Link to="/admin/properties">
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">Pending</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
