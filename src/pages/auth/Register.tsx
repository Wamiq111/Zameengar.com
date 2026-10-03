import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [accountType, setAccountType] = useState('user');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, account_type: accountType }
            }
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            setSuccessMsg('Registration successful! You can now log in.');
            setTimeout(() => navigate('/login'), 2000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Create an Account</h2>
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{successMsg}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text" required
                            value={fullName} onChange={e => setFullName(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">I am registering as</label>
                        <select
                            value={accountType} onChange={e => setAccountType(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="user">Individual / Buyer / Property Owner</option>
                            <option value="dealer">Real Estate Dealer</option>
                            <option value="agency">Real Estate Agency</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password" required minLength={6}
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 mt-2">
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
}
