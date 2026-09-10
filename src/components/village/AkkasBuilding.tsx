import React from 'react';
import { Award } from 'lucide-react';

interface AkkasBuildingProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const AkkasBuilding: React.FC<AkkasBuildingProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-akkas-zone"
      onClick={onEnter}
      className={`absolute right-[4%] top-[74%] w-[29%] min-w-[290px] h-[25%] min-h-[210px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Soft Ground Shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-10 bg-[#1a0e07]/40 rounded-full blur-md pointer-events-none" />

      {/* Illustrated 2.5D Vintage Photography Studio (SVG) */}
      <svg
        viewBox="0 0 350 220"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="akkasMud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9B782" />
            <stop offset="50%" stopColor="#C49B61" />
            <stop offset="100%" stopColor="#A3773B" />
          </linearGradient>

          <linearGradient id="cameraWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5C3415" />
            <stop offset="100%" stopColor="#2E1708" />
          </linearGradient>

          {/* Painted Sea Backdrop */}
          <linearGradient id="studioBackdrop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="60%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. STUDIO MUD-BRICK FACADE (WARM SAND, NO PURPLE!)  */}
        {/* ---------------------------------------------------- */}
        <polygon points="20,40 330,40 330,190 20,190" fill="url(#akkasMud)" stroke="#7A5020" strokeWidth="2" />

        {/* Crenelated Parapet & Danjil Beams */}
        {[30, 75, 120, 165, 210, 255, 300].map((xPos, idx) => (
          <polygon
            key={idx}
            points={`${xPos},40 ${xPos + 12},28 ${xPos + 28},28 ${xPos + 40},40`}
            fill="#C49B61"
            stroke="#7A5020"
            strokeWidth="1.5"
          />
        ))}
        {[45, 90, 135, 180, 225, 270, 315].map((xBeam, idx) => (
          <circle key={idx} cx={xBeam} cy="52" r="4.5" fill="#3A1C08" stroke="#1E0C03" strokeWidth="1" />
        ))}

        {/* Open Photography Studio Chamber */}
        <polygon points="35,65 315,65 315,185 35,185" fill="#1C1008" stroke="#4A260C" strokeWidth="2" />

        {/* ---------------------------------------------------- */}
        {/* 2. PAINTED MARITIME DHOW BACKDROP (خلفية المحمل والبحر) */}
        {/* ---------------------------------------------------- */}
        <g id="painted-backdrop" transform="translate(48, 75)">
          <rect x="0" y="0" width="105" height="95" rx="3" fill="url(#studioBackdrop)" stroke="#D4A769" strokeWidth="1.5" />
          {/* Painted Horizon & Distant Dhow Boat */}
          <line x1="0" y1="65" x2="105" y2="65" stroke="#0369A1" strokeWidth="2" />
          {/* Painted Dhow Silhouette on backdrop */}
          <polygon points="35,65 65,65 58,72 40,72" fill="#1E293B" />
          <line x1="50" y1="42" x2="50" y2="65" stroke="#1E293B" strokeWidth="1.5" />
          <polygon points="50,44 68,63 50,63" fill="#F8FAFC" opacity="0.9" />
          <text x="52" y="14" textAnchor="middle" fill="#0C4A6E" fontSize="7" fontWeight="bold">
            ستوديو لوّل
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 3. ANTIQUE BELLOWS CAMERA ON TRIPOD (كاميرا المنفاخ)  */}
        {/* ---------------------------------------------------- */}
        <g id="antique-bellows-camera" transform="translate(180, 95)">
          {/* Wooden Tripod Legs */}
          <line x1="28" y1="36" x2="6" y2="82" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="36" x2="28" y2="84" stroke="#5C3415" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="36" x2="50" y2="82" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />

          {/* Camera Accordion Bellows (المنفاخ الجلدي) */}
          <polygon points="16,14 40,14 44,36 12,36" fill="url(#cameraWood)" stroke="#1F0D04" strokeWidth="1.5" />
          {/* Bellows Folds */}
          <line x1="14" y1="20" x2="42" y2="20" stroke="#854D0E" strokeWidth="1.5" />
          <line x1="13" y1="26" x2="43" y2="26" stroke="#854D0E" strokeWidth="1.5" />
          <line x1="12" y1="32" x2="44" y2="32" stroke="#854D0E" strokeWidth="1.5" />

          {/* Large Brass Lens (عدسة نحاسية كلاسيكية) */}
          <circle cx="28" cy="25" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="28" cy="25" r="5" fill="#1E293B" stroke="#000000" strokeWidth="1" />
          <circle cx="26" cy="23" r="1.5" fill="#FFFFFF" />

          {/* Antique Flash Powder Tray with Sparkle */}
          <line x1="28" y1="14" x2="48" y2="0" stroke="#78350F" strokeWidth="1.5" />
          <ellipse cx="50" cy="0" rx="6" ry="2" fill="#E2E8F0" stroke="#94A3B8" />
          <circle cx="50" cy="-2" r="3" fill="#FEF08A" className="animate-ping" />
        </g>

        {/* Vintage Studio Umbrella Light */}
        <g id="umbrella-light" transform="translate(145, 75)">
          <line x1="18" y1="20" x2="18" y2="70" stroke="#334155" strokeWidth="2" />
          {/* Reflector Dome */}
          <path d="M 5 20 Q 18 6 31 20 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="18" cy="20" r="3.5" fill="#FDE047" className="animate-pulse" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. ROYAL BISHT & NOKHAZA ATTIRE DISPLAY             */}
        {/* ---------------------------------------------------- */}
        <g id="attire-display" transform="translate(255, 90)">
          {/* Mannequin Stand */}
          <rect x="22" y="15" width="4" height="70" rx="1" fill="#451A03" />
          <ellipse cx="24" cy="85" rx="16" ry="5" fill="#1A0E07" />

          {/* Royal Black Qatari Bisht with Gold Zari (بشت قطري أسود مذهب) */}
          <path
            d="M 12 25 Q 24 18 36 25 L 42 75 Q 24 80 6 75 Z"
            fill="#09090B"
            stroke="#18181B"
            strokeWidth="1.5"
          />
          {/* Gold Zari Embroidery along Front Hem (الهيلة والبروج) */}
          <path d="M 24 22 L 24 75" stroke="#FBBF24" strokeWidth="2.5" />
          <path d="M 18 24 Q 24 30 30 24" stroke="#FBBF24" strokeWidth="2" fill="none" />
          <text x="24" y="10" textAnchor="middle" fill="#E6C280" fontSize="8" fontWeight="bold">
            بشت العكّاس
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* CARVED WOODEN SIGNBOARD: «عكّاس لوّل»                */}
        {/* ---------------------------------------------------- */}
        <g id="akkas-sign" transform="translate(130, 190)">
          <rect x="0" y="0" width="90" height="22" rx="4" fill="#3D1F0C" stroke="#FFE082" strokeWidth="1.8" />
          <text x="45" y="15" textAnchor="middle" fill="#FFE082" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            عكّاس لوّل
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Akkas Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[50%] bottom-[12%] -translate-x-1/2 w-16 h-12 rounded-full bg-[#FFE082]/35 blur-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
