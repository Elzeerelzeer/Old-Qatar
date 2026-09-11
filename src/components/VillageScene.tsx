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
  CheckCircle2
} from 'lucide-react';

interface VillageSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onEnterStation: (stationId: StationId) => void;
  stampedStations: Record<StationId, boolean>;
  onResetPositionRef?: (fn: () => void) => void;
  initialPos?: { x: number; y: number; direction?: Direction };
}

interface MapRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Master visual map path requested by user (official clean map)
const MASTER_IMAGE_PATH = '/assets/a_wide_cinematic_high_detail_clean_game_map_st.png';

// ---------------------------------------------------------------------------
// INVISIBLE COLLISION MAP (خريطة التصادم غير المرئية)
// Strictly defines designated walkable pathways, alleys, courtyards, and plazas.
// Any location outside these zones (buildings, roofs, sea water, palm trees,
// and fortress walls) is completely impassable.
// ---------------------------------------------------------------------------
const WALKABLE_ZONES: MapRect[] = [
  // 1. Central South-North Grand Avenue (Continuous artery connecting Gate to Pearl Pier)
  { x1: 43.5, y1: 25.0, x2: 56.5, y2: 88.0 },

  // 2. Gateway Entrance Courtyard (in front of Qatar Lowwal Gate)
  { x1: 43.0, y1: 82.0, x2: 57.0, y2: 88.5 },

  // 3. Central Grand Plaza / Barahat Al-Sidra (Wide heritage gathering square)
  { x1: 32.0, y1: 48.0, x2: 68.0, y2: 68.0 },

  // 4. Northern Coastal Pier (Pearl Harbor / Wooden Boardwalk to Dhow)
  { x1: 45.0, y1: 25.0, x2: 55.0, y2: 35.0 },

  // 5. West-Branching Avenue to Souq Lowwal
  { x1: 18.0, y1: 38.0, x2: 48.0, y2: 47.0 },
  { x1: 18.0, y1: 38.0, x2: 32.0, y2: 48.0 }, // Souq entrance plaza

  // 6. East-Branching Avenue to Fereej Games (Open play courtyard)
  { x1: 52.0, y1: 37.0, x2: 80.0, y2: 46.0 },
  { x1: 68.0, y1: 36.0, x2: 80.0, y2: 46.0 }, // Games plaza

  // 7. West-Branching Avenue to House of Crafts (Beit Al-Heraf)
  { x1: 18.0, y1: 64.0, x2: 48.0, y2: 74.0 },
  { x1: 18.0, y1: 64.0, x2: 32.0, y2: 75.0 }, // Crafts workshop plaza

  // 8. East-Branching Avenue to Majlis Lowwal
  { x1: 52.0, y1: 64.0, x2: 76.0, y2: 74.0 },
  { x1: 64.0, y1: 64.0, x2: 76.0, y2: 74.0 }, // Majlis porch courtyard

  // 9. South-East Alley to Akkas Lowwal Studio
  { x1: 52.0, y1: 74.0, x2: 72.0, y2: 84.0 },
  { x1: 60.0, y1: 74.0, x2: 72.0, y2: 84.0 }, // Akkas front
];

// Obstacles located inside walkable zones (cutouts)
const OBSTACLE_CUTOUTS: MapRect[] = [
  // Ancient Sidra Tree trunk and Stone Well base in the center of the plaza
  { x1: 46.5, y1: 48.5, x2: 53.5, y2: 55.5 },
];

