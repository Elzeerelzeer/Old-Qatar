import React from 'react';
import { Award } from 'lucide-react';

interface FereejGamesAreaProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const FereejGamesArea: React.FC<FereejGamesAreaProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-games-zone"
      onClick={onEnter}
      className={`absolute right-[4%] top-[14%] w-[29%] min-w-[290px] h-[27%] min-h-[230px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Soft Ground Shadow */}
      <div className="absolute -bottom-4 left-6 right-6 h-10 bg-[#1a0e07]/40 rounded-full blur-md pointer-events-none" />

      {/* Illustrated 2.5D Open Sandy Fereej Courtyard (SVG) */}
      <svg
        viewBox="0 0 350 240"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fereejSand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5C799" />
            <stop offset="50%" stopColor="#D4A769" />
            <stop offset="100%" stopColor="#C09252" />
          </linearGradient>

          <linearGradient id="houseMud" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D8B57F" />
            <stop offset="100%" stopColor="#BA9156" />
          </linearGradient>

          <linearGradient id="arishRoof" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. TRADITIONAL MUD-BRICK FLANKING HOUSES             */}
        {/* ---------------------------------------------------- */}
        {/* Rear Wall of Neighborhood House */}
        <polygon points="170,30 340,30 340,140 170,140" fill="url(#houseMud)" stroke="#8C6635" strokeWidth="2" />

        {/* Crenelated Parapet & Danjil Beams */}
        {[180, 210, 240, 270, 300, 330].map((xBeam, idx) => (
          <circle key={idx} cx={xBeam} cy="42" r="3.5" fill="#3D200A" stroke="#1A0D03" strokeWidth="1" />
        ))}
        {/* Carved Wooden Shutter Window */}
        <rect x="235" y="60" width="28" height="34" rx="2" fill="#2E1708" stroke="#5C3415" strokeWidth="2" />
        <line x1="249" y1="60" x2="249" y2="94" stroke="#5C3415" strokeWidth="1.5" />
        <line x1="235" y1="77" x2="263" y2="77" stroke="#5C3415" strokeWidth="1.5" />

        {/* Shaded Palm Verandah / Arish (عريش سعف النخيل) */}
        <polygon points="40,45 190,45 170,80 20,80" fill="url(#arishRoof)" stroke="#270F03" strokeWidth="1.5" />
        {/* Palm Frond Ribs */}
        {[30, 60, 90, 120, 150, 175].map((xFrond, i) => (
          <line key={i} x1={xFrond + 20} y1="45" x2={xFrond} y2="80" stroke="#92400E" strokeWidth="2" />
        ))}
        {/* Wooden Support Posts for Arish */}
        <rect x="35" y="80" width="5" height="70" rx="1" fill="#451A03" />
        <rect x="160" y="80" width="5" height="70" rx="1" fill="#451A03" />

        {/* ---------------------------------------------------- */}
        {/* 2. OPEN SANDY PLAY COURTYARD (ساحة رملية مفتوحة)     */}
        {/* ---------------------------------------------------- */}
        <ellipse cx="175" cy="165" rx="155" ry="65" fill="url(#fereejSand)" />

        {/* ---------------------------------------------------- */}
        {/* 3. TRADITIONAL QATARI FOLK GAMES LAID OUT ON SAND    */}
        {/* ---------------------------------------------------- */}

        {/* A. التيلة (Marbles in a circle) */}
        <g id="game-teela" transform="translate(60, 150)">
          {/* Circle etched in sand */}
          <circle cx="25" cy="25" r="22" stroke="#8C6635" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          {/* Colorful Marbles inside */}
          <circle cx="20" cy="22" r="3.2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
          <circle cx="28" cy="20" r="3" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
          <circle cx="24" cy="28" r="3.2" fill="#EAB308" stroke="#A16207" strokeWidth="0.8" />
          <circle cx="16" cy="28" r="2.8" fill="#10B981" stroke="#047857" strokeWidth="0.8" />
          {/* Shooter Marble outside */}
          <circle cx="38" cy="14" r="4" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1" className="animate-pulse" />
          <text x="25" y="55" textAnchor="middle" fill="#5C3415" fontSize="8" fontWeight="bold">
            التيلة
          </text>
        </g>

        {/* B. الدوامة (Wooden Spinning Top with String) */}
        <g id="game-dawwama" transform="translate(145, 120)">
          {/* Spinning lines */}
          <ellipse cx="16" cy="26" rx="14" ry="4" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          {/* Wooden Top Body */}
          <polygon points="16,8 24,18 8,18" fill="#B45309" stroke="#451A03" strokeWidth="1" />
          <polygon points="8,18 24,18 16,28" fill="#D97706" stroke="#451A03" strokeWidth="1" />
          <line x1="16" y1="28" x2="16" y2="31" stroke="#475569" strokeWidth="1.5" />
          {/* Wound string */}
          <path d="M 12 18 Q 16 14 20 18" stroke="#FEF08A" strokeWidth="1.2" fill="none" />
          <text x="16" y="40" textAnchor="middle" fill="#5C3415" fontSize="8" fontWeight="bold">
            الدوامة
          </text>
        </g>

        {/* C. الصقلة (Five Smooth Sea Pebbles on Wicker Mat) */}
        <g id="game-siqla" transform="translate(195, 140)">
          {/* Woven Round Mat */}
          <ellipse cx="20" cy="20" rx="18" ry="11" fill="#A16207" stroke="#451A03" strokeWidth="1" />
          {/* 5 Sea Pebbles */}
          <ellipse cx="14" cy="18" rx="3.5" ry="2.5" fill="#F1F5F9" stroke="#64748B" strokeWidth="0.8" />
          <ellipse cx="22" cy="16" rx="3" ry="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
          <ellipse cx="25" cy="22" rx="3.2" ry="2.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.8" />
          <ellipse cx="16" cy="23" rx="3" ry="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.8" />
          {/* Pebble tossed in air */}
          <ellipse cx="20" cy="9" rx="3" ry="2.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.8" className="animate-bounce" />
          <text x="20" y="39" textAnchor="middle" fill="#5C3415" fontSize="8" fontWeight="bold">
            الصقلة
          </text>
        </g>

        {/* D. الدحروي (Rolling Iron Hoop & Wire Handle) */}
        <g id="game-dahrooi" transform="translate(265, 130)">
          {/* Rolling Hoop */}
          <ellipse cx="22" cy="25" rx="18" ry="18" stroke="#334155" strokeWidth="2.5" fill="none" />
          <ellipse cx="22" cy="25" rx="16" ry="16" stroke="#64748B" strokeWidth="1" fill="none" />
          {/* Wire Handle */}
          <line x1="22" y1="42" x2="45" y2="28" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <text x="22" y="52" textAnchor="middle" fill="#5C3415" fontSize="8" fontWeight="bold">
            الدحروي
          </text>
        </g>

        {/* E. القيس (Hopscotch Grid in the Sand) */}
        <g id="game-qays" transform="translate(115, 175)">
          <rect x="0" y="0" width="16" height="12" stroke="#8C6635" strokeWidth="1.2" fill="none" />
          <rect x="16" y="0" width="16" height="12" stroke="#8C6635" strokeWidth="1.2" fill="none" />
          <rect x="8" y="12" width="16" height="12" stroke="#8C6635" strokeWidth="1.2" fill="none" />
          <rect x="0" y="24" width="16" height="12" stroke="#8C6635" strokeWidth="1.2" fill="none" />
          <rect x="16" y="24" width="16" height="12" stroke="#8C6635" strokeWidth="1.2" fill="none" />
          <text x="20" y="44" textAnchor="middle" fill="#5C3415" fontSize="8" fontWeight="bold">
            القيس
          </text>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. AMBIENT PLAYING QATARI CHILDREN                   */}
        {/* ---------------------------------------------------- */}
        {/* Boy cheering by the Teela game */}
        <g id="ambient-child-boy" transform="translate(42, 115)">
          <ellipse cx="8" cy="38" rx="6" ry="2.5" fill="#1A0E07" opacity="0.3" />
          {/* Thobe */}
          <path d="M 4 20 L 12 20 L 14 38 L 2 38 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Head & Ghutra */}
          <circle cx="8" cy="14" r="4.5" fill="#FCD3B3" />
          <path d="M 4 12 Q 8 8 12 12 L 13 18 L 3 18 Z" fill="#FFFFFF" />
          <ellipse cx="8" cy="10.5" rx="3.5" ry="1.2" fill="#000000" />
          {/* Arms cheering */}
          <path d="M 4 21 L 0 16" stroke="#FCD3B3" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 12 21 L 16 16" stroke="#FCD3B3" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Girl clapping by the Siqla game */}
        <g id="ambient-child-girl" transform="translate(242, 115)">
          <ellipse cx="8" cy="38" rx="6" ry="2.5" fill="#1A0E07" opacity="0.3" />
          {/* Traditional Dress (درّاعة مشجرة) */}
          <path d="M 4 20 L 12 20 L 15 38 L 1 38 Z" fill="#BE185D" stroke="#831843" strokeWidth="0.8" />
          {/* Head & Gold Zari Hair Ribbon */}
          <circle cx="8" cy="14" r="4.5" fill="#FCD3B3" />
          <circle cx="8" cy="10" r="3" fill="#18181B" />
          <circle cx="10" cy="9" r="1.5" fill="#FBBF24" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* CARVED WOODEN SIGNBOARD: «فريج الألعاب»              */}
        {/* ---------------------------------------------------- */}
        <g id="games-sign" transform="translate(125, 200)">
          {/* Post */}
          <rect x="42" y="16" width="6" height="20" rx="1" fill="#3D1F0C" stroke="#1A0A02" strokeWidth="1" />
          {/* Board */}
          <rect x="0" y="0" width="90" height="22" rx="4" fill="#78350F" stroke="#F59E0B" strokeWidth="1.8" />
          <text x="45" y="15" textAnchor="middle" fill="#FEF08A" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            فريج الألعاب
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#D97706] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Courtyard Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[48%] bottom-[12%] -translate-x-1/2 w-16 h-12 rounded-full bg-[#F59E0B]/30 blur-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
