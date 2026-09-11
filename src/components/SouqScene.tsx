import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterGender, Direction, GameSettings } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';
import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft, Sparkles } from 'lucide-react';

interface SouqSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
}

// ---------------------------------------------------------------------------
// SOUQ HOTSPOTS (الأركان الخمسة التراثية)
// ---------------------------------------------------------------------------
interface SouqHotspot {
  id: string;
  name: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  radius: number; // trigger radius in %
}

const SOUQ_HOTSPOTS: SouqHotspot[] = [
  { id: 'pottery', name: 'دكان الفخار', x: 25, y: 38, radius: 14 },
  { id: 'spices', name: 'دكان العطّار', x: 75, y: 38, radius: 14 },
  { id: 'fabrics', name: 'الأقمشة والسلال', x: 26, y: 68, radius: 14 },
  { id: 'antiques', name: 'الأدوات القديمة', x: 74, y: 68, radius: 14 },
  { id: 'falconer', name: 'ركن الصقّار', x: 50, y: 28, radius: 13 },
];

// ---------------------------------------------------------------------------
// INVISIBLE COLLISION BOUNDARIES (تمنع الدخول في الجدران والدكاكين)
// Allows walking freely in the main central alley & approaches to all shops
// ---------------------------------------------------------------------------
interface BoundingBox {
  id: string;
  x: number;      // left %
  y: number;      // top %
  width: number;  // width %
  height: number; // height %
}

const SOUQ_COLLIDERS: BoundingBox[] = [
  // Outer perimeter boundaries
  { id: 'wall_north', x: 0, y: 0, width: 100, height: 16 },
  { id: 'wall_west', x: 0, y: 0, width: 14, height: 100 },
  { id: 'wall_east', x: 86, y: 0, width: 14, height: 100 },
  { id: 'wall_south_left', x: 0, y: 92, width: 40, height: 8 },
  { id: 'wall_south_right', x: 60, y: 92, width: 40, height: 8 },

  // Shop Interior Walls & Obstacles (keeps character in reachable corridors)
  // 1. دكان الفخار (North-West deep stall)
  { id: 'block_pottery_deep', x: 14, y: 16, width: 15, height: 26 },

  // 2. دكان العطّار (North-East deep stall)
  { id: 'block_spices_deep', x: 71, y: 16, width: 15, height: 26 },

  // 3. الأقمشة والسلال (Mid-West deep stall)
  { id: 'block_fabrics_deep', x: 14, y: 52, width: 15, height: 26 },

  // 4. الأدوات القديمة (Mid-East deep stall)
  { id: 'block_antiques_deep', x: 71, y: 52, width: 15, height: 26 },

  // 5. ركن الصقّار (North center perch structure)
  { id: 'block_falconer_stand', x: 46, y: 16, width: 8, height: 8 },
];

