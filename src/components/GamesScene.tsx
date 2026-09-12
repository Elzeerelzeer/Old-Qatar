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

    {near && !completed.includes(near.id) && !active && <button onClick={()=>setActive(near.id)} className="fixed left-1/2 bottom-7 -translate-x-1/2 z-[100] min-w-[240px] rounded-2xl bg-[#8A1538] border-[3px] border-[#FFE082] px-7 py-3.5 text-xl font-black text-[#FFE082] shadow-2xl"><span className="flex items-center justify-center gap-2"><Gamepad2 className="w-6 h-6"/>ابدأ {near.title}</span></button>}

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
  const [ringX,setRingX]=useState(8);
  const [passed,setPassed]=useState<number[]>([]);
  const dragging=useRef(false);

  const move=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(!dragging.current)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=((e.clientX-rect.left)/rect.width)*100;
    const next=Math.max(6,Math.min(90,x));
    setRingX(next);
    setPassed([28,52,76].filter(g=>next>=g));
  };

  const finished=passed.length===3;

  return <Frame title="الدحروي" onClose={onClose}>
    <p className="mt-2 text-center">اسحب الحلقة عبر البوابات الثلاث حتى تصل إلى خط النهاية.</p>

    <div
      onPointerMove={move}
      onPointerUp={()=>dragging.current=false}
      onPointerLeave={()=>dragging.current=false}
      className="mt-6 h-40 rounded-2xl bg-[#d7b27a] border-2 border-[#FFE082] relative overflow-hidden touch-none"
    >
      {[28,52,76].map((g,i)=><div key={g} className="absolute top-3 bottom-3 w-1 bg-white/45" style={{left:`${g}%`}}>
        <span className="absolute -top-1 -left-3 rounded-full bg-[#06283a] px-2 py-1 text-xs">{i+1}</span>
      </div>)}

      <button
        onPointerDown={e=>{
          dragging.current=true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        className="absolute top-1/2 text-6xl cursor-grab active:cursor-grabbing"
        style={{left:`${ringX}%`,transform:'translate(-50%,-50%)'}}
      >
        ⭕
      </button>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl">🏁</div>
    </div>

    <div className="mt-4 text-center text-2xl font-black text-[#FFE082]">{passed.length}/3 بوابات</div>

    {finished&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}
  </Frame>;
}
function Teela({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [hits,setHits]=useState(0);
  const [shots,setShots]=useState(0);
  const [power,setPower]=useState(0);
  const startY=useRef(0);
  const dragging=useRef(false);

  const shoot=()=>{
    setShots(v=>v+1);
    if(power>=45&&power<=90)setHits(v=>Math.min(3,v+1));
    setPower(0);
  };

  return <Frame title="التيلة" onClose={onClose}>
    <p className="mt-2 text-center">اسحب التيلة للخلف ثم اتركها لتصيب الهدف.</p>

    <div className="mt-6 h-56 rounded-2xl bg-[#c59a65] border-2 border-[#FFE082] relative overflow-hidden touch-none">
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-[#8A1538] bg-[#FFE082]/20 flex items-center justify-center text-2xl font-black text-[#8A1538]">
        الهدف
      </div>

      <button
        onPointerDown={e=>{
          dragging.current=true;
          startY.current=e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e=>{
          if(!dragging.current)return;
          setPower(Math.max(0,Math.min(100,e.clientY-startY.current)));
        }}
        onPointerUp={()=>{
          if(dragging.current){dragging.current=false;shoot();}
        }}
        onPointerCancel={()=>dragging.current=false}
        className="absolute bottom-6 left-1/2 w-14 h-14 rounded-full border-2 border-white/80 bg-[radial-gradient(circle_at_30%_25%,#ffffff,#7dd3fc_35%,#2563eb_75%,#172554)] shadow-[0_10px_25px_rgba(0,0,0,.35)]"
        style={{transform:`translate(-50%, ${Math.min(power,80)}px)`}}
      />

      <div className="absolute bottom-4 right-4 rounded-full bg-black/40 px-3 py-1 text-sm">القوة {power}%</div>
    </div>

    <div className="mt-4 text-center text-xl font-black text-[#FFE082]">إصابات: {hits}/3 • محاولات: {shots}</div>

    {hits>=3&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}
  </Frame>;
}
function Saqla({onClose,onWin}:{onClose:()=>void;onWin:()=>void}) {
  const [level,setLevel]=useState(1);
  const [stage,setStage]=useState<'ready'|'air'|'catch'|'done'>('ready');
  const [tossed,setTossed]=useState<number|null>(null);
  const [collected,setCollected]=useState<number[]>([]);

  const targetCount=level===1?1:2;
  const stones=[1,2,3,4,5];

  const toss=(stone:number)=>{
    if(stage!=='ready')return;
    setTossed(stone);
    setCollected([]);
    setStage('air');
  };

  const collect=(stone:number)=>{
    if(stage!=='air'||stone===tossed)return;
    setCollected(prev=>{
      if(prev.includes(stone))return prev;
      const next=[...prev,stone];
      if(next.length>=targetCount)setStage('catch');
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
    }else{
      setStage('done');
    }
  };

  return <Frame title="الصقلة" onClose={onClose}>
    <p className="mt-2 text-center">
      {level===1
        ? 'المستوى الأول: ارمِ حصاة، التقط حصاة واحدة، ثم أمسك الحصاة المرمية.'
        : 'المستوى الثاني: ارمِ حصاة، التقط حصاتين، ثم أمسك الحصاة المرمية.'}
    </p>

    <div className="mt-6 min-h-[270px] rounded-2xl bg-[#c9a77a] border-2 border-[#FFE082] p-5">
      {stage==='ready'&&<div className="mb-4 text-center font-black text-[#5b321d]">اختر حصاة لترميها للأعلى</div>}
      {stage==='air'&&<div className="mb-4 text-center font-black text-[#8A1538]">التقط {targetCount} من الحصوات</div>}
      {stage==='catch'&&<button onClick={catchStone} className="mx-auto mb-5 block rounded-full bg-[#8A1538] border-2 border-[#FFE082] px-6 py-3 text-[#FFE082] font-black shadow-xl">✋ أمسك الحصاة المرمية</button>}

      <div className="grid grid-cols-5 gap-3 items-end">
        {stones.map(stone=>{
          const isTossed=tossed===stone;
          const isCollected=collected.includes(stone);
          return <button
            key={stone}
            disabled={isCollected||(isTossed&&stage!=='ready')}
            onClick={()=>stage==='ready'?toss(stone):collect(stone)}
            className={`aspect-square rounded-[48%_52%_45%_55%] border-2 text-2xl font-black shadow-lg transition-all active:scale-90 ${
              isCollected
                ? 'bg-emerald-700 border-emerald-200 text-white -translate-y-3'
                : isTossed
                  ? 'bg-[#FFE082] border-[#8A1538] text-[#8A1538] -translate-y-12'
                  : 'bg-[#8f7962] border-[#f4e1b7] text-white'
            }`}
          >
            {isCollected?'✓':stone}
          </button>
        })}
      </div>

      <div className="mt-6 text-center font-black text-[#5b321d]">المستوى {level}/2</div>
    </div>

    {stage==='done'&&<button onClick={onWin} className="mt-5 w-full rounded-2xl bg-emerald-700 border-2 border-[#FFE082] py-3 font-black">تم الإنجاز ✓</button>}
  </Frame>;
}
