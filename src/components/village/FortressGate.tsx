import React from 'react';

export const FortressGate: React.FC = () => {
  return (
    <div
      id="village-fortress-gate-zone"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[42%] min-w-[340px] h-[19%] min-h-[160px] pointer-events-none z-20 flex flex-col items-center justify-end select-none"
    >
      {/* Illustrated 2.5D Qatari Mud Fortress Gate with Watchtowers & Flags (SVG) */}
      <svg
        viewBox="0 0 460 180"
        className="w-full h-full filter drop-shadow-2xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fortress Mud Plaster */}
          <linearGradient id="gateMud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBF8C" />
            <stop offset="50%" stopColor="#CCA063" />
            <stop offset="100%" stopColor="#A87A3E" />
          </linearGradient>

          {/* Tower Mud Gradient */}
          <linearGradient id="towerMud" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CCA063" />
            <stop offset="50%" stopColor="#E2C799" />
            <stop offset="100%" stopColor="#A87A3E" />
          </linearGradient>

          {/* Heavy Teak Gate Doors */}
          <linearGradient id="gateDoors" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A260F" />
            <stop offset="50%" stopColor="#633414" />
            <stop offset="100%" stopColor="#331808" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. FLANKING WATCHTOWERS (برجان مسننان مثل برزان)     */}
        {/* ---------------------------------------------------- */}
        {/* Left Watchtower */}
        <g id="tower-left" transform="translate(45, 10)">
          {/* Tower Body */}
          <polygon points="5,30 45,30 42,170 8,170" fill="url(#towerMud)" stroke="#6E4A1F" strokeWidth="2" />
          {/* Watchtower Crenelations */}
          {[5, 18, 32].map((xP, i) => (
            <rect key={i} x={xP} y="18" width="8" height="12" fill="#CCA063" stroke="#6E4A1F" strokeWidth="1.2" />
          ))}
          {/* Tower Arrow Slit Windows */}
          <rect x="23" y="55" width="4" height="16" rx="1" fill="#1C0E04" />
          <rect x="23" y="95" width="4" height="16" rx="1" fill="#1C0E04" />
        </g>

        {/* Right Watchtower */}
        <g id="tower-right" transform="translate(365, 10)">
          {/* Tower Body */}
          <polygon points="5,30 45,30 42,170 8,170" fill="url(#towerMud)" stroke="#6E4A1F" strokeWidth="2" />
          {/* Watchtower Crenelations */}
          {[5, 18, 32].map((xP, i) => (
            <rect key={i} x={xP} y="18" width="8" height="12" fill="#CCA063" stroke="#6E4A1F" strokeWidth="1.2" />
          ))}
          {/* Tower Arrow Slit Windows */}
          <rect x="23" y="55" width="4" height="16" rx="1" fill="#1C0E04" />
          <rect x="23" y="95" width="4" height="16" rx="1" fill="#1C0E04" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 2. MAIN FORTRESS GATE ARCHWAY & WALL                 */}
        {/* ---------------------------------------------------- */}
        {/* Main Curtain Wall */}
        <polygon points="85,50 375,50 375,175 85,175" fill="url(#gateMud)" stroke="#6E4A1F" strokeWidth="2" />

        {/* Wall Crenelations */}
        {[95, 125, 155, 185, 215, 245, 275, 305, 335].map((xWall, idx) => (
          <polygon
            key={idx}
            points={`${xWall},50 ${xWall + 8},38 ${xWall + 18},38 ${xWall + 26},50`}
            fill="#CCA063"
            stroke="#6E4A1F"
            strokeWidth="1.2"
          />
        ))}

        {/* Protruding Danjil Beams */}
        {[105, 145, 185, 225, 265, 305, 345].map((xB, idx) => (
          <circle key={idx} cx={xB} cy="62" r="4" fill="#3D200A" stroke="#1A0A02" strokeWidth="1" />
        ))}

        {/* Monumental Arched Gate Portal */}
        <path
          d="M 160 175 L 160 95 Q 230 65 300 95 L 300 175 Z"
          fill="#1A0D05"
          stroke="#4A260C"
          strokeWidth="3"
        />

        {/* ---------------------------------------------------- */}
        {/* 3. MASSIVE STUDDED WOODEN DOUBLE DOORS (OPEN 45 DEG) */}
        {/* ---------------------------------------------------- */}
        {/* Left Heavy Teak Door Wing (Open Perspective) */}
        <polygon points="160,95 210,105 210,175 160,175" fill="url(#gateDoors)" stroke="#220F04" strokeWidth="2" />
        {/* Iron Studs and Crossbeams */}
        <line x1="162" y1="120" x2="208" y2="128" stroke="#1E1E20" strokeWidth="2" />
        <line x1="162" y1="150" x2="208" y2="158" stroke="#1E1E20" strokeWidth="2" />
        {[170, 185, 200].map((xStud, i) => (
          <circle key={i} cx={xStud} cy={122 + i * 2.5} r="2" fill="#D4AF37" />
        ))}

        {/* Right Heavy Teak Door Wing (Open Perspective) */}
        <polygon points="300,95 250,105 250,175 300,175" fill="url(#gateDoors)" stroke="#220F04" strokeWidth="2" />
        {/* Iron Studs and Crossbeams */}
        <line x1="298" y1="120" x2="252" y2="128" stroke="#1E1E20" strokeWidth="2" />
        <line x1="298" y1="150" x2="252" y2="158" stroke="#1E1E20" strokeWidth="2" />
        {[290, 275, 260].map((xStud, i) => (
          <circle key={i} cx={xStud} cy={122 + (2 - i) * 2.5} r="2" fill="#D4AF37" />
        ))}

        {/* Brass Lanterns Hanging Above Portal */}
        <g id="gate-lantern" transform="translate(225, 78)">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#220F04" strokeWidth="1.5" />
          <polygon points="5,10 10,15 8,21 2,21 0,15" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="5" cy="16" r="2.5" fill="#FEF08A" className="animate-pulse" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. FLUTTERING QATARI FLAGS (علمان قطريان خفاقان)      */}
        {/* ---------------------------------------------------- */}
        {/* Left Flagstaff & Qatari Flag */}
        <g id="flag-left" transform="translate(10, 0)">
          <line x1="20" y1="0" x2="20" y2="170" stroke="#475569" strokeWidth="2.5" />
          {/* Flag Banner */}
          <polygon points="20,5 65,5 60,25 20,25" fill="#8A1538" stroke="#FAF5EA" strokeWidth="0.8" />
          <polygon points="20,5 34,5 34,25 20,25" fill="#FFFFFF" />
          {/* Serrated Maroon/White Points (مسننات العلم القطري) */}
          <polygon points="34,5 37,8 34,11 37,14 34,17 37,20 34,23 37,25 34,25" fill="#FFFFFF" />
        </g>

        {/* Right Flagstaff & Qatari Flag */}
        <g id="flag-right" transform="translate(425, 0)">
          <line x1="15" y1="0" x2="15" y2="170" stroke="#475569" strokeWidth="2.5" />
          {/* Flag Banner */}
          <polygon points="15,5 60,5 55,25 15,25" fill="#8A1538" stroke="#FAF5EA" strokeWidth="0.8" />
          <polygon points="15,5 29,5 29,25 15,25" fill="#FFFFFF" />
          {/* Serrated Maroon/White Points */}
          <polygon points="29,5 32,8 29,11 32,14 29,17 32,20 29,23 32,25 29,25" fill="#FFFFFF" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 5. INSCRIPTION PLAQUE: «بوابة قطر لوّل»               */}
        {/* ---------------------------------------------------- */}
        <g id="gate-inscription" transform="translate(165, 48)">
          <rect x="0" y="0" width="130" height="24" rx="4" fill="#3D1F0C" stroke="#FFE082" strokeWidth="1.8" />
          <text x="65" y="16" textAnchor="middle" fill="#FFE082" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            بوابة قطر لوّل
          </text>
        </g>
      </svg>
    </div>
  );
};
