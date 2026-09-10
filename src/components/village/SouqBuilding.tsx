import React from 'react';
import { DoorOpen, Award } from 'lucide-react';

interface SouqBuildingProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const SouqBuilding: React.FC<SouqBuildingProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-souq-zone"
      onClick={onEnter}
      className={`absolute left-[4%] top-[16%] w-[28%] min-w-[280px] h-[26%] min-h-[220px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Soft Ground Shadow */}
      <div className="absolute -bottom-4 left-4 right-2 h-10 bg-[#1a0e07]/40 rounded-full blur-md pointer-events-none" />

      {/* Illustrated 2.5D Isometric Souq Architecture (SVG) */}
      <svg
        viewBox="0 0 340 240"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mud-brick Plaster Gradients */}
          <linearGradient id="souqMudWall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2C799" />
            <stop offset="60%" stopColor="#D4B27B" />
            <stop offset="100%" stopColor="#BA9057" />
          </linearGradient>

          <linearGradient id="souqMudShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C29D67" />
            <stop offset="100%" stopColor="#96703B" />
          </linearGradient>

          {/* Teak Wood & Beams */}
          <linearGradient id="souqWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6E3D19" />
            <stop offset="100%" stopColor="#3F200A" />
          </linearGradient>

          {/* Qatar Maroon Canopy */}
          <linearGradient id="souqMaroon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9E1841" />
            <stop offset="100%" stopColor="#610922" />
          </linearGradient>

          {/* Saffron & Spices */}
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Clay Pottery */}
          <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C26A32" />
            <stop offset="100%" stopColor="#8A3E11" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* MAIN MUD-BRICK SHOPFRONT FACADE                     */}
        {/* ---------------------------------------------------- */}
        {/* Rear Wall Shadow */}
        <polygon points="20,50 320,50 320,200 20,200" fill="url(#souqMudShade)" />
        {/* Front Wall */}
        <polygon points="30,45 310,45 310,195 30,195" fill="url(#souqMudWall)" />

        {/* Stepped Crenelations on Parapet (شرفات مسننة تراثية) */}
        {[35, 75, 115, 155, 195, 235, 275].map((xPos, idx) => (
          <polygon
            key={idx}
            points={`${xPos},45 ${xPos + 10},30 ${xPos + 25},30 ${xPos + 35},45`}
            fill="#D4B27B"
            stroke="#96703B"
            strokeWidth="1.5"
          />
        ))}

        {/* Protruding Wooden Danjil Roof Beams (دنجل ومربوع يبرز من الجدار) */}
        {[45, 85, 125, 165, 205, 245, 285].map((xPos, idx) => (
          <g key={idx}>
            <circle cx={xPos} cy="58" r="4.5" fill="url(#souqWood)" stroke="#221004" strokeWidth="1" />
            {/* Cast shadow under each beam */}
            <path d={`M ${xPos - 3} 64 Q ${xPos + 2} 70 ${xPos + 8} 68`} stroke="#6D461D" strokeWidth="2" />
          </g>
        ))}

        {/* ---------------------------------------------------- */}
        {/* STRIPED CANVAS CANOPY (مظلة قماشية عنابية وبيضاء)   */}
        {/* ---------------------------------------------------- */}
        <g id="souq-canopy">
          {/* Slanted Fabric Awning over stalls */}
          <polygon points="40,75 280,75 295,108 25,108" fill="#FAF5EA" />
          {/* Alternating Maroon Stripes */}
          {[
            '40,75 70,75 62,108 25,108',
            '100,75 130,75 125,108 95,108',
            '160,75 190,75 188,108 158,108',
            '220,75 250,75 252,108 221,108',
          ].map((pts, i) => (
            <polygon key={i} points={pts} fill="url(#souqMaroon)" />
          ))}
          {/* Scalloped Awning Hem */}
          <path
            d="M 25 108 Q 40 114 55 108 Q 70 114 85 108 Q 100 114 115 108 Q 130 114 145 108 Q 160 114 175 108 Q 190 114 205 108 Q 220 114 235 108 Q 250 114 265 108 Q 280 114 295 108"
            stroke="#610922"
            strokeWidth="3"
            fill="none"
          />
        </g>

        {/* ---------------------------------------------------- */}
        {/* TRADITIONAL SHOP STALLS & OPEN WOODEN DOORWAYS       */}
        {/* ---------------------------------------------------- */}
        {/* Main Central Entrance Doorway */}
        <path
          d="M 130 195 L 130 120 Q 155 105 180 120 L 180 195 Z"
          fill="#1C0E07"
          stroke="#5C3415"
          strokeWidth="3"
        />
        {/* Interior Golden Lantern Light from Inside */}
        <circle cx="155" cy="140" r="14" fill="#F59E0B" opacity="0.35" className="animate-pulse" />

        {/* Left Shop Display Window */}
        <path
          d="M 50 175 L 50 125 Q 75 115 100 125 L 100 175 Z"
          fill="#27130A"
          stroke="#5C3415"
          strokeWidth="2.5"
        />
        {/* Right Shop Display Window */}
        <path
          d="M 210 175 L 210 125 Q 235 115 260 125 L 260 175 Z"
          fill="#27130A"
          stroke="#5C3415"
          strokeWidth="2.5"
        />

        {/* ---------------------------------------------------- */}
        {/* PROPS: SPICES, POTTERY, SACKS & COFFEE DALLAH        */}
        {/* ---------------------------------------------------- */}
        {/* Sacks of Aromatic Spices (أكياس التوابل: زعفران وهيل وسماق) */}
        {/* Sack 1: Saffron Yellow */}
        <ellipse cx="65" cy="180" rx="11" ry="9" fill="url(#saffronGrad)" stroke="#B45309" strokeWidth="1.5" />
        <ellipse cx="65" cy="176" rx="9" ry="4" fill="#FDE68A" />
        {/* Sack 2: Sumac Maroon */}
        <ellipse cx="85" cy="182" rx="10" ry="8" fill="url(#souqMaroon)" stroke="#560A20" strokeWidth="1.5" />
        <ellipse cx="85" cy="178" rx="8" ry="3.5" fill="#FDA4AF" />
        {/* Sack 3: Green Cardamom */}
        <ellipse cx="45" cy="185" rx="9" ry="7" fill="#15803D" stroke="#14532D" strokeWidth="1.5" />

        {/* Clay Water Pitchers & Pottery (أواني وفخار) */}
        <g id="clay-pots">
          <ellipse cx="108" cy="184" rx="7" ry="9" fill="url(#clayGrad)" stroke="#5B290A" strokeWidth="1.2" />
          <path d="M 103 175 L 113 175 L 111 172 L 105 172 Z" fill="#8A3E11" />
          <ellipse cx="120" cy="186" rx="6" ry="8" fill="url(#clayGrad)" stroke="#5B290A" strokeWidth="1.2" />
        </g>

        {/* Wooden Shipping Crate with Rope */}
        <rect x="205" y="165" width="22" height="18" rx="2" fill="url(#souqWood)" stroke="#1F0D04" strokeWidth="1.5" />
        <line x1="205" y1="174" x2="227" y2="174" stroke="#1F0D04" strokeWidth="1" />
        <line x1="216" y1="165" x2="216" y2="183" stroke="#D4A769" strokeWidth="1.2" />

        {/* Brass Dallah Coffee Pot & Finjan on small low table */}
        <g id="brass-dallah" transform="translate(230, 160)">
          <rect x="0" y="14" width="22" height="8" rx="1" fill="#5C3415" />
          {/* Dallah Pot */}
          <path d="M 6 14 L 8 4 L 14 4 L 16 14 Z" fill="#E6C280" stroke="#B45309" strokeWidth="1" />
          <path d="M 8 4 L 11 0 L 14 4 Z" fill="#F59E0B" />
          <path d="M 5 9 Q 2 7 5 5" stroke="#B45309" strokeWidth="1" fill="none" />
          <path d="M 15 7 Q 19 8 18 12" stroke="#B45309" strokeWidth="1" fill="none" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* FALCONER CORNER (ركن الصقّار: صقّار قطري + صقر حر)    */}
        {/* ---------------------------------------------------- */}
        <g id="falconer-corner" transform="translate(270, 140)">
          {/* Seated Falconer in White Thobe & Bisht */}
          <ellipse cx="14" cy="42" rx="16" ry="8" fill="#1C0E07" opacity="0.3" />
          {/* Thobe Body */}
          <path d="M 5 44 Q 14 36 24 44 L 27 50 Q 14 54 2 50 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <ellipse cx="14" cy="34" rx="5" ry="6" fill="#FCD3B3" />
          {/* Ghutra & Agal */}
          <path d="M 9 32 Q 14 26 19 32 L 20 40 L 8 40 Z" fill="#FFFFFF" />
          <ellipse cx="14" cy="29" rx="5" ry="1.8" fill="#18181B" stroke="#000000" strokeWidth="1" />

          {/* Wooden Mangal Post (مجثم الصقر الخشبي) */}
          <rect x="36" y="24" width="3" height="26" rx="1" fill="url(#souqWood)" stroke="#221004" strokeWidth="1" />
          <ellipse cx="37.5" cy="24" rx="8" ry="3" fill="#8A3E11" stroke="#3A1705" strokeWidth="1" />

          {/* Perched Qatari Falcon with Hood (صقر حر مبرقع) */}
          <ellipse cx="37.5" cy="16" rx="5" ry="7" fill="#5C3415" stroke="#2D1505" strokeWidth="1" />
          {/* Hooded Head (البرقع) */}
          <ellipse cx="37.5" cy="8" rx="3.5" ry="4" fill="#8A1538" stroke="#FFE58F" strokeWidth="0.8" />
          {/* Falcon Plume on Burqa */}
          <path d="M 37.5 4 L 37.5 0" stroke="#FFE58F" strokeWidth="1.2" />
          {/* Tail & Talons */}
          <path d="M 36 23 L 37.5 28 L 39 23" stroke="#2D1505" strokeWidth="1.2" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* TRADITIONAL CARVED CALLIGRAPHY SIGNBOARD: «سوق لوّل» */}
        {/* ---------------------------------------------------- */}
        <g id="souq-sign" transform="translate(110, 82)">
          {/* Hanging Chains */}
          <line x1="16" y1="0" x2="16" y2="8" stroke="#221004" strokeWidth="1.5" />
          <line x1="74" y1="0" x2="74" y2="8" stroke="#221004" strokeWidth="1.5" />
          {/* Wood Board */}
          <rect x="0" y="8" width="90" height="22" rx="4" fill="#3D1F0C" stroke="#E6C280" strokeWidth="1.8" />
          <text x="45" y="23" textAnchor="middle" fill="#FFE082" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            سوق لوّل
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Golden Doorway Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[44%] bottom-[14%] -translate-x-1/2 w-14 h-16 rounded-t-xl bg-[#F59E0B]/30 blur-sm pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
