import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';

import Home from './pages/hub/Home';
import Matchmaker from './pages/hub/Matchmaker';
import Empire from './pages/hub/Empire'; 

// GTA Routes
import GTAMenu from './pages/gta/GTAMenu';
import Business from './pages/gta/Business';
import Heists from './pages/gta/Heists';
import Contact from './pages/gta/Contact';

// Stardew Routes
import StardewMenu from './pages/stardew/StardewMenu';
import Crops from './pages/stardew/Crops';
import Artisan from './pages/stardew/Artisan';
import Animals from './pages/stardew/Animals';

import Login from './pages/hub/Login';
import AdminControls from './components/AdminControls';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchRole(session.user.id);
      else setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setUserRole('guest');
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data.role || 'user');
    } catch (error) {
      console.error('Error fetching role:', error);
      setUserRole('user');
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0b0310] text-[#be70f1] flex justify-center items-center font-bold text-[2rem] animate-pulse-glow">
        Connecting to Secure Server...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 1. Login is now the default landing page */}
        <Route path="/" element={<Login/>} />
        
        {/* 2. The Hub is moved to /hub */}
        <Route path="/hub" element={<Home session={session} userRole={userRole} />} />

        <Route path="/matchmaker" element={<Matchmaker />} />
        <Route path="/empire" element={<Empire />} />
        
        <Route path="/gta" element={<GTAMenu />} />
        <Route path="/gta/business" element={<Business />} />
        <Route path="/gta/heists" element={<Heists />} />
        <Route path="/gta/contact" element={<Contact />} />

        <Route path="/stardew" element={<StardewMenu />} />
        <Route path="/stardew/crops" element={<Crops />} />
        <Route path="/stardew/artisan" element={<Artisan />} />
        <Route path="/stardew/animals" element={<Animals />} />
      </Routes>
      
      {/* Global Admin Button */}
      <AdminControls userRole={userRole} />
    </Router>
  );
}

export default App;