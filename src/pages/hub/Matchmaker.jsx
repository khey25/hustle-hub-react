import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailModal from '../../components/DetailModal';

const API_URL = "https://the-hustle-hub.vercel.app/api/v1";
const FETCH_OPTIONS = { headers: { "x-api-key": "hustle-hub-secret-key" } };

// Generalized questions array from your original vanilla JS
const questions = [
    {
        question: "Which universe are you stepping into today?",
        options: [
            { text: "GTA Online", key: "game", val: "gta", img: "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/gtaonline.jpg?raw=true" },
            { text: "Stardew Valley", key: "game", val: "stardew", img: "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/stardew.jpg?raw=true" }
        ]
    },
    {
        question: "What does your starting bank account look like?",
        options: [
            { text: "Absolutely Broke", key: "budget", val: 0 },
            { text: "Just getting started", key: "budget", val: 100000 },
            { text: "Comfortable", key: "budget", val: 1000000 },
            { text: "Filthy Rich", key: "budget", val: 99999999 }
        ]
    },
    {
        question: "Who are you bringing with you on this grind?",
        options: [
            { text: "I'm a strictly Lone Wolf", key: "solo", val: true },
            { text: "Just me and a buddy", key: "solo", val: false },
            { text: "A small, trusted crew", key: "solo", val: false },
            { text: "A massive syndicate", key: "solo", val: false }
        ]
    },
    {
        question: "How much actual effort do you want to put in?",
        options: [
            { text: "Zero effort. Fully AFK / Passive", key: "passive", val: true },
            { text: "Light maintenance", key: "passive", val: true },
            { text: "A steady, active grind.", key: "passive", val: false },
            { text: "Sweaty, intense, non-stop gameplay.", key: "passive", val: false }
        ]
    }
];

