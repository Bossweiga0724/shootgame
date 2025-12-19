
import React, { useRef, useEffect, useState } from 'react';
import { GameState, Position, EnemyType, CharacterType } from '../types';
import { ISO_FACTOR_X, ISO_FACTOR_Y, MAP_SIZE, ROW_COUNT, ROW_WIDTH } from '../constants';

interface GameViewProps {
  gameState: GameState;
  onSetTarget: (pos: Position) => void;
}

const BG_IMAGE_URL = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc_gen_image/cc279dec33a946559a7da1433266564apreview.jpeg~tplv-a9rns2rl98-image_pre_watermark_1_6b.png?rcl=202512191101418CBA0FBFDF0D071F12DD&rk3s=8e244e95&rrcfp=ddbb2dc7&x-expires=2081473316&x-signature=UtB7G15%2F6jq%2FNziO2J%2BXXoWvwug%3D';

// Detailed Pixel Art Matrices (12x12)
const PIXEL_SPRITES: Record<string, number[][]> = {
  [CharacterType.RIFLEMAN]: [
    [0,0,0,3,3,3,3,3,3,0,0,0], [0,0,3,2,2,2,2,2,2,3,0,0], [0,3,2,2,1,1,1,1,2,2,3,0], [0,3,2,4,4,1,1,4,4,2,3,0],
    [0,3,2,2,1,1,1,1,2,2,3,0], [0,0,3,3,3,3,3,3,3,3,0,0], [0,0,3,2,2,2,2,2,2,3,0,0], [0,3,5,2,2,2,2,2,2,5,3,0],
    [0,3,5,2,2,3,3,2,2,5,3,0], [0,0,3,2,2,0,0,2,2,3,0,0], [0,0,3,2,2,0,0,2,2,3,0,0], [0,3,3,3,3,0,0,3,3,3,3,0]
  ],
  [CharacterType.TANK]: [
    [0,3,3,3,3,3,3,3,3,3,3,0], [3,3,2,2,2,2,2,2,2,2,3,3], [3,2,2,2,2,2,2,2,2,2,2,3], [3,2,4,4,2,2,2,2,4,4,2,3],
    [3,2,1,1,2,2,2,2,1,1,2,3], [3,3,3,3,3,3,3,3,3,3,3,3], [3,5,5,5,2,2,2,2,5,5,5,3], [3,5,5,5,2,2,2,2,5,5,5,3],
    [3,3,3,3,3,3,3,3,3,3,3,3], [0,3,3,3,0,0,0,0,3,3,3,0], [0,3,3,3,0,0,0,0,3,3,3,0], [0,3,3,3,0,0,0,0,3,3,3,0]
  ],
  [CharacterType.GIRL]: [
    [0,0,0,0,6,6,6,6,0,0,0,0], [0,0,0,6,1,1,1,1,6,0,0,0], [0,0,6,1,4,1,1,4,1,6,0,0], [0,0,6,1,1,1,1,1,1,6,0,0],
    [0,0,0,6,6,6,6,6,6,0,0,0], [0,3,0,6,2,2,2,2,6,0,3,0], [0,3,0,6,2,2,2,2,6,0,3,0], [0,0,0,6,6,6,6,6,6,0,0,0],
    [0,0,0,2,2,2,2,2,2,0,0,0], [0,0,0,6,6,0,0,6,6,0,0,0], [0,0,0,6,6,0,0,6,6,0,0,0], [0,0,6,6,6,0,0,6,6,6,0,0]
  ],
  [EnemyType.REGULAR]: [
    [0,0,0,3,3,3,3,0,0,0], [0,0,3,2,2,2,2,3,0,0], [0,3,2,4,2,2,4,2,3,0], [0,3,2,2,2,2,2,2,3,0], [0,0,3,3,3,3,3,3,0,0],
    [0,0,3,2,2,2,2,3,0,0], [0,0,3,2,2,2,2,3,0,0], [0,0,3,3,3,3,3,3,0,0], [0,3,3,0,0,0,0,3,3,0], [0,3,3,0,0,0,0,3,3,0]
  ],
  [EnemyType.ELITE]: [
    [0,3,3,0,3,3,0,3,3,0], [3,6,6,3,2,2,3,6,6,3], [3,2,2,6,4,4,6,2,2,3], [3,2,2,6,2,2,6,2,2,3], [0,3,3,3,3,3,3,3,3,0],
    [0,3,2,2,6,6,2,2,3,0], [0,3,2,2,6,6,2,2,3,0], [3,3,3,3,3,3,3,3,3,3], [3,3,3,0,0,0,0,3,3,3], [3,3,3,0,0,0,0,3,3,3]
  ],
  [EnemyType.BOSS]: [
    [0,0,3,3,3,3,3,3,0,0], [0,3,6,6,6,6,6,6,3,0], [3,6,2,2,2,2,2,2,6,3], [3,6,2,4,2,2,4,2,6,3], [3,6,2,2,2,2,2,2,6,3],
    [3,6,6,6,3,3,6,6,6,3], [3,2,2,2,3,3,2,2,2,3], [3,3,3,3,3,3,3,3,3,3], [0,3,3,3,3,3,3,3,3,0], [3,3,3,3,0,0,3,3,3,3]
  ],
  [EnemyType.MEGA_BOSS]: [
    [0,0,0,3,3,3,3,3,3,3,3,3,0,0,0], [0,0,3,6,6,6,6,6,6,6,6,6,3,0,0], [0,3,6,2,2,2,2,2,2,2,2,2,6,3,0],
    [3,6,2,4,4,4,2,2,2,4,4,4,2,6,3], [3,6,2,4,1,4,2,2,2,4,1,4,2,6,3], [3,6,2,4,4,4,2,2,2,4,4,4,2,6,3],
    [3,6,2,2,2,2,2,5,2,2,2,2,2,6,3], [3,6,2,2,2,5,5,5,5,2,2,2,2,6,3], [3,6,2,2,2,2,5,5,2,2,2,2,2,6,3],
    [0,3,6,6,6,6,6,6,6,6,6,6,3,0,0], [0,0,3,3,3,3,3,3,3,3,3,3,0,0,0]
  ]
};

