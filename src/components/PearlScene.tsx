from pathlib import Path

code = r'''import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Anchor,
  Award,
  Clock3,
  Gem,
  Rotate3D,
  Shell,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';

import {
  CharacterGender,
  Direction,
  GameSettings,
} from '../types';

/* ============================================================
   PROPS
============================================================ */

interface PearlSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;

  /*
    Optional so the current App.tsx still compiles.
    Later you can pass:
    onComplete={() => handleStampStation('pearl')}
  */
  onComplete?: () => void;
}

/* ============================================================
   TYPES
============================================================ */

type PearlPhase =
  | 'surface'
  | 'diving'
  | 'underwater'
  | 'finished';

type ShellReward =
  | 'empty'
  | 'pearl'
  | 'dana';

interface ShellHotspot {
  id: string;
  x: number;
  y: number;
  radius: number;
  reward: ShellReward;
  points: number;
}

interface OpenedShellState {
  shell: ShellHotspot;
  title: string;
  message: string;
}

/* ============================================================
   ASSETS
============================================================ */

const MASTER_IMAGE_PATH =
  '/assets/pearl-sea-master-map.png';

const DIVER_IMAGE_PATH =
  '/assets/pearl-diver.png';

/* ============================================================
   WORLD
============================================================ */

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 900;

const PLAYER_RADIUS = 2.2;

const ROUND_SECONDS = 60;

/* ============================================================
   SHELL HOTSPOTS
   Coordinates are percentages of the 1600x900 master map.
   Fine-tune later if needed to sit exactly over the painted shells.
============================================================ */

const SHELLS: ShellHotspot[] = [
  {
    id: 'shell-1',
    x: 27,
    y: 70,
    radius: 8,
    reward: 'empty',
    points: 0,
  },
  {
    id: 'shell-2',
    x: 42,
    y: 60,
    radius: 8,
    reward: 'pearl',
    points: 10,
  },
  {
    id: 'shell-3',
    x: 52,
    y: 50,
    radius: 8,
    reward: 'empty',
    points: 0,
  },
  {
    id: 'shell-4',
    x: 72,
    y: 59,
    radius: 8,
    reward: 'pearl',
    points: 10,
  },
  {
    id: 'shell-5',
    x: 82,
    y: 69,
    radius: 8,
    reward: 'dana',
    points: 50,
  },
  {
    id: 'shell-6',
    x: 91,
    y: 82,
    radius: 8,
    reward: 'pearl',
    points: 10,
  },
];

/* ============================================================
   COMPONENT
============================================================ */

export function PearlScene({
  gender,
  settings,
  onReturnToVillage,
  onComplete,
}: PearlSceneProps) {
  const viewportRef =
    useRef<HTMLDivElement | null>(null);

  /* ==========================================================
     PHASE
  ========================================================== */

  const [phase, setPhase] =
    useState<PearlPhase>('surface');

  /* ==========================================================
     PLAYER
  ========================================================== */

  const [playerPos, setPlayerPos] =
    useState({
      x: 50,
      y: 72,
    });

  const [direction, setDirection] =
    useState<Direction>('right');

  const [
    lastHorizontalDirection,
    setLastHorizontalDirection,
  ] = useState<'left' | 'right'>('right');

  const [isMoving, setIsMoving] =
    useState(false);

  /* ==========================================================
     INPUT
  ========================================================== */

  const [
    activeTouchDir,
    setActiveTouchDir,
  ] =
    useState<Direction | null>(null);

  const touchDirectionRef =
    useRef<Direction | null>(null);

  const keysPressed =
    useRef<Record<string, boolean>>({});

  /* ==========================================================
     VIEWPORT / CAMERA
  ========================================================== */

  const [
    viewportSize,
    setViewportSize,
  ] = useState({
    width: 0,
    height: 0,
  });

  const [
    diveProgress,
    setDiveProgress,
  ] = useState(0);

  /* ==========================================================
     GAME STATE
  ========================================================== */

  const [timeLeft, setTimeLeft] =
    useState(ROUND_SECONDS);

  const [score, setScore] =
    useState(0);

  const [
    openedShellIds,
    setOpenedShellIds,
  ] = useState<string[]>([]);

  const [
    openedShell,
    setOpenedShell,
  ] =
    useState<OpenedShellState | null>(null);

  const [
    hasFoundDana,
    setHasFoundDana,
  ] = useState(false);

  const [
    hasReportedComplete,
    setHasReportedComplete,
  ] = useState(false);

  /*
    Simple breathing representation.
    5 bubbles = plenty of breath, then it gradually drops.
  */
  const breathCount = Math.max(
    0,
    Math.ceil(
      (timeLeft / ROUND_SECONDS) * 5
    )
  );

  /* ==========================================================
     VIEWPORT SIZE
  ========================================================== */

  useEffect(() => {
    const updateSize = () => {
      const el = viewportRef.current;

      if (!el) {
        return;
      }

      setViewportSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();

    let observer:
      | ResizeObserver
      | null = null;

    if (
      typeof ResizeObserver !==
      'undefined'
    ) {
      observer =
        new ResizeObserver(
          updateSize
        );

      if (
        viewportRef.current
      ) {
        observer.observe(
          viewportRef.current
        );
      }
    }

    window.addEventListener(
      'resize',
      updateSize
    );

    return () => {
      observer?.disconnect();

      window.removeEventListener(
        'resize',
        updateSize
      );
    };
  }, []);

  /* ==========================================================
     START / RESET ROUND
  ========================================================== */

  const resetRound = useCallback(() => {
    setPlayerPos({
      x: 50,
      y: 72,
    });

    setDirection('right');
    setLastHorizontalDirection('right');

    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setOpenedShellIds([]);
    setOpenedShell(null);

    setHasFoundDana(false);
    setHasReportedComplete(false);

    keysPressed.current = {};
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
    setIsMoving(false);
  }, []);

  const startDive =
    useCallback(() => {
      if (
        phase !== 'surface'
      ) {
        return;
      }

      resetRound();

      setPhase('diving');
      setDiveProgress(0);

      const startedAt =
        performance.now();

      const duration = 2300;

      const animateDive = (
        time: number
      ) => {
        const progress =
          Math.min(
            1,
            (
              time -
              startedAt
            ) /
              duration
          );

        setDiveProgress(
          progress
        );

        if (
          progress < 1
        ) {
          requestAnimationFrame(
            animateDive
          );

          return;
        }

        setPhase(
          'underwater'
        );
      };

      requestAnimationFrame(
        animateDive
      );
    }, [phase, resetRound]);

  const restartDive = () => {
    resetRound();
    setPhase('underwater');
  };

  /* ==========================================================
     COLLISION
  ========================================================== */

  const checkCollision =
    useCallback(
      (
        x: number,
        y: number
      ) => {
        /*
          Main safe underwater area.
          Slightly wider than before so the player can reach
          the shells at both sides.
        */
        if (
          x < 8 ||
          x > 94
        ) {
          return true;
        }

        if (
          y < 43 ||
          y > 91
        ) {
          return true;
        }

        /*
          Left reef.
        */
        if (
          x +
            PLAYER_RADIUS >
            8 &&
          x -
            PLAYER_RADIUS <
            20 &&
          y +
            PLAYER_RADIUS >
            43 &&
          y -
            PLAYER_RADIUS <
            63
        ) {
          return true;
        }

        /*
          Right reef.
        */
        if (
          x +
            PLAYER_RADIUS >
            85 &&
          x -
            PLAYER_RADIUS <
            95 &&
          y +
            PLAYER_RADIUS >
            43 &&
          y -
            PLAYER_RADIUS <
            61
        ) {
          return true;
        }

        return false;
      },
      []
    );

  /* ==========================================================
     KEYBOARD
  ========================================================== */

  useEffect(() => {
    const handleKeyDown =
      (
        e: KeyboardEvent
      ) => {
        if (
          phase !==
            'underwater' ||
          openedShell
        ) {
          return;
        }

        const key =
          e.key.toLowerCase();

        const allowed =
          [
            'arrowup',
            'arrowdown',
            'arrowleft',
            'arrowright',
            'w',
            'a',
            's',
            'd',
          ];

        if (
          allowed.includes(
            key
          )
        ) {
          e.preventDefault();

          keysPressed.current[
            key
          ] = true;
        }
      };

    const handleKeyUp =
      (
        e: KeyboardEvent
      ) => {
        keysPressed.current[
          e.key.toLowerCase()
        ] = false;
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
  }, [
    phase,
    openedShell,
  ]);

  /* ==========================================================
     MOVEMENT LOOP
  ========================================================== */

  useEffect(() => {
    let frameId = 0;

    let lastTime =
      performance.now();

    const loop = (
      time: number
    ) => {
      const dt =
        Math.min(
          (
            time -
            lastTime
          ) /
            16.6667,

          2
        );

      lastTime = time;

      if (
        phase !==
          'underwater' ||
        openedShell
      ) {
        setIsMoving(
          false
        );

        frameId =
          requestAnimationFrame(
            loop
          );

        return;
      }

      const speed =
        settings.walkSpeed ===
        'calm'
          ? 0.30
          : 0.44;

      const keys =
        keysPressed.current;

      const touch =
        touchDirectionRef.current;

      let dx = 0;
      let dy = 0;

      let nextDir:
        | Direction
        | null = null;

      if (
        keys.arrowup ||
        keys.w ||
        touch === 'up'
      ) {
        dy -=
          speed * dt;

        nextDir = 'up';
      }

      if (
        keys.arrowdown ||
        keys.s ||
        touch === 'down'
      ) {
        dy +=
          speed * dt;

        nextDir =
          'down';
      }

      if (
        keys.arrowleft ||
        keys.a ||
        touch === 'left'
      ) {
        dx -=
          speed * dt;

        nextDir =
          'left';
      }

      if (
        keys.arrowright ||
        keys.d ||
        touch === 'right'
      ) {
        dx +=
          speed * dt;

        nextDir =
          'right';
      }

      if (
        dx !== 0 &&
        dy !== 0
      ) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (
        dx !== 0 ||
        dy !== 0
      ) {
        setIsMoving(
          true
        );

        if (
          nextDir
        ) {
          setDirection(
            nextDir
          );

          if (
            nextDir ===
              'left' ||
            nextDir ===
              'right'
          ) {
            setLastHorizontalDirection(
              nextDir
            );
          }
        }

        setPlayerPos(
          (prev) => {
            let nextX =
              prev.x;

            let nextY =
              prev.y;

            if (
              !checkCollision(
                prev.x +
                  dx,

                prev.y
              )
            ) {
              nextX =
                prev.x +
                dx;
            }

            if (
              !checkCollision(
                nextX,

                prev.y +
                  dy
              )
            ) {
              nextY =
                prev.y +
                dy;
            }

            return {
              x: nextX,
              y: nextY,
            };
          }
        );
      } else {
        setIsMoving(
          false
        );
      }

      frameId =
        requestAnimationFrame(
          loop
        );
    };

    frameId =
      requestAnimationFrame(
        loop
      );

    return () => {
      cancelAnimationFrame(
        frameId
      );
    };
  }, [
    phase,
    settings.walkSpeed,
    checkCollision,
    openedShell,
  ]);

  /* ==========================================================
     TIMER
  ========================================================== */

  useEffect(() => {
    if (
      phase !==
      'underwater'
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setTimeLeft(
            (prev) => {
              if (
                prev <= 1
              ) {
                window.clearInterval(
                  timer
                );

                setPhase(
                  'finished'
                );

                return 0;
              }

              return (
                prev - 1
              );
            }
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [phase]);

  /* ==========================================================
     TOUCH
  ========================================================== */

  const handleTouchStart =
    (
      dir: Direction
    ) => {
      if (
        phase !==
          'underwater' ||
        openedShell
      ) {
        return;
      }

      touchDirectionRef.current =
        dir;

      setActiveTouchDir(
        dir
      );

      setDirection(
        dir
      );

      if (
        dir === 'left' ||
        dir === 'right'
      ) {
        setLastHorizontalDirection(
          dir
        );
      }
    };

  const handleTouchEnd =
    () => {
      touchDirectionRef.current =
        null;

      setActiveTouchDir(
        null
      );
    };

  /* ==========================================================
     NEAREST SHELL + PEARL PULSE
  ========================================================== */

  const nearestShell =
    useMemo(() => {
      if (
        phase !==
        'underwater'
      ) {
        return null;
      }

      let closest:
        | ShellHotspot
        | null = null;

      let minDistance =
        Number.POSITIVE_INFINITY;

      for (
        const shell
        of SHELLS
      ) {
        if (
          openedShellIds.includes(
            shell.id
          )
        ) {
          continue;
        }

        const distance =
          Math.hypot(
            playerPos.x -
              shell.x,

            playerPos.y -
              shell.y
          );

        if (
          distance <
          minDistance
        ) {
          minDistance =
            distance;

          closest =
            shell;
        }
      }

      if (
        !closest
      ) {
        return null;
      }

      return {
        shell:
          closest,

        distance:
          minDistance,
      };
    }, [
      phase,
      playerPos,
      openedShellIds,
    ]);

  const nearShell =
    nearestShell &&
    nearestShell.distance <=
      nearestShell.shell
        .radius
      ? nearestShell.shell
      : null;

  const pulseStrength =
    nearestShell
      ? Math.max(
          0,
          Math.min(
            1,
            1 -
              nearestShell.distance /
                24
          )
        )
      : 0;

  /* ==========================================================
     OPEN SHELL
  ========================================================== */

  const openShell = (
    shell: ShellHotspot
  ) => {
    if (
      openedShellIds.includes(
        shell.id
      )
    ) {
      return;
    }

    keysPressed.current =
      {};

    touchDirectionRef.current =
      null;

    setActiveTouchDir(
      null
    );

    setIsMoving(false);

    setOpenedShellIds(
      (prev) => [
        ...prev,
        shell.id,
      ]
    );

    if (
      shell.reward ===
      'empty'
    ) {
      setOpenedShell({
        shell,
        title:
          'محارة فارغة',

        message:
          'ليست كل محارة تحمل لؤلؤة.',
      });

      return;
    }

    if (
      shell.reward ===
      'pearl'
    ) {
      setScore(
        (prev) =>
          prev +
          shell.points
      );

      setOpenedShell({
        shell,
        title:
          'لؤلؤة! +10',

        message:
          'عثرت على لؤلؤة جميلة.',
      });

      return;
    }

    setScore(
      (prev) =>
        prev +
        shell.points
    );

    setHasFoundDana(true);

    setOpenedShell({
      shell,
      title:
        'الدانة! +50',

      message:
        'وجدت الدانة، لؤلؤة كبيرة ثمينة.',
    });
  };

  /* ==========================================================
     COMPLETION
  ========================================================== */

  useEffect(() => {
    if (
      !hasFoundDana ||
      hasReportedComplete
    ) {
      return;
    }

    setHasReportedComplete(
      true
    );

    onComplete?.();
  }, [
    hasFoundDana,
    hasReportedComplete,
    onComplete,
  ]);

  /* ==========================================================
     CAMERA
  ========================================================== */

  const playerWorldPxX =
    (
      playerPos.x /
      100
    ) *
    WORLD_WIDTH;

  const playerWorldPxY =
    (
      playerPos.y /
      100
    ) *
    WORLD_HEIGHT;

  let focusX =
    WORLD_WIDTH *
    0.5;

  let focusY =
    WORLD_HEIGHT *
    0.22;

  if (
    phase === 'diving'
  ) {
    focusY =
      WORLD_HEIGHT *
      (
        0.22 +
        0.50 *
          diveProgress
      );
  }

  if (
    phase ===
      'underwater' ||
    phase ===
      'finished'
  ) {
    focusX =
      playerWorldPxX;

    focusY =
      playerWorldPxY;
  }

  const desiredCameraX =
    viewportSize.width /
      2 -
    focusX;

  const desiredCameraY =
    viewportSize.height /
      2 -
    focusY;

  const cameraX =
    viewportSize.width <=
    0
      ? 0
      : WORLD_WIDTH <=
          viewportSize.width
        ? (
            viewportSize.width -
            WORLD_WIDTH
          ) / 2
        : Math.min(
            0,

            Math.max(
              viewportSize.width -
                WORLD_WIDTH,

              desiredCameraX
            )
          );

  const cameraY =
    viewportSize.height <=
    0
      ? 0
      : WORLD_HEIGHT <=
          viewportSize.height
        ? (
            viewportSize.height -
            WORLD_HEIGHT
          ) / 2
        : Math.min(
            0,

            Math.max(
              viewportSize.height -
                WORLD_HEIGHT,

              desiredCameraY
            )
          );

  const diverFlip =
    lastHorizontalDirection ===
    'left'
      ? -1
      : 1;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      ref={
        viewportRef
      }
      data-character-gender={
        gender
      }
      className="
        relative
        w-full
        h-full
        overflow-hidden
        bg-[#06283a]
        select-none
      "
      dir="rtl"
    >
      {/* ======================================================
          WORLD
      ====================================================== */}

      <div
        className="
          absolute
          top-0
          left-0
          will-change-transform
          transition-transform
          duration-100
          ease-out
        "
        style={{
          width:
            `${WORLD_WIDTH}px`,

          height:
            `${WORLD_HEIGHT}px`,

          transform:
            `translate3d(${cameraX}px, ${cameraY}px, 0)`,
        }}
      >
        <img
          src={
            MASTER_IMAGE_PATH
          }
          alt="بحر اللؤلؤ"
          draggable={
            false
          }
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            pointer-events-none
            select-none
          "
        />

        {(phase ===
          'diving' ||
          phase ===
            'underwater' ||
          phase ===
            'finished') && (
          <div
            className="
              absolute
              inset-0
              pointer-events-none
            "
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,92,132,0.03), rgba(0,76,115,0.10))',
            }}
          />
        )}

        {/* ====================================================
            PEARL PULSE / SHELL HOTSPOTS
        ==================================================== */}

        {phase ===
          'underwater' &&
          SHELLS.map(
            (shell) => {
              const opened =
                openedShellIds.includes(
                  shell.id
                );

              const isNearest =
                nearestShell
                  ?.shell.id ===
                shell.id;

              if (
                opened
              ) {
                return null;
              }

              return (
                <div
                  key={
                    shell.id
                  }
                  className="
                    absolute
                    z-20
                    -translate-x-1/2
                    -translate-y-1/2
                    pointer-events-none
                  "
                  style={{
                    left:
                      `${shell.x}%`,

                    top:
                      `${shell.y}%`,
                  }}
                >
                  {isNearest &&
                    pulseStrength >
                      0.18 && (
                      <>
                        <div
                          className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            rounded-full
                            bg-[#FFD86A]/25
                            blur-xl
                            animate-pulse
                          "
                          style={{
                            width:
                              `${70 + pulseStrength * 80}px`,

                            height:
                              `${70 + pulseStrength * 80}px`,
                          }}
                        />

                        <div
                          className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            w-7
                            h-7
                            rounded-full
                            border-2
                            border-[#FFE082]/75
                            animate-ping
                          "
                        />
                      </>
                    )}
                </div>
              );
            }
          )}

        {/* ====================================================
            DIVER
        ==================================================== */}

        {(phase ===
          'underwater' ||
          phase ===
            'finished') && (
          <div
            id="pearl-diver-player"
            className="
              absolute
              z-30
              pointer-events-none
            "
            style={{
              left:
                `${playerPos.x}%`,

              top:
                `${playerPos.y}%`,

              transform:
                'translate(-50%, -50%)',
            }}
          >
            <div
              className="
                absolute
                left-1/2
                bottom-[-10px]
                -translate-x-1/2
                w-36
                h-7
                rounded-full
                bg-black/20
                blur-lg
              "
            />

            <div
              className={`
                relative
                transition-transform
                duration-100
                ease-out

                ${
                  isMoving
                    ? 'scale-[1.03]'
                    : 'scale-100'
                }
              `}
              style={{
                width:
                  '220px',

                maxWidth:
                  '27vw',
              }}
            >
              <img
                src={
                  DIVER_IMAGE_PATH
                }
                alt="غواص اللؤلؤ التقليدي"
                draggable={
                  false
                }
                className="
                  block
                  w-full
                  h-auto
                  object-contain
                  select-none
                  pointer-events-none
                  drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]
                "
                style={{
                  transform:
                    `scaleX(${diverFlip})`,

                  transformOrigin:
                    'center center',
                }}
              />

              {isMoving && (
                <>
                  <span
                    className={`
                      absolute
                      top-[18%]
                      w-3
                      h-3
                      rounded-full
                      border
                      border-white/70
                      bg-cyan-100/15
                      animate-ping

                      ${
                        lastHorizontalDirection ===
                        'right'
                          ? 'right-[2%]'
                          : 'left-[2%]'
                      }
                    `}
                  />

                  <span
                    className={`
                      absolute
                      top-[3%]
                      w-4
                      h-4
                      rounded-full
                      border
                      border-white/55
                      bg-cyan-100/10
                      animate-pulse

                      ${
                        lastHorizontalDirection ===
                        'right'
                          ? 'right-[10%]'
                          : 'left-[10%]'
                      }
                    `}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          SURFACE
      ====================================================== */}

      {phase ===
        'surface' && (
        <>
          <div
            className="
              fixed
              top-5
              right-5
              z-50
              bg-[#082d40]/90
              backdrop-blur-md
              border
              border-[#E6C280]/60
              rounded-full
              px-5
              py-2
              text-white
              shadow-xl
            "
          >
            <span
              className="
                font-black
                text-[#FFE082]
              "
            >
              بحر اللؤلؤ
            </span>
          </div>

          <button
            onClick={
              onReturnToVillage
            }
            className="
              fixed
              top-5
              left-5
              z-50
              rounded-full
              bg-[#8A1538]
              border
              border-[#FFE082]
              text-white
              px-5
              py-2.5
              font-bold
              shadow-xl
              active:scale-95
            "
          >
            العودة إلى القرية
          </button>

          <div
            className="
              fixed
              inset-x-0
              bottom-8
              z-50
              flex
              justify-center
              px-4
            "
          >
            <div
              className="
                w-full
                max-w-md
                rounded-[28px]
                border-2
                border-[#E6C280]
                bg-[#082d40]/88
                backdrop-blur-md
                p-5
                text-center
                shadow-[0_20px_60px_rgba(0,0,0,0.45)]
              "
            >
              <div
                className="
                  mx-auto
                  mb-3
                  w-14
                  h-14
                  rounded-full
                  bg-[#8A1538]
                  border
                  border-[#FFE082]
                  flex
                  items-center
                  justify-center
                "
              >
                <Anchor
                  className="
                    w-7
                    h-7
                    text-[#FFE082]
                  "
                />
              </div>

              <h2
                className="
                  text-2xl
                  font-black
                  text-[#FFE082]
                "
              >
                رحلة إلى قاع الزمن
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-white/90
                  leading-7
                "
              >
                اقترب من المحار واتبع نبض اللؤلؤ للعثور على الدانة.
              </p>

              <button
                onClick={
                  startDive
                }
                className="
                  mt-4
                  w-full
                  py-3.5
                  rounded-2xl
                  bg-[#8A1538]
                  border-2
                  border-[#FFE082]
                  text-[#FFE082]
                  font-black
                  text-lg
                  active:scale-95
                  transition-transform
                  shadow-lg
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Waves
                  className="
                    w-6
                    h-6
                  "
                />

                <span>
                  ابدأ رحلة الغوص
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ======================================================
          DIVING TRANSITION
      ====================================================== */}

      {phase ===
        'diving' && (
        <div
          className="
            fixed
            inset-0
            z-40
            pointer-events-none
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-[#006b94]
            "
            style={{
              opacity:
                0.05 +
                diveProgress *
                  0.20,
            }}
          />

          <div
            className="
              relative
              text-center
            "
          >
            <div
              className="
                mx-auto
                relative
                w-28
                h-28
              "
            >
              <div
                className="
                  absolute
                  left-2
                  bottom-1
                  w-4
                  h-4
                  border-2
                  border-white/70
                  rounded-full
                  animate-ping
                "
              />

              <div
                className="
                  absolute
                  right-4
                  top-5
                  w-7
                  h-7
                  border-2
                  border-white/60
                  rounded-full
                  animate-pulse
                "
              />
            </div>

            <div
              className="
                mt-2
                px-6
                py-3
                rounded-full
                bg-black/35
                border
                border-white/25
                text-white
                font-bold
                backdrop-blur-md
              "
            >
              ننزل إلى عالم اللؤلؤ...
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          UNDERWATER HUD
      ====================================================== */}

      {phase ===
        'underwater' && (
        <>
          {/* RIGHT HUD */}

          <div
            className="
              fixed
              top-4
              right-4
              z-50
              flex
              flex-col
              items-end
              gap-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-[#06283a]/90
                border
                border-[#E6C280]/55
                px-4
                py-2
                backdrop-blur-md
                shadow-xl
              "
            >
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-full
                  bg-cyan-300
                  animate-pulse
                "
              />

              <span
                className="
                  font-black
                  text-[#FFE082]
                "
              >
                قاع بحر اللؤلؤ
              </span>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-black/45
                border
                border-white/20
                px-4
                py-2
                text-white
                backdrop-blur-md
              "
            >
              <Clock3
                className="
                  w-4
                  h-4
                  text-cyan-200
                "
              />

              <span
                className="
                  font-black
                "
              >
                {timeLeft}
              </span>

              <span
                className="
                  text-white/70
                  text-xs
                "
              >
                ثانية
              </span>
            </div>

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                bg-black/45
                border
                border-white/20
                px-4
                py-2
                backdrop-blur-md
              "
            >
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <span
                    key={
                      index
                    }
                    className={`
                      w-4
                      h-4
                      rounded-full
                      border
                      transition-all

                      ${
                        index <
                        breathCount
                          ? 'bg-cyan-300/70 border-white/70 shadow-[0_0_9px_rgba(103,232,249,.55)]'
                          : 'bg-white/5 border-white/15'
                      }
                    `}
                  />
                )
              )}

              <span
                className="
                  mr-2
                  text-xs
                  text-white/80
                "
              >
                النفس
              </span>
            </div>
          </div>

          {/* LEFT HUD */}

          <div
            className="
              fixed
              top-4
              left-4
              z-50
              flex
              flex-col
              gap-2
              items-start
            "
          >
            <button
              onClick={
                onReturnToVillage
              }
              className="
                rounded-full
                bg-[#8A1538]
                border
                border-[#FFE082]
                text-white
                px-5
                py-2.5
                font-bold
                shadow-xl
                active:scale-95
              "
            >
              العودة إلى القرية
            </button>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-black/45
                border
                border-[#FFE082]/40
                px-4
                py-2
                text-[#FFE082]
                backdrop-blur-md
              "
            >
              <Gem
                className="
                  w-4
                  h-4
                "
              />

              <span
                className="
                  font-black
                "
              >
                {score}
              </span>

              <span
                className="
                  text-xs
                "
              >
                نقطة
              </span>
            </div>
          </div>

          {/* PEARL PULSE GUIDE */}

          {nearestShell &&
            pulseStrength >
              0.12 && (
              <div
                className="
                  fixed
                  left-1/2
                  top-5
                  -translate-x-1/2
                  z-50
                  pointer-events-none
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#5a381a]/80
                    border
                    border-[#FFE082]/60
                    px-4
                    py-2
                    text-[#FFE082]
                    backdrop-blur-md
                    shadow-xl
                  "
                  style={{
                    transform:
                      `scale(${0.94 + pulseStrength * 0.10})`,
                  }}
                >
                  <Sparkles
                    className="
                      w-4
                      h-4
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      text-sm
                      font-black
                    "
                  >
                    نبض اللؤلؤ
                  </span>

                  <span
                    className="
                      text-xs
                      text-white/80
                    "
                  >
                    {pulseStrength >
                    0.72
                      ? 'قريب جدًا'
                      : pulseStrength >
                          0.45
                        ? 'اقترب أكثر'
                        : 'اتبع الوهج'}
                  </span>
                </div>
              </div>
            )}

          {/* OPEN SHELL ACTION */}

          {nearShell && (
            <button
              onClick={() =>
                openShell(
                  nearShell
                )
              }
              className="
                fixed
                left-1/2
                bottom-7
                -translate-x-1/2
                z-[120]
                flex
                items-center
                gap-2
                rounded-full
                bg-[#8A1538]
                border-2
                border-[#FFE082]
                px-6
                py-3
                text-[#FFE082]
                font-black
                shadow-[0_10px_30px_rgba(0,0,0,.45)]
                active:scale-95
                animate-pulse
              "
            >
              <Shell
                className="
                  w-5
                  h-5
                "
              />

              افتح المحارة
            </button>
          )}

          {/* D-PAD */}

          <div
            className="
              fixed
              bottom-6
              left-6
              z-[100]
              w-[138px]
              h-[138px]
              rounded-full
              bg-[#032536]/90
              border-2
              border-[#E6C280]
              shadow-[0_8px_30px_rgba(0,0,0,0.55)]
              backdrop-blur-md
              touch-none
              select-none
            "
          >
            <button
              onPointerDown={(
                e
              ) => {
                e.preventDefault();

                handleTouchStart(
                  'up'
                );
              }}
              onPointerUp={
                handleTouchEnd
              }
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
                active:scale-90

                ${
                  activeTouchDir ===
                  'up'
                    ? 'bg-[#A91D47]'
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

            <button
              onPointerDown={(
                e
              ) => {
                e.preventDefault();

                handleTouchStart(
                  'down'
                );
              }}
              onPointerUp={
                handleTouchEnd
              }
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
                active:scale-90

                ${
                  activeTouchDir ===
                  'down'
                    ? 'bg-[#A91D47]'
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

            <button
              onPointerDown={(
                e
              ) => {
                e.preventDefault();

                handleTouchStart(
                  'left'
                );
              }}
              onPointerUp={
                handleTouchEnd
              }
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
                active:scale-90

                ${
                  activeTouchDir ===
                  'left'
                    ? 'bg-[#A91D47]'
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

            <button
              onPointerDown={(
                e
              ) => {
                e.preventDefault();

                handleTouchStart(
                  'right'
                );
              }}
              onPointerUp={
                handleTouchEnd
              }
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
                active:scale-90

                ${
                  activeTouchDir ===
                  'right'
                    ? 'bg-[#A91D47]'
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
                pointer-events-none
              "
            >
              ✦
            </div>
          </div>
        </>
      )}

      {/* ======================================================
          OPEN SHELL MODAL
      ====================================================== */}

      {openedShell && (
        <div
          className="
            fixed
            inset-0
            z-[300]
            bg-black/65
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              relative
              w-full
              max-w-lg
              rounded-[30px]
              border-2
              border-[#E6C280]
              bg-gradient-to-b
              from-[#123e50]
              to-[#06283a]
              p-6
              text-center
              shadow-[0_30px_100px_rgba(0,0,0,.65)]
            "
          >
            <button
              onClick={() =>
                setOpenedShell(
                  null
                )
              }
              className="
                absolute
                top-4
                left-4
                w-10
                h-10
                rounded-full
                bg-black/30
                border
                border-white/20
                text-white
                flex
                items-center
                justify-center
                active:scale-90
              "
              aria-label="إغلاق"
            >
              <X
                className="
                  w-5
                  h-5
                "
              />
            </button>

            <div
              className="
                relative
                mx-auto
                w-56
                h-48
                flex
                items-center
                justify-center
                [perspective:900px]
              "
            >
              <div
                className="
                  absolute
                  inset-6
                  rounded-full
                  bg-[#FFE082]/20
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  text-[130px]
                  leading-none
                  drop-shadow-[0_18px_20px_rgba(0,0,0,.35)]
                  animate-[pulse_1.8s_ease-in-out_infinite]
                "
              >
                {openedShell
                  .shell
                  .reward ===
                'empty'
                  ? '🦪'
                  : openedShell
                        .shell
                        .reward ===
                      'pearl'
                    ? '🦪'
                    : '🦪'}
              </div>

              {openedShell
                .shell
                .reward !==
                'empty' && (
                <div
                  className={`
                    absolute
                    bottom-11
                    left-1/2
                    -translate-x-1/2
                    rounded-full
                    bg-white
                    shadow-[0_0_28px_rgba(255,248,207,.95)]

                    ${
                      openedShell
                        .shell
                        .reward ===
                      'dana'
                        ? 'w-14 h-14'
                        : 'w-9 h-9'
                    }
                  `}
                />
              )}

              {openedShell
                .shell
                .reward ===
                'dana' && (
                <Sparkles
                  className="
                    absolute
                    top-6
                    right-10
                    w-9
                    h-9
                    text-[#FFE082]
                    animate-pulse
                  "
                />
              )}
            </div>

            <h3
              className="
                text-2xl
                font-black
                text-[#FFE082]
              "
            >
              {
                openedShell.title
              }
            </h3>

            <p
              className="
                mt-2
                text-white/90
                text-base
                leading-7
              "
            >
              {
                openedShell.message
              }
            </p>

            {openedShell
              .shell
              .reward ===
              'dana' && (
              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[#FFE082]
                  text-sm
                "
              >
                <Rotate3D
                  className="
                    w-5
                    h-5
                  "
                />

                الدانة من أثمن ما كان يبحث عنه الغواص.
              </div>
            )}

            <button
              onClick={() =>
                setOpenedShell(
                  null
                )
              }
              className="
                mt-6
                w-full
                rounded-2xl
                bg-[#8A1538]
                border-2
                border-[#FFE082]
                py-3
                text-[#FFE082]
                font-black
                active:scale-95
              "
            >
              أكمل الغوص
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          FINISH / TIME OUT
      ====================================================== */}

      {phase ===
        'finished' && (
        <div
          className="
            fixed
            inset-0
            z-[250]
            bg-black/60
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-[30px]
              border-2
              border-[#E6C280]
              bg-[#082d40]/95
              p-6
              text-center
              shadow-2xl
            "
          >
            <div
              className="
                mx-auto
                w-16
                h-16
                rounded-full
                bg-[#8A1538]
                border
                border-[#FFE082]
                flex
                items-center
                justify-center
              "
            >
              {hasFoundDana ? (
                <Award
                  className="
                    w-8
                    h-8
                    text-[#FFE082]
                  "
                />
              ) : (
                <Clock3
                  className="
                    w-8
                    h-8
                    text-[#FFE082]
                  "
                />
              )}
            </div>

            <h2
              className="
                mt-4
                text-2xl
                font-black
                text-[#FFE082]
              "
            >
              {hasFoundDana
                ? 'أحسنت! وجدت الدانة'
                : 'انتهى وقت الغوص'}
            </h2>

            <p
              className="
                mt-2
                text-white/90
              "
            >
              مجموع نقاطك:
              {' '}
              <span
                className="
                  text-[#FFE082]
                  font-black
                "
              >
                {score}
              </span>
            </p>

            {!hasFoundDana && (
              <button
                onClick={
                  restartDive
                }
                className="
                  mt-5
                  w-full
                  rounded-2xl
                  bg-[#8A1538]
                  border-2
                  border-[#FFE082]
                  py-3
                  text-[#FFE082]
                  font-black
                  active:scale-95
                "
              >
                حاول مرة أخرى
              </button>
            )}

            <button
              onClick={
                onReturnToVillage
              }
              className="
                mt-3
                w-full
                rounded-2xl
                bg-[#5b3b27]
                border
                border-[#E6C280]/60
                py-3
                text-white
                font-bold
                active:scale-95
              "
            >
              العودة إلى القرية
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          DANA SUCCESS ACTION
      ====================================================== */}

      {phase ===
        'underwater' &&
        hasFoundDana &&
        !openedShell && (
          <button
            onClick={() =>
              setPhase(
                'finished'
              )
            }
            className="
              fixed
              right-5
              bottom-6
              z-[120]
              flex
              items-center
              gap-2
              rounded-full
              bg-[#8A1538]
              border-2
              border-[#FFE082]
              px-5
              py-3
              text-[#FFE082]
              font-black
              shadow-xl
              active:scale-95
            "
          >
            <Award
              className="
                w-5
                h-5
              "
            />

            إنهاء الرحلة
          </button>
        )}
    </div>
  );
}
'''

path = Path('/mnt/data/PearlScene_complete.tsx')
path.write_text(code, encoding='utf-8')
print(f"Created {path} with {len(code.splitlines())} lines")
