import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GTALayout({ title, backgrounds, children, onSearch }) {
  const [currentBg, setCurrentBg] = useState(0);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  // Background Slider Logic
  useEffect(() => {
    if (!backgrounds || backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-5 relative overflow-x-hidden font-sans">
      
      {/* Background Slider */}
      <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10 bg-[#121212] overflow-hidden">
        {backgrounds.map((src, index) => (
          <div
            key={src}
            className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-35 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url('${src}')` }}
          ></div>
        ))}
      </div>

      {/* Header & Controls */}
      <header className="w-full text-center mt-10 mb-14 z-10">
        <h1 className="text-[2.2rem] md:text-[3.5rem] text-[#be70f1] mb-8 tracking-widest drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] font-bold uppercase">
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
            className="py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] hover:bg-[#8a2be2] transition-colors"
          >
            Categories
          </button>
          <button 
            onClick={() => navigate('/hub')} 
            className="py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white rounded-lg shadow-[0_4px_6px_rgb(0,0,0)] hover:bg-[#8a2be2] transition-colors"
          >
            Home
          </button>
        </div>
      </header>

      {/* Unique Page Content gets injected right here! */}
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
                { id: 'gta-home', name: 'GTA Home', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/home.jpg?raw=true', path: '/gta' },
                { id: 'biz', name: 'Business', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/nightclub.jpg?raw=true', path: '/gta/business' },
                { id: 'heists', name: 'Heists', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/cayo.jpg?raw=true', path: '/gta/heists' },
                { id: 'contact', name: 'Contact', img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/gta/gtaimages/drug.jpg?raw=true', path: '/gta/contact' }
              ].map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setIsCategoriesOpen(false); navigate(cat.path); }} 
                  // Right here: we added hover:animate-wanted-siren
                  className="relative flex-1 h-[150px] md:h-[350px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105 hover:animate-wanted-siren group shadow-[0_4px_6px_rgb(0,0,0)]"
                >
                  <img src={cat.img} alt={cat.name} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />
                  <p className="relative z-10 text-[1.5rem] md:text-[2rem] font-bold text-[#be70f1] drop-shadow-[2px_2px_6px_#000] pointer-events-none m-0 px-4">
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