export const VillageScene: React.FC<VillageSceneProps> = ({
  gender,
  settings,
  onEnterStation,
  stampedStations,
  onResetPositionRef,
  initialPos,
}) => {
  // Player coordinates: Starts in front of «بوابة قطر لوّل» (or returned station door)
  const [posX, setPosX] = useState(initialPos?.x ?? 50);
  const [posY, setPosY] = useState(initialPos?.y ?? 87);
  const [direction, setDirection] = useState<Direction>(initialPos?.direction ?? 'up');
  const [isMoving, setIsMoving] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Mutable refs for physics loop to eliminate render thrashing
  const posRef = useRef({ x: initialPos?.x ?? 50, y: initialPos?.y ?? 87 });
  const nearbyStationRef = useRef<StationData | null>(null);

  // Responsive character size: Mobile +15% (~48px), Desktop & Interactive Smart Board +10% (~46px)
  const [isMobileScreen, setIsMobileScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const characterSize = isMobileScreen ? 48 : 46;

  // Proximity highlight
  const [nearbyStation, setNearbyStation] = useState<StationData | null>(null);

  // Camera coordinates (pixel offset for smooth following)
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const worldContainerRef = useRef<HTMLDivElement | null>(null);

  // Abu Rashid Welcome Bubble (4 seconds duration, then fades out)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Keyboard navigation detection
  const [hasUsedKeyboard, setHasUsedKeyboard] = useState(false);

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

  // Reset character to Qatar Lowwal Gate entrance
  const resetToGate = useCallback(() => {
    posRef.current = { x: 50, y: 87 };
    setPosX(50);
    setPosY(87);
    setDirection('up');
    setIsMoving(false);
  }, []);

  useEffect(() => {
    if (onResetPositionRef) {
      onResetPositionRef(resetToGate);
    }
  }, [onResetPositionRef, resetToGate]);

  // Ambient sea sounds
  useEffect(() => {
    if (settings.isSoundEnabled) {
      soundManager.startAmbientSea();
    }
    return () => {
      soundManager.stopAmbientSea();
    };
  }, [settings.isSoundEnabled]);

  // Invisible collision checking: Point must lie within designated walkways/plazas
  const isPointWalkable = (x: number, y: number): boolean => {
    // 1. Cutout obstacles inside plazas (Sidra tree trunk & stone well rim)
    for (const obs of OBSTACLE_CUTOUTS) {
      if (x >= obs.x1 && x <= obs.x2 && y >= obs.y1 && y <= obs.y2) {
        return false;
      }
    }

    // 2. Must reside within at least one valid walkable corridor, courtyard, or plaza
    for (const zone of WALKABLE_ZONES) {
      if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) {
        return true;
      }
    }

    // Outside designated paths (sea, buildings, trees, walls) is strictly impassable
    return false;
  };

  // Physical collision check with small margin (r = 0.6%) to prevent sprite penetrating walls
  const checkCollision = (nextX: number, nextY: number): boolean => {
    const r = 0.6;
    if (!isPointWalkable(nextX, nextY)) return true;
    if (!isPointWalkable(nextX - r, nextY)) return true;
    if (!isPointWalkable(nextX + r, nextY)) return true;
    if (!isPointWalkable(nextX, nextY - r)) return true;
    if (!isPointWalkable(nextX, nextY + r)) return true;
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

      if ((e.key === 'Enter' || e.key === ' ') && nearbyStationRef.current) {
        handleEnterStation(nearbyStationRef.current.id);
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
  }, [handleEnterStation]);

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

        // Natural, balanced walking speed (calm: 14, standard: 20)
        const baseSpeed = settings.walkSpeed === 'calm' ? 14 : 20;
        const moveDistX = dx * baseSpeed * dt;
        const moveDistY = dy * baseSpeed * dt;

        const curX = posRef.current.x;
        const curY = posRef.current.y;

        // Smooth wall sliding against obstacles
        let nextX = curX;
        if (!checkCollision(curX + moveDistX, curY)) {
          nextX = curX + moveDistX;
        }

        let nextY = curY;
        if (!checkCollision(nextX, curY + moveDistY)) {
          nextY = curY + moveDistY;
        } else if (!checkCollision(curX, curY + moveDistY)) {
          nextY = curY + moveDistY;
        }

        posRef.current = { x: nextX, y: nextY };
        setPosX(nextX);
        setPosY(nextY);
        setIsMoving(true);

        if (Math.abs(dy) > Math.abs(dx)) {
          setDirection(dy > 0 ? 'down' : 'up');
        } else if (dx !== 0) {
          setDirection(dx > 0 ? 'right' : 'left');
        }

        // Rhythmic footsteps audio
        const footstepInterval = settings.walkSpeed === 'calm' ? 420 : 340;
        if (settings.isSoundEnabled && time - lastFootstepTimeRef.current > footstepInterval) {
          soundManager.playFootstep();
          lastFootstepTimeRef.current = time;
        }
      } else {
        setIsMoving(false);
      }

      // Smooth Camera Follow calculation
      const containerEl = worldContainerRef.current;
      const viewportEl = viewportRef.current;

      if (containerEl && viewportEl) {
        const vW = viewportEl.clientWidth;
        const vH = viewportEl.clientHeight;
        const cW = containerEl.clientWidth;
        const cH = containerEl.clientHeight;

        // Character world pixel coordinates from ref
        const charPixelX = (posRef.current.x / 100) * cW;
        const charPixelY = (posRef.current.y / 100) * cH;

        // Centering target
        let targetCamX = (vW / 2) - charPixelX;
        let targetCamY = (vH / 2) - charPixelY;

        // Clamp camera so the village map always fills the viewport smoothly
        if (cW > vW) {
          targetCamX = Math.min(0, Math.max(vW - cW, targetCamX));
        } else {
          targetCamX = (vW - cW) / 2;
        }

        if (cH > vH) {
          targetCamY = Math.min(0, Math.max(vH - cH, targetCamY));
        } else {
          targetCamY = (vH - cH) / 2;
        }

        setCamera((prev) => {
          const diffX = targetCamX - prev.x;
          const diffY = targetCamY - prev.y;
          if (Math.abs(diffX) < 0.15 && Math.abs(diffY) < 0.15) {
            return prev;
          }
          return {
            x: prev.x + diffX * 0.1,
            y: prev.y + diffY * 0.1,
          };
        });
      }

      // Proximity detection for stations
      const stations = Object.values(STATIONS_DATA);
      let closest: StationData | null = null;
      let minDistance = 999;

      for (const st of stations) {
        const dist = Math.hypot(posRef.current.x - st.doorX, posRef.current.y - st.doorY);
        if (dist < 11 && dist < minDistance) {
          minDistance = dist;
          closest = st;
        }
      }

      if (closest?.id !== lastNearbyStationIdRef.current) {
        lastNearbyStationIdRef.current = closest?.id ?? null;
        nearbyStationRef.current = closest;
        setNearbyStation(closest);
        if (closest) {
          soundManager.playProximityChime();
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
  }, [settings.walkSpeed, settings.isSoundEnabled]);

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
      className="relative w-full h-screen overflow-hidden bg-black select-none text-[#FAF5EA]"
    >
      {/* ======================================================== */}
      {/* 2.5D VILLAGE WORLD CONTAINER WITH CAMERA FOLLOW          */}
      {/* Preserves aspect ratio 1672/941 without cropping/skewing */}
      {/* ======================================================== */}
      <div
        ref={worldContainerRef}
        id="village-world-container"
        className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          width: 'max(130vw, calc(125vh * 1.7768))',
          height: 'max(125vh, calc(130vw / 1.7768))',
          aspectRatio: '1672 / 941',
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0)`,
        }}
      >
        {/* ---------------------------------------------------- */}
        {/* MASTER VISUAL MAP LAYER                              */}
        {/* Directly loaded from master png file with object-fit */}
        {/* ---------------------------------------------------- */}
        <div 
          id="village-master-artwork-layer"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <img
            src={MASTER_IMAGE_PATH}
            alt="خريطة قرية قطر لوّل التراثية"
            className="w-full h-full object-contain pointer-events-none select-none block"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* ---------------------------------------------------- */}
        {/* INVISIBLE INTERACTION LAYER (6 TRANSPARENT HOTSPOTS) */}
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
                {/* Subtle golden glow when approaching the entrance */}
                {isNear && (
                  <div className="relative -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="absolute -inset-8 rounded-full bg-[#FFE082]/25 blur-xl pointer-events-none animate-pulse" />
                    <div className="absolute -inset-4 rounded-full bg-[#FBBF24]/30 blur-md pointer-events-none" />
                  </div>
                )}

                {/* Stamped Badge Marker (Subtle indicator if already completed) */}
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
        {/* CHARACTER LAYER (INDEPENDENT LAYER OVER MASTER MAP)  */}
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

          {/* Clear & Light Soft Ground Shadow to improve visibility on map */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-150"
            style={{
              width: `${Math.round(characterSize * 0.82)}px`,
              height: `${Math.max(6, Math.round(characterSize * 0.24))}px`,
              background: 'radial-gradient(ellipse at center, rgba(15, 8, 3, 0.44) 0%, rgba(20, 10, 4, 0.22) 55%, transparent 75%)',
              filter: 'blur(1.5px)',
            }}
          />

          {/* 3D Stylized Character Avatar - Proportional to village perspective */}
          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={isCelebrating}
            size={characterSize}
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
              top: `${nearbyStation.doorY - 5}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8A1538] border border-[#FFE082] shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-white hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              aria-label={`ادخل إلى ${nearbyStation.title}`}
            >
              <DoorOpen className="w-3.5 h-3.5 text-[#FFE082]" />
              <span className="text-xs font-black text-[#FFE082]">
                ادخل
              </span>
              <span className="text-xs font-bold text-white">
                {nearbyStation.title}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ABU RASHID WELCOME BUBBLE (FADES OUT AFTER 4 SECONDS)    */}
      {/* ======================================================== */}
      {showWelcomeMessage && (
        <aside
          aria-label="رسالة أبو راشد"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-45 max-w-sm sm:max-w-md w-[90%] transition-all duration-700 pointer-events-none animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/75 border border-[#E6C280]/40 shadow-[0_8px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
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
      {/* ======================================================== */}
      <div
        id="compact-touch-dpad"
        className="fixed bottom-2.5 left-2.5 z-40 flex items-end gap-1.5 pointer-events-auto select-none"
      >
        <div className="relative w-16 h-16 rounded-full bg-black/25 border border-[#E6C280]/20 p-0.5 shadow-md backdrop-blur-xs">
          {/* Up */}
          <button
            id="dpad-btn-up"
            onPointerDown={() => handleTouchStart('up')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded bg-white/10 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082] shadow cursor-pointer active:scale-90"
            aria-label="تحرك للأعلى"
          >
            <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>

          {/* Down */}
          <button
            id="dpad-btn-down"
            onPointerDown={() => handleTouchStart('down')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded bg-white/10 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082] shadow cursor-pointer active:scale-90"
            aria-label="تحرك للأسفل"
          >
            <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>

          {/* Left */}
          <button
            id="dpad-btn-left"
            onPointerDown={() => handleTouchStart('left')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-white/10 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082] shadow cursor-pointer active:scale-90"
            aria-label="تحرك لليسار"
          >
            <ArrowLeft className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>

          {/* Right */}
          <button
            id="dpad-btn-right"
            onPointerDown={() => handleTouchStart('right')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-white/10 active:bg-[#8A1538]/80 border border-[#E6C280]/20 flex items-center justify-center text-[#FFE082] shadow cursor-pointer active:scale-90"
            aria-label="تحرك لليمين"
          >
            <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Action Button: When near a station, provides mobile entry shortcut */}
        {nearbyStation && (
          <button
            id="compact-enter-btn"
            onClick={() => handleEnterStation(nearbyStation.id)}
            className="px-2.5 py-1.5 rounded-full bg-[#8A1538] border border-[#FFE082] text-white font-black text-xs shadow-lg active:scale-95 flex items-center gap-1 cursor-pointer animate-pulse"
          >
            <DoorOpen className="w-3 h-3 text-[#FFE082]" />
            <span>ادخل</span>
          </button>
        )}
      </div>

      {/* Subtle Desktop Keyboard Helper Tooltip */}
      {hasUsedKeyboard && (
        <div className="fixed bottom-3 right-4 z-30 hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-[#E6C280]/20 text-[11px] text-[#e0cfbd] backdrop-blur-xs pointer-events-none">
          <span className="text-[#FFE082] font-bold">التحكم:</span>
          <span>الأسهم أو WASD • مسافة أو Enter للدخول</span>
        </div>
      )}
    </div>
  );
};
