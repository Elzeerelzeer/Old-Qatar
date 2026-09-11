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
import { DallahStyle } from './QatariDallahVisual';
import { HeritageItemVisual } from './HeritageItemVisual';
import { SouqLightShafts } from './SouqLightShafts';
import { SouqDokanGlow } from './SouqDokanGlow';

import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  Sun,
  X,
  Rotate3D,
  ChevronRight,
  ChevronLeft,
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
   DATA TYPES
============================================================ */

interface SouqItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  accent: string;
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

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ============================================================
   MASTER MAP
============================================================ */

const SOUQ_MASTER_IMAGE = '/assets/souq-master-map.png.jpeg';
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 900;

/* ============================================================
   EDUCATIONAL CONTENT
============================================================ */

export const DALLAH_VARIANTS: Record<
  DallahStyle,
  { name: string; desc: string }
> = {
  qatari_gold: {
    name: 'الدلّة القطرية الأصيلة',
    desc: 'دلّة القهوة العربية المصنوعة من النحاس الأصفر المذهب، ذات تاج مدبب ومصب مقوس شامخ لضيافة أهل قطر لوّل.',
  },
  raslan_brass: {
    name: 'دلّة رسلان النحاسية',
    desc: 'دلّة نحاسية تراثية عريقة بنقوش يدوية هندسية وتضليع تقليدي، رمز الكرم في مجالس الأجداد.',
  },
  royal_silver: {
    name: 'الدلّة الملكية الفضية',
    desc: 'دلّة فضية مزدانة بالنقوش المذهبة واللمعان البراق، مخصصة للمناسبات والاحتفاء بالضيوف.',
  },
};

