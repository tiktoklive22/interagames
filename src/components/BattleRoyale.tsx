import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Target, Shield, Zap, Loader2, Play, Users, CheckCircle2, ChevronLeft, ChevronRight, Search, Heart, Skull, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface Player {
  username: string;
  avatar: string;
  health: number;
  kills: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isAlive: boolean;
  lastShootTime: number;
  color: string;
  killHistory: string[];
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: string;
  id: string;
}

interface BattleRoyaleProps {
  channelName: string;
  kickAvatar: string;
  onGameEnd: (winner: Player) => void;
  messages: any[];
}

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const PLAYER_SIZE = 40;
const BULLET_SPEED = 7;
const SHOOT_COOLDOWN = 1000; // 1 second
const DAMAGE = 20;

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'
];

export const BattleRoyale: React.FC<BattleRoyaleProps> = ({ channelName, kickAvatar, onGameEnd, messages }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<{ text: string; time: number }[]>([]);

  const requestRef = useRef<number>();
  const playersRef = useRef<Record<string, Player>>({});
  const bulletsRef = useRef<Bullet[]>([]);

  // Sync refs with state for the game loop
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  const addLog = (text: string) => {
    setLogs(prev => [{ text, time: Date.now() }, ...prev].slice(0, 5));
  };

  const spawnPlayer = (username: string, avatar: string) => {
    if (playersRef.current[username]) return;

    const newPlayer: Player = {
      username,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      health: 100,
      kills: 0,
      x: Math.random() * (ARENA_WIDTH - PLAYER_SIZE),
      y: Math.random() * (ARENA_HEIGHT - PLAYER_SIZE),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      isAlive: true,
      lastShootTime: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      killHistory: []
    };

    setPlayers(prev => ({ ...prev, [username]: newPlayer }));
    addLog(`${username} joined the battle!`);
  };

  const handleCommand = useCallback((username: string, message: string, avatar?: string) => {
    const cleanMsg = message.toLowerCase().trim();
    
    if (cleanMsg === '!play') {
      spawnPlayer(username, avatar || '');
      return;
    }

    if (gameState !== 'playing') return;

    const player = playersRef.current[username];
    if (!player || !player.isAlive) return;

    if (cleanMsg === '!shoot') {
      const now = Date.now();
      if (now - player.lastShootTime < SHOOT_COOLDOWN) return;

      // Shoot in current movement direction or random if still
      let dx = player.vx;
      let dy = player.vy;
      if (dx === 0 && dy === 0) {
        dx = 1;
        dy = 0;
      }
      const mag = Math.sqrt(dx * dx + dy * dy);
      
      const newBullet: Bullet = {
        x: player.x + PLAYER_SIZE / 2,
        y: player.y + PLAYER_SIZE / 2,
        vx: (dx / mag) * BULLET_SPEED,
        vy: (dy / mag) * BULLET_SPEED,
        owner: username,
        id: Math.random().toString(36).substr(2, 9)
      };

      setBullets(prev => [...prev, newBullet]);
      setPlayers(prev => ({
        ...prev,
        [username]: { ...prev[username], lastShootTime: now }
      }));
    } else if (cleanMsg === '!left') {
      setPlayers(prev => ({
        ...prev,
        [username]: { ...prev[username], vx: -2, vy: (Math.random() - 0.5) }
      }));
    } else if (cleanMsg === '!right') {
      setPlayers(prev => ({
        ...prev,
        [username]: { ...prev[username], vx: 2, vy: (Math.random() - 0.5) }
      }));
    } else if (cleanMsg === '!up') {
      setPlayers(prev => ({
        ...prev,
        [username]: { ...prev[username], vy: -2, vx: (Math.random() - 0.5) }
      }));
    } else if (cleanMsg === '!down') {
      setPlayers(prev => ({
        ...prev,
        [username]: { ...prev[username], vy: 2, vx: (Math.random() - 0.5) }
      }));
    }
  }, [gameState]);

  // Process incoming messages for commands
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      handleCommand(lastMsg.username, lastMsg.message, lastMsg.avatar);
    }
  }, [messages, handleCommand]);

  const update = () => {
    if (gameState !== 'playing') return;

    const newPlayers = { ...playersRef.current };
    let newBullets = [...bulletsRef.current];
    const alivePlayers = (Object.values(newPlayers) as Player[]).filter(p => p.isAlive);

    if (alivePlayers.length <= 1 && Object.keys(newPlayers).length > 1) {
      const winnerPlayer = alivePlayers[0];
      if (winnerPlayer) {
        setWinner(winnerPlayer);
        setGameState('ended');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        onGameEnd(winnerPlayer);
      }
    }

    // Update players
    alivePlayers.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > ARENA_WIDTH - PLAYER_SIZE) {
        p.vx *= -1;
        p.x = Math.max(0, Math.min(p.x, ARENA_WIDTH - PLAYER_SIZE));
      }
      if (p.y < 0 || p.y > ARENA_HEIGHT - PLAYER_SIZE) {
        p.vy *= -1;
        p.y = Math.max(0, Math.min(p.y, ARENA_HEIGHT - PLAYER_SIZE));
      }

      // Random movement changes
      if (Math.random() < 0.02) {
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
      }
    });

    // Update bullets
    newBullets = newBullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;

      // Check collision with players
      let hit = false;
      alivePlayers.forEach(p => {
        if (p.username !== b.owner) {
          const dist = Math.sqrt(
            Math.pow(b.x - (p.x + PLAYER_SIZE / 2), 2) + 
            Math.pow(b.y - (p.y + PLAYER_SIZE / 2), 2)
          );

          if (dist < PLAYER_SIZE / 2) {
            hit = true;
            p.health -= DAMAGE;
            if (p.health <= 0) {
              p.isAlive = false;
              p.health = 0;
              const killer = newPlayers[b.owner];
              if (killer) {
                killer.kills += 1;
                killer.killHistory.push(p.username);
                addLog(`${killer.username} eliminated ${p.username}!`);
              }
            }
          }
        }
      });

      // Remove if hit or out of bounds
      return !hit && b.x > 0 && b.x < ARENA_WIDTH && b.y > 0 && b.y < ARENA_HEIGHT;
    });

    setPlayers(newPlayers);
    setBullets(newBullets);
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ARENA_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ARENA_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < ARENA_HEIGHT; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ARENA_WIDTH, i);
      ctx.stroke();
    }

    // Draw Bullets
    bullets.forEach(b => {
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Players
    (Object.values(players) as Player[]).forEach(p => {
      if (!p.isAlive) return;

      // Health Bar
      const barWidth = 50;
      const barHeight = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(p.x + PLAYER_SIZE / 2 - barWidth / 2, p.y - 15, barWidth, barHeight);
      ctx.fillStyle = p.health > 50 ? '#10b981' : p.health > 20 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(p.x + PLAYER_SIZE / 2 - barWidth / 2, p.y - 15, (p.health / 100) * barWidth, barHeight);

      // Avatar Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.clip();
      
      // Draw Avatar (using a placeholder or image)
      // For simplicity in canvas, we'll draw a colored circle if image loading is complex
      // But we can try to draw the image if we pre-load it
      ctx.fillStyle = p.color + '44';
      ctx.fill();
      
      ctx.restore();

      // Username
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(p.username, p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE + 15);
      
      // Kills
      if (p.kills > 0) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px Inter';
        ctx.fillText(`💀 ${p.kills}`, p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE + 28);
      }
    });
  }, [players, bullets]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    if (Object.keys(players).length < 2) {
      addLog("Need at least 2 players to start!");
      return;
    }
    setGameState('playing');
    addLog("BATTLE STARTED!");
  };

  const resetGame = () => {
    setPlayers({});
    setBullets([]);
    setGameState('waiting');
    setWinner(null);
    setLogs([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Swords className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Battle Royale</h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Type <span className="text-red-500">!play</span> to join</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Players Joined</span>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-red-500" />
              <span className="text-xl font-black text-white">{Object.keys(players).length}</span>
            </div>
          </div>
          
          {gameState === 'waiting' && (
            <button 
              onClick={startGame}
              disabled={Object.keys(players).length < 2}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Start Battle
            </button>
          )}

          {gameState === 'ended' && (
            <button 
              onClick={resetGame}
              className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            >
              New Battle
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Arena */}
        <div className="lg:col-span-3 relative aspect-[4/3] bg-black/60 rounded-[40px] border-4 border-white/5 overflow-hidden shadow-2xl">
          <canvas 
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="w-full h-full"
          />

          <AnimatePresence>
            {gameState === 'waiting' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-12"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <Swords size={80} className="text-red-500 relative" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Waiting Room</h3>
                <p className="text-white/60 max-w-md mb-8">
                  Viewers! Type <span className="text-red-500 font-bold">!play</span> in chat to enter the arena. 
                  Once inside, use <span className="text-white font-bold">!shoot</span>, <span className="text-white font-bold">!left</span>, <span className="text-white font-bold">!right</span>, <span className="text-white font-bold">!up</span>, and <span className="text-white font-bold">!down</span> to fight!
                </p>
                
                <div className="flex flex-wrap justify-center gap-3">
                  {(Object.values(players) as Player[]).map(p => (
                    <motion.div 
                      key={p.username}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1"
                    >
                      <img src={p.avatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-xs font-bold text-white">{p.username}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {gameState === 'ended' && winner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-12"
              >
                <Trophy size={100} className="text-yellow-500 mb-6 animate-bounce" />
                <h3 className="text-6xl font-black text-white uppercase tracking-tighter mb-2 italic">Winner Winner!</h3>
                <p className="text-yellow-500 text-xl font-black uppercase tracking-[0.3em] mb-8">Chicken Dinner</p>
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-150" />
                  <div className="relative w-32 h-32 rounded-full border-4 border-yellow-500 p-1">
                    <img src={winner.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-sm uppercase">
                    {winner.username}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 max-w-lg w-full bg-white/5 rounded-3xl p-6 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Kills</span>
                    <span className="text-2xl font-black text-white">{winner.kills}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Health Left</span>
                    <span className="text-2xl font-black text-green-500">{winner.health}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Status</span>
                    <span className="text-2xl font-black text-yellow-500">CHAMPION</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kill Logs */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={log.time}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl"
                >
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{log.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-yellow-500" size={20} />
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Leaderboard</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
              {(Object.values(players) as Player[])
                .sort((a, b) => b.kills - a.kills || (b.isAlive ? 1 : 0) - (a.isAlive ? 1 : 0))
                .map((p, i) => (
                  <div 
                    key={p.username}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all",
                      p.isAlive ? "bg-white/5 border-white/10" : "bg-black/40 border-white/5 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={p.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        {!p.isAlive && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                            <Skull size={16} className="text-red-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white truncate max-w-[100px]">{p.username}</p>
                        <div className="flex items-center gap-2">
                          <Skull size={10} className="text-red-500" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.kills} Kills</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.isAlive ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-0.5">Alive</span>
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${p.health}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Eliminated</span>
                      )}
                    </div>
                  </div>
                ))}
              
              {Object.keys(players).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
                  <Users size={40} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No players yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls Help */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Chat Controls</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">!play</p>
                <p className="text-[8px] text-white/30 uppercase">Join Game</p>
              </div>
              <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">!shoot</p>
                <p className="text-[8px] text-white/30 uppercase">Fire Weapon</p>
              </div>
              <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">!left/!right</p>
                <p className="text-[8px] text-white/30 uppercase">Move Horiz.</p>
              </div>
              <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">!up/!down</p>
                <p className="text-[8px] text-white/30 uppercase">Move Vert.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
