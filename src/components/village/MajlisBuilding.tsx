import React from 'react';
import { Award } from 'lucide-react';

interface MajlisBuildingProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const MajlisBuilding: React.FC<MajlisBuildingProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-majlis-zone"
      onClick={onEnter}
      className={`absolute right-[4%] top-[48%] w-[29%] min-w-[290px] h-[26%] min-h-[220px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Soft Ground Shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-10 bg-[#1a0e07]/40 rounded-full blur-md pointer-events-none" />

      {/* Illustrated 2.5D Open-Fronted Qatari Majlis (SVG) */}
      <svg
        viewBox="0 0 350 230"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(138,21,56,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mud Plaster Walls */}
          <linearGradient id="majlisMud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2C799" />
            <stop offset="50%" stopColor="#D4B27B" />
            <stop offset="100%" stopColor="#BA9057" />
          </linearGradient>

          {/* Interior Sadu Carpet Pattern */}
          <linearGradient id="saduCarpet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#780C2C" />
            <stop offset="25%" stopColor="#A31644" />
            <stop offset="50%" stopColor="#FAF5EA" />
            <stop offset="75%" stopColor="#A31644" />
            <stop offset="100%" stopColor="#780C2C" />
          </linearGradient>

          {/* Warm Golden Interior Ambient Light */}
          <radialGradient id="majlisInteriorGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#D97706" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#451A03" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. MAJLIS ARCHITECTURAL SHELL & PARAPET             */}
        {/* ---------------------------------------------------- */}
        {/* Exterior Main Structure */}
        <polygon points="20,40 330,40 330,195 20,195" fill="url(#majlisMud)" stroke="#8C6635" strokeWidth="2" />

        {/* Stepped Qatari Crenelations (شرفات مسننة على سطح المجلس) */}
        {[30, 75, 120, 165, 210, 255, 300].map((xPos, idx) => (
          <polygon
            key={idx}
            points={`${xPos},40 ${xPos + 12},26 ${xPos + 28},26 ${xPos + 40},40`}
            fill="#D4B27B"
            stroke="#8C6635"
            strokeWidth="1.5"
          />
        ))}

        {/* Protruding Danjil Beams under roof */}
        {[45, 90, 135, 180, 225, 270, 315].map((xBeam, idx) => (
          <circle key={idx} cx={xBeam} cy="52" r="4.5" fill="#3A1C08" stroke="#1E0C03" strokeWidth="1" />
        ))}

        {/* ---------------------------------------------------- */}
        {/* 2. OPEN COLONNADE & DEEP INTERIOR VIEW               */}
        {/* ---------------------------------------------------- */}
        {/* Deep Interior Chamber */}
        <polygon points="35,65 315,65 315,190 35,190" fill="#240D15" stroke="#4A1523" strokeWidth="2" />
        {/* Golden Interior Ambient Glow */}
        <rect x="35" y="65" width="280" height="125" fill="url(#majlisInteriorGlow)" />

        {/* Triple Mud-brick Arches (قناطر تراثية تفتح على الداخل) */}
        {/* Left Arch */}
        <path d="M 40 190 L 40 105 Q 85 75 130 105 L 130 190 Z" fill="none" stroke="#D4B27B" strokeWidth="6" />
        {/* Center Grand Arch */}
        <path d="M 125 190 L 125 95 Q 175 65 225 95 L 225 190 Z" fill="none" stroke="#D4B27B" strokeWidth="6" />
        {/* Right Arch */}
        <path d="M 220 190 L 220 105 Q 265 75 310 105 L 310 190 Z" fill="none" stroke="#D4B27B" strokeWidth="6" />

        {/* ---------------------------------------------------- */}
        {/* 3. INTERIOR: SADU CARPETS, CUSHIONS & LOW BENCHES    */}
        {/* ---------------------------------------------------- */}
        {/* Sprawling Qatari Sadu Floor Carpet */}
        <polygon points="45,145 305,145 315,190 35,190" fill="url(#saduCarpet)" stroke="#8A1538" strokeWidth="1.5" />
        {/* Geometric Sadu Diamond Patterns */}
        {[70, 110, 150, 190, 230, 270].map((xDia, i) => (
          <polygon
            key={i}
            points={`${xDia},165 ${xDia + 8},158 ${xDia + 16},165 ${xDia + 8},172`}
            fill="#FFE082"
            opacity="0.8"
          />
        ))}

        {/* Traditional Sadu Backrest Cushions (مساند ومتاكي السدو) */}
        {/* Left Cushion */}
        <rect x="55" y="132" width="45" height="16" rx="4" fill="#8A1538" stroke="#FFE082" strokeWidth="1" />
        <line x1="77" y1="132" x2="77" y2="148" stroke="#FFE082" strokeWidth="1" />
        {/* Right Cushion */}
        <rect x="250" y="132" width="45" height="16" rx="4" fill="#8A1538" stroke="#FFE082" strokeWidth="1" />
        <line x1="272" y1="132" x2="272" y2="148" stroke="#FFE082" strokeWidth="1" />

        {/* ---------------------------------------------------- */}
        {/* 4. PROPS: BRASS DALLAH, FINJANS, DATES & MABKHARA    */}
        {/* ---------------------------------------------------- */}
        {/* Low Brass Coffee Table */}
        <ellipse cx="175" cy="162" rx="38" ry="14" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        <ellipse cx="175" cy="160" rx="36" ry="12" fill="#FBBF24" />

        {/* Polished Brass Dallah Coffee Pot */}
        <g id="majlis-dallah" transform="translate(162, 134)">
          <path d="M 6 18 L 9 6 L 17 6 L 20 18 Z" fill="#E6C280" stroke="#B45309" strokeWidth="1.2" />
          <path d="M 9 6 L 13 1 L 17 6 Z" fill="#F59E0B" />
          {/* Spout and Curved Handle */}
          <path d="M 5 12 Q 1 9 5 6" stroke="#B45309" strokeWidth="1.2" fill="none" />
          <path d="M 19 8 Q 25 10 23 16" stroke="#B45309" strokeWidth="1.2" fill="none" />
        </g>

        {/* Porcelain Finjan Coffee Cups */}
        <ellipse cx="188" cy="156" rx="3.5" ry="2.5" fill="#FAF5EA" stroke="#B45309" strokeWidth="0.8" />
        <ellipse cx="196" cy="158" rx="3.5" ry="2.5" fill="#FAF5EA" stroke="#B45309" strokeWidth="0.8" />

        {/* Dish of Luscious Golden Qatari Dates (صحن الرطب) */}
        <g id="dates-dish" transform="translate(142, 150)">
          <ellipse cx="12" cy="12" rx="11" ry="6" fill="#F59E0B" stroke="#92400E" strokeWidth="1" />
          <circle cx="9" cy="11" r="2.5" fill="#78350F" />
          <circle cx="14" cy="10" r="2.8" fill="#5B21B6" opacity="0.3" />
          <circle cx="15" cy="12" r="2.5" fill="#78350F" />
        </g>

        {/* Traditional Mabkhara with curling Oud smoke (مبخرة عود) */}
        <g id="mabkhara" transform="translate(105, 142)">
          {/* Mabkhara Base */}
          <polygon points="4,24 16,24 13,16 7,16" fill="#A16207" stroke="#451A03" strokeWidth="1" />
          <polygon points="6,16 14,16 18,8 2,8" fill="#D97706" stroke="#451A03" strokeWidth="1" />
          {/* Glowing ember */}
          <circle cx="10" cy="8" r="2" fill="#EF4444" className="animate-ping" />
          {/* Curling smoke wisps */}
          <path d="M 10 7 Q 7 3 10 0 Q 13 -3 10 -6" stroke="#F1F5F9" strokeWidth="1.2" opacity="0.75" fill="none" className="animate-pulse" />
        </g>

        {/* Hanging Brass Lanterns with warm flame */}
        <g id="lantern-left" transform="translate(85, 70)">
          <line x1="8" y1="0" x2="8" y2="12" stroke="#451A03" strokeWidth="1.2" />
          <polygon points="8,12 14,18 8,24 2,18" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="8" cy="18" r="2.5" fill="#FEF08A" className="animate-pulse" />
        </g>
        <g id="lantern-right" transform="translate(255, 70)">
          <line x1="8" y1="0" x2="8" y2="12" stroke="#451A03" strokeWidth="1.2" />
          <polygon points="8,12 14,18 8,24 2,18" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="8" cy="18" r="2.5" fill="#FEF08A" className="animate-pulse" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* CARVED WOODEN SIGNBOARD: «مجلس لوّل»                  */}
        {/* ---------------------------------------------------- */}
        <g id="majlis-sign" transform="translate(130, 195)">
          {/* Board */}
          <rect x="0" y="0" width="90" height="22" rx="4" fill="#3B0716" stroke="#FFE082" strokeWidth="1.8" />
          <text x="45" y="15" textAnchor="middle" fill="#FFE082" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            مجلس لوّل
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#8A1538] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Majlis Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[50%] bottom-[12%] -translate-x-1/2 w-16 h-12 rounded-full bg-[#8A1538]/35 blur-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
