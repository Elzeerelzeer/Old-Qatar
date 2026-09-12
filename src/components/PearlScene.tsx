import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Anchor,
  Waves,
} from 'lucide-react';

import {
  CharacterGender,
  Direction,
  GameSettings,
} from '../types';

interface PearlSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
}

type PearlPhase = 'surface' | 'diving' | 'underwater';

const MASTER_IMAGE_PATH = '/assets/pearl-sea-master-map.png';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 900;
const PLAYER_RADIUS = 2.2;

export function PearlScene({
  gender: _gender,
  settings,
  onReturnToVillage,
}: PearlSceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<PearlPhase>('surface');
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 72 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);
  const [activeTouchDir, setActiveTouchDir] =
    useState<Direction | null>(null);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const [diveProgress, setDiveProgress] = useState(0);

  const keysPressed = useRef<Record<string, boolean>>({});
  const touchDirectionRef = useRef<Direction | null>(null);

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

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const startDive = useCallback(() => {
    if (phase !== 'surface') return;

    setPhase('diving');
    setDiveProgress(0);

    const startedAt = performance.now();
    const duration = 2300;

    const animateDive = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);

      setDiveProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateDive);
        return;
      }

      setPlayerPos({ x: 50, y: 72 });
      setDirection('up');
      setPhase('underwater');
    };

    requestAnimationFrame(animateDive);
  }, [phase]);

  const checkCollision = useCallback((x: number, y: number) => {
    if (x < 10 || x > 90) return true;
    if (y < 48 || y > 89) return true;

    if (
      x + PLAYER_RADIUS > 10 &&
      x - PLAYER_RADIUS < 24 &&
      y + PLAYER_RADIUS > 48 &&
      y - PLAYER_RADIUS < 69
    ) {
      return true;
    }

    if (
      x + PLAYER_RADIUS > 78 &&
      x - PLAYER_RADIUS < 92 &&
      y + PLAYER_RADIUS > 48 &&
      y - PLAYER_RADIUS < 68
    ) {
      return true;
    }

    if (
      x + PLAYER_RADIUS > 57 &&
      x - PLAYER_RADIUS < 68 &&
      y + PLAYER_RADIUS > 57 &&
      y - PLAYER_RADIUS < 69
    ) {
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (phase !== 'underwater') return;

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

    const keyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [phase]);

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.6667, 2);
      lastTime = time;

      if (phase !== 'underwater') {
        setIsMoving(false);
        frameId = requestAnimationFrame(loop);
        return;
      }

      const speed = settings.walkSpeed === 'calm' ? 0.30 : 0.44;

      const keys = keysPressed.current;
      const touch = touchDirectionRef.current;

      let dx = 0;
      let dy = 0;
      let nextDir: Direction | null = null;

      if (keys.arrowup || keys.w || touch === 'up') {
        dy -= speed * dt;
        nextDir = 'up';
      }

      if (keys.arrowdown || keys.s || touch === 'down') {
        dy += speed * dt;
        nextDir = 'down';
      }

      if (keys.arrowleft || keys.a || touch === 'left') {
        dx -= speed * dt;
        nextDir = 'left';
      }

      if (keys.arrowright || keys.d || touch === 'right') {
        dx += speed * dt;
        nextDir = 'right';
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);

        if (nextDir) {
          setDirection(nextDir);
        }

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
      } else {
        setIsMoving(false);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [phase, settings.walkSpeed, checkCollision]);

  const handleTouchStart = (dir: Direction) => {
    if (phase !== 'underwater') return;

    touchDirectionRef.current = dir;
    setActiveTouchDir(dir);
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
  };

  const playerWorldPxX = (playerPos.x / 100) * WORLD_WIDTH;
  const playerWorldPxY = (playerPos.y / 100) * WORLD_HEIGHT;

  let focusX = WORLD_WIDTH * 0.5;
  let focusY = WORLD_HEIGHT * 0.22;

  if (phase === 'diving') {
    focusY = WORLD_HEIGHT * (0.22 + 0.50 * diveProgress);
  }

  if (phase === 'underwater') {
    focusX = playerWorldPxX;
    focusY = playerWorldPxY;
  }

  const desiredCameraX = viewportSize.width / 2 - focusX;
  const desiredCameraY = viewportSize.height / 2 - focusY;

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

  const diverFlip = direction === 'left' ? -1 : 1;

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden bg-[#06283a] select-none"
      dir="rtl"
    >
      <div
        className="absolute top-0 left-0 will-change-transform transition-transform duration-100 ease-out"
        style={{
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
        }}
      >
        <img
          src={MASTER_IMAGE_PATH}
          alt="بحر اللؤلؤ"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {(phase === 'diving' || phase === 'underwater') && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,92,132,0.04), rgba(0,76,115,0.15))',
            }}
          />
        )}

        {phase === 'underwater' && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute left-1/2 top-[78%] -translate-x-1/2 w-14 h-5 rounded-full bg-black/25 blur-md" />

            <div
              className={`relative text-[74px] md:text-[82px] leading-none drop-shadow-[0_8px_10px_rgba(0,0,0,0.38)] transition-transform duration-100 ${
                isMoving ? 'animate-pulse' : ''
              }`}
              style={{
                transform: `scaleX(${diverFlip})`,
              }}
            >
              🤿
            </div>

            {isMoving && (
              <>
                <span className="absolute -top-3 right-2 w-2 h-2 border border-white/60 rounded-full animate-ping" />
                <span className="absolute -top-7 right-5 w-3 h-3 border border-white/45 rounded-full animate-pulse" />
              </>
            )}
          </div>
        )}
      </div>

      {phase === 'surface' && (
        <>
          <div className="fixed top-5 right-5 z-50 bg-[#082d40]/90 backdrop-blur-md border border-[#E6C280]/60 rounded-full px-5 py-2 text-white shadow-xl">
            <span className="font-black text-[#FFE082]">
              بحر اللؤلؤ
            </span>
          </div>

          <div className="fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
            <div className="w-full max-w-md rounded-[28px] border-2 border-[#E6C280] bg-[#082d40]/88 backdrop-blur-md p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#8A1538] border border-[#FFE082] flex items-center justify-center">
                <Anchor className="w-7 h-7 text-[#FFE082]" />
              </div>

              <h2 className="text-2xl font-black text-[#FFE082]">
                رحلة إلى قاع الزمن
              </h2>

              <p className="mt-2 text-sm text-white/90 leading-7">
                ابدأ رحلة الغوص واكتشف أسرار اللؤلؤ في بحر قطر.
              </p>

              <button
                onClick={startDive}
                className="mt-4 w-full py-3.5 rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] text-[#FFE082] font-black text-lg active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Waves className="w-6 h-6" />
                <span>ابدأ رحلة الغوص</span>
              </button>
            </div>
          </div>

          <button
            onClick={onReturnToVillage}
            className="fixed top-5 left-5 z-50 rounded-full bg-[#8A1538] border border-[#FFE082] text-white px-4 py-2 font-bold shadow-xl active:scale-95 cursor-pointer"
          >
            العودة إلى القرية
          </button>
        </>
      )}

      {phase === 'diving' && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#006b94]"
            style={{
              opacity: 0.05 + diveProgress * 0.20,
            }}
          />

          <div className="relative text-center">
            <div className="mx-auto relative w-28 h-28">
              <div className="absolute left-2 bottom-1 w-4 h-4 border-2 border-white/70 rounded-full animate-ping" />
              <div className="absolute right-4 top-5 w-7 h-7 border-2 border-white/60 rounded-full animate-pulse" />
              <div className="absolute left-1/2 top-1/2 w-5 h-5 border-2 border-white/50 rounded-full animate-bounce" />
            </div>

            <div className="mt-2 px-6 py-3 rounded-full bg-black/35 border border-white/25 text-white font-bold backdrop-blur-md">
              ننزل إلى عالم اللؤلؤ...
            </div>
          </div>
        </div>
      )}

      {phase === 'underwater' && (
        <>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#06283a]/90 border border-[#E6C280]/55 px-4 py-2 backdrop-blur-md shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
            <span className="font-black text-[#FFE082]">
              قاع بحر اللؤلؤ
            </span>
          </div>

          <button
            onClick={onReturnToVillage}
            className="fixed top-4 left-4 z-50 rounded-full bg-[#8A1538] border border-[#FFE082] text-white px-4 py-2 font-bold shadow-xl active:scale-95 cursor-pointer"
          >
            العودة إلى القرية
          </button>

          <div className="fixed top-16 right-4 z-50 rounded-full bg-black/35 border border-white/20 px-4 py-2 text-xs text-white/90 backdrop-blur-sm">
            المرحلة 1: استكشف قاع البحر
          </div>

          <div className="fixed bottom-6 left-6 z-[100] w-[138px] h-[138px] rounded-full bg-[#032536]/90 border-2 border-[#E6C280] shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-md touch-none select-none">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleTouchStart('up');
              }}
              onPointerUp={handleTouchEnd}
              onPointerLeave={handleTouchEnd}
              onPointerCancel={handleTouchEnd}
              className={`absolute top-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 ${
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
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 ${
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
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 ${
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
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 ${
                activeTouchDir === 'right'
                  ? 'bg-[#A91D47]'
                  : 'bg-[#8A1538]'
              }`}
              aria-label="تحرك لليمين"
            >
              <ArrowRight className="w-7 h-7 stroke-[3]" />
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#B99658] border-2 border-[#F6E3B4] flex items-center justify-center text-white pointer-events-none">
              ✦
            </div>
          </div>
        </>
      )}
    </div>
  );
}
