import React, {
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
   HOTSPOTS
============================================================ */

interface SouqHotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
}

const SOUQ_HOTSPOTS: SouqHotspot[] = [
  {
    id: 'pottery',
    name: 'دكان الفخار',
    x: 25,
    y: 38,
    radius: 14,
  },
  {
    id: 'spices',
    name: 'دكان العطّار',
    x: 75,
    y: 38,
    radius: 14,
  },
  {
    id: 'fabrics',
    name: 'الأقمشة والسلال',
    x: 26,
    y: 68,
    radius: 14,
  },
  {
    id: 'antiques',
    name: 'الأدوات القديمة',
    x: 74,
    y: 68,
    radius: 14,
  },
  {
    id: 'falconer',
    name: 'ركن الصقّار',
    x: 50,
    y: 28,
    radius: 13,
  },
];

/* ============================================================
   COLLISION
============================================================ */

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SOUQ_COLLIDERS: BoundingBox[] = [
  // Outer boundaries
  {
    id: 'wall_north',
    x: 0,
    y: 0,
    width: 100,
    height: 16,
  },
  {
    id: 'wall_west',
    x: 0,
    y: 0,
    width: 14,
    height: 100,
  },
  {
    id: 'wall_east',
    x: 86,
    y: 0,
    width: 14,
    height: 100,
  },
  {
    id: 'wall_south_left',
    x: 0,
    y: 92,
    width: 40,
    height: 8,
  },
  {
    id: 'wall_south_right',
    x: 60,
    y: 92,
    width: 40,
    height: 8,
  },

  // Pottery
  {
    id: 'block_pottery_deep',
    x: 14,
    y: 16,
    width: 15,
    height: 26,
  },

  // Spices
  {
    id: 'block_spices_deep',
    x: 71,
    y: 16,
    width: 15,
    height: 26,
  },

  // Fabrics
  {
    id: 'block_fabrics_deep',
    x: 14,
    y: 52,
    width: 15,
    height: 26,
  },

  // Old tools
  {
    id: 'block_antiques_deep',
    x: 71,
    y: 52,
    width: 15,
    height: 26,
  },

  // Falconer
  {
    id: 'block_falconer_stand',
    x: 46,
    y: 16,
    width: 8,
    height: 8,
  },
];

/* ============================================================
   COMPONENT
============================================================ */

