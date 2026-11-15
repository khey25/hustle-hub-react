import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MdAdd, MdArrowBack } from 'react-icons/md';
import { createRecord } from '../supabaseClient';

export default function AdminControls({ userRole }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
  const location = useLocation();

  // If they aren't an admin, render absolutely nothing
  if (userRole !== 'admin') return null;

  // Determine the current table based on the URL
  let currentTable = null;
  let formFields = [];
  
  const path = location.pathname;
  if (path === '/gta/business') {
    currentTable = 'gta_businesses';
    formFields = ['name', 'property', 'tier', 'setup_cost', 'is_passive', 'max_payout', 'cooldown_minutes', 'image_url'];
  } else if (path === '/gta/heists') {
    currentTable = 'gta_heists';
    formFields = ['name', 'property', 'tier', 'setup_cost', 'is_passive', 'max_payout', 'cooldown_minutes', 'image_url'];
  } else if (path === '/stardew/crops') {
    currentTable = 'stardew_crops';
    formFields = ['name', 'tier', 'setup_cost', 'base_payout', 'processing_days', 'is_repeatable', 'image_url'];
  }
  // Add other tables based on your routes...

  // If the admin is on the Hub or a page without a direct table, hide the add button
  if (!currentTable) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecord(currentTable, formData);
      alert('Success! Record added to the database. Refresh to see it.');
      setShowAddModal(false);
      setFormData({});
    } catch (error) {
      alert(`Error creating record: ${error.message}`);
    }
  };

  const handleInputChange = (e, field) => {
    // If the input looks like a number, cast it so Supabase doesn't reject it
    const value = e.target.value;
    const isNum = !isNaN(value) && value.trim() !== '';
    setFormData({ ...formData, [field]: isNum ? Number(value) : value });
  };

  return (
    <>
      {/* Floating Add Button */}
      {!showAddModal && (
        <div className="fixed bottom-8 right-8 z-40">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="p-4 bg-[#4CAF50] text-white rounded-full shadow-[0_0_15px_rgba(76,175,80,0.6)] hover:bg-[#388E3C] hover:scale-110 transition-all flex items-center justify-center cursor-pointer border-none"
            title="Add New Method"
          >
            <MdAdd size={32} />
          </button>
        </div>
      )}

      {/* Add Record Modal (Modeled after ALAM's Add Form) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#1a1a1a] border-2 border-[#be70f1] w-full max-w-md rounded-[2rem] p-8 relative shadow-[0_0_20px_rgba(190,112,241,0.3)] mx-4 h-[80vh] overflow-y-auto text-left">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-white hover:text-gray-400 transition-colors bg-transparent border-none cursor-pointer">
              <MdArrowBack size={28} />
            </button>
            <div className="h-8"></div>
            
            <h2 className="text-[1.8rem] font-bold text-[#be70f1] mb-6 text-center">ADD NEW RECORD</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">Target Table: {currentTable}</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-white">
              {formFields.map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-1 capitalize">{field.replace('_', ' ')}</label>
                  <input 
                    type={field.includes('cost') || field.includes('payout') || field.includes('minutes') ? 'number' : 'text'}
                    required 
                    onChange={(e) => handleInputChange(e, field)}
                    className="w-full bg-[#222] border-2 border-[#555] rounded-xl px-3 py-2 outline-none focus:border-[#4CAF50] transition-colors text-white" 
                  />
                </div>
              ))}
              
              <div className="pt-4 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#4CAF50] text-white font-bold text-xl rounded-2xl shadow-md hover:bg-[#388E3C] transition-all border-none cursor-pointer">
                  PUBLISH RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}