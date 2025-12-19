
import React, { useState } from 'react';
import { GameState, CharacterType } from '../types';
import { CHARACTER_CONFIG, LEVELS, SKILL_CONFIGS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  onSelectLevel: (id: number) => void;
  onSelectCharacter: (type: CharacterType, godMode: boolean) => void;
  onBackToMenu: () => void;
  onStartNextLevel: () => void;
  onTriggerSkill?: (key: 'q' | 'w' | 'e') => void;
  aiMessage: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onSelectLevel, onSelectCharacter, onBackToMenu, onStartNextLevel, onTriggerSkill }) => {
  const [godModeChecked, setGodModeChecked] = useState(false);

  // 1. 关卡选择界面
  if (gameState.selectingLevel) {
    return (
      <div className="absolute inset-0 bg-[#0c0d0f] flex flex-col items-center justify-center p-10 overflow-auto z-[500] pointer-events-auto">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_1px,#333_2px)] bg-[length:100%_3px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a332e_0%,transparent_100%)]" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
          <header className="mb-16 w-full text-left border-l-4 border-emerald-500 pl-8">
            <h1 className="text-7xl font-orbitron font-black text-white tracking-widest uppercase italic drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              战区情报概览 <span className="text-emerald-500">ZONE_DATA</span>
            </h1>
            <p className="text-emerald-500/60 font-black mt-2 tracking-[0.5em] text-xs uppercase">Tactical Terminal v4.02 // High-Level Clearance Only</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full mb-16">
            {LEVELS.map(l => {
              const isUnlocked = gameState.unlockedLevels.includes(l.id);
              const isCleared = gameState.clearedLevels.includes(l.id);
              return (
                <button 
                  key={l.id} 
                  disabled={!isUnlocked} 
                  onClick={() => onSelectLevel(l.id)} 
                  className={`group relative p-8 h-80 border-2 transition-all overflow-hidden flex flex-col justify-end
                    ${isUnlocked 
                      ? 'border-emerald-500/40 bg-black/60 hover:bg-emerald-500/10 hover:border-emerald-400 hover:-translate-y-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' 
                      : 'border-white/5 bg-white/5 grayscale cursor-not-allowed opacity-30'}`}
                >
                  <div className={`absolute -top-6 -right-6 text-[12rem] font-black italic opacity-5 font-orbitron ${isUnlocked ? 'text-emerald-500' : 'text-white'}`}>
                    {l.id}
                  </div>
                  {isCleared && (
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full" />
                      <div className="text-emerald-400 text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                        安全区域 // SECURED
                      </div>
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className={`text-4xl font-black mb-2 font-orbitron ${isUnlocked ? 'text-white' : 'text-white/20'}`}>
                      {l.id.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">
                      {l.name}
                    </div>
                    <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
                       <div className={`h-full bg-emerald-500 transition-all ${isUnlocked ? 'w-full' : 'w-0'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <section className="w-full grid grid-cols-3 gap-8">
            <div className="col-span-2 bg-black/60 border border-white/5 backdrop-blur-md p-10 rounded-sm relative">
              <div className="text-xs font-black text-white/30 mb-6 tracking-[0.4em] uppercase">档案成就 // ACHIEVEMENTS</div>
              <div className="grid grid-cols-2 gap-4">
                {gameState.achievements.map(a => (
                  <div key={a.id} className={`p-4 border transition-all flex items-center gap-4 ${a.unlocked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/2 opacity-20'}`}>
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg ${a.unlocked ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/20'}`}>
                      {a.title[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className={`font-black text-sm tracking-tight ${a.unlocked ? 'text-emerald-400' : 'text-white/40'}`}>{a.title}</div>
                      <div className="text-[10px] text-white/40 font-medium uppercase truncate w-40">{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 flex flex-col justify-between italic">
               <div className="text-emerald-500/40 text-[10px] font-black uppercase tracking-[0.5em]">System Status</div>
               <div className="text-emerald-400 text-sm font-black leading-relaxed">
                  [ 正在连接战区终端... ]<br/>
                  [ 已确认特工权限 ]<br/>
                  [ 环境辐射指数: 极高 ]<br/>
                  [ 准备部署战术支援单元 ]
               </div>
               <div className="h-8 w-full bg-emerald-500/10 border border-emerald-500/20 flex items-center px-4 overflow-hidden">
                  <div className="w-full h-[2px] bg-emerald-500 animate-[scan_2s_linear_infinite]" />
               </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 2. 角色选择界面
  if (gameState.selectingCharacter) {
    return (
      <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-10 backdrop-blur-3xl z-[500] pointer-events-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] opacity-30" />
        <h1 className="relative text-7xl font-orbitron font-black text-cyan-400 mb-16 tracking-tighter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase italic">特工部署中心</h1>
        
        <div className="grid grid-cols-3 gap-12 max-w-7xl w-full mb-12 relative z-10">
          {(Object.keys(CHARACTER_CONFIG) as CharacterType[]).map(t => (
            <button key={t} onClick={() => onSelectCharacter(t, godModeChecked)} className="group p-10 rounded-sm border border-white/10 hover:border-cyan-400/50 bg-white/2 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 pointer-events-none group-hover:text-cyan-400/10 transition-colors font-orbitron">{t[0]}</div>
              <div className="text-emerald-400 font-orbitron text-[10px] mb-4 uppercase tracking-[0.4em] font-black opacity-60">TACTICAL UNIT // {t}</div>
              <div className="text-5xl font-black text-white mb-8 group-hover:text-cyan-400 transition-colors italic uppercase">{CHARACTER_CONFIG[t].name}</div>
              <div className="space-y-4 mb-10">
                {Object.entries(SKILL_CONFIGS[t]).map(([key, skill]) => (
                  <div key={key} className="flex items-center gap-4 border-l-2 border-white/5 pl-4 hover:border-cyan-400 transition-colors">
                    <span className="text-sm font-black text-cyan-400 font-orbitron">{key.toUpperCase()}</span>
                    <div className="flex flex-col">
                      <span className="text-white/80 font-black text-xs uppercase">{skill.name}</span>
                      <span className="text-white/30 text-[9px] uppercase tracking-wider">{skill.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-cyan-500/10 text-cyan-400 text-center py-4 text-xs font-black uppercase tracking-[0.4em] group-hover:bg-cyan-500 group-hover:text-black transition-all">
                确认部署协议
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 p-6 bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-all relative z-10" onClick={() => setGodModeChecked(!godModeChecked)}>
           <div className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${godModeChecked ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`}>
              {godModeChecked && <div className="w-4 h-4 bg-black" />}
           </div>
           <span className={`text-xl font-black tracking-widest italic uppercase ${godModeChecked ? 'text-amber-500' : 'text-white/40'}`}>上帝权限激活 (PROTOCOL_GOD)</span>
        </div>
      </div>
    );
  }

  // 3. 游戏内 HUD + 弹窗 (分离布局)
  return (
    <>
      {/* HUD 层 - 只拦截必要区域的点击 */}
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between z-[100]">
        {gameState.recentAchievement && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-12 py-5 rounded-sm font-black font-orbitron shadow-[0_0_50px_rgba(16,185,129,0.8)] animate-bounce z-[200]">
            达成成就 // {gameState.recentAchievement}
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="bg-black/90 backdrop-blur-lg p-8 border border-white/10 shadow-2xl relative min-w-[240px] pointer-events-auto">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-500" />
            <div className="text-6xl font-orbitron font-black text-white italic tracking-tighter">{gameState.score.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.5em] mt-2">实时战绩评分</div>
          </div>
          
          <div className="bg-black/90 backdrop-blur-lg p-8 border border-white/10 w-96 shadow-2xl relative pointer-events-auto">
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-500" />
            <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest mb-3"><span>任务核心同步率</span><span>{Math.floor(gameState.progress)}%</span></div>
            <div className="h-1 bg-white/5 relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700" style={{width: gameState.progress+'%'}} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-12 mb-8">
          <div className="flex gap-8 pointer-events-auto">
            {['q', 'w', 'e'].map(k => {
              const key = k as 'q'|'w'|'e';
              const cd = gameState.player.skillCooldowns[key];
              const max = gameState.player.maxCooldowns[key];
              const skill = SKILL_CONFIGS[gameState.player.characterType][key];
              return (
                <button 
                  key={key} 
                  onClick={() => onTriggerSkill && onTriggerSkill(key)}
                  className="relative w-28 h-28 bg-black/90 border border-white/10 flex flex-col items-center justify-center overflow-hidden group shadow-xl hover:border-cyan-400 transition-colors"
                >
                  <span className="text-4xl font-black text-cyan-400 font-orbitron group-hover:scale-110 transition-transform">{key.toUpperCase()}</span>
                  <span className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">{skill.name}</span>
                  {cd > 0 && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                      <div className="absolute bottom-0 w-full bg-cyan-500/10" style={{height: (cd/max)*100+'%'}} />
                      <span className="text-2xl font-black text-white z-10">{(cd/1000).toFixed(1)}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="w-full max-w-4xl bg-black/90 p-1 border border-white/10 shadow-2xl pointer-events-none">
            <div className={`h-8 transition-all duration-500 relative flex items-center justify-center ${gameState.player.godMode ? 'bg-amber-500' : 'bg-red-600/80'}`} style={{width: (gameState.player.hp/gameState.player.maxHp)*100+'%'}}>
              <div className="text-[10px] font-black text-white uppercase tracking-[0.4em] shadow-sm">
                {gameState.player.godMode ? 'UNLIMITED ENERGY PROTOCOL' : `VITALS: ${Math.max(0, Math.floor(gameState.player.hp))} // HP`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 胜利/失败 独立弹窗层 - 全屏遮罩并强制拦截点击 */}
      {gameState.isVictory && (
        <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-[1000] overflow-hidden pointer-events-auto">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(16,185,129,0.05)_2px,transparent_2px)] bg-[length:40px_40px] pointer-events-none" />
          <h1 className="text-[12rem] font-orbitron font-black text-emerald-500 mb-4 tracking-tighter italic uppercase drop-shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-pulse">区域肃清</h1>
          <div className="text-3xl text-white font-black mb-20 uppercase tracking-[0.8em] opacity-80 border-y border-emerald-500/20 py-4">Sector Clear // Data Synchronized</div>
          
          <div className="flex gap-12 mb-20">
             <div className="bg-emerald-500/5 border border-emerald-500/20 p-12 text-center w-80">
                <div className="text-6xl font-black text-white mb-2 font-orbitron">{gameState.score.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">最终评分 // SCORE</div>
             </div>
             <div className="bg-emerald-500/5 border border-emerald-500/20 p-12 text-center w-80">
                <div className="text-6xl font-black text-white mb-2 font-orbitron">{gameState.currentLevel.toString().padStart(2, '0')}</div>
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">任务区域 // ZONE</div>
             </div>
          </div>

          <div className="flex gap-8 relative z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onBackToMenu(); }} 
              className="px-16 py-6 border-2 border-emerald-500/40 text-emerald-400 font-black text-xl hover:bg-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest cursor-pointer"
            >
              返回指挥中心
            </button>
            {gameState.currentLevel < LEVELS.length && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onStartNextLevel(); }} 
                 className="px-20 py-6 bg-emerald-500 text-black font-black text-xl hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)] uppercase tracking-widest cursor-pointer"
               >
                 前往下一区域
               </button>
            )}
          </div>
        </div>
      )}

      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-[1000] backdrop-blur-3xl pointer-events-auto">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.05)_0,rgba(255,0,0,0.05)_10px,transparent_10px,transparent_20px)] pointer-events-none" />
          <h1 className="text-[10rem] font-orbitron font-black text-red-600 mb-12 italic uppercase drop-shadow-[0_0_60px_rgba(220,38,38,0.4)]">特工阵亡</h1>
          <div className="text-xl text-white/40 font-black uppercase tracking-[1em] mb-20">Mission Failed // Agent Down</div>
          <button 
            onClick={(e) => { e.stopPropagation(); onBackToMenu(); }} 
            className="px-24 py-8 bg-red-600 text-white font-black text-2xl hover:bg-red-500 hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(220,38,38,0.3)] uppercase tracking-widest cursor-pointer"
          >
            重新部署协议
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};

export default UIOverlay;
