import { useState, useEffect } from 'react';
import { supabase, deleteRecord, updateRecord } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

export default function DetailModal({ isOpen, onClose, data }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const location = useLocation();

  // 1. Check if the current user is an Admin
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false); // Reset edit mode when closed
      return;
    }
    
    setEditFormData(data); // Pre-fill edit form with current data

    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }
    };
    checkRole();
  }, [isOpen, data]);

  // If the modal is closed or there is no data to show, render nothing
  if (!isOpen || !data) return null;

  // 2. Helper to figure out which table we are currently looking at based on the URL
  const getCurrentTable = () => {
    const path = location.pathname;
    if (path.includes('/gta/business')) return 'gta_businesses';
    if (path.includes('/gta/heists')) return 'gta_heists';
    if (path.includes('/gta/contact')) return 'gta_contact';
    if (path.includes('/stardew/crops')) return 'stardew_crops';
    if (path.includes('/stardew/artisan')) return 'stardew_artisan_goods';
    if (path.includes('/stardew/animals')) return 'stardew_animal_products';
    return null;
  };

  // 3. Delete Logic (With Confirmation)
  const handleDelete = async () => {
    const table = getCurrentTable();
    if (!table) return alert("Cannot determine table for deletion from this page.");

    if (window.confirm(`Are you absolutely sure you want to delete ${data.name}?`)) {
      try {
        await deleteRecord(table, 'name', data.name);
        alert(`${data.name} deleted successfully! Refresh the page to see changes.`);
        onClose();
      } catch (error) {
        alert(`Delete failed: ${error.message}`);
      }
    }
  };

  // 4. Edit Logic
  const handleEditChange = (key, value) => {
    // Attempt to cast to number if it looks like one, otherwise keep as string
    const isNum = !isNaN(value) && value.trim() !== '';
    setEditFormData(prev => ({
      ...prev,
      [key]: isNum ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    const table = getCurrentTable();
    if (!table) return alert("Cannot determine table for updating from this page.");

    try {
      // Remove 'name' from updates since it's the primary key we are using to identify the row
      const updates = { ...editFormData };
      delete updates.name; 

      await updateRecord(table, 'name', data.name, updates);
      alert(`${data.name} updated successfully! Refresh the page to see changes.`);
      setIsEditing(false);
      onClose();
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-[#777] overflow-hidden relative text-center w-[90%] max-w-[1000px] animate-[modal-pop_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 text-white text-2xl cursor-pointer z-20 hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center border-none"
        >
          X
        </button>
        
        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
          
          <div className="flex-1 md:flex-[1.2] bg-[#222] border-b-2 md:border-b-0 md:border-r-2 border-[#333] min-h-[250px] relative">
            <img 
              src={data.image_url} 
              alt={data.name} 
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 bg-black text-[#ddd] p-[25px] md:p-10 text-left overflow-y-auto flex flex-col">
            <h3 className="text-white text-[2rem] mt-0 mb-[15px] font-bold">
              {data.name}
            </h3>
            
            <div className="space-y-4 flex-grow">
              {Object.entries(data).map(([key, value]) => {
                if (key === 'name' || key === 'image_url') return null;

                const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');

                // NORMAL VIEW
                if (!isEditing) {
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
                }

                // EDITING VIEW
                return (
                  <div key={key} className="flex flex-col mb-2">
                    <label className="text-[#FFEB3B] text-[0.9rem] mb-1 font-semibold">{formattedKey}</label>
                    <input 
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={editFormData[key] !== undefined ? editFormData[key] : ''}
                      onChange={(e) => handleEditChange(key, e.target.value)}
                      className="bg-[#222] border border-[#555] rounded px-2 py-1 text-white outline-none focus:border-[#4CAF50]"
                    />
                  </div>
                );
              })}
            </div>

            {/* ADMIN ONLY CONTROLS */}
            {isAdmin && (
              <div className="mt-8 pt-4 border-t border-[#333] flex justify-between gap-4">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-transparent border-2 border-[#555] text-gray-300 font-bold rounded hover:bg-[#333] cursor-pointer">
                      CANCEL
                    </button>
                    <button onClick={handleSave} className="flex-1 py-2 bg-[#4CAF50] text-white font-bold rounded shadow-[0_0_10px_rgba(76,175,80,0.5)] hover:bg-[#388E3C] border-none cursor-pointer">
                      SAVE CHANGES
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 py-2 bg-transparent border-2 border-[#FFEB3B] text-[#FFEB3B] font-bold rounded hover:bg-[#FFEB3B] hover:text-black transition-colors cursor-pointer">
                      EDIT
                    </button>
                    <button onClick={handleDelete} className="flex-1 py-2 bg-transparent border-2 border-[#F44336] text-[#F44336] font-bold rounded hover:bg-[#F44336] hover:text-white transition-colors cursor-pointer">
                      DELETE
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}