import { useState } from 'react';
import GTALayout from './GTALayout';
import VideoCard from '../../components/VideoCard';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

export default function GTAMenu() {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const backgrounds = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cayo.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/casino.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/dre.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/classic.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/fleeca.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/autoshop.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cluckin.jpg?raw=true"
    ];

    const handleSearch = async (searchTerm) => {
        const query = searchTerm.trim();
        
        // If search is cleared, restore the original video cards
        if (!query) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Fetch from all 3 APIs simultaneously!
            const [bizRes, contactRes, heistRes] = await Promise.all([
                fetch(`${API_URL}/gta/businesses/search?q=${query}`, FETCH_OPTIONS),
                fetch(`${API_URL}/gta/contact/search?q=${query}`, FETCH_OPTIONS),
                fetch(`${API_URL}/gta/heists/search?q=${query}`, FETCH_OPTIONS)
            ]);

            const bizData = await bizRes.json();
            const contactData = await contactRes.json();
            const heistData = await heistRes.json();

            // Flatten all the tiered dictionary data into one array
            let combined = [];
            if (bizData) Object.values(bizData).forEach(tier => combined.push(...tier));
            if (contactData) Object.values(contactData).forEach(tier => combined.push(...tier));
            if (heistData) Object.values(heistData).forEach(tier => combined.push(...tier));

            setSearchResults(combined);
        } catch (error) {
            console.error("Unified Search Error:", error);
        }
    };

    return (
        <GTALayout title={isSearching ? "SEARCH RESULTS" : "WELCOME TO LOS SANTOS"} backgrounds={backgrounds} onSearch={handleSearch}>
            
            <h2 className="text-[2.2rem] text-[#eeeeee] mb-[30px] font-bold text-center uppercase">
                {isSearching ? `Found ${searchResults.length} Methods` : "THESE ARE WHAT'S RUNNING THE STREETS"}
            </h2>
            
            {!isSearching ? (
                // DEFAULT STATE: Show the 3 Interactive Video Cards
                <div className="flex flex-col md:flex-row justify-between gap-[30px] w-full mt-[30px]">
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cayo.jpg?raw=true"
                        videoSrc="https://github.com/khey25/legaspi_prelimfastapi/raw/refs/heads/main/gta/gtavideo/cayo.mp4"
                        altText="Cayo Perico"
                        link="/gta/heists"
                    />
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/nightclub.jpg?raw=true"
                        videoSrc="https://github.com/khey25/legaspi_prelimfastapi/raw/refs/heads/main/gta/gtavideo/nightclub.mp4"
                        altText="Nightclub"
                        link="/gta/business"
                    />
                    <VideoCard 
                        imageSrc="https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/drug.jpg?raw=true"
                        videoSrc="https://github.com/khey25/legaspi_prelimfastapi/raw/refs/heads/main/gta/gtavideo/drug.mp4"
                        altText="Drug Wars"
                        link="/gta/contact"
                    />
                </div>
            ) : (
                // SEARCH STATE: Show the Grid of Action Cards
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] justify-center gap-5 w-full">
                    {searchResults.length > 0 ? (
                        searchResults.map(item => (
                            <ActionCard key={item.name} item={item} onClick={setSelectedItem} />
                        ))
                    ) : (
                        <p className="text-xl text-gray-400 mt-10 w-full text-center">No methods found. Try searching something else!</p>
                    )}
                </div>
            )}

            {/* Split Screen Pop-up for Search Results */}
            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </GTALayout>
    );
}