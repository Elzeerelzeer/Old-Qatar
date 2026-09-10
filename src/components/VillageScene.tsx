import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CharacterGender, 
  StationId, 
  GameSettings, 
  Direction, 
  StationData 
} from '../types';
import { STATIONS_DATA } from '../data/stationsData';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';
import { 
  DoorOpen, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface VillageSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onEnterStation: (stationId: StationId) => void;
  stampedStations: Record<StationId, boolean>;
  onResetPositionRef?: (fn: () => void) => void;
}

interface CollisionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Master visual image paths (supports jpg, png, or webp)
const MASTER_IMAGE_PATH = '/assets/village/qatar_lowwal_village_master.jpg';
const MASTER_IMAGE_FALLBACK = '/assets/village/qatar_lowwal_village_master.png';

// Precise invisible collision boxes matching the master artwork layout:
// Blocks buildings, walls, trees, sea, and decor.
// Leaves roads, central plaza, and entrance zones fully walkable.
const OBSTACLE_BOXES: CollisionBox[] = [
  // 1. Souq building & stall canopies (top-left)
  { x1: 7, y1: 18, x2: 34, y2: 38 },
  // 2. Pearl Sea water & boat dock edges (top-center, leaving pier passage at x:46-54)
  { x1: 34, y1: 10, x2: 46, y2: 24 },
  { x1: 54, y1: 10, x2: 66, y2: 24 },
  // 3. Fereej Games courtyard walls & palm frond shade (top-right)
  { x1: 68, y1: 18, x2: 93, y2: 36 },
  // 4. House of Crafts workshop building (mid-left)
  { x1: 7, y1: 50, x2: 34, y2: 67 },
  // 5. Majlis Lowwal building & colonnade (mid-right)
  { x1: 68, y1: 50, x2: 93, y2: 67 },
  // 6. Akkas Studio building (bottom-right)
  { x1: 68, y1: 74, x2: 93, y2: 86 },
  // 7. Fortress Gate flank walls and watchtowers (bottom-left and bottom-right)
  // Leaves central gate opening at x: 44 to 56 wide open for entry!
  { x1: 4, y1: 84, x2: 43, y2: 96 },
  { x1: 57, y1: 84, x2: 96, y2: 96 },
  // 8. Central Sidra Tree trunk & Stone Well rim (center obstacle)
  { x1: 48, y1: 49, x2: 52, y2: 54 },
];

