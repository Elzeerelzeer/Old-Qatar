import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  ImagePlus,
  Minus,
  Plus,
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

type SceneId =
  | 'souq'
  | 'pearl'
  | 'games'
  | 'majlis'
  | 'crafts'
  | 'studio';
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
  frameColor: string;
  accentColor: string;
}

interface SceneOption {
  id: SceneId;
  title: string;
  subtitle: string;
  imagePath: string;
}

const MASTER_IMAGE_PATH = '/assets/akkas-master-map.png';
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 960;

const BOY_LOOKS: LookOption[] = [
  { id: 'boy-thobe', title: 'ثوب وغترة', subtitle: 'إطلالة قطرية تقليدية' },
  { id: 'boy-bisht', title: 'البشت', subtitle: 'إطلالة رسمية فاخرة' },
  { id: 'boy-nokhatha', title: 'النوخذة', subtitle: 'إطلالة بحرية تراثية' },
];

const GIRL_LOOKS: LookOption[] = [
  { id: 'girl-bukhnaq', title: 'البخنق', subtitle: 'إطلالة قطرية تراثية محتشمة' },
  { id: 'girl-thobe', title: 'الثوب التراثي', subtitle: 'إطلالة قطرية أنيقة' },
  { id: 'girl-zari', title: 'الزري الذهبي', subtitle: 'إطلالة مطرزة بالزري' },
];

const THEMES: ThemeOption[] = [
  { id: 'maroon', title: 'قطر لوّل', frameColor: '#8A1538', accentColor: '#FFE082' },
  { id: 'sea', title: 'البحر واللؤلؤ', frameColor: '#0E5A73', accentColor: '#EED79E' },
  { id: 'majlis', title: 'المجلس', frameColor: '#4D2B1F', accentColor: '#F3D289' },
  { id: 'crafts', title: 'بيت الحرف', frameColor: '#6D4A2B', accentColor: '#F0D08A' },
];

const SCENES: SceneOption[] = [
  {
    id: 'souq',
    title: 'سوق لوّل',
    subtitle: 'الدكاكين والفخار والتجارة',
    imagePath: '/assets/souq-master-map.png.jpeg',
  },
  {
    id: 'pearl',
    title: 'بحر اللؤلؤ',
    subtitle: 'البحر والمحمل والغوص',
    imagePath: '/assets/pearl-sea-master-map.png',
  },
  {
    id: 'games',
    title: 'فريج الألعاب',
    subtitle: 'ألعاب الفريج الشعبية',
    imagePath: '/assets/games-master-map.png',
  },
  {
    id: 'majlis',
    title: 'مجلس لوّل',
    subtitle: 'الضيافة والقهوة والبخور',
    imagePath: '/assets/majlis-master-map.png',
  },
  {
    id: 'crafts',
    title: 'بيت الحرف',
    subtitle: 'السدو والخوص وصناعة المحمل',
    imagePath: '/assets/crafts-master-map.png',
  },
  {
    id: 'studio',
    title: 'استوديو قطر لوّل',
    subtitle: 'الاستوديو التراثي',
    imagePath: '/assets/akkas-master-map.png',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawCoverCrop(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const targetRatio = width / height;
  const sourceRatio = sourceWidth / sourceHeight;

  let baseCropW = sourceWidth;
  let baseCropH = sourceHeight;

  if (sourceRatio > targetRatio) {
    baseCropW = sourceHeight * targetRatio;
  } else {
    baseCropH = sourceWidth / targetRatio;
  }

  const cropW = baseCropW / zoom;
  const cropH = baseCropH / zoom;
  const maxShiftX = Math.max(0, sourceWidth - cropW);
  const maxShiftY = Math.max(0, sourceHeight - cropH);

  const normalizedX = clamp(0.5 - offsetX / 100, 0, 1);

  // The face is normally in the upper part of a selfie frame.
  // Start the crop near the top instead of the vertical center,
  // otherwise a chest/shirt can appear inside the face opening.
  const normalizedY = clamp(0.04 - offsetY / 100, 0, 1);

  const sx = maxShiftX * normalizedX;
  const sy = maxShiftY * normalizedY;

  ctx.drawImage(source, sx, sy, cropW, cropH, x, y, width, height);
}


function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);

    image.src = src;
  });
}

function drawBackgroundCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    width,
    height,
  );
}

