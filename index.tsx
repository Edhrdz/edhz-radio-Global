import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Radio, Plus, Play, Pause, Volume2, Zap, Users, LogOut,
  Sparkles, CreditCard, Share2, Globe, Trash2, Eye, EyeOff, Video,
  CheckCircle, Mic, MessageSquare, Terminal, Waves, Activity,
  Settings, Save, RefreshCw, Copy, Music, Headphones, Broadcast
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tipos ---
interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  description: string;
  listeners: number;
  streamKey: string;
  status: 'offline' | 'online';
  coverArt: string;
}

interface User {
  name: string;
  email: string;
  plan: string;
}

// --- Utilidades de Audio ---
const encode = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array, 
  ctx: AudioContext, 
  sampleRate: number, 
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Componentes ---
const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end gap-1 h-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1.5 bg-indigo-500 rounded-t"
        animate={{ 
          height: isPlaying ? [8, 24, 12, 32, 16][i % 5] : 8 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 0.5, 
          delay: i * 0.1 
        }}
      />
    ))}
  </div>
);

const App = () => {
  // --- Estados ---
  const [view, setView] = useState<'landing' | 'dashboard' | 'studio' | 'pricing'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  
  // AI State
  const [isAiConnecting, setIsAiConnecting] = useState(false);
  const [aiHistory, setAiHistory] = useState<{role: string, text: string}[]>([]);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const aiSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const [newStation, setNewStation] = useState<Partial<RadioStation>>({
    name: '',
    genre: '',
    streamUrl: '',
    description: '',
    coverArt: ''
  });

  // --- Inicialización ---
  useEffect(() => {
    const savedUser = localStorage.getItem('ed_user');
    const savedStations = localStorage.getItem('ed_stations');
    const savedAutoplay = localStorage.getItem('ed_autoplay');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }

    if (savedStations) {
      setStations(JSON.parse(savedStations));
    } else {
      const initial: RadioStation[] = [{
        id: 'st-01',
        name: 'Retro Wave Global',
        genre: 'Synthwave / 80s',
        streamUrl: 'https://stream.zeno.fm/f368u217709uv',
        description: 'Vibras ochenteras para el estudio profesional.',
        listeners: 450,
        streamKey: 'ed_live_retro_4455',
        status: 'online',
        coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop'
      }, {
        id: 'st-02',
        name: 'Jazz Lounge Premium',
        genre: 'Jazz / Smooth',
        streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
        description: 'Música jazz para momentos relajados.',
        listeners: 320,
        streamKey: 'ed_live_jazz_7788',
        status: 'online',
        coverArt: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=400&auto=format&fit=crop'
      }];
      setStations(initial);
      localStorage.setItem('ed_stations', JSON.stringify(initial));
    }

    if (savedAutoplay !== null) {
      setAutoplayEnabled(JSON.parse(savedAutoplay));
    }

    // Autoplay al cargar si está habilitado
    if (autoplayEnabled && savedStations) {
      const parsedStations = JSON.parse(savedStations);
      if (parsedStations.length > 0) {
        setTimeout(() => {
          togglePlay(parsedStations[0]);
        }, 1000);
      }
    }
  }, []);

  // --- Control de Audio ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback((station?: RadioStation) => {
    if (!audioRef.current) return;

    if (station) {
      if (currentStation?.id === station.id && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setCurrentStation(station);
        audioRef.current.src = station.streamUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error al reproducir:', err);
          // Intentar autoplay con interacción del usuario
          setIsPlaying(false);
        });
      }
    } else if (currentStation) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error al reproducir:', err);
        });
      }
    }
  }, [currentStation, isPlaying]);

  // --- Login ---
  const handleLogin = () => {
    const fake: User = { 
      name: 'Producer Ed', 
      email: 'studio@edradio.pro', 
      plan: 'Pro' 
    };
    setUser(fake);
    localStorage.setItem('ed_user', JSON.stringify(fake));
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('landing');
    window.location.reload();
  };

  // --- Generar Guion con IA ---
  const generateRadioScript = async () => {
    if (!currentStation) {
      setScript("Selecciona una emisora primero para generar un guion.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      
      if (!apiKey) {
        setScript("⚠️ Configura tu API Key de Gemini en la sección de ajustes.");
        setIsGenerating(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Escribe un guion breve y profesional de 30 segundos para un locutor de radio de la emisora "${currentStation.name}" que toca género "${currentStation.genre}". Incluye una bienvenida y una frase de transición a la música. Responde solo con el guion.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el guion.";
      setScript(generatedText);
    } catch (error) {
      console.error('Error generando guion:', error);
      setScript("Error al conectar con la IA. Verifica tu API Key.");
    }
    setIsGenerating(false);
  };

  // --- AI Studio Voice ---
  const startAiStudio = async () => {
    setIsAiConnecting(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
    
    if (!apiKey) {
      alert('⚠️ Configura tu API Key de Gemini primero');
      setIsAiConnecting(false);
      return;
    }

    outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioCtxRef.current.createGain();
    outputNode.connect(outputAudioCtxRef.current.destination);

    try {
      // Simulación de conexión AI (la API Live requiere configuración especial)
      setTimeout(() => {
        setIsAiConnecting(false);
        setAiHistory([{ role: 'system', text: '🎙️ Zephyr conectado - Asistente de Estudio listo. ¿En qué puedo ayudarte hoy?' }]);
      }, 2000);

      // Nota: La API Live de Gemini requiere configuración especial del servidor
      // Esta es una implementación simplificada para demostración
    } catch (e) {
      console.error(e);
      setIsAiConnecting(false);
      setAiHistory([{ role: 'system', text: 'Error al conectar con Zephyr. Verifica tu API Key.' }]);
    }
  };

  const sendAiMessage = async (text: string) => {
    if (!text.trim() || !aiSessionRef.current) return;
    
    setAiHistory(prev => [...prev, { role: 'user', text }]);
    
    // Simulación de respuesta AI
    setTimeout(() => {
      const responses = [
        "¡Excelente idea! Te sugiero comenzar con una introducción energética.",
        "Puedo generar un guion para ese segmento. ¿Qué duración necesitas?",
        "Recomiendo transicionar a música más suave después de este anuncio.",
        "He analizado tu audiencia: el mejor momento es entre las 9-11 AM."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiHistory(prev => [...prev, { role: 'assistant', text: randomResponse }]);
    }, 1500);
  };

  // --- Gestionar Emisoras ---
  const handleAddStation = () => {
    if (!newStation.name || !newStation.streamUrl) {
      alert('Nombre y URL del stream son requeridos');
      return;
    }

    const station: RadioStation = {
      id: `st-${Date.now()}`,
      name: newStation.name || 'Nueva Emisora',
      genre: newStation.genre || 'General',
      streamUrl: newStation.streamUrl,
      description: newStation.description || 'Sin descripción',
      listeners: Math.floor(Math.random() * 500),
      streamKey: `ed_live_${Date.now()}`,
      status: 'online',
      coverArt: newStation.coverArt || 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=400&auto=format&fit=crop'
    };

    const updated = [...stations, station];
    setStations(updated);
    localStorage.setItem('ed_stations', JSON.stringify(updated));
    setShowAddModal(false);
    setNewStation({ name: '', genre: '', streamUrl: '', description: '', coverArt: '' });
  };

  const handleDeleteStation = (id: string) => {
    const updated = stations.filter(s => s.id !== id);
    setStations(updated);
    localStorage.setItem('ed_stations', JSON.stringify(updated));
    if (currentStation?.id === id) {
      setCurrentStation(null);
      setIsPlaying(false);
    }
  };

  const toggleAutoplay = () => {
    const newValue = !autoplayEnabled;
    setAutoplayEnabled(newValue);
    localStorage.setItem('ed_autoplay', JSON.stringify(newValue));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
  };

  // --- Render ---
  return (
    <div className="min-h-screen relative">
      <audio ref={audioRef} crossOrigin="anonymous" />
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass px-8 py-5 flex justify-between items-center border-b border-white/5">
        <div onClick={() => setView('landing')} className="cursor-pointer flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Radio className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter">EDRADIO <span className="text-indigo-500">GLOBAL</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="hidden md:flex gap-6 mr-6">
                <button 
                  onClick={() => setView('dashboard')} 
                  className={`text-[10px] font-black uppercase tracking-widest ${view === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                >
                  Escritorio
                </button>
                <button 
                  onClick={() => setView('studio')} 
                  className={`text-[10px] font-black uppercase tracking-widest ${view === 'studio' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                >
                  Estudio AI
                </button>
              </div>
              <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogin} 
              className="bg-indigo-600 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
            >
              Acceso Productor
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl pt-32 pb-40 px-6">
        <AnimatePresence mode="wait">
          
          {/* Dashboard */}
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-12"
            >
              <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                <div>
                  <h1 className="text-6xl font-black tracking-tighter leading-none">MIS <span className="text-indigo-500">EMISORAS</span></h1>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mt-4">Gestión de infraestructura en tiempo real</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" /> CREAR ESTACIÓN
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stations.map(s => (
                  <div 
                    key={s.id} 
                    className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row gap-10 hover:border-indigo-500/20 transition-all group"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={s.coverArt} 
                        className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl group-hover:scale-105 transition-transform" 
                        alt={s.name}
                      />
                      <button 
                        onClick={() => togglePlay(s)}
                        className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] flex items-center justify-center backdrop-blur-sm transition-all"
                      >
                        {isPlaying && currentStation?.id === s.id ? (
                          <Pause className="w-16 h-16 fill-white" />
                        ) : (
                          <Play className="w-16 h-16 fill-white" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between mb-4">
                          <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]">{s.genre}</span>
                          <span className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                            <Users className="w-4 h-4" /> {s.listeners}
                          </span>
                        </div>
                        <h3 className="text-3xl font-black mb-2">{s.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-6">{s.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-slate-950 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                          <Activity className="w-4 h-4 text-indigo-500" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase">320kbps</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteStation(s.id)}
                          className="bg-slate-800 hover:bg-red-900/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                        <button 
                          onClick={() => setView('studio')} 
                          className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                          <Terminal className="w-4 h-4" /> Consola AI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Studio */}
          {view === 'studio' && (
            <motion.div 
              key="studio" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900/80 border border-white/5 rounded-[3rem] p-10 h-[600px] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <header className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">AI STUDIO <span className="text-indigo-500">VOICE</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Asistente de Producción</p>
                    </div>
                    {isAiConnecting ? (
                      <RefreshCw className="animate-spin text-indigo-500" />
                    ) : (
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    )}
                  </header>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                    {aiHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Mic className="w-20 h-20 mb-6 text-indigo-400" />
                        <p className="font-bold text-xl">Activa el asistente para comenzar a producir</p>
                        <p className="text-sm">"Zephyr, ayúdame a escribir el guion de la mañana"</p>
                      </div>
                    )}
                    {aiHistory.map((h, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-2xl max-w-[80%] ${
                          h.role === 'user' ? 'bg-indigo-600 ml-auto' : 
                          h.role === 'system' ? 'bg-slate-800 border border-indigo-500/30' : 
                          'bg-slate-800'
                        }`}
                      >
                        <p className="text-sm font-medium">{h.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                    {!aiSessionRef.current ? (
                      <button 
                        onClick={startAiStudio} 
                        className="w-full bg-white text-slate-950 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-all"
                      >
                        <Mic className="w-7 h-7" /> INICIAR ASISTENTE DE VOZ
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 w-full">
                        <input
                          type="text"
                          placeholder="Escribe tu mensaje..."
                          className="flex-1 bg-slate-950 rounded-2xl p-4 border border-indigo-500/30 outline-none text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendAiMessage(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button 
                          onClick={() => { 
                            aiSessionRef.current = null; 
                            setView('studio'); 
                          }} 
                          className="bg-red-500/10 text-red-500 p-6 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <RefreshCw className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900/80 border border-white/5 rounded-[3rem] p-10 flex flex-col gap-6">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Sparkles className="text-amber-400" /> GEN-SCRIPT
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Genera locuciones automáticas basadas en el estilo de tu emisora.
                  </p>
                  
                  <div className="bg-slate-950 rounded-2xl p-6 min-h-[200px] border border-white/5 relative">
                    <textarea 
                      value={script} 
                      onChange={(e) => setScript(e.target.value)}
                      className="w-full h-full bg-transparent outline-none text-sm text-slate-300 resize-none font-medium"
                      placeholder="El guion aparecerá aquí..."
                    />
                    {script && (
                      <button 
                        onClick={() => copyToClipboard(script)} 
                        className="absolute bottom-4 right-4 bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={generateRadioScript} 
                    disabled={isGenerating}
                    className="bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Nuevo Guion'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-600/20">
                  <h3 className="text-2xl font-black mb-4">Stream Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase opacity-60">Servidor Principal</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase">Activo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase opacity-60">Bitrate de Salida</span>
                      <span className="font-mono text-xs">320.4 kbps</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                      <motion.div 
                        animate={{ x: [-100, 100] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
                        className="w-1/3 h-full bg-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-white/5 rounded-[3rem] p-10">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Configuración
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Autoplay</span>
                      <button 
                        onClick={toggleAutoplay}
                        className={`w-12 h-6 rounded-full transition-all ${autoplayEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${autoplayEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">API Key Gemini</label>
                      <input
                        type="password"
                        placeholder="Ingresa tu API Key"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-indigo-500"
                        onBlur={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Landing */}
          {view === 'landing' && (
            <motion.div 
              key="landing" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col items-center text-center py-20"
            >
              <div className="relative mb-16">
                <div className="absolute inset-0 bg-indigo-500 blur-[120px] opacity-20 animate-pulse"></div>
                <Radio className="w-32 h-32 text-indigo-500 relative z-10" />
              </div>
              <h1 className="text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
                TU RADIO, <br/> <span className="text-indigo-500">POTENCIADA POR IA.</span>
              </h1>
              <p className="text-slate-400 text-2xl max-w-2xl mb-16 font-medium">
                No solo transmitas audio. Crea experiencias inteligentes con asistencia en vivo, guiones automáticos y distribución global.
              </p>
              <div className="flex gap-8 flex-wrap justify-center">
                <button 
                  onClick={handleLogin} 
                  className="bg-white text-slate-950 px-16 py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all"
                >
                  Comenzar Gratis
                </button>
                <button className="bg-slate-900 border border-white/5 px-16 py-8 rounded-[2.5rem] font-black text-2xl flex items-center gap-4 hover:bg-slate-800 transition-all">
                  <CreditCard className="w-6 h-6" /> Ver Planes Pro
                </button>
              </div>
              
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                  <Broadcast className="w-12 h-12 text-indigo-500 mb-4" />
                  <h3 className="text-xl font-black mb-2">Streaming HD</h3>
                  <p className="text-slate-400 text-sm">Calidad de audio 320kbps con baja latencia</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                  <Sparkles className="w-12 h-12 text-amber-500 mb-4" />
                  <h3 className="text-xl font-black mb-2">IA Integrada</h3>
                  <p className="text-slate-400 text-sm">Asistente de voz y generación de guiones</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                  <Globe className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-black mb-2">Distribución Global</h3>
                  <p className="text-slate-400 text-sm">Llega a oyentes en todo el mundo</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Player */}
      {currentStation && (
        <motion.div 
          initial={{ y: 100 }} 
          animate={{ y: 0 }} 
          className="fixed bottom-0 inset-x-0 z-[100] bg-slate-950/90 backdrop-blur-3xl border-t border-white/10 p-8 px-16 flex items-center justify-between shadow-2xl"
        >
          <div className="flex items-center gap-8 w-1/3">
            <div className="relative group">
              <img 
                src={currentStation.coverArt} 
                className="w-20 h-20 rounded-2xl object-cover shadow-2xl" 
                alt={currentStation.name}
              />
              {isPlaying && (
                <div className="absolute -top-2 -right-2">
                  <Visualizer isPlaying={isPlaying} />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-black text-2xl truncate max-w-[200px]">{currentStation.name}</h4>
              <div className="flex items-center gap-3">
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{currentStation.genre}</span>
                <div className="bg-red-500 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live</span>
                </div>
              </div>
            </div>
          </div>
        
          <div className="flex items-center gap-8">
            <button 
              onClick={() => togglePlay()} 
              className="w-24 h-24 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-2" />
              )}
            </button>
          </div>

          <div className="w-1/3 flex justify-end items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Master Volume</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-white">
                  {isMuted ? <Volume2 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute w-32 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal Add Station */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-2xl w-full">
            <h2 className="text-3xl font-black mb-8">Nueva Emisora</h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Nombre *</label>
                <input
                  type="text"
                  value={newStation.name}
                  onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500"
                  placeholder="Ej: Rock Clásico FM"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Género</label>
                <input
                  type="text"
                  value={newStation.genre}
                  onChange={(e) => setNewStation({...newStation, genre: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500"
                  placeholder="Ej: Rock / Clásico"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">URL del Stream *</label>
                <input
                  type="url"
                  value={newStation.streamUrl}
                  onChange={(e) => setNewStation({...newStation, streamUrl: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500"
                  placeholder="https://stream.ejemplo.com/radio"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Descripción</label>
                <textarea
                  value={newStation.description}
                  onChange={(e) => setNewStation({...newStation, description: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500 resize-none h-24"
                  placeholder="Describe tu emisora..."
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">URL de Portada</label>
                <input
                  type="url"
                  value={newStation.coverArt}
                  onChange={(e) => setNewStation({...newStation, coverArt: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStation}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black uppercase tracking-widest"
              >
                Crear Emisora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[200px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[200px]"></div>
      </div>
    </div>
  );
};

// --- Mount App ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