export const VillageScene: React.FC<VillageSceneProps> = ({
  gender,
  settings,
  onEnterStation,
  stampedStations,
  onResetPositionRef,
}) => {
  // Player coordinates (0 to 100 percent of the village world)
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(86);
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Proximity highlight
  const [nearbyStation, setNearbyStation] = useState<StationData | null>(null);

  // Camera coordinates (for smooth following)
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Abu Rashid Welcome Bubble (4 seconds duration, then fades out)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Keyboard navigation detection
  const [hasUsedKeyboard, setHasUsedKeyboard] = useState(false);

  // Image source state with fallback support
  const [imageSrc, setImageSrc] = useState(MASTER_IMAGE_PATH);

  // Refs for animation loop
  const activeKeysRef = useRef<Record<string, boolean>>({});
  const touchDirectionRef = useRef<Direction | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastFootstepTimeRef = useRef<number>(0);
  const lastNearbyStationIdRef = useRef<string | null>(null);

  // Automatically fade out Abu Rashid welcome message after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Reset character to central plaza
  const resetToCenter = useCallback(() => {
    setPosX(50);
    setPosY(60);
    setDirection('down');
    setIsMoving(false);
  }, []);

  useEffect(() => {
    if (onResetPositionRef) {
      onResetPositionRef(resetToCenter);
    }
  }, [onResetPositionRef, resetToCenter]);

  // Ambient sea sounds
  useEffect(() => {
    if (settings.isSoundEnabled) {
      soundManager.startAmbientSea();
    }
    return () => {
      soundManager.stopAmbientSea();
    };
  }, [settings.isSoundEnabled]);

  // Collision checking against boundaries & obstacles
  const checkCollision = (nextX: number, nextY: number): boolean => {
    // Village outer boundaries:
    // Left/Right limits
    if (nextX < 6 || nextX > 94) return true;
    // Bottom gate boundary
    if (nextY > 88) return true;
    // Top sea boundary (can only go to y: 22 near pier at x: 46-54, otherwise sea stops at y: 24)
    if (nextY < 24) {
      const atPier = nextX >= 45 && nextX <= 55 && nextY >= 21;
      if (!atPier) return true;
    }

    const charRadius = 1.8;
    for (const box of OBSTACLE_BOXES) {
      if (
        nextX + charRadius > box.x1 &&
        nextX - charRadius < box.x2 &&
        nextY + charRadius > box.y1 &&
        nextY - charRadius < box.y2
      ) {
        return true;
      }
    }
    return false;
  };

  const handleEnterStation = useCallback((id: StationId) => {
    setIsCelebrating(true);
    soundManager.playDoorOpen();
    setTimeout(() => {
      setIsCelebrating(false);
      onEnterStation(id);
    }, 380);
  }, [onEnterStation]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      activeKeysRef.current[e.key.toLowerCase()] = true;
      activeKeysRef.current[e.code] = true;
      setHasUsedKeyboard(true);

      // Enter or Space key enters station if nearby
      if ((e.key === 'Enter' || e.key === ' ') && nearbyStation) {
        handleEnterStation(nearbyStation.id);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeysRef.current[e.key.toLowerCase()] = false;
      activeKeysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyStation, handleEnterStation]);

  // Main game loop with smooth camera follow
  useEffect(() => {
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const keys = activeKeysRef.current;
      const touchDir = touchDirectionRef.current;

      let dx = 0;
      let dy = 0;

      const moveUp = keys['arrowup'] || keys['keyw'] || touchDir === 'up';
      const moveDown = keys['arrowdown'] || keys['keys'] || touchDir === 'down';
      const moveLeft = keys['arrowleft'] || keys['keya'] || touchDir === 'left';
      const moveRight = keys['arrowright'] || keys['keyd'] || touchDir === 'right';

      if (moveUp) dy -= 1;
      if (moveDown) dy += 1;
      if (moveLeft) dx -= 1;
      if (moveRight) dx += 1;

      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        const baseSpeed = settings.walkSpeed === 'calm' ? 14 : 22;
        const moveDistX = dx * baseSpeed * dt;
        const moveDistY = dy * baseSpeed * dt;

        let nextX = posX;
        if (!checkCollision(posX + moveDistX, posY)) {
          nextX = posX + moveDistX;
        }

        let nextY = posY;
        if (!checkCollision(nextX, posY + moveDistY)) {
          nextY = posY + moveDistY;
        } else if (!checkCollision(posX, posY + moveDistY)) {
          nextY = posY + moveDistY;
        }

        setPosX(nextX);
        setPosY(nextY);
        setIsMoving(true);

        if (Math.abs(dy) > Math.abs(dx)) {
          setDirection(dy > 0 ? 'down' : 'up');
        } else if (dx !== 0) {
          setDirection(dx > 0 ? 'right' : 'left');
        }

        // Footsteps sound
        if (settings.isSoundEnabled && time - lastFootstepTimeRef.current > 380) {
          soundManager.playFootstep();
          lastFootstepTimeRef.current = time;
        }
      } else {
        setIsMoving(false);
      }

      // Smooth Camera Follow:
      // Target camera offset keeps player centered with responsive range.
      const targetCamX = (50 - posX) * 0.42;
      const targetCamY = (50 - posY) * 0.42;

      setCamera((prev) => ({
        x: prev.x + (targetCamX - prev.x) * 0.08,
        y: prev.y + (targetCamY - prev.y) * 0.08,
      }));

      // Proximity detection for stations
      const stations = Object.values(STATIONS_DATA);
      let closest: StationData | null = null;
      let minDistance = 999;

      for (const st of stations) {
        const dist = Math.hypot(posX - st.doorX, posY - st.doorY);
        if (dist < 11 && dist < minDistance) {
          minDistance = dist;
          closest = st;
        }
      }

      if (closest !== nearbyStation) {
        setNearbyStation(closest);
        if (closest && closest.id !== lastNearbyStationIdRef.current) {
          soundManager.playProximityChime();
          lastNearbyStationIdRef.current = closest.id;
        } else if (!closest) {
          lastNearbyStationIdRef.current = null;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [posX, posY, nearbyStation, settings.walkSpeed, settings.isSoundEnabled]);

  const handleTouchStart = (dir: Direction) => {
    touchDirectionRef.current = dir;
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
  };

  return (
    <div
      ref={viewportRef}
      id="village-interactive-viewport"
      className="relative w-full h-screen overflow-hidden bg-[#180d07] select-none text-[#FAF5EA]"
    >
      {/* ======================================================== */}
      {/* 2.5D ISOMETRIC VILLAGE WORLD CONTAINER WITH CAMERA FOLLOW */}
      {/* ======================================================== */}
      <div
        id="village-world-container"
        className="absolute inset-[-25%] w-[150%] h-[150%] sm:inset-[-20%] sm:w-[140%] sm:h-[140%] transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(${camera.x}%, ${camera.y}%, 0)`,
        }}
      >
        {/* ---------------------------------------------------- */}
        {/* MASTER VISUAL ENVIRONMENT LAYER (REFERENCE ARTWORK)  */}
        {/* ---------------------------------------------------- */}
        <div 
          id="village-master-artwork-layer"
          className="relative w-full h-full pointer-events-none"
        >
          <img
            src={imageSrc}
            alt="قرية قطر لوّل التراثية"
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
            onError={() => {
              if (imageSrc !== MASTER_IMAGE_FALLBACK) {
                setImageSrc(MASTER_IMAGE_FALLBACK);
              }
            }}
          />

          {/* Subtle Warm Atmospheric Ambient Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e08]/30 via-transparent to-[#FFE082]/10 mix-blend-soft-light pointer-events-none" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* INVISIBLE INTERACTION LAYER (HOTSPOTS & GOLDEN GLOW) */}
        {/* ---------------------------------------------------- */}
        <div id="village-hotspots-layer" className="absolute inset-0 pointer-events-none">
          {Object.values(STATIONS_DATA).map((station) => {
            const isNear = nearbyStation?.id === station.id;
            const isDone = stampedStations[station.id];

            return (
              <div
                key={station.id}
                id={`hotspot-${station.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${station.doorX}%`,
                  top: `${station.doorY}%`,
                }}
              >
                {/* 1. Golden Glow Pulse over the real entrance when approached */}
                {isNear && (
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    {/* Deep soft radial gold bloom */}
                    <div className="absolute -inset-10 rounded-full bg-[#FBBF24]/35 blur-xl animate-pulse pointer-events-none" />
                    {/* Golden entrance beacon ring */}
                    <div className="absolute -inset-6 rounded-full border-2 border-[#FFE082]/80 shadow-[0_0_20px_#FBBF24] animate-ping opacity-75 pointer-events-none" />
                    <div className="absolute -inset-2 rounded-full bg-[#FFE082]/30 blur-sm pointer-events-none" />
                  </div>
                )}

                {/* Stamped Badge Marker (Subtle indicator if already visited) */}
                {isDone && !isNear && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8A1538]/70 border border-[#FFE082]/40 text-[10px] text-[#FFE082] font-bold shadow-sm backdrop-blur-xs">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>مكتمل</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* CHARACTER LAYER (INDEPENDENT LAYER ABOVE ARTWORK)    */}
        {/* ---------------------------------------------------- */}
        <div
          id="player-character-token"
          className="absolute z-30 pointer-events-none transition-all duration-75"
          style={{
            left: `${posX}%`,
            top: `${posY}%`,
            transform: 'translate(-50%, -88%)',
          }}
        >
          {/* Walking dust puff */}
          {isMoving && !settings.isQuietMode && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-2 bg-[#d4a769]/50 rounded-full blur-[1.5px] animate-ping" />
          )}

          {/* Soft Ground Ambient Occlusion Shadow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/45 rounded-full blur-[2px] pointer-events-none" />

          {/* 3D Stylized Character Avatar */}
          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={isCelebrating}
            size={52}
          />
        </div>

        {/* ---------------------------------------------------- */}
        {/* FLOATING INTERACTION BUTTON: «ادخل»                   */}
        {/* ---------------------------------------------------- */}
        {nearbyStation && (
          <div
            id="station-proximity-callout"
            onClick={() => handleEnterStation(nearbyStation.id)}
            className="absolute z-40 cursor-pointer animate-bounce"
            style={{
              left: `${nearbyStation.doorX}%`,
              top: `${nearbyStation.doorY - 6}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A1538]/95 border-2 border-[#FFE082] shadow-[0_8px_24px_rgba(0,0,0,0.85)] text-white hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              aria-label={`ادخل إلى ${nearbyStation.title}`}
            >
              <DoorOpen className="w-4 h-4 text-[#FFE082]" />
              <span className="text-xs sm:text-sm font-black text-[#FFE082]">
                ادخل
              </span>
              <span className="text-xs font-bold text-white">
                {nearbyStation.title}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ABU RASHID WELCOME BUBBLE (FADES OUT AFTER 4 SECONDS)    */}
      {/* Small top speech bubble as requested                     */}
      {/* ======================================================== */}
      {showWelcomeMessage && (
        <aside
          aria-label="رسالة أبو راشد"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-45 max-w-sm sm:max-w-md w-[90%] transition-all duration-700 pointer-events-none animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#1c0e07]/85 border border-[#E6C280]/40 shadow-[0_8px_24px_rgba(0,0,0,0.65)] backdrop-blur-md">
            {/* Abu Rashid Icon */}
            <div className="w-8 h-8 rounded-full bg-[#8A1538] border border-[#FFE082] flex items-center justify-center text-sm shadow shrink-0">
              👴🏻
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-[#FFE082]">
                أبو راشد:
              </div>
              <div className="text-xs text-[#FAF5EA] font-semibold">
                «هنا تلتقي قصص الأمس بأحلام الغد.»
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* COMPACT TRANSLUCENT TOUCH D-PAD (BOTTOM-LEFT CORNER)     */}
      {/* Compact & High Translucency to not obstruct the scenery  */}
      {/* ======================================================== */}
      <div
        id="compact-touch-dpad"
        className="fixed bottom-3 left-3 z-40 flex items-end gap-2 pointer-events-auto select-none"
      >
        <div className="relative w-20 h-20 rounded-full bg-[#120804]/20 border border-[#E6C280]/15 p-1 shadow-md backdrop-blur-xs">
          {/* Up */}
          <button
            id="dpad-btn-up"
            onPointerDown={() => handleTouchStart('up')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-md bg-[#381c0d]/40 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082]/90 shadow cursor-pointer active:scale-90"
            aria-label="تحرك للأعلى"
          >
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
          </button>

          {/* Down */}
          <button
            id="dpad-btn-down"
            onPointerDown={() => handleTouchStart('down')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-md bg-[#381c0d]/40 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082]/90 shadow cursor-pointer active:scale-90"
            aria-label="تحرك للأسفل"
          >
            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
          </button>

          {/* Left */}
          <button
            id="dpad-btn-left"
            onPointerDown={() => handleTouchStart('left')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-[#381c0d]/40 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082]/90 shadow cursor-pointer active:scale-90"
            aria-label="تحرك لليسار"
          >
            <ArrowLeft className="w-3 h-3 stroke-[2.5]" />
          </button>

          {/* Right */}
          <button
            id="dpad-btn-right"
            onPointerDown={() => handleTouchStart('right')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-[#381c0d]/40 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082]/90 shadow cursor-pointer active:scale-90"
            aria-label="تحرك لليمين"
          >
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Action Button: When near a station, provides mobile entry shortcut */}
        {nearbyStation && (
          <button
            id="compact-enter-btn"
            onClick={() => handleEnterStation(nearbyStation.id)}
            className="px-3 py-2 rounded-full bg-[#8A1538]/90 border border-[#FFE082] text-white font-black text-xs shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <DoorOpen className="w-3.5 h-3.5 text-[#FFE082]" />
            <span>ادخل</span>
          </button>
        )}
      </div>

      {/* Subtle Desktop Keyboard Helper Tooltip */}
      {hasUsedKeyboard && (
        <div className="fixed bottom-3 right-4 z-30 hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#180d07]/40 border border-[#E6C280]/20 text-[11px] text-[#e0cfbd] backdrop-blur-xs pointer-events-none">
          <span className="text-[#FFE082] font-bold">التحكم:</span>
          <span>الأسهم أو WASD • مسافة أو Enter للدخول</span>
        </div>
      )}
    </div>
  );
};
