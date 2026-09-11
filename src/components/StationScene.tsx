import React from 'react';
import { StationData, CharacterGender } from '../types';
import { ArrowRight, Sparkles, CheckCircle2, Bookmark } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface StationSceneProps {
  station: StationData;
  gender: CharacterGender;
  onReturnToVillage: () => void;
  onStampPassport?: (stationId: string) => void;
  isStamped?: boolean;
}

export const StationScene: React.FC<StationSceneProps> = ({
  station,
  gender,
  onReturnToVillage,
  onStampPassport,
  isStamped = false,
}) => {
  const handleReturn = () => {
    soundManager.playDoorOpen();
    onReturnToVillage();
  };

  const handleStamp = () => {
    if (onStampPassport) {
      soundManager.playSuccess();
      onStampPassport(station.id);
    }
  };

  return (
    <main
      id={`station-scene-${station.id}`}
      aria-label={`محطة ${station.title}`}
      className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-4 sm:p-8 bg-[#120804] text-[#FAF5EA] select-none animate-fadeIn"
    >
      {/* Heritage Atmospheric Background Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${station.color} 0%, transparent 65%)`,
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto pt-2">
        {/* Return Button at Top Right */}
        <button
          id="station-return-top-btn"
          onClick={handleReturn}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full bg-[#8A1538] hover:bg-[#a31a44] border-2 border-[#E6C280] text-[#FFF4D4] font-black text-sm sm:text-base shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          <span>العودة إلى القرية</span>
        </button>

        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2a160d]/80 border border-[#E6C280]/40 text-xs font-bold text-[#FFE082]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
          <span>{station.badgeText}</span>
        </div>
      </header>

      {/* Central Station Showcase Card */}
      <section className="relative z-10 w-full max-w-2xl mx-auto my-auto text-center flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-[#1c0f08]/90 border-2 border-[#E6C280]/60 shadow-[0_12px_48px_rgba(0,0,0,0.85)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
        {/* Station Icon Accent */}
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl border-2 border-[#FFE082]/60"
          style={{
            background: `linear-gradient(135deg, ${station.color} 0%, #200f08 100%)`,
          }}
        >
          <span className="text-4xl sm:text-5xl drop-shadow-md">
            {station.id === 'souq' && '🏺'}
            {station.id === 'pearl' && '⚓'}
            {station.id === 'games' && '🎯'}
            {station.id === 'majlis' && '☕'}
            {station.id === 'crafts' && '🧵'}
            {station.id === 'akkas' && '📷'}
          </span>
        </div>

        {/* Station Name (اسم المحطة) */}
        <h1 className="text-3xl sm:text-5xl font-black text-[#FFF4D4] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mb-3">
          {station.title}
        </h1>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-lg text-[#FFE082] font-semibold mb-4 max-w-lg">
          {station.subtitle}
        </p>
        <p className="text-xs sm:text-sm text-[#d4bea9] leading-relaxed max-w-md mb-8">
          {station.description}
        </p>

        {/* Action Buttons: Return to Village & Stamp Passport */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* Main Primary Button: «العودة إلى القرية» */}
          <button
            id="station-return-center-btn"
            onClick={handleReturn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#8A1538] hover:bg-[#a31a44] border-2 border-[#E6C280] text-white font-black text-base sm:text-lg shadow-[0_6px_24px_rgba(138,21,56,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[3]" />
            <span>العودة إلى القرية</span>
          </button>

          {/* Stamp Action Pill */}
          <button
            id="station-stamp-btn"
            onClick={handleStamp}
            disabled={isStamped}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md border ${
              isStamped
                ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-200 cursor-default'
                : 'bg-[#2b170c] hover:bg-[#3d1f10] border-[#E6C280]/50 text-[#FFE082] cursor-pointer hover:scale-105'
            }`}
          >
            {isStamped ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تم الختم في الجواز ✓</span>
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5 text-[#FFE082]" />
                <span>ختم الجواز للمحطة</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between text-xs text-[#a38c76] pb-2">
        <span>قرية قطر لوّل التراثية • {station.title}</span>
        <span>الزائر: {gender === 'boy' ? 'طالب قطري' : 'طالبة قطرية'}</span>
      </footer>
    </main>
  );
};
