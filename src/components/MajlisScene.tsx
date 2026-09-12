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

function CoffeeTask({
  settings,
  onClose,
  onWin,
}: {
  settings: GameSettings;
  onClose: () => void;
  onWin: () => void;
}) {
  const [servedGuests, setServedGuests] = useState<number[]>([]);
  const [cupPos, setCupPos] = useState(CUP_HOME);
  const [cupFilled, setCupFilled] = useState(false);
  const [draggingCup, setDraggingCup] = useState(false);
  const [stepMessage, setStepMessage] = useState('اسحب الفنجان من الطاولة إلى الدلة ثم قدّمه للضيف');
  const [hoverProgress, setHoverProgress] = useState(0);
  const [activeZone, setActiveZone] = useState<'dallah' | 'guest' | null>(null);
  const fillTimerRef = useRef<number | null>(null);
  const serveTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const currentGuest = GUESTS.find(guest => !servedGuests.includes(guest.id)) || null;
  const finished = servedGuests.length >= GUESTS.length;

  const clearTimers = () => {
    if (fillTimerRef.current) {
      window.clearTimeout(fillTimerRef.current);
      fillTimerRef.current = null;
    }
    if (serveTimerRef.current) {
      window.clearTimeout(serveTimerRef.current);
      serveTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoverProgress(0);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startProgress = (duration: number) => {
    clearTimers();
    const startedAt = Date.now();
    progressIntervalRef.current = window.setInterval(() => {
      const value = clamp(((Date.now() - startedAt) / duration) * 100, 0, 100);
      setHoverProgress(value);
    }, 16);
  };

  const resetCup = (message?: string) => {
    clearTimers();
    setCupPos(CUP_HOME);
    setCupFilled(false);
    setDraggingCup(false);
    setActiveZone(null);
    setStepMessage(message || 'اسحب الفنجان من الطاولة إلى الدلة ثم قدّمه للضيف');
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingCup || finished || !currentGuest) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const next = {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 5, 95),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 12, 90),
    };

    setCupPos(next);

    if (!cupFilled) {
      const nearDallah = distance(next, DALLAH_ZONE) < 8;

      if (nearDallah && activeZone !== 'dallah' && !fillTimerRef.current) {
        setActiveZone('dallah');
        setStepMessage('ثبّت الفنجان قرب الدلة ليُسكب فيه القهوة');
        startProgress(800);
        fillTimerRef.current = window.setTimeout(() => {
          clearTimers();
          setCupFilled(true);
          setActiveZone(null);
          setStepMessage(`الآن قدّم الفنجان إلى ${currentGuest.label}`);
        }, 800);
      } else if (!nearDallah && activeZone === 'dallah') {
        clearTimers();
        setActiveZone(null);
        setStepMessage('قرّب الفنجان من الدلة حتى يمتلئ بالقهوة');
      }

      return;
    }

    const nearGuest = distance(next, currentGuest) < 8.5;

    if (nearGuest && activeZone !== 'guest' && !serveTimerRef.current) {
      setActiveZone('guest');
      setStepMessage(`ثبّت الفنجان أمام ${currentGuest.label} ليتم تقديم الضيافة`);
      startProgress(700);
      serveTimerRef.current = window.setTimeout(() => {
        clearTimers();
        setServedGuests(prev => [...prev, currentGuest.id]);
        setActiveZone(null);
        setDraggingCup(false);
        setStepMessage(`تم تقديم القهوة إلى ${currentGuest.label}`);
        window.setTimeout(() => {
          resetCup('اسحب الفنجان مرة أخرى إلى الدلة ثم قدّمه للضيف التالي');
        }, 650);
      }, 700);
    } else if (!nearGuest && activeZone === 'guest') {
      clearTimers();
      setActiveZone(null);
      setStepMessage(`قدّم الفنجان إلى ${currentGuest.label}`);
    }
  };

  const cupScale = draggingCup ? 1.05 : 1;

  return (
    <ModalFrame title="تقديم الضيافة" onClose={onClose}>
      <p className="mt-2 text-center text-white/90 text-sm sm:text-base">
        قدّم القهوة كما في المجلس: املأ الفنجان من الدلة، ثم قدّمه للضيوف واحدًا بعد الآخر.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
        <span className={`rounded-full border px-4 py-2 ${!cupFilled ? 'border-[#FFE082] bg-[#FFE082]/10 text-[#FFE082]' : 'border-white/15 bg-black/20 text-white/65'}`}>
          1. املأ الفنجان
        </span>
        <span className="text-[#FFE082]">←</span>
        <span className={`rounded-full border px-4 py-2 ${cupFilled ? 'border-[#FFE082] bg-[#FFE082]/10 text-[#FFE082]' : 'border-white/15 bg-black/20 text-white/65'}`}>
          2. قدّم الضيافة
        </span>
      </div>

      <div
        onPointerMove={handleMove}
        onPointerUp={() => {
          setDraggingCup(false);
          clearTimers();
          if (!finished) {
            setActiveZone(null);
            setStepMessage(cupFilled && currentGuest ? `قدّم الفنجان إلى ${currentGuest.label}` : 'اسحب الفنجان من الطاولة إلى الدلة');
          }
        }}
        onPointerCancel={() => {
          setDraggingCup(false);
          clearTimers();
          setActiveZone(null);
        }}
        onPointerLeave={() => {
          setDraggingCup(false);
          clearTimers();
          setActiveZone(null);
        }}
        className="mt-5 relative h-[420px] rounded-3xl border-2 border-[#FFE082] overflow-hidden touch-none bg-black/15 shadow-inner"
      >
        <img
          src={MASTER_IMAGE_PATH}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/8 pointer-events-none" />

        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all pointer-events-none ${
            !cupFilled ? 'w-24 h-24 border-[#FFE082] bg-[#FFE082]/7 shadow-[0_0_26px_rgba(255,224,130,.28)]' : 'w-14 h-14 border-white/10'
          }`}
          style={{ left: `${DALLAH_ZONE.x}%`, top: `${DALLAH_ZONE.y}%` }}
        />

        <div
          className="absolute rounded-[20px] border border-[#d2b37c]/50 bg-[#6a4631]/55 shadow-[0_10px_30px_rgba(0,0,0,.25)] pointer-events-none"
          style={{ left: '35.5%', top: '66.5%', width: '12%', height: '7%' }}
        />

        {!cupFilled && (
          <div
            className="absolute -translate-x-1/2 rounded-full border border-[#FFE082]/70 bg-[#3f2417]/92 px-4 py-1.5 text-xs font-black text-[#FFE082] shadow-xl pointer-events-none"
            style={{ left: `${DALLAH_ZONE.x}%`, top: `calc(${DALLAH_ZONE.y}% - 68px)` }}
          >
            الدلة
          </div>
        )}

        {GUESTS.map((guest) => {
          const served = servedGuests.includes(guest.id);
          const isCurrent = currentGuest?.id === guest.id;
          return (
            <div
              key={guest.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${guest.x}%`, top: `${guest.y}%` }}
            >
              <div
                className={`rounded-full transition-all ${
                  served
                    ? 'w-14 h-14 border-2 border-emerald-300 bg-emerald-300/8'
                    : isCurrent && cupFilled
                    ? 'w-24 h-24 border-[3px] border-[#FFE082] bg-[#FFE082]/6 shadow-[0_0_24px_rgba(255,224,130,.22)]'
                    : 'w-0 h-0'
                }`}
              />

              {served && (
                <div className="absolute left-1/2 top-[34px] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/90 border border-emerald-300 px-3 py-1 text-[11px] font-black text-white">
                  تمت الضيافة ✓
                </div>
              )}
            </div>
          );
        })}

        {activeZone === 'dallah' && (
          <div
            className="absolute z-30 h-16 w-[3px] rounded-full bg-[#6b3a1e] shadow-[0_0_8px_rgba(255,220,170,.35)] pointer-events-none"
            style={{ left: `calc(${DALLAH_ZONE.x}% - 24px)`, top: `calc(${DALLAH_ZONE.y}% - 56px)`, transform: 'rotate(18deg)' }}
          />
        )}

        {!finished && (
          <button
            onPointerDown={(e) => {
              setDraggingCup(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            className="absolute z-40 w-14 h-14 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{ left: `${cupPos.x}%`, top: `${cupPos.y}%`, transform: `translate(-50%, -50%) scale(${cupScale})` }}
            aria-label="فنجان القهوة"
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-9 rounded-[14%_14%_50%_50%] border-[2px] border-[#dcbf86] bg-[#f8f1e3] shadow-[inset_3px_2px_5px_rgba(255,255,255,.9),0_8px_12px_rgba(0,0,0,.28)]">
              {cupFilled && (
                <span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-6 h-[10px] rounded-full bg-[#714123] shadow-[inset_0_1px_2px_rgba(255,255,255,.12)]" />
              )}
              <span className="absolute -left-[6px] top-[8px] w-3 h-3 rounded-full border-2 border-[#dcbf86]" />
            </span>
          </button>
        )}

        {hoverProgress > 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-[220px] rounded-full border border-white/20 bg-black/55 p-1">
            <div className="h-2 rounded-full bg-[#FFE082] transition-all" style={{ width: `${hoverProgress}%` }} />
          </div>
        )}

        {!finished && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-sm font-bold text-white text-center">
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
          <div className="mt-1 text-2xl font-black text-[#FFE082]">{servedGuests.length}/3</div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الفنجان</div>
          <div className="mt-1 text-lg font-black text-[#FFE082]">
            {finished ? 'مكتمل' : cupFilled ? 'مملوء' : 'فارغ'}
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
  settings,
  onClose,
  onWin,
}: {
  settings: GameSettings;
  onClose: () => void;
  onWin: () => void;
}) {
  const [perfumedGuests, setPerfumedGuests] = useState<number[]>([]);
  const [burnerPos, setBurnerPos] = useState(BURNER_HOME);
  const [dragging, setDragging] = useState(false);
  const [stepMessage, setStepMessage] = useState('اسحب المبخرة برفق إلى كل ضيف حتى يكتمل التبخير');
  const [hoverProgress, setHoverProgress] = useState(0);
  const [activeGuestId, setActiveGuestId] = useState<number | null>(null);
  const perfumeTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const currentGuest = GUESTS.find(guest => !perfumedGuests.includes(guest.id)) || null;
  const finished = perfumedGuests.length >= GUESTS.length;

  const smokeScale = dragging ? 1.06 : 1;

  const clearTimers = () => {
    if (perfumeTimerRef.current) {
      window.clearTimeout(perfumeTimerRef.current);
      perfumeTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoverProgress(0);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startProgress = (duration: number) => {
    clearTimers();
    const startedAt = Date.now();
    progressIntervalRef.current = window.setInterval(() => {
      const value = clamp(((Date.now() - startedAt) / duration) * 100, 0, 100);
      setHoverProgress(value);
    }, 16);
  };

  const moveBurner = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || finished || !currentGuest) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const next = {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 6, 94),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 20, 90),
    };

    setBurnerPos(next);

    const nearGuest = distance(next, currentGuest) < 9.5;

    if (nearGuest && activeGuestId !== currentGuest.id && !perfumeTimerRef.current) {
      setActiveGuestId(currentGuest.id);
      setStepMessage(`ثبّت المبخرة قرب ${currentGuest.label} ليكتمل التبخير`);
      startProgress(900);
      perfumeTimerRef.current = window.setTimeout(() => {
        clearTimers();
        setPerfumedGuests(prev => [...prev, currentGuest.id]);
        setActiveGuestId(null);
        setDragging(false);
        setStepMessage(`تم تبخير ${currentGuest.label}`);
        window.setTimeout(() => {
          setBurnerPos(BURNER_HOME);
          setStepMessage('انتقل إلى الضيف التالي');
        }, 500);
      }, 900);
    } else if (!nearGuest && activeGuestId === currentGuest.id) {
      clearTimers();
      setActiveGuestId(null);
      setStepMessage(`قرّب المبخرة من ${currentGuest.label}`);
    }
  };

  return (
    <ModalFrame title="تبخير المجلس" onClose={onClose}>
      <p className="mt-2 text-center text-white/90 text-sm sm:text-base">
        مرّر المبخرة قرب كل ضيف، وثبّتها لحظة قصيرة حتى يكتمل التبخير بصورة واقعية.
      </p>

      <div
        onPointerMove={moveBurner}
        onPointerUp={() => {
          setDragging(false);
          clearTimers();
          setActiveGuestId(null);
          if (!finished && currentGuest) setStepMessage(`قرّب المبخرة من ${currentGuest.label}`);
        }}
        onPointerCancel={() => {
          setDragging(false);
          clearTimers();
          setActiveGuestId(null);
        }}
        onPointerLeave={() => {
          setDragging(false);
          clearTimers();
          setActiveGuestId(null);
        }}
        className="mt-6 relative h-[420px] rounded-3xl border-2 border-[#FFE082] overflow-hidden touch-none bg-black/15"
      >
        <img
          src={MASTER_IMAGE_PATH}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/8 pointer-events-none" />

        {GUESTS.map((guest) => {
          const done = perfumedGuests.includes(guest.id);
          const active = activeGuestId === guest.id;
          return (
            <div
              key={guest.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${guest.x}%`, top: `${guest.y}%` }}
            >
              <div
                className={`rounded-full transition-all ${
                  done
                    ? 'w-16 h-16 border-2 border-emerald-300 bg-emerald-300/7'
                    : active
                    ? 'w-28 h-28 border-[3px] border-[#FFE082] bg-[#FFE082]/6 shadow-[0_0_28px_rgba(255,224,130,.28)]'
                    : 'w-0 h-0'
                }`}
              />

              {done && (
                <>
                  <div className="absolute left-1/2 top-[42px] -translate-x-1/2 rounded-full border border-emerald-300 bg-emerald-900/90 px-3 py-1 text-[11px] font-black text-white whitespace-nowrap">
                    تم التبخير ✓
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-16 h-24 rounded-full bg-white/10 blur-xl" />
                  <div className="absolute left-[42%] -top-2 w-8 h-16 rounded-full bg-white/9 blur-lg" />
                </>
              )}
            </div>
          );
        })}

        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${burnerPos.x}%`,
            top: `calc(${burnerPos.y}% - 92px)`,
            transform: `translateX(-50%) scale(${smokeScale})`,
          }}
        >
          <div className="absolute left-0 bottom-0 w-14 h-28 rounded-full bg-white/14 blur-xl animate-pulse" />
          <div className="absolute left-4 bottom-8 w-10 h-20 rounded-full bg-white/10 blur-lg" />
          <div className="absolute -left-2 bottom-16 w-10 h-16 rounded-full bg-white/8 blur-xl" />
        </div>

        <button
          onPointerDown={(e) => {
            if (finished) return;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          className="absolute z-30 w-[82px] h-[104px] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing drop-shadow-[0_10px_16px_rgba(0,0,0,.4)]"
          style={{ left: `${burnerPos.x}%`, top: `${burnerPos.y}%` }}
          aria-label="المبخرة"
        >
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-16 h-12 rounded-[10px_10px_20px_20px] border-2 border-[#f0d195] bg-[linear-gradient(145deg,#f6dda3,#b77d34_55%,#6f451f)] shadow-[inset_5px_5px_8px_rgba(255,255,255,.35),0_8px_15px_rgba(0,0,0,.35)]" />
          <div className="absolute left-1/2 bottom-9 -translate-x-1/2 w-12 h-12 rotate-45 border-2 border-[#f0d195] bg-[linear-gradient(145deg,#e6c47e,#966528)] shadow-md" />
          <div className="absolute left-1/2 bottom-[65px] -translate-x-1/2 w-9 h-9 rotate-45 border-2 border-[#f0d195] bg-[#9b6b2e]" />
          <div className="absolute left-1/2 bottom-[82px] -translate-x-1/2 w-4 h-4 rounded-full bg-[#5d311a] shadow-[0_0_16px_rgba(255,163,74,.7)]" />
        </button>

        {hoverProgress > 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-[220px] rounded-full border border-white/20 bg-black/55 p-1">
            <div className="h-2 rounded-full bg-[#FFE082] transition-all" style={{ width: `${hoverProgress}%` }} />
          </div>
        )}

        {!finished && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-sm font-bold text-white text-center">
            {stepMessage}
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
          <div className="mt-1 text-2xl font-black text-[#FFE082]">{perfumedGuests.length}/3</div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/20 py-3 text-center">
          <div className="text-xs text-white/65">الحالة</div>
          <div className="mt-1 text-lg font-black text-[#FFE082]">{finished ? 'مكتمل' : 'تبخير الضيوف'}</div>
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
