
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameView from './components/GameView';
import UIOverlay from './components/UIOverlay';
import { GameState, EnemyType, Enemy, Bullet, Position, CharacterType, WeaponType, Achievement, SpawnWarning, SkillEffect } from './types';
import { 
  MAP_SIZE, ENEMY_SPEED_BASE, BULLET_SPEED, SHOOT_RANGE, ENEMY_CONFIG, CHARACTER_CONFIG,
  WEAPON_CONFIG, LEVELS, SKILL_CONFIGS, INITIAL_ACHIEVEMENTS, ROW_WIDTH, ROW_COUNT, MAX_ENEMIES_ON_SCREEN
} from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedLevels = localStorage.getItem('unlockedLevels');
    const savedCleared = localStorage.getItem('clearedLevels');
    const savedAchs = localStorage.getItem('achievements_v4');
    return {
      player: {
        id: 'player', x: MAP_SIZE / 2, y: MAP_SIZE / 2, hp: 100, maxHp: 100, speed: 4, radius: 15, color: '#3b82f6',
        characterType: CharacterType.RIFLEMAN, weaponType: WeaponType.RIFLE, fireRateModifier: 1.0,
        skillCooldowns: { q: 0, w: 0, e: 0 }, maxCooldowns: { q: 1, w: 1, e: 1 },
        godMode: false,
      },
      enemies: [], bullets: [], items: [], warnings: [], skillEffects: [],
      score: 0, wave: 1, progress: 0, isGameOver: false, isVictory: false, bossMode: false,
      targetPos: { x: MAP_SIZE / 2, y: MAP_SIZE / 2 }, gameStarted: false, selectingCharacter: false, selectingLevel: true,
      currentLevel: 1, 
      unlockedLevels: savedLevels ? JSON.parse(savedLevels) : [1],
      clearedLevels: savedCleared ? JSON.parse(savedCleared) : [],
      achievements: savedAchs ? JSON.parse(savedAchs) : INITIAL_ACHIEVEMENTS,
      shakeTime: 0,
    };
  });

  const lastShootTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastBossAttackTimeRef = useRef<number>(0);
  const lastOrbitalStrikeTimeRef = useRef<number>(0);
  const killCountRef = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});

  const checkAchievement = useCallback((id: string) => {
    setGameState(prev => {
      const ach = prev.achievements.find(a => a.id === id);
      if (ach && !ach.unlocked) {
        const newAchs = prev.achievements.map(a => a.id === id ? { ...a, unlocked: true } : a);
        localStorage.setItem('achievements_v4', JSON.stringify(newAchs));
        return { ...prev, achievements: newAchs, recentAchievement: ach.title };
      }
      return prev;
    });
    setTimeout(() => setGameState(s => ({ ...s, recentAchievement: undefined })), 4000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  const handleSkillActivation = useCallback((key: 'q' | 'w' | 'e') => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver || prev.isVictory || prev.player.skillCooldowns[key] > 0) return prev;
      const config = SKILL_CONFIGS[prev.player.characterType][key];
      const newEffects = [...prev.skillEffects];
      const newBullets = [...prev.bullets];
      let newPlayer = { ...prev.player };
      const now = Date.now();

      if (prev.player.characterType === CharacterType.RIFLEMAN) {
        if (key === 'q') newEffects.push({ id: Math.random().toString(), x: prev.player.x, y: prev.player.y, type: 'EXPLOSION', radius: 0, maxRadius: 220, color: '#10b981', startTime: now, duration: 600, damage: 150 });
        if (key === 'w') { newPlayer.fireRateModifier *= 3.0; setTimeout(() => setGameState(s => ({...s, player: {...s.player, fireRateModifier: s.player.fireRateModifier / 3.0}})), 4000); }
        if (key === 'e') { for(let i=0; i<10; i++) setTimeout(() => setGameState(s => ({...s, skillEffects: [...s.skillEffects, { id: Math.random().toString(), x: s.player.x + (Math.random()-0.5)*800, y: s.player.y + (Math.random()-0.5)*800, type: 'EXPLOSION', radius: 0, maxRadius: 150, color: '#ef4444', startTime: Date.now(), duration: 800, damage: 120 }] })), i*250); }
      } else if (prev.player.characterType === CharacterType.TANK) {
        if (key === 'q') newEffects.push({ id: Math.random().toString(), x: prev.player.x, y: prev.player.y, type: 'SHOCKWAVE', radius: 0, maxRadius: 300, color: '#94a3b8', startTime: now, duration: 500, damage: 100 });
        if (key === 'w') newEffects.push({ id: 'shield', x: prev.player.x, y: prev.player.y, type: 'RING', radius: 80, maxRadius: 80, color: '#38bdf8', startTime: now, duration: 4000, damage: 20 });
        if (key === 'e') { for(let i=0; i<36; i++) newBullets.push({ id: Math.random().toString(), x: prev.player.x, y: prev.player.y, angle: (i/36)*Math.PI*2, damage: 50, speed: 12, color: '#f87171', life: 120, size: 25 }); }
      } else if (prev.player.characterType === CharacterType.GIRL) {
        if (key === 'q') { const a = Math.atan2(prev.targetPos.y-prev.player.y, prev.targetPos.x-prev.player.x); newPlayer.x += Math.cos(a)*300; newPlayer.y += Math.sin(a)*300; }
        if (key === 'w') newEffects.push({ id: Math.random().toString(), x: prev.player.x, y: prev.player.y, type: 'RING', radius: 0, maxRadius: 400, color: '#f472b6', startTime: now, duration: 1000, damage: 80 });
        if (key === 'e') newEffects.push({ id: Math.random().toString(), x: prev.player.x, y: prev.player.y, type: 'BEAM', radius: 100, maxRadius: 100, color: '#ffffff', startTime: now, duration: 4000, damage: 400 });
      }

      return {
        ...prev, bullets: newBullets, skillEffects: newEffects,
        player: { ...newPlayer, skillCooldowns: { ...prev.player.skillCooldowns, [key]: config.cd }, maxCooldowns: { ...prev.player.maxCooldowns, [key]: config.cd } }
      };
    });
  }, []);

  const spawnEnemies = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver || prev.isVictory || prev.progress >= 100 || prev.bossMode) return prev;
      if (prev.enemies.length >= MAX_ENEMIES_ON_SCREEN) return prev;

      const now = Date.now();
      const level = LEVELS.find(l => l.id === prev.currentLevel)!;
      if (now - lastSpawnTimeRef.current < (level.spawnRate / (1 + prev.wave * 0.15))) return prev;

      lastSpawnTimeRef.current = now;
      const count = 1 + Math.floor(prev.wave / 3);
      const newWarnings: SpawnWarning[] = [];
      for(let i=0; i<count; i++) {
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (side === 0) { x = Math.random() * MAP_SIZE; y = 0; }
        else if (side === 1) { x = MAP_SIZE; y = Math.random() * MAP_SIZE; }
        else if (side === 2) { x = Math.random() * MAP_SIZE; y = MAP_SIZE; }
        else { x = 0; y = Math.random() * MAP_SIZE; }
        const rand = Math.random();
        let type = EnemyType.REGULAR;
        if (rand < 0.08) type = EnemyType.BOSS;
        else if (rand < 0.25) type = EnemyType.ELITE;
        newWarnings.push({ id: Math.random().toString(), x, y, startTime: now, duration: 1200, type });
      }
      return { ...prev, warnings: [...prev.warnings, ...newWarnings] };
    });
  }, []);

  const gameLoop = useCallback((time: number) => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver || prev.isVictory) return prev;

      const now = Date.now();
      let newPlayer = { ...prev.player };
      newPlayer.skillCooldowns = {
        q: Math.max(0, newPlayer.skillCooldowns.q - 16.6),
        w: Math.max(0, newPlayer.skillCooldowns.w - 16.6),
        e: Math.max(0, newPlayer.skillCooldowns.e - 16.6),
      };

      if (keysPressed.current['q']) handleSkillActivation('q');
      if (keysPressed.current['w']) handleSkillActivation('w');
      if (keysPressed.current['e']) handleSkillActivation('e');

      let dx = 0, dy = 0;
      if (keysPressed.current['arrowup']) { dx -= 1; dy -= 1; }
      if (keysPressed.current['arrowdown']) { dx += 1; dy += 1; }
      if (keysPressed.current['arrowleft']) { dx -= 1; dy += 1; }
      if (keysPressed.current['arrowright']) { dx += 1; dy -= 1; }

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        newPlayer.x += (dx/len) * newPlayer.speed;
        newPlayer.y += (dy/len) * newPlayer.speed;
        prev.targetPos.x = newPlayer.x;
        prev.targetPos.y = newPlayer.y;
      } else {
        const dPlayer = Math.sqrt((prev.targetPos.x - newPlayer.x)**2 + (prev.targetPos.y - newPlayer.y)**2);
        if (dPlayer > 5) {
          newPlayer.x += ((prev.targetPos.x - newPlayer.x) / dPlayer) * newPlayer.speed;
          newPlayer.y += ((prev.targetPos.y - newPlayer.y) / dPlayer) * newPlayer.speed;
        }
      }
      newPlayer.x = Math.max(0, Math.min(MAP_SIZE, newPlayer.x));
      newPlayer.y = Math.max(0, Math.min(MAP_SIZE, newPlayer.y));

      let newSkillEffects = prev.skillEffects.map(fx => {
        if (fx.id === 'shield') return { ...fx, x: newPlayer.x, y: newPlayer.y };
        if (fx.type === 'DANGER_ROW') return fx;
        return { ...fx, radius: fx.maxRadius * ((now - fx.startTime) / fx.duration) };
      }).filter(fx => now - fx.startTime < fx.duration);

      if (prev.clearedLevels.includes(prev.currentLevel) && now - lastOrbitalStrikeTimeRef.current > 3000) {
        lastOrbitalStrikeTimeRef.current = now;
        newSkillEffects.push({
          id: 'orbital_' + now, x: MAP_SIZE / 2, y: MAP_SIZE / 2, type: 'ORBITAL_STRIKE',
          radius: MAP_SIZE * 1.5, maxRadius: MAP_SIZE * 1.5, color: 'rgba(255, 255, 255, 0.4)',
          startTime: now, duration: 600, damage: 200
        });
      }

      let bossMode = prev.bossMode;
      let shakeTime = Math.max(0, prev.shakeTime - 16.6);
      let activeEnemies = [...prev.enemies];
      let activeWarnings = [...prev.warnings];
      let activeBullets = [...prev.bullets];

      // 触发 Boss 逻辑
      const isFinalLevel = prev.currentLevel === 5;
      const spawnBossAt = isFinalLevel ? 60 : 95;
      if (prev.progress >= spawnBossAt && !bossMode) {
        bossMode = true;
        // 只有最后一关 Boss 出现时会有大震动
        if (isFinalLevel) shakeTime = 2000; 
        
        activeEnemies = [];
        activeWarnings = [];
        activeBullets = activeBullets.filter(b => !b.isEnemy);
        
        const bossType = isFinalLevel ? EnemyType.MEGA_BOSS : EnemyType.BOSS;
        const cfg = ENEMY_CONFIG[bossType];
        const levelMul = LEVELS.find(l => l.id === prev.currentLevel)?.multiplier || 1;
        
        activeEnemies.push({ 
          id: 'level_boss', 
          x: MAP_SIZE/4, 
          y: MAP_SIZE/4, 
          hp: cfg.hp * levelMul, 
          maxHp: cfg.hp * levelMul, 
          speed: bossType === EnemyType.MEGA_BOSS ? 0 : ENEMY_SPEED_BASE * 0.8, 
          radius: cfg.radius, 
          color: cfg.color, 
          type: bossType, 
          lastAttackTime: 0 
        });
      }

      const currentBoss = activeEnemies.find(e => e.type === EnemyType.MEGA_BOSS || e.type === EnemyType.BOSS);
      if (bossMode && currentBoss && now - lastBossAttackTimeRef.current > (currentBoss.type === EnemyType.MEGA_BOSS ? 1800 : 2500)) {
        lastBossAttackTimeRef.current = now;
        // 只有 MEGA_BOSS 和普通 BOSS 触发特定弹幕
        const count = currentBoss.type === EnemyType.MEGA_BOSS ? 36 : 12;
        for(let i=0; i<count; i++) {
          activeBullets.push({ 
            id: 'boss_bullet_' + now + '_' + i, 
            x: currentBoss.x, y: currentBoss.y, 
            angle: (i/count)*Math.PI*2, 
            damage: 20, speed: 2.2, color: '#ff0044', life: 1000, size: currentBoss.type === EnemyType.MEGA_BOSS ? 25 : 15, isEnemy: true 
          });
        }
      }

      newSkillEffects.forEach(fx => {
        if (fx.type === 'DANGER_ROW' && now - fx.startTime > 1000) {
          const playerRow = Math.floor((newPlayer.x + newPlayer.y) / (ROW_WIDTH * 2));
          if (playerRow === fx.rowId && !newPlayer.godMode) newPlayer.hp -= fx.damage;
        }
      });

      const enemiesFromWarnings: Enemy[] = [];
      const remainingWarnings = activeWarnings.filter(w => {
        if (now - w.startTime >= w.duration) {
          const cfg = ENEMY_CONFIG[w.type];
          const levelMul = LEVELS.find(l => l.id === prev.currentLevel)?.multiplier || 1;
          enemiesFromWarnings.push({ id: w.id, x: w.x, y: w.y, hp: cfg.hp * levelMul, maxHp: cfg.hp * levelMul, speed: ENEMY_SPEED_BASE, radius: cfg.radius, color: cfg.color, type: w.type, lastAttackTime: 0 });
          return false;
        }
        return true;
      });

      const updatedEnemies = [...activeEnemies, ...enemiesFromWarnings].map(e => {
        let updated = { ...e };
        if (e.type !== EnemyType.MEGA_BOSS) {
          const de = Math.sqrt((newPlayer.x-e.x)**2 + (newPlayer.y-e.y)**2);
          if (de < e.radius + newPlayer.radius) {
            if (now - e.lastAttackTime > 1000) { 
              if (!newPlayer.godMode) newPlayer.hp -= (e.type === EnemyType.BOSS ? 25 : 10); 
              updated.lastAttackTime = now; 
            }
          } else {
            updated.x += ((newPlayer.x-e.x)/de)*e.speed;
            updated.y += ((newPlayer.y-e.y)/de)*e.speed;
          }
        }
        newSkillEffects.forEach(fx => {
          if (fx.type === 'DANGER_ROW') return;
          const dist = Math.sqrt((updated.x-fx.x)**2 + (updated.y-fx.y)**2);
          if (dist < (fx.type === 'ORBITAL_STRIKE' ? fx.radius : fx.radius + e.radius)) updated.hp -= (fx.damage/30);
        });
        return updated;
      });

      if (now - lastShootTimeRef.current > (WEAPON_CONFIG[newPlayer.weaponType].cooldown / newPlayer.fireRateModifier)) {
        if (newPlayer.godMode) {
          for(let i=0; i<24; i++) {
            activeBullets.push({ id: Math.random().toString(), x: newPlayer.x, y: newPlayer.y, angle: (i/24)*Math.PI*2, damage: 100, speed: BULLET_SPEED, color: '#fbbf24', life: 100, size: 15 });
          }
          lastShootTimeRef.current = now;
        } else {
          let target: Enemy | null = null, minDist = SHOOT_RANGE;
          updatedEnemies.forEach(e => {
            const de = Math.sqrt((e.x-newPlayer.x)**2 + (newPlayer.y-newPlayer.y)**2);
            if (de < minDist) { minDist = de; target = e; }
          });
          if (target) {
            const a = Math.atan2(target.y-newPlayer.y, target.x-newPlayer.x);
            const w = WEAPON_CONFIG[newPlayer.weaponType];
            for(let i=0; i<w.bulletCount; i++) activeBullets.push({ id: Math.random().toString(), x: newPlayer.x, y: newPlayer.y, angle: a+(Math.random()-0.5)*w.spread, damage: w.damage, speed: BULLET_SPEED, color: w.color, life: 100 });
            lastShootTimeRef.current = now;
          }
        }
      }

      const finalEnemies: Enemy[] = [];
      let kills = 0;
      let bossDied = false;
      updatedEnemies.forEach(e => {
        activeBullets = activeBullets.filter(b => {
          if (b.isEnemy) {
            const dp = Math.sqrt((b.x-newPlayer.x)**2 + (b.y-newPlayer.y)**2);
            if (dp < newPlayer.radius + 15) { if(!newPlayer.godMode) newPlayer.hp -= b.damage; return false; }
            return true;
          }
          const de = Math.sqrt((b.x-e.x)**2 + (b.y-e.y)**2);
          if (de < e.radius + 20) { e.hp -= b.damage; return false; }
          return true;
        });
        if (e.hp <= 0) {
          kills++;
          if (e.type === EnemyType.MEGA_BOSS || e.type === EnemyType.BOSS) {
            if (bossMode) bossDied = true;
            if (e.type === EnemyType.MEGA_BOSS) checkAchievement('mega_slayer');
            checkAchievement('elite_hunter');
          }
        } else finalEnemies.push(e);
      });
      killCountRef.current += kills;
      if (killCountRef.current >= 50) checkAchievement('kills_50');

      let nextBullets = activeBullets.map(b => ({ ...b, x: b.x + Math.cos(b.angle)*b.speed, y: b.y + Math.sin(b.angle)*b.speed, life: b.life-1 })).filter(b => b.life > 0);
      let nextProgress = Math.min(100, prev.progress + (kills * 1.8));
      
      // 只要 Boss 死了，就判定该关通关
      if (bossDied) nextProgress = 100;
      
      const isVictory = nextProgress >= 100 && !finalEnemies.find(e => e.type === EnemyType.MEGA_BOSS || e.type === EnemyType.BOSS);
      if (isVictory) checkAchievement('level_clear');

      return {
        ...prev, player: newPlayer, enemies: finalEnemies, bullets: nextBullets, warnings: remainingWarnings, skillEffects: newSkillEffects,
        score: prev.score + kills*50, progress: nextProgress, wave: Math.min(10, Math.floor(nextProgress/10)+1), isGameOver: newPlayer.hp <= 0, isVictory, bossMode, shakeTime
      };
    });
    spawnEnemies();
    requestAnimationFrame(gameLoop);
  }, [handleSkillActivation, spawnEnemies, checkAchievement]);

  useEffect(() => { requestAnimationFrame(gameLoop); }, [gameLoop]);

  const onSelectLevel = useCallback((id: number) => setGameState(s => ({ ...s, currentLevel: id, selectingLevel: false, selectingCharacter: true })), []);
  
  const onSelectCharacter = useCallback((type: CharacterType, godMode: boolean) => {
    const cfg = CHARACTER_CONFIG[type];
    setGameState(s => ({
      ...s, selectingCharacter: false, selectingLevel: false, gameStarted: true, score: 0, progress: 0, wave: 1, bossMode: false, isGameOver: false, isVictory: false,
      player: { ...s.player, hp: cfg.hp, maxHp: cfg.hp, speed: cfg.speed, color: cfg.color, characterType: type, weaponType: cfg.weapon, x: MAP_SIZE/2, y: MAP_SIZE/2, skillCooldowns: {q:0,w:0,e:0}, fireRateModifier: 1.0, godMode },
      enemies: [], bullets: [], warnings: [], skillEffects: [], targetPos: { x: MAP_SIZE/2, y: MAP_SIZE/2 }
    }));
    killCountRef.current = 0;
    lastSpawnTimeRef.current = Date.now();
    lastOrbitalStrikeTimeRef.current = Date.now();
  }, []);

  const backToMenu = useCallback(() => {
    setGameState(s => {
      let nextUnlocked = [...s.unlockedLevels];
      let nextCleared = [...s.clearedLevels];
      if (s.isVictory) {
        const nextLevelId = s.currentLevel + 1;
        if (nextLevelId <= LEVELS.length && !nextUnlocked.includes(nextLevelId)) {
          nextUnlocked.push(nextLevelId);
        }
        if (!nextCleared.includes(s.currentLevel)) {
          nextCleared.push(s.currentLevel);
        }
        localStorage.setItem('unlockedLevels', JSON.stringify(nextUnlocked));
        localStorage.setItem('clearedLevels', JSON.stringify(nextCleared));
      }
      return { 
        ...s, 
        selectingLevel: true, 
        selectingCharacter: false,
        gameStarted: false, 
        isGameOver: false, 
        isVictory: false,
        enemies: [],
        bullets: [],
        warnings: [],
        skillEffects: [],
        progress: 0,
        score: 0,
        wave: 1,
        bossMode: false,
        unlockedLevels: nextUnlocked,
        clearedLevels: nextCleared,
        shakeTime: 0
      };
    });
  }, []);

  const startNextLevel = useCallback(() => {
    setGameState(s => {
      const nextId = s.currentLevel + 1;
      if (nextId > LEVELS.length) return { ...s, isVictory: false, selectingLevel: true, gameStarted: false };

      let nextUnlocked = [...s.unlockedLevels];
      let nextCleared = [...s.clearedLevels];
      if (!nextUnlocked.includes(nextId)) nextUnlocked.push(nextId);
      if (!nextCleared.includes(s.currentLevel)) nextCleared.push(s.currentLevel);
      localStorage.setItem('unlockedLevels', JSON.stringify(nextUnlocked));
      localStorage.setItem('clearedLevels', JSON.stringify(nextCleared));

      return {
        ...s,
        currentLevel: nextId,
        selectingLevel: false,
        selectingCharacter: true, 
        gameStarted: false,
        isVictory: false,
        isGameOver: false,
        enemies: [],
        bullets: [],
        warnings: [],
        skillEffects: [],
        progress: 0,
        score: s.score,
        wave: 1,
        bossMode: false,
        unlockedLevels: nextUnlocked,
        clearedLevels: nextCleared,
        shakeTime: 0
      };
    });
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      <GameView gameState={gameState} onSetTarget={p => setGameState(s => ({ ...s, targetPos: p }))} />
      <UIOverlay 
        gameState={gameState} 
        onSelectLevel={onSelectLevel} 
        onSelectCharacter={onSelectCharacter} 
        onBackToMenu={backToMenu} 
        onStartNextLevel={startNextLevel}
        onTriggerSkill={handleSkillActivation}
        aiMessage="" 
      />
    </div>
  );
};

export default App;
