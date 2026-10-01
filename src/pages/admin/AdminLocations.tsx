import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { CheckSquare, XSquare, Plus } from 'lucide-react';

export default function AdminLocations() {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCity, setNewCity] = useState('');

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('city', { ascending: true });

        if (!error && data) setLocations(data);
        setLoading(false);
    };

    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCity.trim()) return;

        const { error } = await supabase.from('locations').insert({ city: newCity.trim(), is_active: true });
        if (!error) {
            setNewCity('');
            fetchLocations();
        } else alert('Error adding city: ' + error.message);
    };

    const toggleActive = async (id: string, is_active: boolean) => {
        const { error } = await supabase.from('locations').update({ is_active }).eq('id', id);
        if (!error) fetchLocations();
        else alert('Error updating: ' + error.message);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Locations Management</h1>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h2 className="text-xl text-gray-900 font-bold mb-4">Add New City</h2>
                <form onSubmit={handleAddCity} className="flex gap-4">
                    <input
                        type="text"
                        value={newCity}
                        onChange={e => setNewCity(e.target.value)}
                        placeholder="Enter City Name (e.g. Quetta)"
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        required
                    />
                    <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2 px-6">
                        <Plus className="w-5 h-5" /> Add City
                    </Button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading locations...</div>
                ) : locations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No locations found.</div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-900 border-b">
                            <tr>
                                <th className="p-4 font-semibold">City Name</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Added On</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((item) => (
                                <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{item.city}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        {item.is_active ? (
                                            <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, false)} className="text-red-600 hover:bg-red-50">
                                                <XSquare className="w-4 h-4 mr-1" /> Disable
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, true)} className="text-green-600 hover:bg-green-50">
                                                <CheckSquare className="w-4 h-4 mr-1" /> Enable
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
