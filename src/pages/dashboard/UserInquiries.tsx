import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function UserInquiries() {
    const { profile } = useAuth();
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        if (profile) fetchInquiries();
    }, [profile, tab]);

    const fetchInquiries = async () => {
        setLoading(true);
        const column = tab === 'received' ? 'receiver_id' : 'sender_id';

        const { data, error } = await supabase
            .from('inquiries')
            .select(`
                *,
                property:properties(title)
            `)
            .eq(column, profile?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInquiries(data);
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Inquiries</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setTab('received')}
                    className={`px-4 py-2 font-medium rounded-lg ${tab === 'received' ? 'bg-green-700 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                >
                    Received Inquiries
                </button>
                <button
                    onClick={() => setTab('sent')}
                    className={`px-4 py-2 font-medium rounded-lg ${tab === 'sent' ? 'bg-green-700 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                >
                    Sent Inquiries
                </button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading inquiries...</div>
                ) : inquiries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {tab === 'received' ? 'You have not received any inquiries.' : 'You have not sent any inquiries.'}
                    </div>
                ) : (
                    <div className="divide-y">
                        {inquiries.map((inq) => (
                            <div key={inq.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">
                                        Regarding: {inq.property?.title || 'Unknown Property'}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {new Date(inq.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-4 flex gap-4">
                                    <span><strong>From:</strong> {inq.name}</span>
                                    <span><strong>Email:</strong> {inq.email}</span>
                                    <span><strong>Phone:</strong> {inq.phone}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded border text-gray-800 text-sm whitespace-pre-wrap">
                                    {inq.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