export function SouqScene({ gender, settings, onReturnToVillage }: SouqSceneProps) {
  // Player spawns at bottom center of the main souq alley
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 86 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);
  const [activeTouchDir, setActiveTouchDir] = useState<Direction | null>(null);

  // Active keyboard keys state
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Touch active direction
  const touchDirectionRef = useRef<Direction | null>(null);

  // Viewport container ref for camera tracking
  const viewportRef = useRef<HTMLDivElement>(null);

  // Movement speed
  const MOVE_SPEED = 0.55;
  const PLAYER_RADIUS = 2.0;

  // ---------------------------------------------------------------------------
  // Check collision against invisible barriers
  // ---------------------------------------------------------------------------
  const checkCollision = useCallback((targetX: number, targetY: number): boolean => {
    // Outer canvas boundaries
    if (targetX < 14 || targetX > 86 || targetY < 18 || targetY > 93) {
      return true;
    }

    // Check collision bounding boxes
    for (const box of SOUQ_COLLIDERS) {
      const boxLeft = box.x;
      const boxRight = box.x + box.width;
      const boxTop = box.y;
      const boxBottom = box.y + box.height;

      if (
        targetX + PLAYER_RADIUS > boxLeft &&
        targetX - PLAYER_RADIUS < boxRight &&
        targetY + PLAYER_RADIUS > boxTop &&
        targetY - PLAYER_RADIUS < boxBottom
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard event listeners (WASD and Arrow keys)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current[key]) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Game Loop: Player Movement & Collision
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;
    let stepSoundTimer = 0;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;
      let newDir: Direction | null = null;

      const keys = keysPressed.current;
      const touchDir = touchDirectionRef.current;

      if (keys['arrowup'] || keys['w'] || touchDir === 'up') {
        dy -= MOVE_SPEED;
        newDir = 'up';
      }
      if (keys['arrowdown'] || keys['s'] || touchDir === 'down') {
        dy += MOVE_SPEED;
        newDir = 'down';
      }
      if (keys['arrowleft'] || keys['a'] || touchDir === 'left') {
        dx -= MOVE_SPEED;
        newDir = 'left';
      }
      if (keys['arrowright'] || keys['d'] || touchDir === 'right') {
        dx += MOVE_SPEED;
        newDir = 'right';
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);
        if (newDir) setDirection(newDir);

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

        stepSoundTimer++;
        if (stepSoundTimer % 18 === 0 && settings.isSoundEnabled && !settings.isQuietMode) {
          soundManager.playFootstep();
        }
      } else {
        setIsMoving(false);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [checkCollision, settings.isSoundEnabled, settings.isQuietMode]);

  // ---------------------------------------------------------------------------
  // Touch Handlers for Virtual D-Pad
  // ---------------------------------------------------------------------------
  const handleTouchStart = (dir: Direction) => {
    touchDirectionRef.current = dir;
    setActiveTouchDir(dir);
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
  };

  // ---------------------------------------------------------------------------
  // Detect active nearby hotspot
  // ---------------------------------------------------------------------------
  const activeNearbyHotspot = SOUQ_HOTSPOTS.find((spot) => {
    const dist = Math.hypot(playerPos.x - spot.x, playerPos.y - spot.y);
    return dist <= spot.radius;
  });

  // ---------------------------------------------------------------------------
  // World Dimensions: Master Image native aspect ratio 1600x900
  // ---------------------------------------------------------------------------
  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 900;

  const playerWorldPxX = (playerPos.x / 100) * WORLD_WIDTH;
  const playerWorldPxY = (playerPos.y / 100) * WORLD_HEIGHT;

  return (
    <div
      ref={viewportRef}
      id="souq-exploration-viewport"
      className="relative w-full h-full overflow-hidden bg-[#1a0e08] select-none"
    >
      {/* ===================================================================== */}
      {/* TOP HEADER: Clean Title, Indicator, & Return Button                   */}
      {/* ===================================================================== */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          {/* Subtle Location Title */}
          <div className="pointer-events-auto bg-[#2b170d]/90 backdrop-blur-md border border-[#E6C280]/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6C280] shadow-[0_0_8px_#E6C280] animate-pulse"></span>
            <span className="text-[#FAF5EA] text-sm md:text-base font-bold tracking-wide">
              سوق لوّل
            </span>
          </div>

          {/* Progress Indicator: «رحلة السوق 0/2» */}
          <div className="pointer-events-auto bg-[#2b170d]/90 backdrop-blur-md border border-[#E6C280]/40 px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 text-xs font-semibold text-[#FAF5EA]">
            <span>رحلة السوق</span>
            <span className="text-[#E6C280] font-bold">0/2</span>
          </div>
        </div>

        {/* Return Button: «العودة إلى القرية» */}
        <button
          onClick={() => {
            soundManager.playClick();
            onReturnToVillage();
          }}
          className="pointer-events-auto flex items-center gap-2 bg-[#8A1538] hover:bg-[#6b102c] active:scale-95 text-[#FAF5EA] px-4 py-2 rounded-full border border-[#E6C280]/60 shadow-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
          title="العودة إلى الخريطة الرئيسية"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى القرية</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2.5D MASTER VISUAL MAP WORLD CANVAS (Transforms with Camera Follow)   */}
      {/* ===================================================================== */}
      <div
        id="souq-world"
        className="absolute top-0 left-0 transition-transform duration-75 ease-out"
        style={{
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `translate(calc(50vw - ${playerWorldPxX}px), calc(50vh - ${playerWorldPxY}px))`,
        }}
      >
        {/* ------------------------------------------------------------------- */}
        {/* LAYER 1: BACKGROUND MASTER VISUAL MAP IMAGE                         */}
        {/* Preserving Aspect Ratio with exact path: /assets/souq-master-map.png.jpeg */}
        {/* ------------------------------------------------------------------- */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#1f1008]">
          <img
            src="/assets/souq-master-map.png.jpeg"
            alt="خريطة سوق لوّل الرسمية"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* LAYER 2: TRANSPARENT HOTSPOTS & GOLDEN GLOW OVER SOUQ SHOPS         */}
        {/* ------------------------------------------------------------------- */}
        {SOUQ_HOTSPOTS.map((spot) => {
          const isNear = activeNearbyHotspot?.id === spot.id;

          return (
            <div
              key={spot.id}
              className="absolute pointer-events-none transition-all duration-500 z-20"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Soft Environmental Golden Glow when player approaches */}
              {isNear && (
                <div className="relative flex flex-col items-center">
                  {/* Subtle golden aura pulse */}
                  <div className="w-36 h-36 rounded-full bg-[#E6C280]/25 blur-2xl animate-pulse pointer-events-none" />

                  {/* Small Floating «تعرّف» Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                      }}
                      className="flex items-center gap-1.5 bg-[#8A1538]/95 hover:bg-[#a31a43] active:scale-95 text-[#FAF5EA] px-3.5 py-1.5 rounded-full border border-[#E6C280] shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-xs font-bold transition-all duration-200 cursor-pointer animate-bounce"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E6C280]" />
                      <span>تعرّف</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ------------------------------------------------------------------- */}
        {/* LAYER 3: PLAYER CHARACTER (Same CharacterAvatar from VillageScene)  */}
        {/* Scaled and proportioned for 1600x900 souq perspective               */}
        {/* ------------------------------------------------------------------- */}
        <div
          id="souq-player"
          className="absolute z-30 transition-none pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -85%) scale(0.95)',
          }}
        >
          {/* Foot shadow for 2.5D grounding */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-4 bg-black/50 rounded-full blur-[2px]" />

          {/* Animated Avatar */}
          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={false}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* COMPACT TRANSLUCENT TOUCH D-PAD (FIRST-PAGE STYLE, SLIGHTLY LARGER)   */}
      {/* ===================================================================== */}
      <div
        id="compact-touch-dpad"
        className="fixed bottom-4 left-4 z-40 flex items-end gap-2 pointer-events-auto select-none md:hidden"
      >
        {/* Semi-transparent circular base with golden ring border */}
        <div className="relative w-[96px] h-[96px] rounded-full bg-black/35 border border-[#E6C280]/25 shadow-xl backdrop-blur-sm p-1 flex items-center justify-center">
          {/* Up */}
          <button
            id="dpad-btn-up"
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            className={`absolute top-1 left-1/2 -translate-x-1/2 w-[30px] h-[30px] rounded-xl border flex items-center justify-center text-[#FFE082] shadow cursor-pointer transition-all duration-100 active:scale-90 ${
              activeTouchDir === 'up'
                ? 'bg-[#8A1538]/90 border-[#FFE082] scale-90'
                : 'bg-white/10 hover:bg-white/20 active:bg-[#8A1538]/80 border-[#E6C280]/30'
            }`}
            aria-label="تحرك للأعلى"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Down */}
          <button
            id="dpad-btn-down"
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-[30px] h-[30px] rounded-xl border flex items-center justify-center text-[#FFE082] shadow cursor-pointer transition-all duration-100 active:scale-90 ${
              activeTouchDir === 'down'
                ? 'bg-[#8A1538]/90 border-[#FFE082] scale-90'
                : 'bg-white/10 hover:bg-white/20 active:bg-[#8A1538]/80 border-[#E6C280]/30'
            }`}
            aria-label="تحرك للأسفل"
          >
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Left */}
          <button
            id="dpad-btn-left"
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            className={`absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-xl border flex items-center justify-center text-[#FFE082] shadow cursor-pointer transition-all duration-100 active:scale-90 ${
              activeTouchDir === 'left'
                ? 'bg-[#8A1538]/90 border-[#FFE082] scale-90'
                : 'bg-white/10 hover:bg-white/20 active:bg-[#8A1538]/80 border-[#E6C280]/30'
            }`}
            aria-label="تحرك لليسار"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Right */}
          <button
            id="dpad-btn-right"
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-xl border flex items-center justify-center text-[#FFE082] shadow cursor-pointer transition-all duration-100 active:scale-90 ${
              activeTouchDir === 'right'
                ? 'bg-[#8A1538]/90 border-[#FFE082] scale-90'
                : 'bg-white/10 hover:bg-white/20 active:bg-[#8A1538]/80 border-[#E6C280]/30'
            }`}
            aria-label="تحرك لليمين"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Action Button: When near a shop, provides mobile entry shortcut (كما في الصفحة الأولى) */}
        {activeNearbyHotspot && (
          <button
            id="compact-explore-btn"
            onClick={() => {
              soundManager.playClick();
            }}
            className="px-3 py-2 rounded-full bg-[#8A1538] border border-[#FFE082] text-white font-black text-xs shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
            <span className="text-[#FFE082]">تعرّف</span>
          </button>
        )}
      </div>

      {/* Desktop Keyboard Hints (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-50 hidden md:flex items-center gap-2 bg-[#261309]/85 backdrop-blur-sm border border-[#E6C280]/40 px-3 py-1.5 rounded-full text-xs text-[#FAF5EA]/90 pointer-events-none shadow-lg">
        <span>تحرك باستخدام:</span>
        <kbd className="px-1.5 py-0.5 bg-[#140a05] rounded border border-[#E6C280]/40 text-[#E6C280] font-mono text-[11px]">
          WASD
        </kbd>
        <span>أو</span>
        <kbd className="px-1.5 py-0.5 bg-[#140a05] rounded border border-[#E6C280]/40 text-[#E6C280] font-mono text-[11px]">
          الأسهم ↑↓←→
        </kbd>
      </div>
    </div>
  );
}
