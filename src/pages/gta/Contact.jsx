import { useState, useEffect } from 'react';
import GTALayout from './GTALayout';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';
import { fetchTieredData } from '../../supabaseClient';
import { useOwnedAssets } from '../../hooks/useOwnedAssets';
import { useBookmarks } from '../../hooks/useBookmarks';

export default function Contact({ session, userRole }) {
    const [data, setData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const { isBookmarked, handleToggleBookmark } = useBookmarks(session, 'gta_contact');
    const { isOwned, setOwnedStatus } = useOwnedAssets(session, 'gta_contact');
    const backgrounds = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/payphone.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/classic.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/paper.jpg?raw=true"
    ];

    useEffect(() => {
        fetchTieredData('gta_contact')
            .then(groupedData => setData(groupedData))
            .catch(err => console.error("API Error:", err));
    }, []);

    const handleSearch = (searchTerm) => {
        fetchTieredData('gta_contact', searchTerm)
            .then(groupedData => setData(groupedData))
            .catch(err => console.error("Search Error:", err));
    };

    const renderTier = (title, items, colorClass) => {
        if (!items || items.length === 0) return null;
        return (
            <section className="mb-[50px] w-full">
                <h2 className={`text-[2rem] mb-5 border-b-2 border-[#333] pb-[10px] ${colorClass} font-bold text-left md:text-center`}>
                    {title}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] justify-center gap-5">
                    {items.map(item => (
                        <ActionCard
    key={item.name}
    item={item}
    onClick={setSelectedItem}
    isBookmarked={isBookmarked(item.name)}
    onToggleBookmark={session ? () => handleToggleBookmark(item.name) : null}
    isOwned={isOwned(item.name)}
/>
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
            <DetailModal
    isOpen={!!selectedItem}
    data={selectedItem}
    onClose={() => setSelectedItem(null)}
    session={session}
    userRole={userRole}
    onOwnedChange={(_table, itemName, nowOwned) => setOwnedStatus(itemName, nowOwned)}
/>
        </GTALayout>
    );
}