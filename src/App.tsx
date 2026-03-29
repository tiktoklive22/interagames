import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music,
  MessageSquare, 
  Info,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Zap,
  CheckCircle2,
  Infinity as InfinityIcon,
  ChevronDown,
  History,
  X,
  Monitor,
  RotateCcw,
  HelpCircle,
  ExternalLink,
  Palette,
  BadgeCheck,
  Check,
  Loader2,
  Plus,
  Type,
  Home,
  Gamepad2,
  BookOpen,
  RefreshCw,
  Eye,
  Shield,
  Diamond,
  Star,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { useKickChat } from './hooks/useKickChat';
import { generateLevel, WordPlacement } from './utils/gameLogic';
import { 
  GRID_SIZE, 
  Player, 
  FoundWord, 
  BG_MUSIC_TRACKS, 
  SFX,
  WORD_SEARCH_IMAGE
} from './constants';

const THEMES = {
  'neon-green': {
    name: 'Neon Green',
    primary: '#53fc18',
    primaryRgb: '83, 252, 24',
    primaryBg: 'bg-[#53fc18]',
    bgGradient: 'from-[#0a1a05] via-[#050a02] to-[#0a1a05]',
    accent: 'text-[#53fc18]',
    border: 'border-[#53fc18]',
    shadow: 'shadow-[0_0_30px_rgba(83,252,24,0.4)]',
    glow: 'bg-[#53fc18]/10',
    bodyBg: 'bg-[#020a02]',
    cardBg: 'bg-green-900/20',
    navBg: 'bg-green-950/60',
    popupBg: 'bg-green-950/95',
    overlayBg: 'bg-green-950/90',
  },
  'cyber-purple': {
    name: 'Cyber Purple',
    primary: '#a855f7',
    primaryRgb: '168, 85, 247',
    primaryBg: 'bg-[#a855f7]',
    bgGradient: 'from-[#1a052a] via-[#0a010a] to-[#1a052a]',
    accent: 'text-[#a855f7]',
    border: 'border-[#a855f7]',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    glow: 'bg-[#a855f7]/10',
    bodyBg: 'bg-[#0a020f]',
    cardBg: 'bg-purple-900/20',
    navBg: 'bg-purple-950/60',
    popupBg: 'bg-purple-950/95',
    overlayBg: 'bg-purple-950/90',
  },
  'frost-blue': {
    name: 'Frost Blue',
    primary: '#3b82f6',
    primaryRgb: '59, 130, 246',
    primaryBg: 'bg-[#3b82f6]',
    bgGradient: 'from-[#051a2a] via-[#01010a] to-[#051a2a]',
    accent: 'text-[#3b82f6]',
    border: 'border-[#3b82f6]',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    glow: 'bg-[#3b82f6]/10',
    bodyBg: 'bg-[#020817]',
    cardBg: 'bg-blue-900/20',
    navBg: 'bg-blue-950/60',
    popupBg: 'bg-blue-950/95',
    overlayBg: 'bg-blue-950/90',
  },
  'neon-red': {
    name: 'Neon Red',
    primary: '#ff3131',
    primaryRgb: '255, 49, 49',
    primaryBg: 'bg-[#ff3131]',
    bgGradient: 'from-[#2a0505] via-[#0a0101] to-[#2a0505]',
    accent: 'text-[#ff3131]',
    border: 'border-[#ff3131]',
    shadow: 'shadow-[0_0_30px_rgba(255,49,49,0.4)]',
    glow: 'bg-[#ff3131]/10',
    bodyBg: 'bg-[#0f0202]',
    cardBg: 'bg-red-900/20',
    navBg: 'bg-red-950/60',
    popupBg: 'bg-red-950/95',
    overlayBg: 'bg-red-950/90',
  },
  'sunny-yellow': {
    name: 'Sunny Yellow',
    primary: '#ffde59',
    primaryRgb: '255, 222, 89',
    primaryBg: 'bg-[#ffde59]',
    bgGradient: 'from-[#2a2a05] via-[#0a0a01] to-[#2a2a05]',
    accent: 'text-[#ffde59]',
    border: 'border-[#ffde59]',
    shadow: 'shadow-[0_0_30px_rgba(255,222,89,0.4)]',
    glow: 'bg-[#ffde59]/10',
    bodyBg: 'bg-[#0f0f02]',
    cardBg: 'bg-yellow-900/20',
    navBg: 'bg-yellow-950/60',
    popupBg: 'bg-yellow-950/95',
    overlayBg: 'bg-yellow-950/90',
  },
  'vibrant-pink': {
    name: 'Vibrant Pink',
    primary: '#ff66c4',
    primaryRgb: '255, 102, 196',
    primaryBg: 'bg-[#ff66c4]',
    bgGradient: 'from-[#2a051a] via-[#0a010a] to-[#2a051a]',
    accent: 'text-[#ff66c4]',
    border: 'border-[#ff66c4]',
    shadow: 'shadow-[0_0_30px_rgba(255,102,196,0.4)]',
    glow: 'bg-[#ff66c4]/10',
    bodyBg: 'bg-[#0f020a]',
    cardBg: 'bg-pink-900/20',
    navBg: 'bg-pink-950/60',
    popupBg: 'bg-pink-950/95',
    overlayBg: 'bg-pink-950/90',
  }
};

// --- Components ---

