
import { EnemyType, CharacterType, WeaponType, LevelConfig, Achievement } from './types';

export const MAP_SIZE = 1500;
export const PLAYER_SPEED_BASE = 4.0; 
export const ENEMY_SPEED_BASE = 1.8;  // 降低敌人速度至1.8，方便操作
export const BULLET_SPEED = 14; 
export const SHOOT_RANGE = 800;
export const MAX_ENEMIES_ON_SCREEN = 40; // 限制同屏怪物数量

export const ROW_COUNT = 8; 
export const ROW_WIDTH = MAP_SIZE / ROW_COUNT;

export const WEAPON_CONFIG = {
  [WeaponType.RIFLE]: { damage: 8, cooldown: 150, bulletCount: 1, spread: 0.1, color: '#34d399' },
  [WeaponType.SHOTGUN]: { damage: 12, cooldown: 500, bulletCount: 6, spread: 0.4, color: '#94a3b8' },
  [WeaponType.PISTOL]: { damage: 15, cooldown: 200, bulletCount: 1, spread: 0.05, color: '#f472b6' },
};

export const SKILL_CONFIGS = {
  [CharacterType.RIFLEMAN]: {
    q: { name: '战术手雷', cd: 4000, desc: '大范围高额爆炸伤害' },
    w: { name: '激素爆发', cd: 8000, desc: '射速翻倍，持续4秒' },
    e: { name: '全域空投', cd: 15000, desc: '呼叫10次随机轰炸' }
  },
  [CharacterType.TANK]: {
    q: { name: '撼地重击', cd: 5000, desc: '击退周围并造成伤害' },
    w: { name: '脉冲力场', cd: 10000, desc: '4秒内吸收所有子弹并反弹' },
    e: { name: '全向过载', cd: 20000, desc: '向四周释放36枚重型火炮' }
  },
  [CharacterType.GIRL]: {
    q: { name: '相位闪烁', cd: 3000, desc: '向目标方向瞬移' },
    w: { name: '星能波动', cd: 6000, desc: '扩散排斥波，推开所有敌人' },
    e: { name: '轨道裁决', cd: 18000, desc: '对当前位置释放高能极光' }
  }
};

export const CHARACTER_CONFIG = {
  [CharacterType.RIFLEMAN]: { name: '特种兵', hp: 120, speed: 4.0, weapon: WeaponType.RIFLE, color: '#10b981' },
  [CharacterType.TANK]: { name: '重甲战车', hp: 400, speed: 3.2, weapon: WeaponType.SHOTGUN, color: '#64748b' },
  [CharacterType.GIRL]: { name: '幻影特工', hp: 100, speed: 5.5, weapon: WeaponType.PISTOL, color: '#f472b6' },
};

export const ENEMY_CONFIG = {
  [EnemyType.REGULAR]: { hp: 20, color: '#ef4444', radius: 15 },
  [EnemyType.ELITE]: { hp: 40, color: '#f97316', radius: 25 },
  [EnemyType.BOSS]: { hp: 80, color: '#a855f7', radius: 45 },
  [EnemyType.MEGA_BOSS]: { hp: 5000, color: '#ffffff', radius: 400 },
};

export const LEVELS: LevelConfig[] = [
  { id: 1, name: '边境森林', multiplier: 1.0, spawnRate: 1000, unlockWave: 1 },
  { id: 2, name: '废弃工厂', multiplier: 1.3, spawnRate: 900, unlockWave: 1 },
  { id: 3, name: '赛博遗迹', multiplier: 1.7, spawnRate: 800, unlockWave: 1 },
  { id: 4, name: '生物实验室', multiplier: 2.2, spawnRate: 700, unlockWave: 1 },
  { id: 5, name: '深渊核心', multiplier: 3.5, spawnRate: 600, unlockWave: 1 },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'kills_50', title: '收割机', description: '累计击杀50个单位', unlocked: false },
  { id: 'elite_hunter', title: '精英猎手', description: '击败10个精英单位', unlocked: false },
  { id: 'level_clear', title: '战地专家', description: '通过任意关卡', unlocked: false },
  { id: 'mega_slayer', title: '主宰终结者', description: '击败最终MEGA BOSS', unlocked: false },
];

export const ISO_FACTOR_X = 1;
export const ISO_FACTOR_Y = 0.5;
