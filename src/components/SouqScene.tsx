import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterGender, Direction, GameSettings } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';
import { ArrowRight } from 'lucide-react';

interface SouqSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
}

// Collision bounding boxes in Souq world space (percentages: 0 to 100)
interface BoundingBox {
  id: string;
  name: string;
  x: number;      // left %
  y: number;      // top %
  width: number;  // width %
  height: number; // height %
}

// ---------------------------------------------------------------------------
// SOUQ COLLISION MAP (Preserving clear wide corridors for smooth navigation)
// Alley runs down the middle (X approx 36% to 64%, Y from 16% to 92%)
// ---------------------------------------------------------------------------
const SOUQ_COLLIDERS: BoundingBox[] = [
  // Outer perimeter boundaries
  { id: 'wall_north', name: 'جدار السوق الشمالي', x: 0, y: 0, width: 100, height: 16 },
  { id: 'wall_west', name: 'جدار السوق الغربي', x: 0, y: 0, width: 14, height: 100 },
  { id: 'wall_east', name: 'جدار السوق الشرقي', x: 86, y: 0, width: 14, height: 100 },
  { id: 'wall_south_left', name: 'مدخل السوق الأيسر', x: 0, y: 92, width: 38, height: 8 },
  { id: 'wall_south_right', name: 'مدخل السوق الأيمن', x: 62, y: 92, width: 38, height: 8 },

  // 1. دكان الفخار (North-West Stall & Counters)
  { id: 'shop_pottery_main', name: 'دكان الفخار', x: 14, y: 16, width: 23, height: 26 },
  { id: 'shop_pottery_counter', name: 'طاولة عرض الفخار', x: 20, y: 40, width: 16, height: 6 },

  // 2. دكان العطّار (North-East Stall & Spice Baskets)
  { id: 'shop_spices_main', name: 'دكان العطّار', x: 63, y: 16, width: 23, height: 26 },
  { id: 'shop_spices_counter', name: 'طاولة التوابل والميزان', x: 64, y: 40, width: 16, height: 6 },

  // 3. دكان الأقمشة والسلال (Mid-West Stall)
  { id: 'shop_fabrics_main', name: 'دكان الأقمشة والسلال', x: 14, y: 52, width: 22, height: 28 },
  { id: 'shop_fabrics_counter', name: 'منصة السلال والخوص', x: 18, y: 78, width: 17, height: 6 },

  // 4. دكان الأدوات القديمة (Mid-East Stall)
  { id: 'shop_antiques_main', name: 'دكان الأدوات القديمة والدلال', x: 64, y: 52, width: 22, height: 28 },
  { id: 'shop_antiques_counter', name: 'منصة الدلال والمبيت', x: 65, y: 78, width: 17, height: 6 },

  // 5. ركن الصقّار (North Plaza / Falconry Perch)
  { id: 'corner_falconer_perch', name: 'مجثم الصقر ومنطقة الصقّار', x: 44, y: 18, width: 12, height: 12 },
];

