
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Transmit from './pages/Transmit';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import AudioPlayer from './components/AudioPlayer';
import { Station, User } from './types';
import { MOCK_STATIONS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(MOCK_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Logic for Autoplay on Registration
  const handleAuthSuccess = () => {
    // Mock user login
    setUser({
      id: 'usr_1',
      name: 'Nuevo Usuario',
      email: 'user@example.com',
      isPremium: false,
      streamKey: 'live_test_key_123'
    });
    
    // Autoplay trigger
    setTimeout(() => {
      setIsPlaying(true);
    }, 500);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#030712] text-white flex flex-col">
        <Navbar />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home onSelectStation={(s) => { setCurrentStation(s); setIsPlaying(true); }} currentStation={currentStation} />} />
            <Route path="/transmitir" element={<Transmit />} />
            <Route path="/precios" element={<Pricing />} />
            <Route path="/login" element={<Auth type="login" onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Auth type="register" onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <AudioPlayer 
          currentStation={currentStation} 
          isPlaying={isPlaying} 
          onTogglePlay={() => setIsPlaying(!isPlaying)} 
        />

        <footer className="py-12 px-6 border-t border-white/5 bg-black/40 pb-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-2xl font-black tracking-tighter">EDHZ RADIO</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                La plataforma líder para creadores de audio. Transmite, crece y monetiza tu contenido globalmente con la mejor tecnología.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Plataforma</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">API para Desarrolladores</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Copyright (DMCA)</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© 2025 EDHZ Radio. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
