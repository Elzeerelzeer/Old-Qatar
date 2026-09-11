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
  Volume2,
  X,
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
   EDUCATIONAL CONTENT
============================================================ */

interface SouqItem {
  name: string;
  icon: string;
  description: string;
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

const SOUQ_HOTSPOTS: SouqHotspot[] = [
  {
    id: 'pottery',
    name: 'دكان الفخار',
    x: 25,
    y: 38,
    radius: 14,
    intro: 'تعرّف على بعض الأواني المستخدمة في قطر لوّل.',
    items: [
      {
        name: 'الجرة',
        icon: '🏺',
        description:
          'إناء فخاري استُخدم لحفظ الماء وبعض المواد الغذائية.',
      },
      {
        name: 'القدر الفخاري',
        icon: '🥘',
        description:
          'استخدمت الأواني الفخارية في إعداد وحفظ بعض الأطعمة.',
      },
      {
        name: 'الدلة',
        icon: '🫖',
        description:
          'تُستخدم الدلة لإعداد وتقديم القهوة العربية للضيوف.',
      },
    ],
  },

  {
    id: 'spices',
    name: 'دكان العطّار',
    x: 75,
    y: 38,
    radius: 14,
    intro: 'اكتشف روائح وتوابل السوق القطري القديم.',
    items: [
      {
        name: 'الهيل',
        icon: '🌿',
        description:
          'من أشهر المكونات التي تُضاف إلى القهوة العربية.',
      },
      {
        name: 'الزعفران',
        icon: '🌼',
        description:
          'من التوابل الثمينة ويستخدم في الأطعمة والمشروبات.',
      },
      {
        name: 'القرفة',
        icon: '🪵',
        description:
          'نوع من التوابل العطرية استُخدم في الطعام والمشروبات.',
      },
      {
        name: 'القرنفل',
        icon: '🌱',
        description:
          'توابل عطرية ذات رائحة قوية ومميزة.',
      },
    ],
  },

  {
    id: 'fabrics',
    name: 'الأقمشة والسلال',
    x: 26,
    y: 68,
    radius: 14,
    intro: 'تعرّف على منتجات النسيج والخوص في السوق.',
    items: [
      {
        name: 'السلة',
        icon: '🧺',
        description:
          'كانت السلال تُصنع من الخوص وتستخدم لحمل وحفظ الأغراض.',
      },
      {
        name: 'الخوص',
        icon: '🌴',
        description:
          'مادة تؤخذ من سعف النخيل وتستخدم في صناعة منتجات متنوعة.',
      },
      {
        name: 'الأقمشة',
        icon: '🧵',
        description:
          'كانت الأقمشة تباع في الأسواق لصناعة الملابس والمفروشات.',
      },
    ],
  },

  {
    id: 'antiques',
    name: 'الأدوات القديمة',
    x: 74,
    y: 68,
    radius: 14,
    intro: 'شاهد أدوات استخدمها التجار في الأسواق قديمًا.',
    items: [
      {
        name: 'الميزان',
        icon: '⚖️',
        description:
          'كان التاجر يستخدم الميزان لوزن السلع قبل بيعها.',
      },
      {
        name: 'الصندوق الخشبي',
        icon: '📦',
        description:
          'استُخدم لحفظ البضائع والأغراض ونقلها.',
      },
      {
        name: 'الفانوس',
        icon: '🏮',
        description:
          'استخدم الفانوس للإضاءة قبل انتشار الكهرباء.',
      },
    ],
  },

  {
    id: 'falconer',
    name: 'ركن الصقّار',
    x: 50,
    y: 28,
    radius: 13,
    intro: 'اكتشف بعض أدوات الصقّار والتراث المرتبط بالصقور.',
    items: [
      {
        name: 'الصقر',
        icon: '🦅',
        description:
          'للصقور مكانة معروفة في التراث القطري والخليجي.',
      },
      {
        name: 'قفاز الصقّار',
        icon: '🧤',
        description:
          'يرتديه الصقّار لحماية يده عند حمل الصقر.',
      },
      {
        name: 'المجثم',
        icon: '🪵',
        description:
          'مكان مخصص ليستقر عليه الصقر.',
      },
    ],
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
  { id: 'wall_north', x: 0, y: 0, width: 100, height: 16 },
  { id: 'wall_west', x: 0, y: 0, width: 14, height: 100 },
  { id: 'wall_east', x: 86, y: 0, width: 14, height: 100 },

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

  {
    id: 'block_pottery_deep',
    x: 14,
    y: 16,
    width: 15,
    height: 26,
  },

  {
    id: 'block_spices_deep',
    x: 71,
    y: 16,
    width: 15,
    height: 26,
  },

  {
    id: 'block_fabrics_deep',
    x: 14,
    y: 52,
    width: 15,
    height: 26,
  },

  {
    id: 'block_antiques_deep',
    x: 71,
    y: 52,
    width: 15,
    height: 26,
  },

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
  const [playerPos, setPlayerPos] = useState({
    x: 50,
    y: 86,
  });

  const [direction, setDirection] =
    useState<Direction>('up');

  const [isMoving, setIsMoving] =
    useState(false);

  const [activeTouchDir, setActiveTouchDir] =
    useState<Direction | null>(null);

  /* Educational modal */

  const [selectedHotspot, setSelectedHotspot] =
    useState<SouqHotspot | null>(null);

  const [selectedItem, setSelectedItem] =
    useState<SouqItem | null>(null);

  const keysPressed =
    useRef<Record<string, boolean>>({});

  const touchDirectionRef =
    useRef<Direction | null>(null);

  const MOVE_SPEED =
    settings.walkSpeed === 'calm'
      ? 0.38
      : 0.55;

  const PLAYER_RADIUS = 2;

  /* ============================================================
     COLLISION
  ============================================================ */

  const checkCollision = useCallback(
    (targetX: number, targetY: number) => {
      if (
        targetX < 14 ||
        targetX > 86 ||
        targetY < 18 ||
        targetY > 93
      ) {
        return true;
      }

      for (const box of SOUQ_COLLIDERS) {
        if (
          targetX + PLAYER_RADIUS > box.x &&
          targetX - PLAYER_RADIUS <
            box.x + box.width &&
          targetY + PLAYER_RADIUS > box.y &&
          targetY - PLAYER_RADIUS <
            box.y + box.height
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
  }, []);

  /* ============================================================
     MOVEMENT LOOP
  ============================================================ */

  useEffect(() => {
    let frame: number;
    let footstepCounter = 0;

    const loop = () => {
      let dx = 0;
      let dy = 0;

      let nextDirection:
        | Direction
        | null = null;

      const keys =
        keysPressed.current;

      const touch =
        touchDirectionRef.current;

      if (
        keys.arrowup ||
        keys.w ||
        touch === 'up'
      ) {
        dy -= MOVE_SPEED;
        nextDirection = 'up';
      }

      if (
        keys.arrowdown ||
        keys.s ||
        touch === 'down'
      ) {
        dy += MOVE_SPEED;
        nextDirection = 'down';
      }

      if (
        keys.arrowleft ||
        keys.a ||
        touch === 'left'
      ) {
        dx -= MOVE_SPEED;
        nextDirection = 'left';
      }

      if (
        keys.arrowright ||
        keys.d ||
        touch === 'right'
      ) {
        dx += MOVE_SPEED;
        nextDirection = 'right';
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);

        if (nextDirection) {
          setDirection(nextDirection);
        }

        setPlayerPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          if (
            !checkCollision(
              prev.x + dx,
              prev.y
            )
          ) {
            nextX =
              prev.x + dx;
          }

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

        footstepCounter++;

        if (
          footstepCounter % 18 === 0 &&
          settings.isSoundEnabled &&
          !settings.isQuietMode
        ) {
          soundManager.playFootstep();
        }
      } else {
        setIsMoving(false);
      }

      frame =
        requestAnimationFrame(loop);
    };

    frame =
      requestAnimationFrame(loop);

    return () =>
      cancelAnimationFrame(frame);
  }, [
    checkCollision,
    settings.isSoundEnabled,
    settings.isQuietMode,
    MOVE_SPEED,
  ]);

  /* ============================================================
     TOUCH
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
     HOTSPOT
  ============================================================ */

  const activeNearbyHotspot =
    SOUQ_HOTSPOTS.find(
      (spot) => {
        const distance =
          Math.hypot(
            playerPos.x - spot.x,
            playerPos.y - spot.y
          );

        return (
          distance <= spot.radius
        );
      }
    );

  /* ============================================================
     ARABIC SPEECH
  ============================================================ */

  const speakArabic = (
    text: string
  ) => {
    try {
      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang = 'ar-QA';
      utterance.rate = 0.82;
      utterance.pitch = 1;

      window.speechSynthesis.speak(
        utterance
      );
    } catch {
      // Ignore unsupported browsers
    }
  };

  /* ============================================================
     CAMERA
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
     UI
  ============================================================ */

  return (
    <div
      className="
        relative
        w-full
        h-full
        overflow-hidden
        bg-[#1a0e08]
        select-none
      "
      dir="rtl"
    >
      {/* HEADER */}

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
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
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

              shadow-xl

              text-[#FAF5EA]
              font-bold
            "
          >
            سوق لوّل
          </div>

          <div
            className="
              pointer-events-auto
              bg-[#2b170d]/90

              border
              border-[#E6C280]/40

              px-4
              py-2

              rounded-full

              text-xs
              text-[#FAF5EA]
            "
          >
            رحلة السوق{' '}

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

            text-white

            border
            border-[#FFE082]

            px-4
            py-2

            rounded-full

            shadow-xl

            font-bold

            active:scale-95
          "
        >
          <ArrowRight
            className="
              w-4
              h-4
            "
          />

          العودة إلى القرية
        </button>
      </div>

      {/* ======================================================
          WORLD
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
        {/* MASTER MAP */}

        <img
          src="/assets/souq-master-map.png.jpeg"
          alt="سوق لوّل"
          draggable={false}
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

        {/* HOTSPOTS */}

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
                  z-20

                  -translate-x-1/2
                  -translate-y-1/2
                "
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                }}
              >
                {isNear && (
                  <>
                    <div
                      className="
                        absolute
                        -inset-14

                        rounded-full

                        bg-[#FFD76B]/25

                        blur-2xl

                        animate-pulse

                        pointer-events-none
                      "
                    />

                    <button
                      onClick={() => {
                        soundManager.playClick();

                        setSelectedHotspot(
                          spot
                        );

                        setSelectedItem(
                          null
                        );
                      }}
                      className="
                        relative

                        bg-[#8A1538]/95

                        border
                        border-[#FFE082]

                        text-[#FFE082]

                        px-4
                        py-2

                        rounded-full

                        shadow-xl

                        flex
                        items-center
                        gap-2

                        font-black

                        active:scale-95
                      "
                    >
                      <Sparkles
                        className="
                          w-4
                          h-4
                        "
                      />

                      تعرّف
                    </button>
                  </>
                )}
              </div>
            );
          }
        )}

        {/* PLAYER */}

        <div
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
          <div
            className="
              absolute
              bottom-1
              left-1/2

              -translate-x-1/2

              w-9
              h-4

              bg-black/45

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
          LARGE D-PAD
      ====================================================== */}

      <div
        className="
          fixed
          bottom-6
          left-6

          z-[100]

          w-[138px]
          h-[138px]

          rounded-full

          bg-[#2d180f]/90

          border-2
          border-[#E6C280]

          shadow-[0_8px_30px_rgba(0,0,0,0.55)]

          backdrop-blur-md

          touch-none
        "
      >
        {/* UP */}

        <button
          onPointerDown={() =>
            handleTouchStart(
              'up'
            )
          }
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

            ${
              activeTouchDir ===
              'up'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }
          `}
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
          onPointerDown={() =>
            handleTouchStart(
              'down'
            )
          }
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

            ${
              activeTouchDir ===
              'down'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }
          `}
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
          onPointerDown={() =>
            handleTouchStart(
              'left'
            )
          }
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

            ${
              activeTouchDir ===
              'left'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }
          `}
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
          onPointerDown={() =>
            handleTouchStart(
              'right'
            )
          }
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

            ${
              activeTouchDir ===
              'right'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }
          `}
        >
          <ArrowRight
            className="
              w-7
              h-7
              stroke-[3]
            "
          />
        </button>

        {/* CENTER */}

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

      {/* ======================================================
          EDUCATIONAL MODAL
      ====================================================== */}

      {selectedHotspot && (
        <div
          className="
            fixed
            inset-0

            z-[200]

            flex
            items-center
            justify-center

            p-4

            bg-black/55

            backdrop-blur-sm
          "
        >
          <div
            className="
              relative

              w-full
              max-w-lg

              bg-[#2c170d]/95

              border-2
              border-[#E6C280]

              rounded-[28px]

              shadow-[0_20px_70px_rgba(0,0,0,0.65)]

              p-5

              text-[#FAF5EA]
            "
          >
            {/* CLOSE */}

            <button
              onClick={() => {
                window.speechSynthesis.cancel();

                setSelectedHotspot(
                  null
                );

                setSelectedItem(
                  null
                );
              }}
              className="
                absolute
                top-3
                left-3

                w-9
                h-9

                rounded-full

                bg-black/30

                border
                border-[#E6C280]/40

                flex
                items-center
                justify-center
              "
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
                text-center
                mb-5
              "
            >
              <div
                className="
                  text-[#FFE082]

                  text-2xl

                  font-black
                "
              >
                {
                  selectedHotspot.name
                }
              </div>

              <div
                className="
                  mt-2

                  text-sm

                  text-[#eadbc5]
                "
              >
                {
                  selectedHotspot.intro
                }
              </div>
            </div>

            {/* ITEMS */}

            {!selectedItem && (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                {selectedHotspot.items.map(
                  (item) => (
                    <button
                      key={
                        item.name
                      }
                      onClick={() => {
                        soundManager.playClick();

                        setSelectedItem(
                          item
                        );
                      }}
                      className="
                        min-h-[100px]

                        rounded-2xl

                        bg-[#4b2918]

                        border
                        border-[#E6C280]/35

                        hover:border-[#FFE082]

                        active:scale-95

                        transition

                        p-3
                      "
                    >
                      <div
                        className="
                          text-4xl
                        "
                      >
                        {
                          item.icon
                        }
                      </div>

                      <div
                        className="
                          mt-2

                          text-[#FFE082]

                          font-black

                          text-sm
                        "
                      >
                        {
                          item.name
                        }
                      </div>
                    </button>
                  )
                )}
              </div>
            )}

            {/* ITEM DETAILS */}

            {selectedItem && (
              <div
                className="
                  text-center

                  bg-black/20

                  border
                  border-[#E6C280]/25

                  rounded-2xl

                  p-5
                "
              >
                <div
                  className="
                    text-6xl
                  "
                >
                  {
                    selectedItem.icon
                  }
                </div>

                <h3
                  className="
                    mt-3

                    text-xl

                    text-[#FFE082]

                    font-black
                  "
                >
                  {
                    selectedItem.name
                  }
                </h3>

                <p
                  className="
                    mt-3

                    leading-8

                    text-[#FAF5EA]

                    text-base
                  "
                >
                  {
                    selectedItem.description
                  }
                </p>

                <div
                  className="
                    mt-5

                    flex
                    justify-center
                    gap-3
                  "
                >
                  <button
                    onClick={() =>
                      speakArabic(
                        `${selectedItem.name}. ${selectedItem.description}`
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2

                      bg-[#8A1538]

                      border
                      border-[#FFE082]

                      rounded-full

                      px-5
                      py-2.5

                      text-[#FFE082]

                      font-black

                      active:scale-95
                    "
                  >
                    <Volume2
                      className="
                        w-5
                        h-5
                      "
                    />

                    استمع
                  </button>

                  <button
                    onClick={() => {
                      window.speechSynthesis.cancel();

                      setSelectedItem(
                        null
                      );
                    }}
                    className="
                      rounded-full

                      bg-[#62402c]

                      border
                      border-[#E6C280]/40

                      px-5
                      py-2.5

                      font-bold
                    "
                  >
                    رجوع
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
