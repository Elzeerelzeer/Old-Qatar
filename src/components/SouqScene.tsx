from pathlib import Path

code = r'''import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import {
  CharacterGender,
  Direction,
  GameSettings,
} from '../types';

import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';

import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Sparkles,
  Volume2,
  X,
  Rotate3D,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

/* ============================================================
   PROPS
============================================================ */

interface SouqSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
}

/* ============================================================
   DATA TYPES
============================================================ */

interface SouqItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  accent: string;
}

interface SouqHotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  intro: string;
  items: SouqItem[];
}

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ============================================================
   MASTER MAP
============================================================ */

const SOUQ_MASTER_IMAGE = '/assets/souq-master-map.png.jpeg';
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 900;

/* ============================================================
   EDUCATIONAL CONTENT
============================================================ */

const SOUQ_HOTSPOTS: SouqHotspot[] = [
  {
    id: 'pottery',
    name: 'دكان الفخار',
    x: 25,
    y: 38,
    radius: 14,
    intro: 'أوانٍ استخدمها أهل قطر لوّل.',
    items: [
      {
        id: 'jar',
        name: 'الجَرّة',
        icon: '🏺',
        description: 'إناء فخاري لحفظ الماء.',
        accent: '#B96E42',
      },
      {
        id: 'pot',
        name: 'القدر الفخاري',
        icon: '🥘',
        description: 'استُخدم لإعداد وحفظ الطعام.',
        accent: '#A85A32',
      },
      {
        id: 'dallah',
        name: 'الدلّة',
        icon: '🫖',
        description: 'لتقديم القهوة العربية.',
        accent: '#C9A45F',
      },
    ],
  },
  {
    id: 'spices',
    name: 'دكان العطّار',
    x: 75,
    y: 38,
    radius: 14,
    intro: 'روائح وتوابل السوق القديم.',
    items: [
      {
        id: 'cardamom',
        name: 'الهيل',
        icon: '🌿',
        description: 'يُضاف إلى القهوة العربية.',
        accent: '#728C4A',
      },
      {
        id: 'saffron',
        name: 'الزعفران',
        icon: '🌼',
        description: 'من التوابل الثمينة والعطرية.',
        accent: '#D69A27',
      },
      {
        id: 'cinnamon',
        name: 'القرفة',
        icon: '🪵',
        description: 'بهار عطري للطعام والمشروبات.',
        accent: '#9B5A35',
      },
      {
        id: 'clove',
        name: 'القرنفل',
        icon: '🌱',
        description: 'توابل عطرية قوية الرائحة.',
        accent: '#6D713C',
      },
    ],
  },
  {
    id: 'fabrics',
    name: 'الأقمشة والسلال',
    x: 26,
    y: 68,
    radius: 14,
    intro: 'منتجات النسيج والخوص.',
    items: [
      {
        id: 'basket',
        name: 'السلة',
        icon: '🧺',
        description: 'صُنعت لحمل وحفظ الأغراض.',
        accent: '#C29858',
      },
      {
        id: 'palm',
        name: 'الخوص',
        icon: '🌴',
        description: 'يُؤخذ من سعف النخيل.',
        accent: '#758B4C',
      },
      {
        id: 'fabric',
        name: 'الأقمشة',
        icon: '🧵',
        description: 'لصناعة الملابس والمفروشات.',
        accent: '#8A1538',
      },
    ],
  },
  {
    id: 'antiques',
    name: 'الأدوات القديمة',
    x: 74,
    y: 68,
    radius: 14,
    intro: 'أدوات استخدمها التجار قديمًا.',
    items: [
      {
        id: 'scale',
        name: 'الميزان',
        icon: '⚖️',
        description: 'لوزن السلع قبل البيع.',
        accent: '#B99658',
      },
      {
        id: 'box',
        name: 'الصندوق الخشبي',
        icon: '📦',
        description: 'لحفظ ونقل البضائع.',
        accent: '#805333',
      },
      {
        id: 'lantern',
        name: 'الفانوس',
        icon: '🏮',
        description: 'للإضاءة قبل انتشار الكهرباء.',
        accent: '#C97C31',
      },
    ],
  },
  {
    id: 'falconer',
    name: 'ركن الصقّار',
    x: 50,
    y: 28,
    radius: 13,
    intro: 'تعرّف على الصقر وأدوات الصقّار.',
    items: [
      {
        id: 'falcon',
        name: 'الصقر',
        icon: '🦅',
        description: 'من رموز التراث القطري.',
        accent: '#8A6949',
      },
      {
        id: 'glove',
        name: 'قفاز الصقّار',
        icon: '🧤',
        description: 'يحمي يد الصقّار عند حمل الصقر.',
        accent: '#8A1538',
      },
      {
        id: 'perch',
        name: 'المجثم',
        icon: '🪵',
        description: 'مكان يستقر عليه الصقر.',
        accent: '#795138',
      },
    ],
  },
];

/* ============================================================
   COLLISION MAP
============================================================ */

const SOUQ_COLLIDERS: BoundingBox[] = [
  { id: 'wall_north', x: 0, y: 0, width: 100, height: 16 },
  { id: 'wall_west', x: 0, y: 0, width: 14, height: 100 },
  { id: 'wall_east', x: 86, y: 0, width: 14, height: 100 },
  { id: 'wall_south_left', x: 0, y: 92, width: 40, height: 8 },
  { id: 'wall_south_right', x: 60, y: 92, width: 40, height: 8 },

  { id: 'block_pottery', x: 14, y: 16, width: 15, height: 26 },
  { id: 'block_spices', x: 71, y: 16, width: 15, height: 26 },
  { id: 'block_fabrics', x: 14, y: 52, width: 15, height: 26 },
  { id: 'block_antiques', x: 71, y: 52, width: 15, height: 26 },
  { id: 'block_falconer', x: 46, y: 16, width: 8, height: 8 },
];

/* ============================================================
   COMPONENT
============================================================ */

export function SouqScene({
  gender,
  settings,
  onReturnToVillage,
}: SouqSceneProps) {
  /* ---------------- PLAYER ---------------- */

  const [playerPos, setPlayerPos] = useState({ x: 50, y: 86 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);
  const [activeTouchDir, setActiveTouchDir] = useState<Direction | null>(null);

  /* ---------------- VIEWER ---------------- */

  const [selectedHotspot, setSelectedHotspot] =
    useState<SouqHotspot | null>(null);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const [rotationX, setRotationX] = useState(-8);
  const [rotationY, setRotationY] = useState(18);
  const [scale3D, setScale3D] = useState(1);

  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  /* ---------------- INPUT ---------------- */

  const keysPressed = useRef<Record<string, boolean>>({});
  const touchDirectionRef = useRef<Direction | null>(null);

  /* ---------------- CAMERA ---------------- */

  const viewportRef = useRef<HTMLDivElement>(null);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      const el = viewportRef.current;
      if (!el) return;

      setViewportSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    const el = viewportRef.current;

    if (el) observer.observe(el);

    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  /* ---------------- ARABIC VOICE ---------------- */

  const [arabicVoice, setArabicVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      const preferred =
        voices.find((voice) => voice.lang === 'ar-QA') ||
        voices.find((voice) => voice.lang === 'ar-SA') ||
        voices.find((voice) => voice.lang.startsWith('ar')) ||
        null;

      setArabicVoice(preferred);
    };

    loadVoices();

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        loadVoices
      );
    };
  }, []);

  /* ---------------- SETTINGS ---------------- */

  const MOVE_SPEED = settings.walkSpeed === 'calm' ? 0.38 : 0.55;
  const PLAYER_RADIUS = 2;

  /* ============================================================
     COLLISION
  ============================================================ */

  const checkCollision = useCallback(
    (targetX: number, targetY: number): boolean => {
      if (
        targetX < 14 ||
        targetX > 86 ||
        targetY < 18 ||
        targetY > 93
      ) {
        return true;
      }

      for (const box of SOUQ_COLLIDERS) {
        const left = box.x;
        const right = box.x + box.width;
        const top = box.y;
        const bottom = box.y + box.height;

        if (
          targetX + PLAYER_RADIUS > left &&
          targetX - PLAYER_RADIUS < right &&
          targetY + PLAYER_RADIUS > top &&
          targetY - PLAYER_RADIUS < bottom
        ) {
          return true;
        }
      }

      return false;
    },
    []
  );

  /* ============================================================
     KEYBOARD
  ============================================================ */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedHotspot) return;

      const key = e.key.toLowerCase();

      if (
        [
          'arrowup',
          'arrowdown',
          'arrowleft',
          'arrowright',
          'w',
          'a',
          's',
          'd',
        ].includes(key)
      ) {
        e.preventDefault();
        keysPressed.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedHotspot]);

  /* ============================================================
     GAME LOOP
  ============================================================ */

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let lastFootstepAt = 0;

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.6667, 2);
      lastTime = time;

      let dx = 0;
      let dy = 0;
      let nextDirection: Direction | null = null;

      if (!selectedHotspot) {
        const keys = keysPressed.current;
        const touch = touchDirectionRef.current;

        if (keys.arrowup || keys.w || touch === 'up') {
          dy -= MOVE_SPEED * dt;
          nextDirection = 'up';
        }

        if (keys.arrowdown || keys.s || touch === 'down') {
          dy += MOVE_SPEED * dt;
          nextDirection = 'down';
        }

        if (keys.arrowleft || keys.a || touch === 'left') {
          dx -= MOVE_SPEED * dt;
          nextDirection = 'left';
        }

        if (keys.arrowright || keys.d || touch === 'right') {
          dx += MOVE_SPEED * dt;
          nextDirection = 'right';
        }
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);

        if (nextDirection) setDirection(nextDirection);

        setPlayerPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          if (!checkCollision(prev.x + dx, prev.y)) {
            nextX = prev.x + dx;
          }

          if (!checkCollision(nextX, prev.y + dy)) {
            nextY = prev.y + dy;
          }

          return { x: nextX, y: nextY };
        });

        if (
          settings.isSoundEnabled &&
          !settings.isQuietMode &&
          time - lastFootstepAt > 360
        ) {
          soundManager.playFootstep();
          lastFootstepAt = time;
        }
      } else {
        setIsMoving(false);
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(frameId);
  }, [
    checkCollision,
    settings.isSoundEnabled,
    settings.isQuietMode,
    MOVE_SPEED,
    selectedHotspot,
  ]);

  /* ============================================================
     TOUCH D-PAD
  ============================================================ */

  const handleTouchStart = (dir: Direction) => {
    if (selectedHotspot) return;

    touchDirectionRef.current = dir;
    setActiveTouchDir(dir);
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
  };

  /* ============================================================
     HOTSPOT DETECTION
  ============================================================ */

  const activeNearbyHotspot = SOUQ_HOTSPOTS.find((spot) => {
    const distance = Math.hypot(
      playerPos.x - spot.x,
      playerPos.y - spot.y
    );

    return distance <= spot.radius;
  });

  /* ============================================================
     SPEECH
  ============================================================ */

  const speakArabic = (name: string, description: string) => {
    if (!('speechSynthesis' in window)) {
      alert('الاستماع غير مدعوم في هذا المتصفح.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `${name}. ${description}`
    );

    utterance.lang = arabicVoice?.lang || 'ar-SA';

    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.volume = 1;

    synth.speak(utterance);
  };

  /* ============================================================
     VIEWER OPEN / CLOSE
  ============================================================ */

  const reset3DView = () => {
    setRotationX(-8);
    setRotationY(18);
    setScale3D(1);
  };

  const openHotspot = (hotspot: SouqHotspot) => {
    soundManager.playClick();

    keysPressed.current = {};
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
    setIsMoving(false);

    setSelectedHotspot(hotspot);
    setCurrentItemIndex(0);
    reset3DView();
  };

  const closeHotspot = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSelectedHotspot(null);
    setCurrentItemIndex(0);
    reset3DView();
  };

  /* ============================================================
     ITEM NAVIGATION
  ============================================================ */

  const nextItem = () => {
    if (!selectedHotspot) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setCurrentItemIndex((prev) =>
      (prev + 1) % selectedHotspot.items.length
    );

    reset3DView();
  };

  const previousItem = () => {
    if (!selectedHotspot) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setCurrentItemIndex((prev) =>
      (prev - 1 + selectedHotspot.items.length) %
      selectedHotspot.items.length
    );

    reset3DView();
  };

  /* ============================================================
     3D TOUCH / POINTER INTERACTION
  ============================================================ */

  const handleObjectPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    draggingRef.current = true;

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleObjectPointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current) return;

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;

    setRotationY((prev) => prev + dx * 0.55);

    setRotationX((prev) => {
      const next = prev - dy * 0.35;
      return Math.max(-28, Math.min(28, next));
    });

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleObjectPointerUp = () => {
    draggingRef.current = false;
  };

  const handleViewerWheel = (
    e: React.WheelEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setScale3D((prev) => {
      const next = prev - e.deltaY * 0.001;
      return Math.max(0.82, Math.min(1.28, next));
    });
  };

  /* ============================================================
     CAMERA CLAMP
     يمنع ظهور اللون الأسود عند حواف الصورة
  ============================================================ */

  const playerWorldPxX = (playerPos.x / 100) * WORLD_WIDTH;
  const playerWorldPxY = (playerPos.y / 100) * WORLD_HEIGHT;

  const desiredCameraX =
    viewportSize.width / 2 - playerWorldPxX;

  const desiredCameraY =
    viewportSize.height / 2 - playerWorldPxY;

  const cameraX =
    viewportSize.width <= 0
      ? 0
      : WORLD_WIDTH <= viewportSize.width
        ? (viewportSize.width - WORLD_WIDTH) / 2
        : Math.min(
            0,
            Math.max(
              viewportSize.width - WORLD_WIDTH,
              desiredCameraX
            )
          );

  const cameraY =
    viewportSize.height <= 0
      ? 0
      : WORLD_HEIGHT <= viewportSize.height
        ? (viewportSize.height - WORLD_HEIGHT) / 2
        : Math.min(
            0,
            Math.max(
              viewportSize.height - WORLD_HEIGHT,
              desiredCameraY
            )
          );

  const currentItem =
    selectedHotspot?.items[currentItemIndex] ?? null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      ref={viewportRef}
      id="souq-exploration-viewport"
      className="relative w-full h-full overflow-hidden bg-[#1a0e08] select-none"
      dir="rtl"
    >
      {/* ======================== HEADER ======================== */}

      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="pointer-events-auto bg-[#2b170d]/90 backdrop-blur-md border border-[#E6C280]/40 px-4 py-2 rounded-full shadow-xl text-[#FAF5EA] font-bold">
            سوق لوّل
          </div>

          <div className="pointer-events-auto bg-[#2b170d]/90 border border-[#E6C280]/40 px-4 py-2 rounded-full text-xs text-[#FAF5EA]">
            رحلة السوق{' '}
            <span className="text-[#E6C280] font-black">0/2</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();

            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }

            onReturnToVillage();
          }}
          className="pointer-events-auto flex items-center gap-2 bg-[#8A1538] hover:bg-[#6b102c] active:scale-95 text-white border border-[#FFE082] px-4 py-2 rounded-full shadow-xl font-bold transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى القرية</span>
        </button>
      </div>

      {/* ======================== WORLD ======================== */}

      <div
        id="souq-world"
        className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
        }}
      >
        {/* MASTER MAP */}

        <img
          src={SOUQ_MASTER_IMAGE}
          alt="خريطة سوق لوّل"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* HOTSPOTS */}

        {SOUQ_HOTSPOTS.map((spot) => {
          const isNear = activeNearbyHotspot?.id === spot.id;

          return (
            <div
              key={spot.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
              }}
            >
              {isNear && (
                <>
                  <div className="absolute -inset-16 rounded-full bg-[#FFD76B]/25 blur-2xl animate-pulse pointer-events-none" />

                  <button
                    onClick={() => openHotspot(spot)}
                    className="relative pointer-events-auto bg-[#8A1538]/95 border-2 border-[#FFE082] text-[#FFE082] px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-black active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تعرّف</span>
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* PLAYER */}

        <div
          id="souq-player"
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -85%) scale(1.08)',
          }}
        >
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-4 bg-black/45 rounded-full blur-[2px]" />

          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={false}
          />
        </div>
      </div>

      {/* ======================== D-PAD ======================== */}

      {!selectedHotspot && (
        <div
          id="souq-touch-dpad"
          className="fixed bottom-6 left-6 z-[100] w-[138px] h-[138px] rounded-full bg-[#2d180f]/90 border-2 border-[#E6C280] shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-md touch-none select-none"
        >
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute top-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'up'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك للأعلى"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'down'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك للأسفل"
          >
            <ArrowDown className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'left'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك لليسار"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'right'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك لليمين"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#B99658] border-2 border-[#F6E3B4] flex items-center justify-center text-white pointer-events-none shadow-inner">
            ✦
          </div>
        </div>
      )}

      {/* ======================== 3D VIEWER ======================== */}

      {selectedHotspot && currentItem && (
        <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-[#392013] to-[#1f100a] border-2 border-[#E6C280] rounded-[32px] shadow-[0_28px_100px_rgba(0,0,0,0.8)] p-4 sm:p-6">
            {/* CLOSE */}

            <button
              onClick={closeHotspot}
              className="absolute top-4 left-4 z-50 w-11 h-11 rounded-full bg-black/45 border border-[#E6C280]/50 flex items-center justify-center text-white active:scale-90"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            {/* HEADER */}

            <div className="text-center mb-4 pr-10 pl-10">
              <div className="text-[#FFE082] text-xl sm:text-2xl font-black">
                {selectedHotspot.name}
              </div>

              <div className="text-[#eadac2] text-sm mt-1">
                {selectedHotspot.intro}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-center">
              {/* 3D AREA */}

              <div
                className="relative min-h-[410px] sm:min-h-[450px] rounded-[28px] overflow-hidden border border-[#E6C280]/30 bg-gradient-to-b from-[#c7a46e]/20 to-black/20 flex items-center justify-center"
                style={{ perspective: '1100px' }}
                onWheel={handleViewerWheel}
              >
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[60%] h-[35%] rounded-full bg-[#FFE4A5]/15 blur-3xl" />

                <div className="absolute bottom-[58px] left-1/2 -translate-x-1/2 w-[230px] h-[42px] rounded-full bg-black/50 blur-xl" />

                <div
                  onPointerDown={handleObjectPointerDown}
                  onPointerMove={handleObjectPointerMove}
                  onPointerUp={handleObjectPointerUp}
                  onPointerCancel={handleObjectPointerUp}
                  onPointerLeave={handleObjectPointerUp}
                  className="relative w-[270px] h-[320px] sm:w-[350px] sm:h-[370px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `
                      scale(${scale3D})
                      rotateX(${rotationX}deg)
                      rotateY(${rotationY}deg)
                    `,
                  }}
                >
                  <div
                    className="absolute inset-[12%] rounded-[42%] blur-2xl opacity-50"
                    style={{
                      background: currentItem.accent,
                      transform: 'translateZ(-45px)',
                    }}
                  />

                  <div
                    className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full opacity-25 blur-3xl"
                    style={{
                      background: currentItem.accent,
                      transform: 'translateZ(-25px)',
                    }}
                  />

                  <div
                    className="relative text-[155px] sm:text-[205px] leading-none drop-shadow-[0_28px_22px_rgba(0,0,0,0.45)] pointer-events-none"
                    style={{
                      transform: 'translateZ(75px)',
                      filter: 'saturate(1.12) contrast(1.05)',
                    }}
                  >
                    {currentItem.icon}
                  </div>

                  <div
                    className="absolute top-[20%] right-[24%] w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none"
                    style={{
                      transform: 'translateZ(90px)',
                    }}
                  />
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/45 border border-[#E6C280]/25 text-[#F8E6C0] text-xs sm:text-sm pointer-events-none">
                  <Rotate3D className="w-4 h-4 text-[#FFE082]" />
                  <span>اسحب لتدوير العنصر</span>
                </div>
              </div>

              {/* INFO */}

              <div className="rounded-[24px] border border-[#E6C280]/30 bg-black/20 p-5 text-center">
                <div className="text-[#FFE082] text-2xl font-black">
                  {currentItem.name}
                </div>

                <p className="mt-3 text-white text-lg leading-8 font-semibold">
                  {currentItem.description}
                </p>

                <button
                  onClick={() =>
                    speakArabic(
                      currentItem.name,
                      currentItem.description
                    )
                  }
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#8A1538] border-2 border-[#FFE082] text-[#FFE082] rounded-2xl py-3 font-black active:scale-95 shadow-lg"
                >
                  <Volume2 className="w-6 h-6" />
                  <span>استمع</span>
                </button>

                <button
                  onClick={reset3DView}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-[#5c3a28] border border-[#E6C280]/50 text-white rounded-xl py-2.5 font-bold active:scale-95"
                >
                  <Rotate3D className="w-5 h-5" />
                  <span>إعادة الوضع</span>
                </button>

                <div className="mt-4 text-xs text-[#d9c8ae]">
                  اسحب بإصبعك أو بالماوس • عجلة الماوس للتكبير
                </div>
              </div>
            </div>

            {/* NAVIGATION */}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={previousItem}
                className="flex items-center gap-2 bg-[#5b3522] border border-[#E6C280]/40 text-white px-4 py-3 rounded-xl font-bold active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
                <span>السابق</span>
              </button>

              <div className="flex items-center justify-center gap-2">
                {selectedHotspot.items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }

                      setCurrentItemIndex(index);
                      reset3DView();
                    }}
                    className={`transition-all rounded-full ${
                      index === currentItemIndex
                        ? 'w-9 h-3 bg-[#FFE082]'
                        : 'w-3 h-3 bg-white/25'
                    }`}
                    aria-label={item.name}
                  />
                ))}
              </div>

              <button
                onClick={nextItem}
                className="flex items-center gap-2 bg-[#8A1538] border border-[#FFE082] text-[#FFE082] px-4 py-3 rounded-xl font-black active:scale-95"
              >
                <span>التالي</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 text-center text-xs text-[#cfbfa8]">
              {currentItemIndex + 1} / {selectedHotspot.items.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''

path = Path("/mnt/data/SouqScene.tsx")
path.write_text(code, encoding="utf-8")
print(f"Created: {path}")
print(f"Lines: {len(code.splitlines())}")
