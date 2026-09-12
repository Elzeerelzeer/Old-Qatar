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

const MASTER_IMAGE_PATH = '/assets/majlis-master-map.png';

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
  const reported = useRef(false);

  const finished = completed.length >= 2;

  const speakArabic = (message: string) => {
    if (!settings.isSoundEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(message);
    const voices = synth.getVoices();
    const voice =
      voices.find(v => v.lang === 'ar-QA') ||
      voices.find(v => v.lang === 'ar-SA') ||
      voices.find(v => v.lang.toLowerCase().startsWith('ar'));

    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'ar-SA';
    u.rate = 0.86;
    u.pitch = 1;
    u.volume = Math.max(0.2, Math.min(1, settings.volume ?? 0.6));
    synth.speak(u);
  };

  const playChime = () => {
    if (!settings.isSoundEnabled || typeof window === 'undefined') return;

    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;

      const ctx = new Ctx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((frequency, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = frequency;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.0001, now + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(0.04, (settings.volume ?? 0.6) * 0.1),
          now + i * 0.11 + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.11);
        osc.stop(now + i * 0.11 + 0.26);
      });
      window.setTimeout(() => ctx.close().catch(() => undefined), 900);
    } catch {
      // keep interaction running if WebAudio is blocked
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 6000);
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
    const title = task === 'coffee' ? 'تقديم القهوة' : 'تبخير المجلس';

    setCompleted(prev => {
      if (prev.includes(task)) return prev;
      const next = [...prev, task];

      playChime();
      setReinforcement(`أحسنت! أكملت ${title}`);
      speakArabic(`أحسنت. أكملت ${title}.`);

      window.setTimeout(() => setReinforcement(null), 2300);

      if (next.length >= 2 && !reported.current) {
        reported.current = true;
        window.setTimeout(() => {
          onComplete?.();
          setShowSuccess(true);
          playChime();
          speakArabic('ممتاز. أتممت آداب المجلس وحصلت على ختم مجلس لوّل.');
        }, 450);
      }

      return next;
    });

    setActiveTask(null);
  };

  const taskDone = (id: TaskId) => completed.includes(id);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#6b4226] select-none text-white"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#b98552_0%,#7a4f2e_40%,#3f2517_100%)]" />

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

      <button
        onClick={onReturnToVillage}
        className="fixed top-5 left-5 z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-5 py-2.5 text-white font-black shadow-xl active:scale-95"
      >
        العودة إلى القرية
      </button>

      <div className="fixed top-5 right-5 z-50 rounded-full bg-[#3f2417]/90 border border-[#E6C280] px-5 py-2.5 text-[#FFE082] font-black shadow-xl">
        مجلس لوّل
      </div>

      <div className="fixed top-[76px] right-5 z-50 rounded-2xl bg-[#3f2417]/90 border border-white/20 px-5 py-3 shadow-xl">
        <span className="text-[#FFE082] text-xl font-black">{completed.length}/2</span>
        <span className="mr-2 text-sm">مهام المجلس</span>
      </div>

      {showIntro && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] w-[min(92vw,560px)] rounded-2xl border-2 border-[#FFE082] bg-[#3f2417]/95 px-5 py-3 text-center shadow-2xl backdrop-blur-md">
          <div className="text-lg sm:text-xl font-black text-[#FFE082]">
            ماذا نفعل في المجلس؟
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold text-white/90">
            قدّم القهوة للضيف، ثم بخّر المجلس.
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
          subtitle="قدّم الفنجان للضيف"
          icon={<Coffee className="w-9 h-9" />}
          done={taskDone('coffee')}
          onClick={() => !taskDone('coffee') && setActiveTask('coffee')}
        />

        <TaskCard
          title="تبخير المجلس"
          subtitle="مرّر المبخرة برفق"
          icon={<Flame className="w-9 h-9" />}
          done={taskDone('incense')}
          onClick={() => !taskDone('incense') && setActiveTask('incense')}
        />
      </div>

      {activeTask === 'coffee' && (
        <CoffeeTask
          onClose={() => setActiveTask(null)}
          onWin={() => markComplete('coffee')}
        />
      )}

      {activeTask === 'incense' && (
        <IncenseTask
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
            <p className="mt-2 text-lg text-white">
              أتممت آداب المجلس وحصلت على ختم مجلس لوّل.
            </p>
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
        w-[min(42vw,270px)]
        min-h-[132px]
        rounded-[26px]
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
            : 'bg-[#3f2417]/92 border-[#FFE082]'
        }
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
      <div className="relative w-full max-w-2xl max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[28px] border-2 border-[#FFE082] bg-[#3f2417]/97 p-4 sm:p-6 pb-24 shadow-2xl">
        <button
          onClick={onClose}
          className="sticky top-0 float-left z-40 w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="sticky top-0 z-30 bg-[#3f2417]/97 py-2 text-center text-2xl sm:text-3xl font-black text-[#FFE082]">
          {title}
        </h2>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}

function CoffeeTask({
  onClose,
  onWin,
}: {
  onClose: () => void;
  onWin: () => void;
}) {
  const guests = [
    { id: 0, label: 'الضيف الأول', x: 39, y: 57 },
    { id: 1, label: 'الضيف الثاني', x: 50, y: 54 },
    { id: 2, label: 'الضيف الثالث', x: 61, y: 57 },
  ];

  const dallah = { x: 50, y: 67 };
  const cupHome = { x: 43, y: 68 };

  const [servedGuests, setServedGuests] = useState<number[]>([]);
  const [cupPos, setCupPos] = useState(cupHome);
  const [cupFilled, setCupFilled] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [stepMessage, setStepMessage] = useState('اسحب الفنجان إلى الدلة لملئه بالقهوة');
  const draggingCup = useRef(false);

  const currentGuest =
    guests.find(guest => !servedGuests.includes(guest.id)) || null;

  const resetCup = () => {
    setCupPos(cupHome);
    setCupFilled(false);
    setPouring(false);
    setStepMessage('اسحب الفنجان إلى الدلة لملئه بالقهوة');
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingCup.current || !currentGuest) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    setCupPos({ x, y });

    // Step 1: bring empty cup close to the dallah spout.
    if (!cupFilled) {
      const distanceToDallah = Math.hypot(x - dallah.x, y - dallah.y);

      if (distanceToDallah < 7 && !pouring) {
        setPouring(true);
        setStepMessage('يتم صب القهوة...');

        window.setTimeout(() => {
          setCupFilled(true);
          setPouring(false);
          setStepMessage(`قدّم الفنجان إلى ${currentGuest.label}`);
        }, 650);
      }

      return;
    }

    // Step 2: take the filled cup to the current guest.
    const distanceToGuest = Math.hypot(
      x - currentGuest.x,
      y - currentGuest.y
    );

    if (distanceToGuest < 7.5) {
      draggingCup.current = false;

      setServedGuests(prev => [
        ...prev,
        currentGuest.id,
      ]);

      setStepMessage(`تم تقديم القهوة إلى ${currentGuest.label}`);

      window.setTimeout(() => {
        resetCup();
      }, 700);
    }
  };

  const finished = servedGuests.length >= guests.length;

  return (
    <ModalFrame title="تقديم الضيافة" onClose={onClose}>
      <p className="mt-2 text-center text-white/90">
        قدّم القهوة كما في المجلس: املأ الفنجان من الدلة، ثم قدّمه للضيف.
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <span className={`rounded-full border px-4 py-2 ${
          !cupFilled
            ? 'border-[#FFE082] bg-[#FFE082]/10 text-[#FFE082]'
            : 'border-white/15 bg-black/20 text-white/65'
        }`}>
          1. املأ الفنجان
        </span>

        <span className="text-[#FFE082]">←</span>

        <span className={`rounded-full border px-4 py-2 ${
          cupFilled
            ? 'border-[#FFE082] bg-[#FFE082]/10 text-[#FFE082]'
            : 'border-white/15 bg-black/20 text-white/65'
        }`}>
          2. قدّمه للضيف
        </span>
      </div>

      <div
        onPointerMove={handleMove}
        onPointerUp={() => {
          draggingCup.current = false;
        }}
        onPointerCancel={() => {
          draggingCup.current = false;
        }}
        onPointerLeave={() => {
          draggingCup.current = false;
        }}
        className="
          mt-5
          relative
          h-[390px]
          rounded-3xl
          border-2
          border-[#FFE082]
          overflow-hidden
          touch-none
          bg-black/15
          shadow-inner
        "
      >
        {/* Use the actual Majlis background as the interaction surface */}
        <img
          src={MASTER_IMAGE_PATH}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Dallah interaction hotspot aligned to the real dallah on the table */}
        <div
          className={`
            absolute
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border-2
            transition-all
            pointer-events-none
            ${
              !cupFilled
                ? 'w-24 h-24 border-[#FFE082] bg-[#FFE082]/8 shadow-[0_0_22px_rgba(255,224,130,.32)]'
                : 'w-16 h-16 border-white/20 bg-transparent'
            }
          `}
          style={{
            left: `${dallah.x}%`,
            top: `${dallah.y}%`,
          }}
        />

        {!cupFilled && (
          <div
            className="
              absolute
              -translate-x-1/2
              rounded-full
              border
              border-[#FFE082]/70
              bg-[#3f2417]/92
              px-4
              py-1.5
              text-xs
              font-black
              text-[#FFE082]
              shadow-xl
              pointer-events-none
            "
            style={{
              left: `${dallah.x}%`,
              top: `calc(${dallah.y}% - 70px)`,
            }}
          >
            الدلة
          </div>
        )}

        {/* Real guests in the background — only subtle target rings are added */}
        {guests.map(guest => {
          const served = servedGuests.includes(guest.id);
          const active = currentGuest?.id === guest.id;

          return (
            <div
              key={guest.id}
              className="
                absolute
                -translate-x-1/2
                -translate-y-1/2
                pointer-events-none
              "
              style={{
                left: `${guest.x}%`,
                top: `${guest.y}%`,
              }}
            >
              <div
                className={`
                  rounded-full
                  transition-all
                  ${
                    served
                      ? 'w-16 h-16 border-2 border-emerald-300 bg-emerald-300/8'
                      : active && cupFilled
                        ? 'w-24 h-24 border-[3px] border-[#FFE082] bg-[#FFE082]/8 shadow-[0_0_26px_rgba(255,224,130,.35)]'
                        : 'w-0 h-0'
                  }
                `}
              />

              {served && (
                <div className="absolute left-1/2 top-[38px] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/90 border border-emerald-300 px-3 py-1 text-[11px] font-black text-white">
                  تمت الضيافة ✓
                </div>
              )}
            </div>
          );
        })}

        {/* Coffee stream shown over the real dallah while filling */}
        {pouring && (
          <div
            className="
              absolute
              z-30
              h-16
              w-[3px]
              rounded-full
              bg-[#5f3118]
              shadow-[0_0_8px_rgba(255,220,170,.28)]
              pointer-events-none
            "
            style={{
              left: `calc(${dallah.x}% - 24px)`,
              top: `calc(${dallah.y}% - 56px)`,
              transform: 'rotate(18deg)',
            }}
          />
        )}

        {/* Finjan — draggable, small and proportional to scene */}
        {!finished && (
          <button
            onPointerDown={(e) => {
              draggingCup.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            className="
              absolute
              z-40
              w-12
              h-12
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              cursor-grab
              active:cursor-grabbing
              drop-shadow-[0_8px_10px_rgba(0,0,0,.45)]
            "
            style={{
              left: `${cupPos.x}%`,
              top: `${cupPos.y}%`,
            }}
            aria-label="فنجان القهوة"
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-8 rounded-[10%_10%_48%_48%] border-2 border-[#d9bd85] bg-[#f7eedf] shadow-[inset_3px_2px_5px_rgba(255,255,255,.8),0_4px_8px_rgba(0,0,0,.25)]">
              {cupFilled && (
                <span className="absolute left-1/2 top-1 -translate-x-1/2 w-6 h-2.5 rounded-[50%] bg-[#6f3a1d]" />
              )}
            </span>
          </button>
        )}

        {/* Current instruction */}
        {!finished && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-sm font-bold text-white whitespace-nowrap">
            {stepMessage}
          </div>
        )}

        {finished && (
          <div className="absolute inset-0 z-50 bg-emerald-950/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="rounded-full bg-emerald-700 border-2 border-[#FFE082] px-7 py-3 text-xl font-black text-white shadow-xl">
              تمت الضيافة للضيوف ✓
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الضيوف</div>
          <div className="mt-1 text-2xl font-black text-[#FFE082]">
            {servedGuests.length}/3
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الفنجان</div>
          <div className="mt-1 text-lg font-black text-[#FFE082]">
            {finished
              ? 'مكتمل'
              : cupFilled
                ? 'مملوء'
                : 'فارغ'}
          </div>
        </div>
      </div>

      {finished && (
        <button
          onClick={onWin}
          className="sticky bottom-2 z-50 mt-5 w-full rounded-2xl bg-emerald-700 border-[3px] border-[#FFE082] py-3.5 font-black text-white shadow-2xl active:scale-95"
        >
          اعتماد الإنجاز ✓
        </button>
      )}
    </ModalFrame>
  );
}

function IncenseTask({
  onClose,
  onWin,
}: {
  onClose: () => void;
  onWin: () => void;
}) {
  const guests = [
    { id: 0, label: 'الضيف الأول', x: 39, y: 57 },
    { id: 1, label: 'الضيف الثاني', x: 50, y: 54 },
    { id: 2, label: 'الضيف الثالث', x: 61, y: 57 },
  ];

  const burnerHome = { x: 72, y: 72 };

  const [burnerPos, setBurnerPos] = useState(burnerHome);
  const [perfumedGuests, setPerfumedGuests] = useState<number[]>([]);
  const [activeGuestId, setActiveGuestId] = useState<number | null>(null);
  const dragging = useRef(false);

  const moveBurner = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || perfumedGuests.length >= guests.length) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(18, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));

    setBurnerPos({ x, y });

    let nearest: { id: number; distance: number } | null = null;

    for (const guest of guests) {
      if (perfumedGuests.includes(guest.id)) continue;

      const distance = Math.hypot(
        x - guest.x,
        y - guest.y
      );

      if (!nearest || distance < nearest.distance) {
        nearest = {
          id: guest.id,
          distance,
        };
      }
    }

    setActiveGuestId(
      nearest && nearest.distance < 15
        ? nearest.id
        : null
    );

    if (nearest && nearest.distance < 8) {
      dragging.current = false;

      setPerfumedGuests(prev =>
        prev.includes(nearest!.id)
          ? prev
          : [...prev, nearest!.id]
      );

      setActiveGuestId(null);

      window.setTimeout(() => {
        setBurnerPos(burnerHome);
      }, 450);
    }
  };

  const finished = perfumedGuests.length >= guests.length;

  return (
    <ModalFrame title="تبخير المجلس" onClose={onClose}>
      <p className="mt-2 text-center text-white/90">
        احمل المبخرة وقرّبها من كل ضيف، كما تُقدّم الطيب في المجلس.
      </p>

      <div
        onPointerMove={moveBurner}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
        className="
          mt-6
          relative
          h-[390px]
          rounded-3xl
          border-2
          border-[#FFE082]
          overflow-hidden
          touch-none
          bg-black/15
        "
      >
        <img
          src={MASTER_IMAGE_PATH}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <div className="absolute inset-0 bg-black/8 pointer-events-none" />

        {/* Guest targets aligned to the real guests in the Majlis background */}
        {guests.map(guest => {
          const done = perfumedGuests.includes(guest.id);
          const active = activeGuestId === guest.id;

          return (
            <div
              key={guest.id}
              className="
                absolute
                -translate-x-1/2
                -translate-y-1/2
                pointer-events-none
              "
              style={{
                left: `${guest.x}%`,
                top: `${guest.y}%`,
              }}
            >
              <div
                className={`
                  rounded-full
                  transition-all
                  ${
                    done
                      ? 'w-20 h-20 border-2 border-emerald-300 bg-emerald-300/7'
                      : active
                        ? 'w-28 h-28 border-[3px] border-[#FFE082] bg-[#FFE082]/6 shadow-[0_0_28px_rgba(255,224,130,.32)]'
                        : 'w-0 h-0'
                  }
                `}
              />

              {done && (
                <div className="absolute left-1/2 top-[42px] -translate-x-1/2 rounded-full border border-emerald-300 bg-emerald-900/90 px-3 py-1 text-[11px] font-black text-white whitespace-nowrap">
                  تم التبخير ✓
                </div>
              )}

              {done && (
                <>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-14 h-24 rounded-full bg-white/12 blur-xl" />
                  <div className="absolute left-[40%] -top-3 w-8 h-16 rounded-full bg-white/10 blur-lg" />
                </>
              )}
            </div>
          );
        })}

        {/* Smoke follows the real mabkhara */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${burnerPos.x}%`,
            top: `calc(${burnerPos.y}% - 92px)`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="absolute left-0 bottom-0 w-12 h-28 rounded-full bg-white/12 blur-xl" />
          <div className="absolute left-4 bottom-8 w-8 h-20 rounded-full bg-white/10 blur-lg" />
          <div className="absolute -left-3 bottom-16 w-10 h-16 rounded-full bg-white/8 blur-xl" />
        </div>

        {/* Draggable mabkhara — proportional and detailed */}
        <button
          onPointerDown={(e) => {
            if (finished) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          className="
            absolute
            z-30
            w-[78px]
            h-[98px]
            -translate-x-1/2
            -translate-y-1/2
            cursor-grab
            active:cursor-grabbing
            drop-shadow-[0_10px_16px_rgba(0,0,0,.4)]
          "
          style={{
            left: `${burnerPos.x}%`,
            top: `${burnerPos.y}%`,
          }}
          aria-label="المبخرة"
        >
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-14 h-11 rounded-[9px_9px_18px_18px] border-2 border-[#f0d195] bg-[linear-gradient(145deg,#f3d99a,#b37a32_55%,#694019)] shadow-[inset_5px_5px_8px_rgba(255,255,255,.35),0_8px_15px_rgba(0,0,0,.35)]" />
          <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-11 h-11 rotate-45 border-2 border-[#f0d195] bg-[linear-gradient(145deg,#e5c47c,#956326)] shadow-md" />
          <div className="absolute left-1/2 bottom-[62px] -translate-x-1/2 w-8 h-8 rotate-45 border-2 border-[#f0d195] bg-[#9f6d2e]" />
          <div className="absolute left-1/2 bottom-[79px] -translate-x-1/2 w-4 h-4 rounded-full bg-[#5f351e] shadow-[0_0_12px_rgba(255,159,67,.55)]" />
        </button>

        {!finished && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-sm font-bold text-white whitespace-nowrap">
            قرّب المبخرة من كل ضيف
          </div>
        )}

        {finished && (
          <div className="absolute inset-0 z-50 bg-emerald-950/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="rounded-full bg-emerald-700 border-2 border-[#FFE082] px-7 py-3 text-xl font-black text-white shadow-xl">
              تم تبخير المجلس ✓
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الضيوف</div>
          <div className="mt-1 text-2xl font-black text-[#FFE082]">
            {perfumedGuests.length}/3
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الحالة</div>
          <div className="mt-1 text-lg font-black text-[#FFE082]">
            {finished ? 'مكتمل' : 'قدّم الطيب'}
          </div>
        </div>
      </div>

      {finished && (
        <button
          onClick={onWin}
          className="sticky bottom-2 z-50 mt-5 w-full rounded-2xl bg-emerald-700 border-[3px] border-[#FFE082] py-3.5 font-black text-white shadow-2xl active:scale-95"
        >
          اعتماد الإنجاز ✓
        </button>
      )}
    </ModalFrame>
  );
}
