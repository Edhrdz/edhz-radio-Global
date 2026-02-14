
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Radio, Plus, Play, Pause, Volume2, Zap, Users, LogOut, 
  Sparkles, CreditCard, Globe, Trash2, Eye, EyeOff, Video, 
  CheckCircle, ArrowRight, ShieldCheck, DollarSign, Activity
} from 'lucide-react';
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

// --- Componentes UI ---
const DynamicLogo = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizes = {
    small: "w-10 h-10",
    medium: "w-24 h-24",
    large: "w-64 h-64" // Logo Masivo
  };

  return (
    <div className={`flex items-center gap-10 group ${size === 'large' ? 'flex-col' : ''}`}>
      <div className={`relative ${sizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 rounded-full shadow-[0_0_80px_rgba(79,70,229,0.5)] border border-white/20 scale-95 group-hover:scale-100 transition-all duration-500"></div>
        <Radio className="text-white relative z-10 w-1/2 h-1/2" />
      </div>
      <div className={`flex flex-col ${size === 'large' ? 'items-center' : 'items-start'}`}>
        <h1 className={`${size === 'large' ? 'text-8xl md:text-[10rem]' : 'text-3xl'} font-black text-white tracking-tighter leading-none`}>EDRADIO</h1>
        <h2 className={`${size === 'large' ? 'text-4xl md:text-5xl' : 'text-lg'} font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-[0.3em] uppercase`}>GLOBAL</h2>
      </div>
    </div>
  );
};

// --- App Principal ---
const App = () => {
  const [view, setView] = useState<'landing' | 'dashboard' | 'pricing'>('landing');
  const [user, setUser] = useState<any>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'none' | 'loading' | 'success'>('none');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Persistencia de datos
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
      const initial = [{
        id: '1',
        name: 'Hits 24/7',
        genre: 'Pop Latino',
        streamUrl: 'https://stream.edradio.global/live/hits',
        description: 'La emisora oficial del éxito.',
        listeners: 4320,
        isPremium: true,
        coverArt: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop',
        streamKey: 'ed_live_992'
      }];
      setStations(initial);
      localStorage.setItem('ed_stations', JSON.stringify(initial));
    }
  }, []);

  const saveStations = (newStations: RadioStation[]) => {
    setStations(newStations);
    localStorage.setItem('ed_stations', JSON.stringify(newStations));
  };

  const handleAuth = () => {
    const fakeUser = { name: 'Edgard', email: 'pro@edradio.global', plan: 'Free' };
    setUser(fakeUser);
    localStorage.setItem('ed_user', JSON.stringify(fakeUser));
    setAuthModal(null);
    setView('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('ed_user');
    setUser(null);
    setView('landing');
  };

  const addStation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newStation: RadioStation = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      genre: formData.get('genre') as string,
      description: formData.get('desc') as string,
      streamUrl: 'https://stream.edradio.global/live/' + Date.now(),
      listeners: 0,
      isPremium: false,
      coverArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop',
      streamKey: 'ed_live_' + Math.random().toString(36).substr(2, 5)
    };
    saveStations([...stations, newStation]);
    setShowAddModal(false);
  };

  const deleteStation = (id: string) => {
    if(confirm("¿Seguro que quieres eliminar esta radio?")) {
      saveStations(stations.filter(s => s.id !== id));
    }
  };

  const processPremium = () => {
    setPaymentStep('loading');
    setTimeout(() => {
      setPaymentStep('success');
      const updatedUser = { ...user, plan: 'PRO' };
      setUser(updatedUser);
      localStorage.setItem('ed_user', JSON.stringify(updatedUser));
      setTimeout(() => {
        setPaymentStep('none');
        setView('dashboard');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div onClick={() => setView('landing')} className="cursor-pointer">
          <DynamicLogo size="small" />
        </div>
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <button onClick={() => setView('dashboard')} className="text-xs font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">Dashboard</button>
              <button onClick={() => setView('pricing')} className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
                <Zap className="w-3 h-3 fill-current"/> {user.plan === 'PRO' ? 'CUENTA PRO' : 'VOLVERSE PRO'}
              </button>
              <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors"><LogOut className="w-5 h-5"/></button>
            </>
          ) : (
            <>
              <button onClick={() => setAuthModal('login')} className="text-xs font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">Login</button>
              <button onClick={() => setAuthModal('register')} className="bg-indigo-600 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">Comenzar</button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl pt-32 pb-40 px-6">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-20">
              <DynamicLogo size="large" />
              <h2 className="text-2xl md:text-3xl text-slate-400 font-medium mt-16 max-w-4xl leading-relaxed">
                La plataforma líder para alojar tus emisoras profesionales. Transmisión nativa a <span className="text-white font-black">TikTok Live</span>, OBS y el mundo entero.
              </h2>
              <div className="flex flex-wrap justify-center gap-8 mt-20">
                <button onClick={() => setAuthModal('register')} className="bg-white text-slate-950 px-16 py-8 rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl">CREAR MI RADIO</button>
                <button onClick={() => setView('pricing')} className="bg-slate-900 border border-white/10 px-16 py-8 rounded-[2.5rem] font-black text-2xl flex items-center gap-4 hover:bg-slate-800 transition-all"><Sparkles className="text-amber-400"/> EXPLORAR PRO</button>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-12 gap-6">
                <div>
                  <h1 className="text-7xl font-black tracking-tighter">MI <span className="text-indigo-500">CONTROL</span></h1>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-3">Estás gestionando {stations.length} emisoras</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 px-10 py-5 rounded-3xl font-black flex items-center gap-3 shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"><Plus/> NUEVA RADIO</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {stations.map(s => (
                  <div key={s.id} className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 flex flex-col md:flex-row gap-12 group hover:border-indigo-500/40 transition-all">
                    <div className="relative shrink-0 mx-auto">
                      <img src={s.coverArt} className="w-56 h-56 rounded-[3.5rem] object-cover shadow-2xl" alt="" />
                      <button onClick={() => setCurrentStation(s)} className="absolute inset-0 bg-black/40 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Play className="text-white fill-current w-20 h-20" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">{s.genre}</span>
                          <span className="text-slate-500 text-xs font-bold flex items-center gap-2"><Users className="w-4 h-4"/> {s.listeners}</span>
                        </div>
                        <h3 className="text-4xl font-black mb-3">{s.name}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{s.description}</p>
                      </div>
                      <div className="space-y-4 mt-8">
                        <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Stream Key</span>
                            <span className="text-xs font-mono text-slate-400">{visibleKeys[s.id] ? s.streamKey : '••••••••••••'}</span>
                          </div>
                          <button onClick={() => setVisibleKeys(p => ({...p, [s.id]: !p[s.id]}))} className="text-slate-600 hover:text-white transition-colors">
                            {visibleKeys[s.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="flex gap-4">
                          <button className="flex-1 flex items-center justify-center gap-3 bg-slate-800 hover:bg-pink-600/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                            <Video className="w-4 h-4 text-pink-500" /> TIKTOK LIVE
                          </button>
                          <button onClick={() => deleteStation(s.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'pricing' && (
            <motion.div key="pricing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <h2 className="text-6xl font-black mb-6">Plan <span className="text-amber-400">PREMIUM</span></h2>
              <p className="text-slate-400 text-xl mb-20 max-w-2xl text-center">Desbloquea transmisión Ultra-HD y multidifusión para todas tus redes sociales.</p>
              
              <div className="bg-slate-900 border border-white/10 rounded-[5rem] p-20 max-w-2xl w-full relative shadow-2xl">
                <div className="absolute top-10 right-10"><ShieldCheck className="w-20 h-20 text-indigo-500/20" /></div>
                <h3 className="text-4xl font-black mb-10">Pro EdRadio</h3>
                <div className="text-7xl font-black mb-12">$29.99 <span className="text-xl text-slate-500 font-bold tracking-normal">/ mes</span></div>
                
                <ul className="space-y-8 mb-16">
                  {["Sin anuncios de plataforma", "Calidad 320kbps Crystal Clear", "Soporte TikTok Live 24/7", "Almacenamiento Auto-DJ 100GB", "Estadísticas en tiempo real"].map((f, i) => (
                    <li key={i} className="flex items-center gap-5 text-xl font-bold">
                      <CheckCircle className="text-indigo-500 w-8 h-8" /> {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={processPremium}
                  className="w-full bg-white text-slate-950 py-8 rounded-[2.5rem] font-black text-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-xl"
                >
                  PAGAR CON GOOGLE <CreditCard className="w-8 h-8" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modales */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 p-16 rounded-[4rem] border border-white/10 w-full max-w-lg text-center shadow-2xl">
              <div className="flex justify-center mb-10"><DynamicLogo size="small" /></div>
              <h2 className="text-4xl font-black mb-12">{authModal === 'login' ? 'Bienvenido de nuevo' : 'Crea tu Estudio'}</h2>
              <button onClick={handleAuth} className="w-full bg-white text-slate-950 py-6 rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-slate-100 transition-all shadow-xl mb-10">
                <svg className="w-8 h-8" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                Continuar con Google
              </button>
              <input className="w-full bg-slate-800/50 border border-white/5 rounded-3xl px-8 py-5 mb-4 outline-none focus:border-indigo-500/50 transition-colors" placeholder="Correo electrónico" />
              <button onClick={() => setAuthModal(null)} className="text-slate-500 text-xs font-bold uppercase mt-8 hover:text-white transition-colors">Cerrar</button>
            </motion.div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 p-16 rounded-[4rem] border border-white/10 w-full max-w-2xl shadow-2xl">
              <h2 className="text-4xl font-black mb-12">Lanzar Nueva Radio</h2>
              <form onSubmit={addStation} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Nombre Comercial</label>
                  <input name="name" required className="w-full bg-slate-800/50 border border-white/5 rounded-3xl px-8 py-5 outline-none focus:border-indigo-500/50" placeholder="Ej: Super Hits FM" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Género Musical</label>
                  <input name="genre" required className="w-full bg-slate-800/50 border border-white/5 rounded-3xl px-8 py-5 outline-none focus:border-indigo-500/50" placeholder="Pop, Rock, Urbano..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Descripción de Marca</label>
                  <textarea name="desc" className="w-full bg-slate-800/50 border border-white/5 rounded-3xl px-8 py-5 h-32 outline-none focus:border-indigo-500/50 resize-none" placeholder="Cuéntanos sobre tu emisora..."></textarea>
                </div>
                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-6 bg-slate-800 rounded-3xl font-black uppercase text-xs tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 py-6 bg-indigo-600 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20">Lanzar Ahora</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {paymentStep !== 'none' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white text-slate-950 p-16 rounded-[4rem] w-full max-w-md text-center shadow-2xl">
              {paymentStep === 'loading' ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Procesando Pago</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Conectando con Google Pay...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-10 animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">¡Pago Exitoso!</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Bienvenido a EdRadio Premium</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Player Minimalista */}
      {currentStation && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-3xl border-t border-white/10 p-8 px-16 z-[60] flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-10 w-1/3">
            <img src={currentStation.coverArt} className="w-24 h-24 rounded-3xl object-cover shadow-2xl" alt="" />
            <div className="overflow-hidden">
              <h4 className="font-black text-3xl truncate mb-1">{currentStation.name}</h4>
              <div className="flex items-center gap-4">
                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">{currentStation.genre}</span>
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-red-500 tracking-tighter">LIVE</span></div>
              </div>
            </div>
          </div>
          <button className="w-28 h-28 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><Play className="fill-current ml-2 w-12 h-12"/></button>
          <div className="w-1/3 flex justify-end items-center gap-8">
            <Volume2 className="text-slate-500 w-8 h-8" />
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-indigo-600"></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fondo Decorativo */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[200px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 blur-[200px] animate-pulse"></div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
