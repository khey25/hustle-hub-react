// src/components/ActionCard.jsx
export default function ActionCard({ item, onClick, hoverClass = "hover:animate-wanted-siren" }) {
  return (
    <div 
      onClick={() => onClick(item)}
      className={`relative h-[160px] bg-[#1e1e1e] border-2 border-[#be70f1] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_6px_rgb(0,0,0)] text-center p-2 group ${hoverClass}`}
    >
      <img 
        src={item.image_url} 
        alt={item.name} 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-50 z-0 pointer-events-none" 
      />
      <p className="relative z-10 m-0 font-bold text-white text-[1.2rem] drop-shadow-[2px_2px_4px_#000] pointer-events-none group-hover:text-[#f1b50d] transition-colors duration-200">
        {item.name}
      </p>
    </div>
  );
}