import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/hub/Home';
import Matchmaker from './pages/hub/Matchmaker';
import Empire from './pages/hub/Empire'; // 1. Add this import!

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matchmaker" element={<Matchmaker />} />
        <Route path="/empire" element={<Empire />} /> {/* 2. Add this Route! */}
        
        {/* GTA Category */}
        <Route path="/gta" element={<GTAMenu />} />
        <Route path="/gta/business" element={<Business />} />
        <Route path="/gta/heists" element={<Heists />} />
        <Route path="/gta/contact" element={<Contact />} />

        {/* Stardew Category */}
        <Route path="/stardew" element={<StardewMenu />} />
        <Route path="/stardew/crops" element={<Crops />} />
        <Route path="/stardew/artisan" element={<Artisan />} />
        <Route path="/stardew/animals" element={<Animals />} />
      </Routes>
    </Router>
  );
}

export default App;