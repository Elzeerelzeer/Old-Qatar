import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterGender, Direction, AppSettings } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';
import { ArrowRight, Volume2, X, Sparkles } from 'lucide-react';

interface SouqSceneProps {
  gender: CharacterGender;
  settings: AppSettings;
  onReturnToVillage: () => void;
}

interface InteractiveItem {
  id: string;
  name: string;
  shopName: string;
  shortFact: string;
  icon: string;
  color: string;
  worldX: number; // percentage 0 - 100
  worldY: number; // percentage 0 - 100
  radius: number; // detection distance in %
  isFalconer?: boolean;
}

// ---------------------------------------------------------------------------
// INTERACTIVE ITEMS IN SOUQ LOWWAL (عناصر الاكتشاف في الأركان الخمسة)
// ---------------------------------------------------------------------------
const SOUQ_ITEMS: InteractiveItem[] = [
  // 1. دكان الفخار (North-West)
  {
    id: 'fakhkhaar',
    name: 'الفخار التراثي',
    shopName: 'دكان الفخار',
    shortFact: 'أوانٍ فخارية استخدمها الأجداد لحفظ المياه وتبريدها والطهي التراثي.',
    icon: '🏺',
    color: '#D97706',
    worldX: 20,
    worldY: 28,
    radius: 7,
  },
  {
    id: 'dallah',
    name: 'الدلة القطرية',
    shopName: 'دكان الفخار والدلال',
    shortFact: 'تُستخدم لتقديم القهوة العربية الأصيلة وهي رمز الكرم والضيافة.',
    icon: '🫖',
    color: '#CA8A04',
    worldX: 29,
    worldY: 25,
    radius: 7,
  },

  // 2. دكان العطّار (North-East)
  {
    id: 'hail',
    name: 'الهيل الفاخر',
    shopName: 'دكان العطّار',
    shortFact: 'من أشهر التوابل العطرية المستخدمة لتطييب القهوة العربية الأصيلة.',
    icon: '🌿',
    color: '#16A34A',
    worldX: 72,
    worldY: 26,
    radius: 7,
  },
  {
    id: 'zafaran',
    name: 'الزعفران الملكي',
    shopName: 'دكان العطّار',
    shortFact: 'من أثمن التوابل التراثية الممنوحة لنكهة ولون القهوة والأطعمة القطرية.',
    icon: '✨',
    color: '#DC2626',
    worldX: 81,
    worldY: 30,
    radius: 7,
  },

  // 3. دكان الأقمشة والسلال (South-West)
  {
    id: 'sadu',
    name: 'نسيج السدو',
    shopName: 'دكان الأقمشة والسلال',
    shortFact: 'نسيج تراثي أصيل بنقوش هندسية دقيقة وألوان زاهية من وبر الإبل وصوف الغنم.',
    icon: '🧶',
    color: '#8A1538',
    worldX: 22,
    worldY: 66,
    radius: 7,
  },
  {
    id: 'khoos',
    name: 'سلال الخوص',
    shopName: 'دكان الأقمشة والسلال',
    shortFact: 'صناعة يدوية دقيقة من سعف النخيل لحفظ التمر والرطب وتقديم الخبز.',
    icon: '🧺',
    color: '#B45309',
    worldX: 30,
    worldY: 71,
    radius: 7,
  },

  // 4. دكان الأدوات القديمة (Mid-East)
  {
    id: 'mizan',
    name: 'الميزان القديم',
    shopName: 'دكان الأدوات القديمة',
    shortFact: 'كان يُستخدم لوزن السلع والبضائع والمؤن بدقة وعدل في الأسواق الشعبية.',
    icon: '⚖️',
    color: '#EAB308',
    worldX: 78,
    worldY: 62,
    radius: 7,
  },
  {
    id: 'mandoos',
    name: 'المندوس التراثي',
    shopName: 'دكان الأدوات القديمة',
    shortFact: 'صندوق خشبي مزخرف بالمسامير النحاسية لحفظ الملابس والحلي والمقتنيات الثمينة.',
    icon: '📦',
    color: '#78350F',
    worldX: 70,
    worldY: 68,
    radius: 7,
  },

  // 5. ركن الصقّار (Center-North Terraced Plaza)
  {
    id: 'saqqar_world',
    name: 'عالم الصقّار والمجثم',
    shopName: 'ركن الصقّار',
    shortFact: 'رمز العزة والأصالة في تراث الصيد والمقناص القطري المتوارث عبر الأجيال.',
    icon: '🦅',
    color: '#8A1538',
    worldX: 50,
    worldY: 20,
    radius: 9,
    isFalconer: true,
  },
];

