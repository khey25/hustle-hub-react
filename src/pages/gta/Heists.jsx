import { useState, useEffect } from 'react';
import GTALayout from './GTALayout';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

export default function Heists() {
    const [data, setData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const backgrounds = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cayo.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/casino.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/dre.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/doomsday.jpg?raw=true"
    ];

    // Initial Load
    useEffect(() => {
        fetch(`${API_URL}/gta/heists`, FETCH_OPTIONS)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("API Error:", err));
    }, []);

    // Search Logic (Passed to Layout)
    const handleSearch = (searchTerm) => {
        const query = searchTerm.trim();
        const endpoint = query ? `/gta/heists/search?q=${query}` : `/gta/heists`;
        
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
        <GTALayout title="Be careful who you steal from... Anyways!" backgrounds={backgrounds} onSearch={handleSearch}>
            
            {data ? (
                <>
                    {renderTier("Billionaire Amongst Millionaires", data["Billionaire Amongst Millionaires"], "text-[#4CAF50] animate-pulse-green")}
                    {renderTier("Typical Bank Heist", data["Typical Bank Heist"], "text-[#FFEB3B] animate-pulse-yellow [animation-delay:0.5s]")}
                    {renderTier("What is this? A Convenience Store?", data["What is this? A Convenience Store?"], "text-[#F44336] animate-pulse-red [animation-delay:1s]")}
                </>
            ) : (
                <p className="text-xl text-gray-400 mt-10">Loading heists...</p>
            )}

            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </GTALayout>
    );
}