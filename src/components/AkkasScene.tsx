import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  ImagePlus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { CharacterGender, GameSettings } from '../types';

interface AkkasSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  studentName?: string;
  onReturnToVillage: () => void;
  onComplete?: () => void;
}

type Step = 'welcome' | 'camera' | 'preview' | 'success';

type ThemeId = 'maroon' | 'sea' | 'majlis' | 'crafts';

type LookId =
  | 'boy-thobe'
  | 'boy-bisht'
  | 'boy-nokhatha'
  | 'girl-bukhnaq'
  | 'girl-thobe'
  | 'girl-zari';

interface LookOption {
  id: LookId;
  title: string;
  subtitle: string;
}

interface ThemeOption {
  id: ThemeId;
  title: string;
  subtitle: string;
  frameColor: string;
  accentColor: string;
}

const MASTER_IMAGE_PATH = '/assets/akkas-master-map.png';

const PHOTO_WIDTH = 1280;
const PHOTO_HEIGHT = 900;

const BOY_LOOKS: LookOption[] = [
  {
    id: 'boy-thobe',
    title: 'ثوب وغترة',
    subtitle: 'إطلالة قطرية تقليدية',
  },
  {
    id: 'boy-bisht',
    title: 'البشت',
    subtitle: 'إطلالة رسمية فاخرة',
  },
  {
    id: 'boy-nokhatha',
    title: 'النوخذة',
    subtitle: 'إطلالة بحرية تراثية',
  },
];

const GIRL_LOOKS: LookOption[] = [
  {
    id: 'girl-bukhnaq',
    title: 'البخنق',
    subtitle: 'إطلالة قطرية تراثية',
  },
  {
    id: 'girl-thobe',
    title: 'الثوب التراثي',
    subtitle: 'إطلالة أنيقة ملونة',
  },
  {
    id: 'girl-zari',
    title: 'الزري',
    subtitle: 'إطلالة مطرزة بالذهبي',
  },
];

const THEMES: ThemeOption[] = [
  {
    id: 'maroon',
    title: 'قطر لوّل',
    subtitle: 'عنابي وذهبي',
    frameColor: '#8A1538',
    accentColor: '#FFE082',
  },
  {
    id: 'sea',
    title: 'البحر واللؤلؤ',
    subtitle: 'أزرق اللؤلؤ',
    frameColor: '#0E5A73',
    accentColor: '#EED79E',
  },
  {
    id: 'majlis',
    title: 'المجلس',
    subtitle: 'ضيافة ودفء',
    frameColor: '#4D2B1F',
    accentColor: '#F3D289',
  },
  {
    id: 'crafts',
    title: 'بيت الحرف',
    subtitle: 'حرف وهوية',
    frameColor: '#6D4A2B',
    accentColor: '#F0D08A',
  },
];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string,
  lineWidth = 2
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }

  ctx.drawImage(source, sx, sy, sw, sh, x, y, width, height);
}

