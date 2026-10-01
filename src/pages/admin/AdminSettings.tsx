import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Save } from 'lucide-react';

export default function AdminSettings() {
    const [listingLimit, setListingLimit] = useState('5');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'property_listing_limit')
            .single();

        if (!error && data) setListingLimit(data.value);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase.from('platform_settings').upsert({
            key: 'property_listing_limit',
            value: listingLimit,
            description: 'Maximum number of active listings standard users can have'
        });

        if (!error) {
            alert('Settings updated successfully!');
        } else {
            alert('Error updating settings (Remember to run the SQL migration 0003!): ' + error.message);
        }

        setSaving(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Platform Settings</h1>

            {loading ? (
                <div className="text-gray-500">Loading settings...</div>
            ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">User Property Listing Limit</label>
                            <p className="text-xs text-gray-500 mb-4">Set the maximum number of properties a single user is allowed to publish.</p>

                            <div className="flex gap-4 items-center">
                                <input
                                    type="number"
                                    min="1"
                                    value={listingLimit}
                                    onChange={e => setListingLimit(e.target.value)}
                                    className="w-32 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                                <span className="text-gray-600 font-medium">properties</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <Button type="submit" disabled={saving} className="bg-green-700 hover:bg-green-800 flex items-center gap-2 px-8">
                                <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
