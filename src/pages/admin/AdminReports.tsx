import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

export default function AdminReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('property_reports')
            .select(`
                *,
                property:properties(id, title),
                reporter:profiles!property_reports_reported_by_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReports(data);
        }
        setLoading(false);
    };

    const handleResolve = async (id: string) => {
        const { error } = await supabase.from('property_reports').update({
            status: 'resolved',
            resolved_at: new Date().toISOString()
        }).eq('id', id);

        if (!error) {
            fetchReports();
        } else {
            alert('Error updating report: ' + error.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Reports</h1>

            <div className="bg-white rounded-xl border shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No reports found.</div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Reported Property</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold">Reporter</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((item) => (
                                <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{item.property?.title || 'Unknown'}</div>
                                        <div className="text-xs text-blue-600 cursor-pointer" onClick={() => window.open(`/properties/${item.property?.id}`, '_blank')}>View Property</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium">{item.reason}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]" title={item.description}>{item.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <div>{item.reporter?.full_name || 'Unknown User'}</div>
                                        <div className="text-xs">{item.reporter?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        {item.status !== 'resolved' && (
                                            <Button size="sm" onClick={() => handleResolve(item.id)} className="bg-green-700 hover:bg-green-800">
                                                Mark Resolved
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