function drawCenterGuide(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 24);
  ctx.lineTo(x + w / 2, y + h - 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 24, y + h / 2);
  ctx.lineTo(x + w - 24, y + h / 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,224,130,0.55)';
  ctx.lineWidth = 3;
  ctx.ellipse(x + w / 2, y + h * 0.28, 80, 95, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawOutfitOnCanvas(
  ctx: CanvasRenderingContext2D,
  lookId: LookId,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const cx = x + w / 2;
  const headY = y + h * 0.28;
  const bodyTop = y + h * 0.40;
  const bodyBottom = y + h * 0.90;

  ctx.save();
  ctx.globalAlpha = 0.96;

  // shadow
  ctx.beginPath();
  ctx.ellipse(cx, bodyBottom + 10, 120, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fill();

  // ===== BOY THOBE + GHUTRA =====
  if (lookId === 'boy-thobe') {
    // thobe
    ctx.beginPath();
    ctx.moveTo(cx - 95, bodyBottom);
    ctx.lineTo(cx - 62, bodyTop + 15);
    ctx.lineTo(cx + 62, bodyTop + 15);
    ctx.lineTo(cx + 95, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(210,210,210,0.95)';
    ctx.stroke();

    // collar
    ctx.fillStyle = '#eeeeee';
    drawRoundedRect(ctx, cx - 18, bodyTop + 5, 36, 24, 8, '#f4f4f4', '#d7d7d7', 2);

    // ghutra left and right
    ctx.beginPath();
    ctx.moveTo(cx - 88, headY - 28);
    ctx.lineTo(cx - 25, headY - 56);
    ctx.lineTo(cx - 18, headY + 14);
    ctx.lineTo(cx - 65, headY + 82);
    ctx.lineTo(cx - 98, headY + 12);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 88, headY - 28);
    ctx.lineTo(cx + 25, headY - 56);
    ctx.lineTo(cx + 18, headY + 14);
    ctx.lineTo(cx + 65, headY + 82);
    ctx.lineTo(cx + 98, headY + 12);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    // agal
    ctx.beginPath();
    ctx.ellipse(cx, headY - 22, 40, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#141414';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, headY - 14, 34, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#252525';
    ctx.fill();
  }

  // ===== BOY BISHT =====
  if (lookId === 'boy-bisht') {
    // inner thobe
    ctx.beginPath();
    ctx.moveTo(cx - 90, bodyBottom);
    ctx.lineTo(cx - 58, bodyTop + 15);
    ctx.lineTo(cx + 58, bodyTop + 15);
    ctx.lineTo(cx + 90, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();

    // bisht body
    ctx.beginPath();
    ctx.moveTo(cx - 128, bodyBottom);
    ctx.quadraticCurveTo(cx - 118, bodyTop + 88, cx - 78, bodyTop + 8);
    ctx.lineTo(cx + 78, bodyTop + 8);
    ctx.quadraticCurveTo(cx + 118, bodyTop + 88, cx + 128, bodyBottom);
    ctx.lineTo(cx + 88, bodyBottom);
    ctx.quadraticCurveTo(cx + 65, bodyTop + 100, cx + 40, bodyTop + 25);
    ctx.lineTo(cx - 40, bodyTop + 25);
    ctx.quadraticCurveTo(cx - 65, bodyTop + 100, cx - 88, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(76,50,28,0.92)';
    ctx.fill();

    // gold trim
    ctx.strokeStyle = '#E6C280';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 84, bodyBottom - 6);
    ctx.quadraticCurveTo(cx - 58, bodyTop + 102, cx - 30, bodyTop + 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 84, bodyBottom - 6);
    ctx.quadraticCurveTo(cx + 58, bodyTop + 102, cx + 30, bodyTop + 18);
    ctx.stroke();

    // ghutra
    ctx.beginPath();
    ctx.moveTo(cx - 80, headY - 24);
    ctx.lineTo(cx - 22, headY - 54);
    ctx.lineTo(cx - 18, headY + 18);
    ctx.lineTo(cx - 60, headY + 80);
    ctx.lineTo(cx - 92, headY + 15);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 80, headY - 24);
    ctx.lineTo(cx + 22, headY - 54);
    ctx.lineTo(cx + 18, headY + 18);
    ctx.lineTo(cx + 60, headY + 80);
    ctx.lineTo(cx + 92, headY + 15);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    // agal
    ctx.beginPath();
    ctx.ellipse(cx, headY - 18, 40, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#121212';
    ctx.fill();
  }

  // ===== BOY NOKHATHA =====
  if (lookId === 'boy-nokhatha') {
    // lower garment
    ctx.beginPath();
    ctx.moveTo(cx - 92, bodyBottom);
    ctx.lineTo(cx - 55, bodyTop + 22);
    ctx.lineTo(cx + 55, bodyTop + 22);
    ctx.lineTo(cx + 92, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(242,242,242,0.9)';
    ctx.fill();
    ctx.strokeStyle = '#d5d5d5';
    ctx.lineWidth = 3;
    ctx.stroke();

    // vest
    ctx.beginPath();
    ctx.moveTo(cx - 94, bodyTop + 22);
    ctx.lineTo(cx - 62, bodyTop - 2);
    ctx.lineTo(cx - 18, bodyTop + 36);
    ctx.lineTo(cx - 30, bodyBottom - 50);
    ctx.lineTo(cx - 100, bodyBottom - 18);
    ctx.closePath();
    ctx.fillStyle = 'rgba(154,110,62,0.92)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 94, bodyTop + 22);
    ctx.lineTo(cx + 62, bodyTop - 2);
    ctx.lineTo(cx + 18, bodyTop + 36);
    ctx.lineTo(cx + 30, bodyBottom - 50);
    ctx.lineTo(cx + 100, bodyBottom - 18);
    ctx.closePath();
    ctx.fillStyle = 'rgba(154,110,62,0.92)';
    ctx.fill();

    // rope belt
    ctx.strokeStyle = '#D8B16D';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 55, bodyTop + 110);
    ctx.lineTo(cx + 55, bodyTop + 110);
    ctx.stroke();

    // head cloth without agal
    ctx.beginPath();
    ctx.moveTo(cx - 78, headY - 15);
    ctx.lineTo(cx - 20, headY - 55);
    ctx.lineTo(cx + 20, headY - 55);
    ctx.lineTo(cx + 78, headY - 15);
    ctx.lineTo(cx + 52, headY + 45);
    ctx.lineTo(cx - 52, headY + 45);
    ctx.closePath();
    ctx.fillStyle = 'rgba(240,231,215,0.96)';
    ctx.fill();

    // knit cap
    ctx.beginPath();
    ctx.ellipse(cx, headY - 24, 24, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8c6a45';
    ctx.fill();
  }

  // ===== GIRL BUKHNAQ =====
  if (lookId === 'girl-bukhnaq') {
    // dress
    ctx.beginPath();
    ctx.moveTo(cx - 94, bodyBottom);
    ctx.lineTo(cx - 62, bodyTop + 20);
    ctx.lineTo(cx + 62, bodyTop + 20);
    ctx.lineTo(cx + 94, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(26,26,26,0.95)';
    ctx.fill();

    // gold trim
    ctx.strokeStyle = '#E6C280';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 68, bodyTop + 26);
    ctx.lineTo(cx - 86, bodyBottom - 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 68, bodyTop + 26);
    ctx.lineTo(cx + 86, bodyBottom - 12);
    ctx.stroke();

    // bukhnaq hood
    ctx.beginPath();
    ctx.moveTo(cx - 92, headY + 22);
    ctx.quadraticCurveTo(cx - 85, headY - 62, cx, headY - 82);
    ctx.quadraticCurveTo(cx + 85, headY - 62, cx + 92, headY + 22);
    ctx.lineTo(cx + 55, bodyTop + 16);
    ctx.lineTo(cx - 55, bodyTop + 16);
    ctx.closePath();
    ctx.fillStyle = 'rgba(25,25,25,0.95)';
    ctx.fill();

    ctx.strokeStyle = '#E6C280';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 68, headY + 10);
    ctx.quadraticCurveTo(cx, headY - 52, cx + 68, headY + 10);
    ctx.stroke();
  }

  // ===== GIRL THOBE =====
  if (lookId === 'girl-thobe') {
    // colored dress
    const grad = ctx.createLinearGradient(cx, bodyTop, cx, bodyBottom);
    grad.addColorStop(0, '#8A1538');
    grad.addColorStop(1, '#C45C7C');
    ctx.beginPath();
    ctx.moveTo(cx - 100, bodyBottom);
    ctx.lineTo(cx - 66, bodyTop + 18);
    ctx.lineTo(cx + 66, bodyTop + 18);
    ctx.lineTo(cx + 100, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#F1D18A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 44, bodyTop + 30);
    ctx.lineTo(cx - 54, bodyBottom - 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 44, bodyTop + 30);
    ctx.lineTo(cx + 54, bodyBottom - 18);
    ctx.stroke();

    // head scarf
    ctx.beginPath();
    ctx.moveTo(cx - 82, headY + 16);
    ctx.quadraticCurveTo(cx - 72, headY - 50, cx, headY - 68);
    ctx.quadraticCurveTo(cx + 72, headY - 50, cx + 82, headY + 16);
    ctx.lineTo(cx + 52, bodyTop + 14);
    ctx.lineTo(cx - 52, bodyTop + 14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,241,236,0.96)';
    ctx.fill();
  }

  // ===== GIRL ZARI =====
  if (lookId === 'girl-zari') {
    const grad = ctx.createLinearGradient(cx, bodyTop, cx, bodyBottom);
    grad.addColorStop(0, '#52304A');
    grad.addColorStop(1, '#884F7C');

    ctx.beginPath();
    ctx.moveTo(cx - 100, bodyBottom);
    ctx.lineTo(cx - 66, bodyTop + 18);
    ctx.lineTo(cx + 66, bodyTop + 18);
    ctx.lineTo(cx + 100, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // zari patterns
    ctx.strokeStyle = '#EAC770';
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i += 1) {
      const yy = bodyTop + 55 + i * 48;
      ctx.beginPath();
      ctx.moveTo(cx - 50, yy);
      ctx.lineTo(cx + 50, yy);
      ctx.stroke();
    }

    // head scarf
    ctx.beginPath();
    ctx.moveTo(cx - 86, headY + 18);
    ctx.quadraticCurveTo(cx - 76, headY - 52, cx, headY - 72);
    ctx.quadraticCurveTo(cx + 76, headY - 52, cx + 86, headY + 18);
    ctx.lineTo(cx + 56, bodyTop + 14);
    ctx.lineTo(cx - 56, bodyTop + 14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(244,229,210,0.96)';
    ctx.fill();

    ctx.strokeStyle = '#EAC770';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 62, headY + 12);
    ctx.quadraticCurveTo(cx, headY - 46, cx + 62, headY + 12);
    ctx.stroke();
  }

  ctx.restore();
}

const OutfitOverlay: React.FC<{
  lookId: LookId;
}> = ({ lookId }) => {
  const commonClass = 'absolute inset-0 flex items-center justify-center pointer-events-none';

  const renderBoyThobe = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <ellipse cx="200" cy="500" rx="90" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M140 435 L165 180 L235 180 L260 435 Z" fill="rgba(255,255,255,.92)" stroke="#d5d5d5" strokeWidth="3" />
      <rect x="184" y="184" width="32" height="22" rx="8" fill="#f5f5f5" stroke="#dadada" strokeWidth="2" />
      <path d="M108 120 L176 88 L182 170 L132 238 L102 165 Z" fill="rgba(255,255,255,.95)" />
      <path d="M292 120 L224 88 L218 170 L268 238 L298 165 Z" fill="rgba(255,255,255,.95)" />
      <ellipse cx="200" cy="122" rx="42" ry="10" fill="#141414" />
      <ellipse cx="200" cy="132" rx="35" ry="8" fill="#252525" />
    </svg>
  );

  const renderBoyBisht = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <ellipse cx="200" cy="500" rx="95" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M142 435 L166 182 L234 182 L258 435 Z" fill="rgba(255,255,255,.92)" />
      <path d="M104 435 Q114 274 144 188 L256 188 Q286 274 296 435 L248 435 Q230 322 214 206 L186 206 Q170 322 152 435 Z" fill="rgba(76,50,28,.94)" />
      <path d="M152 435 Q170 322 186 206" stroke="#E6C280" strokeWidth="5" fill="none" />
      <path d="M248 435 Q230 322 214 206" stroke="#E6C280" strokeWidth="5" fill="none" />
      <path d="M116 122 L176 90 L182 172 L136 236 L104 164 Z" fill="rgba(255,255,255,.95)" />
      <path d="M284 122 L224 90 L218 172 L264 236 L296 164 Z" fill="rgba(255,255,255,.95)" />
      <ellipse cx="200" cy="128" rx="42" ry="10" fill="#141414" />
    </svg>
  );

  const renderBoyNokhatha = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <ellipse cx="200" cy="500" rx="92" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M140 435 L168 190 L232 190 L260 435 Z" fill="rgba(245,245,245,.92)" stroke="#d8d8d8" strokeWidth="3" />
      <path d="M108 208 L162 176 L182 208 L172 386 L112 418 Z" fill="rgba(154,110,62,.94)" />
      <path d="M292 208 L238 176 L218 208 L228 386 L288 418 Z" fill="rgba(154,110,62,.94)" />
      <line x1="148" y1="286" x2="252" y2="286" stroke="#D8B16D" strokeWidth="5" />
      <path d="M126 136 L176 96 L224 96 L274 136 L250 196 L150 196 Z" fill="rgba(240,231,215,.96)" />
      <ellipse cx="200" cy="125" rx="24" ry="12" fill="#8c6a45" />
    </svg>
  );

  const renderGirlBukhnaq = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <ellipse cx="200" cy="500" rx="92" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M138 435 L165 188 L235 188 L262 435 Z" fill="rgba(26,26,26,.95)" />
      <path d="M130 214 Q135 108 200 90 Q265 108 270 214 L238 190 L162 190 Z" fill="rgba(25,25,25,.95)" />
      <path d="M146 205 Q200 150 254 205" stroke="#E6C280" strokeWidth="4" fill="none" />
      <path d="M166 188 L148 422" stroke="#E6C280" strokeWidth="4" />
      <path d="M234 188 L252 422" stroke="#E6C280" strokeWidth="4" />
    </svg>
  );

  const renderGirlThobe = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <defs>
        <linearGradient id="girlDressGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A1538" />
          <stop offset="100%" stopColor="#C45C7C" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="500" rx="92" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M136 435 L164 188 L236 188 L264 435 Z" fill="url(#girlDressGrad)" />
      <path d="M148 206 Q200 156 252 206" fill="rgba(255,241,236,.96)" />
      <path d="M148 206 Q200 156 252 206 L228 190 L172 190 Z" fill="rgba(255,241,236,.96)" />
      <path d="M176 208 L166 420" stroke="#F1D18A" strokeWidth="4" />
      <path d="M224 208 L234 420" stroke="#F1D18A" strokeWidth="4" />
    </svg>
  );

  const renderGirlZari = () => (
    <svg viewBox="0 0 400 520" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]">
      <defs>
        <linearGradient id="zariGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52304A" />
          <stop offset="100%" stopColor="#884F7C" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="500" rx="92" ry="16" fill="rgba(0,0,0,.18)" />
      <path d="M136 435 L164 188 L236 188 L264 435 Z" fill="url(#zariGrad)" />
      <path d="M144 210 Q200 154 256 210 L232 190 L168 190 Z" fill="rgba(244,229,210,.96)" />
      <path d="M150 260 L250 260" stroke="#EAC770" strokeWidth="4" />
      <path d="M150 305 L250 305" stroke="#EAC770" strokeWidth="4" />
      <path d="M150 350 L250 350" stroke="#EAC770" strokeWidth="4" />
      <path d="M150 395 L250 395" stroke="#EAC770" strokeWidth="4" />
      <path d="M156 205 Q200 160 244 205" stroke="#EAC770" strokeWidth="4" fill="none" />
    </svg>
  );

  let content: React.ReactNode = null;

  switch (lookId) {
    case 'boy-thobe':
      content = renderBoyThobe();
      break;
    case 'boy-bisht':
      content = renderBoyBisht();
      break;
    case 'boy-nokhatha':
      content = renderBoyNokhatha();
      break;
    case 'girl-bukhnaq':
      content = renderGirlBukhnaq();
      break;
    case 'girl-thobe':
      content = renderGirlThobe();
      break;
    case 'girl-zari':
      content = renderGirlZari();
      break;
    default:
      content = null;
  }

  return (
    <div className={commonClass}>
      <div className="relative w-[clamp(190px,34vw,380px)] h-[clamp(250px,54vh,470px)]">
        {content}

        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[34%] aspect-[1/1.14] border-2 border-dashed border-[#FFE082]/80 rounded-[45%] bg-transparent" />
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 rounded-full bg-black/45 border border-white/15 px-3 py-1 text-[10px] sm:text-xs text-white font-bold">
          ضع الوجه في المنتصف
        </div>
      </div>
    </div>
  );
};

export function AkkasScene({
  gender,
  settings,
  studentName = '',
  onReturnToVillage,
  onComplete,
}: AkkasSceneProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedLook, setSelectedLook] = useState<LookId>(
    gender === 'boy' ? 'boy-thobe' : 'girl-bukhnaq'
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('maroon');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completionReportedRef = useRef(false);

  const looks = gender === 'boy' ? BOY_LOOKS : GIRL_LOOKS;
  const currentTheme = THEMES.find((item) => item.id === selectedTheme) ?? THEMES[0];
  const currentLook = looks.find((item) => item.id === selectedLook) ?? looks[0];

  const visitorLabel = gender === 'boy' ? 'المنتسب' : 'المنتسبة';
  const welcomeTitle = gender === 'boy' ? 'جاهز للصورة التراثية؟' : 'جاهزة للصورة التراثية؟';
  const displayedName =
    studentName.trim() || (gender === 'boy' ? 'منتسب قطر لوّل' : 'منتسبة قطر لوّل');

  useEffect(() => {
    const allowed = looks.some((item) => item.id === selectedLook);
    if (!allowed) {
      setSelectedLook(looks[0].id);
    }
  }, [gender, looks, selectedLook]);

  useEffect(() => {
    return () => {
      stopCamera();

      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }

      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, [uploadedImageUrl, capturedUrl]);

  const speakArabic = (message: string) => {
    if (!settings.isSoundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang === 'ar-QA') ||
      voices.find((v) => v.lang === 'ar-SA') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.rate = 0.9;
    utterance.volume = Math.max(0.2, Math.min(1, settings.volume ?? 0.6));

    synth.speak(utterance);
  };

  const playSuccess = () => {
    if (!settings.isSoundEnabled || typeof window === 'undefined') {
      return;
    }

    try {
      const AudioContextCtor =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextCtor) return;

      const ctx = new AudioContextCtor();
      const now = ctx.currentTime;
      const volume = Math.max(0.03, (settings.volume ?? 0.6) * 0.08);
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(volume, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.28);
      });

      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 900);
    } catch {
      // ignore
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('الكاميرا غير مدعومة في هذا المتصفح. يمكنك اختيار صورة من الجهاز.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setIsCameraReady(true);

      speakArabic(
        gender === 'boy'
          ? 'ضع نفسك في وسط الإطار، ثم اختر اللبس المناسب.'
          : 'ضعي نفسك في وسط الإطار، ثم اختاري اللبس المناسب.'
      );
    } catch {
      setCameraError('تعذر فتح الكاميرا. اسمح بالوصول للكاميرا أو استخدم اختيار صورة.');
    }
  };

  useEffect(() => {
    if (step === 'camera') {
      const timer = window.setTimeout(() => {
        startCamera();
      }, 100);

      return () => window.clearTimeout(timer);
    }

    return;
  }, [step]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    const url = URL.createObjectURL(file);
    setUploadedImageUrl(url);
    stopCamera();
    setCameraError(null);
  };

  const composePhoto = async () => {
    if (isComposing) return;

    setIsComposing(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // background
      ctx.fillStyle = '#f4ead6';
      ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

      // frame
      const outer = 32;
      const topBand = 110;
      const bottomBand = 108;
      const photoX = 54;
      const photoY = 114;
      const photoW = PHOTO_WIDTH - 108;
      const photoH = PHOTO_HEIGHT - 232;

      drawRoundedRect(
        ctx,
        outer,
        outer,
        PHOTO_WIDTH - outer * 2,
        PHOTO_HEIGHT - outer * 2,
        26,
        currentTheme.frameColor,
        currentTheme.accentColor,
        6
      );

      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24, '#000000');

      let source: HTMLVideoElement | HTMLImageElement | null = null;
      let sourceWidth = 0;
      let sourceHeight = 0;

      if (uploadedImageUrl && uploadedImageRef.current) {
        source = uploadedImageRef.current;
        sourceWidth = uploadedImageRef.current.naturalWidth;
        sourceHeight = uploadedImageRef.current.naturalHeight;
      } else if (videoRef.current && videoRef.current.readyState >= 2) {
        source = videoRef.current;
        sourceWidth = videoRef.current.videoWidth;
        sourceHeight = videoRef.current.videoHeight;
      }

      if (!source || !sourceWidth || !sourceHeight) {
        setCameraError('لم تجهز الصورة بعد. حاول مرة أخرى.');
        return;
      }

      ctx.save();
      ctx.beginPath();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
      ctx.clip();

      drawCoverImage(ctx, source, sourceWidth, sourceHeight, photoX, photoY, photoW, photoH);

      // mirror camera image to look natural in selfie mode if using live video
      if (!uploadedImageUrl && source === videoRef.current) {
        ctx.clearRect(photoX, photoY, photoW, photoH);
        ctx.save();
        ctx.translate(photoX + photoW, photoY);
        ctx.scale(-1, 1);
        drawCoverImage(ctx, source, sourceWidth, sourceHeight, 0, 0, photoW, photoH);
        ctx.restore();
      }

      // dark vignette for better visibility
      const vignette = ctx.createLinearGradient(0, photoY, 0, photoY + photoH);
      vignette.addColorStop(0, 'rgba(0,0,0,0.08)');
      vignette.addColorStop(0.5, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = vignette;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // center guide and outfit
      drawCenterGuide(ctx, photoX, photoY, photoW, photoH);
      drawOutfitOnCanvas(ctx, currentLook.id, photoX, photoY, photoW, photoH);

      ctx.restore();

      // title bars
      ctx.fillStyle = currentTheme.frameColor;
      ctx.fillRect(photoX, 52, photoW, 38);
      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText('استوديو قطر لوّل', PHOTO_WIDTH / 2, 71);

      // bottom text strip
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      drawRoundedRect(ctx, photoX + 28, photoY + photoH - 82, photoW - 56, 54, 18, 'rgba(0,0,0,0.35)');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(displayedName, PHOTO_WIDTH / 2, photoY + photoH - 55);

      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${currentTheme.title} • ${currentLook.title}`, PHOTO_WIDTH / 2, PHOTO_HEIGHT - 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('الصورة أُنشئت محليًا على جهازك', PHOTO_WIDTH / 2, PHOTO_HEIGHT - 20);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png', 0.95)
      );

      if (!blob) return;

      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }

      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
      setStep('preview');
      playSuccess();

      speakArabic('تم تجهيز الصورة. يمكنك الآن حفظها أو إعادة التصوير.');
    } finally {
      setIsComposing(false);
    }
  };

  const downloadPhoto = () => {
    if (!capturedUrl) return;

    const link = document.createElement('a');
    link.href = capturedUrl;
    link.download = `qatar-lowwal-studio-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (!completionReportedRef.current) {
      completionReportedRef.current = true;
      onComplete?.();
    }

    playSuccess();
    setStep('success');
    speakArabic('ممتاز. تم حفظ الصورة بنجاح.');
  };

  const retakePhoto = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    setCapturedUrl(null);
    setStep('camera');
  };

  const leaveStudio = () => {
    stopCamera();
    onReturnToVillage();
  };

  return (
    <div
      className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#2a160b] text-white select-none"
      dir="rtl"
    >
      <img
        src={MASTER_IMAGE_PATH}
        alt="استوديو قطر لوّل"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/55 pointer-events-none" />

      <button
        onClick={leaveStudio}
        className="fixed top-[max(.65rem,env(safe-area-inset-top))] left-[max(.65rem,env(safe-area-inset-left))] z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-[clamp(12px,2.4vw,20px)] py-[clamp(7px,1.2vw,10px)] text-[clamp(12px,1.4vw,16px)] font-black shadow-xl active:scale-95"
      >
        العودة إلى القرية
      </button>

      <div className="fixed top-[max(.65rem,env(safe-area-inset-top))] right-[max(.65rem,env(safe-area-inset-right))] z-50 rounded-full bg-[#3c2415]/92 border border-[#E6C280] px-[clamp(12px,2.4vw,20px)] py-[clamp(7px,1.2vw,10px)] text-[clamp(13px,1.5vw,17px)] text-[#FFE082] font-black shadow-xl">
        استوديو قطر لوّل
      </div>

      {step === 'welcome' && (
        <div className="relative z-20 h-full flex items-end sm:items-center justify-center p-3 sm:p-6">
          <div className="w-[min(94vw,720px)] rounded-[28px] border-2 border-[#FFE082] bg-[#27140c]/92 p-[clamp(18px,4vw,34px)] text-center shadow-2xl backdrop-blur-md mb-[max(1rem,env(safe-area-inset-bottom))] sm:mb-0">
            <div className="mx-auto w-[clamp(64px,10vw,92px)] h-[clamp(64px,10vw,92px)] rounded-full bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center">
              <Camera className="w-[55%] h-[55%] text-[#FFE082]" />
            </div>

            <h1 className="mt-4 text-[clamp(25px,4vw,42px)] font-black text-[#FFE082]">
              {welcomeTitle}
            </h1>

            <p className="mt-3 text-[clamp(13px,1.7vw,17px)] leading-relaxed text-white/90">
              سيجهز الاستوديو تجربة تصوير مناسبة لـ <strong>{visitorLabel}</strong>،
              مع ظهور اللبس التراثي حسب الاختيار، والصورة تكون في المنتصف بشكل أوضح.
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-950/45 p-3 flex items-center justify-center gap-2 text-[clamp(11px,1.4vw,14px)] text-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              الصور والكاميرا تعمل محليًا على الجهاز، ولا يتم رفعها إلى الإنترنت.
            </div>

            <button
              onClick={() => setStep('camera')}
              className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-[clamp(12px,2vw,17px)] text-[clamp(16px,2vw,21px)] font-black text-white shadow-xl active:scale-[.98]"
            >
              ابدأ التصوير
            </button>
          </div>
        </div>
      )}

      {step === 'camera' && (
        <div className="relative z-20 h-full pt-[clamp(66px,9vw,84px)] pb-[max(.75rem,env(safe-area-inset-bottom))] px-2 sm:px-4 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-3 sm:gap-5">
            <section className="rounded-[24px] border-2 border-[#FFE082] bg-[#1c100a]/92 p-2.5 sm:p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-[clamp(18px,2.3vw,26px)] font-black text-[#FFE082]">
                    صورة {visitorLabel}
                  </h2>
                  <p className="text-[clamp(10px,1.2vw,13px)] text-white/70">{displayedName}</p>
                </div>

                <div className="rounded-full bg-emerald-950/60 border border-emerald-300/35 px-3 py-1.5 text-[10px] sm:text-xs text-emerald-200">
                  محلي وآمن
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] max-h-[68dvh] overflow-hidden rounded-[22px] bg-black border border-white/15 flex items-center justify-center">
                {!uploadedImageUrl && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover object-center scale-x-[-1]"
                  />
                )}

                {uploadedImageUrl && (
                  <img
                    ref={uploadedImageRef}
                    src={uploadedImageUrl}
                    alt="الصورة المختارة"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                )}

                <div
                  className="absolute inset-3 sm:inset-5 rounded-[20px] border-[3px] pointer-events-none"
                  style={{
                    borderColor: currentTheme.accentColor,
                    boxShadow: `inset 0 0 0 7px ${currentTheme.frameColor}55`,
                  }}
                />

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[78%] h-[86%] relative">
                      <div className="absolute inset-0 border border-dashed border-white/25 rounded-[28px]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[78%] bg-white/20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[78%] bg-white/20" />
                    </div>
                  </div>

                  <OutfitOverlay lookId={currentLook.id} />
                </div>

                <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 bg-black/55 border border-white/20 text-[clamp(12px,1.5vw,16px)] font-black text-white whitespace-nowrap pointer-events-none">
                  {currentLook.title} • {currentTheme.title}
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 border border-[#FFE082]/25 px-4 py-2 text-[11px] sm:text-xs text-white/95 pointer-events-none">
                  اضبط نفسك في الوسط ليظهر اللبس بشكل صحيح
                </div>

                {!isCameraReady && !uploadedImageUrl && !cameraError && (
                  <div className="relative z-10 rounded-2xl bg-black/65 px-5 py-4 text-center text-sm">
                    جاري فتح الكاميرا…
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-950/55 p-3 text-[clamp(11px,1.4vw,14px)] text-amber-100">
                  {cameraError}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E6C280] bg-[#3b2517] px-3 py-[clamp(10px,1.6vw,14px)] text-[clamp(12px,1.5vw,16px)] font-black text-[#FFE082] cursor-pointer active:scale-[.98]">
                  <ImagePlus className="w-5 h-5" />
                  اختيار صورة
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={composePhoto}
                  disabled={isComposing || (!isCameraReady && !uploadedImageUrl)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] px-3 py-[clamp(10px,1.6vw,14px)] text-[clamp(12px,1.5vw,16px)] font-black text-white shadow-xl active:scale-[.98] disabled:opacity-40"
                >
                  <Camera className="w-5 h-5" />
                  {isComposing ? 'جاري التجهيز…' : 'التقط الصورة'}
                </button>
              </div>
            </section>

            <aside className="rounded-[24px] border-2 border-[#E6C280] bg-[#2a170e]/94 p-3 sm:p-4 shadow-2xl backdrop-blur-md">
              <div>
                <h3 className="text-[clamp(16px,2vw,21px)] font-black text-[#FFE082]">
                  {gender === 'boy' ? 'لبس المنتسب' : 'لبس المنتسبة'}
                </h3>

                <p className="mt-1 text-[10px] sm:text-xs text-white/65">
                  تظهر الخيارات تلقائيًا حسب الشخصية المختارة.
                </p>

                <div className="mt-3 grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {looks.map((look) => {
                    const selected = selectedLook === look.id;

                    return (
                      <button
                        key={look.id}
                        onClick={() => setSelectedLook(look.id)}
                        className={`rounded-2xl border-2 p-2.5 sm:p-3 text-center lg:text-right transition-all ${
                          selected
                            ? 'bg-[#8A1538] border-[#FFE082] text-white'
                            : 'bg-black/20 border-white/15 text-white/80'
                        }`}
                      >
                        <div className="flex items-center justify-center lg:justify-between gap-2">
                          <span className="text-[clamp(11px,1.4vw,15px)] font-black">
                            {look.title}
                          </span>
                          {selected && <Sparkles className="w-4 h-4 text-[#FFE082]" />}
                        </div>

                        <div className="hidden sm:block mt-1 text-[10px] sm:text-[11px] opacity-75">
                          {look.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <h3 className="text-[clamp(16px,2vw,21px)] font-black text-[#FFE082]">
                  إطار الصورة
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => {
                    const selected = selectedTheme === theme.id;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`rounded-2xl border-2 p-3 text-center ${
                          selected
                            ? 'border-[#FFE082] bg-white/10'
                            : 'border-white/15 bg-black/15'
                        }`}
                      >
                        <div
                          className="mx-auto w-8 h-8 rounded-full border-2"
                          style={{
                            backgroundColor: theme.frameColor,
                            borderColor: theme.accentColor,
                          }}
                        />

                        <div className="mt-1.5 text-[11px] sm:text-xs font-black">
                          {theme.title}
                        </div>

                        <div className="mt-1 text-[10px] text-white/65">
                          {theme.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-300/30 bg-emerald-950/35 p-3 text-[10px] sm:text-xs leading-relaxed text-emerald-100">
                <strong>الخصوصية:</strong> لا يوجد إرسال للصورة إلى أي خادم.
                الالتقاط والمعاينة والتركيب والتنزيل يتم داخل جهاز المستخدم فقط.
              </div>
            </aside>
          </div>
        </div>
      )}

      {step === 'preview' && capturedUrl && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
          <div className="w-[min(96vw,900px)] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[28px] border-2 border-[#FFE082] bg-[#24140d] p-3 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-[clamp(19px,2.7vw,28px)] font-black text-[#FFE082]">
                  صورتك جاهزة
                </h2>
                <p className="text-[10px] sm:text-xs text-white/65">
                  اللبس المختار مطبق على الصورة.
                </p>
              </div>

              <button
                onClick={retakePhoto}
                className="w-10 h-10 rounded-full bg-black/25 border border-white/20 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={capturedUrl}
              alt="الصورة التذكارية"
              className="w-full max-h-[66dvh] object-contain rounded-2xl bg-black"
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={retakePhoto}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E6C280] bg-[#3c271a] py-3 text-[clamp(12px,1.6vw,16px)] font-black text-[#FFE082] active:scale-[.98]"
              >
                <RotateCcw className="w-5 h-5" />
                إعادة التصوير
              </button>

              <button
                onClick={downloadPhoto}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#FFE082] bg-[#8A1538] py-3 text-[clamp(12px,1.6vw,16px)] font-black text-white shadow-xl active:scale-[.98]"
              >
                <Download className="w-5 h-5" />
                حفظ الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[30px] border-2 border-[#FFE082] bg-[#2b170f]/97 p-6 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto w-16 h-16 text-emerald-300" />

            <h2 className="mt-3 text-3xl font-black text-[#FFE082]">
              تمت المهمة!
            </h2>

            <p className="mt-2 text-base sm:text-lg leading-relaxed text-white/90">
              تم حفظ الصورة على الجهاز وحصل {visitorLabel} على ختم <strong>استوديو قطر لوّل</strong>.
            </p>

            <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-950/35 p-3 text-xs text-emerald-100">
              لم يتم إرسال الصورة أو حفظها على الإنترنت.
            </div>

            <button
              onClick={leaveStudio}
              className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 font-black text-[#FFE082] active:scale-95"
            >
              العودة إلى القرية
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
