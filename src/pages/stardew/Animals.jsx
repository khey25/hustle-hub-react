import { useState, useEffect } from 'react';
import StardewLayout from './StardewLayout';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';
import { fetchTieredData } from '../../supabaseClient';
import { useOwnedAssets } from '../../hooks/useOwnedAssets';
import { useBookmarks } from '../../hooks/useBookmarks';

const stardewHover = "hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)] hover:text-[#f1b50d]";
const bgVideo = "https://github.com/khey25/legaspi_prelimfastapi/raw/refs/heads/main/stardew/stardewvideo/stardewfarm.mp4";

export default function Animals({ session, userRole }) {
    const [data, setData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const { isBookmarked, handleToggleBookmark } = useBookmarks(session, 'stardew_animal_products');
    const { isOwned, setOwnedStatus } = useOwnedAssets(session, 'stardew_animal_products');
    useEffect(() => {
        fetchTieredData('stardew_animal_products')
            .then(groupedData => setData(groupedData))
            .catch(err => console.error("API Error:", err));
    }, []);

    const handleSearch = (searchTerm) => {
        fetchTieredData('stardew_animal_products', searchTerm)
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
        <StardewLayout title="Barns, Coops, and Livestock" bgVideo={bgVideo} onSearch={handleSearch}>
            {data ? (
                <>
                    {renderTier("Joja-Level Profits", data["Joja-Level Profits"], "text-[#4CAF50] animate-pulse-green")}
                    {renderTier("Honest Honest Work", data["Honest Honest Work"], "text-[#FFEB3B] animate-pulse-yellow [animation-delay:0.5s]")}
                    {renderTier("Literally Just For Fun", data["Literally Just For Fun"], "text-[#F44336] animate-pulse-red [animation-delay:1s]")}
                </>
            ) : (
                <p className="text-xl text-gray-400 mt-10">Loading animal products...</p>
            )}
            <DetailModal
    isOpen={!!selectedItem}
    data={selectedItem}
    onClose={() => setSelectedItem(null)}
    session={session}
    userRole={userRole}
    onOwnedChange={(_table, itemName, nowOwned) => setOwnedStatus(itemName, nowOwned)}
/>
        </StardewLayout>
    );
}