const GameView: React.FC<GameViewProps> = ({ gameState, onSetTarget }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapImg, setMapImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = BG_IMAGE_URL;
    img.onload = () => setMapImg(img);
  }, []);

  const toIso = (x: number, y: number) => ({ x: (x - y) * ISO_FACTOR_X, y: (x + y) * ISO_FACTOR_Y });
  const fromIso = (ix: number, iy: number) => {
    const rx = (ix / ISO_FACTOR_X + iy / ISO_FACTOR_Y) / 2;
    const ry = (iy / ISO_FACTOR_Y - ix / ISO_FACTOR_X) / 2;
    return { x: rx + MAP_SIZE/2, y: ry + MAP_SIZE/2 };
  };

  const drawPixelSprite = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, primaryColor: string, scale: number) => {
    const m = PIXEL_SPRITES[type] || PIXEL_SPRITES[EnemyType.REGULAR];
    ctx.save();
    ctx.translate(x, y);
    const sw = m[0].length * scale, sh = m.length * scale;
    m.forEach((row, r) => row.forEach((c, i) => {
      if (c === 0) return;
      ctx.fillStyle = c === 1 ? '#ffdbac' : c === 2 ? primaryColor : c === 3 ? '#000' : c === 4 ? '#f00' : c === 5 ? '#ffd700' : '#fff';
      ctx.fillRect(i * scale - sw/2, r * scale - sh, scale, scale);
    }));
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const render = (time: number) => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const cx = canvas.width/2, cy = canvas.height/2;

      // 1. Draw Flat Tiled Background (Full Stretch)
      if (mapImg) {
        ctx.save();
        ctx.translate(cx, cy);
        const v1 = toIso(-MAP_SIZE/2, -MAP_SIZE/2), v2 = toIso(MAP_SIZE/2, -MAP_SIZE/2), v4 = toIso(-MAP_SIZE/2, MAP_SIZE/2);
        ctx.transform((v2.x-v1.x)/MAP_SIZE, (v2.y-v1.y)/MAP_SIZE, (v4.x-v1.x)/MAP_SIZE, (v4.y-v1.y)/MAP_SIZE, v1.x, v1.y);
        ctx.drawImage(mapImg, 0, 0, MAP_SIZE, MAP_SIZE);
        ctx.restore();
      }

      // 2. Row Clear Danger Zones
      gameState.skillEffects.forEach(fx => {
        if (fx.type === 'DANGER_ROW') {
          ctx.save(); ctx.translate(cx, cy);
          ctx.fillStyle = fx.color;
          ctx.beginPath();
          const r = fx.rowId!;
          const p1 = toIso(-MAP_SIZE/2 + r*ROW_WIDTH, -MAP_SIZE/2 + r*ROW_WIDTH);
          const p2 = toIso(MAP_SIZE/2, -MAP_SIZE/2 + r*ROW_WIDTH);
          const p3 = toIso(MAP_SIZE/2, -MAP_SIZE/2 + (r+1)*ROW_WIDTH);
          const p4 = toIso(-MAP_SIZE/2 + (r+1)*ROW_WIDTH, MAP_SIZE/2);
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
          ctx.fill();
          ctx.restore();
        }
      });

      // 3. Enemies
      gameState.enemies.forEach(e => {
        const iso = toIso(e.x-MAP_SIZE/2, e.y-MAP_SIZE/2);
        const scale = e.type === EnemyType.MEGA_BOSS ? 45 : e.type === EnemyType.BOSS ? 8 : (e.type === EnemyType.ELITE ? 5 : 4);
        drawPixelSprite(ctx, cx+iso.x, cy+iso.y, e.type, e.color, scale);
        // HP Bar
        if (e.type !== EnemyType.MEGA_BOSS) {
          const bw = e.radius * 2.5;
          ctx.fillStyle = '#222'; ctx.fillRect(cx+iso.x-bw/2, cy+iso.y-scale*10-15, bw, 5);
          ctx.fillStyle = e.color; ctx.fillRect(cx+iso.x-bw/2, cy+iso.y-scale*10-15, bw*(e.hp/e.maxHp), 5);
        }
      });

      // 4. Player
      const p = gameState.player, pIso = toIso(p.x-MAP_SIZE/2, p.y-MAP_SIZE/2);
      drawPixelSprite(ctx, cx+pIso.x, cy+pIso.y, p.characterType, p.color, 5);

      // 5. Bullets
      gameState.bullets.forEach(b => {
        const iso = toIso(b.x-MAP_SIZE/2, b.y-MAP_SIZE/2);
        ctx.fillStyle = b.color; ctx.shadowBlur = 10; ctx.shadowColor = b.color;
        ctx.beginPath(); ctx.arc(cx+iso.x, cy+iso.y, b.size || 8, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 6. Skill FX
      gameState.skillEffects.forEach(fx => {
        if (fx.type === 'DANGER_ROW') return;
        const iso = toIso(fx.x-MAP_SIZE/2, fx.y-MAP_SIZE/2);
        ctx.save(); ctx.translate(cx+iso.x, cy+iso.y);
        ctx.strokeStyle = fx.color; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(0, 0, fx.radius, fx.radius*0.5, 0, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      });

      // 7. Warnings
      gameState.warnings.forEach(w => {
        const iso = toIso(w.x-MAP_SIZE/2, w.y-MAP_SIZE/2);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx+iso.x, cy+iso.y, 20, 10, 0, 0, Math.PI*2); ctx.stroke();
      });
    };
    let f: number; const loop = (t: number) => { render(t); f = requestAnimationFrame(loop); }; f = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(f);
  }, [gameState, mapImg]);

  return <canvas ref={canvasRef} onContextMenu={e => { e.preventDefault(); const r = canvasRef.current!.getBoundingClientRect(); onSetTarget(fromIso(e.clientX-r.left-canvasRef.current!.width/2, e.clientY-r.top-canvasRef.current!.height/2)); }} className="block cursor-crosshair w-full h-full" />;
};

export default GameView;