// ---------------------------------------------------------------------------
// INVISIBLE COLLISION RECTANGLES (% coordinates)
// Solid blocks: buildings, counters, crates, walls, displays
// ---------------------------------------------------------------------------
interface MapRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SOUQ_OBSTACLES: MapRect[] = [
  // Outer north boundary wall / backdrop
  { x1: 0, y1: 0, x2: 100, y2: 12 },
  // Outer south boundary wall / entrance fence (leaving entry opening x: 42 to 58)
  { x1: 0, y1: 88, x2: 40, y2: 100 },
  { x1: 60, y1: 88, x2: 100, y2: 100 },
  // Outer west and east boundary walls
  { x1: 0, y1: 0, x2: 10, y2: 100 },
  { x1: 90, y1: 0, x2: 100, y2: 100 },

  // Shop 1: Pottery Shop counter & displays (West North)
  { x1: 10, y1: 14, x2: 32, y2: 24 },
  { x1: 10, y1: 24, x2: 18, y2: 44 },

  // Shop 2: Apothecary / Herbalist counter & sacks (East North)
  { x1: 68, y1: 14, x2: 90, y2: 24 },
  { x1: 82, y1: 24, x2: 90, y2: 44 },

  // Shop 3: Textiles & Baskets counter & chests (West South)
  { x1: 10, y1: 52, x2: 18, y2: 86 },
  { x1: 18, y1: 76, x2: 34, y2: 86 },

  // Shop 4: Antique Trade Tools counter (East South)
  { x1: 82, y1: 52, x2: 90, y2: 86 },
  { x1: 66, y1: 76, x2: 82, y2: 86 },

  // Shop 5: Falconer elevated dais base (Center North)
  { x1: 44, y1: 12, x2: 56, y2: 18 },
];

