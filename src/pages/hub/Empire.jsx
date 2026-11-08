import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

export default function Empire() {
    const navigate = useNavigate();
    
    // State Management
    const [step, setStep] = useState('welcome'); // 'welcome' | 'select-game' | 'select-goal' | 'bank-input' | 'loading' | 'results'
    const [selectedGame, setSelectedGame] = useState("");
    const [goalsData, setGoalsData] = useState({});
    const [targetGoal, setTargetGoal] = useState(null);
    const [currentBank, setCurrentBank] = useState("");
    
    const [results, setResults] = useState([]);
    const [shortfallMsg, setShortfallMsg] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const handleBack = () => {
        if (step === 'select-game') setStep('welcome');
        if (step === 'select-goal') setStep('select-game');
        if (step === 'bank-input') setStep('select-goal');
    };

    // --- STEP 2: FETCH GOALS ---
    const fetchAndCategorizeGoals = async (gameId) => {
        setSelectedGame(gameId);
        setStep('loading');
        try {
            const response = await fetch(`${API_URL}/${gameId}/goals`, FETCH_OPTIONS);
            const goals = await response.json();
            
            let categorized = {};
            if (gameId === "gta") {
                categorized = { "Businesses": [], "Heists": [], "Contact": [] };
                goals.forEach(goal => {
                    const keys = goal.keywords.toLowerCase();
                    if (keys.includes('agency') || keys.includes('payphone')) {
                        categorized["Contact"].push(goal);
                    } else if (keys.includes('heist') || keys.includes('arcade') || keys.includes('kosatka') || keys.includes('facility') || keys.includes('salvage') || keys.includes('auto shop') || keys.includes('apartment')) {
                        categorized["Heists"].push(goal);
                    } else {
                        categorized["Businesses"].push(goal); 
                    }
                });
            } else {
                categorized = { "Properties & Upgrades": goals }; 
            }
            setGoalsData(categorized);
            setStep('select-goal');
        } catch (error) {
            console.error("Failed to load goals:", error);
            setStep('select-game'); // fallback on fail
        }
    };

    // --- STEP 4: CALCULATE THE GRIND PLAN ---
    const calculateEmpirePlan = async () => {
        const bankValue = parseFloat(currentBank) || 0;
        const shortfall = targetGoal.cost - bankValue;

        setStep('loading');

        if (shortfall <= 0 && targetGoal.cost > 0) {
            setShortfallMsg(`You already have enough money for the ${targetGoal.name}! Go buy it!`);
            setResults([]);
            setStep('results');
            return;
        }

        setShortfallMsg(`Shortfall for ${targetGoal.name}: $${shortfall.toLocaleString()}`);

        try {
            let fetchUrls = [];
            if (selectedGame === "gta") {
                fetchUrls = [`${API_URL}/gta/businesses`, `${API_URL}/gta/heists`, `${API_URL}/gta/contact`];
            } else if (selectedGame === "stardew") {
                fetchUrls = [`${API_URL}/stardew/crops`, `${API_URL}/stardew/artisan_goods`, `${API_URL}/stardew/animal_products`];
            }

            const responses = await Promise.all(fetchUrls.map(url => fetch(url, FETCH_OPTIONS)));
            const dataSets = await Promise.all(responses.map(res => res.json()));

            let allItems = [];
            dataSets.forEach(category => {
                if(category) Object.values(category).forEach(tierArray => allItems.push(...tierArray));
            });

            let viablePlans = [];
            allItems.forEach(item => {
                const profitPerRun = item.max_payout - item.setup_cost;
                if (profitPerRun > 0) {
                    const runsNeeded = Math.ceil(shortfall / profitPerRun);
                    let downtimeString = "";
                    let sortMetric = 0;

                    if (selectedGame === "gta") {
                        const totalMinutes = runsNeeded * (item.cooldown_minutes || 0);
                        downtimeString = `Total Cooldown: ${totalMinutes} min`;
                        sortMetric = runsNeeded; 
                    } else if (selectedGame === "stardew") {
                        const totalDays = runsNeeded * (item.processing_days || 1);
                        downtimeString = `Total Time: ${totalDays} in-game days`;
                        sortMetric = totalDays; 
                    }

                    viablePlans.push({
                        ...item,
                        runs: runsNeeded,
                        downtimeLabel: downtimeString,
                        sortMetric: sortMetric
                    });
                }
            });

            viablePlans.sort((a, b) => a.sortMetric - b.sortMetric);
            setResults(viablePlans.slice(0, 9)); // Top 9 methods
            setStep('results');
        } catch (error) {
            console.error("Empire Builder fetch error:", error);
            setResults([]);
            setShortfallMsg("Failed to connect to the central database.");
            setStep('results');
        }
    };

    // Carousel Image Data
    const carouselImages = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cayo.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/goldclock.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/nightclub.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/obelisk.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/casino.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/starfruitwine.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/doomsday.jpg?raw=true"
    ];

    return (
        <div className="min-h-screen text-white flex flex-col items-center p-5 relative overflow-x-hidden font-sans">
            
            {/* Green Pulsating Background */}
            <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10 bg-[#0b0310] flex justify-center items-center overflow-hidden">
                <div className="w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0) 70%)' }}></div>
            </div>

            <header className="w-full text-center mt-10 mb-5">
                <h1 className="text-[3.5rem] text-[#be70f1] font-bold tracking-widest drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mb-5">
                    THE HUSTLE EMPIRE
                </h1>
                <button 
                    onClick={() => navigate('/')} 
                    className="py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] hover:bg-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)] transition-all duration-200 mx-auto block mb-10"
                >
                    Return to Hub
                </button>
            </header>

            {/* MAIN INTERACTIVE CONTAINER */}
            {(step !== 'loading' && step !== 'results') && (
                <main className="bg-[#1a1a1a]/80 backdrop-blur-md border-2 border-[#be70f1] rounded-xl p-[50px] w-[90%] max-w-[800px] text-center shadow-[0_0_20px_rgba(190,112,241,0.3)] transition-opacity duration-500">
                    
                    {/* Dynamic Titles */}
                    <h2 className="text-[2.2rem] mb-[30px] text-[#eeeeee] font-bold">
                        {step === 'welcome' && "FROM THE BOTTOM TO THE TOP"}
                        {step === 'select-game' && "What game will it be playa?"}
                        {step === 'select-goal' && "What is your target property?"}
                        {step === 'bank-input' && targetGoal && `Bank Check: ${targetGoal.name} ($${targetGoal.cost.toLocaleString()})`}
                    </h2>

                    {/* Step 0: Welcome Screen */}
                    {step === 'welcome' && (
                        <div className="flex flex-col gap-4 mt-[30px]">
                            <button 
                                onClick={() => setStep('select-game')}
                                className="py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#222] text-[#be70f1] border-2 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] hover:text-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)]"
                            >
                                Build Your Empire
                            </button>
                        </div>
                    )}

                    {/* Step 1: Select Game */}
                    {step === 'select-game' && (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mt-[30px]">
                            <button onClick={() => fetchAndCategorizeGoals("gta")} className="relative h-[180px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)] group p-0">
                                <img src="https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/gtaonline.jpg?raw=true" alt="GTA Online" className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-80 z-0" />
                                <span className="relative z-10 text-[1.5rem] font-bold text-white drop-shadow-[2px_2px_6px_#000]">GTA Online</span>
                            </button>
                            <button onClick={() => fetchAndCategorizeGoals("stardew")} className="relative h-[180px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)] group p-0">
                                <img src="https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/stardew.jpg?raw=true" alt="Stardew Valley" className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-80 z-0" />
                                <span className="relative z-10 text-[1.5rem] font-bold text-white drop-shadow-[2px_2px_6px_#000]">Stardew Valley</span>
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Goal from Database */}
                    {step === 'select-goal' && (
                        <div className="flex flex-col mt-[30px]">
                            {Object.entries(goalsData).map(([category, items]) => (
                                items.length > 0 && (
                                    <div key={category}>
                                        <h3 className="text-[1.5rem] text-[#be70f1] text-left border-b-2 border-[#be70f1] pb-[5px] mt-[25px] mb-[15px] font-bold">{category}</h3>
                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                                            {items.map(item => (
                                                <button 
                                                    key={item.name} 
                                                    onClick={() => { setTargetGoal(item); setStep('bank-input'); setCurrentBank(""); }}
                                                    className="relative h-[180px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)] group p-0"
                                                >
                                                    <img src={item.image_url} alt={item.name} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-80 z-0" />
                                                    <div className="relative z-10 text-center text-shadow-[2px_2px_6px_#000]">
                                                        <span className="block text-[1.3rem] font-bold text-white">{item.name}</span>
                                                        <span className="block text-[#4CAF50] text-[1.1rem] mt-[5px]">${item.cost.toLocaleString()}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {/* Step 3: Enter Bank Balance */}
                    {step === 'bank-input' && (
                        <div className="flex flex-col gap-4 mt-[30px]">
                            <input 
                                type="number" 
                                value={currentBank}
                                onChange={(e) => setCurrentBank(e.target.value)}
                                className="p-[15px] text-[1.2rem] bg-[#111] text-white border-2 border-[#555] rounded-lg w-full box-border transition-colors duration-300 focus:outline-none focus:border-[#4CAF50] hover:border-[#4CAF50]" 
                                placeholder="Current Bank Balance (e.g. 500000)" 
                            />
                            <button 
                                onClick={calculateEmpirePlan}
                                className="mt-[15px] py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#222] text-[#be70f1] border-2 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] hover:text-[#4CAF50] hover:shadow-[0_0_15px_rgba(76,175,80,0.5)]"
                            >
                                Calculate Grind Plan
                            </button>
                        </div>
                    )}

                    {/* Shared "Go Back" logic for intermediate steps */}
                    {step !== 'welcome' && (
                        <button 
                            onClick={handleBack}
                            className="mt-[30px] py-[10px] px-[20px] text-[1rem] bg-transparent border-2 border-[#555] text-[#aaa] font-bold rounded-lg cursor-pointer transition-colors hover:text-white hover:border-[#777]"
                        >
                            &#8592; Go Back
                        </button>
                    )}

                    {/* Infinite Carousel (Only on Welcome Screen) */}
                    {step === 'welcome' && (
                        <div className="w-full overflow-hidden mt-[50px] relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex gap-5 w-max animate-scroll-carousel">
                                {[...carouselImages, ...carouselImages].map((src, i) => (
                                    <img 
                                        key={i} src={src} alt="Empire preview" 
                                        className="w-[140px] h-[140px] object-cover rounded-xl border-2 border-[#be70f1] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-105 hover:border-[#4CAF50]" 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* LOADING STATE */}
            {step === 'loading' && (
                <main className="w-full max-w-[1200px] text-center animate-fade-in-up">
                    <h2 className="text-[2.2rem] text-[#eeeeee] font-bold">Accessing secure database...</h2>
                </main>
            )}

            {/* RESULTS CONTAINER */}
            {step === 'results' && (
                <main className="w-full max-w-[1200px] text-center animate-fade-in-up">
                    <h2 className="text-[2.2rem] mb-[10px] text-[#eeeeee] font-bold">Your Custom Grind Plan</h2>
                    <h3 className="text-[#4CAF50] text-[1.5rem] mb-[30px] font-bold">{shortfallMsg}</h3>
                    
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[25px] mt-[30px]">
                        {results.length > 0 ? (
                            results.map((item, index) => (
                                <div 
                                    key={item.name}
                                    onClick={() => setSelectedItem(item)}
                                    className="relative h-[200px] bg-[#1e1e1e] border-2 border-[#be70f1] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#4CAF50] shadow-[0_4px_6px_rgb(0,0,0)] hover:shadow-[0_0_20px_rgba(76,175,80,0.6),inset_0_0_10px_rgba(76,175,80,0.3)] opacity-0 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <img src={item.image_url} alt={item.name} className="absolute top-0 left-0 w-full h-full object-cover opacity-30 z-0 pointer-events-none" />
                                    <div className="relative z-10 w-full p-[10px] text-center pointer-events-none">
                                        <p className="m-0 mb-[10px] text-[1.6rem] font-bold text-white drop-shadow-[2px_2px_4px_#000]">{item.name}</p>
                                        <div className="bg-black/70 rounded-lg p-[10px] inline-block">
                                            <p className="m-0 text-[#be70f1] font-bold">Runs Needed: {item.runs.toLocaleString()}</p>
                                            <p className="mt-[5px] mb-0 text-[#4CAF50] text-[1rem]">{item.downtimeLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xl text-gray-400 w-full text-center">No profitable methods found in the database to reach this goal.</p>
                        )}
                    </div>

                    <button 
                        onClick={() => { setStep('welcome'); setCurrentBank(""); }}
                        className="mt-[40px] py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#be70f1] text-white rounded-lg cursor-pointer transition-colors hover:bg-[#222] shadow-[0_4px_6px_rgb(0,0,0)] inline-block border-none"
                    >
                        Calculate Another Goal
                    </button>
                </main>
            )}

            {/* Split Screen Details Pop-up (Recycled) */}
            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </div>
    );
}