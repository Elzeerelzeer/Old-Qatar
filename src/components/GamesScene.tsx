import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle2, Gamepad2, X } from 'lucide-react';
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
    setCompleted(prev => {
      if(prev.includes(game)) return prev;
      const next=[...prev,game];
      if(next.length>=2 && !reported.current){
        reported.current=true;
        setTimeout(()=>{ onComplete?.(); setSuccess(true); },300);
      }
      return next;
    });
    setActive(null);
  };

  const startTouch=(d:Direction)=>{touch.current=d;setDirection(d);};
  const stopTouch=()=>{touch.current=null;};

  return <div className="relative w-full h-screen overflow-hidden bg-[#b98b58] select-none" dir="rtl">
    <img src={MASTER_IMAGE_PATH} alt="فريج الألعاب" draggable={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none"/>
    <div className="absolute inset-0 bg-black/5 pointer-events-none"/>

    <button onClick={onReturnToVillage} className="fixed top-5 left-5 z-50 rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-5 py-2.5 text-white font-black shadow-xl">العودة إلى القرية</button>
    <div className="fixed top-5 right-5 z-50 rounded-full bg-[#06283a]/92 border border-[#E6C280] px-5 py-2.5 text-[#FFE082] font-black">فريج الألعاب</div>
    <div className="fixed top-[76px] right-5 z-50 rounded-2xl bg-[#06283a]/92 border border-white/20 px-5 py-3 text-white shadow-xl"><b className="text-[#FFE082] text-xl">{completed.length}/2</b><span className="mr-2 text-sm">للحصول على الختم</span></div>

    {SPOTS.map(s=>{
      const isDone=completed.includes(s.id), isNear=near?.id===s.id;
      return <div key={s.id} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{left:`${s.x}%`,top:`${s.y}%`}}>
        {(isDone||isNear)&&<div className={`rounded-full border-2 px-4 py-2 font-black shadow-xl ${isDone?'bg-emerald-950/90 border-emerald-300 text-white':'bg-[#8A1538]/95 border-[#FFE082] text-[#FFE082]'}`}>
          {isDone?<span className="flex gap-2"><CheckCircle2 className="w-5 h-5"/>مكتمل</span>:s.title}
        </div>}
      </div>
    })}

    <div className="absolute z-30 pointer-events-none" style={{left:`${pos.x}%`,top:`${pos.y}%`,transform:'translate(-50%,-88%)'}}>
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-12 h-3 rounded-full bg-black/25 blur-sm"/>
      <CharacterAvatar gender={gender} direction={direction} isMoving={moving} isCelebrating={false} size={62}/>
    </div>

    {near && !completed.includes(near.id) && !active && <button onClick={()=>setActive(near.id)} className="fixed left-1/2 bottom-7 -translate-x-1/2 z-[100] min-w-[240px] rounded-2xl bg-[#8A1538] border-[3px] border-[#FFE082] px-7 py-3.5 text-xl font-black text-[#FFE082] shadow-2xl"><span className="flex items-center justify-center gap-2"><Gamepad2 className="w-6 h-6"/>العب {near.title}</span></button>}

    <DPad onStart={startTouch} onEnd={stopTouch}/>

    {active==='dahrooj'&&<Dahrooj onClose={()=>setActive(null)} onWin={()=>done('dahrooj')}/>}
    {active==='teela'&&<Teela onClose={()=>setActive(null)} onWin={()=>done('teela')}/>}
    {active==='saqla'&&<Saqla onClose={()=>setActive(null)} onWin={()=>done('saqla')}/>}

    {success&&<div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[30px] border-2 border-[#FFE082] bg-[#06283a]/95 p-6 text-center shadow-2xl">
        <div className="text-6xl">🏅</div><h2 className="mt-3 text-3xl font-black text-[#FFE082]">أحسنت!</h2>
        <p className="mt-2 text-white text-lg">أنجزت لعبتين وحصلت على ختم فريج الألعاب.</p>
        <button onClick={onReturnToVillage} className="mt-6 w-full rounded-2xl bg-[#8A1538] border-2 border-[#FFE082] py-3.5 text-[#FFE082] font-black">العودة إلى القرية</button>
      </div>
    </div>}
  </div>;
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
  return <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"><div className="relative w-full max-w-2xl rounded-[30px] border-2 border-[#FFE082] bg-[#06283a]/95 p-6 text-white shadow-2xl">
    <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center"><X className="w-5 h-5"/></button>
    <h2 className="text-center text-3xl font-black text-[#FFE082]">{title}</h2>{children}
  </div></div>;
}

function Dahrooj({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [p,setP]=useState(0);
  return <Frame title="الدحروي" onClose={onClose}><p className="mt-2 text-center">المس الحلقة 5 مرات لتوصلها إلى النهاية.</p>
    <div className="mt-6 h-36 rounded-2xl bg-[#d7b27a] border-2 border-[#FFE082] relative overflow-hidden">
      <button onClick={()=>setP(v=>Math.min(5,v+1))} className="absolute top-1/2 -translate-y-1/2 text-6xl transition-all duration-300" style={{left:`${7+p*16}%`}}>⭕</button>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl">🏁</div>
    </div><div className="mt-4 text-center text-2xl font-black text-[#FFE082]">{p}/5</div>
    {p>=5&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}
  </Frame>;
}

function Teela({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [hits,setHits]=useState<number[]>([]);
  return <Frame title="التيلة" onClose={onClose}><p className="mt-2 text-center">أصب ثلاثة أهداف.</p><div className="mt-7 flex justify-center gap-5">
    {[1,2,3].map(n=><button key={n} onClick={()=>setHits(v=>v.includes(n)?v:[...v,n])} className={`w-24 h-32 rounded-xl border-2 text-5xl ${hits.includes(n)?'bg-emerald-700 border-emerald-200':'bg-[#a85d35] border-[#FFE082]'}`}>{hits.includes(n)?'✓':'🥫'}</button>)}
  </div><div className="mt-5 text-center text-2xl font-black text-[#FFE082]">{hits.length}/3</div>
  {hits.length===3&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}</Frame>;
}

function Saqla({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [next,setNext]=useState(1); const [wrong,setWrong]=useState(false);
  const press=(n:number)=>{if(n===next){setWrong(false);setNext(v=>v+1)}else{setWrong(true);setNext(1)}};
  return <Frame title="الصقلة" onClose={onClose}><p className="mt-2 text-center">المس الأحجار بالترتيب من 1 إلى 5.</p>
    <div className="mt-7 grid grid-cols-3 gap-4 max-w-sm mx-auto">{[3,1,5,2,4].map(n=><button key={n} disabled={n<next} onClick={()=>press(n)} className={`aspect-square rounded-full border-2 text-3xl font-black ${n<next?'bg-emerald-700 border-emerald-200':'bg-[#9a8064] border-[#FFE082]'}`}>{n<next?'✓':n}</button>)}</div>
    {wrong&&<div className="mt-4 text-center text-amber-200 font-bold">ابدأ من 1 مرة أخرى</div>}
    {next===6&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}
  </Frame>;
}