export const SouqScene: React.FC<SouqSceneProps> = ({
  gender,
  settings,
  onReturnToVillage,
}) => {
  // Player Position in percentage (0 to 100) inside Souq world
  // Spawns near entrance courtyard of the souq (50, 83) facing up into the bustling avenue
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 83 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<InteractiveItem | null>(null);
  const [discoveredItems, setDiscoveredItems] = useState<Set<string>>(new Set());
  const [nearbyItem, setNearbyItem] = useState<InteractiveItem | null>(null);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Smooth Camera Follow Offset
  const [camera, setCamera] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const posRef = useRef(pos);
  posRef.current = pos;

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirection = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const lastFootstepRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if speech synthesis is speaking
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Invisible Collision Checker with soft margin
  const checkCollision = useCallback((nextX: number, nextY: number): boolean => {
    // Bounds check
    if (nextX < 11 || nextX > 89) return true;
    if (nextY < 13 || nextY > 87) return true;

    const r = 1.6; // collision radius
    for (const box of SOUQ_OBSTACLES) {
      if (
        nextX + r > box.x1 &&
        nextX - r < box.x2 &&
        nextY + r > box.y1 &&
        nextY - r < box.y2
      ) {
        return true;
      }
    }
    return false;
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)
      ) {
        // Prevent page scrolling
        e.preventDefault();
        keysPressed.current[key] = true;
        setShowTouchControls(false); // hide touch on physical keyboard
      }

      // Enter or Space when near an item triggers discovery
      if ((key === 'enter' || key === ' ') && nearbyItem && !activeItem) {
        handleOpenItem(nearbyItem);
      }

      // Escape closes item dialog
      if (key === 'escape' && activeItem) {
        setActiveItem(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current[key]) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyItem, activeItem]);

  // Main Movement and Camera Loop
  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      // Don't move while inspecting an item
      if (activeItem) {
        setIsMoving(false);
        animationFrameId.current = requestAnimationFrame(loop);
        return;
      }

      let dx = 0;
      let dy = 0;

      // Keyboard input
      const kp = keysPressed.current;
      if (kp['arrowup'] || kp['w']) dy -= 1;
      if (kp['arrowdown'] || kp['s']) dy += 1;
      if (kp['arrowleft'] || kp['a']) dx -= 1;
      if (kp['arrowright'] || kp['d']) dx += 1;

      // Touch input
      if (touchDirection.current.x !== 0 || touchDirection.current.y !== 0) {
        dx += touchDirection.current.x;
        dy += touchDirection.current.y;
      }

      const moving = dx !== 0 || dy !== 0;
      setIsMoving(moving);

      if (moving) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        // Accessible, calm movement speed (standard calm pace 18 %/s)
        const speed = settings.walkSpeed === 'calm' ? 14 : 18;
        const moveX = dx * speed * dt;
        const moveY = dy * speed * dt;

        const curX = posRef.current.x;
        const curY = posRef.current.y;

        // Smooth wall sliding against obstacles
        let nextX = curX;
        if (!checkCollision(curX + moveX, curY)) {
          nextX = curX + moveX;
        }

        let nextY = curY;
        if (!checkCollision(nextX, curY + moveY)) {
          nextY = curY + moveY;
        } else if (!checkCollision(curX, curY + moveY)) {
          nextY = curY + moveY;
        }

        posRef.current = { x: nextX, y: nextY };
        setPos({ x: nextX, y: nextY });

        // Update facing direction
        if (Math.abs(dy) > Math.abs(dx)) {
          setDirection(dy > 0 ? 'down' : 'up');
        } else {
          setDirection(dx > 0 ? 'right' : 'left');
        }

        // Rhythmic footsteps
        if (settings.isSoundEnabled && time - lastFootstepRef.current > 380) {
          soundManager.playFootstep();
          lastFootstepRef.current = time;
        }
      }

      // Check proximity to items
      let foundNearby: InteractiveItem | null = null;
      for (const item of SOUQ_ITEMS) {
        const dist = Math.hypot(posRef.current.x - item.worldX, posRef.current.y - item.worldY);
        if (dist <= item.radius) {
          foundNearby = item;
          break;
        }
      }
      setNearbyItem(foundNearby);

      // Smooth Camera Follow: smooth lerp keeping the player centered
      if (containerRef.current) {
        const viewportW = containerRef.current.clientWidth;
        const viewportH = containerRef.current.clientHeight;

        // World dimensions in virtual pixels (1400 x 950)
        const worldW = 1400;
        const worldH = 950;

        const playerPixelX = (posRef.current.x / 100) * worldW;
        const playerPixelY = (posRef.current.y / 100) * worldH;

        // Ideal camera targets player in viewport center
        let targetCamX = viewportW / 2 - playerPixelX;
        let targetCamY = viewportH / 2 - playerPixelY;

        // Clamp camera to world edges
        targetCamX = Math.min(0, Math.max(viewportW - worldW, targetCamX));
        targetCamY = Math.min(0, Math.max(viewportH - worldH, targetCamY));

        setCamera((prev) => ({
          x: prev.x + (targetCamX - prev.x) * 0.12,
          y: prev.y + (targetCamY - prev.y) * 0.12,
        }));
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [checkCollision, settings.walkSpeed, settings.isSoundEnabled, activeItem]);

  // Open Discovery Item
  const handleOpenItem = (item: InteractiveItem) => {
    soundManager.playProximityChime();
    setActiveItem(item);
    setDiscoveredItems((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
  };

  // Arabic Audio Speech Synthesizer for Accessibility
  const handleSpeakItem = (item: InteractiveItem) => {
    if (typeof window === 'undefined') return;

    soundManager.playClick();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utteranceText = `${item.name}. ${item.shortFact}`;
      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.lang = 'ar-QA';
      utterance.rate = 0.85; // deliberate, calm pace for accessibility
      utterance.pitch = 1.0;

      // Select Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      soundManager.playSuccess();
    }
  };

  // Touch Controller Events
  const handleTouchDir = (x: number, y: number) => {
    touchDirection.current = { x, y };
  };

  return (
    <div
      id="souq-adventure-scene"
      className="relative w-full h-screen overflow-hidden bg-[#100703] select-none touch-none"
      ref={containerRef}
    >
      {/* ------------------------------------------------------------------ */}
      {/* TOP COMPACT MINIMAL HUD (شريط علوي صغير لا يغطي الخريطة) */}
      {/* ------------------------------------------------------------------ */}
      <header className="absolute top-3 inset-x-3 z-40 flex items-center justify-between pointer-events-none">
        {/* Return Button to Village (أعلى الشاشة - صغير وشبه شفاف) */}
        <button
          id="souq-return-btn"
          onClick={() => {
            soundManager.playDoorOpen();
            onReturnToVillage();
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#8A1538]/90 hover:bg-[#8A1538] border border-[#E6C280]/70 text-[#FFF4D4] font-black text-xs sm:text-sm shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          <span>العودة إلى القرية</span>
        </button>

        {/* Small Title & Progress Indicator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Market Progress Indicator («رحلة السوق 0/2») */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c0f08]/85 border border-[#E6C280]/50 text-[#FFE082] text-xs font-bold shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
            <span>رحلة السوق 0/2</span>
          </div>

          {/* Station Title */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-[#2a160d]/80 border border-[#E6C280]/30 text-[#FFF4D4] text-xs font-bold backdrop-blur-md">
            <span>سوق لوّل • الاستكشاف التراثي</span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* SOUQ GAME WORLD (عالم سوق لوّل التراثي 2.5D مع كاميرا متحركة) */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          width: '1400px',
          height: '950px',
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0)`,
        }}
      >
        {/* Warm Golden Hour Ambient Light Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, #F59E0B20 0%, #D9770615 45%, #78350F25 80%, #170A04 100%)',
          }}
        />

        {/* Traditional Sand & Cobblestone Souq Ground Floor */}
        <div className="absolute inset-0 bg-[#D4B483] overflow-hidden">
          {/* Textured mud & coral stone pavement pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(#b8935c 1px, transparent 1px), radial-gradient(#a37c46 1.5px, #D4B483 1.5px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          {/* Central Walking Avenue Paving / Path Flagstones */}
          <div
            className="absolute left-[38%] right-[38%] top-[14%] bottom-[12%] rounded-3xl opacity-35"
            style={{
              background:
                'repeating-linear-gradient(45deg, #c7a16e, #c7a16e 16px, #bfa06b 16px, #bfa06b 32px)',
              boxShadow: 'inset 0 0 35px rgba(0,0,0,0.15)',
            }}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* ARCHITECTURAL SURROUNDINGS (جدران الطين، الأبواب، المظلات، الفوانيس) */}
        {/* ---------------------------------------------------------------- */}
        {/* North Fortress Wall & Wooden Gate Frame */}
        <div className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b from-[#5c2b14] to-[#874421] border-b-4 border-[#3b1708] shadow-2xl flex items-center justify-center">
          {/* Wall Battlements / Crenellations */}
          <div className="absolute top-0 inset-x-0 h-5 flex justify-around">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-8 h-5 bg-[#4a2210] border-b border-[#3b1708]" />
            ))}
          </div>
          {/* Heritage Archway above Falconer terrace */}
          <div className="w-48 h-20 mt-4 rounded-t-full border-4 border-[#3b1708] bg-[#291107]/70 shadow-inner flex items-center justify-center">
            <span className="text-[#E6C280] font-black text-sm tracking-widest">
              سوق لوّل التراثي
            </span>
          </div>
        </div>

        {/* West Side Mudbrick Shop Facades (Left Side of Avenue) */}
        <div className="absolute left-0 top-[120px] bottom-[100px] w-[140px] bg-[#96582f] border-r-4 border-[#421d09] shadow-2xl">
          {/* Protruding Wooden Beams (Danchal - دنكل) */}
          <div className="absolute top-4 right-[-14px] flex flex-col gap-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-4 bg-[#3d1908] rounded-r shadow-md border border-[#260f04]"
              />
            ))}
          </div>
        </div>

        {/* East Side Mudbrick Shop Facades (Right Side of Avenue) */}
        <div className="absolute right-0 top-[120px] bottom-[100px] w-[140px] bg-[#96582f] border-l-4 border-[#421d09] shadow-2xl">
          {/* Protruding Wooden Beams (Danchal) */}
          <div className="absolute top-4 left-[-14px] flex flex-col gap-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-4 bg-[#3d1908] rounded-l shadow-md border border-[#260f04]"
              />
            ))}
          </div>
        </div>

        {/* South Wall & Entrance Gateway */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-[#6e371a] border-t-4 border-[#3b1708] shadow-2xl flex items-center justify-center">
          {/* Traditional Entrance Opening */}
          <div className="w-64 h-full bg-[#8c4b26] border-x-4 border-[#3b1708] shadow-inner flex items-center justify-center">
            <span className="text-[#FFF4D4] font-black text-xs opacity-75">
              ← المدخل المؤدي للقرية
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SOUQ STALLS & SHOPS (الأركان الخمسة التراثية) */}
        {/* ---------------------------------------------------------------- */}

        {/* ============================================================== */}
        {/* 1. دكان الفخار (Top-Left) */}
        {/* ============================================================== */}
        <div className="absolute left-[13%] top-[14%] w-[22%] h-[28%] pointer-events-none">
          {/* Maroon & White Striped Fabric Canopy (مظلة قماشية عنابية وبيضاء) */}
          <div
            className="w-full h-12 rounded-b-xl shadow-lg border-b-2 border-[#540c1e] flex overflow-hidden"
            style={{
              background:
                'repeating-linear-gradient(90deg, #8A1538, #8A1538 20px, #FFF4D4 20px, #FFF4D4 40px)',
            }}
          />

          {/* Mudbrick Display Bench & Shop Sign */}
          <div className="mt-1 px-3 py-1.5 bg-[#844b2a] rounded-lg border border-[#4d2410] shadow-md flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🏺</span>
              <span className="text-xs font-black text-[#FFF4D4]">دكان الفخار</span>
            </div>
            {/* Hanging Brass Lantern */}
            <div className="w-3 h-5 bg-[#E6C280] rounded shadow-[0_0_12px_#F59E0B] animate-pulse" />
          </div>

          {/* Display Counter with Clay Pots & Dallahs */}
          <div className="mt-2 w-full h-[120px] bg-[#a86a42] rounded-xl border-2 border-[#572d14] p-3 shadow-inner flex flex-wrap items-center justify-around gap-2">
            {/* Pottery item 1: Jars */}
            <div className="relative flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">🏺</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">جرار الماء</span>
            </div>
            {/* Pottery item 2: Traditional Dallah */}
            <div className="relative flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">🫖</span>
              <span className="text-[10px] font-bold text-[#FFE082] mt-0.5">الدلة</span>
            </div>
            {/* Pottery item 3: Bowls */}
            <div className="relative flex flex-col items-center">
              <span className="text-2xl drop-shadow-md">🥣</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">أوانٍ</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. دكان العطّار والتوابل (Top-Right) */}
        {/* ============================================================== */}
        <div className="absolute right-[13%] top-[14%] w-[22%] h-[28%] pointer-events-none">
          {/* Maroon & White Striped Fabric Canopy */}
          <div
            className="w-full h-12 rounded-b-xl shadow-lg border-b-2 border-[#540c1e] flex overflow-hidden"
            style={{
              background:
                'repeating-linear-gradient(90deg, #FFF4D4, #FFF4D4 20px, #8A1538 20px, #8A1538 40px)',
            }}
          />

          {/* Shop Sign */}
          <div className="mt-1 px-3 py-1.5 bg-[#844b2a] rounded-lg border border-[#4d2410] shadow-md flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🌿</span>
              <span className="text-xs font-black text-[#FFF4D4]">دكان العطّار</span>
            </div>
            <div className="w-3 h-5 bg-[#E6C280] rounded shadow-[0_0_12px_#F59E0B] animate-pulse" />
          </div>

          {/* Spice Sacks & Jars Bench */}
          <div className="mt-2 w-full h-[120px] bg-[#a86a42] rounded-xl border-2 border-[#572d14] p-3 shadow-inner flex flex-wrap items-center justify-around gap-2">
            {/* Cardamom (الهيل) */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#15803d] border-2 border-[#86efac] flex items-center justify-center shadow-md">
                <span className="text-lg">🌿</span>
              </div>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">الهيل</span>
            </div>
            {/* Saffron (الزعفران) */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#b91c1c] border-2 border-[#fca5a5] flex items-center justify-center shadow-md">
                <span className="text-lg">✨</span>
              </div>
              <span className="text-[10px] font-bold text-[#FFE082] mt-0.5">الزعفران</span>
            </div>
            {/* Cinnamon & Cloves (القرفة والقرنفل) */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#78350f] border-2 border-[#fde68a] flex items-center justify-center shadow-md">
                <span className="text-lg">🪵</span>
              </div>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">القرفة</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. دكان الأقمشة والسلال والخوص (Bottom-Left) */}
        {/* ============================================================== */}
        <div className="absolute left-[13%] top-[54%] w-[22%] h-[28%] pointer-events-none">
          {/* Sadu patterned fabric awning */}
          <div
            className="w-full h-12 rounded-b-xl shadow-lg border-b-2 border-[#4d130c] flex overflow-hidden"
            style={{
              background:
                'repeating-linear-gradient(45deg, #8A1538, #8A1538 12px, #2a110a 12px, #2a110a 24px, #E6C280 24px, #E6C280 28px)',
            }}
          />

          {/* Shop Sign */}
          <div className="mt-1 px-3 py-1.5 bg-[#844b2a] rounded-lg border border-[#4d2410] shadow-md flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🧺</span>
              <span className="text-xs font-black text-[#FFF4D4]">الأقمشة والسلال</span>
            </div>
            <div className="w-3 h-5 bg-[#E6C280] rounded shadow-[0_0_12px_#F59E0B] animate-pulse" />
          </div>

          {/* Display Bench: Sadu fabrics & Khos Baskets */}
          <div className="mt-2 w-full h-[120px] bg-[#a86a42] rounded-xl border-2 border-[#572d14] p-3 shadow-inner flex flex-wrap items-center justify-around gap-2">
            {/* Sadu Textiles */}
            <div className="flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">🧶</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">السدو</span>
            </div>
            {/* Palm Basket (سلال الخوص) */}
            <div className="flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">🧺</span>
              <span className="text-[10px] font-bold text-[#FFE082] mt-0.5">الخوص</span>
            </div>
            {/* Heritage Fabrics */}
            <div className="flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">🧣</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">منسوجات</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. دكان الأدوات القديمة والتجارة (Bottom-Right) */}
        {/* ============================================================== */}
        <div className="absolute right-[13%] top-[54%] w-[22%] h-[28%] pointer-events-none">
          {/* Maroon & White Striped Fabric Canopy */}
          <div
            className="w-full h-12 rounded-b-xl shadow-lg border-b-2 border-[#540c1e] flex overflow-hidden"
            style={{
              background:
                'repeating-linear-gradient(90deg, #8A1538, #8A1538 20px, #FFF4D4 20px, #FFF4D4 40px)',
            }}
          />

          {/* Shop Sign */}
          <div className="mt-1 px-3 py-1.5 bg-[#844b2a] rounded-lg border border-[#4d2410] shadow-md flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">⚖️</span>
              <span className="text-xs font-black text-[#FFF4D4]">الأدوات القديمة</span>
            </div>
            <div className="w-3 h-5 bg-[#E6C280] rounded shadow-[0_0_12px_#F59E0B] animate-pulse" />
          </div>

          {/* Display Bench: Antique Scale & Trade Chest */}
          <div className="mt-2 w-full h-[120px] bg-[#a86a42] rounded-xl border-2 border-[#572d14] p-3 shadow-inner flex flex-wrap items-center justify-around gap-2">
            {/* Antique Balance Scale */}
            <div className="flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">⚖️</span>
              <span className="text-[10px] font-bold text-[#FFE082] mt-0.5">الميزان</span>
            </div>
            {/* Mandoos (صندوق المندوس) */}
            <div className="flex flex-col items-center">
              <span className="text-3xl drop-shadow-md">📦</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">المندوس</span>
            </div>
            {/* Measurement weights */}
            <div className="flex flex-col items-center">
              <span className="text-2xl drop-shadow-md">🪙</span>
              <span className="text-[10px] font-bold text-[#FFF4D4] mt-0.5">أوزان كيل</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. ركن الصقّار (Center-North Grand Carpeted Terrace) */}
        {/* «اجعل ركن الصقّار من أجمل أجزاء السوق» */}
        {/* ============================================================== */}
        <div className="absolute left-[37%] right-[37%] top-[11%] h-[180px] pointer-events-none">
          {/* Elevated Heritage Terrace with Red Qatari Sadu Rug */}
          <div
            className="w-full h-full rounded-3xl p-3 border-4 border-[#8A1538] shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between relative overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse at center, #991b1b 0%, #7f1d1d 60%, #450a0a 100%)',
            }}
          >
            {/* Rug Fringe / Border Motif */}
            <div className="absolute inset-x-2 top-1 h-2 border-b-2 border-dashed border-[#E6C280]/60" />
            <div className="absolute inset-x-2 bottom-1 h-2 border-t-2 border-dashed border-[#E6C280]/60" />

            {/* Title Banner */}
            <div className="px-4 py-1 rounded-full bg-[#450a0a]/90 border border-[#E6C280] shadow-md flex items-center gap-1.5 z-10">
              <span className="text-base">🦅</span>
              <span className="text-xs font-black text-[#FFF4D4] tracking-wide">
                ركن الصقّار التراثي
              </span>
            </div>

            {/* Central Perch & Qatari Falconer Vignette */}
            <div className="relative flex items-center justify-center gap-6 my-auto z-10">
              {/* Qatari Falconer Figure */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-14 bg-[#FAF5EA] rounded-t-full border-2 border-[#E6C280] shadow-md flex items-center justify-center relative">
                  {/* Ghutra & Egal */}
                  <div className="absolute top-1 w-9 h-2 bg-[#1a0e08] rounded-full" />
                  <span className="text-xl mt-2">🧔🏻‍♂️</span>
                </div>
                <span className="text-[10px] font-black text-[#FFF4D4] mt-1 bg-[#450a0a]/80 px-2 py-0.5 rounded-full border border-[#E6C280]/40">
                  الصقّار القطري
                </span>
              </div>

              {/* Majestic Falcon Perched on Traditional Carved Wakr */}
              <div className="flex flex-col items-center relative">
                {/* Traditional Wooden Wakr / Perch */}
                <div className="relative flex flex-col items-center">
                  {/* Falcon perched */}
                  <div className="text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] animate-pulse">
                    🦅
                  </div>
                  {/* Carved Perch Top */}
                  <div className="w-12 h-3 bg-[#422006] rounded-full border border-[#ca8a04] shadow-md" />
                  {/* Perch Brass Stand */}
                  <div className="w-2.5 h-7 bg-[#ca8a04] shadow-sm" />
                  {/* Base Plate */}
                  <div className="w-10 h-2 bg-[#713f12] rounded-full" />
                </div>
                <span className="text-[10px] font-black text-[#FFE082] mt-1 bg-[#450a0a]/80 px-2 py-0.5 rounded-full border border-[#E6C280]/40">
                  الصقر والمجثم
                </span>
              </div>

              {/* Falconer Leather Glove & Hood (البرقع والقفاز) */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-[#5c2b0c] border border-[#d97706] shadow-md flex items-center justify-center">
                  <span className="text-xl">🧤</span>
                </div>
                <span className="text-[10px] font-black text-[#FFF4D4] mt-1 bg-[#450a0a]/80 px-2 py-0.5 rounded-full border border-[#E6C280]/40">
                  القفاز والبرقع
                </span>
              </div>
            </div>

            {/* Golden Heritage Lanterns flanking the terrace */}
            <div className="absolute left-3 bottom-3 w-4 h-6 bg-[#E6C280] rounded shadow-[0_0_16px_#F59E0B] animate-pulse" />
            <div className="absolute right-3 bottom-3 w-4 h-6 bg-[#E6C280] rounded shadow-[0_0_16px_#F59E0B] animate-pulse" />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* INTERACTIVE ITEM HOTSPOT GLOWS (الهالة الذهبية الخفيفة عند الاقتراب) */}
        {/* ---------------------------------------------------------------- */}
        {SOUQ_ITEMS.map((item) => {
          const isNearby = nearbyItem?.id === item.id;
          const isDiscovered = discoveredItems.has(item.id);

          return (
            <div
              key={item.id}
              className="absolute pointer-events-none transition-all duration-300"
              style={{
                left: `${item.worldX}%`,
                top: `${item.worldY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Subtle Golden Glow when player is close */}
              {isNearby && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-60"
                  style={{
                    width: '64px',
                    height: '64px',
                    margin: '-32px 0 0 -32px',
                    background:
                      'radial-gradient(circle, rgba(230,194,128,0.8) 0%, rgba(245,158,11,0.2) 65%, transparent 100%)',
                  }}
                />
              )}

              {/* Glowing Pulse Ring */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isNearby
                    ? 'scale-125 shadow-[0_0_24px_#F59E0B] bg-[#E6C280]/90 text-[#1a0e08]'
                    : isDiscovered
                    ? 'bg-[#1c0f08]/80 text-[#FFE082] border border-[#E6C280]/40'
                    : 'bg-[#1c0f08]/60 text-[#d4bea9] border border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
            </div>
          );
        })}

        {/* ---------------------------------------------------------------- */}
        {/* PLAYER CHARACTER (نفس شخصية القرية مع الحركات والظل) */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="absolute z-30 transition-transform duration-75 ease-out"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -85%)',
          }}
        >
          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            size={64}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTERACTIVE ACTION PROMPT («تعرّف» / «اكتشف عالم الصقّار») */}
      {/* ------------------------------------------------------------------ */}
      {nearbyItem && !activeItem && (
        <div className="absolute bottom-20 sm:bottom-12 inset-x-0 z-40 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            id={`souq-interact-btn-${nearbyItem.id}`}
            onClick={() => handleOpenItem(nearbyItem)}
            className="pointer-events-auto flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#8A1538] hover:bg-[#a31a44] border-2 border-[#E6C280] text-[#FFF4D4] font-black text-sm sm:text-base shadow-[0_8px_30px_rgba(0,0,0,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="text-xl">{nearbyItem.icon}</span>
            <span>
              {nearbyItem.isFalconer ? 'اكتشف عالم الصقّار' : `تعرّف على ${nearbyItem.name}`}
            </span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DISCOVERY MODAL CARD (بطاقة صغيرة وغير مزعجة مع صوت «استمع») */}
      {/* ------------------------------------------------------------------ */}
      {activeItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            id="souq-discovery-card"
            className="relative w-full max-w-sm rounded-3xl bg-[#1c0f08] border-2 border-[#E6C280] p-6 text-center text-[#FAF5EA] shadow-[0_16px_48px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
          >
            {/* Close button at top right */}
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveItem(null);
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#2a160d] hover:bg-[#3d1f10] border border-[#E6C280]/40 flex items-center justify-center text-[#FFE082] cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Shop Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a160d] border border-[#E6C280]/30 text-xs font-bold text-[#FFE082] mb-3">
              <span>{activeItem.shopName}</span>
            </div>

            {/* Item Icon Illustration */}
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 border-2 border-[#E6C280]/60 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${activeItem.color} 0%, #200f08 100%)`,
              }}
            >
              <span className="text-4xl drop-shadow-md">{activeItem.icon}</span>
            </div>

            {/* Item Title */}
            <h3 className="text-xl font-black text-[#FFF4D4] mb-2">{activeItem.name}</h3>

            {/* Exactly ONE short Arabic sentence (جملة عربية واحدة قصيرة) */}
            <p className="text-sm text-[#d4bea9] leading-relaxed mb-6 font-medium">
              {activeItem.shortFact}
            </p>

            {/* Action Buttons: Listen (استمع) & Done (حسناً) */}
            <div className="flex items-center justify-center gap-3">
              {/* Listen Button (زر استمع) */}
              <button
                id="souq-listen-btn"
                onClick={() => handleSpeakItem(activeItem)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer border ${
                  isSpeaking
                    ? 'bg-amber-600 border-amber-300 text-white animate-pulse'
                    : 'bg-[#2b170c] hover:bg-[#3d1f10] border-[#E6C280]/60 text-[#FFE082] hover:scale-105 active:scale-95'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'جارٍ الاستماع...' : 'استمع'}</span>
              </button>

              {/* Dismiss Button */}
              <button
                id="souq-close-card-btn"
                onClick={() => {
                  soundManager.playClick();
                  setActiveItem(null);
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#8A1538] hover:bg-[#a31a44] border border-[#E6C280] text-[#FFF4D4] font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>حسناً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* COMPACT TOUCH D-PAD CONTROLLER (أسفل اليسار، شبه شفاف، وصغير) */}
      {/* ------------------------------------------------------------------ */}
      {showTouchControls && (
        <div
          id="souq-touch-controls"
          className="absolute bottom-4 left-4 z-40 select-none touch-none pointer-events-auto"
        >
          <div className="relative w-32 h-32 rounded-full bg-[#1c0f08]/60 border border-[#E6C280]/30 shadow-lg backdrop-blur-sm flex items-center justify-center">
            {/* UP */}
            <button
              onTouchStart={() => handleTouchDir(0, -1)}
              onTouchEnd={() => handleTouchDir(0, 0)}
              onMouseDown={() => handleTouchDir(0, -1)}
              onMouseUp={() => handleTouchDir(0, 0)}
              className="absolute top-1.5 w-9 h-9 rounded-full bg-[#2a160d]/80 active:bg-[#8A1538] border border-[#E6C280]/40 flex items-center justify-center text-[#FFE082] font-black text-sm"
              aria-label="تحرك للأعلى"
            >
              ▲
            </button>
            {/* DOWN */}
            <button
              onTouchStart={() => handleTouchDir(0, 1)}
              onTouchEnd={() => handleTouchDir(0, 0)}
              onMouseDown={() => handleTouchDir(0, 1)}
              onMouseUp={() => handleTouchDir(0, 0)}
              className="absolute bottom-1.5 w-9 h-9 rounded-full bg-[#2a160d]/80 active:bg-[#8A1538] border border-[#E6C280]/40 flex items-center justify-center text-[#FFE082] font-black text-sm"
              aria-label="تحرك للأسفل"
            >
              ▼
            </button>
            {/* LEFT */}
            <button
              onTouchStart={() => handleTouchDir(-1, 0)}
              onTouchEnd={() => handleTouchDir(0, 0)}
              onMouseDown={() => handleTouchDir(-1, 0)}
              onMouseUp={() => handleTouchDir(0, 0)}
              className="absolute left-1.5 w-9 h-9 rounded-full bg-[#2a160d]/80 active:bg-[#8A1538] border border-[#E6C280]/40 flex items-center justify-center text-[#FFE082] font-black text-sm"
              aria-label="تحرك لليسار"
            >
              ◀
            </button>
            {/* RIGHT */}
            <button
              onTouchStart={() => handleTouchDir(1, 0)}
              onTouchEnd={() => handleTouchDir(0, 0)}
              onMouseDown={() => handleTouchDir(1, 0)}
              onMouseUp={() => handleTouchDir(0, 0)}
              className="absolute right-1.5 w-9 h-9 rounded-full bg-[#2a160d]/80 active:bg-[#8A1538] border border-[#E6C280]/40 flex items-center justify-center text-[#FFE082] font-black text-sm"
              aria-label="تحرك لليمين"
            >
              ▶
            </button>
            {/* Center dot */}
            <div className="w-4 h-4 rounded-full bg-[#E6C280]/40 border border-[#E6C280]/60" />
          </div>
        </div>
      )}
    </div>
  );
};
