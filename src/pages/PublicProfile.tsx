import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

export default function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProfileAndProperties();
    }, [id]);

    const fetchProfileAndProperties = async () => {
        setLoading(true);
        // Fetch public profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, created_at, bio, city')
            .eq('id', id)
            .single();

        if (profileData) {
            setProfile(profileData);

            // Fetch public approved properties for this user
            const { data: propData } = await supabase
                .from('properties')
                .select(`
                    *,
                    property_images(image_url, is_primary)
                `)
                .eq('owner_id', id)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (propData) {
                setProperties(propData);
            }
        }
        setLoading(false);
    };

    if (loading) return <div><Header /><div className="p-10 text-center">Loading profile...</div></div>;
    if (!profile) return <div><Header /><div className="p-10 text-center">User not found.</div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="max-w-7xl mx-auto px-4 w-full py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-green-100 text-green-700 flex items-center justify-center font-bold text-4xl rounded-full overflow-hidden shrink-0">
                        {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : profile.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name || 'Anonymous User'}</h1>
                        <p className="text-gray-500 mb-2 flex items-center justify-center md:justify-start gap-2">
                            Member since {new Date(profile.created_at).getFullYear()}
                            {profile.city && <span>• {profile.city}</span>}
                        </p>
                        {profile.bio && <p className="text-gray-700 max-w-2xl">{profile.bio}</p>}
                    </div>
                </div>

                {/* Properties List */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties List ({properties.length})</h2>
                {properties.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
                        This user hasn't listed any properties yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((item) => {
                            const primaryImage = item.property_images?.find((img: any) => img.is_primary)?.image_url ||
                                item.property_images?.[0]?.image_url;
                            return (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group flex flex-col hover:shadow-md transition">
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        {primaryImage ? (
                                            <img src={primaryImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-green-700/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            For {item.purpose}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="text-xl font-bold text-green-700 mb-1">PKR {item.price.toLocaleString()}</div>
                                        <h3 className="text-gray-900 font-bold mb-1 line-clamp-1">{item.title}</h3>
                                        <div className="text-sm text-gray-500 mb-3 flex-1">{item.city}</div>
                                        <Link to={`/properties/${item.id}`} className="mt-auto">
                                            <Button className="w-full bg-gray-50 text-gray-900 border hover:bg-green-50 hover:text-green-700">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
