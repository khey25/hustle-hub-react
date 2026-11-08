// src/pages/stardew/StardewLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StardewLayout({ title, bgVideo, children, onSearch }) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  // The reusable Stardew Gold glow class
  const stardewHover = "hover:border-[#f1b50d] hover:shadow-[0_0_20px_rgba(255,234,47,0.7),inset_0_0_10px_rgba(255,235,59,0.3)] hover:text-[#f1b50d]";

  return (
    // Removed bg-black from this main wrapper so it is transparent again
    <div className="min-h-screen text-white flex flex-col items-center p-5 relative overflow-x-hidden font-sans">
      
      {/* 1. The solid black backdrop at the very back */}
      <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-20 bg-black"></div>

      {/* 2. The semi-transparent video placed on top of the black backdrop */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        src={bgVideo}
        className="fixed top-0 left-0 w-[100vw] h-[100vh] object-cover -z-10 opacity-40"
      />

      {/* Header & Controls */}
      <header className="w-full text-center mt-10 mb-14 z-10">
        <h1 className="text-[2.2rem] md:text-[3.5rem] text-[#be70f1] mb-8 tracking-widest drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] font-bold">
          {title}
        </h1>
        <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto px-5">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="p-3 text-[1.2rem] w-full md:w-[350px] rounded-lg border-2 border-[#333] bg-[#222] text-white shadow-md focus:outline-none focus:border-white"
          />
          <button 
            onClick={() => setIsCategoriesOpen(true)} 
            className={`py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white border-2 border-transparent rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] transition-all duration-200 ${stardewHover} hover:bg-[#8a2be2]`}
          >
            Categories
          </button>
          <button 
            onClick={() => navigate('/')} 
            className={`py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white border-2 border-transparent rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] transition-all duration-200 ${stardewHover} hover:bg-[#8a2be2]`}
          >
            Home
          </button>
        </div>
      </header>

      {/* Dynamic Page Content */}
      <main className="w-full max-w-[1300px] z-10 flex flex-col items-center">
        {children}
      </main>

      {/* Categories Modal */}
      {isCategoriesOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000]" 
          onClick={(e) => { if (e.target === e.currentTarget) setIsCategoriesOpen(false) }}
        >
          <div className="bg-[#1a1a1a] p-10 rounded-xl border-2 border-[#be70f1] relative text-center w-[90%] md:w-[80%] max-w-[800px] animate-[modal-pop_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            <button onClick={() => setIsCategoriesOpen(false)} className="absolute top-4 right-5 text-white text-2xl cursor-pointer hover:text-gray-300">X</button>
            <h2 className="text-[2rem] text-white mb-6 font-bold pb-2 border-b-2 border-[#333]">SELECT A PATH</h2>
            
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {[
                { id: 'sd-home', name: 'Home', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/home.jpg?raw=true', path: '/stardew' },
                { id: 'crops', name: 'Crops', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/starfruit.jpg?raw=true', path: '/stardew/crops' },
                { id: 'artisan', name: 'Artisan', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/starfruitwine.jpg?raw=true', path: '/stardew/artisan' },
                { id: 'animals', name: 'Animals', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/stardew/stardewimages/truffle.jpg?raw=true', path: '/stardew/animals' }
              ].map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setIsCategoriesOpen(false); navigate(cat.path); }} 
                  className={`relative flex-1 h-[150px] md:h-[350px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 group shadow-[0_4px_6px_rgb(0,0,0)] ${stardewHover}`}
                >
                  <img src={cat.img} alt={cat.name} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />
                  <p className="relative z-10 text-[1.5rem] md:text-[2rem] font-bold text-white drop-shadow-[2px_2px_6px_#000] pointer-events-none m-0 px-4 group-hover:text-[#f1b50d] transition-colors">
                    {cat.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}