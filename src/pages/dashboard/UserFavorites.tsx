import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function UserFavorites() {
    const { profile } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) fetchFavorites();
    }, [profile]);

    const fetchFavorites = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                id,
                property_id,
                property:properties (
                    id, title, price, city, society, purpose,
                    property_images(image_url, is_primary)
                )
            `)
            .eq('user_id', profile?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setFavorites(data.filter((f: any) => f.property !== null));
        }
        setLoading(false);
    };

    const handleRemove = async (favId: string) => {
        await supabase.from('favorites').delete().eq('id', favId);
        fetchFavorites();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Properties</h1>

            {loading ? (
                <div className="text-gray-500">Loading your saved properties...</div>
            ) : favorites.length === 0 ? (
                <div className="text-gray-500 bg-white p-8 rounded-lg border text-center">
                    You have not saved any properties yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favorites.map((fav) => {
                        const item = fav.property;
                        const primaryImage = item.property_images?.find((img: any) => img.is_primary)?.image_url
                            || item.property_images?.[0]?.image_url;

                        return (
                            <div key={fav.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                                <div className="h-48 bg-gray-200 relative">
                                    {primaryImage ? (
                                        <img src={primaryImage} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-green-700 text-white text-xs px-2 py-1 rounded">
                                        For {item.purpose}
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button
                                            onClick={() => handleRemove(fav.id)}
                                            size="icon"
                                            className="bg-white/90 hover:bg-red-50 text-red-500 rounded-full h-8 w-8"
                                            title="Remove from Saved"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-lg font-bold text-gray-900 mb-1">PKR {item.price?.toLocaleString()}</div>
                                    <h3 className="text-gray-700 font-medium mb-2 truncate" title={item.title}>{item.title}</h3>
                                    <div className="text-sm text-gray-500 mb-4 truncate">{item.society ? `${item.society}, ` : ''}{item.city}</div>
                                    <Link to={`/properties/${item.id}`}>
                                        <Button className="w-full bg-green-700 hover:bg-green-800">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
