// src/components/VideoCard.jsx
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoCard({ imageSrc, videoSrc, altText, link, hoverClass = "hover:animate-wanted-siren hover:border-[#ff0033]" }) {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(link)}
      onMouseEnter={() => {
        if (videoRef.current) {
          videoRef.current.style.opacity = "1";
          videoRef.current.play();
        }
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.style.opacity = "0";
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className={`relative flex-1 w-full md:w-auto h-[300px] md:h-[450px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_6px_rgb(0,0,0)] ${hoverClass}`}
    >
      <img src={imageSrc} alt={altText} className="absolute top-0 left-0 w-full h-full object-cover z-10" />
      <video 
        ref={videoRef}
        src={videoSrc} 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-20 opacity-0 transition-opacity duration-300 pointer-events-none"
      />
    </div>
  );
}