const SOUQ_HOTSPOTS: SouqHotspot[] = [
  {
    id: 'pottery',
    name: 'دكان الفخار',
    x: 25,
    y: 38,
    radius: 14,
    intro: 'أوانٍ فخارية أصيلة استخدمها أهل قطر لوّل.',
    items: [
      {
        id: 'jar',
        name: 'الجَرّة الفخارية (الحِب)',
        icon: '🏺',
        description: 'إناء فخاري مسامي من الطين المحروق استُخدم لتبريد وحفظ مياه الشرب العذبة قديماً.',
        accent: '#B96E42',
      },
      {
        id: 'pot',
        name: 'القدر الفخاري (البِرْمَة)',
        icon: '🥘',
        description: 'قدر طيني متين محكم الغطاء لإعداد الأطباق الشعبية على الفحم والجمر ببطء ونكهة فريدة.',
        accent: '#A85A32',
      },
      {
        id: 'dallah',
        name: 'الدلّة القطرية الأصيلة',
        icon: '🪙',
        description: 'دلّة القهوة العربية الأصيلة لضيافة أهل قطر لوّل، رمز الكرم والشرف في المجالس.',
        accent: '#E5B942',
      },
    ],
  },
  {
    id: 'spices',
    name: 'دكان العطّار',
    x: 75,
    y: 38,
    radius: 14,
    intro: 'روائح وتوابل السوق القديم.',
    items: [
      {
        id: 'cardamom',
        name: 'الهيل الأخضر الفاخر',
        icon: '🌿',
        description: 'حبوب عطرية فاخرة تدق في النجر وتُضاف للقهوة العربية لمنحها النكهة القطرية الزكية.',
        accent: '#728C4A',
      },
      {
        id: 'saffron',
        name: 'الزعفران (الذهب الأحمر)',
        icon: '🌼',
        description: 'أثمن التوابل التراثية العطرية، يُكرم به فنجان القهوة وتزين به أطباق الولائم.',
        accent: '#D69A27',
      },
      {
        id: 'cinnamon',
        name: 'القرفة (الدارسين)',
        icon: '🪵',
        description: 'لحاء خشب عطري نفاذ يُلف بحبال الخيش، لإعداد المشروبات الدافئة وأطيب الأطعمة.',
        accent: '#9B5A35',
      },
      {
        id: 'clove',
        name: 'القرنفل (المسمار / العويدي)',
        icon: '🌱',
        description: 'توابل عطرية زكية تشبه المسامير الصغيرة، تضفي حدة ونكهة فريدة على الشاي والقهوة.',
        accent: '#6D713C',
      },
    ],
  },
  {
    id: 'fabrics',
    name: 'الأقمشة والسلال',
    x: 26,
    y: 68,
    radius: 14,
    intro: 'منتجات النسيج والخوص.',
    items: [
      {
        id: 'basket',
        name: 'السلة الخوص (المِخْرافَة)',
        icon: '🧺',
        description: 'سلة مجدولة بإتقان من سعف النخيل، لحمل الرطب وحفظ المؤونة في بيوت لوّل.',
        accent: '#C29858',
      },
      {
        id: 'palm',
        name: 'المهفّة (مروحة الخوص)',
        icon: '🌴',
        description: 'مروحة يدوية تقليدية منسوجة من خوص النخيل الملون للتبريد والتهوية في صيف قطر.',
        accent: '#758B4C',
      },
      {
        id: 'fabric',
        name: 'أقمشة الزري وثوب النشل',
        icon: '🧵',
        description: 'أقمشة حريرية مطرزة بخيوط الذهب (الزري)، ترتديها الأمهات والبنات في الأعياد والمناسبات.',
        accent: '#8A1538',
      },
    ],
  },
  {
    id: 'antiques',
    name: 'الأدوات القديمة',
    x: 74,
    y: 68,
    radius: 14,
    intro: 'أدوات استخدمها التجار قديمًا.',
    items: [
      {
        id: 'scale',
        name: 'ميزان اللؤلؤ والتجار',
        icon: '⚖️',
        description: 'ميزان نحاسي دقيق ذو كفتين لوزن حبات اللؤلؤ الطبيعي والبهارات الثمينة.',
        accent: '#B99658',
      },
      {
        id: 'box',
        name: 'الصندوق الخشبي (المَنْدُوس)',
        icon: '📦',
        description: 'صندوق خشبي تراثي مصفح بنحاس ومسامير قبتية لحفظ الحلي والملابس الثمينة.',
        accent: '#805333',
      },
      {
        id: 'lantern',
        name: 'الفانوس التراثي (السِّراج)',
        icon: '🏮',
        description: 'مصباح زيتي نحاسي مع زجاج واقٍ للإضاءة في أزقة الفرجان والمنازل قديماً.',
        accent: '#C97C31',
      },
    ],
  },
  {
    id: 'falconer',
    name: 'ركن الصقّار',
    x: 50,
    y: 28,
    radius: 13,
    intro: 'تعرّف على الصقر وأدوات الصقّار.',
    items: [
      {
        id: 'falcon',
        name: 'الصقر العربي الأصيل (الحُر والشاهين)',
        icon: '🦅',
        description: 'رمز العزة والشهامة في قطر والخليج، يتوج بالبرقع الجلدي المطرز لحفظ هدوئه.',
        accent: '#8A6949',
      },
      {
        id: 'glove',
        name: 'قفاز الصقّار (الدَّس)',
        icon: '🧤',
        description: 'قفاز جلدي سميك مبطن يرتديه الصقار لحماية يده من مخالب الصقر الجارحة.',
        accent: '#8A1538',
      },
      {
        id: 'perch',
        name: 'المجثم التراثي (الوَكْر)',
        icon: '🪵',
        description: 'قاعدة خشبية أسطوانية ذات مسند مخملي يستقر عليه الصقر في المجلس أو المخيم.',
        accent: '#795138',
      },
    ],
  },
];

/* ============================================================
   COLLISION MAP
============================================================ */

const SOUQ_COLLIDERS: BoundingBox[] = [
  { id: 'wall_north', x: 0, y: 0, width: 100, height: 16 },
  { id: 'wall_west', x: 0, y: 0, width: 14, height: 100 },
  { id: 'wall_east', x: 86, y: 0, width: 14, height: 100 },
  { id: 'wall_south_left', x: 0, y: 92, width: 40, height: 8 },
  { id: 'wall_south_right', x: 60, y: 92, width: 40, height: 8 },

  { id: 'block_pottery', x: 14, y: 16, width: 15, height: 26 },
  { id: 'block_spices', x: 71, y: 16, width: 15, height: 26 },
  { id: 'block_fabrics', x: 14, y: 52, width: 15, height: 26 },
  { id: 'block_antiques', x: 71, y: 52, width: 15, height: 26 },
  { id: 'block_falconer', x: 46, y: 16, width: 8, height: 8 },
];

/* ============================================================
   COMPONENT
============================================================ */