export default function Matchmaker() {
    const navigate = useNavigate();
    
    // State Management
    const [step, setStep] = useState('welcome'); // 'welcome' | 'quiz' | 'results' | 'loading'
    const [currentQ, setCurrentQ] = useState(0);
    const [prefs, setPrefs] = useState({ game: null, budget: null, solo: null, passive: null });
    const [results, setResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleStart = () => {
        setStep('quiz');
        setCurrentQ(0);
        setPrefs({ game: null, budget: null, solo: null, passive: null });
    };

    const handleOptionSelect = async (key, val) => {
        const updatedPrefs = { ...prefs, [key]: val };
        setPrefs(updatedPrefs);

        if (currentQ + 1 < questions.length) {
            setCurrentQ(currentQ + 1);
        } else {
            // Quiz finished, run algorithm
            setStep('loading');
            await calculateMatch(updatedPrefs);
        }
    };

    const calculateMatch = async (finalPrefs) => {
        try {
            let fetchUrls = [];
            if (finalPrefs.game === "gta") {
                fetchUrls = [`${API_URL}/gta/businesses`, `${API_URL}/gta/heists`, `${API_URL}/gta/contact`];
            } else if (finalPrefs.game === "stardew") {
                fetchUrls = [`${API_URL}/stardew/crops`, `${API_URL}/stardew/artisan_goods`, `${API_URL}/stardew/animal_products`];
            }

            const responses = await Promise.all(fetchUrls.map(url => fetch(url, FETCH_OPTIONS)));
            const dataSets = await Promise.all(responses.map(res => res.json()));

            let allItems = [];
            dataSets.forEach(category => {
                if (category) {
                    Object.values(category).forEach(tierArray => allItems.push(...tierArray));
                }
            });

            // The Weighted Algorithm
            let validItems = [];
            allItems.forEach(item => {
                if (item.setup_cost > finalPrefs.budget) return; // Hard Rule

                let score = 0;
                // Soft Rules
                if (finalPrefs.game === "gta") {
                    if (item.solo_friendly === finalPrefs.solo) score += 10;
                    if (item.is_passive === finalPrefs.passive) score += 10;
                } else if (finalPrefs.game === "stardew") {
                    if (finalPrefs.passive === true && item.daily_maintenance === false) score += 10;
                    if (finalPrefs.passive === false && item.daily_maintenance === true) score += 10;
                    if (finalPrefs.solo === true) score += 5; 
                }

                validItems.push({ ...item, matchScore: score });
            });

            validItems.sort((a, b) => b.matchScore - a.matchScore);
            setResults(validItems.slice(0, 3));
            setStep('results');
        } catch (error) {
            console.error("Matchmaker fetch error:", error);
            setResults([]);
            setStep('results');
        }
    };

    const currentQuestionData = questions[currentQ];
    const hasImages = currentQuestionData.options.some(opt => opt.img);

    // Carousel images array
    const carouselImages = [
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/gtaonline.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/stardew.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/warframe.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/minecraft.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/cyberpunk.jpg?raw=true",
        "https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/runescape.jpg?raw=true"
    ];

    return (
        <div className="min-h-screen text-white flex flex-col items-center p-5 relative overflow-x-hidden font-sans">
            
            {/* Golden Pulsating Background */}
            <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10 bg-[#0b0310] flex justify-center items-center overflow-hidden">
                <div className="w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(255, 235, 59, 0.25) 0%, rgba(255, 235, 59, 0) 70%)' }}></div>
            </div>

            <header className="w-full text-center mt-10 mb-5">
                <h1 className="text-[3.5rem] text-[#be70f1] font-bold tracking-widest drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mb-5">
                    THE HUSTLE MATCH
                </h1>
                <button 
                    onClick={() => navigate('/')} 
                    className="py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] hover:bg-[#8a2be2] transition-colors mx-auto block mb-10"
                >
                    Return to Hub
                </button>
            </header>

            {/* WELCOME / QUIZ CONTAINER */}
            {(step === 'welcome' || step === 'quiz') && (
                <main className="bg-[#1a1a1a]/80 backdrop-blur-md border-2 border-[#be70f1] rounded-xl p-[50px] w-[90%] max-w-[800px] text-center shadow-[0_0_20px_rgba(255,235,59,0.3)] transition-opacity duration-500">
                    <h2 className="text-[2.2rem] mb-[30px] text-[#eeeeee] font-bold">
                        {step === 'welcome' ? 'MATCH YOUR GRIND YE?' : currentQuestionData.question}
                    </h2>

                    <div className={`mt-[30px] ${step === 'quiz' && hasImages ? 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5' : 'flex flex-col gap-4'}`}>
                        {step === 'welcome' ? (
                            <button 
                                onClick={handleStart}
                                className="py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#222] text-[#be70f1] border-2 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#f1b50d] hover:text-[#f1b50d] hover:shadow-[0_0_15px_rgba(255,235,59,0.5)]"
                            >
                                Start Matchmaker
                            </button>
                        ) : (
                            currentQuestionData.options.map(opt => (
                                opt.img ? (
                                    <button 
                                        key={opt.text}
                                        onClick={() => handleOptionSelect(opt.key, opt.val)}
                                        className="relative h-[180px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#f1b50d] hover:shadow-[0_0_15px_rgba(255,235,59,0.5)] group p-0"
                                    >
                                        <img src={opt.img} alt={opt.text} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-80 z-0" />
                                        <span className="relative z-10 text-[1.5rem] font-bold text-white drop-shadow-[2px_2px_6px_#000]">
                                            {opt.text}
                                        </span>
                                    </button>
                                ) : (
                                    <button 
                                        key={opt.text}
                                        onClick={() => handleOptionSelect(opt.key, opt.val)}
                                        className="py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#222] text-[#be70f1] border-2 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#f1b50d] hover:text-[#f1b50d] hover:shadow-[0_0_15px_rgba(255,235,59,0.5)]"
                                    >
                                        {opt.text}
                                    </button>
                                )
                            ))
                        )}
                    </div>

                    {step === 'welcome' && (
                        <div className="w-full overflow-hidden mt-[50px] relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex gap-5 w-max animate-scroll-carousel">
                                {/* Map the images twice for the seamless infinite scroll loop */}
                                {[...carouselImages, ...carouselImages].map((src, i) => (
                                    <img 
                                        key={i} 
                                        src={src} 
                                        alt="Game preview" 
                                        className="w-[140px] h-[140px] object-cover rounded-xl border-2 border-[#be70f1] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-105 hover:border-[#f1b50d]" 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && currentQ > 0 && (
                        <button 
                            onClick={() => setCurrentQ(currentQ - 1)}
                            className="mt-[30px] py-[10px] px-[20px] text-[1rem] bg-transparent border-2 border-[#555] text-[#aaa] font-bold rounded-lg cursor-pointer transition-colors hover:text-white hover:border-[#777]"
                        >
                            &#8592; Go Back
                        </button>
                    )}
                </main>
            )}

            {/* LOADING STATE */}
            {step === 'loading' && (
                <main className="w-full max-w-[1200px] text-center animate-fade-in-up">
                    <h2 className="text-[2.2rem] text-[#eeeeee] font-bold">Fetching data...</h2>
                </main>
            )}

            {/* RESULTS CONTAINER */}
            {step === 'results' && (
                <main className="w-full max-w-[1200px] text-center animate-fade-in-up">
                    <h2 className="text-[2.2rem] mb-[30px] text-[#eeeeee] font-bold">Your Top Recommended Grinds</h2>
                    
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[25px] mt-[30px]">
                        {results.length > 0 ? (
                            results.map((item, index) => (
                                <div 
                                    key={item.name}
                                    onClick={() => setSelectedItem(item)}
                                    className="relative h-[180px] bg-[#1e1e1e] border-2 border-[#be70f1] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#f1b50d] shadow-[0_4px_6px_rgb(0,0,0)] hover:shadow-[0_0_20px_rgba(255,235,59,0.6),inset_0_0_10px_rgba(255,235,59,0.3)] opacity-0 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.15}s` }}
                                >
                                    <img src={item.image_url} alt={item.name} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 z-0 pointer-events-none" />
                                    <div className="relative z-10 text-center pointer-events-none">
                                        <p className="m-0 font-bold text-white text-[1.4rem] drop-shadow-[2px_2px_4px_#000]">{item.name}</p>
                                        <small className="text-[#4CAF50] text-[0.9rem] font-normal drop-shadow-[1px_1px_2px_#000]">Match Score: {item.matchScore}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xl text-gray-400 w-full text-center">You are too broke for anything in our database. Go collect bounties or chop some wood!</p>
                        )}
                    </div>

                    <button 
                        onClick={handleStart}
                        className="mt-[40px] py-[15px] px-[20px] text-[1.3rem] font-bold bg-[#be70f1] text-white rounded-lg cursor-pointer transition-colors hover:bg-[#8a2be2] shadow-[0_4px_6px_rgb(0,0,0)] inline-block"
                    >
                        Take Quiz Again
                    </button>
                </main>
            )}

            {/* Split Screen Pop-up Recycled from components! */}
            <DetailModal isOpen={!!selectedItem} data={selectedItem} onClose={() => setSelectedItem(null)} />

        </div>
    );
}