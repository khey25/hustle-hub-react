import { useState } from 'react';
import StardewLayout from './StardewLayout';
import VideoCard from '../../components/VideoCard';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';
import { fetchTieredData } from '../../supabaseClient';

export default function StardewMenu() {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const bgVideo = "https://github.com/khey25/legaspi_prelimfastapi/raw/refs/heads/main/stardew/stardewvideo/stardewmenu.mp4";

    const handleSearch = async (searchTerm) => {
        const query = searchTerm.trim();
        
        if (!query) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Concurrently fetch from all 3 Stardew APIs
            const [cropsData, artisanData, animalData] = await Promise.all([
                fetchTieredData('stardew_crops', query),
                fetchTieredData('stardew_artisan_goods', query),
                fetchTieredData('stardew_animal_products', query)
            ]);

            let combined = [];
            if (cropsData) Object.values(cropsData).forEach(tier => combined.push(...tier));
            if (artisanData) Object.values(artisanData).forEach(tier => combined.push(...tier));
            if (animalData) Object.values(animalData).forEach(tier => combined.push(...tier));

            setSearchResults(combined);
        } catch (error) {
            console.error("Unified Search Error:", error);
        }
    };

    return (
        <StardewLayout title={isSearching ? "SEARCH RESULTS" : "WELCOME TO PELICAN TOWN"} bgVideo={bgVideo} onSearch={handleSearch}>
            
            <h2 className="text-[2.2rem] text-[#eeeeee] mb-[30px] font-bold text-center uppercase">
                {isSearching ? `Found ${searchResults.length} Results` : "HIGHLY DEMANDED PRODUCTS"}
            </h2>
            
            {!isSearching ? (
                <div className="flex flex-col md:flex-row justify-between gap-[30px] w-full mt-[30px]">
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/starfruit.jpg?raw=true"
                        videoSrc=""
                        altText="Crops"
                        link="/stardew/crops"
                        hoverClass="hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)]"
                    />
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/starfruitwine.jpg?raw=true"
                        videoSrc=""
                        altText="Artisan Goods"
                        link="/stardew/artisan"
                        hoverClass="hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)]"
                    />
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/truffle.jpg?raw=true"
                        videoSrc=""
                        altText="Animal Products"
                        link="/stardew/animals"
                        hoverClass="hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)]"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] justify-center gap-5 w-full">
                    {searchResults.length > 0 ? (
                        searchResults.map(item => (
                            <ActionCard 
                                key={item.name} 
                                item={item} 
                                onClick={setSelectedItem} 
                                hoverClass="hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)] hover:text-[#f1b50d]" 
                            />
                        ))
                    ) : (
                        <p className="text-xl text-gray-400 mt-10 w-full text-center">No products found.</p>
                    )}
                </div>
            )}

            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </StardewLayout>
    );
}