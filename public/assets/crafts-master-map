import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CheckCircle2,
  Hammer,
  Layers3,
  Leaf,
  Sparkles,
  X,
} from 'lucide-react';

import {
  CharacterGender,
  GameSettings,
} from '../types';

interface CraftsSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
  onComplete?: () => void;
}

type CraftId =
  | 'sadu'
  | 'palm'
  | 'dhow';

const MASTER_IMAGE_PATH =
  '/assets/crafts-master-map.png';

const CRAFT_TITLES: Record<
  CraftId,
  string
> = {
  sadu: 'السدو',
  palm: 'الخوص',
  dhow: 'صناعة المحمل',
};

export function CraftsScene({
  settings,
  onReturnToVillage,
  onComplete,
}: CraftsSceneProps) {
  const [
    activeCraft,
    setActiveCraft,
  ] =
    useState<CraftId | null>(
      null
    );

  const [
    completed,
    setCompleted,
  ] =
    useState<CraftId[]>([]);

  const [
    showSuccess,
    setShowSuccess,
  ] =
    useState(false);

  const [
    reinforcement,
    setReinforcement,
  ] =
    useState<string | null>(
      null
    );

  const [
    showIntro,
    setShowIntro,
  ] =
    useState(true);

  const reportedRef =
    useRef(false);

  const speakArabic = (
    message: string
  ) => {
    if (
      !settings.isSoundEnabled
    ) {
      return;
    }

    if (
      typeof window ===
        'undefined' ||
      !(
        'speechSynthesis' in
        window
      )
    ) {
      return;
    }

    const synth =
      window.speechSynthesis;

    synth.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    const voices =
      synth.getVoices();

    const voice =
      voices.find(
        v =>
          v.lang ===
          'ar-QA'
      ) ||
      voices.find(
        v =>
          v.lang ===
          'ar-SA'
      ) ||
      voices.find(
        v =>
          v.lang
            .toLowerCase()
            .startsWith(
              'ar'
            )
      );

    if (voice) {
      utterance.voice =
        voice;
    }

    utterance.lang =
      voice?.lang ||
      'ar-SA';

    utterance.rate =
      0.86;

    utterance.volume =
      Math.max(
        0.2,
        Math.min(
          1,
          settings.volume ??
            0.6
        )
      );

    synth.speak(
      utterance
    );
  };

  const playChime = () => {
    if (
      !settings.isSoundEnabled ||
      typeof window ===
        'undefined'
    ) {
      return;
    }

    try {
      const Ctx =
        window.AudioContext ||
        (window as any)
          .webkitAudioContext;

      if (!Ctx) return;

      const ctx =
        new Ctx();

      const now =
        ctx.currentTime;

      [
        523.25,
        659.25,
        783.99,
      ].forEach(
        (
          frequency,
          index
        ) => {
          const osc =
            ctx.createOscillator();

          const gain =
            ctx.createGain();

          osc.type =
            'sine';

          osc.frequency.value =
            frequency;

          gain.gain.setValueAtTime(
            0.0001,
            now +
              index *
                0.1
          );

          gain.gain.exponentialRampToValueAtTime(
            Math.max(
              0.04,
              (settings.volume ??
                0.6) *
                0.1
            ),
            now +
              index *
                0.1 +
              0.02
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now +
              index *
                0.1 +
              0.26
          );

          osc.connect(
            gain
          );

          gain.connect(
            ctx.destination
          );

          osc.start(
            now +
              index *
                0.1
          );

          osc.stop(
            now +
              index *
                0.1 +
              0.28
          );
        }
      );

      window.setTimeout(
        () =>
          ctx
            .close()
            .catch(
              () =>
                undefined
            ),
        900
      );
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    const timer =
      window.setTimeout(
        () =>
          setShowIntro(
            false
          ),
        6000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  useEffect(() => {
    if (
      !settings.isSoundEnabled
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          speakArabic(
            'مرحباً بك في بيت الحرف. اختر السدو، أو الخوص، أو صناعة المحمل.'
          );
        },
        450
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    settings.isSoundEnabled,
  ]);

  const completeCraft = (
    id: CraftId
  ) => {
    const title =
      CRAFT_TITLES[id];

    setCompleted(
      previous => {
        if (
          previous.includes(
            id
          )
        ) {
          return previous;
        }

        const next = [
          ...previous,
          id,
        ];

        playChime();

        setReinforcement(
          `أحسنت! أكملت ${title}`
        );

        speakArabic(
          `أحسنت. أكملت ${title}.`
        );

        window.setTimeout(
          () =>
            setReinforcement(
              null
            ),
          2300
        );

        if (
          next.length >= 2 &&
          !reportedRef.current
        ) {
          reportedRef.current =
            true;

          window.setTimeout(
            () => {
              onComplete?.();

              setShowSuccess(
                true
              );

              playChime();

              speakArabic(
                'ممتاز. أنجزت حرفتين وحصلت على ختم بيت الحرف.'
              );
            },
            450
          );
        }

        return next;
      }
    );

    setActiveCraft(
      null
    );
  };

  const isDone = (
    id: CraftId
  ) =>
    completed.includes(
      id
    );

  return (
    <div
      className="
        relative
        w-full
        h-screen
        overflow-hidden
        bg-[#8d623f]
        text-white
        select-none
      "
      dir="rtl"
    >
      <div
        className="
          absolute
          inset-0
          bg-[linear-gradient(135deg,#b9895f,#8a5e3d_48%,#5a3827)]
        "
      />

      <img
        src={
          MASTER_IMAGE_PATH
        }
        alt="بيت الحرف"
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
        "
        onError={e => {
          e.currentTarget.style.display =
            'none';
        }}
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-black/10
          via-transparent
          to-black/30
          pointer-events-none
        "
      />

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
          border-2
          border-[#FFE082]
          px-5
          py-2.5
          text-white
          font-black
          shadow-xl
          active:scale-95
        "
      >
        العودة إلى القرية
      </button>

      <div
        className="
          fixed
          top-5
          right-5
          z-50
          rounded-full
          bg-[#402718]/92
          border
          border-[#E6C280]
          px-5
          py-2.5
          text-[#FFE082]
          font-black
          shadow-xl
        "
      >
        بيت الحرف
      </div>

      <div
        className="
          fixed
          top-[76px]
          right-5
          z-50
          rounded-2xl
          bg-[#402718]/92
          border
          border-white/20
          px-5
          py-3
          shadow-xl
        "
      >
        <span
          className="
            text-[#FFE082]
            text-xl
            font-black
          "
        >
          {
            completed.length
          }
          /2
        </span>

        <span
          className="
            mr-2
            text-sm
          "
        >
          للحصول على الختم
        </span>
      </div>

      {showIntro && (
        <div
          className="
            fixed
            top-5
            left-1/2
            -translate-x-1/2
            z-[110]
            w-[min(92vw,600px)]
            rounded-2xl
            border-2
            border-[#FFE082]
            bg-[#402718]/95
            px-5
            py-3
            text-center
            shadow-2xl
            backdrop-blur-md
          "
        >
          <div
            className="
              text-lg
              sm:text-xl
              font-black
              text-[#FFE082]
            "
          >
            أي حرفة
            ستجرب؟
          </div>

          <div
            className="
              mt-1
              text-sm
              sm:text-base
              font-bold
              text-white/90
            "
          >
            جرّب حرفتين
            من تراث قطر
            للحصول على
            الختم.
          </div>
        </div>
      )}

      {reinforcement && (
        <div
          className="
            fixed
            top-[92px]
            left-1/2
            -translate-x-1/2
            z-[220]
            flex
            items-center
            gap-2
            rounded-full
            border-2
            border-[#FFE082]
            bg-emerald-800/95
            px-6
            py-3
            font-black
            shadow-2xl
          "
        >
          <Sparkles
            className="
              w-5
              h-5
              text-[#FFE082]
            "
          />

          {
            reinforcement
          }
        </div>
      )}

      <div
        className="
          absolute
          inset-x-0
          bottom-[16%]
          z-20
          flex
          justify-center
          gap-3
          sm:gap-6
          px-3
        "
      >
        <CraftCard
          title="السدو"
          subtitle="أكمل النمط"
          icon={
            <Layers3
              className="
                w-9
                h-9
              "
            />
          }
          done={
            isDone(
              'sadu'
            )
          }
          onClick={() =>
            !isDone(
              'sadu'
            ) &&
            setActiveCraft(
              'sadu'
            )
          }
        />

        <CraftCard
          title="الخوص"
          subtitle="نسج سعف النخيل"
          icon={
            <Leaf
              className="
                w-9
                h-9
              "
            />
          }
          done={
            isDone(
              'palm'
            )
          }
          onClick={() =>
            !isDone(
              'palm'
            ) &&
            setActiveCraft(
              'palm'
            )
          }
        />

        <CraftCard
          title="صناعة المحمل"
          subtitle="ركّب أجزاؤه"
          icon={
            <Hammer
              className="
                w-9
                h-9
              "
            />
          }
          done={
            isDone(
              'dhow'
            )
          }
          onClick={() =>
            !isDone(
              'dhow'
            ) &&
            setActiveCraft(
              'dhow'
            )
          }
        />
      </div>

      {activeCraft ===
        'sadu' && (
        <SaduTask
          onClose={() =>
            setActiveCraft(
              null
            )
          }
          onWin={() =>
            completeCraft(
              'sadu'
            )
          }
        />
      )}

      {activeCraft ===
        'palm' && (
        <PalmTask
          onClose={() =>
            setActiveCraft(
              null
            )
          }
          onWin={() =>
            completeCraft(
              'palm'
            )
          }
        />
      )}

      {activeCraft ===
        'dhow' && (
        <DhowTask
          onClose={() =>
            setActiveCraft(
              null
            )
          }
          onWin={() =>
            completeCraft(
              'dhow'
            )
          }
        />
      )}

      {showSuccess && (
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
              w-full
              max-w-md
              rounded-[30px]
              border-2
              border-[#FFE082]
              bg-[#402718]/95
              p-6
              text-center
              shadow-2xl
            "
          >
            <div
              className="
                text-6xl
              "
            >
              🧶
            </div>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                text-[#FFE082]
              "
            >
              أحسنت!
            </h2>

            <p
              className="
                mt-2
                text-lg
                text-white
              "
            >
              أنجزت حرفتين
              وحصلت على
              ختم بيت الحرف.
            </p>

            <button
              onClick={
                onReturnToVillage
              }
              className="
                mt-6
                w-full
                rounded-2xl
                bg-[#8A1538]
                border-2
                border-[#FFE082]
                py-3.5
                text-[#FFE082]
                font-black
                active:scale-95
              "
            >
              العودة إلى القرية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CraftCard({
  title,
  subtitle,
  icon,
  done,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={
        onClick
      }
      className={`
        w-[min(30vw,250px)]
        min-h-[135px]
        rounded-[24px]
        border-2
        p-4
        text-center
        shadow-2xl
        backdrop-blur-md
        active:scale-95
        transition-transform

        ${
          done
            ? 'bg-emerald-900/90 border-emerald-300'
            : 'bg-[#402718]/92 border-[#FFE082]'
        }
      `}
    >
      <div
        className="
          mx-auto
          w-14
          h-14
          rounded-full
          bg-black/20
          border
          border-white/15
          flex
          items-center
          justify-center
          text-[#FFE082]
        "
      >
        {done ? (
          <CheckCircle2
            className="
              w-9
              h-9
              text-emerald-200
            "
          />
        ) : (
          icon
        )}
      </div>

      <div
        className="
          mt-2
          text-lg
          font-black
          text-[#FFE082]
        "
      >
        {done
          ? 'مكتمل'
          : title}
      </div>

      {!done && (
        <div
          className="
            mt-1
            text-xs
            sm:text-sm
            text-white/85
          "
        >
          {subtitle}
        </div>
      )}
    </button>
  );
}

function CraftModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[250]
        bg-black/70
        backdrop-blur-md
        flex
        items-center
        justify-center
        p-2
        sm:p-4
      "
      dir="rtl"
    >
      <div
        className="
          relative
          w-full
          max-w-2xl
          max-h-[calc(100dvh-1rem)]
          overflow-y-auto
          rounded-[28px]
          border-2
          border-[#FFE082]
          bg-[#402718]/97
          p-4
          sm:p-6
          pb-24
          shadow-2xl
        "
      >
        <button
          onClick={
            onClose
          }
          className="
            sticky
            top-0
            float-left
            z-40
            w-10
            h-10
            rounded-full
            bg-black/30
            border
            border-white/20
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

        <h2
          className="
            sticky
            top-0
            z-30
            bg-[#402718]/97
            py-2
            text-center
            text-2xl
            sm:text-3xl
            font-black
            text-[#FFE082]
          "
        >
          {title}
        </h2>

        <div
          className="
            clear-both
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SaduTask({
  onClose,
  onWin,
}: {
  onClose: () => void;
  onWin: () => void;
}) {
  const target = [
    'maroon',
    'cream',
    'black',
    'cream',
    'maroon',
    'black',
  ] as const;

  type Tone =
    (typeof target)[number];

  const [
    pattern,
    setPattern,
  ] =
    useState<Tone[]>(
      []
    );

  const [
    wrong,
    setWrong,
  ] =
    useState(false);

  const tones: {
    id: Tone;
    label: string;
    className: string;
  }[] = [
    {
      id: 'maroon',
      label: 'عنابي',
      className:
        'bg-[#8A1538]',
    },
    {
      id: 'cream',
      label: 'رملي',
      className:
        'bg-[#E7D7B2]',
    },
    {
      id: 'black',
      label: 'أسود',
      className:
        'bg-[#2d241f]',
    },
  ];

  const addTone = (
    tone: Tone
  ) => {
    const index =
      pattern.length;

    if (
      tone !==
      target[index]
    ) {
      setWrong(true);

      window.setTimeout(
        () =>
          setWrong(
            false
          ),
        900
      );

      return;
    }

    setPattern(
      previous => [
        ...previous,
        tone,
      ]
    );
  };

  const finished =
    pattern.length ===
    target.length;

  return (
    <CraftModal
      title="نسج السدو"
      onClose={
        onClose
      }
    >
      <p
        className="
          mt-2
          text-center
          text-white/90
        "
      >
        أكمل النمط
        بنفس ترتيب
        الألوان.
      </p>

      <div
        className="
          mt-6
          rounded-3xl
          border-2
          border-[#FFE082]
          bg-[#c5a16f]
          p-5
        "
      >
        <div
          className="
            text-center
            text-sm
            font-black
            text-[#5c351f]
          "
        >
          النموذج
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-6
            gap-1.5
          "
        >
          {target.map(
            (
              tone,
              index
            ) => (
              <div
                key={
                  index
                }
                className={`
                  h-16
                  rounded-sm

                  ${
                    tone ===
                    'maroon'
                      ? 'bg-[#8A1538]'
                      : tone ===
                        'cream'
                        ? 'bg-[#E7D7B2]'
                        : 'bg-[#2d241f]'
                  }
                `}
              />
            )
          )}
        </div>

        <div
          className="
            mt-7
            text-center
            text-sm
            font-black
            text-[#5c351f]
          "
        >
          نسجك
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-6
            gap-1.5
          "
        >
          {target.map(
            (
              _,
              index
            ) => {
              const tone =
                pattern[index];

              return (
                <div
                  key={
                    index
                  }
                  className={`
                    h-16
                    rounded-sm
                    border
                    border-[#6f4a2d]/25

                    ${
                      tone ===
                      'maroon'
                        ? 'bg-[#8A1538]'
                        : tone ===
                          'cream'
                          ? 'bg-[#E7D7B2]'
                          : tone ===
                            'black'
                            ? 'bg-[#2d241f]'
                            : 'bg-white/25'
                    }
                  `}
                />
              );
            }
          )}
        </div>

        <div
          className="
            mt-6
            flex
            justify-center
            gap-3
          "
        >
          {tones.map(
            tone => (
              <button
                key={
                  tone.id
                }
                onClick={() =>
                  addTone(
                    tone.id
                  )
                }
                disabled={
                  finished
                }
                className={`
                  w-20
                  h-20
                  rounded-2xl
                  border-2
                  border-white/60
                  ${tone.className}
                  shadow-lg
                  active:scale-90
                `}
              >
                <span
                  className={`
                    text-xs
                    font-black

                    ${
                      tone.id ===
                      'cream'
                        ? 'text-[#5c351f]'
                        : 'text-white'
                    }
                  `}
                >
                  {
                    tone.label
                  }
                </span>
              </button>
            )
          )}
        </div>

        {wrong && (
          <div
            className="
              mt-4
              text-center
              font-bold
              text-[#8A1538]
            "
          >
            جرّب اللون التالي
            مرة أخرى
          </div>
        )}
      </div>

      {finished && (
        <button
          onClick={
            onWin
          }
          className="
            sticky
            bottom-2
            z-50
            mt-5
            w-full
            rounded-2xl
            bg-emerald-700
            border-[3px]
            border-[#FFE082]
            py-3.5
            font-black
            text-white
            shadow-2xl
          "
        >
          اعتماد الإنجاز ✓
        </button>
      )}
    </CraftModal>
  );
}

function PalmTask({
  onClose,
  onWin,
}: {
  onClose: () => void;
  onWin: () => void;
}) {
  const target = [
    'right',
    'left',
    'right',
    'left',
    'right',
    'left',
  ] as const;

  type Side =
    (typeof target)[number];

  const [
    woven,
    setWoven,
  ] =
    useState<Side[]>(
      []
    );

  const [
    wrong,
    setWrong,
  ] =
    useState(false);

  const choose = (
    side: Side
  ) => {
    const index =
      woven.length;

    if (
      side !==
      target[index]
    ) {
      setWrong(true);

      window.setTimeout(
        () =>
          setWrong(
            false
          ),
        850
      );

      return;
    }

    setWoven(
      previous => [
        ...previous,
        side,
      ]
    );
  };

  const finished =
    woven.length ===
    target.length;

  return (
    <CraftModal
      title="نسج الخوص"
      onClose={
        onClose
      }
    >
      <p
        className="
          mt-2
          text-center
          text-white/90
        "
      >
        مرّر سعف النخيل
        يمينًا ويسارًا
        بالتناوب.
      </p>

      <div
        className="
          mt-6
          min-h-[340px]
          rounded-3xl
          border-2
          border-[#FFE082]
          bg-[#d7bd79]
          p-6
        "
      >
        <div
          className="
            mx-auto
            max-w-md
            rounded-2xl
            border
            border-[#6f5a31]/35
            bg-[#b29a5f]/35
            p-5
          "
        >
          <div
            className="
              grid
              grid-cols-6
              gap-2
            "
          >
            {target.map(
              (
                _,
                index
              ) => {
                const side =
                  woven[index];

                return (
                  <div
                    key={
                      index
                    }
                    className="
                      relative
                      h-32
                      rounded-xl
                      border
                      border-[#6f5a31]/25
                      bg-[#efe0a0]/35
                      overflow-hidden
                    "
                  >
                    {side && (
                      <div
                        className={`
                          absolute
                          top-1/2
                          w-[145%]
                          h-5
                          -translate-y-1/2
                          rounded-full
                          bg-[linear-gradient(90deg,#6d7f34,#b1c35e,#6d7f34)]
                          shadow-md

                          ${
                            side ===
                            'right'
                              ? '-left-[8%] rotate-[18deg]'
                              : '-right-[8%] -rotate-[18deg]'
                          }
                        `}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div
          className="
            mt-7
            flex
            justify-center
            gap-4
          "
        >
          <button
            onClick={() =>
              choose(
                'right'
              )
            }
            disabled={
              finished
            }
            className="
              min-w-[150px]
              rounded-2xl
              border-2
              border-[#FFE082]
              bg-[#56702f]
              px-6
              py-4
              font-black
              text-white
              shadow-lg
              active:scale-95
            "
          >
            مرّر يمينًا ←
          </button>

          <button
            onClick={() =>
              choose(
                'left'
              )
            }
            disabled={
              finished
            }
            className="
              min-w-[150px]
              rounded-2xl
              border-2
              border-[#FFE082]
              bg-[#6f8239]
              px-6
              py-4
              font-black
              text-white
              shadow-lg
              active:scale-95
            "
          >
            → مرّر يسارًا
          </button>
        </div>

        <div
          className="
            mt-5
            text-center
            font-black
            text-[#5a4826]
          "
        >
          {woven.length}/6
        </div>

        {wrong && (
          <div
            className="
              mt-2
              text-center
              font-bold
              text-[#8A1538]
            "
          >
            الاتجاه التالي
            غير صحيح
          </div>
        )}
      </div>

      {finished && (
        <button
          onClick={
            onWin
          }
          className="
            sticky
            bottom-2
            z-50
            mt-5
            w-full
            rounded-2xl
            bg-emerald-700
            border-[3px]
            border-[#FFE082]
            py-3.5
            font-black
            text-white
            shadow-2xl
          "
        >
          اعتماد الإنجاز ✓
        </button>
      )}
    </CraftModal>
  );
}

function DhowTask({
  onClose,
  onWin,
}: {
  onClose: () => void;
  onWin: () => void;
}) {
  type Part =
    | 'hull'
    | 'mast'
    | 'sail';

  const parts: {
    id: Part;
    label: string;
    symbol: string;
  }[] = [
    {
      id: 'hull',
      label: 'البدن',
      symbol: '🛶',
    },
    {
      id: 'mast',
      label: 'الصاري',
      symbol: '│',
    },
    {
      id: 'sail',
      label: 'الشراع',
      symbol: '⛵',
    },
  ];

  const [
    placed,
    setPlaced,
  ] =
    useState<Part[]>(
      []
    );

  const place = (
    part: Part
  ) => {
    if (
      placed.includes(
        part
      )
    ) {
      return;
    }

    setPlaced(
      previous => [
        ...previous,
        part,
      ]
    );
  };

  const finished =
    placed.length ===
    parts.length;

  return (
    <CraftModal
      title="صناعة المحمل"
      onClose={
        onClose
      }
    >
      <p
        className="
          mt-2
          text-center
          text-white/90
        "
      >
        ركّب أجزاء المحمل
        بالترتيب:
        البدن، الصاري،
        ثم الشراع.
      </p>

      <div
        className="
          mt-6
          min-h-[350px]
          rounded-3xl
          border-2
          border-[#FFE082]
          bg-[#b98552]
          p-6
        "
      >
        <div
          className="
            relative
            mx-auto
            h-52
            max-w-lg
            rounded-2xl
            border
            border-[#6f4629]/35
            bg-[#d9b47d]/45
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[42%]
              bg-[#2f7693]/30
            "
          />

          {placed.includes(
            'hull'
          ) && (
            <div
              className="
                absolute
                left-1/2
                bottom-[30%]
                -translate-x-1/2
                text-7xl
              "
            >
              🛶
            </div>
          )}

          {placed.includes(
            'mast'
          ) && (
            <div
              className="
                absolute
                left-1/2
                bottom-[40%]
                w-2
                h-28
                -translate-x-1/2
                bg-[#684327]
                rounded-full
              "
            />
          )}

          {placed.includes(
            'sail'
          ) && (
            <div
              className="
                absolute
                left-[51%]
                bottom-[47%]
                w-0
                h-0
                border-y-[55px]
                border-y-transparent
                border-r-[90px]
                border-r-[#eee0c0]
              "
            />
          )}
        </div>

        <div
          className="
            mt-7
            grid
            grid-cols-3
            gap-3
          "
        >
          {parts.map(
            (
              part,
              index
            ) => {
              const done =
                placed.includes(
                  part.id
                );

              const enabled =
                index ===
                placed.length;

              return (
                <button
                  key={
                    part.id
                  }
                  disabled={
                    done ||
                    !enabled
                  }
                  onClick={() =>
                    place(
                      part.id
                    )
                  }
                  className={`
                    rounded-2xl
                    border-2
                    p-4
                    text-center
                    shadow-lg

                    ${
                      done
                        ? 'bg-emerald-700 border-emerald-200'
                        : enabled
                          ? 'bg-[#8A1538] border-[#FFE082] active:scale-95'
                          : 'bg-black/15 border-white/15 opacity-45'
                    }
                  `}
                >
                  <div
                    className="
                      text-4xl
                    "
                  >
                    {done
                      ? '✓'
                      : part.symbol}
                  </div>

                  <div
                    className="
                      mt-2
                      font-black
                    "
                  >
                    {
                      part.label
                    }
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {finished && (
        <button
          onClick={
            onWin
          }
          className="
            sticky
            bottom-2
            z-50
            mt-5
            w-full
            rounded-2xl
            bg-emerald-700
            border-[3px]
            border-[#FFE082]
            py-3.5
            font-black
            text-white
            shadow-2xl
          "
        >
          اعتماد الإنجاز ✓
        </button>
      )}
    </CraftModal>
  );
}
