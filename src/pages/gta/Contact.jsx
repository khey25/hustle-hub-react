import { useState, useEffect } from 'react';
import GTALayout from './GTALayout';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

export default function Contact() {
    const [data, setData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const backgrounds = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/payphone.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/classic.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/paper.jpg?raw=true"
    ];

    // Initial Load
    useEffect(() => {
        fetch(`${API_URL}/gta/contact`, FETCH_OPTIONS)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("API Error:", err));
    }, []);

    // Search Logic (Passed to Layout)
    const handleSearch = (searchTerm) => {
        const query = searchTerm.trim();
        const endpoint = query ? `/gta/contact/search?q=${query}` : `/gta/contact`;
        
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
        <GTALayout title="Pick up the phone, it's money calling..." backgrounds={backgrounds} onSearch={handleSearch}>
            
            {data ? (
                <>
                    {renderTier("Money and Time Efficient", data["Money and Time Efficient"], "text-[#4CAF50] animate-pulse-green")}
                    {renderTier("Just for the Vibes", data["Just for the Vibes"], "text-[#FFEB3B] animate-pulse-yellow [animation-delay:0.5s]")}
                    {renderTier("Why are you even doing this?", data["Why are you even doing this?"], "text-[#F44336] animate-pulse-red [animation-delay:1s]")}
                </>
            ) : (
                <p className="text-xl text-gray-400 mt-10">Loading missions...</p>
            )}

            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </GTALayout>
    );
}