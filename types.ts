
export enum EnemyType {
  REGULAR = 'REGULAR',
  ELITE = 'ELITE',
  BOSS = 'BOSS',
  MEGA_BOSS = 'MEGA_BOSS'
}

export enum CharacterType {
  RIFLEMAN = 'RIFLEMAN',
  TANK = 'TANK',
  GIRL = 'GIRL'
}

export enum WeaponType {
  RIFLE = 'RIFLE',
  SHOTGUN = 'SHOTGUN',
  PISTOL = 'PISTOL'
}

export enum ItemType {
  HEAL = 'HEAL',
  SPEED_BOOST = 'SPEED_BOOST'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  id: string;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  color: string;
}

export interface Enemy extends Entity {
  type: EnemyType;
  lastAttackTime: number;
}

export interface Bullet extends Position {
  id: string;
  angle: number;
  damage: number;
  speed: number;
  color: string;
  life: number;
  size?: number;
  isEnemy?: boolean;
}

export interface LootItem extends Position {
  id: string;
  type: ItemType;
}

export interface SpawnWarning extends Position {
  id: string;
  startTime: number;
  duration: number;
  type: EnemyType;
}

export interface SkillEffect extends Position {
  id: string;
  type: 'EXPLOSION' | 'RING' | 'BEAM' | 'SHOCKWAVE' | 'DANGER_ROW' | 'ORBITAL_STRIKE';
  radius: number;
  maxRadius: number;
  color: string;
  startTime: number;
  duration: number;
  damage: number;
  rowId?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  multiplier: number;
  spawnRate: number;
  unlockWave: number;
}

export interface GameState {
  player: Entity & { 
    characterType: CharacterType; 
    weaponType: WeaponType;
    fireRateModifier: number;
    skillCooldowns: { q: number; w: number; e: number };
    maxCooldowns: { q: number; w: number; e: number };
    godMode: boolean;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  items: LootItem[];
  warnings: SpawnWarning[];
  skillEffects: SkillEffect[];
  score: number;
  wave: number;
  progress: number;
  isGameOver: boolean;
  isVictory: boolean;
  targetPos: Position;
  gameStarted: boolean;
  selectingCharacter: boolean;
  selectingLevel: boolean;
  currentLevel: number;
  unlockedLevels: number[];
  clearedLevels: number[]; // 新增：记录已通关的关卡
  achievements: Achievement[];
  recentAchievement?: string;
  bossMode: boolean;
  shakeTime: number; // 屏幕抖动时间
}