export function SouqScene({ gender, settings, onReturnToVillage }: SouqSceneProps) {
  // Player position in the Souq (percentage: 0 to 100)
  // Spawns near the souq entrance archway at the south
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 86 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);

  // Active keyboard keys state
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Touch active direction
  const touchDirectionRef = useRef<Direction | null>(null);

  // Viewport container ref for camera tracking
  const viewportRef = useRef<HTMLDivElement>(null);

  // Step speed in percentages
  const MOVE_SPEED = 0.55;
  const PLAYER_RADIUS = 2.2; // Collision padding around player feet

  // ---------------------------------------------------------------------------
  // Check collision against all obstacles
  // ---------------------------------------------------------------------------
  const checkCollision = useCallback((targetX: number, targetY: number): boolean => {
    // Map bounds
    if (targetX < 4 || targetX > 96 || targetY < 8 || targetY > 94) {
      return true;
    }

    // Check against bounding boxes
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
        return true; // Collision detected
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
  // Game Loop: Movement & Collision update
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

      // Check keyboard & touch inputs
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
        // Normalize diagonal speed
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);
        if (newDir) setDirection(newDir);

        setPlayerPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          // Attempt X movement with collision check
          if (!checkCollision(prev.x + dx, prev.y)) {
            nextX = prev.x + dx;
          }
          // Attempt Y movement with collision check
          if (!checkCollision(nextX, prev.y + dy)) {
            nextY = prev.y + dy;
          }

          return { x: nextX, y: nextY };
        });

        // Footstep sound throttle
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
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
  };

  // ---------------------------------------------------------------------------
  // Proximity Detection for Subtle Environmental Golden Glow
  // (No cards, no popups, purely environmental lighting interaction)
  // ---------------------------------------------------------------------------
  const distPottery = Math.hypot(playerPos.x - 36, playerPos.y - 34);
  const isNearPottery = distPottery < 17;

  const distSpices = Math.hypot(playerPos.x - 64, playerPos.y - 34);
  const isNearSpices = distSpices < 17;

  const distFabrics = Math.hypot(playerPos.x - 36, playerPos.y - 68);
  const isNearFabrics = distFabrics < 17;

  const distAntiques = Math.hypot(playerPos.x - 64, playerPos.y - 68);
  const isNearAntiques = distAntiques < 17;

  const distFalconer = Math.hypot(playerPos.x - 50, playerPos.y - 28);
  const isNearFalconer = distFalconer < 15;

  // ---------------------------------------------------------------------------
  // Camera Follow: Keep camera dynamically centered on the player
  // World is 1600px wide, 1400px tall. Viewport smoothly shifts.
  // ---------------------------------------------------------------------------
  const WORLD_WIDTH = 1500;
  const WORLD_HEIGHT = 1300;

  const playerWorldPxX = (playerPos.x / 100) * WORLD_WIDTH;
  const playerWorldPxY = (playerPos.y / 100) * WORLD_HEIGHT;

  return (
    <div
      ref={viewportRef}
      id="souq-exploration-viewport"
      className="relative w-full h-full overflow-hidden bg-[#1f1008] select-none"
    >
      {/* ===================================================================== */}
      {/* TOP HEADER: Clean, subtle return button (Preserved exactly)           */}
      {/* ===================================================================== */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        {/* Subtle Heritage Location Badge */}
        <div className="pointer-events-auto bg-[#2b170d]/90 backdrop-blur-md border border-[#E6C280]/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E6C280] shadow-[0_0_8px_#E6C280] animate-pulse"></span>
          <span className="text-[#FAF5EA] text-sm md:text-base font-bold tracking-wide">
            سوق لوّل التراثي
          </span>
          <span className="text-[#D4A373] text-xs hidden sm:inline border-r border-[#E6C280]/30 pr-2">
            فرجان قطر القديمة
          </span>
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
      {/* 2.5D SOUQ HERITAGE WORLD CANVAS (Transforms with Camera Follow)       */}
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
        {/* FLOOR: Real Qatari Souq Sandstone Flagstones & Cobbled Alley        */}
        {/* ------------------------------------------------------------------- */}
        <div className="absolute inset-0 bg-[#d9a877] overflow-hidden">
          {/* Weathered limestone paving texture with soft natural variance */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                radial-gradient(#8A1538 1px, transparent 1px),
                radial-gradient(#5C3826 1.5px, #d9a877 1.5px)
              `,
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 14px 14px',
            }}
          />

          {/* Central Main Alleyway (ممر السوق الحجري التراثي الواسع) */}
          <div
            className="absolute left-[34%] right-[34%] top-0 bottom-0 bg-[#c68f5a] shadow-[inset_0_0_40px_rgba(61,35,20,0.35)] border-x-2 border-[#8c5732]/30"
          >
            {/* Hand-carved irregular cobblestone pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(74,40,20,0.25) 38px, rgba(74,40,20,0.25) 40px),
                  repeating-linear-gradient(90deg, transparent, transparent 55px, rgba(74,40,20,0.15) 55px, rgba(74,40,20,0.15) 57px)
                `,
              }}
            />

            {/* Weathered Footpath indentation in center */}
            <div className="absolute left-[18%] right-[18%] top-[14%] bottom-[6%] bg-[#b8824f]/40 blur-[1px] rounded-full" />
          </div>

          {/* Ambient cast shadows under all shop frontages */}
          <div className="absolute left-[12%] w-[25%] top-[14%] h-[74%] bg-black/20 blur-md pointer-events-none" />
          <div className="absolute right-[12%] w-[25%] top-[14%] h-[74%] bg-black/20 blur-md pointer-events-none" />
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PERIMETER TRADITIONAL ADOBE WALLS & DANSHAL TIMBER BEAMS           */}
        {/* ------------------------------------------------------------------- */}
        {/* North Wall: Heavy Mudbrick with traditional crenellations & niches */}
        <div className="absolute top-0 left-0 right-0 h-[16%] bg-gradient-to-b from-[#4a2b16] via-[#6e4122] to-[#915934] border-b-4 border-[#331c0e] shadow-2xl">
          {/* Traditional Crenellations (شرفات مسننة تراثية) along the rooftop */}
          <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2">
            {Array.from({ length: 38 }).map((_, i) => (
              <div
                key={`crenel-${i}`}
                className="w-5 h-4 bg-[#3c2211] shadow-inner border-b border-[#5e381e]"
              />
            ))}
          </div>

          {/* Exposed round timber Danchel beams jutting out with 3D drop shadows */}
          <div className="absolute bottom-[-10px] left-0 right-0 flex justify-around px-4">
            {Array.from({ length: 26 }).map((_, i) => (
              <div
                key={`danchel-${i}`}
                className="w-4 h-7 bg-[#28150a] rounded-b-full shadow-[0_6px_8px_rgba(0,0,0,0.6)] border-x border-[#1a0c05]"
              />
            ))}
          </div>

          {/* Deep Mud Plaster Niches (روزنة) */}
          <div className="absolute inset-x-0 bottom-4 flex justify-around px-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`niche-${i}`}
                className="w-11 h-14 bg-[#261409] rounded-t-full border border-[#d4a373]/20 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"
              />
            ))}
          </div>
        </div>

        {/* West Mudbrick Wall with Timber Outcrops */}
        <div className="absolute top-0 left-0 bottom-0 w-[14%] bg-gradient-to-r from-[#442714] via-[#5c351b] to-[#804e2c] border-r-4 border-[#2f190c] shadow-2xl">
          <div className="absolute right-[-8px] top-[18%] bottom-0 flex flex-col justify-around">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={`w-beam-${i}`}
                className="w-6 h-3.5 bg-[#251308] rounded-r-md shadow-md border-y border-[#150a04]"
              />
            ))}
          </div>
        </div>

        {/* East Mudbrick Wall with Timber Outcrops */}
        <div className="absolute top-0 right-0 bottom-0 w-[14%] bg-gradient-to-l from-[#442714] via-[#5c351b] to-[#804e2c] border-l-4 border-[#2f190c] shadow-2xl">
          <div className="absolute left-[-8px] top-[18%] bottom-0 flex flex-col justify-around">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={`e-beam-${i}`}
                className="w-6 h-3.5 bg-[#251308] rounded-l-md shadow-md border-y border-[#150a04]"
              />
            ))}
          </div>
        </div>

        {/* South Wall with Grand Souq Gateway */}
        <div className="absolute bottom-0 left-0 w-[38%] h-[8%] bg-gradient-to-t from-[#442714] to-[#804e2c] border-t-4 border-[#2f190c]" />
        <div className="absolute bottom-0 right-0 w-[38%] h-[8%] bg-gradient-to-t from-[#442714] to-[#804e2c] border-t-4 border-[#2f190c]" />

        {/* Souq South Main Entrance Archway (Gate threshold) */}
        <div className="absolute bottom-0 left-[38%] right-[38%] h-[8%] bg-[#96633b] border-t-2 border-[#E6C280]/50 flex items-center justify-center shadow-inner">
          <div className="flex items-center gap-2 bg-[#8A1538] px-4 py-1 rounded-full border border-[#E6C280]/70 shadow-lg">
            <span className="text-xs font-bold text-[#FAF5EA] tracking-wider">
              بوابة الدخول الرئيسية
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 1. دكان الفخار (North-West Architectural Stall)                      */}
        {/* =================================================================== */}
        <div
          id="shop-pottery"
          className={`absolute left-[14%] top-[16%] w-[23%] h-[26%] transition-all duration-700 ${
            isNearPottery ? 'filter drop-shadow-[0_0_25px_rgba(230,194,128,0.55)]' : ''
          }`}
        >
          {/* Adobe Building Block with Crenellated Cap */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#6c3e21] via-[#85502c] to-[#9c6339] border-2 border-[#452512] rounded-br-3xl shadow-[0_15px_25px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Hand-crafted Adobe Texture */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3a1e0d_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Deep Shadowed Shop Interior Arch (العقد الطيني) */}
            <div className="absolute right-4 top-10 w-[72%] h-[68%] bg-[#1c0e06] rounded-t-full border-t-4 border-x-4 border-[#4d2813] shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Inner Wooden Shelves (الرفوف الخشبية القديمة) */}
              <div className="absolute inset-x-2 top-8 h-1 bg-[#42220f] shadow" />
              <div className="absolute inset-x-2 top-16 h-1 bg-[#42220f] shadow" />

              {/* Jars on Shelves inside shop depth */}
              <div className="absolute top-3 left-3 flex gap-2">
                <div className="w-5 h-7 bg-[#b86938] rounded-t-md rounded-b-xl border border-[#7a3b16] shadow-sm" />
                <div className="w-4 h-6 bg-[#944e26] rounded-t-md rounded-b-xl border border-[#632e12] shadow-sm" />
                <div className="w-6 h-7 bg-[#c27643] rounded-t-md rounded-b-xl border border-[#7a3b16] shadow-sm" />
              </div>
              <div className="absolute top-11 left-4 flex gap-3">
                <div className="w-4 h-5 bg-[#824422] rounded-full border border-[#52250e]" />
                <div className="w-5 h-5 bg-[#ab5f30] rounded-full border border-[#693114]" />
                <div className="w-4 h-5 bg-[#c27643] rounded-full border border-[#7a3b16]" />
              </div>
            </div>

            {/* Traditional Timber Door (باب خشب الساج مع مسامير حديدية) */}
            <div className="absolute left-2 top-10 w-9 h-[72%] bg-[#361a0b] border-r-2 border-t-2 border-[#200f06] flex flex-col justify-around py-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1 h-3 rounded bg-black/60" />
            </div>

            {/* Hanging Shop Signboard: Wooden plaque with carved gold text */}
            <div className="absolute top-2 right-4 bg-[#2d1509] px-3 py-1 rounded-md border border-[#E6C280]/70 shadow-md flex items-center gap-1.5">
              <span className="text-sm">🏺</span>
              <span className="text-xs font-bold text-[#E6C280] tracking-wide">دكان الفخار</span>
            </div>
          </div>

          {/* Maroon & White Striped Fabric Awning (مظلة قماشية عنابية وبيضاء مقلمة) */}
          <div className="absolute -top-2 left-[-4%] right-[-4%] h-8 z-20 pointer-events-none">
            <div className="w-full h-6 rounded-t-sm shadow-[0_8px_12px_rgba(0,0,0,0.6)] flex overflow-hidden border-b-2 border-[#541223]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`pottery-stripe-${i}`}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } shadow-inner`}
                />
              ))}
            </div>
            {/* Scalloped Awning Fringe */}
            <div className="flex w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`pottery-scallop-${i}`}
                  className={`flex-1 h-2.5 rounded-b-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } border-b border-[#3b0d19]`}
                />
              ))}
            </div>
          </div>

          {/* Wooden Front Display Counter with 3D Pottery (طاولة عرض الفخار والدلال) */}
          <div className="absolute -bottom-8 left-3 right-3 h-9 bg-[#4a2612] border-t-2 border-[#8c502b] rounded-md shadow-2xl flex items-end justify-between px-3 pb-1 z-20">
            {/* Big Water Cooling Urn (حِب الماء التراثي الكبير) */}
            <div className="relative -top-2 flex flex-col items-center">
              <div className="w-8 h-10 bg-gradient-to-b from-[#bd6f3d] via-[#a65d30] to-[#783e1c] rounded-t-lg rounded-b-2xl border border-[#52270f] shadow-lg flex items-center justify-center">
                <div className="w-6 h-0.5 bg-[#401c09] opacity-60" />
              </div>
              <span className="text-[9px] font-bold text-[#f7e4be] mt-0.5">الحِب</span>
            </div>

            {/* Clay Pots & Jars (جرار وأواني فخارية) */}
            <div className="flex items-end gap-1.5 -top-1 relative">
              <div className="w-6 h-8 bg-gradient-to-b from-[#c47746] to-[#874620] rounded-t-md rounded-b-xl border border-[#5c2d13] shadow" />
              <div className="w-5 h-6 bg-gradient-to-b from-[#a35b2e] to-[#6e3717] rounded-full border border-[#4a220c] shadow" />
            </div>

            {/* Polished Brass Dallah (دلة نحاسية تراثية) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-6 h-9 bg-gradient-to-b from-[#f9d77e] via-[#e6b647] to-[#997321] rounded-t-sm rounded-b-lg border border-[#694d12] shadow-md relative">
                {/* Spout and Handle */}
                <div className="absolute -left-1.5 top-1 w-2 h-4 border-l-2 border-t-2 border-[#694d12] rounded-tl-md" />
                <div className="absolute -right-2 top-2 w-2 h-4 border-r-2 border-y-2 border-[#694d12] rounded-r-md" />
              </div>
              <span className="text-[9px] font-bold text-[#f7e4be] mt-0.5">دلة</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. دكان العطّار (North-East Architectural Stall)                      */}
        {/* =================================================================== */}
        <div
          id="shop-spices"
          className={`absolute right-[14%] top-[16%] w-[23%] h-[26%] transition-all duration-700 ${
            isNearSpices ? 'filter drop-shadow-[0_0_25px_rgba(230,194,128,0.55)]' : ''
          }`}
        >
          {/* Adobe Building Block */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#6c3e21] via-[#85502c] to-[#9c6339] border-2 border-[#452512] rounded-bl-3xl shadow-[0_15px_25px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3a1e0d_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Arched Interior with Apothecary Jars & Spices */}
            <div className="absolute left-4 top-10 w-[72%] h-[68%] bg-[#1c0e06] rounded-t-full border-t-4 border-x-4 border-[#4d2813] shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Shelves with spice apothecary jars */}
              <div className="absolute inset-x-2 top-8 h-1 bg-[#42220f] shadow" />
              <div className="absolute inset-x-2 top-16 h-1 bg-[#42220f] shadow" />

              {/* Rows of Glass Jars with saffron, cloves, cinnamon */}
              <div className="absolute top-2.5 left-3 flex gap-2">
                <div className="w-4 h-6 bg-[#f39c12]/90 rounded-sm border border-[#e67e22] shadow" title="زعفران" />
                <div className="w-4 h-6 bg-[#27ae60]/90 rounded-sm border border-[#1e8449] shadow" title="هيل" />
                <div className="w-4 h-6 bg-[#d35400]/90 rounded-sm border border-[#a04000] shadow" title="قرفة" />
                <div className="w-4 h-6 bg-[#3d2314] rounded-sm border border-[#1a0f08] shadow" title="قرنفل" />
              </div>
              <div className="absolute top-11 left-3 flex gap-2">
                <div className="w-4 h-5 bg-[#c0392b]/90 rounded-sm border border-[#962d22]" />
                <div className="w-4 h-5 bg-[#f1c40f]/90 rounded-sm border border-[#d4ac0d]" />
                <div className="w-4 h-5 bg-[#8e44ad]/90 rounded-sm border border-[#6c3483]" />
              </div>
            </div>

            {/* Timber Door with Studs */}
            <div className="absolute right-2 top-10 w-9 h-[72%] bg-[#361a0b] border-l-2 border-t-2 border-[#200f06] flex flex-col justify-around py-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1 h-3 rounded bg-black/60" />
            </div>

            {/* Shop Signboard */}
            <div className="absolute top-2 left-4 bg-[#2d1509] px-3 py-1 rounded-md border border-[#E6C280]/70 shadow-md flex items-center gap-1.5">
              <span className="text-sm">🌿</span>
              <span className="text-xs font-bold text-[#E6C280] tracking-wide">دكان العطّار</span>
            </div>
          </div>

          {/* Maroon & White Striped Canopy */}
          <div className="absolute -top-2 left-[-4%] right-[-4%] h-8 z-20 pointer-events-none">
            <div className="w-full h-6 rounded-t-sm shadow-[0_8px_12px_rgba(0,0,0,0.6)] flex overflow-hidden border-b-2 border-[#541223]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`spices-stripe-${i}`}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } shadow-inner`}
                />
              ))}
            </div>
            <div className="flex w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`spices-scallop-${i}`}
                  className={`flex-1 h-2.5 rounded-b-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } border-b border-[#3b0d19]`}
                />
              ))}
            </div>
          </div>

          {/* Front Spice Sacks (أكياس توابل خيش ملونة ومفتوحة) & Antique Balance Scale */}
          <div className="absolute -bottom-8 left-3 right-3 h-9 bg-[#4a2612] border-t-2 border-[#8c502b] rounded-md shadow-2xl flex items-end justify-between px-2 pb-1 z-20">
            {/* Saffron Sack (زعفران) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-7 h-8 bg-[#b89569] rounded-b-lg rounded-t-sm border border-[#755938] shadow-md flex items-start justify-center pt-1">
                <div className="w-5 h-3 bg-[#e67e22] rounded-full shadow-inner" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be]">زعفران</span>
            </div>

            {/* Cardamom Sack (هيل) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-7 h-8 bg-[#b89569] rounded-b-lg rounded-t-sm border border-[#755938] shadow-md flex items-start justify-center pt-1">
                <div className="w-5 h-3 bg-[#27ae60] rounded-full shadow-inner" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be]">هيل</span>
            </div>

            {/* Cinnamon & Dried Lime Sack (قرفة ولومي) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-7 h-8 bg-[#b89569] rounded-b-lg rounded-t-sm border border-[#755938] shadow-md flex items-start justify-center pt-1">
                <div className="w-5 h-3 bg-[#8b4513] rounded-full shadow-inner" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be]">قرفة</span>
            </div>

            {/* Antique Two-Pan Balance Scale (ميزان قديم) */}
            <div className="flex flex-col items-center -top-3 relative">
              <div className="w-7 h-8 flex flex-col items-center justify-between">
                <div className="w-1 h-3 bg-[#e6c280]" />
                <div className="w-6 h-0.5 bg-[#e6c280] flex justify-between">
                  <div className="w-2 h-1 bg-[#b8860b] rounded-b-full shadow" />
                  <div className="w-2 h-1 bg-[#b8860b] rounded-b-full shadow" />
                </div>
                <div className="w-2 h-3 bg-[#b8860b] rounded-b-md" />
              </div>
              <span className="text-[8px] font-bold text-[#E6C280]">ميزان</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. دكان الأقمشة والسلال (Mid-West Architectural Stall)               */}
        {/* =================================================================== */}
        <div
          id="shop-fabrics"
          className={`absolute left-[14%] top-[52%] w-[22%] h-[28%] transition-all duration-700 ${
            isNearFabrics ? 'filter drop-shadow-[0_0_25px_rgba(230,194,128,0.55)]' : ''
          }`}
        >
          <div className="relative w-full h-full bg-gradient-to-b from-[#6c3e21] via-[#85502c] to-[#9c6339] border-2 border-[#452512] rounded-r-3xl shadow-[0_15px_25px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3a1e0d_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Interior Arch with Draped Fabrics & Woven Baskets */}
            <div className="absolute right-3 top-10 w-[74%] h-[72%] bg-[#1c0e06] rounded-t-full border-t-4 border-x-4 border-[#4d2813] shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] p-2">
              {/* Draped Qatari Sadu & Bisht Textiles */}
              <div className="flex justify-around items-start h-full pt-4">
                <div className="w-6 h-16 bg-gradient-to-b from-[#8A1538] via-[#e6c280] to-[#8A1538] rounded shadow-md border border-[#FAF5EA]/30" title="قماش قطري مطرز" />
                <div className="w-6 h-16 bg-gradient-to-b from-[#1a1a1a] via-[#c49a45] to-[#1a1a1a] rounded shadow-md border border-[#c49a45]/50" title="بشت مذهب" />
                <div className="w-6 h-16 bg-gradient-to-b from-[#2e4053] via-[#aed6f1] to-[#2e4053] rounded shadow-md" title="حرير فاخر" />
              </div>
            </div>

            {/* Timber Door */}
            <div className="absolute left-2 top-10 w-8 h-[72%] bg-[#361a0b] border-r-2 border-t-2 border-[#200f06] flex flex-col justify-around py-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1 h-3 rounded bg-black/60" />
            </div>

            {/* Shop Signboard */}
            <div className="absolute top-2 right-4 bg-[#2d1509] px-3 py-1 rounded-md border border-[#E6C280]/70 shadow-md flex items-center gap-1.5">
              <span className="text-sm">🧺</span>
              <span className="text-xs font-bold text-[#E6C280] tracking-wide">دكان الأقمشة والسلال</span>
            </div>
          </div>

          {/* Maroon & Ivory Canopy */}
          <div className="absolute -top-2 left-[-4%] right-[-4%] h-8 z-20 pointer-events-none">
            <div className="w-full h-6 rounded-t-sm shadow-[0_8px_12px_rgba(0,0,0,0.6)] flex overflow-hidden border-b-2 border-[#541223]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`fabrics-stripe-${i}`}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } shadow-inner`}
                />
              ))}
            </div>
            <div className="flex w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`fabrics-scallop-${i}`}
                  className={`flex-1 h-2.5 rounded-b-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } border-b border-[#3b0d19]`}
                />
              ))}
            </div>
          </div>

          {/* Front Counter: Woven Palm Khous Baskets (سلال الخوص) & Textile Rolls */}
          <div className="absolute -bottom-8 left-3 right-3 h-9 bg-[#4a2612] border-t-2 border-[#8c502b] rounded-md shadow-2xl flex items-end justify-between px-3 pb-1 z-20">
            {/* Woven Khous Basket (سلة خوص تراثية) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#d4b277] border-2 border-[#94743c] flex items-center justify-center shadow-md">
                <div className="w-5 h-5 rounded-full border border-dashed border-[#5e471f]" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be] mt-0.5">سلال خوص</span>
            </div>

            {/* Hand Fan (مهفة سعف النخيل) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-7 h-7 bg-[#c9a363] rounded-tl-xl border border-[#7d5e23] shadow-md flex items-center justify-center">
                <span className="text-xs">🪭</span>
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be] mt-0.5">مهفة</span>
            </div>

            {/* Stacked Fabric Rolls (لفائف أقمشة) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="flex flex-col gap-0.5">
                <div className="w-8 h-2.5 bg-[#8A1538] rounded-full border border-[#f7e4be]/40 shadow-sm" />
                <div className="w-8 h-2.5 bg-[#d4af37] rounded-full border border-[#f7e4be]/40 shadow-sm" />
                <div className="w-8 h-2.5 bg-[#1b4f72] rounded-full border border-[#f7e4be]/40 shadow-sm" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be] mt-0.5">منسوجات</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. دكان الأدوات القديمة (Mid-East Architectural Stall)                */}
        {/* =================================================================== */}
        <div
          id="shop-antiques"
          className={`absolute right-[14%] top-[52%] w-[22%] h-[28%] transition-all duration-700 ${
            isNearAntiques ? 'filter drop-shadow-[0_0_25px_rgba(230,194,128,0.55)]' : ''
          }`}
        >
          <div className="relative w-full h-full bg-gradient-to-b from-[#6c3e21] via-[#85502c] to-[#9c6339] border-2 border-[#452512] rounded-l-3xl shadow-[0_15px_25px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3a1e0d_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Interior Arch with Antique Chests and Scales */}
            <div className="absolute left-3 top-10 w-[74%] h-[72%] bg-[#1c0e06] rounded-t-full border-t-4 border-x-4 border-[#4d2813] shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] p-2">
              <div className="flex justify-around items-center h-full">
                {/* Traditional Studded Chest inside */}
                <div className="w-12 h-10 bg-[#3d2011] rounded border-2 border-[#e6c280] shadow flex items-center justify-around px-1">
                  <div className="w-1 h-1 rounded-full bg-[#e6c280]" />
                  <div className="w-1 h-1 rounded-full bg-[#e6c280]" />
                  <div className="w-1 h-1 rounded-full bg-[#e6c280]" />
                </div>
                {/* Vintage Brass Lantern */}
                <div className="text-xl filter drop-shadow">🏮</div>
              </div>
            </div>

            {/* Timber Door */}
            <div className="absolute right-2 top-10 w-8 h-[72%] bg-[#361a0b] border-l-2 border-t-2 border-[#200f06] flex flex-col justify-around py-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E6C280]/70" />
              <div className="w-1 h-3 rounded bg-black/60" />
            </div>

            {/* Shop Signboard */}
            <div className="absolute top-2 left-4 bg-[#2d1509] px-3 py-1 rounded-md border border-[#E6C280]/70 shadow-md flex items-center gap-1.5">
              <span className="text-sm">🧰</span>
              <span className="text-xs font-bold text-[#E6C280] tracking-wide">دكان الأدوات القديمة</span>
            </div>
          </div>

          {/* Maroon & Ivory Canopy */}
          <div className="absolute -top-2 left-[-4%] right-[-4%] h-8 z-20 pointer-events-none">
            <div className="w-full h-6 rounded-t-sm shadow-[0_8px_12px_rgba(0,0,0,0.6)] flex overflow-hidden border-b-2 border-[#541223]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`antiques-stripe-${i}`}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } shadow-inner`}
                />
              ))}
            </div>
            <div className="flex w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`antiques-scallop-${i}`}
                  className={`flex-1 h-2.5 rounded-b-full ${
                    i % 2 === 0 ? 'bg-[#8A1538]' : 'bg-[#f4ebd9]'
                  } border-b border-[#3b0d19]`}
                />
              ))}
            </div>
          </div>

          {/* Front Counter: Wooden Mabeet Chest (صندوق مبيّت), Antique Scales, Old Trading Tools */}
          <div className="absolute -bottom-8 left-3 right-3 h-9 bg-[#4a2612] border-t-2 border-[#8c502b] rounded-md shadow-2xl flex items-end justify-between px-3 pb-1 z-20">
            {/* Authentic Mabeet Chest (صندوق مبيّت خشبي مزين بالنحاس) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-10 h-7 bg-gradient-to-b from-[#42210e] to-[#261307] rounded-sm border border-[#e6c280] shadow-md flex flex-col justify-between p-1">
                <div className="flex justify-between">
                  <div className="w-1 h-1 rounded-full bg-[#e6c280]" />
                  <div className="w-1.5 h-1.5 bg-[#e6c280] rounded-sm" />
                  <div className="w-1 h-1 rounded-full bg-[#e6c280]" />
                </div>
                <div className="w-full h-0.5 bg-[#e6c280]/60" />
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be] mt-0.5">صندوق مبيّت</span>
            </div>

            {/* Merchant's Antique Scale & Measure (ميزان وأدوات بيع قديمة) */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-7 h-7 flex items-center justify-center">
                <span className="text-xl">⚖️</span>
              </div>
              <span className="text-[8px] font-bold text-[#E6C280]">ميزان تجاري</span>
            </div>

            {/* Brass Finial Lamp & Antique Keys */}
            <div className="flex flex-col items-center -top-2 relative">
              <div className="w-6 h-7 flex items-center justify-center">
                <span className="text-lg">🏮</span>
              </div>
              <span className="text-[8px] font-bold text-[#f7e4be]">فانوس</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 5. ركن الصقّار (North Center Authentic Falconry Quarter)             */}
        {/* =================================================================== */}
        <div
          id="shop-falconer"
          className={`absolute left-[40%] right-[40%] top-[16%] h-[18%] transition-all duration-700 z-15 ${
            isNearFalconer ? 'filter drop-shadow-[0_0_28px_rgba(230,194,128,0.65)]' : ''
          }`}
        >
          {/* Traditional Sadu Seating Area (مجلس سدو قطري مريح) */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#8A1538] to-[#590e24] rounded-2xl border-2 border-[#E6C280] shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-2 flex flex-col items-center justify-between">
            {/* Geometric Sadu Pattern Border */}
            <div
              className="absolute inset-1.5 border border-dashed border-[#FAF5EA]/50 rounded-xl pointer-events-none opacity-80"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(230,194,128,0.2) 0, rgba(230,194,128,0.2) 6px, transparent 6px, transparent 12px)`,
              }}
            />

            {/* Top Signboard */}
            <div className="relative z-10 bg-[#2d1509] px-3 py-0.5 rounded-full border border-[#E6C280] shadow flex items-center gap-1.5">
              <span className="text-xs">🦅</span>
              <span className="text-xs font-bold text-[#E6C280]">٥. ركن الصقّار</span>
            </div>

            {/* The Falconer Setup: Saker Falcon on Carved Wooden Perch (مجثم) & Falconer Glove */}
            <div className="relative z-10 flex items-center justify-around w-full px-2">
              {/* Traditional Falconer Leather Glove (الدس / المنقلة) & Lure (التلواح) */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-8 bg-gradient-to-b from-[#8c5025] to-[#47250e] rounded-t-lg rounded-b-sm border border-[#d4a373] shadow flex items-center justify-center">
                  <span className="text-xs">🧤</span>
                </div>
                <span className="text-[8px] font-bold text-[#FAF5EA] mt-0.5">الدس والتلوّاح</span>
              </div>

              {/* Majestic Falcon (صقر حر) on Hand-Carved Perch (المجثم التراثي) */}
              <div className="flex flex-col items-center">
                {/* Falcon Perched with Golden Hue */}
                <div className="relative flex items-center justify-center">
                  <span className="text-3xl filter drop-shadow-lg animate-pulse">🦅</span>
                  {/* Leather Hood (البرقع) Accent */}
                  <div className="absolute top-1 w-2.5 h-2 bg-[#8A1538] rounded-full border border-[#E6C280]/80 opacity-90" />
                </div>

                {/* Wooden Perch (المجثم الخشبي مع وسادة العشب) */}
                <div className="w-10 h-2 bg-[#2d6a4f] rounded-full border border-[#E6C280] shadow" />
                <div className="w-2.5 h-6 bg-[#3d2314] border-x border-[#1a0e08] shadow" />
                <div className="w-12 h-2 bg-[#52311c] rounded-full border border-[#3d2314] shadow" />

                <span className="text-[9px] font-bold text-[#FAF5EA] mt-0.5 drop-shadow">
                  صقر على مجثم
                </span>
              </div>

              {/* Sadu Floor Cushion (مسند ومخدة سدو) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-7 bg-[#8A1538] rounded-md border border-[#E6C280] shadow flex flex-col justify-around py-0.5 items-center">
                  <div className="w-6 h-1 bg-[#FAF5EA]/70" />
                  <div className="w-6 h-1 bg-[#E6C280]/80" />
                </div>
                <span className="text-[8px] font-bold text-[#FAF5EA] mt-0.5">مسند سدو</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* ATMOSPHERIC HANGING LANTERNS (فوانيس متدلية بإضاءة دافئة)            */}
        {/* ------------------------------------------------------------------- */}
        {/* West Side Alley Lanterns */}
        <div className="absolute left-[34%] top-[30%] z-30 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-12 bg-[#2b170d]" />
          <div className="w-7 h-9 bg-[#f39c12]/25 rounded-full border border-[#e6c280] flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.7)]">
            <span className="text-base">🏮</span>
          </div>
        </div>
        <div className="absolute left-[34%] top-[68%] z-30 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-12 bg-[#2b170d]" />
          <div className="w-7 h-9 bg-[#f39c12]/25 rounded-full border border-[#e6c280] flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.7)]">
            <span className="text-base">🏮</span>
          </div>
        </div>

        {/* East Side Alley Lanterns */}
        <div className="absolute right-[34%] top-[30%] z-30 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-12 bg-[#2b170d]" />
          <div className="w-7 h-9 bg-[#f39c12]/25 rounded-full border border-[#e6c280] flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.7)]">
            <span className="text-base">🏮</span>
          </div>
        </div>
        <div className="absolute right-[34%] top-[68%] z-30 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-12 bg-[#2b170d]" />
          <div className="w-7 h-9 bg-[#f39c12]/25 rounded-full border border-[#e6c280] flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.7)]">
            <span className="text-base">🏮</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PLAYER CHARACTER (Same CharacterAvatar from VillageScene)          */}
        {/* ------------------------------------------------------------------- */}
        <div
          id="souq-player"
          className="absolute z-40 transition-none pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -85%)',
          }}
        >
          {/* Subtle foot shadow for 2.5D depth */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-4 bg-black/45 rounded-full blur-[2px]" />

          {/* Animated Avatar */}
          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={false}
          />

          {/* Player name indicator */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#261309]/85 px-2 py-0.5 rounded-full border border-[#E6C280]/50 text-[10px] font-bold text-[#FAF5EA] shadow-md">
            أنت هنا
          </div>
        </div>

        {/* Cinematic Warm Golden Hour Sunbeams & Atmospheric Dust */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#e6c280]/15 via-transparent to-[#8A1538]/15 pointer-events-none mix-blend-screen"
        />
      </div>

      {/* ===================================================================== */}
      {/* TOUCH CONTROLS (VIRTUAL D-PAD FOR MOBILE / TABLET - PRESERVED)       */}
      {/* ===================================================================== */}
      <div className="absolute bottom-6 left-6 z-50 md:hidden pointer-events-auto">
        <div className="relative w-36 h-36 bg-[#261309]/85 backdrop-blur-md rounded-full border-2 border-[#E6C280]/50 shadow-2xl p-2 flex items-center justify-center">
          {/* Up */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('up')}
            onMouseUp={handleTouchEnd}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#8A1538] active:bg-[#a31a43] rounded-t-xl text-white font-bold flex items-center justify-center shadow"
          >
            ▲
          </button>

          {/* Down */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('down')}
            onMouseUp={handleTouchEnd}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#8A1538] active:bg-[#a31a43] rounded-b-xl text-white font-bold flex items-center justify-center shadow"
          >
            ▼
          </button>

          {/* Left */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={handleTouchEnd}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8A1538] active:bg-[#a31a43] rounded-l-xl text-white font-bold flex items-center justify-center shadow"
          >
            ◄
          </button>

          {/* Right */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={handleTouchEnd}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8A1538] active:bg-[#a31a43] rounded-r-xl text-white font-bold flex items-center justify-center shadow"
          >
            ►
          </button>

          {/* Center Hub */}
          <div className="w-8 h-8 rounded-full bg-[#E6C280]/40 border border-[#FAF5EA]/50 flex items-center justify-center text-[10px] text-[#FAF5EA] font-bold">
            ✥
          </div>
        </div>
      </div>

      {/* Desktop Keyboard Hints (Bottom-Right - PRESERVED) */}
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
