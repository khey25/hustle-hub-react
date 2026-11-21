// src/components/ActionCard.jsx
import { MdStar, MdStarBorder, MdCheckCircle } from 'react-icons/md';

export default function ActionCard({
  item,
  onClick,
  hoverClass = "hover:animate-wanted-siren",
  isBookmarked = false,
  onToggleBookmark = null,
  isOwned = false,
}) {
  const handleStarClick = (e) => {
    e.stopPropagation(); // Prevents opening DetailModal when toggling bookmark
    onToggleBookmark();
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className={`relative h-[160px] bg-[#1e1e1e] border-2 ${
        isOwned ? 'border-[#4CAF50]' : 'border-[#be70f1]'
      } rounded-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_6px_rgb(0,0,0)] text-center p-2 group ${hoverClass}`}
    >
      <img 
        src={item.image_url} 
        alt={item.name} 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-50 z-0 pointer-events-none" 
      />

      {isOwned && (
        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/75 border border-[#4CAF50] text-[#4CAF50] text-[0.7rem] font-bold uppercase tracking-wider flex items-center gap-1 pointer-events-none shadow-[0_0_8px_rgba(76,175,80,0.5)]">
          <MdCheckCircle size={14} />
          Owned
        </span>
      )}

      {onToggleBookmark && (
        <button
          type="button"
          onClick={handleStarClick}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this method"}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
        >
          {isBookmarked ? (
            <MdStar size={24} className="text-[#f1b50d] drop-shadow-[0_0_6px_rgba(241,181,13,0.8)]" />
          ) : (
            <MdStarBorder size={24} className="text-gray-300 hover:text-[#f1b50d]" />
          )}
        </button>
      )}

      <p className="relative z-10 m-0 font-bold text-white text-[1.2rem] drop-shadow-[2px_2px_4px_#000] pointer-events-none group-hover:text-[#f1b50d] transition-colors duration-200 px-3">
        {item.name}
      </p>
    </div>
  );
}