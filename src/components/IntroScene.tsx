import React from 'react';
import { Volume2, VolumeX, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface IntroSceneProps {
  onStart: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isQuietMode: boolean;
  onToggleQuietMode: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  onStart,
  isSoundEnabled,
  onToggleSound,
  isQuietMode,
  onToggleQuietMode,
}) => {
  const handleStart = () => {
    soundManager.playDoorOpen();
    onStart();
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#1c120c] via-[#2d1a10] to-[#140b06] text-[#FAF5EA] p-4 sm:p-6 md:p-8">
      {/* Background Ambience: Golden Hour Sky, Distant Doha Skyline, Palm Silhouettes */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Sky Glow */}
        <div className="absolute top-0 inset-x-0 h-2/3 bg-gradient-to-b from-[#c2410c]/30 via-[#d97706]/20 to-transparent" />
        {/* Desert Sand Dunes */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#b45309]/30 via-[#78350f]/20 to-transparent" />
      </div>

      {/* Top Header Controls: Sound & Accessibility */}
      <header className="relative z-20 w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* National Flag & Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-[#24150e]/85 border border-[#d49b4b]/30 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
          <div className="w-6 h-4 rounded-sm overflow-hidden flex shadow border border-white/20 shrink-0">
            <div className="w-1/3 bg-white" />
            <div className="w-2/3 bg-[#8A1538]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#E6C280] tracking-wide">
            دولة قطر • فعالية قطر لوّل
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quiet Mode Indicator Button */}
          <button
            id="intro-quiet-mode-btn"
            onClick={onToggleQuietMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
              isQuietMode
                ? 'bg-[#8A1538] border-[#E6C280] text-[#FAF5EA]'
                : 'bg-[#24150e]/80 border-[#d49b4b]/30 text-[#e6c280] hover:bg-[#341e14]'
            }`}
            title="الوضع الهادئ للأشخاص ذوي الإعاقة والحساسية الحسية"
          >
            <ShieldCheck className="w-4 h-4 text-[#E6C280]" />
            <span>{isQuietMode ? 'الوضع الهادئ (مفعّل)' : 'الوضع الهادئ'}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            id="intro-sound-toggle-btn"
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
              isSoundEnabled
                ? 'bg-[#15803d] border-[#86efac] text-white'
                : 'bg-[#24150e]/80 border-[#d49b4b]/30 text-[#e6c280] hover:bg-[#341e14]'
            }`}
          >
            {isSoundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-300" />
                <span>الصوت مفعّل</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#fca5a5]" />
                <span>تفعيل الصوت</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Cinematic Fortress Gate Visual & Title */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-3xl px-4">
        {/* Visual Gate Arch Silhouette Graphic */}
        <div className="relative mb-4 w-48 sm:w-60 md:w-72 h-24 sm:h-32 flex items-center justify-center">
          <svg viewBox="0 0 240 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            {/* Crenelated Top Fortress Wall */}
            <path
              d="M10 90 L10 40 L30 40 L30 50 L50 50 L50 40 L70 40 L70 50 L90 50 L90 40 L110 40 L110 50 L130 50 L130 40 L150 40 L150 50 L170 50 L170 40 L190 40 L190 50 L210 50 L210 40 L230 40 L230 90 Z"
              fill="#8d562b"
              stroke="#e6c280"
              strokeWidth="2"
            />
            {/* Grand Arch Door Opening */}
            <path
              d="M75 90 L75 45 C75 15, 165 15, 165 45 L165 90 Z"
              fill="#24150e"
              stroke="#e6c280"
              strokeWidth="3"
            />
            {/* Wooden Studded Doors Closed */}
            <path d="M80 90 L80 48 C80 28, 120 28, 120 48 L120 90 Z" fill="#4a2511" stroke="#24150e" strokeWidth="1.5" />
            <path d="M120 90 L120 48 C120 28, 160 28, 160 48 L160 90 Z" fill="#3d1e0d" stroke="#24150e" strokeWidth="1.5" />
            {/* Hanging Lanterns */}
            <circle cx="50" cy="65" r="5" fill="#f59e0b" className="animate-pulse" />
            <circle cx="190" cy="65" r="5" fill="#f59e0b" className="animate-pulse" />
          </svg>
        </div>

        {/* App Title: «قطر لوّل» */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF4D4] via-[#E6C280] to-[#C89B48] tracking-tight drop-shadow-md mb-2">
          قطر لوّل
        </h1>

        {/* Subtitle: «تراثنا • هويتنا • مستقبلنا» */}
        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#E6C280] tracking-wider mb-4 drop-shadow">
          تراثنا • هويتنا • مستقبلنا
        </p>

        {/* Educational Purpose Card */}
        <p className="text-sm sm:text-base text-[#d8c3ad] max-w-xl mb-8 leading-relaxed">
          رحلة استكشافية 2.5D في قرية قطرية أصيلة، يتعرف فيها المنتسب على أسواق زمان، والغوص على اللؤلؤ، وألعاب الفريج، وحسن الضيافة في المجلس.
        </p>

        {/* Big Accessible "ابدأ الرحلة" Button */}
        <button
          id="start-journey-button"
          onClick={handleStart}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#8A1538] via-[#a61c45] to-[#8A1538] text-white font-extrabold text-xl sm:text-2xl shadow-[0_10px_35px_rgba(138,21,56,0.6)] border-2 border-[#E6C280] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Compass className="w-7 h-7 text-[#FFE082] transition-transform group-hover:rotate-45" />
          <span>ابدأ الرحلة</span>
          <Sparkles className="w-6 h-6 text-[#FFE082] animate-pulse" />
        </button>

        {/* Simple Note for People of Determination / Touch / Smartboard */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#baa28d]">
          <span>مناسب للأشخاص ذوي الإعاقة • يدعم لوحة المفاتيح واللمس والشاشات الذكية</span>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-xs text-[#a38b77] border-t border-[#d49b4b]/20 pt-4">
        <span>© مبادرة «قطر لوّل» التعليمية التراثية – المرحلة الأولى</span>
        <span className="mt-1 sm:mt-0 font-medium text-[#E6C280]">
          استكشف • تعلّم • العب واجمع الأختام
        </span>
      </footer>
    </div>
  );
};
