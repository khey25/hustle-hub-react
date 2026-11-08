import { useState } from 'react';
import { games, tools } from '../../gameData';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); 

  // Filter games based on search query
  const filteredGames = games.filter(game => 
    searchQuery === "" || game.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0310] text-white flex flex-col items-center p-5 relative overflow-x-hidden">
      
      {/* Background Effect */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 flex justify-center items-center pointer-events-none">
        <div className="w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(190, 112, 241, 0.25) 0%, rgba(190, 112, 241, 0) 70%)' }}></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-[1300px] text-center mt-10 mb-5">
        <h1 className="text-[3.5rem] md:text-[2.2rem] text-[#be70f1] tracking-widest font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mb-5">
          THE HUSTLE HUB
        </h1>
        
        <div className="flex justify-center gap-4 mb-14 flex-wrap">
          <input 
            type="text" 
            placeholder="Search for Games (e.g. GTA, Farming...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 text-[1.2rem] w-full max-w-[450px] rounded-lg border-2 border-[#333] bg-[#222] text-white shadow-md focus:outline-none focus:border-white"
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-6 text-[1.2rem] font-bold bg-[#be70f1] text-white rounded-lg shadow-md hover:bg-[#8a2be2] transition-colors"
          >
            Tools
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1300px] text-center">
        <h2 className="text-[2.2rem] text-[#eeeeee] mb-8 font-bold">SELECT YOUR GRIND</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-8 pb-14 w-full">
          {filteredGames.map(game => (
            <div 
              key={game.id}
              className="relative w-full h-[300px] md:h-[450px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(190,112,241,0.8),inset_0_0_15px_rgba(190,112,241,0.4)] group"
              onClick={() => navigate(game.link)} // Placeholder for actual navigation later
            >
              <img src={game.image} alt={game.title} className="absolute top-0 left-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <h2 className="relative z-10 text-[2.5rem] font-bold text-white drop-shadow-[2px_2px_8px_#000] pointer-events-none text-center px-4">
                {game.title}
              </h2>
            </div>
          ))}
        </div>
      </main>

      {/* Tools Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000]"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <div className="bg-[#1a1a1a] p-10 rounded-xl border-2 border-[#be70f1] relative text-center w-[90%] md:w-[80%] max-w-[800px] animate-[modal-pop_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-5 text-white text-2xl cursor-pointer hover:text-gray-300"
            >
              X
            </button>
            <h2 className="text-[2.2rem] text-white mb-6 font-bold">SELECT A TOOL</h2>
            
            <div className="flex flex-col md:grid md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6">
              {tools.map(tool => (
                 <div 
                  key={tool.id}
                  className="relative w-full h-[150px] md:h-[350px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(190,112,241,0.8),inset_0_0_15px_rgba(190,112,241,0.4)] group"
                  onClick={() => navigate(tool.link)} // Placeholder for actual navigation later
                 >
                   <img src={tool.image} alt={tool.title} className="absolute top-0 left-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />
                   <p className="relative z-10 text-[2rem] font-bold text-[#be70f1] drop-shadow-[2px_2px_6px_#000] pointer-events-none m-0 px-4">
                     {tool.title}
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

export default App;