export function SouqScene({
  gender,
  settings,
  onReturnToVillage,
}: SouqSceneProps) {
  /* ------------------------------------------------------------
     PLAYER
  ------------------------------------------------------------ */

  const [playerPos, setPlayerPos] = useState<{
    x: number;
    y: number;
  }>({
    x: 50,
    y: 86,
  });

  const [direction, setDirection] =
    useState<Direction>('up');

  const [isMoving, setIsMoving] =
    useState(false);

  const [activeTouchDir, setActiveTouchDir] =
    useState<Direction | null>(null);

  /* ------------------------------------------------------------
     INPUT REFS
  ------------------------------------------------------------ */

  const keysPressed =
    useRef<Record<string, boolean>>({});

  const touchDirectionRef =
    useRef<Direction | null>(null);

  const viewportRef =
    useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------
     MOVEMENT SETTINGS
  ------------------------------------------------------------ */

  const MOVE_SPEED =
    settings.walkSpeed === 'calm'
      ? 0.38
      : 0.55;

  const PLAYER_RADIUS = 2;

  /* ============================================================
     COLLISION CHECK
  ============================================================ */

  const checkCollision = useCallback(
    (
      targetX: number,
      targetY: number
    ): boolean => {
      // Outer playable area
      if (
        targetX < 14 ||
        targetX > 86 ||
        targetY < 18 ||
        targetY > 93
      ) {
        return true;
      }

      for (const box of SOUQ_COLLIDERS) {
        const boxLeft = box.x;
        const boxRight =
          box.x + box.width;

        const boxTop = box.y;
        const boxBottom =
          box.y + box.height;

        if (
          targetX + PLAYER_RADIUS >
            boxLeft &&
          targetX - PLAYER_RADIUS <
            boxRight &&
          targetY + PLAYER_RADIUS >
            boxTop &&
          targetY - PLAYER_RADIUS <
            boxBottom
        ) {
          return true;
        }
      }

      return false;
    },
    []
  );

  /* ============================================================
     KEYBOARD CONTROLS
  ============================================================ */

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      const key =
        e.key.toLowerCase();

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

        keysPressed.current[key] =
          true;
      }
    };

    const handleKeyUp = (
      e: KeyboardEvent
    ) => {
      const key =
        e.key.toLowerCase();

      keysPressed.current[key] =
        false;
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    window.addEventListener(
      'keyup',
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

      window.removeEventListener(
        'keyup',
        handleKeyUp
      );
    };
  }, []);

  /* ============================================================
     GAME LOOP
  ============================================================ */

  useEffect(() => {
    let animationFrameId: number;

    let stepSoundTimer = 0;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      let newDir:
        | Direction
        | null = null;

      const keys =
        keysPressed.current;

      const touchDir =
        touchDirectionRef.current;

      /* UP */

      if (
        keys['arrowup'] ||
        keys['w'] ||
        touchDir === 'up'
      ) {
        dy -= MOVE_SPEED;
        newDir = 'up';
      }

      /* DOWN */

      if (
        keys['arrowdown'] ||
        keys['s'] ||
        touchDir === 'down'
      ) {
        dy += MOVE_SPEED;
        newDir = 'down';
      }

      /* LEFT */

      if (
        keys['arrowleft'] ||
        keys['a'] ||
        touchDir === 'left'
      ) {
        dx -= MOVE_SPEED;
        newDir = 'left';
      }

      /* RIGHT */

      if (
        keys['arrowright'] ||
        keys['d'] ||
        touchDir === 'right'
      ) {
        dx += MOVE_SPEED;
        newDir = 'right';
      }

      /* DIAGONAL NORMALIZATION */

      if (
        dx !== 0 &&
        dy !== 0
      ) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      /* MOVEMENT */

      if (
        dx !== 0 ||
        dy !== 0
      ) {
        setIsMoving(true);

        if (newDir) {
          setDirection(newDir);
        }

        setPlayerPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          // Horizontal movement
          if (
            !checkCollision(
              prev.x + dx,
              prev.y
            )
          ) {
            nextX =
              prev.x + dx;
          }

          // Vertical movement
          if (
            !checkCollision(
              nextX,
              prev.y + dy
            )
          ) {
            nextY =
              prev.y + dy;
          }

          return {
            x: nextX,
            y: nextY,
          };
        });

        /* FOOTSTEP */

        stepSoundTimer++;

        if (
          stepSoundTimer % 18 === 0 &&
          settings.isSoundEnabled &&
          !settings.isQuietMode
        ) {
          soundManager.playFootstep();
        }
      } else {
        setIsMoving(false);
      }

      animationFrameId =
        requestAnimationFrame(
          gameLoop
        );
    };

    animationFrameId =
      requestAnimationFrame(
        gameLoop
      );

    return () =>
      cancelAnimationFrame(
        animationFrameId
      );
  }, [
    checkCollision,
    settings.isSoundEnabled,
    settings.isQuietMode,
    MOVE_SPEED,
  ]);

  /* ============================================================
     TOUCH CONTROLS
  ============================================================ */

  const handleTouchStart = (
    dir: Direction
  ) => {
    touchDirectionRef.current =
      dir;

    setActiveTouchDir(dir);

    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current =
      null;

    setActiveTouchDir(null);
  };

  /* ============================================================
     HOTSPOT DETECTION
  ============================================================ */

  const activeNearbyHotspot =
    SOUQ_HOTSPOTS.find(
      (spot) => {
        const dist =
          Math.hypot(
            playerPos.x -
              spot.x,
            playerPos.y -
              spot.y
          );

        return (
          dist <= spot.radius
        );
      }
    );

  /* ============================================================
     WORLD / CAMERA
  ============================================================ */

  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 900;

  const playerWorldPxX =
    (playerPos.x / 100) *
    WORLD_WIDTH;

  const playerWorldPxY =
    (playerPos.y / 100) *
    WORLD_HEIGHT;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      ref={viewportRef}
      id="souq-exploration-viewport"
      className="
        relative
        w-full
        h-full
        overflow-hidden
        bg-[#1a0e08]
        select-none
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          absolute
          top-4
          left-4
          right-4
          z-50
          flex
          items-center
          justify-between
          pointer-events-none
        "
      >
        {/* RIGHT SIDE */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {/* TITLE */}

          <div
            className="
              pointer-events-auto
              bg-[#2b170d]/90
              backdrop-blur-md
              border
              border-[#E6C280]/40
              px-4
              py-2
              rounded-full
              shadow-2xl
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                w-2.5
                h-2.5
                rounded-full
                bg-[#E6C280]
                shadow-[0_0_8px_#E6C280]
                animate-pulse
              "
            />

            <span
              className="
                text-[#FAF5EA]
                text-sm
                md:text-base
                font-bold
              "
            >
              سوق لوّل
            </span>
          </div>

          {/* PROGRESS */}

          <div
            className="
              pointer-events-auto
              bg-[#2b170d]/90
              backdrop-blur-md
              border
              border-[#E6C280]/40
              px-3.5
              py-1.5
              rounded-full
              shadow-xl
              flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-[#FAF5EA]
            "
          >
            <span>
              رحلة السوق
            </span>

            <span
              className="
                text-[#E6C280]
                font-black
              "
            >
              0/2
            </span>
          </div>
        </div>

        {/* RETURN BUTTON */}

        <button
          onClick={() => {
            soundManager.playClick();

            onReturnToVillage();
          }}
          className="
            pointer-events-auto
            flex
            items-center
            gap-2
            bg-[#8A1538]
            hover:bg-[#6b102c]
            active:scale-95
            text-[#FAF5EA]
            px-4
            py-2
            rounded-full
            border
            border-[#E6C280]/60
            shadow-xl
            text-sm
            font-semibold
            transition-all
            duration-150
            cursor-pointer
          "
          title="العودة إلى القرية"
        >
          <ArrowRight
            className="
              w-4
              h-4
            "
          />

          <span>
            العودة إلى القرية
          </span>
        </button>
      </div>

      {/* ======================================================
          SOUQ WORLD
      ====================================================== */}

      <div
        id="souq-world"
        className="
          absolute
          top-0
          left-0
          transition-transform
          duration-75
          ease-out
          will-change-transform
        "
        style={{
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,

          transform: `
            translate(
              calc(50vw - ${playerWorldPxX}px),
              calc(50vh - ${playerWorldPxY}px)
            )
          `,
        }}
      >
        {/* ====================================================
            MASTER MAP
        ==================================================== */}

        <div
          className="
            absolute
            inset-0
            w-full
            h-full
            overflow-hidden
            bg-[#1f1008]
          "
        >
          <img
            src="/assets/souq-master-map.png.jpeg"
            alt="خريطة سوق لوّل"
            className="
              w-full
              h-full
              object-cover
              select-none
              pointer-events-none
            "
            draggable={false}
          />
        </div>

        {/* ====================================================
            HOTSPOTS
        ==================================================== */}

        {SOUQ_HOTSPOTS.map(
          (spot) => {
            const isNear =
              activeNearbyHotspot
                ?.id === spot.id;

            return (
              <div
                key={spot.id}
                className="
                  absolute
                  pointer-events-none
                  transition-all
                  duration-500
                  z-20
                "
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,

                  transform:
                    'translate(-50%, -50%)',
                }}
              >
                {isNear && (
                  <div
                    className="
                      relative
                      flex
                      flex-col
                      items-center
                    "
                  >
                    {/* GOLDEN GLOW */}

                    <div
                      className="
                        w-36
                        h-36
                        rounded-full
                        bg-[#E6C280]/25
                        blur-2xl
                        animate-pulse
                        pointer-events-none
                      "
                    />

                    {/* EXPLORE BUTTON */}

                    <div
                      className="
                        absolute
                        top-1/2
                        left-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        pointer-events-auto
                      "
                    >
                      <button
                        onClick={() => {
                          soundManager.playClick();
                        }}
                        className="
                          flex
                          items-center
                          gap-1.5
                          bg-[#8A1538]/95
                          hover:bg-[#a31a43]
                          active:scale-95
                          text-[#FAF5EA]
                          px-3.5
                          py-1.5
                          rounded-full
                          border
                          border-[#E6C280]
                          shadow-[0_4px_16px_rgba(0,0,0,0.6)]
                          text-xs
                          font-bold
                          transition-all
                          duration-200
                          cursor-pointer
                          animate-bounce
                        "
                      >
                        <Sparkles
                          className="
                            w-3.5
                            h-3.5
                            text-[#E6C280]
                          "
                        />

                        <span>
                          تعرّف
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}

        {/* ====================================================
            PLAYER
        ==================================================== */}

        <div
          id="souq-player"
          className="
            absolute
            z-30
            pointer-events-none
          "
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,

            transform:
              'translate(-50%, -85%) scale(1.08)',
          }}
        >
          {/* SHADOW */}

          <div
            className="
              absolute
              bottom-1
              left-1/2
              -translate-x-1/2
              w-9
              h-4
              bg-black/50
              rounded-full
              blur-[2px]
            "
          />

          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={false}
          />
        </div>
      </div>

      {/* ======================================================
          LARGE TOUCH D-PAD
          يظهر على الكمبيوتر + الجوال + التابلت + السبورة
      ====================================================== */}

      <div
        id="souq-touch-dpad"
        className="
          fixed
          bottom-6
          left-6
          z-[100]
          flex
          items-end
          gap-3
          pointer-events-auto
          select-none
          touch-none
        "
      >
        <div
          className="
            relative
            w-[138px]
            h-[138px]
            rounded-full
            bg-[#2d180f]/90
            border-2
            border-[#E6C280]
            shadow-[0_8px_30px_rgba(0,0,0,0.55)]
            backdrop-blur-md
          "
        >
          {/* UP */}

          <button
            id="dpad-btn-up"
            onPointerDown={(
              e
            ) => {
              e.preventDefault();

              handleTouchStart(
                'up'
              );
            }}
            onPointerUp={(
              e
            ) => {
              e.preventDefault();

              handleTouchEnd();
            }}
            onPointerLeave={
              handleTouchEnd
            }
            onPointerCancel={
              handleTouchEnd
            }
            className={`
              absolute
              top-2
              left-1/2
              -translate-x-1/2

              w-11
              h-11

              rounded-xl

              border-2
              border-[#E6C280]

              flex
              items-center
              justify-center

              text-white

              shadow-lg

              transition-all
              duration-100

              active:scale-90

              ${
                activeTouchDir ===
                'up'
                  ? 'bg-[#A91D47] scale-90'
                  : 'bg-[#8A1538]'
              }
            `}
            aria-label="تحرك للأعلى"
          >
            <ArrowUp
              className="
                w-7
                h-7
                stroke-[3]
              "
            />
          </button>

          {/* DOWN */}

          <button
            id="dpad-btn-down"
            onPointerDown={(
              e
            ) => {
              e.preventDefault();

              handleTouchStart(
                'down'
              );
            }}
            onPointerUp={(
              e
            ) => {
              e.preventDefault();

              handleTouchEnd();
            }}
            onPointerLeave={
              handleTouchEnd
            }
            onPointerCancel={
              handleTouchEnd
            }
            className={`
              absolute
              bottom-2
              left-1/2
              -translate-x-1/2

              w-11
              h-11

              rounded-xl

              border-2
              border-[#E6C280]

              flex
              items-center
              justify-center

              text-white

              shadow-lg

              transition-all
              duration-100

              active:scale-90

              ${
                activeTouchDir ===
                'down'
                  ? 'bg-[#A91D47] scale-90'
                  : 'bg-[#8A1538]'
              }
            `}
            aria-label="تحرك للأسفل"
          >
            <ArrowDown
              className="
                w-7
                h-7
                stroke-[3]
              "
            />
          </button>

          {/* LEFT */}

          <button
            id="dpad-btn-left"
            onPointerDown={(
              e
            ) => {
              e.preventDefault();

              handleTouchStart(
                'left'
              );
            }}
            onPointerUp={(
              e
            ) => {
              e.preventDefault();

              handleTouchEnd();
            }}
            onPointerLeave={
              handleTouchEnd
            }
            onPointerCancel={
              handleTouchEnd
            }
            className={`
              absolute
              left-2
              top-1/2
              -translate-y-1/2

              w-11
              h-11

              rounded-xl

              border-2
              border-[#E6C280]

              flex
              items-center
              justify-center

              text-white

              shadow-lg

              transition-all
              duration-100

              active:scale-90

              ${
                activeTouchDir ===
                'left'
                  ? 'bg-[#A91D47] scale-90'
                  : 'bg-[#8A1538]'
              }
            `}
            aria-label="تحرك لليسار"
          >
            <ArrowLeft
              className="
                w-7
                h-7
                stroke-[3]
              "
            />
          </button>

          {/* RIGHT */}

          <button
            id="dpad-btn-right"
            onPointerDown={(
              e
            ) => {
              e.preventDefault();

              handleTouchStart(
                'right'
              );
            }}
            onPointerUp={(
              e
            ) => {
              e.preventDefault();

              handleTouchEnd();
            }}
            onPointerLeave={
              handleTouchEnd
            }
            onPointerCancel={
              handleTouchEnd
            }
            className={`
              absolute
              right-2
              top-1/2
              -translate-y-1/2

              w-11
              h-11

              rounded-xl

              border-2
              border-[#E6C280]

              flex
              items-center
              justify-center

              text-white

              shadow-lg

              transition-all
              duration-100

              active:scale-90

              ${
                activeTouchDir ===
                'right'
                  ? 'bg-[#A91D47] scale-90'
                  : 'bg-[#8A1538]'
              }
            `}
            aria-label="تحرك لليمين"
          >
            <ArrowRight
              className="
                w-7
                h-7
                stroke-[3]
              "
            />
          </button>

          {/* CENTER HUB */}

          <div
            className="
              absolute
              left-1/2
              top-1/2

              -translate-x-1/2
              -translate-y-1/2

              w-10
              h-10

              rounded-full

              bg-[#B99658]

              border-2
              border-[#F6E3B4]

              flex
              items-center
              justify-center

              text-white

              text-lg

              shadow-inner

              pointer-events-none
            "
          >
            ✦
          </div>
        </div>

        {/* ====================================================
            MOBILE EXPLORE BUTTON
        ==================================================== */}

        {activeNearbyHotspot && (
          <button
            id="compact-explore-btn"
            onClick={() => {
              soundManager.playClick();
            }}
            className="
              px-4
              py-2.5

              rounded-full

              bg-[#8A1538]

              border
              border-[#FFE082]

              text-white

              font-black
              text-sm

              shadow-lg

              active:scale-95

              flex
              items-center
              gap-1.5

              cursor-pointer

              animate-pulse
            "
          >
            <Sparkles
              className="
                w-4
                h-4
                text-[#FFE082]
              "
            />

            <span
              className="
                text-[#FFE082]
              "
            >
              تعرّف
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
