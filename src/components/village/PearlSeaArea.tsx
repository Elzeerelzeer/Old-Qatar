import React from 'react';
import { Award } from 'lucide-react';

interface PearlSeaAreaProps {
  isNearby: boolean;
  isStamped: boolean;
  onEnter: () => void;
}

export const PearlSeaArea: React.FC<PearlSeaAreaProps> = ({ isNearby, isStamped, onEnter }) => {
  return (
    <div
      id="station-pearl-zone"
      onClick={onEnter}
      className={`absolute left-[36%] top-[6%] w-[30%] min-w-[300px] h-[26%] min-h-[220px] cursor-pointer transition-all duration-300 z-10 select-none group ${
        isNearby ? 'scale-[1.02]' : 'hover:brightness-105'
      }`}
    >
      {/* Illustrated 2.5D Coastal Shoreline, Pier & Dhow Boat (SVG) */}
      <svg
        viewBox="0 0 360 220"
        className={`w-full h-full filter drop-shadow-xl transition-all duration-300 ${
          isNearby ? 'drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sea Water Gradient */}
          <linearGradient id="seaWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#082F49" />
          </linearGradient>

          {/* Sandy Shore Gradient */}
          <linearGradient id="shoreSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A769" />
            <stop offset="100%" stopColor="#E2C799" />
          </linearGradient>

          {/* Weathered Jetty Timber */}
          <linearGradient id="jettyWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5A3418" />
            <stop offset="50%" stopColor="#43220A" />
            <stop offset="100%" stopColor="#2D1504" />
          </linearGradient>

          {/* Dhow Boat Teak Wood */}
          <linearGradient id="dhowHull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A2511" />
            <stop offset="70%" stopColor="#301608" />
            <stop offset="100%" stopColor="#1B0A03" />
          </linearGradient>

          {/* Pearl Luster */}
          <radialGradient id="pearlShine" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. SEAMLESS COASTAL WATER & GENTLE UNDULATING WAVES  */}
        {/* ---------------------------------------------------- */}
        {/* Open Gulf Seawater */}
        <path
          d="M 0 0 L 360 0 L 360 110 Q 260 118 180 110 Q 90 102 0 115 Z"
          fill="url(#seaWaterGrad)"
        />

        {/* Animated Water Ripple Layer */}
        <path
          d="M 10 35 Q 60 25 120 35 Q 180 45 240 35 Q 300 25 350 35"
          stroke="#7DD3FC"
          strokeWidth="1.5"
          opacity="0.6"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M 30 65 Q 90 55 160 65 Q 230 75 300 65 Q 330 60 360 65"
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.5"
          fill="none"
        />

        {/* Sandy Shore Transition */}
        <path
          d="M 0 115 Q 90 102 180 110 Q 260 118 360 110 L 360 220 L 0 220 Z"
          fill="url(#shoreSandGrad)"
        />
        {/* Wet Sand Shoreline Fringe */}
        <path
          d="M 0 116 Q 90 103 180 111 Q 260 119 360 111"
          stroke="#BA8F54"
          strokeWidth="4"
          fill="none"
        />

        {/* ---------------------------------------------------- */}
        {/* 2. WEATHERED WOODEN JETTY / PIER                    */}
        {/* ---------------------------------------------------- */}
        {/* Wooden Stilts in water */}
        {[145, 175, 205].map((xStilt, idx) => (
          <g key={idx}>
            <rect x={xStilt - 3} y="85" width="6" height="55" rx="1" fill="url(#jettyWood)" />
            {/* Water reflections at foot of stilt */}
            <ellipse cx={xStilt} cy="138" rx="7" ry="2" fill="#0369A1" opacity="0.4" />
          </g>
        ))}

        {/* Pier Planking Deck */}
        <polygon points="120,85 230,85 245,175 105,175" fill="url(#jettyWood)" stroke="#1F0D03" strokeWidth="2" />

        {/* Planks Grooves */}
        {[95, 110, 125, 140, 155].map((yLine, i) => (
          <line key={i} x1="112" y1={yLine} x2="238" y2={yLine} stroke="#2D1504" strokeWidth="1.8" />
        ))}

        {/* Pier Mooring Bollards */}
        <rect x="110" y="165" width="7" height="12" rx="2" fill="#241005" stroke="#120601" strokeWidth="1" />
        <rect x="232" y="165" width="7" height="12" rx="2" fill="#241005" stroke="#120601" strokeWidth="1" />
        {/* Coiled Hemp Rope around bollard */}
        <ellipse cx="113.5" cy="172" rx="5" ry="2.5" fill="#D4A769" />

        {/* ---------------------------------------------------- */}
        {/* 3. TRADITIONAL QATARI DHOW BOAT                     */}
        {/* ---------------------------------------------------- */}
        <g id="qatari-dhow" transform="translate(195, 20)">
          {/* Boat Reflection / Shadow in Sea */}
          <ellipse cx="65" cy="72" rx="58" ry="12" fill="#042F48" opacity="0.5" />

          {/* Dhow Hull */}
          <path
            d="M 5 62 Q 25 72 65 72 Q 105 72 128 50 Q 115 48 65 48 Q 20 48 5 62 Z"
            fill="url(#dhowHull)"
            stroke="#120601"
            strokeWidth="1.8"
          />
          {/* Hull Timber Planks & Ribs */}
          <path d="M 12 58 Q 50 67 118 52" stroke="#5C3415" strokeWidth="1.5" fill="none" />
          <path d="M 22 62 Q 60 70 100 60" stroke="#5C3415" strokeWidth="1.2" fill="none" />

          {/* Tall Wooden Mast */}
          <line x1="68" y1="48" x2="68" y2="2" stroke="#3A1D0B" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rigging Ropes */}
          <line x1="68" y1="6" x2="10" y2="58" stroke="#D4A769" strokeWidth="1" opacity="0.75" />
          <line x1="68" y1="6" x2="120" y2="52" stroke="#D4A769" strokeWidth="1" opacity="0.75" />

          {/* Triangular Cream Lateen Sail */}
          <polygon
            points="68,5 125,44 68,44"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            opacity="0.92"
          />
          {/* Sail Folds */}
          <line x1="68" y1="5" x2="95" y2="44" stroke="#CBD5E1" strokeWidth="1" />

          {/* Qatari Maroon Pennant at masthead */}
          <polygon points="68,2 60,5 68,8" fill="#8A1538" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. PEARLING GEAR: OYSTERS, NETS, PEARLS & WEIGHTS    */}
        {/* ---------------------------------------------------- */}
        <g id="fishing-nets" transform="translate(65, 140)">
          <path
            d="M 5 25 Q 25 10 50 25 Q 40 40 10 38 Z"
            fill="#0F766E"
            opacity="0.35"
          />
          <path d="M 10 24 L 40 34 M 15 20 L 45 30 M 18 36 L 38 18 M 28 38 L 46 22" stroke="#0F766E" strokeWidth="1" />
        </g>

        {/* Basket of Pearl Oysters with Glistening Pearl */}
        <g id="pearl-oysters" transform="translate(70, 160)">
          <ellipse cx="22" cy="22" rx="16" ry="10" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
          <ellipse cx="14" cy="20" rx="6" ry="4" fill="#64748B" stroke="#334155" />
          <ellipse cx="26" cy="19" rx="7" ry="4.5" fill="#475569" stroke="#1E293B" />
          <circle cx="20" cy="17" r="4.5" fill="url(#pearlShine)" stroke="#CBD5E1" strokeWidth="0.8" className="animate-pulse" />
          <circle cx="18.5" cy="15.5" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Diver's Gear: Stone Weight & Nose Clip */}
        <g id="diver-tools" transform="translate(250, 150)">
          <polygon points="12,18 20,24 16,34 6,32" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
          <path d="M 14 18 Q 18 8 26 12" stroke="#D4A769" strokeWidth="1.8" fill="none" />
          <path d="M 32 25 Q 36 21 34 29" stroke="#EAB308" strokeWidth="2.5" fill="none" />
          <ellipse cx="45" cy="26" rx="9" ry="7" fill="#854D0E" stroke="#3A1A05" strokeWidth="1" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* CARVED WOODEN SIGNPOST: «بحر اللؤلؤ»                */}
        {/* ---------------------------------------------------- */}
        <g id="pearl-sign" transform="translate(135, 172)">
          <rect x="41" y="14" width="6" height="24" rx="1" fill="#3D1F0C" stroke="#1A0A02" strokeWidth="1" />
          <rect x="0" y="0" width="88" height="22" rx="4" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.8" />
          <text x="44" y="15" textAnchor="middle" fill="#F0F9FF" fontSize="11" fontWeight="900" fontFamily="Amiri, serif">
            بحر اللؤلؤ
          </text>
        </g>
      </svg>

      {/* Visited Stamp Badge */}
      {isStamped && (
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-[#0284C7] border-2 border-[#FFE082] flex items-center justify-center text-white shadow-lg z-20">
          <Award className="w-4 h-4 text-[#FFE082]" />
        </div>
      )}

      {/* Interactive Pier Glow on proximity */}
      {isNearby && (
        <div className="absolute left-[50%] bottom-[12%] -translate-x-1/2 w-16 h-12 rounded-full bg-[#38BDF8]/30 blur-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
