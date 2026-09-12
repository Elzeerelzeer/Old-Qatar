import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle2, Gamepad2, Sparkles, X } from 'lucide-react';
import { CharacterGender, Direction, GameSettings } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

interface GamesSceneProps {
  gender: CharacterGender;
  settings: GameSettings;
  onReturnToVillage: () => void;
  onComplete?: () => void;
}

type GameId = 'dahrooj' | 'teela' | 'saqla';
const MASTER_IMAGE_PATH = '/assets/games-master-map.png';
const SPOTS = [
  { id: 'dahrooj' as GameId, title: 'الدحروي', x: 27, y: 58 },
  { id: 'teela' as GameId, title: 'التيلة', x: 51, y: 58 },
  { id: 'saqla' as GameId, title: 'الصقلة', x: 76, y: 58 },
];

const GAME_TITLES: Record<GameId, string> = {
  dahrooj: 'الدحروي',
  teela: 'التيلة',
  saqla: 'الصقلة',
};

export function GamesScene({ gender, settings, onReturnToVillage, onComplete }: GamesSceneProps) {
  const [pos, setPos] = useState({ x: 50, y: 80 });
  const [direction, setDirection] = useState<Direction>('up');
  const [moving, setMoving] = useState(false);
  const [active, setActive] = useState<GameId | null>(null);
  const [completed, setCompleted] = useState<GameId[]>([]);
  const [success, setSuccess] = useState(false);
  const keys = useRef<Record<string, boolean>>({});
  const touch = useRef<Direction | null>(null);
  const reported = useRef(false);

  const [showIntroGuide, setShowIntroGuide] = useState(true);
  const [reinforcement, setReinforcement] = useState<string | null>(null);
  const [characterSize, setCharacterSize] = useState(62);

  const speakArabic = (message: string) => {
    if (!settings.isSoundEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    const voices = synth.getVoices();
    const arabicVoice =
      voices.find(v => v.lang === 'ar-QA') ||
      voices.find(v => v.lang === 'ar-SA') ||
      voices.find(v => v.lang.toLowerCase().startsWith('ar'));

    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.lang = arabicVoice?.lang || 'ar-SA';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = Math.max(0.2, Math.min(1, settings.volume ?? 0.6));

    synth.speak(utterance);
  };

  const playSuccessChime = () => {
    if (!settings.isSoundEnabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(0.04, (settings.volume ?? 0.6) * 0.12),
          now + index * 0.12 + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + index * 0.12 + 0.28
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.3);
      });

      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 900);
    } catch {
      // Keep the game working even if Web Audio is blocked.
    }
  };

  useEffect(() => {
    const updateCharacterSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const shortestSide = Math.min(width, height);

      if (width < 480) {
        setCharacterSize(44);
      } else if (width < 768) {
        setCharacterSize(50);
      } else if (width < 1200) {
        setCharacterSize(58);
      } else if (width < 1800) {
        setCharacterSize(66);
      } else {
        setCharacterSize(shortestSide > 900 ? 76 : 70);
      }
    };

    updateCharacterSize();
    window.addEventListener('resize', updateCharacterSize);
    return () => window.removeEventListener('resize', updateCharacterSize);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntroGuide(false);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settings.isSoundEnabled) return;

    const timer = window.setTimeout(() => {
      speakArabic('إلى أين تتجه الشخصية؟ اختر الدحروي، أو التيلة، أو الصقلة.');
    }, 450);

    return () => window.clearTimeout(timer);
    // Run when sound becomes enabled while the scene is open.
  }, [settings.isSoundEnabled]);

  const near = useMemo(() => {
    return SPOTS.find(s => Math.hypot(pos.x - s.x, pos.y - s.y) < 11) || null;
  }, [pos]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)) {
        e.preventDefault(); keys.current[k] = true;
      }
    };
    const ku = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  useEffect(() => {
    let id = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now-last)/16.67, 2); last = now;
      if (!active && !success) {
        const speed = settings.walkSpeed === 'calm' ? .24 : .36;
        const k = keys.current, t = touch.current;
        let dx=0, dy=0, d: Direction | null=null;
        if(k.arrowup||k.w||t==='up'){dy-=speed*dt;d='up';}
        if(k.arrowdown||k.s||t==='down'){dy+=speed*dt;d='down';}
        if(k.arrowleft||k.a||t==='left'){dx-=speed*dt;d='left';}
        if(k.arrowright||k.d||t==='right'){dx+=speed*dt;d='right';}
        if(dx&&dy){dx*=.7071;dy*=.7071;}
        if(dx||dy){
          setMoving(true); if(d)setDirection(d);
          setPos(p=>({x:Math.max(7,Math.min(93,p.x+dx)),y:Math.max(40,Math.min(89,p.y+dy))}));
        } else setMoving(false);
      } else setMoving(false);
      id=requestAnimationFrame(loop);
    };
    id=requestAnimationFrame(loop); return()=>cancelAnimationFrame(id);
  }, [active, success, settings.walkSpeed]);

  const done = (game: GameId) => {
    const gameTitle = GAME_TITLES[game];

    playSuccessChime();
    setReinforcement(`أحسنت! أكملت ${gameTitle}`);

    if (settings.isSoundEnabled) {
      speakArabic(`أحسنت! أكملت ${gameTitle}.`);
    }

    window.setTimeout(() => {
      setReinforcement(null);
    }, 2200);

    setCompleted(prev => {
      if(prev.includes(game)) return prev;

      const next=[...prev,game];

      if(next.length>=2 && !reported.current){
        reported.current=true;

        setTimeout(()=>{
          playSuccessChime();
          onComplete?.();
          setSuccess(true);

          if (settings.isSoundEnabled) {
            speakArabic('ممتاز! أنجزت لعبتين وحصلت على ختم فريج الألعاب.');
          }
        },450);
      }

      return next;
    });

    setActive(null);
  };

  const startTouch=(d:Direction)=>{touch.current=d;setDirection(d);};
  const stopTouch=()=>{touch.current=null;};

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06283a] select-none text-white" dir="rtl">
      <button
        onClick={onReturnToVillage}
        className="fixed top-5 left-5 z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-5 py-2.5 text-white font-black shadow-xl active:scale-95 transition-transform"
      >
        العودة إلى القرية
      </button>

      <div className="fixed top-5 right-5 z-50 rounded-full bg-[#06283a]/92 border border-[#E6C280] px-5 py-2.5 text-[#FFE082] font-black shadow-xl">
        فريج الألعاب
      </div>

      <div className="fixed top-[76px] right-5 z-50 rounded-2xl bg-[#06283a]/92 border border-white/20 px-5 py-2.5 text-white shadow-xl">
        <b className="text-[#FFE082] text-xl">{completed.length}/2</b>
        <span className="mr-2 text-sm">للحصول على الختم</span>
      </div>

      {/* MAP */}
      <img
        src={MASTER_IMAGE_PATH}
        alt="فريج الألعاب"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* SPOTS */}
          {SPOTS.map((s) => {
            const isDone = completed.includes(s.id);
            const isNear = near?.id === s.id;
            return (
              <div
                key={s.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {(isDone || isNear) && (
                  <div
                    className={`rounded-full border-2 px-3 py-1 sm:px-4 sm:py-2 font-black text-xs sm:text-base shadow-xl ${
                      isDone
                        ? 'bg-emerald-950/90 border-emerald-300 text-white'
                        : 'bg-[#8A1538]/95 border-[#FFE082] text-[#FFE082]'
                    }`}
                  >
                    {isDone ? (
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                        مكتمل
                      </span>
                    ) : (
                      s.title
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* CHARACTER */}
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%,-88%)',
            }}
          >
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-10 sm:w-12 h-2.5 sm:h-3 rounded-full bg-black/35 blur-sm" />
            <CharacterAvatar
              gender={gender}
              direction={direction}
              isMoving={moving}
              isCelebrating={false}
              size={characterSize}
            />
          </div>

      {near && !completed.includes(near.id) && !active && (
        <button
          onClick={() => setActive(near.id)}
          className="fixed left-1/2 bottom-4 sm:bottom-7 -translate-x-1/2 z-[100] min-w-[200px] sm:min-w-[240px] rounded-2xl bg-[#8A1538] border-[3px] border-[#FFE082] px-5 py-2.5 sm:px-7 sm:py-3.5 text-base sm:text-xl font-black text-[#FFE082] shadow-2xl active:scale-95 transition-transform"
        >
          <span className="flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ابدأ {near.title}
          </span>
        </button>
      )}

      {showIntroGuide && !active && !success && (
        <div className="fixed left-1/2 top-3 sm:top-5 -translate-x-1/2 z-[120] w-[min(92vw,560px)] rounded-2xl border-2 border-[#FFE082] bg-[#06283a]/95 px-4 py-2 sm:px-5 sm:py-3 text-center shadow-2xl backdrop-blur-md">
          <div className="text-base sm:text-xl font-black text-[#FFE082]">
            إلى أين تتجه الشخصية؟
          </div>
          <div className="mt-0.5 sm:mt-1 text-xs sm:text-base font-bold text-white/90">
            تحرّك نحو الدحروي أو التيلة أو الصقلة، ثم ابدأ اللعبة.
          </div>
        </div>
      )}

      {reinforcement && (
        <div className="fixed left-1/2 top-[82px] sm:top-[92px] -translate-x-1/2 z-[220] flex items-center gap-2 rounded-full border-2 border-[#FFE082] bg-emerald-800/95 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-lg font-black text-white shadow-2xl">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE082]" />
          {reinforcement}
        </div>
      )}

      <DPad onStart={startTouch} onEnd={stopTouch} />

      {active === 'dahrooj' && <Dahrooj onClose={() => setActive(null)} onWin={() => done('dahrooj')} />}
      {active === 'teela' && <Teela onClose={() => setActive(null)} onWin={() => done('teela')} />}
      {active === 'saqla' && <Saqla onClose={() => setActive(null)} onWin={() => done('saqla')} />}

      {success && (
        <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[30px] border-2 border-[#FFE082] bg-[#06283a]/95 p-6 text-center shadow-2xl">
            <div className="text-6xl">🏅</div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#FFE082]">أحسنت!</h2>
            <div className="mt-3 rounded-full border border-[#FFE082]/50 bg-[#FFE082]/10 px-4 py-2 text-xs sm:text-sm font-bold text-[#FFE082]">
              تعزيز: ممتاز • استمر بهذا الأداء
            </div>
            <p className="mt-2 text-white text-sm sm:text-lg">أنجزت لعبتين وحصلت على ختم فريج الألعاب.</p>
            <button
              onClick={onReturnToVillage}
              className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 text-[#FFE082] font-black"
            >
              العودة إلى القرية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DPad({onStart,onEnd}:{onStart:(d:Direction)=>void;onEnd:()=>void}) {
  const buttons:[Direction,string,any][]=[
    ['up','top-2 left-1/2 -translate-x-1/2',ArrowUp],['down','bottom-2 left-1/2 -translate-x-1/2',ArrowDown],
    ['left','left-2 top-1/2 -translate-y-1/2',ArrowLeft],['right','right-2 top-1/2 -translate-y-1/2',ArrowRight],
  ];
  return <div className="fixed bottom-5 left-5 z-[90] w-[138px] h-[138px] rounded-full bg-[#06283a]/92 border-2 border-[#E6C280] shadow-2xl touch-none">
    {buttons.map(([d,c,I])=><button key={d} onPointerDown={e=>{e.preventDefault();onStart(d)}} onPointerUp={onEnd} onPointerLeave={onEnd} onPointerCancel={onEnd} className={`absolute ${c} w-11 h-11 rounded-xl bg-[#8A1538] border-2 border-[#E6C280] flex items-center justify-center text-white`}><I className="w-7 h-7 stroke-[3]"/></button>)}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#B99658] border-2 border-[#F6E3B4] flex items-center justify-center text-white">✦</div>
  </div>;
}

function Frame({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
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
        overflow-hidden
      "
      dir="rtl"
    >
      <div
        className="
          relative
          w-full
          max-w-2xl
          max-h-[calc(100dvh-1rem)]
          sm:max-h-[calc(100dvh-2rem)]
          overflow-y-auto
          overscroll-contain
          rounded-[24px]
          sm:rounded-[30px]
          border-2
          border-[#FFE082]
          bg-[#06283a]/95
          p-4
          sm:p-6
          pb-24
          text-white
          shadow-2xl
          [scrollbar-width:thin]
        "
      >
        <button
          onClick={onClose}
          className="
            sticky
            top-0
            float-left
            z-[40]
            w-10
            h-10
            rounded-full
            bg-[#061f2c]/95
            border
            border-white/25
            flex
            items-center
            justify-center
            shadow-lg
          "
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          className="
            sticky
            top-0
            z-[30]
            bg-[#06283a]/96
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

        <div className="clear-both">
          {children}
        </div>
      </div>
    </div>
  );
}

function Dahrooj({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [ring,setRing]=useState({x:10,y:58});
  const [passed,setPassed]=useState<number[]>([]);
  const [finished,setFinished]=useState(false);

  const gates=[28,52,76];

  const moveRing=(dx:number,dy:number)=>{
    if(finished)return;

    setRing(prev=>{
      const next={
        x:Math.max(8,Math.min(90,prev.x+dx)),
        y:Math.max(36,Math.min(72,prev.y+dy)),
      };

      const newPassed=gates.filter(g=>next.x>=g);
      setPassed(newPassed);

      if(next.x>=88&&newPassed.length===3){
        setFinished(true);
      }

      return next;
    });
  };

  const repeatRef=useRef<number|null>(null);

  const startRepeat=(dx:number,dy:number)=>{
    moveRing(dx,dy);

    if(repeatRef.current){
      window.clearInterval(repeatRef.current);
    }

    repeatRef.current=window.setInterval(()=>{
      moveRing(dx,dy);
    },85);
  };

  const stopRepeat=()=>{
    if(repeatRef.current){
      window.clearInterval(repeatRef.current);
      repeatRef.current=null;
    }
  };

  useEffect(()=>{
    return ()=>stopRepeat();
  },[]);

  return <Frame title="الدحروي" onClose={onClose}>
    <p className="mt-2 text-center text-white/90">
      حرّك الحلقة بالأزرار، مرّ عبر البوابات الثلاث، ثم أصل إلى خط النهاية.
    </p>

    <div className="mt-6 h-56 rounded-3xl border-2 border-[#FFE082] relative overflow-hidden bg-[linear-gradient(180deg,#d7b27a_0%,#c69760_100%)] shadow-inner">
      <div className="absolute left-[6%] right-[6%] top-1/2 h-20 -translate-y-1/2 rounded-full border-2 border-dashed border-[#7c4f2a]/45 bg-[#e1bd86]/55" />

      {gates.map((g,i)=>{
        const ok=passed.includes(g);

        return <div key={g} className="absolute top-[24%] bottom-[24%] w-14 -translate-x-1/2" style={{left:`${g}%`}}>
          <div className={`absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 ${ok?'bg-emerald-600/70':'bg-[#8A1538]/55'}`} />
          <div className={`absolute top-0 left-0 right-0 h-2 rounded-full ${ok?'bg-emerald-500':'bg-[#8A1538]'}`} />
          <span className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black ${ok?'bg-emerald-700 border-emerald-200 text-white':'bg-[#06283a] border-[#FFE082] text-[#FFE082]'}`}>
            {ok?'✓':i+1}
          </span>
        </div>;
      })}

      <div className="absolute right-[3%] top-[24%] bottom-[24%] w-10 flex flex-col justify-center items-center">
        <div className="text-4xl">🏁</div>
        <div className="mt-1 text-xs font-black text-[#5d371e]">النهاية</div>
      </div>

      <div
        className="absolute z-20 h-3 rounded-full bg-[linear-gradient(90deg,#6b3b1f,#b87942,#6b3b1f)] shadow-md origin-right pointer-events-none"
        style={{
          width:'110px',
          left:`calc(${ring.x}% - 102px)`,
          top:`calc(${ring.y}% + 14px)`,
          transform:'rotate(9deg)',
        }}
      />

      <div
        className="absolute z-30 w-20 h-20 rounded-full border-[8px] border-[#76818a] bg-transparent shadow-[inset_0_0_0_3px_rgba(255,255,255,.55),0_8px_18px_rgba(0,0,0,.35)] pointer-events-none"
        style={{
          left:`${ring.x}%`,
          top:`${ring.y}%`,
          transform:'translate(-50%,-50%)',
        }}
      >
        <span className="absolute inset-2 rounded-full border border-white/35" />
      </div>

      {finished&&<div className="absolute inset-0 z-40 bg-emerald-950/25 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
        <div className="rounded-full bg-emerald-700 border-2 border-[#FFE082] px-6 py-3 text-xl font-black text-white shadow-xl">
          أحسنت! وصلت للنهاية ✓
        </div>
      </div>}
    </div>

    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="relative w-40 h-40 rounded-full bg-black/25 border-2 border-[#E6C280]/70 shadow-inner select-none touch-none">
        <button
          onPointerDown={()=>startRepeat(0,-2.2)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white active:scale-95"
          aria-label="تحريك الحلقة للأعلى"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
        </button>

        <button
          onPointerDown={()=>startRepeat(0,2.2)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white active:scale-95"
          aria-label="تحريك الحلقة للأسفل"
        >
          <ArrowDown className="w-7 h-7 stroke-[3]" />
        </button>

        <button
          onPointerDown={()=>startRepeat(-2.2,0)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white active:scale-95"
          aria-label="تحريك الحلقة لليسار"
        >
          <ArrowLeft className="w-7 h-7 stroke-[3]" />
        </button>

        <button
          onPointerDown={()=>startRepeat(2.2,0)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white active:scale-95"
          aria-label="تحريك الحلقة لليمين"
        >
          <ArrowRight className="w-7 h-7 stroke-[3]" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#B99658] border-2 border-[#F6E3B4] flex items-center justify-center text-white text-xl">
          ✦
        </div>
      </div>

      <div className="text-sm text-white/75">
        اضغط مطولًا على السهم للحركة المستمرة
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">البوابات</div>
        <div className="text-2xl font-black text-[#FFE082]">{passed.length}/3</div>
      </div>

      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">الحالة</div>
        <div className="text-lg font-black text-[#FFE082]">{finished?'تم الإنجاز':'استمر'}</div>
      </div>
    </div>

    {finished&&<button onClick={onWin} className="sticky bottom-2 z-[50] mt-5 w-full rounded-2xl bg-emerald-700 border-[3px] border-[#FFE082] py-3.5 font-black text-white shadow-[0_10px_30px_rgba(0,0,0,.45)] active:scale-95">
      اعتماد الإنجاز ✓
    </button>}
  </Frame>;
}
function Teela({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [hits,setHits]=useState(0);
  const [shots,setShots]=useState(0);
  const [pull,setPull]=useState({x:0,y:0});
  const [shooting,setShooting]=useState(false);
  const [hitTargets,setHitTargets]=useState<number[]>([]);
  const start=useRef({x:0,y:0});
  const dragging=useRef(false);

  const targets=[
    {id:0,left:'31%',top:'25%',tone:'from-emerald-200 via-emerald-500 to-emerald-900'},
    {id:1,left:'50%',top:'18%',tone:'from-rose-200 via-rose-500 to-rose-900'},
    {id:2,left:'69%',top:'25%',tone:'from-sky-200 via-sky-500 to-blue-900'},
  ];

  const power=Math.min(100,Math.round(Math.hypot(pull.x,pull.y)*1.15));

  const release=()=>{
    if(!dragging.current||shooting)return;
    dragging.current=false;

    setShots(v=>v+1);

    const targetIndex=
      pull.x>22 ? 0 :
      pull.x<-22 ? 2 :
      1;

    const enoughPower=power>=38;

    setShooting(true);

    window.setTimeout(()=>{
      if(enoughPower&&!hitTargets.includes(targetIndex)){
        setHitTargets(prev=>[...prev,targetIndex]);
        setHits(v=>Math.min(3,v+1));
      }
      setShooting(false);
      setPull({x:0,y:0});
    },420);
  };

  const launchX=shooting ? -pull.x*1.7 : pull.x;
  const launchY=shooting ? -145 : pull.y;

  return <Frame title="التيلة" onClose={onClose}>
    <p className="mt-2 text-center text-white/90">
      اسحب التيلة للخلف، صوِّب نحو إحدى التيل، ثم اتركها.
    </p>

    <div className="mt-6 h-[300px] rounded-3xl border-2 border-[#FFE082] relative overflow-hidden touch-none bg-[radial-gradient(circle_at_50%_30%,#e4bf86_0%,#c99961_55%,#b77e48_100%)]">
      {/* target circle on sand */}
      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 w-72 h-32 rounded-[50%] border-[3px] border-[#7b4a2b]/70 bg-[#e7c692]/25" />

      {/* target marbles */}
      {targets.map(t=>{
        const hit=hitTargets.includes(t.id);
        return <div
          key={t.id}
          className={`absolute w-14 h-14 rounded-full border-2 border-white/80 bg-gradient-to-br ${t.tone} shadow-[inset_6px_6px_12px_rgba(255,255,255,.55),0_10px_16px_rgba(0,0,0,.28)] transition-all duration-300 ${hit?'opacity-20 scale-75 translate-y-6':'opacity-100 scale-100'}`}
          style={{left:t.left,top:t.top,transform:'translate(-50%,-50%)'}}
        >
          <span className="absolute top-[12%] left-[18%] w-4 h-3 rounded-full bg-white/70 blur-[1px]" />
        </div>
      })}

      {/* aiming line */}
      {(dragging.current||Math.abs(pull.x)>2||pull.y>2)&&!shooting&&
        <div
          className="absolute left-1/2 bottom-[66px] w-[3px] bg-white/70 origin-bottom rounded-full pointer-events-none"
          style={{
            height:`${Math.max(30,Math.min(95,power))}px`,
            transform:`translateX(-50%) rotate(${pull.x/5}deg)`,
          }}
        />
      }

      {/* shooter marble */}
      <button
        type="button"
        onPointerDown={e=>{
          if(shooting)return;
          dragging.current=true;
          start.current={x:e.clientX,y:e.clientY};
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e=>{
          if(!dragging.current||shooting)return;
          const dx=e.clientX-start.current.x;
          const dy=e.clientY-start.current.y;
          setPull({
            x:Math.max(-65,Math.min(65,dx)),
            y:Math.max(0,Math.min(78,dy)),
          });
        }}
        onPointerUp={release}
        onPointerCancel={()=>{dragging.current=false;setPull({x:0,y:0});}}
        className="absolute left-1/2 bottom-7 w-16 h-16 rounded-full border-[3px] border-white/85 bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#93c5fd_18%,#2563eb_58%,#172554_100%)] shadow-[inset_8px_8px_14px_rgba(255,255,255,.6),0_12px_22px_rgba(0,0,0,.35)] cursor-grab active:cursor-grabbing transition-transform duration-[420ms] ease-out"
        style={{
          transform:`translate(calc(-50% + ${launchX}px), ${launchY}px)`,
        }}
        aria-label="اسحب التيلة وصوب"
      >
        <span className="absolute top-[15%] left-[18%] w-5 h-4 rounded-full bg-white/75 blur-[1px]" />
      </button>

      {/* visual pull strength only while aiming */}
      {!shooting&&power>0&&<div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 border border-white/15 px-3 py-2">
        <div className="w-24 h-2 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-[#FFE082]" style={{width:`${power}%`}} />
        </div>
        <span className="text-xs font-bold text-white/90">قوة السحب</span>
      </div>}
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">الإصابات</div>
        <div className="text-2xl font-black text-[#FFE082]">{hits}/3</div>
      </div>
      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">المحاولات</div>
        <div className="text-2xl font-black text-[#FFE082]">{shots}</div>
      </div>
    </div>

    {hits>=3&&<button onClick={onWin} className="sticky bottom-2 z-[50] mt-5 w-full rounded-2xl bg-emerald-700 border-[3px] border-[#FFE082] py-3.5 font-black text-white shadow-[0_10px_30px_rgba(0,0,0,.45)] active:scale-95">اعتماد الإنجاز ✓</button>}
  </Frame>;
}
function Saqla({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [level,setLevel]=useState(1);
  const [stage,setStage]=useState<'ready'|'air'|'catch'|'done'>('ready');
  const [tossed,setTossed]=useState<number|null>(null);
  const [collected,setCollected]=useState<number[]>([]);
  const [roundMessage,setRoundMessage]=useState('اختر حصاة لرميها');

  const targetCount=level===1?1:2;

  const stones=[
    {id:1,x:18,y:66,rotation:-10},
    {id:2,x:36,y:72,rotation:8},
    {id:3,x:52,y:64,rotation:-5},
    {id:4,x:68,y:73,rotation:11},
    {id:5,x:82,y:63,rotation:-7},
  ];

  const toss=(stone:number)=>{
    if(stage!=='ready')return;

    setTossed(stone);
    setCollected([]);
    setStage('air');
    setRoundMessage(`التقط ${targetCount} ${targetCount===1?'حصاة':'حصاتين'} بسرعة`);
  };

  const collect=(stone:number)=>{
    if(stage!=='air'||stone===tossed)return;

    setCollected(prev=>{
      if(prev.includes(stone))return prev;

      const next=[...prev,stone];

      if(next.length>=targetCount){
        setStage('catch');
        setRoundMessage('أمسك الحصاة المرمية قبل أن تسقط');
      }

      return next;
    });
  };

  const catchStone=()=>{
    if(stage!=='catch')return;

    if(level===1){
      setLevel(2);
      setStage('ready');
      setTossed(null);
      setCollected([]);
      setRoundMessage('ممتاز! الآن اختر حصاة للمستوى الثاني');
    }else{
      setStage('done');
      setRoundMessage('أحسنت! أكملت الصقلة');
    }
  };

  return <Frame title="الصقلة" onClose={onClose}>
    <p className="mt-2 text-center text-white/90">
      {level===1
        ? 'المستوى الأول: ارمِ حصاة، التقط حصاة واحدة، ثم أمسك الحصاة المرمية.'
        : 'المستوى الثاني: ارمِ حصاة، التقط حصاتين، ثم أمسك الحصاة المرمية.'}
    </p>

    <div className="mt-6 relative min-h-[360px] rounded-3xl border-2 border-[#FFE082] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#e6c28b_0%,#c99d67_58%,#ad7442_100%)] shadow-inner">
      <div className="absolute inset-x-10 top-8 h-16 rounded-[50%] border-2 border-dashed border-[#7e4f2e]/40" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#06283a]/92 border border-[#FFE082]/70 px-5 py-2 text-sm font-black text-[#FFE082] shadow-lg">
        {roundMessage}
      </div>

      {/* Toss arc */}
      {tossed!==null&&stage!=='ready'&&stage!=='done'&&
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-24 h-24 pointer-events-none">
          <div className="absolute inset-0 rounded-full border-t-2 border-dashed border-white/55" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 text-3xl">↗</div>
        </div>
      }

      {stones.map(stone=>{
        const isTossed=tossed===stone.id;
        const isCollected=collected.includes(stone.id);

        let top=`${stone.y}%`;
        let transform=`translate(-50%,-50%) rotate(${stone.rotation}deg)`;

        if(isTossed&&stage!=='ready'){
          top='30%';
          transform=`translate(-50%,-50%) rotate(${stone.rotation+22}deg) scale(1.08)`;
        }

        return <button
          key={stone.id}
          disabled={isCollected||(isTossed&&stage!=='ready')}
          onClick={()=>{
            if(stage==='ready'){
              toss(stone.id);
            }else{
              collect(stone.id);
            }
          }}
          className={`
            absolute
            w-[74px]
            h-[56px]
            rounded-[46%_54%_42%_58%]
            border-2
            font-black
            shadow-[inset_6px_5px_10px_rgba(255,255,255,.22),inset_-7px_-6px_12px_rgba(55,35,20,.22),0_10px_18px_rgba(0,0,0,.25)]
            transition-all
            duration-300
            active:scale-90

            ${
              isCollected
                ? 'bg-emerald-700 border-emerald-200 text-white opacity-45'
                : isTossed&&stage!=='ready'
                  ? 'bg-[#d8c4a8] border-[#FFE082] text-[#8A1538] z-20'
                  : 'bg-[linear-gradient(145deg,#b9a58d,#88735f)] border-[#ead8b8] text-white'
            }
          `}
          style={{
            left:`${stone.x}%`,
            top,
            transform,
          }}
          aria-label={`الحصاة ${stone.id}`}
        >
          {isCollected?'✓':''}
        </button>;
      })}

      {/* Hand target during catch */}
      {stage==='catch'&&
        <button
          onClick={catchStone}
          className="absolute left-1/2 bottom-7 -translate-x-1/2 rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] px-7 py-3 text-lg font-black text-[#FFE082] shadow-2xl active:scale-95"
        >
          ✋ أمسك الحصاة الآن
        </button>
      }

      {stage==='air'&&
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-black/25 border border-white/15 px-5 py-2 text-sm text-white/90">
          التقطت {collected.length}/{targetCount}
        </div>
      }

      {stage==='done'&&
        <div className="absolute inset-0 bg-emerald-950/25 backdrop-blur-[1px] flex items-center justify-center">
          <div className="rounded-full bg-emerald-700 border-2 border-[#FFE082] px-7 py-3 text-xl font-black text-white shadow-xl">
            أكملت الصقلة ✓
          </div>
        </div>
      }
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">المستوى</div>
        <div className="text-2xl font-black text-[#FFE082]">{level}/2</div>
      </div>

      <div className="rounded-2xl bg-black/25 border border-white/15 py-3 text-center">
        <div className="text-sm text-white/70">الحالة</div>
        <div className="text-lg font-black text-[#FFE082]">
          {stage==='done'?'تم الإنجاز':stage==='catch'?'أمسك المرمية':stage==='air'?'اجمع الحصوات':'ابدأ'}
        </div>
      </div>
    </div>

    {stage==='done'&&<button onClick={onWin} className="sticky bottom-2 z-[50] mt-5 w-full rounded-2xl bg-emerald-700 border-[3px] border-[#FFE082] py-3.5 font-black text-white shadow-[0_10px_30px_rgba(0,0,0,.45)] active:scale-95">
      اعتماد الإنجاز ✓
    </button>}
  </Frame>;
}
