
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Radio, Settings, Plus, Play, Pause, Volume2, ShieldCheck, Zap, 
  Users, LayoutDashboard, LogOut, Sparkles, CreditCard, CheckCircle2,
  Share2, Globe, Trash2, Activity, Eye, EyeOff, Video
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---
interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  description: string;
  listeners: number;
  isPremium: boolean;
  coverArt: string;
  streamKey: string;
}

// --- Componentes Visuales ---
const DynamicLogo = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizes = {
    small: "w-10 h-10",
    medium: "w-24 h-24",
    large: "w-64 h-64" // Logo Masivo
  };

  return (
    <div className={`flex items-center gap-6 group ${size === 'large' ? 'flex-col' : ''}`}>
      <div className={`relative ${sizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 rounded-full shadow-[0_0_60px_rgba(79,70,229,0.5)] border border-white/20 scale-95 group-hover:scale-100 transition-transform duration-500"></div>
        <Radio className="text-white relative z-10 w-1/2 h-1/2" />
      </div>
      <div className={`flex flex-col ${size === 'large' ? 'items-center' : 'items-start'}`}>
        <h1 className={`${size === 'large' ? 'text-8xl' : 'text-3xl'} font-black text-white tracking-tighter leading-none`}>
          EDRADIO
        </h1>
        <h2 className={`${size === 'large' ? 'text-4xl' : 'text-lg'} font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase`}>
          GLOBAL
        </h2>
      </div>
    </div>
  );
};

// --- App Principal ---
const App = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('ed_user');
    const savedStations = localStorage.getItem('ed_stations');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    } else {
      const initial = [
        {
          id: '1',
          name: 'Global Hits FM',
          genre: 'Pop / Top 40',
          streamUrl: 'https://stream.edradio.global/live/hits',
          description: 'La mejor música del mundo 24/7.',
          listeners: 1250,
          isPremium: true,
          coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
          streamKey: 'ed_live_x882'
        }
      ];
      setStations(initial);
      localStorage.setItem('ed_stations', JSON.stringify(initial));
    }
  }, []);

  const handleAuth = (u: any) => {
    setUser(u);
    localStorage.setItem('ed_user', JSON.stringify(u));
    setAuthModal(null);
    setView('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('ed_user');
    setUser(null);
    setView('landing');
  };

  const addStation = (data: any) => {
    const newS: RadioStation = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      genre: data.genre,
      streamUrl: data.url || 'https://stream.edradio.global/live/' + Date.now(),
      description: data.desc,
      listeners: 0,
      isPremium: false,
      coverArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop',
      streamKey: 'ed_live_' + Math.random().toString(36).substr(2, 5)
    };
    const updated = [...stations, newS];
    setStations(updated);
    localStorage.setItem('ed_stations', JSON.stringify(updated));
    setShowAddModal(false);
  };

  const deleteStation = (id: string) => {
    const updated = stations.filter(s => s.id !== id);
    setStations(updated);
    localStorage.setItem('ed_stations', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => setView('landing')}>
          <DynamicLogo size="small" />
        </div>
        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <button onClick={() => setAuthModal('login')} className="text-xs font-bold hover:text-indigo-400 transition-colors uppercase tracking-widest">Login</button>
              <button onClick={() => setAuthModal('register')} className="bg-indigo-600 px-6 py-2.5 rounded-full text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase tracking-widest">Registrarse</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('dashboard')} className="text-xs font-bold hover:text-indigo-400 transition-colors uppercase tracking-widest">Dashboard</button>
              <button onClick={logout} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-2"><LogOut className="w-4 h-4"/> Salir</button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl pt-32 px-6 pb-40">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center">
              <DynamicLogo size="large" />
              <h2 className="text-2xl md:text-3xl font-medium text-slate-400 mt-12 max-w-2xl leading-relaxed">
                La plataforma definitiva para creadores de radio. Transmite a TikTok, OBS y el mundo con un solo clic.
              </h2>
              <div className="flex gap-6 mt-16">
                <button onClick={() => user ? setView('dashboard') : setAuthModal('register')} className="bg-white text-slate-950 px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl">EMPEZAR GRATIS</button>
                <button className="bg-slate-900 border border-white/10 px-12 py-6 rounded-[2rem] font-black text-xl flex items-center gap-3 hover:bg-slate-800 transition-all"><Globe className="text-indigo-500"/> EXPLORAR</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="flex justify-between items-end border-b border-white/5 pb-10">
                <div>
                  <h2 className="text-5xl font-black tracking-tighter">MIS <span className="text-indigo-500">RADIOS</span></h2>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mt-2">Gestiona tu red de streaming</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all"><Plus/> CREAR RADIO</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stations.map(s => (
                  <div key={s.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 flex gap-8 group hover:border-indigo-500/30 transition-all">
                    <div className="relative shrink-0">
                      <img src={s.coverArt} className="w-40 h-40 rounded-3xl object-cover shadow-2xl" alt="" />
                      <button onClick={() => setCurrentStation(s)} className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Play className="text-white fill-current w-12 h-12" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">{s.genre}</span>
                          <span className="text-slate-500 text-[10px] font-bold flex items-center gap-1"><Users className="w-3 h-3"/> {s.listeners}</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">{s.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{s.description}</p>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Stream Key</span>
                          <span className="text-xs font-mono text-slate-400">{visibleKeys[s.id] ? s.streamKey : '••••••••••••'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setVisibleKeys(p => ({...p, [s.id]: !p[s.id]}))} className="text-slate-600 hover:text-white"><Eye className="w-4 h-4"/></button>
                          <button onClick={() => deleteStation(s.id)} className="text-red-500/50 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <button className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all">
                        <Video className="w-3 h-3 text-pink-500" /> CONECTAR TIKTOK LIVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modales */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 w-full max-w-sm text-center">
              <h2 className="text-3xl font-black mb-8">{authModal === 'login' ? 'Bienvenido' : 'Crea tu Cuenta'}</h2>
              <button onClick={() => handleAuth({ name: 'Edgard', email: 'user@test.com' })} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl mb-6">
                <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                Continuar con Google
              </button>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">o usa tu correo</p>
              <input className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 mb-4 focus:outline-none focus:border-indigo-500/50" placeholder="Email" />
              <button onClick={() => setAuthModal(null)} className="text-slate-500 text-xs font-bold uppercase mt-4">Cerrar</button>
            </motion.div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 w-full max-w-lg">
              <h2 className="text-3xl font-black mb-8">Nueva Emisora</h2>
              <div className="space-y-4">
                <input id="new-name" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4" placeholder="Nombre de la Radio" />
                <input id="new-genre" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4" placeholder="Género" />
                <textarea id="new-desc" className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 h-32" placeholder="Descripción corta" />
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs">Cancelar</button>
                  <button onClick={() => {
                    const name = (document.getElementById('new-name') as HTMLInputElement).value;
                    const genre = (document.getElementById('new-genre') as HTMLInputElement).value;
                    const desc = (document.getElementById('new-desc') as HTMLTextAreaElement).value;
                    if (name && genre) addStation({ name, genre, desc });
                  }} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20">Lanzar Emisora</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mini Reproductor */}
      {currentStation && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 p-6 px-12 z-[60] flex items-center justify-between">
          <div className="flex items-center gap-6 w-1/3">
            <img src={currentStation.coverArt} className="w-16 h-16 rounded-2xl object-cover" alt="" />
            <div>
              <h4 className="font-black text-xl">{currentStation.name}</h4>
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{currentStation.genre}</span>
            </div>
          </div>
          <button onClick={() => alert("Transmisión Iniciada")} className="w-20 h-20 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><Play className="fill-current ml-1 w-8 h-8"/></button>
          <div className="w-1/3 flex justify-end items-center gap-4 text-slate-500">
            <Volume2 className="w-6 h-6" />
            <div className="w-32 h-1.5 bg-slate-800 rounded-full"><div className="w-2/3 h-full bg-indigo-600 rounded-full"></div></div>
          </div>
        </motion.div>
      )}

      {/* Decoración Fondo */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] animate-pulse"></div>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.4; } }
  .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
`;
document.head.appendChild(style);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
