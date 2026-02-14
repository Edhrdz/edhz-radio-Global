
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Radio, 
  Settings, 
  Plus, 
  Play, 
  Pause, 
  Volume2, 
  ShieldCheck, 
  Zap, 
  Users, 
  LayoutDashboard, 
  LogOut,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Share2,
  Globe,
  Music,
  Trash2,
  Activity,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Video,
  ExternalLink
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
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

// --- Mock Data ---
const INITIAL_STATIONS: RadioStation[] = [
  {
    id: '1',
    name: 'EdRadio Hit Mix',
    genre: 'Pop / Dance',
    streamUrl: 'https://stream.edradio.global/live/hits',
    description: 'Los mejores éxitos globales, 24/7 en EdRadio Global.',
    listeners: 4520,
    isPremium: true,
    coverArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&h=400&auto=format&fit=crop',
    streamKey: 'ed_live_8829xjk'
  },
  {
    id: '2',
    name: 'Urbano Global',
    genre: 'Reggaeton / Trap',
    streamUrl: 'https://stream.edradio.global/live/urbano',
    description: 'El ritmo de la calle en tu plataforma favorita.',
    listeners: 1890,
    isPremium: false,
    coverArt: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=400&h=400&auto=format&fit=crop',
    streamKey: 'ed_live_1120pql'
  }
];

// --- Components ---

const DynamicLogo = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizes = {
    small: "w-10 h-10",
    medium: "w-20 h-20",
    large: "w-48 h-48"
  };

  return (
    <div className={`flex items-center gap-6 group ${size === 'large' ? 'flex-col' : ''}`}>
      <div className={`relative ${sizes[size]} flex items-center justify-center`}>
        {/* Glow effect for large logo */}
        {size === 'large' && (
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[60px] opacity-30 animate-pulse"></div>
        )}
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_50px_rgba(79,70,229,0.5)] border border-white/20"></div>
        <Radio className="text-white relative z-10 w-1/2 h-1/2" />
      </div>
      <div className={`flex flex-col ${size === 'large' ? 'items-center' : 'items-start'}`}>
        <span className={`${size === 'large' ? 'text-7xl' : 'text-2xl'} font-black text-white tracking-tighter uppercase leading-none`}>
          EDRADIO
        </span>
        <span className={`${size === 'large' ? 'text-5xl' : 'text-xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-widest uppercase`}>
          GLOBAL
        </span>
      </div>
    </div>
  );
};

