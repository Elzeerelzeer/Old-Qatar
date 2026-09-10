import React from 'react';

export const CentralPlaza: React.FC = () => {
  return (
    <div
      id="central-heritage-plaza"
      className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 flex flex-col items-center select-none"
    >
      {/* Illustrated 2.5D Isometric Sidra Tree, Well & Plaza Elements (SVG) */}
      <svg
        viewBox="0 0 380 280"
        className="w-[320px] sm:w-[380px] h-auto filter drop-shadow-2xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sidra Foliage Gradients */}
          <radialGradient id="sidraCanopy1" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#14532D" />
          </radialGradient>

          <radialGradient id="sidraCanopy2" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="60%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#166534" />
          </radialGradient>

          {/* Tree Bark */}
          <linearGradient id="treeBark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#290E02" />
          </linearGradient>

          {/* Ancient Stone Well */}
          <linearGradient id="wellStone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9A7B56" />
            <stop offset="50%" stopColor="#6E5033" />
            <stop offset="100%" stopColor="#45311F" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* GROUND SHADOW UNDER SIDRA TREE & WELL                */}
        {/* ---------------------------------------------------- */}
        <ellipse cx="190" cy="225" rx="140" ry="38" fill="#1A0E07" opacity="0.35" filter="blur(6px)" />

        {/* ---------------------------------------------------- */}
        {/* 1. MAJESTIC SIDRA TREE (شجرة سدر كبيرة وارفة الظلال)  */}
        {/* ---------------------------------------------------- */}
        <g id="sidra-tree" transform="translate(190, 115)">
          {/* Main Gnarled Tree Trunk */}
          <path
            d="M -16 65 Q -8 30 -22 10 Q -10 18 0 0 Q 8 20 22 8 Q 12 35 18 65 Z"
            fill="url(#treeBark)"
            stroke="#1F0C02"
            strokeWidth="1.8"
          />
          {/* Spreading Roots */}
          <path d="M -16 65 Q -28 72 -38 74" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
          <path d="M 18 65 Q 30 72 40 74" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />

          {/* Rich Layered Canopy Foliage */}
          {/* Rear Dark Layer */}
          <ellipse cx="-45" cy="-25" rx="55" ry="40" fill="#14532D" />
          <ellipse cx="45" cy="-25" rx="55" ry="40" fill="#14532D" />
          <ellipse cx="0" cy="-45" rx="65" ry="45" fill="#14532D" />

          {/* Mid Layer Canopy */}
          <ellipse cx="-40" cy="-30" rx="50" ry="36" fill="url(#sidraCanopy1)" />
          <ellipse cx="40" cy="-30" rx="50" ry="36" fill="url(#sidraCanopy1)" />
          <ellipse cx="0" cy="-55" rx="60" ry="40" fill="url(#sidraCanopy1)" />

          {/* Top Dappled Sunlight Highlights */}
          <ellipse cx="-25" cy="-45" rx="35" ry="25" fill="url(#sidraCanopy2)" />
          <ellipse cx="25" cy="-45" rx="35" ry="25" fill="url(#sidraCanopy2)" />
          <ellipse cx="0" cy="-65" rx="42" ry="28" fill="url(#sidraCanopy2)" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 2. ANCIENT STONE WATER WELL (بئر حجري قديم دائري)     */}
        {/* ---------------------------------------------------- */}
        <g id="stone-well" transform="translate(190, 205)">
          {/* Well Pulley Timber Frame (الهيكل الخشبي والدلو) */}
          <line x1="-16" y1="0" x2="-16" y2="-32" stroke="#5C3415" strokeWidth="4" strokeLinecap="round" />
          <line x1="16" y1="0" x2="16" y2="-32" stroke="#5C3415" strokeWidth="4" strokeLinecap="round" />
          <line x1="-20" y1="-32" x2="20" y2="-32" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
          {/* Pulley Wheel & Hemp Rope */}
          <circle cx="0" cy="-27" r="4.5" fill="#78350F" stroke="#290E02" strokeWidth="1" />
          <line x1="0" y1="-23" x2="0" y2="-2" stroke="#D4A769" strokeWidth="1.5" />
          {/* Leather/Wood Water Bucket */}
          <polygon points="-5,-2 5,-2 4,6 -4,6" fill="#3E1C07" stroke="#1F0D03" strokeWidth="1" />

          {/* Circular Stone Well Outer Wall */}
          <path
            d="M -32 0 C -32 -10 32 -10 32 0 L 32 18 C 32 28 -32 28 -32 18 Z"
            fill="url(#wellStone)"
            stroke="#2B1C10"
            strokeWidth="2"
          />

          {/* Well Stone Blocks Texture */}
          <path d="M -30 6 C -15 12 15 12 30 6" stroke="#45311F" strokeWidth="1.2" fill="none" />
          <path d="M -28 12 C -15 18 15 18 28 12" stroke="#45311F" strokeWidth="1.2" fill="none" />
          <line x1="-8" y1="0" x2="-8" y2="6" stroke="#45311F" strokeWidth="1" />
          <line x1="12" y1="0" x2="12" y2="6" stroke="#45311F" strokeWidth="1" />
          <line x1="2" y1="6" x2="2" y2="12" stroke="#45311F" strokeWidth="1" />
          <line x1="-18" y1="6" x2="-18" y2="12" stroke="#45311F" strokeWidth="1" />

          {/* Deep Water Inside Well with Shimmer */}
          <ellipse cx="0" cy="0" rx="26" ry="9" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
          <circle cx="3" cy="1" r="2.5" fill="#7DD3FC" opacity="0.8" className="animate-ping" />

          {/* Terracotta Clay Pitcher next to well (جحلة ماء فخارية) */}
          <g transform="translate(36, 6)">
            <ellipse cx="0" cy="4" rx="6" ry="8" fill="#B45309" stroke="#78350F" strokeWidth="1" />
            <path d="M -4 -3 L 4 -3 L 3 -6 L -3 -6 Z" fill="#78350F" />
            <path d="M -4 0 Q -8 4 -4 6" stroke="#78350F" strokeWidth="1" fill="none" />
          </g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 3. TRADITIONAL WOODEN BENCHES & BRASS LANTERNS       */}
        {/* ---------------------------------------------------- */}
        {/* Left Wooden Bench */}
        <g id="bench-left" transform="translate(85, 215)">
          <rect x="0" y="0" width="45" height="10" rx="2" fill="#5C3415" stroke="#381B08" strokeWidth="1.5" />
          <line x1="8" y1="10" x2="8" y2="18" stroke="#381B08" strokeWidth="2.5" />
          <line x1="37" y1="10" x2="37" y2="18" stroke="#381B08" strokeWidth="2.5" />
        </g>

        {/* Right Wooden Bench */}
        <g id="bench-right" transform="translate(250, 215)">
          <rect x="0" y="0" width="45" height="10" rx="2" fill="#5C3415" stroke="#381B08" strokeWidth="1.5" />
          <line x1="8" y1="10" x2="8" y2="18" stroke="#381B08" strokeWidth="2.5" />
          <line x1="37" y1="10" x2="37" y2="18" stroke="#381B08" strokeWidth="2.5" />
        </g>

        {/* Brass Lantern on Stone Pedestal */}
        <g id="plaza-lantern" transform="translate(145, 230)">
          {/* Stone Base */}
          <rect x="0" y="8" width="12" height="10" rx="1" fill="#785A3C" stroke="#45311F" strokeWidth="1" />
          {/* Lantern Body */}
          <polygon points="6,0 11,4 9,9 3,9 1,4" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="6" cy="5" r="2.5" fill="#FEF08A" className="animate-pulse" />
        </g>
      </svg>

      {/* Heritage Plaque Inscription Banner */}
      <div className="mt-1 px-3 py-1 rounded-full bg-[#180D07]/85 border border-[#E6C280]/60 shadow-lg text-center backdrop-blur-sm pointer-events-none">
        <span className="text-[10px] sm:text-xs font-black text-[#FFE082] whitespace-nowrap">
          «هنا تلتقي قصص الأمس بأحلام الغد»
        </span>
      </div>
    </div>
  );
};