export function SouqScene({
  gender,
  settings,
  onReturnToVillage,
}: SouqSceneProps) {
  /* ---------------- PLAYER ---------------- */

  const [playerPos, setPlayerPos] = useState({ x: 50, y: 86 });
  const [direction, setDirection] = useState<Direction>('up');
  const [isMoving, setIsMoving] = useState(false);
  const [activeTouchDir, setActiveTouchDir] = useState<Direction | null>(null);

  /* ---------------- VIEWER ---------------- */

  const [selectedHotspot, setSelectedHotspot] =
    useState<SouqHotspot | null>(null);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const [rotationX, setRotationX] = useState(-8);
  const [rotationY, setRotationY] = useState(18);
  const [scale3D, setScale3D] = useState(1);

  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  /* ---------------- INPUT ---------------- */

  const keysPressed = useRef<Record<string, boolean>>({});
  const touchDirectionRef = useRef<Direction | null>(null);

  /* ---------------- CAMERA ---------------- */

  const viewportRef = useRef<HTMLDivElement>(null);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      const el = viewportRef.current;
      if (!el) return;

      setViewportSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    const el = viewportRef.current;

    if (el) observer.observe(el);

    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  /* ---------------- ARABIC VOICE ---------------- */

  const [arabicVoice, setArabicVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [dallahStyle, setDallahStyle] = useState<DallahStyle>('qatari_gold');
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ---------------- SOUQ AMBIENT AUDIO ---------------- */

  const [isSouqAudioPlaying, setIsSouqAudioPlaying] = useState(!settings.isQuietMode);

  /* ---------------- CINEMATIC LIGHT SHAFTS (GOD RAYS) ---------------- */
  const [showLightShafts, setShowLightShafts] = useState(true);

  // تشغيل تلقائي متكرر لملف أصوات السوق القديم عند الدخول، وإيقافه عند الخروج
  useEffect(() => {
    if (!settings.isQuietMode) {
      soundManager.startAmbientSouq();
      setIsSouqAudioPlaying(true);
    } else {
      soundManager.stopAmbientSouq();
      setIsSouqAudioPlaying(false);
    }

    return () => {
      // إيقاف الصوت والأجواء فور مغادرة SouqScene
      soundManager.stopAmbientSouq();
      if (narrationAudioRef.current) {
        try {
          narrationAudioRef.current.pause();
          narrationAudioRef.current.currentTime = 0;
        } catch {
          // ignore
        }
        narrationAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [settings.isQuietMode]);

  // تحديث مستوى الصوت فوراً عند تغييره في الإعدادات
  useEffect(() => {
    soundManager.setVolume(settings.volume);
  }, [settings.volume]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      const preferred =
        voices.find((voice) => voice.lang === 'ar-QA') ||
        voices.find((voice) => voice.lang === 'ar-SA') ||
        voices.find((voice) => voice.lang.startsWith('ar')) ||
        null;

      setArabicVoice(preferred);
    };

    loadVoices();

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        loadVoices
      );
    };
  }, []);

  /* ---------------- SETTINGS ---------------- */

  const MOVE_SPEED = settings.walkSpeed === 'calm' ? 0.38 : 0.55;
  const PLAYER_RADIUS = 2;

  /* ============================================================
     COLLISION
  ============================================================ */

  const checkCollision = useCallback(
    (targetX: number, targetY: number): boolean => {
      if (
        targetX < 14 ||
        targetX > 86 ||
        targetY < 18 ||
        targetY > 93
      ) {
        return true;
      }

      for (const box of SOUQ_COLLIDERS) {
        const left = box.x;
        const right = box.x + box.width;
        const top = box.y;
        const bottom = box.y + box.height;

        if (
          targetX + PLAYER_RADIUS > left &&
          targetX - PLAYER_RADIUS < right &&
          targetY + PLAYER_RADIUS > top &&
          targetY - PLAYER_RADIUS < bottom
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedHotspot) return;

      const key = e.key.toLowerCase();

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
        keysPressed.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedHotspot]);

  /* ============================================================
     GAME LOOP
  ============================================================ */

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let lastFootstepAt = 0;

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.6667, 2);
      lastTime = time;

      let dx = 0;
      let dy = 0;
      let nextDirection: Direction | null = null;

      if (!selectedHotspot) {
        const keys = keysPressed.current;
        const touch = touchDirectionRef.current;

        if (keys.arrowup || keys.w || touch === 'up') {
          dy -= MOVE_SPEED * dt;
          nextDirection = 'up';
        }

        if (keys.arrowdown || keys.s || touch === 'down') {
          dy += MOVE_SPEED * dt;
          nextDirection = 'down';
        }

        if (keys.arrowleft || keys.a || touch === 'left') {
          dx -= MOVE_SPEED * dt;
          nextDirection = 'left';
        }

        if (keys.arrowright || keys.d || touch === 'right') {
          dx += MOVE_SPEED * dt;
          nextDirection = 'right';
        }
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);

        if (nextDirection) setDirection(nextDirection);

        setPlayerPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          if (!checkCollision(prev.x + dx, prev.y)) {
            nextX = prev.x + dx;
          }

          if (!checkCollision(nextX, prev.y + dy)) {
            nextY = prev.y + dy;
          }

          return { x: nextX, y: nextY };
        });

        if (
          settings.isSoundEnabled &&
          !settings.isQuietMode &&
          time - lastFootstepAt > 360
        ) {
          soundManager.playFootstep();
          lastFootstepAt = time;
        }
      } else {
        setIsMoving(false);
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(frameId);
  }, [
    checkCollision,
    settings.isSoundEnabled,
    settings.isQuietMode,
    MOVE_SPEED,
    selectedHotspot,
  ]);

  /* ============================================================
     TOUCH D-PAD
  ============================================================ */

  const handleTouchStart = (dir: Direction) => {
    if (selectedHotspot) return;

    touchDirectionRef.current = dir;
    setActiveTouchDir(dir);
    setDirection(dir);
  };

  const handleTouchEnd = () => {
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
  };

  /* ============================================================
     HOTSPOT DETECTION
  ============================================================ */

  const activeNearbyHotspot = SOUQ_HOTSPOTS.find((spot) => {
    const distance = Math.hypot(
      playerPos.x - spot.x,
      playerPos.y - spot.y
    );

    return distance <= spot.radius;
  });

  const lastChimeSpotRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeNearbyHotspot && activeNearbyHotspot.id !== lastChimeSpotRef.current) {
      lastChimeSpotRef.current = activeNearbyHotspot.id;
      if (settings.isSoundEnabled && !settings.isQuietMode) {
        soundManager.playProximityChime();
      }
    } else if (!activeNearbyHotspot) {
      lastChimeSpotRef.current = null;
    }
  }, [activeNearbyHotspot, settings.isSoundEnabled, settings.isQuietMode]);

  /* ============================================================
     NARRATION & SPEECH
  ============================================================ */

  const stopNarration = useCallback(() => {
    if (narrationAudioRef.current) {
      try {
        narrationAudioRef.current.pause();
        narrationAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      narrationAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
    setSpeechError(null);
  }, []);

  const toggleNarration = (item: SouqItem) => {
    // إذا كان الصوت يعمل حالياً، يتم إيقافه بنقرة ثانية
    if (isSpeaking) {
      soundManager.playClick();
      stopNarration();
      return;
    }

    soundManager.playClick();
    stopNarration();
    setIsSpeaking(true);
    setSpeechError(null);

    const audioPath = `/sounds/narration/${item.id}.wav`;
    const audio = new Audio(audioPath);
    audio.volume = Math.max(0.3, Math.min(1, settings.volume));
    narrationAudioRef.current = audio;

    let fallbackTriggered = false;

    const triggerFallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      narrationAudioRef.current = null;

      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        typeof SpeechSynthesisUtterance === 'undefined'
      ) {
        setIsSpeaking(false);
        setSpeechError('الاستماع غير مدعوم في هذا المتصفح.');
        return;
      }

      const synth = window.speechSynthesis;
      const textToSpeak = `${item.name}. ${item.description}`;

      try {
        synth.cancel();
        synth.resume();
      } catch {
        // ignore
      }

      const voices = synth.getVoices();

      const liveArabicVoice =
        voices.find((voice) => voice.lang === 'ar-QA') ||
        voices.find((voice) => voice.lang === 'ar-SA') ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith('ar')) ||
        arabicVoice ||
        null;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = liveArabicVoice?.lang || 'ar-SA';
      if (liveArabicVoice) {
        utterance.voice = liveArabicVoice;
      }
      utterance.rate = 0.82;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeechError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          setSpeechError('تعذر تشغيل الصوت. يرجى التحقق من إعدادات الصوت.');
        }
      };

      window.setTimeout(() => {
        try {
          synth.resume();
          synth.speak(utterance);
        } catch (error) {
          console.error('Speech synthesis failed:', error);
          setIsSpeaking(false);
          setSpeechError('تعذر تشغيل الصوت في هذه المعاينة.');
        }
      }, 120);
    };

    audio.onended = () => {
      setIsSpeaking(false);
      narrationAudioRef.current = null;
    };

    audio.onerror = () => {
      console.warn(`Audio file ${audioPath} not found or failed, using fallback.`);
      triggerFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play failed or was blocked by autoplay:', err);
        triggerFallback();
      });
    }
  };

  /* ============================================================
     VIEWER OPEN / CLOSE
  ============================================================ */

  const reset3DView = () => {
    setRotationX(-8);
    setRotationY(18);
    setScale3D(1);
  };

  const openHotspot = (hotspot: SouqHotspot) => {
    soundManager.playClick();
    stopNarration();

    keysPressed.current = {};
    touchDirectionRef.current = null;
    setActiveTouchDir(null);
    setIsMoving(false);

    setSelectedHotspot(hotspot);
    setCurrentItemIndex(0);
    reset3DView();
  };

  const closeHotspot = () => {
    stopNarration();
    setSelectedHotspot(null);
    setCurrentItemIndex(0);
    reset3DView();
  };

  /* ============================================================
     ITEM NAVIGATION
  ============================================================ */

  const nextItem = () => {
    if (!selectedHotspot) return;
    stopNarration();

    setCurrentItemIndex((prev) =>
      (prev + 1) % selectedHotspot.items.length
    );

    reset3DView();
  };

  const previousItem = () => {
    if (!selectedHotspot) return;
    stopNarration();

    setCurrentItemIndex((prev) =>
      (prev - 1 + selectedHotspot.items.length) %
      selectedHotspot.items.length
    );

    reset3DView();
  };

  /* ============================================================
     3D TOUCH / POINTER INTERACTION
  ============================================================ */

  const handleObjectPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    draggingRef.current = true;

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleObjectPointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current) return;

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;

    setRotationY((prev) => prev + dx * 0.55);

    setRotationX((prev) => {
      const next = prev - dy * 0.35;
      return Math.max(-28, Math.min(28, next));
    });

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleObjectPointerUp = () => {
    draggingRef.current = false;
  };

  const handleViewerWheel = (
    e: React.WheelEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setScale3D((prev) => {
      const next = prev - e.deltaY * 0.001;
      return Math.max(0.82, Math.min(1.28, next));
    });
  };

  /* ============================================================
     CAMERA CLAMP
     يمنع ظهور اللون الأسود عند حواف الصورة
  ============================================================ */

  const playerWorldPxX = (playerPos.x / 100) * WORLD_WIDTH;
  const playerWorldPxY = (playerPos.y / 100) * WORLD_HEIGHT;

  const desiredCameraX =
    viewportSize.width / 2 - playerWorldPxX;

  const desiredCameraY =
    viewportSize.height / 2 - playerWorldPxY;

  const cameraX =
    viewportSize.width <= 0
      ? 0
      : WORLD_WIDTH <= viewportSize.width
        ? (viewportSize.width - WORLD_WIDTH) / 2
        : Math.min(
            0,
            Math.max(
              viewportSize.width - WORLD_WIDTH,
              desiredCameraX
            )
          );

  const cameraY =
    viewportSize.height <= 0
      ? 0
      : WORLD_HEIGHT <= viewportSize.height
        ? (viewportSize.height - WORLD_HEIGHT) / 2
        : Math.min(
            0,
            Math.max(
              viewportSize.height - WORLD_HEIGHT,
              desiredCameraY
            )
          );

  const currentItem =
    selectedHotspot?.items[currentItemIndex] ?? null;

  const isDallah = currentItem?.id === 'dallah';
  const activeItemName = isDallah
    ? DALLAH_VARIANTS[dallahStyle].name
    : (currentItem?.name ?? '');
  const activeItemDesc = isDallah
    ? DALLAH_VARIANTS[dallahStyle].desc
    : (currentItem?.description ?? '');

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      ref={viewportRef}
      id="souq-exploration-viewport"
      className="relative w-full h-full overflow-hidden bg-[#1a0e08] select-none"
      dir="rtl"
    >
      {/* ======================== HEADER ======================== */}

      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="pointer-events-auto bg-[#2b170d]/90 backdrop-blur-md border border-[#E6C280]/40 px-4 py-2 rounded-full shadow-xl text-[#FAF5EA] font-bold">
            سوق لوّل
          </div>

          <div className="pointer-events-auto bg-[#2b170d]/90 border border-[#E6C280]/40 px-3.5 py-2 rounded-full text-xs text-[#FAF5EA]">
            رحلة السوق{' '}
            <span className="text-[#E6C280] font-black">0/2</span>
          </div>

          {/* زر التحكم في أصوات السوق القديم (رياح خفيفة وهمهمات المارة) */}
          <button
            onClick={() => {
              soundManager.playClick();
              const active = soundManager.toggleAmbientSouq();
              setIsSouqAudioPlaying(active);
            }}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-bold transition-all shadow-xl active:scale-95 ${
              isSouqAudioPlaying
                ? 'bg-[#2b170d]/90 text-[#FFE082] border-[#FFE082]/60 hover:bg-[#3d2012]'
                : 'bg-black/60 text-white/70 border-white/20 hover:bg-black/80'
            }`}
            title={isSouqAudioPlaying ? 'كتم أصوات السوق القديم' : 'تشغيل أصوات السوق القديم'}
            aria-label="التحكم في أصوات السوق القديم"
          >
            {isSouqAudioPlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-[#FFE082] animate-pulse shrink-0" />
                <span className="hidden md:inline">أصوات السوق (تعمل)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-white/50 shrink-0" />
                <span className="hidden md:inline">أصوات السوق (مكتومة)</span>
              </>
            )}
          </button>

          {/* زر التحكم في الإضاءة الشعاعية وسحر أشعة الشمس (God Rays) */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowLightShafts((prev) => !prev);
            }}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-bold transition-all shadow-xl active:scale-95 ${
              showLightShafts
                ? 'bg-[#2b170d]/90 text-[#FFE082] border-[#FFE082]/60 hover:bg-[#3d2012]'
                : 'bg-black/60 text-white/70 border-white/20 hover:bg-black/80'
            }`}
            title={showLightShafts ? 'كتم الإضاءة الشعاعية (God Rays)' : 'تفعيل الإضاءة الشعاعية (God Rays)'}
            aria-label="التحكم في الإضاءة الشعاعية"
          >
            <Sun className={`w-4 h-4 ${showLightShafts ? 'text-[#FFE082] animate-pulse' : 'text-white/50'} shrink-0`} />
            <span className="hidden lg:inline">{showLightShafts ? 'أشعة الشمس (مفعلة)' : 'أشعة الشمس (معطلة)'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            soundManager.stopAmbientSouq();

            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }

            onReturnToVillage();
          }}
          className="pointer-events-auto flex items-center gap-2 bg-[#8A1538] hover:bg-[#6b102c] active:scale-95 text-white border border-[#FFE082] px-4 py-2 rounded-full shadow-xl font-bold transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى القرية</span>
        </button>
      </div>

      {/* ======================== WORLD ======================== */}

      <div
        id="souq-world"
        className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
        }}
      >
        {/* MASTER MAP */}

        <img
          src={SOUQ_MASTER_IMAGE}
          alt="خريطة سوق لوّل"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* CINEMATIC LIGHT SHAFTS / GOD RAYS (أشعة شمس سينمائية تنبعث من فتحات سقف ومظلات السوق) */}
        {showLightShafts && (
          <SouqLightShafts
            worldWidth={WORLD_WIDTH}
            worldHeight={WORLD_HEIGHT}
            isQuietMode={settings.isQuietMode}
          />
        )}

        {/* DOKAN GOLDEN RADIAL GLOW & ACTIVE HOTSPOTS */}
        {SOUQ_HOTSPOTS.map((spot) => {
          const isNear = activeNearbyHotspot?.id === spot.id;

          return (
            <SouqDokanGlow
              key={spot.id}
              spot={spot}
              playerPos={playerPos}
              isNear={isNear}
              isQuietMode={settings.isQuietMode}
              onOpen={openHotspot}
            />
          );
        })}

        {/* PLAYER */}

        <div
          id="souq-player"
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -85%) scale(1.08)',
          }}
        >
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-4 bg-black/45 rounded-full blur-[2px]" />

          <CharacterAvatar
            gender={gender}
            direction={direction}
            isMoving={isMoving}
            isCelebrating={false}
          />
        </div>
      </div>

      {/* ======================== D-PAD ======================== */}

      {!selectedHotspot && (
        <div
          id="souq-touch-dpad"
          className="fixed bottom-6 left-6 z-[100] w-[138px] h-[138px] rounded-full bg-[#2d180f]/90 border-2 border-[#E6C280] shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-md touch-none select-none"
        >
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute top-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'up'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك للأعلى"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'down'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك للأسفل"
          >
            <ArrowDown className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'left'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك لليسار"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
            onPointerCancel={handleTouchEnd}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl border-2 border-[#E6C280] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${
              activeTouchDir === 'right'
                ? 'bg-[#A91D47]'
                : 'bg-[#8A1538]'
            }`}
            aria-label="تحرك لليمين"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#B99658] border-2 border-[#F6E3B4] flex items-center justify-center text-white pointer-events-none shadow-inner">
            ✦
          </div>
        </div>
      )}

      {/* ======================== 3D VIEWER ======================== */}

      {selectedHotspot && currentItem && (
        <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-[#392013] to-[#1f100a] border-2 border-[#E6C280] rounded-[32px] shadow-[0_28px_100px_rgba(0,0,0,0.8)] p-4 sm:p-6">
            {/* CLOSE */}

            <button
              onClick={closeHotspot}
              className="absolute top-4 left-4 z-50 w-11 h-11 rounded-full bg-black/45 border border-[#E6C280]/50 flex items-center justify-center text-white active:scale-90"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            {/* HEADER */}

            <div className="text-center mb-4 pr-10 pl-10">
              <div className="text-[#FFE082] text-xl sm:text-2xl font-black">
                {selectedHotspot.name}
              </div>

              <div className="text-[#eadac2] text-sm mt-1">
                {selectedHotspot.intro}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-center">
              {/* 3D AREA */}

              <div
                className="relative min-h-[410px] sm:min-h-[450px] rounded-[28px] overflow-hidden border border-[#E6C280]/30 bg-gradient-to-b from-[#c7a46e]/20 to-black/20 flex items-center justify-center"
                style={{ perspective: '1100px' }}
                onWheel={handleViewerWheel}
              >
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[60%] h-[35%] rounded-full bg-[#FFE4A5]/15 blur-3xl" />

                <div className="absolute bottom-[58px] left-1/2 -translate-x-1/2 w-[230px] h-[42px] rounded-full bg-black/50 blur-xl" />

                <div
                  onPointerDown={handleObjectPointerDown}
                  onPointerMove={handleObjectPointerMove}
                  onPointerUp={handleObjectPointerUp}
                  onPointerCancel={handleObjectPointerUp}
                  onPointerLeave={handleObjectPointerUp}
                  className="relative w-[270px] h-[320px] sm:w-[350px] sm:h-[370px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `
                      scale(${scale3D})
                      rotateX(${rotationX}deg)
                      rotateY(${rotationY}deg)
                    `,
                  }}
                >
                  <div
                    className="absolute inset-[12%] rounded-[42%] blur-2xl opacity-50"
                    style={{
                      background: currentItem.accent,
                      transform: 'translateZ(-45px)',
                    }}
                  />

                  <div
                    className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full opacity-25 blur-3xl"
                    style={{
                      background: currentItem.accent,
                      transform: 'translateZ(-25px)',
                    }}
                  />

                  <div
                    className="relative flex items-center justify-center pointer-events-none"
                    style={{
                      transform: 'translateZ(75px)',
                      filter: 'saturate(1.12) contrast(1.05)',
                    }}
                  >
                    <HeritageItemVisual
                      itemId={currentItem.id}
                      dallahStyle={dallahStyle}
                      size={280}
                    />
                  </div>

                  <div
                    className="absolute top-[20%] right-[24%] w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none"
                    style={{
                      transform: 'translateZ(90px)',
                    }}
                  />
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/45 border border-[#E6C280]/25 text-[#F8E6C0] text-xs sm:text-sm pointer-events-none">
                  <Rotate3D className="w-4 h-4 text-[#FFE082]" />
                  <span>اسحب لتدوير العنصر</span>
                </div>
              </div>

              {/* INFO */}

              <div className="rounded-[24px] border border-[#E6C280]/30 bg-black/20 p-5 text-center">
                <div className="text-[#FFE082] text-2xl font-black">
                  {activeItemName}
                </div>

                <p className="mt-3 text-white text-lg leading-8 font-semibold">
                  {activeItemDesc}
                </p>

                {isDallah && (
                  <div className="mt-4 p-3 rounded-2xl bg-[#28150c]/90 border border-[#E6C280]/40 text-center">
                    <div className="text-xs text-[#FFE082] font-bold mb-2 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
                      <span>اختر شكل وطراز الدلّة:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDallahStyle('qatari_gold')}
                        className={`py-2 px-1 text-xs rounded-xl font-black transition-all border ${
                          dallahStyle === 'qatari_gold'
                            ? 'bg-[#8A1538] border-[#FFE082] text-[#FFE082] shadow-md scale-[1.03]'
                            : 'bg-black/30 border-white/10 text-white/70 hover:bg-black/50 hover:text-white'
                        }`}
                      >
                        قطرية ذهبية
                      </button>
                      <button
                        type="button"
                        onClick={() => setDallahStyle('raslan_brass')}
                        className={`py-2 px-1 text-xs rounded-xl font-black transition-all border ${
                          dallahStyle === 'raslan_brass'
                            ? 'bg-[#8A1538] border-[#FFE082] text-[#FFE082] shadow-md scale-[1.03]'
                            : 'bg-black/30 border-white/10 text-white/70 hover:bg-black/50 hover:text-white'
                        }`}
                      >
                        رسلان نحاس
                      </button>
                      <button
                        type="button"
                        onClick={() => setDallahStyle('royal_silver')}
                        className={`py-2 px-1 text-xs rounded-xl font-black transition-all border ${
                          dallahStyle === 'royal_silver'
                            ? 'bg-[#8A1538] border-[#FFE082] text-[#FFE082] shadow-md scale-[1.03]'
                            : 'bg-black/30 border-white/10 text-white/70 hover:bg-black/50 hover:text-white'
                        }`}
                      >
                        ملكية فضية
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleNarration(currentItem)}
                  className={`mt-5 w-full flex items-center justify-center gap-2.5 border-2 border-[#FFE082] text-[#FFE082] rounded-2xl py-3.5 font-black active:scale-95 shadow-lg transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#590e23] hover:bg-[#470b1c] ring-2 ring-[#FFE082]/70'
                      : 'bg-[#8A1538] hover:bg-[#9d1941]'
                  }`}
                  title={isSpeaking ? 'إيقاف الاستماع' : 'استمع للشرح الصوتي'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-6 h-6 text-[#FFE082]" />
                      <span className="text-base sm:text-lg">إيقاف الاستماع</span>
                      <div className="flex items-center gap-1 mr-1">
                        <span className="w-1 h-3 bg-[#FFE082] rounded-full animate-pulse" />
                        <span className="w-1.5 h-5 bg-[#FFE082] rounded-full animate-bounce" />
                        <span className="w-1 h-3.5 bg-[#FFE082] rounded-full animate-pulse" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6 text-[#FFE082]" />
                      <span className="text-base sm:text-lg">استمع للشرح الصوتي</span>
                    </>
                  )}
                </button>

                {speechError && (
                  <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-950/35 px-3 py-2 text-sm text-amber-100">
                    {speechError}
                  </div>
                )}

                <button
                  onClick={reset3DView}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-[#5c3a28] border border-[#E6C280]/50 text-white rounded-xl py-2.5 font-bold active:scale-95"
                >
                  <Rotate3D className="w-5 h-5" />
                  <span>إعادة الوضع</span>
                </button>

                <div className="mt-4 text-xs text-[#d9c8ae]">
                  اسحب بإصبعك أو بالماوس • عجلة الماوس للتكبير
                </div>
              </div>
            </div>

            {/* NAVIGATION */}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={previousItem}
                className="flex items-center gap-2 bg-[#5b3522] border border-[#E6C280]/40 text-white px-4 py-3 rounded-xl font-bold active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
                <span>السابق</span>
              </button>

              <div className="flex items-center justify-center gap-2">
                {selectedHotspot.items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      stopNarration();
                      setCurrentItemIndex(index);
                      reset3DView();
                    }}
                    className={`relative p-1 rounded-xl transition-all border flex items-center justify-center ${
                      index === currentItemIndex
                        ? 'bg-[#8A1538] border-[#FFE082] ring-2 ring-[#FFE082]/60 scale-105 shadow-md'
                        : 'bg-black/40 border-white/15 hover:bg-black/60 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={item.name}
                    title={item.name}
                  >
                    <div className="w-8 h-8 flex items-center justify-center pointer-events-none overflow-hidden">
                      <HeritageItemVisual
                        itemId={item.id}
                        dallahStyle={dallahStyle}
                        size={32}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={nextItem}
                className="flex items-center gap-2 bg-[#8A1538] border border-[#FFE082] text-[#FFE082] px-4 py-3 rounded-xl font-black active:scale-95"
              >
                <span>التالي</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 text-center text-xs text-[#cfbfa8]">
              {currentItemIndex + 1} / {selectedHotspot.items.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
