
import React, { useState } from 'react';
import { GameState, CharacterType } from '../types';
import { CHARACTER_CONFIG, LEVELS, SKILL_CONFIGS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  onSelectLevel: (id: number) => void;
  onSelectCharacter: (type: CharacterType, godMode: boolean) => void;
  onBackToMenu: () => void;
  onTriggerSkill?: (key: 'q' | 'w' | 'e') => void;
  aiMessage: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onSelectLevel, onSelectCharacter, onBackToMenu, onTriggerSkill }) => {
  const [godModeChecked, setGodModeChecked] = useState(false);

  if (gameState.selectingLevel) {
    return (
      <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-10 overflow-auto z-[300]">
        <h1 className="text-7xl font-orbitron font-black text-emerald-500 mb-12 tracking-widest drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">战区部署</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-16">
          {LEVELS.map(l => (
            <button key={l.id} disabled={!gameState.unlockedLevels.includes(l.id)} onClick={() => onSelectLevel(l.id)} className={`p-8 rounded-[2rem] border-2 transition-all ${gameState.unlockedLevels.includes(l.id) ? 'border-emerald-500 hover:bg-emerald-500/10 text-white hover:-translate-y-2' : 'border-white/5 text-white/10 grayscale cursor-not-allowed'}`}>
              <div className="text-5xl font-black mb-2">{l.id}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60">{l.name}</div>
            </button>
          ))}
        </div>
        <div className="max-w-4xl w-full bg-white/5 p-12 rounded-[3rem] border border-white/10 backdrop-blur-md">
          <h2 className="text-2xl font-orbitron text-white mb-8 uppercase tracking-[0.4em] opacity-40">成就荣誉室</h2>
          <div className="grid grid-cols-2 gap-6">
            {gameState.achievements.map(a => (
              <div key={a.id} className={`p-6 rounded-2xl border transition-all ${a.unlocked ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/5 opacity-30'}`}>
                <div className={`font-black text-xl mb-1 ${a.unlocked ? 'text-emerald-400' : 'text-gray-500'}`}>{a.title}</div>
                <div className="text-sm text-gray-400 font-medium">{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState.selectingCharacter) {
    return (
      <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center p-10 backdrop-blur-3xl z-[300]">
        <h1 className="text-7xl font-orbitron font-black text-cyan-400 mb-16 tracking-tighter">特工档案</h1>
        
        <div className="grid grid-cols-3 gap-12 max-w-7xl w-full mb-12">
          {(Object.keys(CHARACTER_CONFIG) as CharacterType[]).map(t => (
            <button key={t} onClick={() => onSelectCharacter(t, godModeChecked)} className="group p-12 rounded-[4rem] border-2 border-white/10 hover:border-cyan-400 bg-white/5 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 pointer-events-none group-hover:text-cyan-400/10 transition-colors">{t[0]}</div>
              <div className="text-emerald-400 font-orbitron text-sm mb-4 uppercase tracking-[0.3em] font-bold">{t}</div>
              <div className="text-5xl font-black text-white mb-6 group-hover:text-cyan-400 transition-colors">{CHARACTER_CONFIG[t].name}</div>
              <div className="space-y-4 mb-8">
                {Object.entries(SKILL_CONFIGS[t]).map(([key, skill]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-cyan-400">{key.toUpperCase()}</span>
                    <span className="text-gray-300 font-medium">{skill.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-gray-500 text-sm font-bold uppercase">点击部署特工</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setGodModeChecked(!godModeChecked)}>
           <div className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all ${godModeChecked ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
              {godModeChecked && <div className="w-4 h-4 bg-white rounded-sm" />}
           </div>
           <span className={`text-xl font-bold tracking-widest ${godModeChecked ? 'text-amber-500' : 'text-white/60'}`}>开启无敌模式 (上帝模式)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
      {gameState.recentAchievement && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-12 py-5 rounded-full font-black font-orbitron shadow-[0_0_50px_rgba(16,185,129,0.8)] animate-bounce z-50">
          达成成就: {gameState.recentAchievement}
        </div>
      )}

      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-6xl font-orbitron font-black text-white italic tracking-tighter">{gameState.score}</div>
          <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.5em] mt-2">战地评分</div>
        </div>
        <div className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl border border-white/10 w-96 shadow-2xl">
          <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest mb-3"><span>任务进度</span><span>{Math.floor(gameState.progress)}%</span></div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700" style={{width: gameState.progress+'%'}} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 pointer-events-auto">
        <div className="flex gap-8">
          {['q', 'w', 'e'].map(k => {
            const key = k as 'q'|'w'|'e';
            const cd = gameState.player.skillCooldowns[key];
            const max = gameState.player.maxCooldowns[key];
            const skill = SKILL_CONFIGS[gameState.player.characterType][key];
            return (
              <button 
                key={key} 
                onClick={() => onTriggerSkill && onTriggerSkill(key)}
                className="relative w-28 h-28 bg-black/80 border-2 border-white/10 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden group shadow-xl hover:border-cyan-400 transition-colors pointer-events-auto"
              >
                <span className="text-4xl font-black text-cyan-400 font-orbitron group-hover:scale-110 transition-transform">{key.toUpperCase()}</span>
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-1">{skill.name}</span>
                {cd > 0 && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="absolute bottom-0 w-full bg-cyan-500/20" style={{height: (cd/max)*100+'%'}} />
                    <span className="text-2xl font-black text-white z-10">{(cd/1000).toFixed(1)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="w-full max-w-3xl bg-black/80 p-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-lg">
          <div className={`h-8 rounded-full transition-all duration-500 relative ${gameState.player.godMode ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.6)]' : 'bg-gradient-to-r from-red-600 to-pink-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]'}`} style={{width: (gameState.player.hp/gameState.player.maxHp)*100+'%'}}>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest">
              生命特征: {gameState.player.godMode ? '无敌状态' : Math.max(0, Math.floor(gameState.player.hp)) + ' HP'}
            </div>
          </div>
        </div>
      </div>

      {gameState.isVictory && (
        <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-3xl z-[400]">
          <h1 className="text-[12rem] font-orbitron font-black text-black mb-4 tracking-tighter italic">战役大捷</h1>
          <div className="text-5xl text-black font-bold mb-16 uppercase tracking-[1em] opacity-80">任务圆满完成</div>
          <div className="grid grid-cols-2 gap-8 mb-20 w-full max-w-4xl px-20">
             <div className="bg-black text-white p-12 rounded-[4rem] text-center">
                <div className="text-7xl font-black mb-2">{gameState.score}</div>
                <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest">最终评分</div>
             </div>
             <div className="bg-black text-white p-12 rounded-[4rem] text-center">
                <div className="text-7xl font-black mb-2">{gameState.currentLevel}</div>
                <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest">清除区域</div>
             </div>
          </div>
          <button onClick={onBackToMenu} className="px-24 py-8 bg-black text-white font-black rounded-full text-2xl hover:scale-110 transition-transform shadow-[0_30px_60px_rgba(0,0,0,0.3)]">返回基地</button>
        </div>
      )}

      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center pointer-events-auto z-[400] backdrop-blur-3xl">
          <h1 className="text-[10rem] font-orbitron font-black text-black mb-12 italic">任务失败</h1>
          <button onClick={onBackToMenu} className="px-24 py-8 bg-black text-white font-black rounded-full text-2xl hover:scale-110 transition-transform shadow-[0_30px_60px_rgba(0,0,0,0.4)]">重新部署特工</button>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
