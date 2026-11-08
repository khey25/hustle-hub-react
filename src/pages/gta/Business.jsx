import { useState, useEffect } from 'react';
import GTALayout from './GTALayout';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

export default function Business() {
    const [data, setData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const backgrounds = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/acid.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/nightclub.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/weed.jpg?raw=true"
    ];

    // Initial Load
    useEffect(() => {
        fetch(`${API_URL}/gta/businesses`, FETCH_OPTIONS)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("API Error:", err));
    }, []);

    // Search Logic (Passed to Layout)
    const handleSearch = (searchTerm) => {
        const query = searchTerm.trim();
        const endpoint = query ? `/gta/businesses/search?q=${query}` : `/gta/businesses`;
        
        fetch(`${API_URL}${endpoint}`, FETCH_OPTIONS)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("Search Error:", err));
    };

    // Reusable UI Builder for each Tier
    const renderTier = (title, items, colorClass) => {
        if (!items || items.length === 0) return null;
        return (
            <section className="mb-[50px] w-full">
                <h2 className={`text-[2rem] mb-5 border-b-2 border-[#333] pb-[10px] ${colorClass} font-bold text-left md:text-center`}>
                    {title}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] justify-center gap-5">
                    {items.map(item => (
                        <ActionCard key={item.name} item={item} onClick={setSelectedItem} />
                    ))}
                </div>
            </section>
        );
    };

    return (
        <GTALayout title="Business huh? Sounds Boring..." backgrounds={backgrounds} onSearch={handleSearch}>
            
            {/* Display Tiers if Data Exists */}
            {data ? (
                <>
                    {renderTier("Suspiciously Profitable", data["Suspiciously Profitable"], "text-[#4CAF50] animate-pulse-green")}
                    {renderTier("Above Minimum Wage", data["Above Minimum Wage"], "text-[#FFEB3B] animate-pulse-yellow [animation-delay:0.5s]")}
                    {renderTier("Going Bankrupt", data["Going Bankrupt"], "text-[#F44336] animate-pulse-red [animation-delay:1s]")}
                </>
            ) : (
                <p className="text-xl text-gray-400 mt-10">Loading businesses...</p>
            )}

            {/* Split Screen Pop-up */}
            <DetailModal 
                isOpen={!!selectedItem} 
                data={selectedItem} 
                onClose={() => setSelectedItem(null)} 
            />

        </GTALayout>
    );
}