const Navbar = ({ 
  onViewChange, 
  currentView, 
  onUpgrade, 
  user, 
  onAuth 
}: { 
  onViewChange: (v: any) => void, 
  currentView: string, 
  onUpgrade: () => void,
  user: any,
  onAuth: (type: 'login' | 'register') => void
}) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
    <div className="cursor-pointer" onClick={() => onViewChange('landing')}>
      <DynamicLogo size="small" />
    </div>
    
    <div className="flex items-center gap-8">
      <div className="hidden lg:flex items-center gap-8 mr-4">
        <button onClick={() => onViewChange('landing')} className="text-xs font-black text-slate-400 hover:text-white transition-all tracking-widest">INICIO</button>
        <button className="text-xs font-black text-slate-400 hover:text-white transition-all tracking-widest">EXPLORAR</button>
        {user && (
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`text-xs font-black transition-all tracking-widest ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            DASHBOARD
          </button>
        )}
      </div>

      {!user ? (
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onAuth('login')}
            className="text-xs font-black text-white px-4 py-2 hover:text-indigo-400 transition-all tracking-widest"
          >
            LOGIN
          </button>
          <button 
            onClick={() => onAuth('register')}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-xs font-black hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] tracking-widest"
          >
            REGÍSTRATE
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <button 
            onClick={onUpgrade}
            className="bg-gradient-to-br from-amber-400 to-orange-600 text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 tracking-widest"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            GO PRO
          </button>
          <div className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-full pl-1 pr-3 py-1">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
              {user.name.substring(0,2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">{user.name}</span>
          </div>
        </div>
      )}
    </div>
  </nav>
);

const AuthModal = ({ type, onClose, onAuthSuccess }: { type: 'login' | 'register', onClose: () => void, onAuthSuccess: (user: any) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulación de Google Auth
    setTimeout(() => {
      onAuthSuccess({ name: 'Ed User', email: 'user@edradio.global' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 p-12 rounded-[3rem] w-full max-w-md relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <LogOut className="w-7 h-7 rotate-180" />
        </button>

        <div className="flex justify-center mb-8">
          <DynamicLogo size="small" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2 text-center tracking-tight">
          {type === 'login' ? 'Bienvenido' : 'Únete a la Red'}
        </h2>
        <p className="text-slate-500 text-sm mb-10 text-center font-medium">Acceso exclusivo a EdRadio Global</p>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {loading ? (
              <Activity className="animate-spin w-5 h-5" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.058,34.893,44,29.839,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                {type === 'login' ? 'Entrar con Google' : 'Registrarse con Google'}
              </>
            )}
          </button>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">O EMAIL</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="space-y-4">
            <input className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Correo Electrónico" />
            <input className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" type="password" placeholder="Contraseña" />
            <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">
              {type === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARME'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Landing = ({ onStart }: { onStart: () => void }) => (
  <div className="pt-20 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="mb-16"
    >
      <DynamicLogo size="large" />
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="max-w-5xl z-10"
    >
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-full text-indigo-400 text-[10px] font-black mb-10 tracking-[0.3em] uppercase animate-bounce-slow">
        <Sparkles className="w-4 h-4" /> REINVENTANDO EL STREAMING
      </div>
      
      <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-[0.85]">
        TU RADIO <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">SIN LÍMITES.</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
        Lanza tu emisora profesional hoy mismo. Transmite a <span className="text-white font-bold">TikTok Live</span>, OBS y Facebook con la infraestructura más potente del mercado.
      </p>

      <div className="flex flex-col sm:flex-row gap-8 justify-center">
        <button 
          onClick={onStart}
          className="group relative bg-white text-slate-950 px-12 py-6 rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10 flex items-center gap-3">
            EMPEZAR AHORA <Plus className="w-6 h-6" />
          </span>
          <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
        </button>
        <button className="bg-slate-900 border border-white/10 hover:border-indigo-500/50 text-white px-12 py-6 rounded-[2rem] font-black text-xl transition-all hover:bg-slate-800 flex items-center gap-3 group">
          <Globe className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform" /> EXPLORAR
        </button>
      </div>
    </motion.div>

    {/* Partners / Integrations */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-32 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
    >
      <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter">
        <Video className="w-8 h-8 text-pink-500" /> TikTok Live
      </div>
      <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter">
        <Activity className="w-8 h-8 text-blue-500" /> OBS Studio
      </div>
      <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter">
        <Share2 className="w-8 h-8 text-indigo-500" /> Global Cast
      </div>
    </motion.div>
  </div>
);

const AudioPlayer = ({ station }: { station: RadioStation | null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferLevel, setBufferLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (station && audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [station]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!station) return null;

  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-3xl border-t border-white/5 z-50 p-6 px-10 shadow-2xl">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-10">
        <div className="flex items-center gap-6 w-1/3">
          <img src={station.coverArt} className="w-20 h-20 rounded-[1.5rem] object-cover border border-white/10 shadow-2xl" alt="" />
          <div className="overflow-hidden">
            <h4 className="text-white font-black truncate text-xl tracking-tight">{station.name}</h4>
            <div className="flex items-center gap-3">
               <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">{station.genre}</span>
               <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full text-[10px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div> LIVE
               </div>
            </div>
          </div>
        </div>

        <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
          {isPlaying ? <Pause className="text-slate-950 fill-current w-8 h-8" /> : <Play className="text-slate-950 fill-current ml-1 w-8 h-8" />}
        </button>

        <div className="flex items-center gap-6 w-1/3 justify-end">
          <Volume2 className="text-slate-500 w-6 h-6" />
          <input 
            type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (audioRef.current) audioRef.current.volume = val;
            }}
            className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </motion.div>
  );
};

const Dashboard = ({ stations, onPlay, onDelete }: { stations: RadioStation[], onPlay: (s: RadioStation) => void, onDelete: (id: string) => void }) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-16 py-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-12">
        <div>
          <h2 className="text-6xl font-black text-white tracking-tighter mb-4">MI <span className="text-indigo-500">ESTUDIO</span></h2>
          <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-xs">Centro de Control EdRadio Global</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">
          <Plus className="w-6 h-6" /> NUEVA EMISORA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {stations.map((s) => (
          <motion.div key={s.id} whileHover={{ y: -10 }} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 group relative overflow-hidden">
            <div className="flex gap-10 items-start">
              <div className="relative shrink-0">
                <img src={s.coverArt} className="w-40 h-40 rounded-[2rem] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" alt="" />
                <button onClick={() => onPlay(s)} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="text-white fill-current w-12 h-12" />
                </button>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-400 text-[10px] font-black tracking-widest uppercase">{s.genre}</span>
                    <span className="text-xs font-black text-slate-500 flex items-center gap-2"><Users className="w-4 h-4" /> {s.listeners}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{s.name}</h3>
                </div>

                <div className="bg-slate-950/80 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Servidor RTMP</p>
                    <code className="text-xs text-indigo-400 font-mono break-all">rtmp://live.edradio.global/app</code>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Stream Key</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">{visibleKeys[s.id] ? s.streamKey : '••••••••••••'}</span>
                      <button onClick={() => setVisibleKeys(prev => ({...prev, [s.id]: !prev[s.id]}))}>
                        {visibleKeys[s.id] ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
                    <Video className="w-4 h-4 text-pink-500" /> VINCULAR TIKTOK
                  </button>
                  <button onClick={() => onDelete(s.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [authType, setAuthType] = useState<'login' | 'register' | null>(null);
  const [stations, setStations] = useState<RadioStation[]>(INITIAL_STATIONS);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-jakarta">
      <Navbar 
        onViewChange={setView} user={user} currentView={view} 
        onAuth={setAuthType} onUpgrade={() => alert("Función PRO próximamente...")} 
      />

      <main className="container mx-auto max-w-screen-xl px-8 pt-24 pb-64">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Landing onStart={() => user ? setView('dashboard') : setAuthType('register')} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard stations={stations} onPlay={setCurrentStation} onDelete={(id) => setStations(s => s.filter(x => x.id !== id))} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {authType && (
          <AuthModal type={authType} onClose={() => setAuthType(null)} onAuthSuccess={(u) => { setUser(u); setAuthType(null); setView('dashboard'); }} />
        )}
      </AnimatePresence>

      <AudioPlayer station={currentStation} />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[180px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[180px] animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};

// --- Custom Animations ---
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  .animate-blob { animation: blob 15s infinite ease-in-out; }
  .animation-delay-2000 { animation-delay: 2s; }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(-5%); }
    50% { transform: translateY(0); }
  }
  .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
  .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
`;
document.head.appendChild(style);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
