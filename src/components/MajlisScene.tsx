import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Coffee, Flame, Sparkles, X } from 'lucide-react';
import { CharacterGender, GameSettings } from '../types';

interface MajlisSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
  onComplete?: () => void;
}

type TaskId = 'coffee' | 'incense';

type GuestPoint = {
  id: number;
  label: string;
  x: number;
  y: number;
};

const MASTER_IMAGE_PATH = '/assets/majlis-master-map.png';

const GUESTS: GuestPoint[] = [
  { id: 0, label: 'الضيف الأول', x: 36, y: 61 },
  { id: 1, label: 'الضيف الثاني', x: 49, y: 57 },
  { id: 2, label: 'الضيف الثالث', x: 62, y: 61 },
];

const DALLAH_ZONE = { x: 49, y: 67 };
const CUP_HOME = { x: 41, y: 71 };
const BURNER_HOME = { x: 71, y: 72 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function MajlisScene({
  settings,
  onReturnToVillage,
  onComplete,
}: MajlisSceneProps) {
  const [activeTask, setActiveTask] = useState<TaskId | null>(null);
  const [completed, setCompleted] = useState<TaskId[]>([]);
  const [reinforcement, setReinforcement] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const reportedRef = useRef(false);

  const finished = completed.length >= 2;

  const speakArabic = (message: string) => {
    if (!settings.isSoundEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    const voices = synth.getVoices();
    const voice =
      voices.find(v => v.lang === 'ar-QA') ||
      voices.find(v => v.lang === 'ar-SA') ||
      voices.find(v => v.lang.toLowerCase().startsWith('ar'));

    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'ar-SA';
    utterance.rate = 0.87;
    utterance.pitch = 1;
    utterance.volume = clamp(settings.volume ?? 0.65, 0.2, 1);
    synth.speak(utterance);
  };

  const playChime = () => {
    if (!settings.isSoundEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const start = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(0.035, (settings.volume ?? 0.65) * 0.1),
          start + i * 0.09 + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, start + i * 0.09 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start + i * 0.09);
        osc.stop(start + i * 0.09 + 0.28);
      });
      window.setTimeout(() => ctx.close().catch(() => undefined), 900);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 5500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settings.isSoundEnabled) return;
    const timer = window.setTimeout(() => {
      speakArabic('مرحباً بك في مجلس لوّل. قدّم القهوة، ثم بخّر المجلس.');
    }, 400);
    return () => window.clearTimeout(timer);
  }, [settings.isSoundEnabled]);

  const markComplete = (task: TaskId) => {
    const title = task === 'coffee' ? 'تقديم الضيافة' : 'تبخير المجلس';

    setCompleted(prev => {
      if (prev.includes(task)) return prev;
      const next = [...prev, task];

      playChime();
      setReinforcement(`أحسنت! اكتملت مهمة ${title}`);
      speakArabic(`أحسنت. اكتملت مهمة ${title}.`);

      window.setTimeout(() => setReinforcement(null), 2400);

      if (next.length >= 2 && !reportedRef.current) {
        reportedRef.current = true;
        window.setTimeout(() => {
          onComplete?.();
          setShowSuccess(true);
          playChime();
          speakArabic('ممتاز. أتممت آداب المجلس وحصلت على ختم مجلس لوّل.');
        }, 500);
      }

      return next;
    });

    setActiveTask(null);
  };

  const taskDone = (id: TaskId) => completed.includes(id);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2f1b12] select-none text-white" dir="rtl">
      <img
        src={MASTER_IMAGE_PATH}
        alt="مجلس لوّل"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,.18)_100%)] pointer-events-none" />

      <button
        onClick={onReturnToVillage}
        className="fixed top-5 left-5 z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-5 py-2.5 text-white font-black shadow-xl active:scale-95"
      >
        العودة إلى القرية
      </button>

      <div className="fixed top-5 right-5 z-50 rounded-full bg-[#3f2417]/92 border border-[#E6C280] px-5 py-2.5 text-[#FFE082] font-black shadow-xl">
        مجلس لوّل
      </div>

      <div className="fixed top-[76px] right-5 z-50 rounded-2xl bg-[#3f2417]/90 border border-white/20 px-5 py-3 shadow-xl">
        <span className="text-[#FFE082] text-xl font-black">{completed.length}/2</span>
        <span className="mr-2 text-sm">مهام المجلس</span>
      </div>

      {showIntro && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] w-[min(92vw,580px)] rounded-2xl border-2 border-[#FFE082] bg-[#3f2417]/95 px-5 py-3 text-center shadow-2xl backdrop-blur-md">
          <div className="text-lg sm:text-xl font-black text-[#FFE082]">آداب المجلس</div>
          <div className="mt-1 text-sm sm:text-base font-bold text-white/90">
            قدّم القهوة للضيف أولاً، ثم مرّر المبخرة على الضيوف بهدوء.
          </div>
        </div>
      )}

      {reinforcement && (
        <div className="fixed top-[92px] left-1/2 -translate-x-1/2 z-[220] flex items-center gap-2 rounded-full border-2 border-[#FFE082] bg-emerald-800/95 px-6 py-3 font-black shadow-2xl">
          <Sparkles className="w-5 h-5 text-[#FFE082]" />
          {reinforcement}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[14%] z-20 flex justify-center gap-5 sm:gap-10 px-4">
        <TaskCard
          title="تقديم القهوة"
          subtitle="املأ الفنجان وقدّمه للضيوف"
          icon={<Coffee className="w-9 h-9" />}
          done={taskDone('coffee')}
          onClick={() => !taskDone('coffee') && setActiveTask('coffee')}
        />

        <TaskCard
          title="تبخير المجلس"
          subtitle="حرّك المبخرة قرب الضيوف"
          icon={<Flame className="w-9 h-9" />}
          done={taskDone('incense')}
          onClick={() => !taskDone('incense') && setActiveTask('incense')}
        />
      </div>

      {activeTask === 'coffee' && (
        <CoffeeTask
          settings={settings}
          onClose={() => setActiveTask(null)}
          onWin={() => markComplete('coffee')}
        />
      )}

      {activeTask === 'incense' && (
        <IncenseTask
          settings={settings}
          onClose={() => setActiveTask(null)}
          onWin={() => markComplete('incense')}
        />
      )}

      {finished && !showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] rounded-full bg-emerald-800 border-2 border-[#FFE082] px-6 py-3 font-black text-white shadow-xl">
          ✓ اكتملت مهام مجلس لوّل
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[30px] border-2 border-[#FFE082] bg-[#3f2417]/95 p-6 text-center shadow-2xl">
            <div className="text-6xl">☕</div>
            <h2 className="mt-3 text-3xl font-black text-[#FFE082]">أحسنت!</h2>
            <p className="mt-2 text-lg text-white">أتممت آداب المجلس وحصلت على ختم مجلس لوّل.</p>
            <button
              onClick={onReturnToVillage}
              className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 text-[#FFE082] font-black active:scale-95"
            >
              العودة إلى القرية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
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
      onClick={onClick}
      className={`
        w-[min(42vw,280px)]
        min-h-[136px]
        rounded-[26px]
        border-2
        p-4
        text-center
        shadow-2xl
        backdrop-blur-md
        active:scale-95
        transition-transform
        ${done ? 'bg-emerald-900/90 border-emerald-300' : 'bg-[#3f2417]/92 border-[#FFE082]'}
      `}
    >
      <div className="mx-auto w-14 h-14 rounded-full bg-black/20 border border-white/15 flex items-center justify-center text-[#FFE082]">
        {done ? <CheckCircle2 className="w-9 h-9 text-emerald-200" /> : icon}
      </div>
      <div className="mt-2 text-lg font-black text-[#FFE082]">{done ? 'مكتمل' : title}</div>
      {!done && <div className="mt-1 text-xs sm:text-sm text-white/85">{subtitle}</div>}
    </button>
  );
}

function ModalFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[28px] border-2 border-[#FFE082] bg-[#173246]/96 p-4 sm:p-6 pb-24 shadow-2xl">
        <button
          onClick={onClose}
          className="sticky top-0 float-left z-40 w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="sticky top-0 z-30 bg-[#173246]/96 py-2 text-center text-2xl sm:text-3xl font-black text-[#FFE082]">
          {title}
        </h2>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}


function ImmersiveTaskShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[260]
        overflow-hidden
        bg-[#26160f]
        text-white
      "
      dir="rtl"
    >
      <img
        src={MASTER_IMAGE_PATH}
        alt=""
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

      <div
        className="
          absolute
          inset-0
          bg-[linear-gradient(180deg,rgba(15,8,4,.34)_0%,rgba(15,8,4,.04)_25%,rgba(15,8,4,.02)_68%,rgba(15,8,4,.30)_100%)]
          pointer-events-none
        "
      />

      <button
        onClick={onClose}
        className="
          fixed
          top-4
          left-4
          z-[310]
          w-11
          h-11
          rounded-full
          border
          border-white/30
          bg-black/45
          backdrop-blur-md
          flex
          items-center
          justify-center
          shadow-xl
          active:scale-95
        "
        aria-label="إغلاق المهمة"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="
          fixed
          top-4
          left-1/2
          -translate-x-1/2
          z-[305]
          max-w-[72vw]
          rounded-2xl
          border
          border-[#FFE082]/70
          bg-[#2d1a11]/84
          px-5
          py-2.5
          text-center
          shadow-xl
          backdrop-blur-md
        "
      >
        <div className="text-lg sm:text-2xl font-black text-[#FFE082]">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] sm:text-sm font-semibold text-white/88">
          {subtitle}
        </div>
      </div>

      {children}
    </div>
  );
}

function CoffeeTask({
  settings,
  onClose,
  onWin,
}: {
  settings: GameSettings;
  onClose: () => void;
  onWin: () => void;
}) {
  const guests = [
    { id: 0, label: 'الضيف الأول', x: 34.5, y: 58, handX: 37.3, handY: 63 },
    { id: 1, label: 'الضيف الثاني', x: 49.5, y: 55, handX: 52.2, handY: 61 },
    { id: 2, label: 'الضيف الثالث', x: 63.5, y: 59, handX: 66.2, handY: 64 },
  ];

  const cupHome = { x: 44, y: 70 };
  const dallahSpout = { x: 47.5, y: 62.5 };

  const [servedGuests, setServedGuests] = useState<number[]>([]);
  const [cupPos, setCupPos] = useState(cupHome);
  const [cupFilled, setCupFilled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [stage, setStage] = useState<'fill' | 'serve' | 'done'>('fill');
  const [message, setMessage] = useState('خذ الفنجان من الصينية وقرّبه من فوهة الدلة');

  const fillTimerRef = useRef<number | null>(null);
  const fillProgressRef = useRef<number | null>(null);
  const serveTimerRef = useRef<number | null>(null);
  const serveProgressRef = useRef<number | null>(null);

  const currentGuest =
    guests.find(guest => !servedGuests.includes(guest.id)) || null;

  const finished = servedGuests.length >= guests.length;

  const clearTimers = () => {
    if (fillTimerRef.current) window.clearTimeout(fillTimerRef.current);
    if (fillProgressRef.current) window.clearInterval(fillProgressRef.current);
    if (serveTimerRef.current) window.clearTimeout(serveTimerRef.current);
    if (serveProgressRef.current) window.clearInterval(serveProgressRef.current);

    fillTimerRef.current = null;
    fillProgressRef.current = null;
    serveTimerRef.current = null;
    serveProgressRef.current = null;

    setHoldProgress(0);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startHoldProgress = (
    duration: number,
    kind: 'fill' | 'serve'
  ) => {
    clearTimers();

    const started = performance.now();

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - started;
      setHoldProgress(
        clamp((elapsed / duration) * 100, 0, 100)
      );
    }, 16);

    if (kind === 'fill') {
      fillProgressRef.current = intervalId;
    } else {
      serveProgressRef.current = intervalId;
    }
  };

  const resetCup = () => {
    clearTimers();
    setCupPos(cupHome);
    setCupFilled(false);
    setIsDragging(false);

    if (servedGuests.length + 1 >= guests.length) {
      setStage('done');
      setMessage('اكتملت الضيافة');
    } else {
      setStage('fill');
      setMessage('خذ الفنجان من الصينية وقرّبه من فوهة الدلة');
    }
  };

  const startFill = () => {
    if (fillTimerRef.current || cupFilled) return;

    setStage('fill');
    setMessage('ثبّت الفنجان لحظة ليتم صب القهوة');
    startHoldProgress(850, 'fill');

    fillTimerRef.current = window.setTimeout(() => {
      clearTimers();
      setCupFilled(true);
      setStage('serve');
      setMessage(
        currentGuest
          ? `قدّم الفنجان إلى ${currentGuest.label}`
          : 'قدّم الفنجان للضيف'
      );
    }, 850);
  };

  const cancelFill = () => {
    if (!fillTimerRef.current) return;

    window.clearTimeout(fillTimerRef.current);
    fillTimerRef.current = null;

    if (fillProgressRef.current) {
      window.clearInterval(fillProgressRef.current);
      fillProgressRef.current = null;
    }

    setHoldProgress(0);

    if (!cupFilled) {
      setMessage('قرّب الفنجان من فوهة الدلة');
    }
  };

  const startServing = () => {
    if (
      !cupFilled ||
      !currentGuest ||
      serveTimerRef.current
    ) {
      return;
    }

    setMessage(`ثبّت الفنجان أمام ${currentGuest.label}`);
    startHoldProgress(700, 'serve');

    serveTimerRef.current = window.setTimeout(() => {
      clearTimers();

      setServedGuests(prev => [
        ...prev,
        currentGuest.id,
      ]);

      setIsDragging(false);
      setMessage(`تم تقديم القهوة إلى ${currentGuest.label}`);

      window.setTimeout(() => {
        resetCup();
      }, 650);
    }, 700);
  };

  const cancelServing = () => {
    if (!serveTimerRef.current) return;

    window.clearTimeout(serveTimerRef.current);
    serveTimerRef.current = null;

    if (serveProgressRef.current) {
      window.clearInterval(serveProgressRef.current);
      serveProgressRef.current = null;
    }

    setHoldProgress(0);

    if (currentGuest) {
      setMessage(`قدّم الفنجان إلى ${currentGuest.label}`);
    }
  };

  const handleMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      !isDragging ||
      finished ||
      !currentGuest
    ) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const next = {
      x: clamp(
        ((e.clientX - rect.left) / rect.width) *
          100,
        6,
        94
      ),
      y: clamp(
        ((e.clientY - rect.top) / rect.height) *
          100,
        18,
        90
      ),
    };

    setCupPos(next);

    if (!cupFilled) {
      const closeToSpout =
        distance(next, dallahSpout) < 6.2;

      if (closeToSpout) {
        startFill();
      } else {
        cancelFill();
      }

      return;
    }

    const handPoint = {
      x: currentGuest.handX,
      y: currentGuest.handY,
    };

    const closeToGuestHand =
      distance(next, handPoint) < 6.5;

    if (closeToGuestHand) {
      startServing();
    } else {
      cancelServing();
    }
  };

  const releaseCup = () => {
    setIsDragging(false);
    cancelFill();
    cancelServing();
  };

  return (
    <ImmersiveTaskShell
      title="تقديم الضيافة"
      subtitle="املأ الفنجان من الدلة ثم قدّمه للضيف المحدد"
      onClose={onClose}
    >
      <div
        onPointerMove={handleMove}
        onPointerUp={releaseCup}
        onPointerCancel={releaseCup}
        onPointerLeave={releaseCup}
        className="
          absolute
          inset-0
          z-[270]
          touch-none
        "
      >
        {/* Subtle table focus, not a fake replacement */}
        <div
          className="
            absolute
            z-10
            rounded-[50%]
            border
            border-[#FFE082]/14
            bg-black/4
            pointer-events-none
          "
          style={{
            left: '33%',
            top: '61%',
            width: '34%',
            height: '18%',
          }}
        />

        {/* Dallah hotspot aligned with the real dallah */}
        {!cupFilled && !finished && (
          <>
            <div
              className="
                absolute
                z-20
                -translate-x-1/2
                -translate-y-1/2
                w-20
                h-20
                rounded-full
                border-2
                border-[#FFE082]/75
                bg-[#FFE082]/5
                shadow-[0_0_20px_rgba(255,224,130,.22)]
                pointer-events-none
              "
              style={{
                left: `${dallahSpout.x}%`,
                top: `${dallahSpout.y}%`,
              }}
            />

            <div
              className="
                absolute
                z-25
                -translate-x-1/2
                rounded-full
                border
                border-[#FFE082]/60
                bg-black/48
                px-3
                py-1
                text-[11px]
                font-black
                text-[#FFE082]
                backdrop-blur-sm
                pointer-events-none
              "
              style={{
                left: `${dallahSpout.x}%`,
                top: `calc(${dallahSpout.y}% - 54px)`,
              }}
            >
              فوهة الدلة
            </div>
          </>
        )}

        {/* Guests: target their hands, not their whole bodies */}
        {guests.map(guest => {
          const served =
            servedGuests.includes(guest.id);

          const isCurrent =
            currentGuest?.id === guest.id;

          return (
            <div
              key={guest.id}
              className="
                absolute
                z-20
                -translate-x-1/2
                -translate-y-1/2
                pointer-events-none
              "
              style={{
                left: `${guest.handX}%`,
                top: `${guest.handY}%`,
              }}
            >
              {served ? (
                <>
                  <div
                    className="
                      w-12
                      h-12
                      rounded-full
                      border-2
                      border-emerald-300
                      bg-emerald-300/7
                    "
                  />

                  <div
                    className="
                      absolute
                      left-1/2
                      top-[28px]
                      -translate-x-1/2
                      whitespace-nowrap
                      rounded-full
                      border
                      border-emerald-300
                      bg-emerald-900/88
                      px-2.5
                      py-1
                      text-[10px]
                      font-black
                      text-white
                    "
                  >
                    تمت الضيافة ✓
                  </div>
                </>
              ) : (
                isCurrent &&
                cupFilled && (
                  <div
                    className="
                      w-16
                      h-16
                      rounded-full
                      border-[3px]
                      border-[#FFE082]
                      bg-[#FFE082]/5
                      shadow-[0_0_22px_rgba(255,224,130,.22)]
                    "
                  />
                )
              )}
            </div>
          );
        })}

        {/* Coffee stream when the cup is held at the spout */}
        {fillTimerRef.current && (
          <div
            className="
              absolute
              z-[275]
              w-[3px]
              h-12
              rounded-full
              bg-[#6b3518]
              shadow-[0_0_8px_rgba(255,215,160,.35)]
              pointer-events-none
            "
            style={{
              left: `calc(${dallahSpout.x}% - 16px)`,
              top: `calc(${dallahSpout.y}% - 46px)`,
              transform: 'rotate(16deg)',
            }}
          />
        )}

        {/* Draggable finjan */}
        {!finished && (
          <button
            onPointerDown={(e) => {
              setIsDragging(true);

              e.currentTarget.setPointerCapture(
                e.pointerId
              );
            }}
            className="
              absolute
              z-[285]
              w-12
              h-12
              -translate-x-1/2
              -translate-y-1/2
              cursor-grab
              active:cursor-grabbing
              drop-shadow-[0_8px_12px_rgba(0,0,0,.42)]
            "
            style={{
              left: `${cupPos.x}%`,
              top: `${cupPos.y}%`,
              transform: `translate(-50%, -50%) scale(${
                isDragging ? 1.08 : 1
              })`,
            }}
            aria-label="فنجان القهوة"
          >
            <span
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                w-9
                h-8
                rounded-[15%_15%_52%_52%]
                border-2
                border-[#d8bb82]
                bg-[linear-gradient(145deg,#fffaf1,#e8d4ae)]
                shadow-[inset_3px_2px_5px_rgba(255,255,255,.9),0_5px_8px_rgba(0,0,0,.28)]
              "
            >
              {cupFilled && (
                <span
                  className="
                    absolute
                    left-1/2
                    top-[3px]
                    -translate-x-1/2
                    w-6
                    h-[9px]
                    rounded-full
                    bg-[#6e3b1f]
                  "
                />
              )}

              <span
                className="
                  absolute
                  -left-[5px]
                  top-[8px]
                  w-3
                  h-3
                  rounded-full
                  border-2
                  border-[#d8bb82]
                "
              />
            </span>
          </button>
        )}

        {holdProgress > 0 && (
          <div
            className="
              fixed
              bottom-[86px]
              left-1/2
              -translate-x-1/2
              z-[310]
              w-[230px]
              rounded-full
              border
              border-white/20
              bg-black/55
              p-1
              backdrop-blur-sm
            "
          >
            <div
              className="
                h-2
                rounded-full
                bg-[#FFE082]
              "
              style={{
                width: `${holdProgress}%`,
              }}
            />
          </div>
        )}

        {!finished && (
          <div
            className="
              fixed
              bottom-5
              left-1/2
              -translate-x-1/2
              z-[310]
              max-w-[92vw]
              rounded-full
              border
              border-white/18
              bg-black/58
              px-5
              py-2.5
              text-center
              text-sm
              sm:text-base
              font-bold
              text-white
              backdrop-blur-md
              shadow-xl
            "
          >
            {message}
          </div>
        )}

        <div
          className="
            fixed
            bottom-5
            right-5
            z-[310]
            rounded-2xl
            border
            border-[#FFE082]/55
            bg-[#2d1a11]/80
            px-4
            py-2
            text-sm
            font-black
            text-[#FFE082]
            backdrop-blur-md
            shadow-xl
          "
        >
          الضيوف {servedGuests.length}/3
        </div>

        {finished && (
          <div
            className="
              fixed
              inset-0
              z-[315]
              bg-black/45
              backdrop-blur-[2px]
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                w-full
                max-w-sm
                rounded-[28px]
                border-2
                border-[#FFE082]
                bg-[#173246]/96
                p-6
                text-center
                shadow-2xl
              "
            >
              <div className="text-5xl">☕</div>
              <div
                className="
                  mt-3
                  text-2xl
                  font-black
                  text-[#FFE082]
                "
              >
                تمت الضيافة
              </div>

              <p className="mt-2 text-white/88">
                قدّمت القهوة للضيوف الثلاثة.
              </p>

              <button
                onClick={onWin}
                className="
                  mt-5
                  w-full
                  rounded-2xl
                  border-[3px]
                  border-[#FFE082]
                  bg-emerald-700
                  py-3.5
                  font-black
                  text-white
                  shadow-xl
                  active:scale-95
                "
              >
                اعتماد الإنجاز ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </ImmersiveTaskShell>
  );
}

function IncenseTask({
  settings,
  onClose,
  onWin,
}: {
  settings: GameSettings;
  onClose: () => void;
  onWin: () => void;
}) {
  const guests = [
    { id: 0, label: 'الضيف الأول', x: 34.5, y: 58, targetX: 35.5, targetY: 64 },
    { id: 1, label: 'الضيف الثاني', x: 49.5, y: 55, targetX: 50.5, targetY: 62 },
    { id: 2, label: 'الضيف الثالث', x: 63.5, y: 59, targetX: 64.5, targetY: 65 },
  ];

  const burnerHome = {
    x: 71.5,
    y: 72,
  };

  const [perfumedGuests, setPerfumedGuests] =
    useState<number[]>([]);

  const [burnerPos, setBurnerPos] =
    useState(burnerHome);

  const [isDragging, setIsDragging] =
    useState(false);

  const [holdProgress, setHoldProgress] =
    useState(0);

  const [activeGuestId, setActiveGuestId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState(
      'اسحب المبخرة من مكانها وقرّبها من الضيف الأول'
    );

  const perfumeTimerRef =
    useRef<number | null>(null);

  const perfumeProgressRef =
    useRef<number | null>(null);

  const currentGuest =
    guests.find(
      guest =>
        !perfumedGuests.includes(
          guest.id
        )
    ) || null;

  const finished =
    perfumedGuests.length >=
    guests.length;

  const clearPerfumeTimer = () => {
    if (
      perfumeTimerRef.current
    ) {
      window.clearTimeout(
        perfumeTimerRef.current
      );

      perfumeTimerRef.current =
        null;
    }

    if (
      perfumeProgressRef.current
    ) {
      window.clearInterval(
        perfumeProgressRef.current
      );

      perfumeProgressRef.current =
        null;
    }

    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      clearPerfumeTimer();
    };
  }, []);

  const startPerfume = () => {
    if (
      !currentGuest ||
      perfumeTimerRef.current
    ) {
      return;
    }

    setActiveGuestId(
      currentGuest.id
    );

    setMessage(
      `ثبّت المبخرة قرب ${currentGuest.label}`
    );

    const started =
      performance.now();

    perfumeProgressRef.current =
      window.setInterval(() => {
        const elapsed =
          performance.now() -
          started;

        setHoldProgress(
          clamp(
            (elapsed / 950) *
              100,
            0,
            100
          )
        );
      }, 16);

    perfumeTimerRef.current =
      window.setTimeout(() => {
        clearPerfumeTimer();

        setPerfumedGuests(
          prev => [
            ...prev,
            currentGuest.id,
          ]
        );

        setIsDragging(false);
        setActiveGuestId(null);

        setMessage(
          `تم تبخير ${currentGuest.label}`
        );

        window.setTimeout(() => {
          setBurnerPos(
            burnerHome
          );

          const nextGuest =
            guests.find(
              guest =>
                ![
                  ...perfumedGuests,
                  currentGuest.id,
                ].includes(
                  guest.id
                )
            );

          if (nextGuest) {
            setMessage(
              `انتقل بالمبخرة إلى ${nextGuest.label}`
            );
          }
        }, 520);
      }, 950);
  };

  const cancelPerfume = () => {
    if (
      !perfumeTimerRef.current
    ) {
      return;
    }

    clearPerfumeTimer();
    setActiveGuestId(null);

    if (currentGuest) {
      setMessage(
        `قرّب المبخرة من ${currentGuest.label}`
      );
    }
  };

  const moveBurner = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      !isDragging ||
      finished ||
      !currentGuest
    ) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const next = {
      x: clamp(
        ((e.clientX - rect.left) /
          rect.width) *
          100,
        6,
        94
      ),
      y: clamp(
        ((e.clientY - rect.top) /
          rect.height) *
          100,
        20,
        90
      ),
    };

    setBurnerPos(next);

    const target = {
      x: currentGuest.targetX,
      y: currentGuest.targetY,
    };

    const closeToGuest =
      distance(
        next,
        target
      ) < 8.5;

    if (closeToGuest) {
      startPerfume();
    } else {
      cancelPerfume();
    }
  };

  const releaseBurner = () => {
    setIsDragging(false);
    cancelPerfume();
  };

  return (
    <ImmersiveTaskShell
      title="تبخير المجلس"
      subtitle="مرّر المبخرة قرب كل ضيف وثبّتها لحظة حتى يكتمل التبخير"
      onClose={onClose}
    >
      <style>{`
        @keyframes majlisSmokeOne {
          0%   { transform: translate(0, 0) scale(.75); opacity: 0; }
          20%  { opacity: .32; }
          70%  { opacity: .16; }
          100% { transform: translate(-18px, -72px) scale(1.35); opacity: 0; }
        }

        @keyframes majlisSmokeTwo {
          0%   { transform: translate(0, 0) scale(.7); opacity: 0; }
          25%  { opacity: .28; }
          100% { transform: translate(20px, -82px) scale(1.45); opacity: 0; }
        }

        @keyframes majlisSmokeThree {
          0%   { transform: translate(0, 0) scale(.6); opacity: 0; }
          25%  { opacity: .22; }
          100% { transform: translate(-4px, -94px) scale(1.55); opacity: 0; }
        }
      `}</style>

      <div
        onPointerMove={moveBurner}
        onPointerUp={releaseBurner}
        onPointerCancel={releaseBurner}
        onPointerLeave={releaseBurner}
        className="
          absolute
          inset-0
          z-[270]
          touch-none
        "
      >
        {/* Guest targets are near the hands / upper body, not full person rings */}
        {guests.map(guest => {
          const done =
            perfumedGuests.includes(
              guest.id
            );

          const isCurrent =
            currentGuest?.id ===
            guest.id;

          return (
            <div
              key={guest.id}
              className="
                absolute
                z-20
                -translate-x-1/2
                -translate-y-1/2
                pointer-events-none
              "
              style={{
                left: `${guest.targetX}%`,
                top: `${guest.targetY}%`,
              }}
            >
              {done ? (
                <>
                  <div
                    className="
                      w-14
                      h-14
                      rounded-full
                      border-2
                      border-emerald-300
                      bg-emerald-300/7
                    "
                  />

                  <div
                    className="
                      absolute
                      left-1/2
                      top-[34px]
                      -translate-x-1/2
                      rounded-full
                      border
                      border-emerald-300
                      bg-emerald-900/88
                      px-2.5
                      py-1
                      text-[10px]
                      font-black
                      text-white
                      whitespace-nowrap
                    "
                  >
                    تم التبخير ✓
                  </div>

                  <div
                    className="
                      absolute
                      left-1/2
                      -translate-x-1/2
                      -top-10
                      w-16
                      h-24
                      rounded-full
                      bg-white/9
                      blur-xl
                    "
                  />
                </>
              ) : (
                isCurrent && (
                  <div
                    className={`
                      rounded-full
                      transition-all
                      ${
                        activeGuestId ===
                        guest.id
                          ? 'w-24 h-24 border-[3px] border-[#FFE082] bg-[#FFE082]/6 shadow-[0_0_26px_rgba(255,224,130,.25)]'
                          : 'w-16 h-16 border-2 border-[#FFE082]/60 bg-[#FFE082]/3'
                      }
                    `}
                  />
                )
              )}
            </div>
          );
        })}

        {/* Dynamic smoke particles follow the burner */}
        <div
          className="
            absolute
            z-[280]
            w-1
            h-1
            pointer-events-none
          "
          style={{
            left: `${burnerPos.x}%`,
            top: `${burnerPos.y}%`,
          }}
        >
          <span
            className="
              absolute
              -left-5
              -top-8
              w-9
              h-14
              rounded-full
              bg-white/18
              blur-lg
            "
            style={{
              animation:
                'majlisSmokeOne 2.5s ease-out infinite',
            }}
          />

          <span
            className="
              absolute
              left-0
              -top-7
              w-8
              h-13
              rounded-full
              bg-white/15
              blur-lg
            "
            style={{
              animation:
                'majlisSmokeTwo 3s ease-out .35s infinite',
            }}
          />

          <span
            className="
              absolute
              -left-2
              -top-5
              w-7
              h-12
              rounded-full
              bg-white/12
              blur-lg
            "
            style={{
              animation:
                'majlisSmokeThree 3.4s ease-out .8s infinite',
            }}
          />
        </div>

        {/* Detailed mabkhara */}
        <button
          onPointerDown={(e) => {
            if (finished) {
              return;
            }

            setIsDragging(true);

            e.currentTarget.setPointerCapture(
              e.pointerId
            );
          }}
          className="
            absolute
            z-[290]
            w-[76px]
            h-[98px]
            -translate-x-1/2
            -translate-y-1/2
            cursor-grab
            active:cursor-grabbing
            drop-shadow-[0_12px_18px_rgba(0,0,0,.42)]
          "
          style={{
            left: `${burnerPos.x}%`,
            top: `${burnerPos.y}%`,
            transform: `translate(-50%, -50%) scale(${
              isDragging ? 1.07 : 1
            })`,
          }}
          aria-label="المبخرة"
        >
          <div
            className="
              absolute
              left-1/2
              bottom-0
              -translate-x-1/2
              w-14
              h-11
              rounded-[8px_8px_18px_18px]
              border-2
              border-[#f0d195]
              bg-[linear-gradient(145deg,#f5dda4,#bd843a_55%,#724821)]
              shadow-[inset_5px_5px_8px_rgba(255,255,255,.38),0_9px_16px_rgba(0,0,0,.34)]
            "
          />

          <div
            className="
              absolute
              left-1/2
              bottom-8
              -translate-x-1/2
              w-11
              h-11
              rotate-45
              border-2
              border-[#f0d195]
              bg-[linear-gradient(145deg,#e8c982,#9b692d)]
              shadow-md
            "
          />

          <div
            className="
              absolute
              left-1/2
              bottom-[61px]
              -translate-x-1/2
              w-8
              h-8
              rotate-45
              border-2
              border-[#f0d195]
              bg-[#9b692d]
            "
          />

          <div
            className="
              absolute
              left-1/2
              bottom-[79px]
              -translate-x-1/2
              w-4
              h-4
              rounded-full
              bg-[#582c17]
              shadow-[0_0_16px_rgba(255,157,69,.75)]
            "
          />
        </button>

        {holdProgress > 0 && (
          <div
            className="
              fixed
              bottom-[86px]
              left-1/2
              -translate-x-1/2
              z-[310]
              w-[230px]
              rounded-full
              border
              border-white/20
              bg-black/55
              p-1
              backdrop-blur-sm
            "
          >
            <div
              className="
                h-2
                rounded-full
                bg-[#FFE082]
              "
              style={{
                width: `${holdProgress}%`,
              }}
            />
          </div>
        )}

        {!finished && (
          <div
            className="
              fixed
              bottom-5
              left-1/2
              -translate-x-1/2
              z-[310]
              max-w-[92vw]
              rounded-full
              border
              border-white/18
              bg-black/58
              px-5
              py-2.5
              text-center
              text-sm
              sm:text-base
              font-bold
              text-white
              backdrop-blur-md
              shadow-xl
            "
          >
            {message}
          </div>
        )}

        <div
          className="
            fixed
            bottom-5
            right-5
            z-[310]
            rounded-2xl
            border
            border-[#FFE082]/55
            bg-[#2d1a11]/80
            px-4
            py-2
            text-sm
            font-black
            text-[#FFE082]
            backdrop-blur-md
            shadow-xl
          "
        >
          الضيوف {perfumedGuests.length}/3
        </div>

        {finished && (
          <div
            className="
              fixed
              inset-0
              z-[315]
              bg-black/45
              backdrop-blur-[2px]
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                w-full
                max-w-sm
                rounded-[28px]
                border-2
                border-[#FFE082]
                bg-[#173246]/96
                p-6
                text-center
                shadow-2xl
              "
            >
              <div className="text-5xl">✨</div>

              <div
                className="
                  mt-3
                  text-2xl
                  font-black
                  text-[#FFE082]
                "
              >
                تم تبخير المجلس
              </div>

              <p className="mt-2 text-white/88">
                قدّمت الطيب للضيوف الثلاثة.
              </p>

              <button
                onClick={onWin}
                className="
                  mt-5
                  w-full
                  rounded-2xl
                  border-[3px]
                  border-[#FFE082]
                  bg-emerald-700
                  py-3.5
                  font-black
                  text-white
                  shadow-xl
                  active:scale-95
                "
              >
                اعتماد الإنجاز ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </ImmersiveTaskShell>
  );
}
