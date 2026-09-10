import React from 'react';
import { Award } from 'lucide-react';

interface CraftsBuildingProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const CraftsBuilding: React.FC<CraftsBuildingProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-crafts-zone"
      onClick={onEnter}
      className={`absolute left-[4%] top-[48%] w-[29%] min-w-[290px] h-[26%] min-h-[220px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Soft Ground Shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-10 bg-[#1a0e07]/40 rounded-full blur-md pointer-events-none" />

      {/* Illustrated 2.5D Open Heritage Craft Workshop (SVG) */}
      <svg
        viewBox="0 0 350 230"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(217,119,6,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="craftsMud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBF8C" />
            <stop offset="60%" stopColor="#CCA063" />
            <stop offset="100%" stopColor="#A87A3E" />
          </linearGradient>

          <linearGradient id="loomYarn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="75%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8A1538" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. WORKSHOP MUD-BRICK SHELL & PALM VERANDA           */}
        {/* ---------------------------------------------------- */}
        <polygon points="20,45 330,45 330,195 20,195" fill="url(#craftsMud)" stroke="#7A5020" strokeWidth="2" />

        {/* Crenelated Parapet & Danjil Beams */}
        {[30, 75, 120, 165, 210, 255, 300].map((xPos, idx) => (
          <polygon
            key={idx}
            points={`${xPos},45 ${xPos + 12},32 ${xPos + 28},32 ${xPos + 40},45`}
            fill="#CCA063"
            stroke="#7A5020"
            strokeWidth="1.5"
          />
        ))}
        {[45, 90, 135, 180, 225, 270, 315].map((xBeam, idx) => (
          <circle key={idx} cx={xBeam} cy="55" r="4.5" fill="#3A1C08" stroke="#1E0C03" strokeWidth="1" />
        ))}

        {/* Open Workshop Bay with Thatched Palm Arbor */}
        <polygon points="35,70 315,70 315,190 35,190" fill="#241408" stroke="#4A260C" strokeWidth="2" />

        {/* ---------------------------------------------------- */}
        {/* 2. HORIZONTAL SADU WEAVING LOOM (نول السدو الأفقي)   */}
        {/* ---------------------------------------------------- */}
        <g id="sadu-loom" transform="translate(45, 120)">
          {/* Wooden Loom Frame */}
          <line x1="0" y1="20" x2="85" y2="20" stroke="#5C3415" strokeWidth="4" strokeLinecap="round" />
          <line x1="0" y1="52" x2="85" y2="52" stroke="#5C3415" strokeWidth="4" strokeLinecap="round" />
          {/* Warp and Weft Colored Threads */}
          <rect x="10" y="22" width="65" height="28" fill="url(#loomYarn)" />
          {/* Wooden Shuttle & Beater (الميشعة والمنشزة) */}
          <line x1="10" y1="36" x2="75" y2="36" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="4 2" />
          {/* Yarn balls */}
          <circle cx="15" cy="58" r="6" fill="#DC2626" />
          <circle cx="28" cy="58" r="5.5" fill="#F59E0B" />
          <circle cx="40" cy="58" r="6" fill="#8A1538" />
          <text x="42" y="14" textAnchor="middle" fill="#E6C280" fontSize="8" fontWeight="bold">
            نول السدو
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 3. PALM FROND WEAVING CORNER (سف الخوص والمهاف)       */}
        {/* ---------------------------------------------------- */}
        <g id="palm-weaving" transform="translate(145, 115)">
          {/* Circular Woven Dining Mat (سرود/سفرة خوص ملونة) */}
          <ellipse cx="26" cy="35" rx="24" ry="15" fill="#A16207" stroke="#451A03" strokeWidth="1.5" />
          <ellipse cx="26" cy="35" rx="18" ry="11" fill="#CA8A04" stroke="#78350F" strokeWidth="1" />
          <ellipse cx="26" cy="35" rx="10" ry="6" fill="#DC2626" />
          {/* Woven Hand Fan (مهفة خوص) */}
          <polygon points="56,22 70,16 66,34 52,40" fill="#16A34A" stroke="#14532D" strokeWidth="1" />
          <line x1="52" y1="40" x2="44" y2="48" stroke="#78350F" strokeWidth="2" />
          <text x="35" y="10" textAnchor="middle" fill="#E6C280" fontSize="8" fontWeight="bold">
            سف الخوص
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. MODEL DHOW WORKBENCH (ورشة صناعة المحامل المصغرة) */}
        {/* ---------------------------------------------------- */}
        <g id="model-dhow-bench" transform="translate(140, 165)">
          {/* Workbench Table */}
          <rect x="0" y="8" width="75" height="14" rx="2" fill="#5C3415" stroke="#3A1C08" strokeWidth="1" />
          {/* Miniature Model Dhow */}
          <path d="M 15 8 Q 30 14 55 14 Q 65 14 70 6 L 60 6 Q 30 6 15 8 Z" fill="#2E1708" stroke="#E6C280" strokeWidth="0.8" />
          <line x1="42" y1="6" x2="42" y2="-8" stroke="#5C3415" strokeWidth="1.8" />
          <polygon points="42,-7 58,4 42,4" fill="#FAF5EA" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 5. ATTIRE & BUKHNUQ CORNER (ركن الأزياء والبخنق)     */}
        {/* ---------------------------------------------------- */}
        <g id="bukhnuq-stand" transform="translate(245, 100)">
          {/* Wooden Mannequin Stand */}
          <rect x="33" y="15" width="4" height="65" rx="1" fill="#451A03" />
          <ellipse cx="35" cy="80" rx="18" ry="6" fill="#271207" />

          {/* Authentic Girl's Bukhnuq (البخنق الأسود المطرز بالزري الذهبي) */}
          <path
            d="M 22 25 Q 35 15 48 25 L 56 65 Q 35 72 14 65 Z"
            fill="#121214"
            stroke="#18181B"
            strokeWidth="1.5"
          />
          {/* Golden Zari Embroidery on Face Opening & Chest */}
          <ellipse cx="35" cy="32" rx="7" ry="9" fill="#241408" stroke="#FBBF24" strokeWidth="2" />
          <path d="M 28 42 L 42 42 L 35 60 Z" fill="#D97706" stroke="#FBBF24" strokeWidth="1.2" />
          <text x="35" y="10" textAnchor="middle" fill="#E6C280" fontSize="8" fontWeight="bold">
            البخنق والزري
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* CARVED WOODEN SIGNBOARD: «بيت الحرف»                 */}
        {/* ---------------------------------------------------- */}
        <g id="crafts-sign" transform="translate(130, 195)">
          <rect x="0" y="0" width="90" height="22" rx="4" fill="#3D1F0C" stroke="#D97706" strokeWidth="1.8" />
          <text x="45" y="15" textAnchor="middle" fill="#FED7AA" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            بيت الحرف
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#B45309] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Crafts Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[50%] bottom-[12%] -translate-x-1/2 w-16 h-12 rounded-full bg-[#D97706]/35 blur-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
