import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg(error.message);
        } else {
            // Check auth profile role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
            if (profile?.role === 'admin') {
                navigate('/admin');
            } else {
                await supabase.auth.signOut();
                setErrorMsg("Unauthorized. You must be an admin.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Zameengar Admin Login</h2>
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black mt-2">
                        {loading ? 'Authenticating...' : 'Login to Admin'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
