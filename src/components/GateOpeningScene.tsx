import React, { useEffect, useState } from 'react';
import { CharacterGender } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../services/soundEffects';

interface GateOpeningSceneProps {
  gender: CharacterGender;
  onComplete: () => void;
  isQuietMode: boolean;
}

export const GateOpeningScene: React.FC<GateOpeningSceneProps> = ({
  gender,
  onComplete,
  isQuietMode,
}) => {
  const [doorOpenRatio, setDoorOpenRatio] = useState(0); // 0 = closed, 1 = fully open
  const [characterProgress, setCharacterProgress] = useState(0); // 0 to 1 moving forward

  useEffect(() => {
    soundManager.playDoorOpen();

    if (isQuietMode) {
      // In quiet mode, immediately proceed
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Smooth opening sequence
    const openTimer = setTimeout(() => {
      setDoorOpenRatio(1);
    }, 150);

    const walkTimer = setTimeout(() => {
      setCharacterProgress(1);
    }, 600);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(walkTimer);
      clearTimeout(completeTimer);
    };
  }, [isQuietMode, onComplete]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a0e08] flex flex-col items-center justify-center select-none text-[#FAF5EA]">
      {/* Skip Button for quick access */}
      <button
        id="skip-gate-animation-btn"
        onClick={onComplete}
        className="absolute top-6 left-6 z-50 px-4 py-2 rounded-xl bg-[#2b170c]/80 border border-[#E6C280]/40 text-xs sm:text-sm font-bold text-[#E6C280] hover:bg-[#422212] transition-colors"
      >
        تخطي المشهد ⤹
      </button>

      {/* Sun Rays & Golden Village Vista behind the gate */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 flex items-center justify-center"
        style={{ opacity: doorOpenRatio * 0.95 }}
      >
        {/* Glowing Village Horizon */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#c2782b] via-[#eab308]/30 to-[#38bdf8]/20" />
        <div className="text-center z-10">
          <p className="text-2xl sm:text-4xl font-extrabold text-[#FFF4D4] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-2">
            مرحباً بكم في قرية «قطر لوّل»
          </p>
          <span className="text-sm sm:text-base text-[#FFE082] font-semibold">
            هنا تلتقي قصص الأمس بأحلام الغد
          </span>
        </div>
      </div>

      {/* Fortress Stone Wall Archway */}
      <div className="relative w-full max-w-4xl h-[560px] flex items-center justify-center perspective-[1200px] z-20">
        {/* Left Stone Fort Wall */}
        <div className="absolute left-0 top-0 bottom-0 w-[24%] bg-gradient-to-r from-[#633a1e] to-[#804b28] border-r-4 border-[#3e2211] shadow-2xl flex flex-col justify-between p-4 z-30">
          <div className="w-8 h-12 bg-[#2a160b] rounded-t-sm border border-[#d49b4b]/40 mx-auto" />
          <div className="w-6 h-6 rounded-full bg-[#f59e0b] shadow-[0_0_20px_#f59e0b] animate-pulse mx-auto" />
          <div className="w-8 h-12 bg-[#2a160b] rounded-t-sm border border-[#d49b4b]/40 mx-auto" />
        </div>

        {/* Right Stone Fort Wall */}
        <div className="absolute right-0 top-0 bottom-0 w-[24%] bg-gradient-to-l from-[#633a1e] to-[#804b28] border-l-4 border-[#3e2211] shadow-2xl flex flex-col justify-between p-4 z-30">
          <div className="w-8 h-12 bg-[#2a160b] rounded-t-sm border border-[#d49b4b]/40 mx-auto" />
          <div className="w-6 h-6 rounded-full bg-[#f59e0b] shadow-[0_0_20px_#f59e0b] animate-pulse mx-auto" />
          <div className="w-8 h-12 bg-[#2a160b] rounded-t-sm border border-[#d49b4b]/40 mx-auto" />
        </div>

        {/* Top Arch Crest with Title Plate: «بوابة قطر لوّل» */}
        <div className="absolute top-0 inset-x-[20%] h-36 bg-gradient-to-b from-[#754423] to-[#593319] border-b-4 border-[#3e2211] rounded-b-[40px] flex flex-col items-center justify-center z-30 shadow-2xl">
          {/* Wood Inscription Plaque */}
          <div className="px-6 py-2 rounded-xl bg-[#3b1f0f] border-2 border-[#E6C280] shadow-md">
            <h2 className="text-xl sm:text-2xl font-black text-[#FFE082] tracking-wide">
              بوابة قطر لوّل
            </h2>
          </div>
          <span className="text-xs text-[#d8be9f] mt-1 font-bold">
            بوابة التراث والهوية
          </span>
        </div>

        {/* Double Wooden Fortress Doors (Left & Right) with 3D Rotation */}
        <div className="relative w-[52%] h-[420px] mt-16 flex items-center justify-center overflow-visible">
          {/* Left Wooden Door Leaf */}
          <div
            className="w-1/2 h-full bg-gradient-to-r from-[#44230e] to-[#5c3015] border-2 border-[#2b160b] rounded-tl-[80px] shadow-2xl origin-left transition-transform duration-[1800ms] ease-out flex flex-col justify-around p-4"
            style={{
              transform: `rotateY(${doorOpenRatio * -78}deg)`,
            }}
          >
            {/* Iron studs & wooden beams */}
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
            <div className="flex justify-around">
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
            </div>
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
            <div className="flex justify-around">
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
            </div>
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
          </div>

          {/* Right Wooden Door Leaf */}
          <div
            className="w-1/2 h-full bg-gradient-to-l from-[#44230e] to-[#5c3015] border-2 border-[#2b160b] rounded-tr-[80px] shadow-2xl origin-right transition-transform duration-[1800ms] ease-out flex flex-col justify-around p-4"
            style={{
              transform: `rotateY(${doorOpenRatio * 78}deg)`,
            }}
          >
            {/* Iron studs & wooden beams */}
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
            <div className="flex justify-around">
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
            </div>
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
            <div className="flex justify-around">
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
              <div className="w-4 h-4 rounded-full bg-[#180c05] border border-amber-900/60" />
            </div>
            <div className="w-full h-4 bg-[#2e1709] rounded-sm" />
          </div>
        </div>

        {/* The Student Character Walking Through the Door (Back view) */}
        <div
          className="absolute z-25 transition-all duration-[1600ms] ease-out"
          style={{
            bottom: '20px',
            transform: `translateY(${-characterProgress * 120}px) scale(${1 - characterProgress * 0.28})`,
            opacity: characterProgress > 0.85 ? 0.3 : 1,
          }}
        >
          <CharacterAvatar
            gender={gender}
            direction="up" // Back to camera showing maroon bag
            isMoving={doorOpenRatio > 0}
            size={120}
          />
        </div>
      </div>
    </div>
  );
};