// --- Components ---
const SettingsModal = ({ 
  isOpen, 
  onClose, 
  theme, 
  setTheme, 
  volume, 
  setVolume, 
  currentTrack, 
  setCurrentTrack,
  isAudioOn,
  setIsAudioOn
}: { 
  isOpen: boolean; 
  onClose: () => void;
  theme: keyof typeof THEMES;
  setTheme: (t: keyof typeof THEMES) => void;
  volume: number;
  setVolume: (v: number) => void;
  currentTrack: typeof BG_MUSIC_TRACKS[0];
  setCurrentTrack: (t: typeof BG_MUSIC_TRACKS[0]) => void;
  isAudioOn: boolean;
  setIsAudioOn: (v: boolean) => void;
}) => {
  const currentTheme = THEMES[theme];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 backdrop-blur-md", currentTheme.overlayBg)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn("relative w-full max-w-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]", currentTheme.popupBg)}
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", currentTheme.primaryBg)}>
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">Pro Settings</h2>
                  <p className="text-[10px] font-black text-white/40 tracking-widest">Customize your experience</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Monitor size={18} className={currentTheme.accent} />
                  <h3 className="text-sm font-black text-white tracking-widest">Color Templates</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "relative group p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                        theme === t 
                          ? cn("border-white", currentTheme.cardBg) 
                          : "border-white/5 bg-white/[0.02] hover:border-white/20"
                      )}
                    >
                      <div 
                        className="w-full h-12 rounded-lg mb-3 shadow-lg transition-transform group-hover:scale-105 duration-300" 
                        style={{ backgroundColor: THEMES[t].primary }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">Template Color</span>
                        <span className={cn("text-[10px] font-black tracking-widest", theme === t ? "text-white" : "text-white/40")}>
                          {THEMES[t].name}
                        </span>
                      </div>
                      {theme === t && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 size={12} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Audio Settings */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Music size={18} className={currentTheme.accent} />
                  <h3 className="text-sm font-black text-white tracking-widest">Audio & Background Music</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Volume Slider */}
                  <div className={cn("p-6 rounded-2xl border border-white/5", currentTheme.cardBg)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {volume > 0 ? <Volume2 size={16} className="text-white/40" /> : <VolumeX size={16} className="text-white/40" />}
                        <span className="text-[10px] font-black text-white/40 tracking-widest">Master Volume</span>
                      </div>
                      <span className="text-xs font-black text-white">{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className={cn("w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer", currentTheme.accent.replace('text-', 'accent-'))}
                    />
                  </div>

                  {/* Music List */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-[8px] font-black text-white/20 tracking-widest">Available Tracks</span>
                      <button 
                        onClick={() => setIsAudioOn(!isAudioOn)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black tracking-widest transition-all",
                          isAudioOn ? cn("text-white shadow-lg", currentTheme.primaryBg) : "bg-white/10 text-white/40"
                        )}
                      >
                        {isAudioOn ? 'Music ON' : 'Music OFF'}
                      </button>
                    </div>
                    {BG_MUSIC_TRACKS.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setCurrentTrack(track)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all group",
                          currentTrack.id === track.id 
                            ? cn("border-white", currentTheme.cardBg) 
                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            currentTrack.id === track.id ? currentTheme.primaryBg : "bg-white/5 text-white/20"
                          )}>
                            <Music size={14} />
                          </div>
                          <div className="text-left">
                            <p className={cn("text-xs font-bold", currentTrack.id === track.id ? "text-white" : "text-white/40")}>{track.name}</p>
                            <p className="text-[8px] font-black text-white/20 tracking-widest">Background Score</p>
                          </div>
                        </div>
                        {currentTrack.id === track.id && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((i) => (
                              <motion.div 
                                key={i}
                                animate={{ height: [4, 12, 4] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className={cn("w-0.5 rounded-full", currentTheme.primaryBg.replace('bg-', 'bg-'))}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className={cn("p-8 border-t flex justify-end", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
              <button 
                onClick={onClose}
                className={cn("px-8 py-3 rounded-xl font-black text-xs tracking-widest text-white transition-all", currentTheme.primaryBg, currentTheme.shadow)}
              >
                Close Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const HowToUseModal = ({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void; theme: keyof typeof THEMES }) => {
  const currentTheme = THEMES[theme];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 backdrop-blur-md", currentTheme.overlayBg)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn("relative w-full max-w-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]", currentTheme.popupBg)}
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", currentTheme.primaryBg)}>
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">How to Use & Play</h2>
                  <p className="text-[10px] font-black text-white/40 tracking-widest">Master the interactive experience</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all", currentTheme.cardBg, "hover:bg-white/10")}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Connect", desc: "Enter your Kick username in the setup area and click save. Your profile will be automatically fetched.", icon: <Users /> },
                  { title: "Choose Game", desc: "Select one of the available arenas from the grid. Each game has unique chat interactions.", icon: <Search /> },
                  { title: "Chat Commands", desc: "Your viewers can play directly from your Kick chat using specific commands for each game.", icon: <Zap /> },
                  { title: "Overlay", desc: "Use the built-in camera overlay and streamer info to create a professional broadcast look.", icon: <Monitor /> },
                ].map((step, i) => (
                  <GlassCard key={i} theme={theme} className="p-6 border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      {React.cloneElement(step.icon as React.ReactElement, { size: 60 })}
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", currentTheme.primaryBg)}>
                      {React.cloneElement(step.icon as React.ReactElement, { size: 20 })}
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tighter mb-2">{step.title}</h3>
                    <p className="text-white/50 text-xs font-medium leading-relaxed">{step.desc}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
            <div className={cn("p-8 border-t border-white/5 flex justify-end", currentTheme.cardBg)}>
              <button 
                onClick={onClose}
                className={cn("px-8 py-3 rounded-xl font-black text-xs tracking-widest text-white transition-all", currentTheme.primaryBg, currentTheme.shadow)}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AboutModal = ({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void; theme: keyof typeof THEMES }) => {
  const currentTheme = THEMES[theme];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 backdrop-blur-md", currentTheme.overlayBg)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn("relative w-full max-w-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]", currentTheme.popupBg)}
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", currentTheme.primaryBg)}>
                  <Info size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">About the Creator</h2>
                  <p className="text-[10px] font-black text-white/40 tracking-widest">Meet the mind behind the games</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all", currentTheme.cardBg, "hover:bg-white/10")}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-12 space-y-8 text-center">
              <h3 className="text-4xl font-black text-white tracking-tighter mb-6 italic">
                Hello, I'm <motion.span 
                  className={cn("inline-block", currentTheme.accent)}
                  animate={{ 
                    textShadow: [
                      "0 0 15px rgba(255,255,255,0.1)", 
                      "0 0 30px rgba(255,255,255,0.2)", 
                      "0 0 15px rgba(255,255,255,0.1)"
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >Graphiicc</motion.span>
              </h3>
              <p className={cn("text-white/70 text-xl font-medium leading-relaxed italic border-l-4 pl-6 text-left max-w-lg mx-auto", currentTheme.border.replace('border-', 'border-l-'))}>
                "I create interactive games designed for streamers and their communities. This platform is built with passion and love, allowing any streamer to engage, play, and connect with their chat in real time. More than just games — it's a shared experience between streamer and audience."
              </p>
              
              <div className="flex justify-center pt-6">
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn("flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-lg", currentTheme.primaryBg, currentTheme.shadow)}
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                  </svg>
                  aminegraphic
                </a>
              </div>
            </div>
            <div className={cn("p-8 border-t border-white/5 flex justify-end", currentTheme.cardBg)}>
              <button 
                onClick={onClose}
                className={cn("px-8 py-3 rounded-xl font-black text-xs tracking-widest text-white transition-all", currentTheme.primaryBg, currentTheme.shadow)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Typewriter = ({ text, speed = 50, delay = 0, className }: { text: string; speed?: number; delay?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayedText("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("inline-block", className)}
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-1 h-[1em] bg-current ml-1 align-middle"
      />
    </motion.span>
  );
};

const GlassCard = ({ children, className, id, theme = 'neon-green' }: { children: React.ReactNode; className?: string; id?: string; key?: any; theme?: keyof typeof THEMES }) => {
  const currentTheme = THEMES[theme];
  return (
    <motion.div 
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden transition-all duration-500", currentTheme.cardBg, className)}
    >
      {children}
    </motion.div>
  );
};

const NeonButton = ({ children, onClick, active, className, id, disabled, theme = 'neon-green' }: { children: React.ReactNode; onClick?: () => void; active?: boolean; className?: string; id?: string; disabled?: boolean; theme?: keyof typeof THEMES }) => {
  const currentTheme = THEMES[theme];
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2",
        active 
          ? cn("text-white shadow-lg hover:shadow-xl", currentTheme.primaryBg, currentTheme.shadow) 
          : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

export default function App() {
  // --- State ---
  const [view, setView] = useState<'home' | 'word-search' | 'settings' | 'how-to-use' | 'about'>('home');
  const [channelName, setChannelName] = useState('n0chh');
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<WordPlacement[]>([]);
  const [currentHint, setCurrentHint] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [topicLabel, setTopicLabel] = useState("Mission Objective");
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [autoProgression, setAutoProgression] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showWinnerScreen, setShowWinnerScreen] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<Record<string, number>>({});
  const [isMusicDropdownOpen, setIsMusicDropdownOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const [recentlyFoundWords, setRecentlyFoundWords] = useState<{word: string, player: string, time: number}[]>([]);
  const [lastRevealedWord, setLastRevealedWord] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>('neon-green');
  const currentTheme = THEMES[theme];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Audio State
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(BG_MUSIC_TRACKS[0]);
  const [kickAvatar, setKickAvatar] = useState(`https://api.dicebear.com/7.x/initials/svg?seed=${channelName}&backgroundColor=53fc18`);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxWordRef = useRef<HTMLAudioElement | null>(null);
  const sfxLevelRef = useRef<HTMLAudioElement | null>(null);

  const fetchKickAvatar = useCallback(async (name: string, retryCount = 0) => {
    if (!name) return;
    try {
      // Use our internal server proxy to bypass CORS and Cloudflare
      const response = await fetch(`/api/kick-channel/${name.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.profile_pic) {
          setKickAvatar(data.user.profile_pic);
          setIsLoadingAvatar(false);
          return;
        }
      } else if (response.status === 400) {
        // Username too short, don't retry
        setIsLoadingAvatar(false);
        return;
      }
      
      // If it fails and we have retries left, try again after a shorter delay
      if (retryCount < 1) {
        setTimeout(() => fetchKickAvatar(name, retryCount + 1), 500);
      } else {
        setKickAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=53fc18`);
        setIsLoadingAvatar(false);
      }
    } catch (error) {
      console.error("Error fetching Kick avatar:", error);
      if (retryCount < 1) {
        setTimeout(() => fetchKickAvatar(name, retryCount + 1), 500);
      } else {
        setKickAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=53fc18`);
        setIsLoadingAvatar(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!channelName) {
      setKickAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=n0chh&backgroundColor=53fc18`);
      setIsLoadingAvatar(false);
      return;
    }

    if (channelName.length < 3 && channelName !== 'n0') {
      // Don't fetch for short names, but update initials for feedback
      setKickAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${channelName}&backgroundColor=53fc18`);
      setIsLoadingAvatar(false);
      return;
    }

    setIsLoadingAvatar(true);
    const timeoutId = setTimeout(() => fetchKickAvatar(channelName), 400);
    return () => clearTimeout(timeoutId);
  }, [channelName, fetchKickAvatar]);

  // --- Game Logic ---
  const loadLevel = useCallback((lvl: number) => {
    const { grid: newGrid, placedWords, hint } = generateLevel(lvl);
    setGrid(newGrid);
    setWordsToFind(placedWords);
    setCurrentHint(hint || "");
    setHintsUsed(0);
    setRevealedHints([]);
    setFoundWords([]);
    setRevealedLetters({});
    setHintedCells([]);

    const labels = [
      "Mission Objective",
      "Today's Challenge",
      "Current Topic",
      "The Arena Theme",
      "Target Category",
      "Battle Field",
      "Strategic Theme",
      "Operation Code",
      "Tactical Intel",
      "Arena Focus"
    ];
    setTopicLabel(labels[Math.floor(Math.random() * labels.length)]);
  }, []);

  const [hintedCells, setHintedCells] = useState<{ r: number, c: number }[]>([]);

  const handleRevealHint = () => {
    const unfoundWords = wordsToFind.filter(w => !foundWords.some(fw => fw.word === w.word));
    if (unfoundWords.length === 0) return;

    const targetWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)].word;
    const cleanWord = targetWord.trim().toUpperCase();
    
    if (!cleanWord || cleanWord.length === 0) return;

    const newHint = `Starts with: ${cleanWord[0]}, Ends with: ${cleanWord[cleanWord.length - 1]} (Length: ${cleanWord.length})`;

    setRevealedHints(prev => [...prev, newHint]);
    setHintsUsed(prev => prev + 1);
  };

  const handleRevealLetter = () => {
    const unfoundWords = wordsToFind.filter(w => !foundWords.some(fw => fw.word === w.word));
    if (unfoundWords.length === 0) return;

    // Pick a random unfound word that hasn't been fully revealed yet
    const eligibleWords = unfoundWords.filter(w => (revealedLetters[w.word] || 0) < w.word.length);
    if (eligibleWords.length === 0) return;

    const targetWordObj = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
    const targetWord = targetWordObj.word;
    
    // Find the next cell to reveal for this word
    const currentRevealedCount = revealedLetters[targetWord] || 0;
    const nextCell = targetWordObj.cells[currentRevealedCount];

    if (nextCell) {
      setHintedCells(prev => [...prev, nextCell]);
    }

    setLastRevealedWord(targetWord);
    setRevealedLetters(prev => ({
      ...prev,
      [targetWord]: currentRevealedCount + 1
    }));
    setHintsUsed(prev => prev + 1);
    playSFX('word');
  };

  useEffect(() => {
    loadLevel(level);
  }, [level, loadLevel]);

  const playSFX = (type: 'word' | 'level') => {
    if (!isAudioOn) return;
    if (type === 'word' && sfxWordRef.current) {
      sfxWordRef.current.currentTime = 0;
      sfxWordRef.current.play().catch(() => {});
    }
    if (type === 'level' && sfxLevelRef.current) {
      sfxLevelRef.current.currentTime = 0;
      sfxLevelRef.current.play().catch(() => {});
    }
  };

  const handleWordFound = useCallback((username: string, word: string) => {
    if (!isGameStarted) return;

    const wordToFind = wordsToFind.find(w => w.word === word.toUpperCase() && !foundWords.some(fw => fw.word === word.toUpperCase()));
    
    if (wordToFind) {
      const newFoundWord: FoundWord = {
        word: wordToFind.word,
        player: username,
        cells: wordToFind.cells,
        color: '#22c55e'
      };

      setFoundWords(prev => [...prev, newFoundWord]);
      setRecentlyFoundWords(prev => [{ word: wordToFind.word, player: username, time: Date.now() }, ...prev].slice(0, 10));
      setPlayers(prev => {
        const player = prev[username] || { username, points: 0, wordsFound: 0, joinTime: Date.now(), foundWordsList: [] };
        return {
          ...prev,
          [username]: {
            ...player,
            points: player.points + 5,
            wordsFound: player.wordsFound + 1,
            foundWordsList: [...(player.foundWordsList || []), { word: wordToFind.word, time: Date.now() }]
          }
        };
      });

      playSFX('word');

      // Check level completion
      if (foundWords.length + 1 === wordsToFind.length) {
        playSFX('level');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#ffffff', '#10b981']
        });
        
        if (autoProgression) {
          setTimeout(() => setLevel(prev => Math.min(prev + 1, 100)), 3000);
        }
      }
    }
  }, [wordsToFind, foundWords, isGameStarted, autoProgression, isAudioOn]);

  const onChatMessage = useCallback((username: string, message: string, identity?: { avatar?: string, color?: string, badges?: any[] }) => {
    const cleanMsg = message.trim().toUpperCase();
    
    if (cleanMsg === '!QUIZ') {
      console.log("Player joining:", username);
      setPlayers(prev => {
        if (prev[username]) return prev;
        const newPlayer: Player = { 
          username, 
          points: 0, 
          wordsFound: 0, 
          joinTime: Date.now(), 
          foundWordsList: [],
          avatar: identity?.avatar,
          color: identity?.color,
          badges: identity?.badges
        };
        return {
          ...prev,
          [username]: newPlayer
        };
      });
      return;
    }

    // Update player identity info if it's missing or changed
    if (identity) {
      setPlayers(prev => {
        if (!prev[username]) return prev;
        const player = prev[username];
        if (player.avatar === identity.avatar && player.color === identity.color) return prev;
        return {
          ...prev,
          [username]: {
            ...player,
            avatar: identity.avatar,
            color: identity.color,
            badges: identity.badges
          }
        };
      });
    }

    // Check if message is a word in the grid
    handleWordFound(username, cleanMsg);
  }, [handleWordFound]);

  const { isConnected, messages, connect, disconnect } = useKickChat(channelName, onChatMessage);

  // Auto-connect chat when entering game view
  useEffect(() => {
    if (view !== 'home' && channelName) {
      connect();
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [view, channelName, connect, disconnect]);

  // Audio initialization
  useEffect(() => {
    bgMusicRef.current = new Audio(currentTrack.url);
    bgMusicRef.current.loop = true;
    sfxWordRef.current = new Audio(SFX.WORD_FOUND);
    sfxLevelRef.current = new Audio(SFX.LEVEL_COMPLETE);

    return () => {
      bgMusicRef.current?.pause();
      bgMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.src = currentTrack.url;
      bgMusicRef.current.volume = volume;
      if (isAudioOn) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [currentTrack, isAudioOn, volume]);

  const toggleAudio = () => {
    setIsAudioOn(prev => !prev);
    if (isAudioOn) {
      bgMusicRef.current?.pause();
    } else {
      bgMusicRef.current?.play().catch(() => {});
    }
  };

  const finishGame = () => {
    setShowWinnerScreen(true);
    setIsGameStarted(false);
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to reset the game for everyone? All scores and progress will be lost.")) {
      window.location.reload();
    }
  };

  const goToHome = () => {
    setView('home');
    setIsGameStarted(false);
  };

  const startWordSearch = () => {
    setView('word-search');
  };

  // --- Derived Data ---
  const sortedPlayers: Player[] = Object.keys(players)
    .map(key => players[key])
    .sort((a, b) => b.points - a.points);
  const top3 = sortedPlayers.slice(0, 3);
  const remainingWords = wordsToFind.length - foundWords.length;

  // --- Render Helpers ---
  const isCellFound = (r: number, c: number) => {
    return foundWords.some(fw => fw.cells.some(cell => cell.r === r && cell.c === c));
  };

  const getMoroccoTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Casablanca',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  const renderHeader = () => (
    <header className={cn("h-20 border-b border-white/10 backdrop-blur-2xl flex items-center justify-between px-10 z-50 sticky top-0 transition-all duration-500", currentTheme.navBg)}>
      <div className="flex items-center gap-8">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => setView('home')}
          className={cn("w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-500 cursor-pointer relative", currentTheme.border, currentTheme.glow, currentTheme.shadow)}
        >
          <img 
            id="channel-avatar"
            src={kickAvatar} 
            alt="Avatar" 
            className={cn("w-full h-full object-cover rounded-lg transition-opacity duration-300", isLoadingAvatar ? "opacity-20" : "opacity-100")}
            referrerPolicy="no-referrer"
          />
          {isLoadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
          )}
        </motion.div>
        <div className="flex flex-col">
          <span className="text-white font-black text-lg tracking-tighter leading-none">{channelName}</span>
          <span className={cn("text-[10px] font-bold tracking-widest opacity-80", currentTheme.accent)}>Live Dashboard</span>
        </div>
      </div>

      {/* Middle: Main Menu - Pro Style */}
      <nav className={cn("hidden lg:flex items-center gap-2 p-1.5 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md", currentTheme.cardBg)}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('home')}
          className={cn(
            "text-[10px] font-black tracking-[0.3em] transition-all duration-500 relative flex items-center gap-2 px-6 py-3 rounded-xl",
            view === 'home' ? cn("text-white shadow-lg border", currentTheme.glow, currentTheme.border, currentTheme.shadow) : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Home size={14} /> Home
        </motion.button>
        
        <div className="relative group">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsGamesMenuOpen(!isGamesMenuOpen)}
            className={cn(
              "text-[10px] font-black tracking-[0.3em] transition-all duration-500 flex items-center gap-2 px-6 py-3 rounded-xl",
              view !== 'home' ? cn("text-white shadow-lg border", currentTheme.glow, currentTheme.border, currentTheme.shadow) : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Gamepad2 size={14} /> Arenas <ChevronDown size={14} className={cn("transition-transform duration-300", isGamesMenuOpen && "rotate-180")} />
          </motion.button>
          <AnimatePresence>
            {isGamesMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className={cn("absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.9)] z-[100]", currentTheme.popupBg)}
              >
                <div className="px-4 py-3 mb-3 border-b border-white/5">
                  <span className="text-[9px] font-black text-white/30 tracking-[0.4em]">Select Arena</span>
                </div>
                <button 
                  onClick={() => {
                    setView('word-search');
                    setIsGamesMenuOpen(false);
                  }}
                  className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group border border-transparent", `hover:${currentTheme.glow} hover:${currentTheme.border.replace('border-', 'border-')}/20`)}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg", currentTheme.glow, `group-hover:${currentTheme.primaryBg}`)}>
                    <Search size={18} className={cn(currentTheme.accent, "group-hover:text-white")} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black tracking-widest text-white/70 group-hover:text-white">Word Search</span>
                    <span className="text-[9px] text-white/30 font-bold">Multiplayer</span>
                  </div>
                </button>
                <div className={cn("h-px my-3", currentTheme.border, "opacity-10")} />
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-4 p-4 rounded-2xl opacity-30 cursor-not-allowed text-left grayscale">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentTheme.glow)}>
                      <HelpCircle size={18} className={currentTheme.accent} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black tracking-widest text-white/60">Trivia</span>
                      <span className="text-[9px] text-white/20 font-bold">Coming Soon</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-4 p-4 rounded-2xl opacity-30 cursor-not-allowed text-left grayscale">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentTheme.glow)}>
                      <Zap size={18} className={currentTheme.accent} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black tracking-widest text-white/60">Battle Royale</span>
                      <span className="text-[9px] text-white/20 font-bold">Coming Soon</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsHowToUseOpen(true)}
          className="text-[10px] font-black tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all duration-500 flex items-center gap-2 px-6 py-3 rounded-xl"
        >
          <BookOpen size={14} /> Guide
        </motion.button>
      </nav>

      {/* Right: User Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-px bg-white/10 mx-2" />
        </div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAboutOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Users size={18} />
        </motion.div>
      </div>
    </header>
  );

  if (isMobile) {
    return (
      <div className={cn("fixed inset-0 z-[9999] flex flex-col items-center justify-center p-10 text-center", currentTheme.bodyBg)}>
        <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center mb-8 border shadow-lg", currentTheme.glow, currentTheme.border)}>
          <Monitor size={48} className={currentTheme.accent} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">PC Experience Only</h1>
        <p className="text-white/40 max-w-xs leading-relaxed font-medium tracking-widest text-[10px]">
          This application is designed for high-resolution desktop displays. Please use a PC to play.
        </p>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className={cn("min-h-screen text-white font-sans selection:bg-white/30 overflow-hidden flex flex-col relative transition-colors duration-1000", currentTheme.bodyBg, theme)}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-1000", currentTheme.bgGradient)} />
          <div className={cn("absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[180px] rounded-full animate-pulse transition-all duration-1000", currentTheme.glow)} />
          <div className={cn("absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[180px] rounded-full animate-pulse transition-all duration-1000", currentTheme.glow)} style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white/[0.02] blur-[250px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />
        </div>

        {renderHeader()}

        {/* --- Content --- */}
        <main className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Setup Area */}
                  <section className="mb-20">
                    <GlassCard theme={theme} className="p-10 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                      <div className={cn("absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 group-hover:opacity-20 transition-opacity duration-700", currentTheme.glow)} />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-center">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={cn("w-8 h-px", currentTheme.primaryBg)} />
                            <span className={cn("text-xs font-black tracking-[0.4em]", currentTheme.accent)}>
                              <Typewriter text="Streamer Integration" speed={100} />
                            </span>
                          </div>
                          <h2 className="text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                            Ready to{" "}
                            <span className={currentTheme.accent}>
                              Engage
                            </span> <br />
                            Your Community?
                          </h2>
                          <p className="text-white/50 text-lg font-medium leading-relaxed max-w-xl mb-8">
                            Connect your Kick channel in seconds and start playing interactive games live with your viewers. No complex setup required.
                          </p>
                          
                          <div className="flex gap-4 max-w-md">
                            <div className="relative flex-1">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
                                <Users size={20} />
                              </div>
                              <input 
                                type="text" 
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="Enter Kick Username"
                                className={cn("w-full border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white font-bold focus:outline-none transition-all text-lg placeholder:text-white/10 shadow-inner", currentTheme.cardBg, `focus:border-primary focus:ring-4 focus:ring-primary/10`)}
                                style={{ borderColor: isSaving ? currentTheme.primary : undefined }}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                setIsSaving(true);
                                fetchKickAvatar(channelName);
                                setTimeout(() => setIsSaving(false), 2000);
                              }}
                              disabled={isSaving}
                              className={cn(
                                "px-8 rounded-2xl font-black text-sm tracking-widest transition-all duration-500 flex items-center gap-2 overflow-hidden relative",
                                isSaving ? "bg-white text-black" : cn(currentTheme.primaryBg, "text-white", currentTheme.shadow)
                              )}
                            >
                              <AnimatePresence mode="wait">
                                {isSaving ? (
                                  <motion.div 
                                    key="saving"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <CheckCircle2 size={20} className="text-white" />
                                    Saved!
                                  </motion.div>
                                ) : (
                                  <motion.div 
                                    key="save"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <Zap size={20} fill="currentColor" />
                                    Save
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <div className={cn("absolute inset-0 blur-[80px] rounded-full scale-110 animate-pulse transition-all duration-1000", currentTheme.glow)} />
                          <div className={cn("relative aspect-square rounded-[40px] border-4 border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center group", currentTheme.popupBg)}>
                            <div className={cn("w-40 h-40 rounded-full border-4 p-1 mb-6 transform group-hover:scale-110 transition-all duration-500 relative", currentTheme.border, currentTheme.shadow, currentTheme.cardBg)}>
                              <img 
                                key={kickAvatar}
                                id="channel-avatar"
                                src={kickAvatar} 
                                alt={channelName} 
                                className={cn("w-full h-full rounded-full object-cover transition-all duration-500", isLoadingAvatar ? "opacity-20 scale-90 blur-sm" : "opacity-100 scale-100 blur-0")}
                                referrerPolicy="no-referrer"
                              />
                              {isLoadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <Loader2 size={40} className="text-white animate-spin" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <img 
                                src="https://logos-world.net/wp-content/uploads/2024/01/Kick-Logo.png" 
                                alt="Kick" 
                                className="h-4 w-auto object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white tracking-tighter">{channelName}</span>
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shadow-lg", currentTheme.primaryBg)}>
                                  <Check size={14} strokeWidth={4} className="text-white" />
                                </div>
                              </div>
                            </div>
                            <div className={cn("flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-500 bg-white/5 border-white/10 shadow-lg")}>
                              <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", currentTheme.primaryBg)}>
                                <Check size={10} strokeWidth={4} className="text-white" />
                              </div>
                              <span className="text-[10px] font-black tracking-widest text-white/60">Live Status</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </section>

                  {/* Games Grid */}
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-4xl font-black text-white tracking-tighter italic">
                        Available <span className={currentTheme.accent}>Arenas</span>
                      </h2>
                      <p className="text-white/40 font-bold tracking-[0.4em] text-xs">Choose your next interactive challenge</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {/* Word Search Pro Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startWordSearch}
                      className="group cursor-pointer"
                    >
                      <GlassCard theme={theme} className={cn("h-[500px] relative flex flex-col border-white/10 transition-all duration-500", `hover:${currentTheme.border.replace('border-', 'border-')}`, `group-hover:${currentTheme.shadow}`)}>
                        <div className="h-3/5 overflow-hidden relative">
                          <img 
                            src={WORD_SEARCH_IMAGE} 
                            alt="Word Search" 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent", currentTheme.bodyBg.replace('bg-', 'from-'))} />
                          <div className={cn("absolute top-6 right-6 px-4 py-1.5 text-white text-[10px] font-black rounded-full shadow-lg z-20", currentTheme.primaryBg)}>
                            Popular
                          </div>
                          <div className="absolute bottom-6 left-6 z-20">
                            <div className={cn("flex items-center gap-2 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5", currentTheme.cardBg)}>
                              <Users size={14} className={currentTheme.accent} />
                              <span className="text-[10px] font-black text-white tracking-widest">1.2k Playing</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-1 relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", currentTheme.primaryBg, "bg-opacity-20")}>
                              <Search size={12} className="text-white" />
                            </div>
                            <span className={cn("text-[10px] font-black tracking-widest", currentTheme.accent)}>Multiplayer Puzzle</span>
                          </div>
                          <h3 className={cn("text-4xl font-black text-white tracking-tighter mb-4 transition-colors", `group-hover:${currentTheme.accent}`)}>Word Search <span className={cn("transition-colors", currentTheme.accent, "group-hover:text-white")}>Pro</span></h3>
                          <p className="text-white/50 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                            Let your viewers find hidden words in the grid. Real-time chat integration with points and levels.
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-4 text-white/30 text-[10px] font-bold tracking-widest">
                              <div className="flex items-center gap-1.5"><Zap size={12} className={currentTheme.accent} /> Real-time</div>
                              <div className="flex items-center gap-1.5"><Trophy size={12} className={currentTheme.accent} /> Rewards</div>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500", currentTheme.primaryBg, currentTheme.shadow)}>
                              <Play size={24} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Coming Soon Cards */}
                    {[
                      { title: "Trivia", icon: <HelpCircle />, desc: "Test your chat's knowledge with fast-paced quiz questions.", color: "blue", image: "https://picsum.photos/seed/trivia/800/600" },
                      { title: "Battle Royale", icon: <Zap />, desc: "A survival game where chat commands determine the winner.", color: "red", image: "https://picsum.photos/seed/battle/800/600" },
                    ].map((game, i) => (
                      <div key={i} className="opacity-60 group cursor-not-allowed">
                        <GlassCard theme={theme} className="h-[500px] relative flex flex-col border-white/10 transition-all duration-500">
                          <div className="h-3/5 overflow-hidden relative">
                            <img 
                              src={game.image} 
                              alt={game.title} 
                              className="w-full h-full object-cover opacity-40 grayscale"
                              referrerPolicy="no-referrer"
                            />
                            <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent", currentTheme.bodyBg.replace('bg-', 'from-'))} />
                            <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/10 text-white/40 text-[10px] font-black rounded-full border border-white/10 z-20">
                              COMING SOON
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 backdrop-blur-sm">
                                {game.icon}
                              </div>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col flex-1 relative">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                                {game.icon}
                              </div>
                              <span className="text-[10px] font-black text-white/20 tracking-widest">Interactive Game</span>
                            </div>
                            <h3 className="text-4xl font-black text-white/20 tracking-tighter mb-4">{game.title}</h3>
                            <p className="text-white/20 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                              {game.desc}
                            </p>
                            <div className="mt-auto flex items-center justify-between opacity-20">
                              <div className="flex items-center gap-4 text-white/30 text-[10px] font-bold tracking-widest">
                                <div className="flex items-center gap-1.5"><Zap size={12} /> Real-time</div>
                                <div className="flex items-center gap-1.5"><Trophy size={12} /> Rewards</div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* --- Footer --- */}
        <footer className={cn("h-20 border-t border-white/5 backdrop-blur-md flex items-center justify-between px-12 z-50", currentTheme.navBg)}>
          <p className="text-[10px] font-bold text-white/20 tracking-[0.5em]">
            © 2026 Interactive Games for Kick Chat • Built for Streamers
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <button className="text-[10px] font-black text-white/40 hover:text-white transition-colors tracking-widest">Privacy</button>
              <button className="text-[10px] font-black text-white/40 hover:text-white transition-colors tracking-widest">Terms</button>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", currentTheme.primaryBg)} />
                <span className="text-[8px] font-black text-white/40 tracking-widest">Server Status: Optimal</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          volume={volume}
          setVolume={setVolume}
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isAudioOn={isAudioOn}
          setIsAudioOn={setIsAudioOn}
        />
        <HowToUseModal 
          isOpen={isHowToUseOpen} 
          onClose={() => setIsHowToUseOpen(false)}
          theme={theme}
        />
        <AboutModal 
          isOpen={isAboutOpen} 
          onClose={() => setIsAboutOpen(false)}
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen text-white font-sans selection:bg-white/30 overflow-hidden flex flex-col relative transition-colors duration-1000", currentTheme.bodyBg, theme)}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-1000", currentTheme.bgGradient)} />
        <div className={cn("absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[180px] rounded-full animate-pulse transition-all duration-1000", currentTheme.glow)} />
        <div className={cn("absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[180px] rounded-full animate-pulse transition-all duration-1000", currentTheme.glow)} style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white/[0.02] blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />
      </div>

      {/* --- Header --- */}
      {renderHeader()}

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 grid grid-cols-[380px_1fr_330px] gap-6 overflow-hidden">
        
        {/* Left Sidebar: Camera, Leaderboard & Top 3 */}
        <div className="flex flex-col gap-6 overflow-hidden w-[380px]">
          {/* Camera Overlay Box */}
          <div className="flex flex-col gap-4">
            <div className={cn("relative aspect-video w-full overflow-hidden border-4 backdrop-blur-sm group rounded-none shadow-2xl", currentTheme.popupBg, currentTheme.border)}>
              {/* Animated Border */}
              <motion.div 
                animate={{ 
                  borderColor: [`${currentTheme.primary}33`, `${currentTheme.primary}99`, `${currentTheme.primary}33`],
                  boxShadow: [
                    `inset 0 0 40px ${currentTheme.primary}00`, 
                    `inset 0 0 40px ${currentTheme.primary}33`, 
                    `inset 0 0 40px ${currentTheme.primary}00`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border-4 pointer-events-none z-20 rounded-none"
              />
              
              <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-10", currentTheme.overlayBg)}>
                {/* Empty overlay for facecam */}
              </div>

              {/* Corner Accents */}
              <div className={cn("absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 z-30 opacity-50", currentTheme.border)} />
              <div className={cn("absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 z-30 opacity-50", currentTheme.border)} />
              <div className={cn("absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 z-30 opacity-50", currentTheme.border)} />
              <div className={cn("absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 z-30 opacity-50", currentTheme.border)} />
            </div>

            {/* Streamer Info BELOW Cam Overlay */}
            <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center p-2 shadow-inner", currentTheme.cardBg)}>
                    <img 
                      src="https://logos-world.net/wp-content/uploads/2024/01/Kick-Logo.png" 
                      alt="Kick" 
                      className="w-full h-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[8px] font-black tracking-widest", currentTheme.accent)}>Kick Streamer</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white tracking-tighter leading-none">{channelName}</span>
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shadow-lg", currentTheme.primaryBg)}>
                        <Check size={10} strokeWidth={4} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shadow-lg relative">
                  <img 
                    id="channel-avatar"
                    src={kickAvatar} 
                    alt="Avatar" 
                    className={cn("w-full h-full object-cover transition-opacity duration-300", isLoadingAvatar ? "opacity-20" : "opacity-100")}
                    referrerPolicy="no-referrer"
                  />
                  {isLoadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={14} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="h-px bg-white/5 w-full my-1" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", currentTheme.primaryBg)} />
                  <span className="text-[10px] font-black text-white/40 tracking-widest">Live Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Podium (Hall of Fame) */}
          <GlassCard theme={theme} className="p-6 border-white/10 shadow-2xl transition-all duration-500">
            <h2 className={cn("text-[10px] font-black tracking-[0.3em] mb-8 flex items-center gap-2", currentTheme.accent)}>
              <Trophy size={14} /> Hall of Fame
            </h2>
            <div className="flex items-end justify-center gap-2 h-40">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                  <div className={cn("w-12 h-12 rounded-full border-2 p-0.5 shadow-lg", currentTheme.border, currentTheme.cardBg)}>
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${top3[1].username}`} className="rounded-full" referrerPolicy="no-referrer" />
                    </div>
                    <div className={cn("absolute -top-2 -right-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full", currentTheme.primaryBg)}>2nd</div>
                  </div>
                  <div className={cn("w-16 h-16 border-t-2 flex items-center justify-center font-black text-xl rounded-t-xl", currentTheme.glow, currentTheme.border, currentTheme.accent)}>2</div>
                  <span className="text-[10px] font-bold truncate w-16 text-center text-white">{top3[1].username}</span>
                </motion.div>
              )}
              {/* 1st Place */}
              {top3[0] && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                    <div className={cn("w-16 h-16 rounded-full border-2 p-0.5 shadow-2xl bg-white", currentTheme.border)}>
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${top3[0].username}`} className="rounded-full" referrerPolicy="no-referrer" />
                    </div>
                    <div className={cn("absolute -top-3 -right-3 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce", currentTheme.primaryBg)}>1st</div>
                  </div>
                  <div className={cn("w-20 h-24 border-t-2 flex items-center justify-center font-black text-3xl text-white shadow-lg rounded-t-xl", currentTheme.primaryBg, currentTheme.border)}>1</div>
                  <span className={cn("text-xs font-black truncate w-20 text-center", currentTheme.accent)}>{top3[0].username}</span>
                </motion.div>
              )}
              {/* 3rd Place */}
              {top3[2] && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                    <div className={cn("w-12 h-12 rounded-full border-2 p-0.5 shadow-lg", currentTheme.border, currentTheme.cardBg)}>
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${top3[2].username}`} className="rounded-full" referrerPolicy="no-referrer" />
                    </div>
                    <div className={cn("absolute -top-2 -right-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full", currentTheme.primaryBg)}>3rd</div>
                  </div>
                  <div className={cn("w-16 h-12 border-t-2 flex items-center justify-center font-black text-xl rounded-t-xl", currentTheme.glow, currentTheme.border, currentTheme.accent)}>3</div>
                  <span className="text-[10px] font-bold truncate w-16 text-center text-white">{top3[2].username}</span>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Leaderboard List */}
          <GlassCard theme={theme} className="h-[400px] flex flex-col border-white/5 shadow-2xl transition-all duration-500">
            <div className={cn("p-4 border-b flex items-center justify-between", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
              <h2 className={cn("font-black text-[10px] tracking-[0.2em] flex items-center gap-2", currentTheme.accent)}>
                <Zap size={14} className="animate-pulse" /> Leaderboard
              </h2>
              <span className="text-[8px] text-white/20 tracking-tighter font-black">!quiz to join</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {sortedPlayers.map((player, idx) => (
                <motion.div
                  key={player.username}
                  layout
                  onClick={() => setSelectedPlayer(player)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer transition-all group",
                    `hover:${currentTheme.cardBg}`,
                    `hover:${currentTheme.border.replace('border-', 'border-')}`
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 transition-colors", `group-hover:${currentTheme.primaryBg}`, "group-hover:text-white")}>
                      {idx + 1}
                    </div>
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.username}`} className="w-8 h-8 rounded-lg bg-white/10 border border-white/10" referrerPolicy="no-referrer" />
                    <span className={cn("font-bold text-sm transition-colors truncate w-24", `group-hover:${currentTheme.accent}`)}>{player.username}</span>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-black", currentTheme.accent)}>{player.points}</div>
                    <div className="text-[8px] text-white/30 font-bold">{player.wordsFound} pts</div>
                  </div>
                </motion.div>
              ))}
              {sortedPlayers.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2 p-8 text-center">
                  <Users size={32} />
                  <p className="text-sm">Waiting for players to join...</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Center: Game Grid */}
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Level & Topic Section */}
          <div className="flex flex-col gap-4">
            {currentHint && (
              <div className={cn("relative group overflow-hidden border-2 rounded-3xl p-6 shadow-2xl transition-all duration-500", currentTheme.cardBg, currentTheme.border.replace('border-', 'border-'))}>
                {/* Background Glow */}
                <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-16 -mt-16 rounded-full opacity-20", currentTheme.glow)} />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className={cn("px-3 py-1 text-white text-[10px] font-black rounded-full shadow-lg", currentTheme.primaryBg)}>
                        LEVEL {level}
                      </div>
                      <span className={cn("text-[9px] font-black tracking-[0.4em]", currentTheme.accent)}>
                        {topicLabel}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {currentHint}
                    </h2>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <NeonButton 
                      theme={theme}
                      onClick={handleRevealHint}
                      className="w-[180px] justify-center py-3 text-sm font-black tracking-widest hover:scale-105"
                      active
                    >
                      <Search size={18} /> HINT
                    </NeonButton>
                    <p className="text-[10px] font-bold text-white/30 tracking-widest">
                      {hintsUsed} HINTS USED
                    </p>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {revealedHints.length > 0 ? (
                <motion.div
                  key={revealedHints.length}
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.95 }}
                  className="relative group"
                >
                  <GlassCard theme={theme} className={cn("h-40 flex items-center justify-center border-white/10 shadow-2xl overflow-visible transition-all duration-500")}>
                    <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 border text-white text-[10px] font-black rounded-full tracking-[0.3em] shadow-lg", currentTheme.primaryBg, currentTheme.border)}>
                      Hint {revealedHints.length}
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] px-8">
                      <Typewriter text={revealedHints[revealedHints.length - 1]} speed={30} />
                    </h2>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-40 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-white/10"
                >
                  <Search size={48} strokeWidth={1} />
                  <p className="text-sm font-bold tracking-[0.3em] text-white">Click "Get Hint" to start</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={cn("flex items-center justify-center gap-12 border-2 rounded-3xl p-6 shadow-2xl backdrop-blur-xl transition-all duration-500", currentTheme.cardBg, currentTheme.border)}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-1 px-3 border border-white/10">
                <button 
                  onClick={() => setLevel(prev => Math.max(1, prev - 1))}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-[8px] text-white/30 font-black tracking-widest">Level</span>
                  <span className={cn("text-sm font-black", currentTheme.accent)}>{level}</span>
                </div>
                <button 
                  onClick={() => setLevel(prev => prev + 1)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-12">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-white/30 font-black tracking-widest">Players</span>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className={currentTheme.accent} />
                    <span className="text-sm font-black text-white">{sortedPlayers.length}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-white/30 font-black tracking-widest">Found</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className={currentTheme.accent} />
                    <span className="text-sm font-black text-white">{foundWords.length}/{wordsToFind.length}</span>
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-3">
                <span className="text-[8px] text-white/30 font-black tracking-widest">Auto</span>
                <button 
                  onClick={() => setAutoProgression(!autoProgression)}
                  className={cn(
                    "w-10 h-5 rounded-full p-1 transition-colors duration-300 relative",
                    autoProgression ? currentTheme.primaryBg : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: autoProgression ? 20 : 0 }}
                    className="w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRevealLetter}
                  title="Reveal a letter"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5",
                    currentTheme.cardBg,
                    "hover:bg-white/10"
                  )}
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => window.location.reload()}
                  title="Restart Game"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5",
                    currentTheme.cardBg,
                    "hover:bg-white/10"
                  )}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          <GlassCard theme={theme} className="flex-1 relative p-8 flex items-center justify-center border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div 
              className="grid gap-3 aspect-square max-h-full" 
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(100%, 600px)'
              }}
            >
              {grid.map((row, r) => (
                row.map((char, c) => {
                  const isFound = isCellFound(r, c) || hintedCells.some(hc => hc.r === r && hc.c === c);
                  const foundWord = foundWords.find(fw => fw.cells.some(cell => cell.r === r && cell.c === c));
                  const isHinted = hintedCells.some(hc => hc.r === r && hc.c === c) && !isCellFound(r, c);
                  
                  return (
                    <motion.div 
                      key={`${r}-${c}`}
                      initial={false}
                      animate={isFound ? { 
                        scale: [1, 1.2, 1.1],
                        rotate: [0, 5, 0],
                      } : {}}
                      className={cn(
                        "flex items-center justify-center text-3xl font-black transition-all duration-300 rounded-xl aspect-square border-2 relative overflow-hidden",
                        isFound 
                          ? isHinted 
                            ? cn("text-blue-400 border-blue-500/50 shadow-lg", currentTheme.glow)
                            : cn("text-white shadow-2xl z-10", currentTheme.primaryBg, currentTheme.border) 
                          : cn("text-white border-white/10 hover:border-white/30 shadow-inner", currentTheme.cardBg, "hover:bg-white/10")
                      )}
                    >
                      {isFound && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1.5 }}
                          className="absolute inset-0 bg-white/20 blur-xl rounded-full pointer-events-none"
                        />
                      )}
                      {char}
                    </motion.div>
                  );
                })
              ))}
            </div>

            {/* Overlay for Game Start */}
            <AnimatePresence>
              {!isGameStarted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn("absolute inset-0 z-50 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center", currentTheme.overlayBg)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md w-full"
                  >
                    <div className="relative mb-12 group">
                      <div className={cn("absolute inset-0 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500", currentTheme.glow)} />
                      <div className={cn("relative w-32 h-32 mx-auto rounded-full border-4 p-1 shadow-2xl overflow-hidden", currentTheme.border, currentTheme.shadow, currentTheme.cardBg)}>
                        <img 
                          id="channel-avatar"
                          src={kickAvatar} 
                          className={cn("w-full h-full rounded-full object-cover transition-opacity duration-300", isLoadingAvatar ? "opacity-20" : "opacity-100")}
                          alt={channelName}
                          referrerPolicy="no-referrer"
                        />
                        {isLoadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={32} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-widest", currentTheme.primaryBg)}>
                        Ready to Start
                      </div>
                    </div>

                    <div className="mb-12">
                      <p className={cn("text-6xl font-black animate-pulse tracking-tighter", currentTheme.accent, currentTheme.shadow.replace('shadow-', 'drop-shadow-'))}>
                        !quiz to join
                      </p>
                      <div className="mt-6 h-12 flex items-center justify-center">
                        <Typewriter 
                          text="Tell your chat to type !quiz to join the game and start finding words! Good luck!" 
                          speed={40} 
                          className="text-white/60 text-xs font-bold tracking-[0.2em] italic max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <NeonButton 
                        onClick={() => {
                          connect();
                          setIsGameStarted(true);
                        }}
                        active
                        className="w-full py-8 text-2xl font-black tracking-[0.2em] relative group overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Play size={28} className="mr-2 group-hover:scale-110 transition-transform" />
                        START GAME
                      </NeonButton>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Right Sidebar: Chat & Stats */}
        <div className="flex flex-col gap-6 overflow-hidden w-[330px]">
          {/* Live Chat Overlay */}
          <GlassCard theme={theme} className="w-[330px] h-[400px] flex flex-col border-white/5 shadow-2xl transition-all duration-500">
            <div className={cn("p-4 border-b flex items-center justify-between", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
              <h2 className="font-black text-[10px] tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={14} className={currentTheme.accent} /> Live Chat
              </h2>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                <span className="text-[8px] text-white/20 font-black tracking-widest">{isConnected ? "Online" : "Offline"}</span>
              </div>
            </div>
            <div className={cn("flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar", currentTheme.cardBg)}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={msg.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.username}`} 
                      className="w-5 h-5 rounded object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="flex items-center gap-1">
                      {msg.badges?.map((badge, idx) => {
                        if (!badge.active) return null;
                        switch (badge.type) {
                          case 'moderator': return <Shield key={idx} size={10} className="text-green-500 fill-green-500/20" />;
                          case 'vip': return <Diamond key={idx} size={10} className="text-purple-500 fill-purple-500/20" />;
                          case 'subscriber': return <Star key={idx} size={10} className="text-blue-500 fill-blue-500/20" />;
                          case 'broadcaster': return <Crown key={idx} size={10} className="text-yellow-500 fill-yellow-500/20" />;
                          default: return null;
                        }
                      })}
                      <span 
                        className="text-xs font-bold" 
                        style={{ color: msg.color || undefined }}
                      >
                        {msg.username}
                      </span>
                    </div>
                    <span className="text-[8px] text-white/20">{getMoroccoTime(msg.timestamp)}</span>
                  </div>
                  <div className="text-sm text-white/80 pl-7 leading-tight flex flex-wrap items-center gap-1">
                    {(() => {
                      const emoteRegex = /\[emote:(\d+):([^\]]+)\]/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;

                      while ((match = emoteRegex.exec(msg.message)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(<span key={`text-${lastIndex}`}>{msg.message.substring(lastIndex, match.index)}</span>);
                        }

                        const emoteId = match[1];
                        const emoteName = match[2];
                        
                        parts.push(
                          <img
                            key={`emote-${emoteId}-${match.index}`}
                            src={`https://files.kick.com/emotes/${emoteId}/fullsize`}
                            alt={emoteName}
                            title={emoteName}
                            className="h-6 w-auto inline-block"
                            referrerPolicy="no-referrer"
                          />
                        );

                        lastIndex = emoteRegex.lastIndex;
                      }

                      if (lastIndex < msg.message.length) {
                        parts.push(<span key={`text-${lastIndex}`}>{msg.message.substring(lastIndex)}</span>);
                      }

                      return parts.length > 0 ? parts : msg.message;
                    })()}
                  </div>
                </motion.div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/10 gap-2 text-center p-8">
                  <MessageSquare size={32} />
                  <p className="text-xs">Chat is quiet...<br/>Be the first to say hi!</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Revealed Letters Grid */}
          <GlassCard 
            theme={theme} 
            className="w-[330px] h-[280px] flex flex-col border-white/5 shadow-2xl transition-all duration-500"
          >
            <div className={cn("p-4 border-b flex items-center justify-between", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
              <h2 className="font-black text-[10px] tracking-[0.2em] flex items-center gap-2 uppercase">
                <Eye size={14} className={currentTheme.accent} /> Revealed Letters
              </h2>
              <span className="text-[8px] text-white/20 font-black tracking-widest">{Object.keys(revealedLetters).length} ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {Object.entries(revealedLetters).length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(revealedLetters).map(([word, count]) => (
                    <motion.div 
                      key={word}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: lastRevealedWord === word ? [1, 1.02, 1] : 1,
                        backgroundColor: lastRevealedWord === word ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] : 'rgba(255,255,255,0.05)'
                      }}
                      transition={{ duration: 0.5 }}
                      className="border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-white/10 transition-all relative overflow-hidden"
                    >
                      {lastRevealedWord === word && (
                        <motion.div 
                          layoutId="active-reveal-glow"
                          className={cn("absolute inset-0 opacity-10", currentTheme.primaryBg)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.2, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      <div className="flex items-center gap-2 relative z-10">
                        <div className={cn("w-1.5 h-1.5 rounded-full", currentTheme.primaryBg, lastRevealedWord === word ? "animate-pulse" : "opacity-40")} />
                        <div className={cn("text-[13px] font-black tracking-[0.1em] uppercase", currentTheme.accent)}>
                          {word.substring(0, count as number).split('').join(' ')}
                          <span className="text-white/10 ml-1">
                            {Array(Math.min(3, word.length - (count as number))).fill('.').join('')}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] font-black text-white/40 font-mono">({word.length})</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3 text-center p-8">
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center bg-white/5">
                    <Eye size={24} className="opacity-20" />
                  </div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase leading-relaxed">
                    No hints active<br/>
                    <span className="text-[8px] opacity-50">Click the eye for help</span>
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Recently Found List */}
          <GlassCard theme={theme} className="flex-1 flex flex-col border-white/5 shadow-2xl transition-all duration-500 min-h-[300px]">
                <div className={cn("p-4 border-b bg-white/5 flex items-center justify-between", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
              <h2 className="text-[10px] font-black tracking-[0.2em] text-white/60 flex items-center gap-2">
                <History size={14} className={currentTheme.accent} /> Recently Found
              </h2>
              <span className="text-[8px] font-black text-white/20 tracking-widest">{recentlyFoundWords.length} RECENT</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {recentlyFoundWords.map((item, i) => (
                  <motion.div 
                    key={`${item.word}-${item.time}`}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 shadow-lg relative overflow-hidden group transition-all",
                      `hover:${currentTheme.cardBg}`,
                      `hover:${currentTheme.border.replace('border-', 'border-')}`
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border overflow-hidden", currentTheme.border)}>
                        <img 
                          src={players[item.player]?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.player}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div>
                        <p className={cn("text-sm font-black tracking-tight text-white transition-colors", `group-hover:${currentTheme.accent}`)}>{item.word}</p>
                        <p className="text-[9px] font-bold" style={{ color: players[item.player]?.color || 'rgba(255,255,255,0.3)' }}>
                          Found by {item.player}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", currentTheme.primaryBg, "bg-opacity-10")}>
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {recentlyFoundWords.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/5 gap-2 text-center py-12">
                  <Search size={32} />
                  <p className="text-xs font-bold tracking-widest">No words found yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
            <div className={cn("fixed inset-0 z-[300] backdrop-blur-md flex items-center justify-center p-6", currentTheme.overlayBg)}>
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={cn("w-full max-w-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]", currentTheme.popupBg)}
              >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", currentTheme.primaryBg)}>
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tighter">Word History</h2>
                    <p className="text-[10px] font-bold text-white/40 tracking-widest">All words found in this session</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {foundWords.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {foundWords.map((fw, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full border p-0.5 overflow-hidden", currentTheme.border.replace('border-', 'border-') + '/30')}>
                            <img 
                              src={players[fw.username]?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fw.username}`} 
                              className="w-full h-full object-cover rounded-full" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                          <div>
                            <p className={cn("text-xs font-black tracking-tighter", currentTheme.accent)}>{fw.word}</p>
                            <p className="text-[8px] font-bold tracking-widest" style={{ color: players[fw.username]?.color || 'rgba(255,255,255,0.4)' }}>
                              Found by {fw.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white">+{fw.points}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/10 gap-4">
                    <Search size={48} strokeWidth={1} />
                    <p className="text-sm font-bold tracking-[0.3em]">No words found yet</p>
                  </div>
                )}
              </div>
              
              <div className={cn("p-6 border-t border-white/5 flex justify-between items-center", currentTheme.navBg)}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-white/40 tracking-widest">Total Words</p>
                    <p className={cn("text-xl font-black", currentTheme.accent)}>{foundWords.length}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[8px] font-black text-white/40 tracking-widest">Total Points</p>
                    <p className="text-xl font-black text-white">{foundWords.reduce((acc, curr) => acc + curr.points, 0)}</p>
                  </div>
                </div>
                <NeonButton theme={theme} onClick={() => setIsHistoryOpen(false)} active className="px-8">
                  Close
                </NeonButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Player Modal --- */}
      <AnimatePresence>
        {showWinnerScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("fixed inset-0 z-[200] backdrop-blur-2xl flex items-center justify-center p-6", currentTheme.overlayBg)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="mb-12">
                <Trophy size={120} className={cn("mx-auto animate-bounce", currentTheme.accent.replace('text-', 'text-'))} />
                <h2 className="text-6xl font-black tracking-tighter mt-6 text-white">
                  Game Over
                </h2>
                <p className={cn("tracking-widest font-bold mt-2", currentTheme.accent)}>Final Results</p>
              </div>

              {sortedPlayers[0] ? (
                <div className={cn("border-4 rounded-3xl p-12 mb-8 relative overflow-hidden shadow-2xl", currentTheme.popupBg, currentTheme.border)}>
                  <div className={cn("absolute inset-0 opacity-5 animate-pulse", currentTheme.primaryBg)} />
                  <div className="relative z-10">
                    <div className={cn("w-32 h-32 rounded-full border-4 p-1 mx-auto mb-6 bg-white shadow-xl overflow-hidden", currentTheme.border)}>
                      <img 
                        src={sortedPlayers[0].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${sortedPlayers[0].username}`} 
                        className="w-full h-full rounded-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <h3 className="text-4xl font-black mb-2 text-white" style={{ color: sortedPlayers[0].color || undefined }}>{sortedPlayers[0].username}</h3>
                    <p className={cn("text-xl font-bold tracking-widest", currentTheme.accent)}>🏆 ULTIMATE WINNER 🏆</p>
                    <div className="flex justify-center gap-8 mt-8">
                      <div>
                        <p className="text-[10px] text-white/40 font-bold">Total Points</p>
                        <p className="text-3xl font-black text-white">{sortedPlayers[0].points}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-bold">Words Found</p>
                        <p className="text-3xl font-black text-white">{sortedPlayers[0].wordsFound}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-white/20 font-bold">NO WINNERS THIS TIME</div>
              )}

              <div className="flex gap-4 justify-center">
                <NeonButton 
                  theme={theme}
                  onClick={() => {
                    setShowWinnerScreen(false);
                    setIsGameStarted(true);
                    setPlayers({});
                    setLevel(1);
                    loadLevel(1);
                  }}
                  active
                  className="px-12 py-4 text-lg"
                >
                  Play Again
                </NeonButton>
                <NeonButton 
                  theme={theme}
                  onClick={() => setShowWinnerScreen(false)}
                  className="px-12 py-4 text-lg"
                >
                  Close
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-6", currentTheme.overlayBg)}
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <GlassCard theme={theme} className="p-8 text-center relative">
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                  <SkipForward size={20} className="rotate-90" />
                </button>

                <div className={cn("w-24 h-24 rounded-3xl border-4 p-1 mx-auto mb-6 shadow-2xl bg-white overflow-hidden", currentTheme.border)}>
                  <img 
                    src={selectedPlayer.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedPlayer.username}`} 
                    className="w-full h-full rounded-2xl object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                
                <h2 className="text-2xl font-black mb-1" style={{ color: selectedPlayer.color || undefined }}>{selectedPlayer.username}</h2>
                <p className={cn("font-bold mb-8 tracking-widest", currentTheme.accent)}>{selectedPlayer.points} POINTS</p>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", currentTheme.primaryBg)} />
                    <p className="text-[10px] text-white/30 font-black tracking-widest mb-2">Level Progress</p>
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-4xl font-black text-white">{selectedPlayer.wordsFound}</p>
                      <p className="text-sm font-bold text-white/20">/ {wordsToFind.length} WORDS</p>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedPlayer.wordsFound / wordsToFind.length) * 100}%` }}
                        className={cn("h-full shadow-lg", currentTheme.primaryBg)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] text-white/30 font-bold mb-1">Total Found</p>
                      <p className="text-xl font-bold">{selectedPlayer.wordsFound}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] text-white/30 font-bold mb-1">Rank</p>
                      <p className="text-xl font-bold">#{sortedPlayers.findIndex(p => p.username === selectedPlayer.username) + 1}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] text-white/30 font-bold mb-1">Join Time</p>
                  <p className="text-xl font-bold flex items-center justify-center gap-1">
                    <Clock size={14} className={currentTheme.accent} />
                    {getMoroccoTime(selectedPlayer.joinTime)}
                  </p>
                </div>

                {selectedPlayer.foundWordsList && selectedPlayer.foundWordsList.length > 0 && (
                  <div className="mt-6 text-left">
                    <p className="text-[10px] text-white/30 font-black tracking-widest mb-3 border-b border-white/5 pb-2">Words Found</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {selectedPlayer.foundWordsList.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                          <span className={cn("text-xs font-bold", currentTheme.accent)}>{item.word}</span>
                          <span className="text-[10px] text-white/30 font-mono">{getMoroccoTime(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-[10px] text-white/20 italic">Player joined from Morocco Timezone</p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- How to Use Modal --- */}
      <AnimatePresence>
        {isHowToUseOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHowToUseOpen(false)}
              className={cn("absolute inset-0 backdrop-blur-sm", currentTheme.overlayBg)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl h-[600px] overflow-hidden"
            >
              <GlassCard theme={theme} className="flex flex-col h-full border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <div className={cn("p-6 border-b flex items-center justify-between", currentTheme.navBg, currentTheme.border, "border-opacity-10")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", currentTheme.glow, currentTheme.accent, currentTheme.border.replace('border-', 'border-') + '/30')}>
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tighter">How to Use & Play</h2>
                      <p className="text-[10px] font-bold text-white/40 tracking-widest">Complete Guide for Streamers & Viewers</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsHowToUseOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className={cn("flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar", currentTheme.popupBg)}>
                  {/* Section: For Viewers */}
                  <section className="space-y-4">
                    <div className={cn("flex items-center gap-2", currentTheme.accent)}>
                      <Users size={18} />
                      <h3 className="font-black tracking-widest text-sm">For Your Viewers</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={cn("p-4 rounded-xl border", currentTheme.cardBg, currentTheme.border, "border-opacity-10")}>
                        <p className="text-[10px] font-black text-white/40 mb-2">Step 1: Join</p>
                        <p className="text-xs leading-relaxed text-white/80">Viewers must type <span className={cn("font-bold", currentTheme.accent)}>!quiz</span> in your Kick chat to enter the game and start earning points.</p>
                      </div>
                      <div className={cn("p-4 rounded-xl border", currentTheme.cardBg, currentTheme.border, "border-opacity-10")}>
                        <p className="text-[10px] font-black text-white/40 mb-2">Step 2: Play</p>
                        <p className="text-xs leading-relaxed text-white/80">Once they spot a word in the grid, they simply type the word in chat. The first person to find it gets the points!</p>
                      </div>
                    </div>
                  </section>

                  {/* Section: Point System */}
                  <section className="space-y-4">
                    <div className={cn("flex items-center gap-2", currentTheme.accent)}>
                      <Trophy size={18} />
                      <h3 className="font-black tracking-widest text-sm">Point System</h3>
                    </div>
                    <div className={cn("p-6 rounded-xl border flex items-center justify-between", currentTheme.cardBg, currentTheme.border, "border-opacity-10")}>
                      <div>
                        <p className="text-2xl font-black text-white tracking-tighter">+10 POINTS</p>
                        <p className="text-[10px] font-bold text-white/40 tracking-widest">Per Word Found</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60 leading-relaxed italic">Points are automatically tracked and displayed on the live leaderboard.</p>
                      </div>
                    </div>
                  </section>

                  {/* Section: Q&A */}
                  <section className="space-y-4">
                    <div className={cn("flex items-center gap-2", currentTheme.accent)}>
                      <MessageSquare size={18} />
                      <h3 className="font-black tracking-widest text-sm">Common Questions (Q&A)</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { q: "How do I change the streamer name?", a: "Go to the 'Ready to Play' screen (click Start Over if in-game) and type your Kick username in the input field." },
                        { q: "What are the hints?", a: "Hints reveal the starting letter, ending letter, and total length of a word hidden in the grid." },
                        { q: "Does the game end?", a: "The game features infinite levels. When all words are found, it automatically progresses to a new challenge." },
                        { q: "Can I play on mobile?", a: "The game interface is optimized for PC streamers. Viewers can play from any device by typing in your Kick chat." }
                      ].map((item, i) => (
                        <div key={i} className={cn("p-4 rounded-xl border", currentTheme.cardBg, currentTheme.border, "border-opacity-10")}>
                          <p className={cn("text-[10px] font-black mb-1", currentTheme.accent)}>Q: {item.q}</p>
                          <p className="text-xs text-white/60">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section: Streamer Tips */}
                  <section className="space-y-4">
                    <div className={cn("flex items-center gap-2", currentTheme.accent)}>
                      <Zap size={18} />
                      <h3 className="font-black tracking-widest text-sm">Pro Tips for Streamers</h3>
                    </div>
                    <ul className="space-y-2">
                      {[
                        "Use the 'Reveal Hint' button if your chat gets stuck.",
                        "Change the background music to match your stream's vibe.",
                        "The 'Camera Overlay' box is designed to hold your facecam—position it in OBS!",
                        "Use 'Start Over' to reset the leaderboard for a new stream session."
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-white/70">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", currentTheme.primaryBg)} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className={cn("p-6 border-t border-white/10 flex items-center justify-center", currentTheme.cardBg)}>
                  <button 
                    onClick={() => setIsHowToUseOpen(false)}
                    className={cn("px-12 py-3 font-black tracking-widest text-xs rounded-xl transition-all text-white", currentTheme.primaryBg, currentTheme.shadow)}
                  >
                    Got it, Let's Play!
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        theme={theme}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        volume={volume}
        setVolume={setVolume}
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        isAudioOn={isAudioOn}
        setIsAudioOn={setIsAudioOn}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  );
}