function drawStudioBackground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeOption,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, PHOTO_HEIGHT);
  gradient.addColorStop(0, '#dfba78');
  gradient.addColorStop(0.48, '#9a633c');
  gradient.addColorStop(1, '#3b2115');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

  ctx.fillStyle = 'rgba(255,235,190,.18)';
  ctx.beginPath();
  ctx.arc(180, 170, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(40,20,10,.35)';
  ctx.fillRect(0, PHOTO_HEIGHT * 0.76, PHOTO_WIDTH, PHOTO_HEIGHT * 0.24);

  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, PHOTO_WIDTH - 56, PHOTO_HEIGHT - 56);

  ctx.strokeStyle = theme.frameColor;
  ctx.lineWidth = 20;
  ctx.strokeRect(45, 45, PHOTO_WIDTH - 90, PHOTO_HEIGHT - 90);
}

function drawOutfitCanvas(
  ctx: CanvasRenderingContext2D,
  look: LookId,
  faceCx: number,
  faceCy: number,
  faceW: number,
  faceH: number,
) {
  const bodyTop = faceCy + faceH * 0.36;
  const bodyBottom = PHOTO_HEIGHT * 0.83;
  const shoulder = faceW * 1.95;
  const hem = faceW * 2.25;

  ctx.save();

  const makeRobe = (fill: string, stroke: string) => {
    ctx.beginPath();
    ctx.moveTo(faceCx - shoulder / 2, bodyTop);
    ctx.quadraticCurveTo(faceCx - shoulder * 0.72, bodyTop + 110, faceCx - hem / 2, bodyBottom);
    ctx.lineTo(faceCx + hem / 2, bodyBottom);
    ctx.quadraticCurveTo(faceCx + shoulder * 0.72, bodyTop + 110, faceCx + shoulder / 2, bodyTop);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  };

  if (look === 'boy-thobe' || look === 'boy-bisht' || look === 'boy-nokhatha') {
    makeRobe('rgba(252,252,252,.97)', '#d8d8d8');
  }

  if (look === 'boy-thobe') {
    ctx.fillStyle = 'rgba(255,255,255,.97)';
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.72, faceCy - faceH * 0.1);
    ctx.lineTo(faceCx - faceW * 0.15, faceCy - faceH * 0.52);
    ctx.lineTo(faceCx - faceW * 0.12, bodyTop + 60);
    ctx.lineTo(faceCx - faceW * 0.88, bodyTop + 110);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(faceCx + faceW * 0.72, faceCy - faceH * 0.1);
    ctx.lineTo(faceCx + faceW * 0.15, faceCy - faceH * 0.52);
    ctx.lineTo(faceCx + faceW * 0.12, bodyTop + 60);
    ctx.lineTo(faceCx + faceW * 0.88, bodyTop + 110);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(faceCx, faceCy - faceH * 0.37, faceW * 0.34, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (look === 'boy-bisht') {
    ctx.beginPath();
    ctx.moveTo(faceCx - shoulder * 0.62, bodyTop - 12);
    ctx.lineTo(faceCx - shoulder * 0.22, bodyTop + 18);
    ctx.lineTo(faceCx - hem * 0.42, bodyBottom);
    ctx.lineTo(faceCx - hem * 0.7, bodyBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74,47,27,.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(faceCx + shoulder * 0.62, bodyTop - 12);
    ctx.lineTo(faceCx + shoulder * 0.22, bodyTop + 18);
    ctx.lineTo(faceCx + hem * 0.42, bodyBottom);
    ctx.lineTo(faceCx + hem * 0.7, bodyBottom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#E6C280';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(faceCx - shoulder * 0.2, bodyTop + 14);
    ctx.lineTo(faceCx - hem * 0.4, bodyBottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(faceCx + shoulder * 0.2, bodyTop + 14);
    ctx.lineTo(faceCx + hem * 0.4, bodyBottom);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,.97)';
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.72, faceCy - faceH * 0.1);
    ctx.lineTo(faceCx - faceW * 0.15, faceCy - faceH * 0.52);
    ctx.lineTo(faceCx - faceW * 0.1, bodyTop + 45);
    ctx.lineTo(faceCx - faceW * 0.82, bodyTop + 90);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(faceCx + faceW * 0.72, faceCy - faceH * 0.1);
    ctx.lineTo(faceCx + faceW * 0.15, faceCy - faceH * 0.52);
    ctx.lineTo(faceCx + faceW * 0.1, bodyTop + 45);
    ctx.lineTo(faceCx + faceW * 0.82, bodyTop + 90);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(faceCx, faceCy - faceH * 0.37, faceW * 0.34, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (look === 'boy-nokhatha') {
    ctx.fillStyle = 'rgba(154,110,62,.96)';
    ctx.beginPath();
    ctx.moveTo(faceCx - shoulder * 0.6, bodyTop);
    ctx.lineTo(faceCx - shoulder * 0.15, bodyTop + 30);
    ctx.lineTo(faceCx - hem * 0.34, bodyBottom - 20);
    ctx.lineTo(faceCx - hem * 0.58, bodyBottom - 60);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(faceCx + shoulder * 0.6, bodyTop);
    ctx.lineTo(faceCx + shoulder * 0.15, bodyTop + 30);
    ctx.lineTo(faceCx + hem * 0.34, bodyBottom - 20);
    ctx.lineTo(faceCx + hem * 0.58, bodyBottom - 60);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#D8B16D';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.75, bodyTop + 145);
    ctx.lineTo(faceCx + faceW * 0.75, bodyTop + 145);
    ctx.stroke();

    ctx.fillStyle = '#8c6a45';
    ctx.beginPath();
    ctx.ellipse(faceCx, faceCy - faceH * 0.36, faceW * 0.25, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(240,231,215,.97)';
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.66, faceCy - faceH * 0.12);
    ctx.lineTo(faceCx - faceW * 0.22, faceCy - faceH * 0.5);
    ctx.lineTo(faceCx + faceW * 0.22, faceCy - faceH * 0.5);
    ctx.lineTo(faceCx + faceW * 0.66, faceCy - faceH * 0.12);
    ctx.lineTo(faceCx + faceW * 0.48, bodyTop + 50);
    ctx.lineTo(faceCx - faceW * 0.48, bodyTop + 50);
    ctx.closePath();
    ctx.fill();
  }

  if (look === 'girl-bukhnaq') {
    makeRobe('rgba(24,24,24,.97)', '#E6C280');
    ctx.fillStyle = 'rgba(23,23,23,.98)';
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.86, bodyTop + 35);
    ctx.quadraticCurveTo(faceCx - faceW * 0.86, faceCy - faceH * 0.44, faceCx, faceCy - faceH * 0.62);
    ctx.quadraticCurveTo(faceCx + faceW * 0.86, faceCy - faceH * 0.44, faceCx + faceW * 0.86, bodyTop + 35);
    ctx.lineTo(faceCx + faceW * 0.48, bodyTop + 95);
    ctx.lineTo(faceCx - faceW * 0.48, bodyTop + 95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#E6C280';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  if (look === 'girl-thobe' || look === 'girl-zari') {
    const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom);
    if (look === 'girl-thobe') {
      grad.addColorStop(0, '#8A1538');
      grad.addColorStop(1, '#C45C7C');
    } else {
      grad.addColorStop(0, '#52304A');
      grad.addColorStop(1, '#884F7C');
    }
    makeRobe(grad as unknown as string, '#EAC770');

    ctx.fillStyle = 'rgba(244,229,210,.98)';
    ctx.beginPath();
    ctx.moveTo(faceCx - faceW * 0.82, bodyTop + 38);
    ctx.quadraticCurveTo(faceCx - faceW * 0.75, faceCy - faceH * 0.4, faceCx, faceCy - faceH * 0.58);
    ctx.quadraticCurveTo(faceCx + faceW * 0.75, faceCy - faceH * 0.4, faceCx + faceW * 0.82, bodyTop + 38);
    ctx.lineTo(faceCx + faceW * 0.45, bodyTop + 85);
    ctx.lineTo(faceCx - faceW * 0.45, bodyTop + 85);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#EAC770';
    ctx.lineWidth = 6;
    if (look === 'girl-zari') {
      for (let i = 0; i < 4; i += 1) {
        const yy = bodyTop + 115 + i * 70;
        ctx.beginPath();
        ctx.moveTo(faceCx - faceW * 0.9, yy);
        ctx.lineTo(faceCx + faceW * 0.9, yy);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function OutfitPreview({ look }: { look: LookId }) {
  const common = 'absolute inset-0 pointer-events-none';
  const faceHole = (
    <div className="absolute left-1/2 top-[11%] -translate-x-1/2 w-[24%] h-[31%] rounded-[45%] border-2 border-dashed border-[#FFE082]/80" />
  );

  const robeBase = 'absolute left-1/2 -translate-x-1/2 top-[36%] w-[58%] h-[59%] rounded-t-[34%] rounded-b-[10%] border-2';

  return (
    <div className={common}>
      {look === 'boy-thobe' && (
        <>
          <div className={`${robeBase} bg-white/95 border-slate-200`} />
          <div className="absolute left-[26%] top-[10%] w-[24%] h-[42%] bg-white/95 [clip-path:polygon(100%_0,42%_8%,0_44%,22%_100%,78%_64%)]" />
          <div className="absolute right-[26%] top-[10%] w-[24%] h-[42%] bg-white/95 [clip-path:polygon(0_0,58%_8%,100%_44%,78%_100%,22%_64%)]" />
          <div className="absolute left-1/2 top-[10.8%] -translate-x-1/2 w-[23%] h-[5%] rounded-[50%] bg-[#111] border-2 border-black" />
        </>
      )}

      {look === 'boy-bisht' && (
        <>
          <div className={`${robeBase} bg-white/95 border-slate-200`} />
          <div className="absolute left-[15%] top-[34%] w-[35%] h-[61%] bg-[#4a2f1b]/95 border-r-4 border-[#E6C280] [clip-path:polygon(24%_0,100%_7%,73%_100%,0_100%)]" />
          <div className="absolute right-[15%] top-[34%] w-[35%] h-[61%] bg-[#4a2f1b]/95 border-l-4 border-[#E6C280] [clip-path:polygon(76%_0,0_7%,27%_100%,100%_100%)]" />
          <div className="absolute left-[26%] top-[10%] w-[24%] h-[42%] bg-white/95 [clip-path:polygon(100%_0,42%_8%,0_44%,22%_100%,78%_64%)]" />
          <div className="absolute right-[26%] top-[10%] w-[24%] h-[42%] bg-white/95 [clip-path:polygon(0_0,58%_8%,100%_44%,78%_100%,22%_64%)]" />
          <div className="absolute left-1/2 top-[10.8%] -translate-x-1/2 w-[23%] h-[5%] rounded-[50%] bg-[#111]" />
        </>
      )}

      {look === 'boy-nokhatha' && (
        <>
          <div className={`${robeBase} bg-[#f7f1e6] border-stone-300`} />
          <div className="absolute left-[18%] top-[35%] w-[32%] h-[58%] bg-[#9a6e3e]/95 [clip-path:polygon(12%_0,100%_8%,70%_100%,0_100%)]" />
          <div className="absolute right-[18%] top-[35%] w-[32%] h-[58%] bg-[#9a6e3e]/95 [clip-path:polygon(88%_0,0_8%,30%_100%,100%_100%)]" />
          <div className="absolute left-1/2 top-[11%] -translate-x-1/2 w-[22%] h-[5%] rounded-[50%] bg-[#8c6a45]" />
          <div className="absolute left-[28%] top-[12%] w-[44%] h-[38%] bg-[#efe5d2]/95 [clip-path:polygon(16%_0,84%_0,100%_48%,78%_100%,22%_100%,0_48%)]" />
          <div className="absolute left-[31%] top-[58%] w-[38%] h-[2%] bg-[#D8B16D]" />
        </>
      )}

      {look === 'girl-bukhnaq' && (
        <>
          <div className={`${robeBase} bg-[#191919]/95 border-[#E6C280]`} />
          <div className="absolute left-1/2 top-[7%] -translate-x-1/2 w-[56%] h-[49%] rounded-t-[46%] bg-[#181818]/96 border-2 border-[#E6C280] [clip-path:polygon(50%_0,84%_12%,100%_50%,80%_100%,20%_100%,0_50%,16%_12%)]" />
        </>
      )}

      {look === 'girl-thobe' && (
        <>
          <div className={`${robeBase} bg-gradient-to-b from-[#8A1538] to-[#C45C7C] border-[#F1D18A]`} />
          <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[54%] h-[46%] rounded-t-[46%] bg-[#fff0e8]/95 border-2 border-[#F1D18A] [clip-path:polygon(50%_0,84%_12%,100%_50%,80%_100%,20%_100%,0_50%,16%_12%)]" />
        </>
      )}

      {look === 'girl-zari' && (
        <>
          <div className={`${robeBase} bg-gradient-to-b from-[#52304A] to-[#884F7C] border-[#EAC770]`} />
          <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[54%] h-[46%] rounded-t-[46%] bg-[#f4e5d2]/95 border-2 border-[#EAC770] [clip-path:polygon(50%_0,84%_12%,100%_50%,80%_100%,20%_100%,0_50%,16%_12%)]" />
          <div className="absolute left-[28%] top-[53%] w-[44%] h-[2px] bg-[#EAC770] shadow-[0_36px_0_#EAC770,0_72px_0_#EAC770,0_108px_0_#EAC770]" />
        </>
      )}

      {faceHole}
    </div>
  );
}

export function AkkasScene({
  gender,
  settings,
  studentName = '',
  onReturnToVillage,
  onComplete,
}: AkkasSceneProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedLook, setSelectedLook] = useState<LookId>(
    gender === 'boy' ? 'boy-thobe' : 'girl-bukhnaq',
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('maroon');
  const [selectedScene, setSelectedScene] = useState<SceneId>('souq');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [faceZoom, setFaceZoom] = useState(1.95);
  const [faceOffsetX, setFaceOffsetX] = useState(0);
  const [faceOffsetY, setFaceOffsetY] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completionReportedRef = useRef(false);

  const looks = useMemo(() => (gender === 'boy' ? BOY_LOOKS : GIRL_LOOKS), [gender]);
  const currentLook = looks.find((item) => item.id === selectedLook) ?? looks[0];
  const currentTheme = THEMES.find((item) => item.id === selectedTheme) ?? THEMES[0];
  const currentScene = SCENES.find((item) => item.id === selectedScene) ?? SCENES[0];
  const visitorLabel = gender === 'boy' ? 'المنتسب' : 'المنتسبة';
  const displayedName =
    studentName.trim() || (gender === 'boy' ? 'منتسب قطر لوّل' : 'منتسبة قطر لوّل');

  useEffect(() => {
    if (!looks.some((item) => item.id === selectedLook)) {
      setSelectedLook(looks[0].id);
    }
  }, [looks, selectedLook]);

  const speakArabic = (message: string) => {
    if (!settings.isSoundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const voice = synth
      .getVoices()
      .find((item) => item.lang === 'ar-QA' || item.lang === 'ar-SA' || item.lang.toLowerCase().startsWith('ar'));
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'ar-SA';
    utterance.rate = 0.9;
    utterance.volume = clamp(settings.volume ?? 0.6, 0.2, 1);
    synth.speak(utterance);
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
      setCameraError('الكاميرا غير متاحة في هذا المتصفح. يمكنك اختيار صورة من الجهاز.');
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
          ? 'ارفع الكاميرا حتى يظهر وجهك داخل الإطار البيضاوي، ثم اختر اللبس.'
          : 'ارفعي الكاميرا حتى يظهر وجهك داخل الإطار البيضاوي، ثم اختاري اللبس.',
      );
    } catch {
      setCameraError('تعذر فتح الكاميرا. اسمح بالوصول إليها أو استخدم اختيار صورة.');
    }
  };

  useEffect(() => {
    if (step !== 'camera') return;
    const timer = window.setTimeout(startCamera, 100);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    setUploadedImageUrl(URL.createObjectURL(file));
    stopCamera();
    setCameraError(null);
  };

  const resetFace = () => {
    // Head-first default: top-centred crop with enough zoom
    // to keep the current shirt/body outside the face window.
    setFaceZoom(1.95);
    setFaceOffsetX(0);
    setFaceOffsetY(0);
  };

  const adjustFace = (dx: number, dy: number) => {
    setFaceOffsetX((value) => clamp(value + dx, -24, 24));
    setFaceOffsetY((value) => clamp(value + dy, -24, 24));
  };

  const composePhoto = async () => {
    if (isComposing) return;
    setIsComposing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

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
        setCameraError('الصورة لم تجهز بعد. انتظر لحظة وحاول مرة أخرى.');
        return;
      }

      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT;
      const sceneImage = await loadCanvasImage(currentScene.imagePath);

      if (sceneImage) {
        drawBackgroundCover(
          ctx,
          sceneImage,
          PHOTO_WIDTH,
          PHOTO_HEIGHT,
        );

        // Darken the background slightly so the visitor/outfit remains clear.
        const sceneShade = ctx.createLinearGradient(
          0,
          0,
          0,
          PHOTO_HEIGHT,
        );

        sceneShade.addColorStop(
          0,
          'rgba(0,0,0,.06)',
        );

        sceneShade.addColorStop(
          0.55,
          'rgba(0,0,0,.12)',
        );

        sceneShade.addColorStop(
          1,
          'rgba(0,0,0,.28)',
        );

        ctx.fillStyle = sceneShade;
        ctx.fillRect(
          0,
          0,
          PHOTO_WIDTH,
          PHOTO_HEIGHT,
        );

        ctx.strokeStyle =
          currentTheme.accentColor;

        ctx.lineWidth = 8;

        ctx.strokeRect(
          28,
          28,
          PHOTO_WIDTH - 56,
          PHOTO_HEIGHT - 56,
        );

        ctx.strokeStyle =
          currentTheme.frameColor;

        ctx.lineWidth = 18;

        ctx.strokeRect(
          45,
          45,
          PHOTO_WIDTH - 90,
          PHOTO_HEIGHT - 90,
        );
      } else {
        // Fallback in case a station image has not been copied to /public/assets yet.
        drawStudioBackground(
          ctx,
          currentTheme,
        );
      }

      const faceW = 255;
      const faceH = 315;
      const faceCx = PHOTO_WIDTH / 2;
      const faceCy = 300;
      const faceX = faceCx - faceW / 2;
      const faceY = faceCy - faceH / 2;

      // Draw the outfit first. The face is drawn afterwards so
      // clothing/head-dress shapes can never cover the visitor's face.
      drawOutfitCanvas(ctx, currentLook.id, faceCx, faceCy, faceW, faceH);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(faceCx, faceCy, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
      ctx.clip();

      // The live camera is mirrored in preview, so mirror it in the final image too.
      if (!uploadedImageUrl && source === videoRef.current) {
        ctx.translate(faceX + faceW, faceY);
        ctx.scale(-1, 1);
        drawCoverCrop(
          ctx,
          source,
          sourceWidth,
          sourceHeight,
          0,
          0,
          faceW,
          faceH,
          faceZoom,
          faceOffsetX,
          faceOffsetY,
        );
      } else {
        drawCoverCrop(
          ctx,
          source,
          sourceWidth,
          sourceHeight,
          faceX,
          faceY,
          faceW,
          faceH,
          faceZoom,
          faceOffsetX,
          faceOffsetY,
        );
      }
      ctx.restore();

      // Clear visual edge around the real face.
      ctx.beginPath();
      ctx.ellipse(faceCx, faceCy, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = currentTheme.accentColor;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 42px Arial';
      ctx.fillText('استوديو قطر لوّل', PHOTO_WIDTH / 2, 88);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 29px Arial';
      ctx.fillText(displayedName, PHOTO_WIDTH / 2, 845);

      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 23px Arial';
      ctx.fillText(
        `${currentScene.title} • ${currentLook.title}`,
        PHOTO_WIDTH / 2,
        892,
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png', 0.95),
      );
      if (!blob) return;
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
      setCapturedUrl(URL.createObjectURL(blob));
      setStep('preview');
      speakArabic('تم تجهيز الصورة. يمكنك حفظها أو إعادة التصوير.');
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
    setStep('success');
  };

  const retakePhoto = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setStep('camera');
  };

  // Preview crop is anchored to the TOP of the source image.
  // This is the key fix for webcams where the old centered crop showed the shirt/chest.
  const faceObjectPosition = `${clamp(50 - faceOffsetX, 8, 92)}% ${clamp(
    3 - faceOffsetY,
    0,
    35,
  )}%`;

  const faceTransform = uploadedImageUrl
    ? `scale(${faceZoom})`
    : `scaleX(-1) scale(${faceZoom})`;

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#28150c] text-white select-none" dir="rtl">
      <img src={MASTER_IMAGE_PATH} alt="استوديو قطر لوّل" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <button
        onClick={onReturnToVillage}
        className="fixed top-[max(.65rem,env(safe-area-inset-top))] left-[max(.65rem,env(safe-area-inset-left))] z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-4 py-2 text-sm font-black shadow-xl"
      >
        العودة إلى القرية
      </button>

      <div className="fixed top-[max(.65rem,env(safe-area-inset-top))] right-[max(.65rem,env(safe-area-inset-right))] z-50 rounded-full bg-[#3c2415]/92 border border-[#E6C280] px-4 py-2 text-sm text-[#FFE082] font-black shadow-xl">
        استوديو قطر لوّل
      </div>

      {step === 'welcome' && (
        <div className="relative z-20 h-full flex items-center justify-center p-4">
          <div className="w-[min(94vw,650px)] rounded-[28px] border-2 border-[#FFE082] bg-[#27140c]/94 p-[clamp(18px,4vw,34px)] text-center shadow-2xl backdrop-blur-md">
            <Camera className="mx-auto w-16 h-16 text-[#FFE082]" />
            <h1 className="mt-4 text-[clamp(25px,4vw,40px)] font-black text-[#FFE082]">
              {gender === 'boy' ? 'جاهز لصورتك التراثية؟' : 'جاهزة لصورتك التراثية؟'}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
              اختر اللبس التراثي ثم اختر <strong>منظرًا من محطات قطر لوّل</strong> مثل السوق أو البحر أو المجلس أو بيت الحرف لتخرج الصورة مرتبطة بالنشاط.
            </p>
            <div className="mt-4 rounded-2xl border border-emerald-300/35 bg-emerald-950/40 p-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              المعالجة محلية على الجهاز ولا يتم رفع الصورة للإنترنت.
            </div>
            <button onClick={() => setStep('camera')} className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 text-lg font-black">
              ابدأ التصوير
            </button>
          </div>
        </div>
      )}

      {step === 'camera' && (
        <div className="relative z-20 h-full pt-[66px] pb-3 px-2 sm:px-4 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-3 sm:gap-4">
            <section className="rounded-[24px] border-2 border-[#FFE082] bg-[#1c100a]/94 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#FFE082]">صورة {visitorLabel}</h2>
                  <p className="text-xs text-white/65">{displayedName}</p>
                </div>
                <span className="rounded-full bg-emerald-950/60 border border-emerald-300/35 px-3 py-1.5 text-xs text-emerald-200">محلي وآمن</span>
              </div>

              <div className="relative mx-auto w-full max-w-[820px] aspect-[5/4] max-h-[61dvh] overflow-hidden rounded-[24px] border-[3px] bg-[#8a5d39]" style={{ borderColor: currentTheme.accentColor }}>
                <img
                  src={currentScene.imagePath}
                  alt={currentScene.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.src = MASTER_IMAGE_PATH;
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/35" />

                {/* Outfit sits BEHIND the real face. */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <OutfitPreview look={currentLook.id} />
                </div>

                {/* REAL FACE WINDOW
                    Important: this is rendered AFTER the outfit and with a higher z-index.
                    The crop is top-anchored so the head appears instead of the shirt/chest. */}
                <div className="absolute z-20 left-1/2 top-[9%] -translate-x-1/2 w-[27%] min-w-[145px] max-w-[245px] h-[35%] min-h-[160px] max-h-[245px] rounded-[46%] overflow-hidden bg-[#111] border-[3px] border-[#FFE082] shadow-[0_8px_24px_rgba(0,0,0,.55)]">
                  {!uploadedImageUrl ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: faceObjectPosition,
                        transform: faceTransform,
                        transformOrigin: '50% 0%',
                      }}
                    />
                  ) : (
                    <img
                      ref={uploadedImageRef}
                      src={uploadedImageUrl}
                      alt="الصورة المختارة"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: faceObjectPosition,
                        transform: faceTransform,
                        transformOrigin: '50% 0%',
                      }}
                    />
                  )}

                  {/* Face centre guide only; never blocks the face. */}
                  <div className="absolute inset-[8%] rounded-[46%] border border-dashed border-white/35 pointer-events-none" />
                </div>

                <div className="absolute z-30 top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 border border-white/15 px-4 py-2 text-xs sm:text-sm font-black whitespace-nowrap">
                  {currentScene.title} • {currentLook.title}
                </div>

                <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] rounded-full bg-black/70 border border-[#FFE082]/30 px-4 py-2 text-[11px] sm:text-xs text-center">
                  {isCameraReady || uploadedImageUrl
                    ? `الوجه داخل الإطار • الخلفية: ${currentScene.title}`
                    : 'جاري فتح الكاميرا…'}
                </div>
              </div>

              {cameraError && <div className="mt-2 rounded-xl border border-amber-300/40 bg-amber-950/55 p-3 text-xs sm:text-sm text-amber-100">{cameraError}</div>}

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E6C280] bg-[#3b2517] py-3 text-sm font-black text-[#FFE082] cursor-pointer">
                  <ImagePlus className="w-5 h-5" />
                  اختيار صورة
                  <input type="file" accept="image/*" capture="user" onChange={handleUpload} className="hidden" />
                </label>
                <button
                  onClick={composePhoto}
                  disabled={isComposing || (!isCameraReady && !uploadedImageUrl)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3 text-sm font-black disabled:opacity-40"
                >
                  <Camera className="w-5 h-5" />
                  {isComposing ? 'جاري التجهيز…' : 'التقط الصورة'}
                </button>
              </div>
            </section>

            <aside className="rounded-[24px] border-2 border-[#E6C280] bg-[#2a170e]/95 p-3 shadow-2xl backdrop-blur-md lg:max-h-[calc(100dvh-82px)] lg:overflow-y-auto">
              <h3 className="text-lg font-black text-[#FFE082]">{gender === 'boy' ? 'لبس المنتسب' : 'لبس المنتسبة'}</h3>
              <p className="mt-1 text-xs text-white/60">يتغير اللبس فورًا في المعاينة.</p>

              <div className="mt-3 grid grid-cols-3 lg:grid-cols-1 gap-2">
                {looks.map((look) => {
                  const selected = selectedLook === look.id;
                  return (
                    <button
                      key={look.id}
                      onClick={() => setSelectedLook(look.id)}
                      className={`rounded-2xl border-2 p-3 text-center lg:text-right ${selected ? 'bg-[#8A1538] border-[#FFE082]' : 'bg-black/20 border-white/15'}`}
                    >
                      <div className="flex items-center justify-center lg:justify-between gap-2 text-sm font-black">
                        <span>{look.title}</span>
                        {selected && <Sparkles className="w-4 h-4 text-[#FFE082]" />}
                      </div>
                      <div className="hidden sm:block mt-1 text-[11px] text-white/65">{look.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-base font-black text-[#FFE082]">
                  منظر التصوير
                </h3>

                <p className="mt-1 text-[11px] text-white/60">
                  اختر منظرًا من محطات قطر لوّل ليظهر خلف المنتسب أو المنتسبة في الصورة.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {SCENES.map((scene) => {
                    const selected =
                      selectedScene === scene.id;

                    return (
                      <button
                        key={scene.id}
                        onClick={() =>
                          setSelectedScene(scene.id)
                        }
                        className={`relative overflow-hidden rounded-2xl border-2 min-h-[90px] text-right transition-all ${
                          selected
                            ? 'border-[#FFE082] ring-2 ring-[#8A1538] bg-white/10'
                            : 'border-white/15 bg-black/20'
                        }`}
                      >
                        <img
                          src={scene.imagePath}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-55"
                          draggable={false}
                          onError={(event) => {
                            event.currentTarget.src =
                              MASTER_IMAGE_PATH;
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

                        <div className="relative z-10 h-full p-2.5 flex flex-col justify-end">
                          <div className="text-xs sm:text-sm font-black text-[#FFE082]">
                            {scene.title}
                          </div>

                          <div className="mt-0.5 text-[9px] sm:text-[10px] text-white/80 leading-tight">
                            {scene.subtitle}
                          </div>

                          {selected && (
                            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#8A1538] border border-[#FFE082] flex items-center justify-center text-[#FFE082]">
                              ✓
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-base font-black text-[#FFE082]">ضبط الوجه</h3>
                <p className="mt-1 text-[11px] text-white/60">الافتراضي يلتقط أعلى الصورة لإظهار الرأس. استخدم الأسهم لضبط الوجه بدقة.</p>

                <div className="mt-3 grid grid-cols-3 gap-2 w-[180px] mx-auto">
                  <div />
                  <button onClick={() => adjustFace(0, 4)} className="h-11 rounded-xl bg-black/25 border border-white/15 font-black">↑</button>
                  <div />
                  <button onClick={() => adjustFace(4, 0)} className="h-11 rounded-xl bg-black/25 border border-white/15 font-black">←</button>
                  <button onClick={resetFace} className="h-11 rounded-xl bg-[#8A1538] border border-[#FFE082] text-xs font-black">وسط</button>
                  <button onClick={() => adjustFace(-4, 0)} className="h-11 rounded-xl bg-black/25 border border-white/15 font-black">→</button>
                  <div />
                  <button onClick={() => adjustFace(0, -4)} className="h-11 rounded-xl bg-black/25 border border-white/15 font-black">↓</button>
                  <div />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setFaceZoom((value) => clamp(value - 0.1, 1.25, 2.8))} className="flex items-center justify-center gap-1 rounded-xl bg-black/25 border border-white/15 py-2 text-xs font-bold">
                    <Minus className="w-4 h-4" /> تصغير الوجه
                  </button>
                  <button onClick={() => setFaceZoom((value) => clamp(value + 0.1, 1.25, 2.8))} className="flex items-center justify-center gap-1 rounded-xl bg-black/25 border border-white/15 py-2 text-xs font-bold">
                    <Plus className="w-4 h-4" /> تكبير الوجه
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-base font-black text-[#FFE082]">لون إطار الصورة</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`rounded-2xl border-2 p-3 text-center ${selectedTheme === theme.id ? 'border-[#FFE082] bg-white/10' : 'border-white/15 bg-black/15'}`}
                    >
                      <div className="mx-auto w-8 h-8 rounded-full border-2" style={{ backgroundColor: theme.frameColor, borderColor: theme.accentColor }} />
                      <div className="mt-1 text-xs font-black">{theme.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {step === 'preview' && capturedUrl && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="w-[min(96vw,820px)] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[28px] border-2 border-[#FFE082] bg-[#24140d] p-3 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#FFE082]">الصورة جاهزة</h2>
              <button onClick={retakePhoto} className="w-10 h-10 rounded-full bg-black/25 border border-white/20 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <img src={capturedUrl} alt="الصورة التذكارية" className="w-full max-h-[67dvh] object-contain rounded-2xl bg-black" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={retakePhoto} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E6C280] bg-[#3c271a] py-3 text-sm font-black text-[#FFE082]"><RotateCcw className="w-5 h-5" /> إعادة التصوير</button>
              <button onClick={downloadPhoto} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#FFE082] bg-[#8A1538] py-3 text-sm font-black"><Download className="w-5 h-5" /> حفظ الصورة</button>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[30px] border-2 border-[#FFE082] bg-[#2b170f]/97 p-6 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto w-16 h-16 text-emerald-300" />
            <h2 className="mt-3 text-3xl font-black text-[#FFE082]">تمت المهمة!</h2>
            <p className="mt-2 text-base text-white/90">تم حفظ الصورة وحصل {visitorLabel} على ختم استوديو قطر لوّل.</p>
            <button onClick={onReturnToVillage} className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 font-black text-[#FFE082]">العودة إلى القرية</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
