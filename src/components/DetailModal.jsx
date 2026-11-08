export default function DetailModal({ isOpen, onClose, data }) {
  // If the modal is closed or there is no data to show, render absolutely nothing
  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-[#777] overflow-hidden relative text-center w-[90%] max-w-[1000px] animate-[modal-pop_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 text-white text-2xl cursor-pointer z-20 hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
        >
          X
        </button>
        
        {/* Split Screen Container */}
        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
          
          {/* Left: Image Box */}
          <div className="flex-1 md:flex-[1.2] bg-[#222] border-b-2 md:border-b-0 md:border-r-2 border-[#333] min-h-[250px] relative">
            <img 
              src={data.image_url} 
              alt={data.name} 
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          
          {/* Right: Black Info Panel */}
          <div className="flex-1 bg-black text-[#ddd] p-[25px] md:p-10 text-left overflow-y-auto">
            <h3 className="text-white text-[2rem] mt-0 mb-[15px] font-bold">
              {data.name}
            </h3>
            
            <div className="space-y-4">
              {Object.entries(data).map(([key, value]) => {
                // Skip the name and image since they are already displayed
                if (key === 'name' || key === 'image_url') return null;

                // Format the database key (e.g., "setup_cost" -> "Setup Cost")
                const formattedKey = key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.substring(1))
                  .join(' ');

                // Format the value based on its type
                let formattedValue = value;
                let valueStyle = "text-white";

                if (typeof value === 'boolean') {
                  formattedValue = value ? "Yes" : "No";
                  valueStyle = value ? "text-[#4CAF50] font-bold" : "text-[#F44336] font-bold";
                } else if (typeof value === 'number' && (key.includes('cost') || key.includes('payout') || key.includes('base'))) {
                  formattedValue = `$${value.toLocaleString()}`;
                  valueStyle = "text-[#4CAF50] font-bold";
                }

                return (
                  <div key={key} className="text-[1.1rem]">
                    <span className="text-[#FFEB3B] font-semibold">{formattedKey}:</span>{' '}
                    <span className={valueStyle}>{formattedValue}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}