import React from 'react';
import { QatariDallahVisual, DallahStyle } from './QatariDallahVisual';

interface HeritageItemVisualProps {
  itemId: string;
  className?: string;
  size?: number;
  dallahStyle?: DallahStyle;
}

export function HeritageItemVisual({
  itemId,
  className = '',
  size = 280,
  dallahStyle = 'qatari_gold',
}: HeritageItemVisualProps) {
  // If it's the dallah, render our specialized high-detail Dallah component
  if (itemId === 'dallah') {
    return (
      <QatariDallahVisual
        styleType={dallahStyle}
        size={size}
        className={className}
        showSteam={true}
        showFinjan={true}
      />
    );
  }

  const renderItemSvg = () => {
    switch (itemId) {
      /* ============================================================
         1. POTTERY SHOP
      ============================================================ */
      case 'jar': // الجَرّة الفخارية لحفظ الماء
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jar-clay" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7A3617" />
                <stop offset="25%" stopColor="#D27441" />
                <stop offset="55%" stopColor="#B35526" />
                <stop offset="85%" stopColor="#7A3617" />
                <stop offset="100%" stopColor="#4A1E0B" />
              </linearGradient>
              <radialGradient id="jar-glow" cx="35%" cy="38%" r="55%">
                <stop offset="0%" stopColor="#F5A071" stopOpacity="0.75" />
                <stop offset="40%" stopColor="#B35526" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#4A1E0B" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="clay-trim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E68F5E" />
                <stop offset="100%" stopColor="#5E250E" />
              </linearGradient>
            </defs>

            {/* Pedestal Ground Shadow */}
            <ellipse cx="150" cy="296" rx="65" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Left Handle */}
            <path
              d="M 106 130 C 62 135 62 195 108 200 L 110 188 C 78 185 78 145 106 142 Z"
              fill="url(#clay-trim)"
              stroke="#4A1E0B"
              strokeWidth="1.6"
            />
            {/* Right Handle */}
            <path
              d="M 194 130 C 238 135 238 195 192 200 L 190 188 C 222 185 222 145 194 142 Z"
              fill="url(#clay-trim)"
              stroke="#4A1E0B"
              strokeWidth="1.6"
            />

            {/* Main Jar Belly & Neck */}
            <path
              d="M 132 85 
                 C 132 75 168 75 168 85 
                 L 166 120 
                 C 215 140 220 230 184 270 
                 L 116 270 
                 C 80 230 85 140 134 120 Z"
              fill="url(#jar-clay)"
              stroke="#4A1E0B"
              strokeWidth="2"
            />
            {/* Belly Shading Highlight */}
            <path
              d="M 134 120 C 215 140 220 230 184 270 L 116 270 C 80 230 85 140 134 120 Z"
              fill="url(#jar-glow)"
              pointerEvents="none"
            />

            {/* Circular Flared Base */}
            <path d="M 112 270 L 188 270 L 194 286 L 106 286 Z" fill="url(#clay-trim)" stroke="#4A1E0B" strokeWidth="1.8" />
            <ellipse cx="150" cy="286" rx="44" ry="4" fill="#381507" />

            {/* Decorative Engraved Bands on Belly */}
            <path d="M 102 180 Q 150 196 198 180" stroke="#FFE3D1" strokeWidth="1.5" strokeDasharray="5,4" fill="none" opacity="0.6" />
            <path d="M 96 195 Q 150 215 204 195" stroke="#FFE3D1" strokeWidth="2" fill="none" opacity="0.75" />
            {/* Traditional Chevron / Zigzag Motif */}
            <path
              d="M 100 195 L 108 206 L 116 195 L 124 206 L 132 195 L 140 206 L 148 195 L 156 206 L 164 195 L 172 206 L 180 195 L 188 206 L 196 195 L 202 206"
              stroke="#501F0A"
              strokeWidth="1.8"
              fill="none"
            />
            <path d="M 98 212 Q 150 230 202 212" stroke="#501F0A" strokeWidth="2" fill="none" />

            {/* Neck Rim & Mouth */}
            <ellipse cx="150" cy="85" rx="20" ry="7" fill="url(#clay-trim)" stroke="#4A1E0B" strokeWidth="1.8" />
            <ellipse cx="150" cy="83" rx="14" ry="4.5" fill="#2E1206" />
            {/* Water coolness glow / highlights */}
            <path d="M 136 95 Q 142 160 138 245" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" fill="none" />
            {/* Water Drops symbolizing porous clay cooling */}
            <circle cx="120" cy="215" r="2" fill="#7DD3FC" opacity="0.85" />
            <circle cx="178" cy="235" r="2.5" fill="#7DD3FC" opacity="0.85" />
          </svg>
        );

      case 'pot': // القدر الفخاري / البرمة
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pot-clay" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#57220B" />
                <stop offset="22%" stopColor="#C46032" />
                <stop offset="55%" stopColor="#9C441A" />
                <stop offset="85%" stopColor="#57220B" />
                <stop offset="100%" stopColor="#301104" />
              </linearGradient>
              <radialGradient id="pot-glow" cx="42%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#FFA070" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#9C441A" stopOpacity="0.2" />
                <stop offset="90%" stopColor="#301104" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="150" cy="290" rx="75" ry="14" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Sturdy Loop Handles */}
            <path d="M 68 180 C 52 180 52 220 72 225 L 75 212 C 64 208 64 192 73 190 Z" fill="#9C441A" stroke="#301104" strokeWidth="1.8" />
            <path d="M 232 180 C 248 180 248 220 228 225 L 225 212 C 236 208 236 192 227 190 Z" fill="#9C441A" stroke="#301104" strokeWidth="1.8" />

            {/* Pot Belly */}
            <path
              d="M 86 160 
                 C 65 195 68 255 110 278 
                 L 190 278 
                 C 232 255 235 195 214 160 Z"
              fill="url(#pot-clay)"
              stroke="#301104"
              strokeWidth="2"
            />
            {/* 3D Glow */}
            <path
              d="M 86 160 C 65 195 68 255 110 278 L 190 278 C 232 255 235 195 214 160 Z"
              fill="url(#pot-glow)"
              pointerEvents="none"
            />

            {/* Base */}
            <ellipse cx="150" cy="278" rx="42" ry="6" fill="#3B1808" />

            {/* Traditional Neck Rim */}
            <ellipse cx="150" cy="160" rx="66" ry="12" fill="#8C3A14" stroke="#301104" strokeWidth="2" />
            <ellipse cx="150" cy="158" rx="58" ry="9" fill="#2E1206" />

            {/* Domed Fitted Clay Lid */}
            <path
              d="M 94 156 C 96 115 204 115 206 156 Z"
              fill="url(#pot-clay)"
              stroke="#301104"
              strokeWidth="1.8"
            />
            <ellipse cx="150" cy="156" rx="56" ry="7" fill="#C46032" stroke="#301104" strokeWidth="1" />

            {/* Lid Round Knob Handle */}
            <ellipse cx="150" cy="116" rx="14" ry="6" fill="#8C3A14" stroke="#301104" strokeWidth="1.6" />
            <circle cx="150" cy="108" r="8" fill="#C46032" stroke="#301104" strokeWidth="1.6" />
            <circle cx="148" cy="106" r="2.5" fill="#FFA070" />

            {/* Traditional Incised Bands */}
            <path d="M 88 190 Q 150 208 212 190" stroke="#FFE3D1" strokeWidth="1.5" opacity="0.6" fill="none" />
            <path d="M 85 204 Q 150 224 215 204" stroke="#FFE3D1" strokeWidth="2" opacity="0.75" fill="none" />
            <path d="M 90 225 Q 150 245 210 225" stroke="#3B1808" strokeWidth="2" fill="none" />

            {/* Steam coming from the pot */}
            <path d="M 135 95 Q 130 70 142 50 Q 154 30 140 10" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.45" fill="none" className="animate-pulse" />
            <path d="M 160 90 Q 170 68 158 48 Q 146 28 162 8" stroke="#FFE3D1" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" fill="none" />
          </svg>
        );

      /* ============================================================
         2. SPICES SHOP (العطار)
      ============================================================ */
      case 'cardamom': // الهيل الأخضر في وعاء نحاسي
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brass-bowl" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#784E07" />
                <stop offset="30%" stopColor="#F5BE38" />
                <stop offset="60%" stopColor="#B88214" />
                <stop offset="100%" stopColor="#452702" />
              </linearGradient>
              <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C2E28F" />
                <stop offset="45%" stopColor="#6C9E36" />
                <stop offset="100%" stopColor="#305014" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="70" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Brass Bowl Bottom Base */}
            <ellipse cx="150" cy="275" rx="42" ry="7" fill="#503303" />
            <path d="M 108 275 L 122 250 L 178 250 L 192 275 Z" fill="url(#brass-bowl)" stroke="#452702" strokeWidth="1.5" />

            {/* Brass Bowl Body */}
            <path d="M 65 175 C 65 240 100 255 150 255 C 200 255 235 240 235 175 Z" fill="url(#brass-bowl)" stroke="#452702" strokeWidth="2" />
            <ellipse cx="150" cy="175" rx="85" ry="16" fill="#D97706" stroke="#452702" strokeWidth="1.8" />
            <ellipse cx="150" cy="173" rx="78" ry="13" fill="#451A03" />

            {/* Traditional Engraved Band on Bowl */}
            <path d="M 75 195 Q 150 220 225 195" stroke="#FFEBA3" strokeWidth="2" strokeDasharray="4,3" fill="none" />
            <path d="M 85 212 Q 150 235 215 212" stroke="#784E07" strokeWidth="1.8" fill="none" />

            {/* Mound of Cardamom Pods (الهيل الأخضر الفاخر) */}
            <ellipse cx="150" cy="165" rx="68" ry="22" fill="#4B6E25" />

            {/* Pod 1 */}
            <g transform="translate(130, 120) rotate(-25)">
              <path d="M 0 0 C 15 -18 35 -18 50 0 C 35 18 15 18 0 0 Z" fill="url(#card-grad)" stroke="#22380E" strokeWidth="1.2" />
              <path d="M 0 0 Q 25 -4 50 0" stroke="#E3F8AB" strokeWidth="1.2" fill="none" />
              <path d="M 50 0 L 58 0" stroke="#84A747" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Pod 2 */}
            <g transform="translate(175, 125) rotate(35)">
              <path d="M 0 0 C 14 -16 32 -16 46 0 C 32 16 14 16 0 0 Z" fill="url(#card-grad)" stroke="#22380E" strokeWidth="1.2" />
              <path d="M 0 0 Q 23 -3 46 0" stroke="#E3F8AB" strokeWidth="1.2" fill="none" />
              <path d="M 46 0 L 53 0" stroke="#84A747" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Pod 3 (Center Hero) */}
            <g transform="translate(152, 98) rotate(70)">
              <path d="M 0 0 C 18 -20 40 -20 56 0 C 40 20 18 20 0 0 Z" fill="url(#card-grad)" stroke="#22380E" strokeWidth="1.4" />
              <path d="M 0 0 Q 28 -5 56 0" stroke="#E3F8AB" strokeWidth="1.5" fill="none" />
              <path d="M 12 -8 Q 28 -12 44 -8" stroke="#E3F8AB" strokeWidth="0.8" fill="none" opacity="0.7" />
              <path d="M 12 8 Q 28 12 44 8" stroke="#22380E" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path d="M 56 0 L 65 0" stroke="#9FD356" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Pod 4 (Foreground spilling) */}
            <g transform="translate(105, 148) rotate(-10)">
              <path d="M 0 0 C 12 -14 28 -14 40 0 C 28 14 12 14 0 0 Z" fill="url(#card-grad)" stroke="#22380E" strokeWidth="1.2" />
              <path d="M 0 0 Q 20 -2 40 0" stroke="#E3F8AB" strokeWidth="1" fill="none" />
            </g>
            {/* Pod 5 */}
            <g transform="translate(155, 152) rotate(15)">
              <path d="M 0 0 C 13 -15 30 -15 42 0 C 30 15 13 15 0 0 Z" fill="url(#card-grad)" stroke="#22380E" strokeWidth="1.2" />
              <path d="M 0 0 Q 21 -3 42 0" stroke="#E3F8AB" strokeWidth="1" fill="none" />
            </g>

            {/* Aromatic steam & stars */}
            <path d="M 148 85 Q 140 60 152 40 Q 164 20 150 5" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none" className="animate-pulse" />
            <circle cx="160" cy="48" r="1.5" fill="#FFE082" />
            <circle cx="138" cy="62" r="1.2" fill="#FFE082" />
          </svg>
        );

      case 'saffron': // الزعفران الملكي في علبة زجاجية/نحاسية مع الهاون
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gold-mortar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#784E07" />
                <stop offset="25%" stopColor="#F5BE38" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="90%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="72" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Brass Mortar Base */}
            <ellipse cx="140" cy="275" rx="55" ry="8" fill="#451A03" />
            <path d="M 90 270 L 102 240 L 178 240 L 190 270 Z" fill="url(#gold-mortar)" stroke="#451A03" strokeWidth="1.8" />

            {/* Mortar Body */}
            <path d="M 75 160 C 80 235 105 242 140 242 C 175 242 200 235 205 160 Z" fill="url(#gold-mortar)" stroke="#451A03" strokeWidth="2" />
            <ellipse cx="140" cy="160" rx="65" ry="15" fill="#F59E0B" stroke="#451A03" strokeWidth="1.8" />
            <ellipse cx="140" cy="158" rx="57" ry="12" fill="#7C2D12" />

            {/* Engravings on Mortar */}
            <path d="M 85 185 Q 140 205 195 185" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="3,3" fill="none" />
            <path d="M 95 202 Q 140 220 185 202" stroke="#451A03" strokeWidth="1.5" fill="none" />

            {/* Brass Pestle (المدقة المائلة) */}
            <g transform="translate(165, 90) rotate(28)">
              <rect x="-8" y="0" width="16" height="120" rx="8" fill="url(#gold-mortar)" stroke="#451A03" strokeWidth="1.6" />
              <ellipse cx="0" cy="12" rx="12" ry="5" fill="#FEF08A" />
              <circle cx="0" cy="115" r="10" fill="url(#gold-mortar)" stroke="#451A03" strokeWidth="1.6" />
            </g>

            {/* Rich Ruby Red Saffron Threads spilling */}
            <path d="M 105 160 C 115 142 165 142 175 160 C 160 172 120 172 105 160 Z" fill="#991B1B" />
            {/* Saffron Stigmas (خيوط الزعفران القرمزية المنتهية بانتفاخ ثلاثي) */}
            <path d="M 125 155 Q 115 125 105 105 Q 102 98 108 95" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 132 152 Q 128 118 122 92 Q 120 85 126 82" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 140 150 Q 140 110 138 80 Q 138 72 144 70" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 148 152 Q 155 115 158 86 Q 160 78 166 77" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 155 155 Q 168 126 178 102 Q 182 95 188 95" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            {/* Saffron trumpet tips */}
            <circle cx="108" cy="95" r="2.5" fill="#EF4444" />
            <circle cx="126" cy="82" r="2.8" fill="#F87171" />
            <circle cx="144" cy="70" r="3" fill="#EF4444" />
            <circle cx="166" cy="77" r="2.8" fill="#F87171" />
            <circle cx="188" cy="95" r="2.5" fill="#EF4444" />

            {/* Golden Saffron Dust Particles */}
            <circle cx="130" cy="145" r="1.5" fill="#FBBF24" />
            <circle cx="148" cy="142" r="2" fill="#FDE047" />
            <circle cx="160" cy="148" r="1.5" fill="#FBBF24" />
            <circle cx="138" cy="62" r="1.5" fill="#FDE047" className="animate-pulse" />
          </svg>
        );

      case 'cinnamon': // القرفة (أعواد دارسين خشبية ملفوفة بحبل خيش)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bark-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#431D0B" />
                <stop offset="35%" stopColor="#8C441D" />
                <stop offset="70%" stopColor="#B45F2F" />
                <stop offset="100%" stopColor="#351406" />
              </linearGradient>
              <linearGradient id="bark-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#351406" />
                <stop offset="40%" stopColor="#9C4C22" />
                <stop offset="100%" stopColor="#2E1003" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="65" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Cinnamon Stick 1 (Left slant) */}
            <g transform="translate(100, 60) rotate(-15)">
              <rect x="0" y="20" width="34" height="200" rx="10" fill="url(#bark-1)" stroke="#2E1003" strokeWidth="1.8" />
              {/* Hollow Scroll curled top */}
              <ellipse cx="17" cy="20" rx="17" ry="8" fill="#5A2810" stroke="#2E1003" strokeWidth="1.8" />
              <ellipse cx="17" cy="20" rx="10" ry="4.5" fill="#240B02" />
              <path d="M 7 20 C 7 16 27 16 27 20" stroke="#C67D5A" strokeWidth="1.2" fill="none" />
              {/* Bark wood grain ridges */}
              <path d="M 8 35 L 8 200" stroke="#240B02" strokeWidth="1.4" opacity="0.7" />
              <path d="M 18 30 L 18 210" stroke="#D98A64" strokeWidth="1.5" opacity="0.6" />
              <path d="M 28 35 L 28 195" stroke="#240B02" strokeWidth="1.4" opacity="0.7" />
            </g>

            {/* Cinnamon Stick 2 (Right slant) */}
            <g transform="translate(170, 55) rotate(18)">
              <rect x="0" y="20" width="32" height="205" rx="9" fill="url(#bark-2)" stroke="#2E1003" strokeWidth="1.8" />
              <ellipse cx="16" cy="20" rx="16" ry="7.5" fill="#5A2810" stroke="#2E1003" strokeWidth="1.8" />
              <ellipse cx="16" cy="20" rx="9" ry="4" fill="#240B02" />
              <path d="M 16 28 L 16 215" stroke="#D98A64" strokeWidth="1.5" opacity="0.6" />
            </g>

            {/* Cinnamon Stick 3 (Center Foreground Hero) */}
            <g transform="translate(133, 50)">
              <rect x="0" y="20" width="36" height="215" rx="10" fill="url(#bark-1)" stroke="#2E1003" strokeWidth="2" />
              <ellipse cx="18" cy="20" rx="18" ry="8.5" fill="#6B3014" stroke="#2E1003" strokeWidth="2" />
              <ellipse cx="18" cy="20" rx="11" ry="5" fill="#240B02" />
              <path d="M 9 20 C 9 15 27 15 27 20" stroke="#FFA77B" strokeWidth="1.5" fill="none" />
              <path d="M 10 35 L 10 225" stroke="#240B02" strokeWidth="1.6" opacity="0.8" />
              <path d="M 20 30 L 20 230" stroke="#FFA77B" strokeWidth="2" opacity="0.75" />
              <path d="M 28 35 L 28 220" stroke="#240B02" strokeWidth="1.6" opacity="0.8" />
            </g>

            {/* Natural Jute Rope Binding (حبل الخيش التراثي العريض) */}
            <g id="rope-tie" transform="translate(90, 150)">
              {/* Rope Shadow */}
              <rect x="0" y="2" width="120" height="28" rx="6" fill="#000" opacity="0.35" />
              {/* Rope strand 1 */}
              <rect x="0" y="0" width="120" height="9" rx="4" fill="#D4A373" stroke="#78350F" strokeWidth="1.4" />
              <path d="M 10 0 L 15 9 M 25 0 L 30 9 M 40 0 L 45 9 M 55 0 L 60 9 M 70 0 L 75 9 M 85 0 L 90 9 M 100 0 L 105 9" stroke="#78350F" strokeWidth="1.2" />
              {/* Rope strand 2 */}
              <rect x="0" y="9" width="120" height="9" rx="4" fill="#E9C46A" stroke="#78350F" strokeWidth="1.4" />
              <path d="M 5 9 L 10 18 M 20 9 L 25 18 M 35 9 L 40 18 M 50 9 L 55 18 M 65 9 L 70 18 M 80 9 L 85 18 M 95 9 L 100 18" stroke="#78350F" strokeWidth="1.2" />
              {/* Rope strand 3 */}
              <rect x="0" y="18" width="120" height="9" rx="4" fill="#D4A373" stroke="#78350F" strokeWidth="1.4" />
              <path d="M 10 18 L 15 27 M 25 18 L 30 27 M 40 18 L 45 27 M 55 18 L 60 27 M 70 18 L 75 27 M 85 18 L 90 27 M 100 18 L 105 27" stroke="#78350F" strokeWidth="1.2" />

              {/* Rope Knot & Loose Tassel */}
              <circle cx="60" cy="14" r="9" fill="#E9C46A" stroke="#78350F" strokeWidth="1.6" />
              <circle cx="60" cy="14" r="4" fill="#92400E" />
              <path d="M 58 22 C 55 35 48 45 42 55" stroke="#D4A373" strokeWidth="4" strokeLinecap="round" />
              <path d="M 64 22 C 67 36 72 46 76 58" stroke="#D4A373" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Cinnamon Shavings & Scent */}
            <ellipse cx="140" cy="272" rx="14" ry="4" fill="#8C441D" />
            <ellipse cx="168" cy="275" rx="10" ry="3" fill="#B45F2F" />
            <circle cx="152" cy="38" r="1.5" fill="#FFE082" className="animate-pulse" />
          </svg>
        );

      case 'clove': // القرنفل (المسمار / العويدي في صحفة نحاسية)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="clove-stem" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B1705" />
                <stop offset="40%" stopColor="#78350F" />
                <stop offset="100%" stopColor="#240B02" />
              </linearGradient>
              <linearGradient id="tray-brass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="75" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Brass Plate/Saucer */}
            <ellipse cx="150" cy="265" rx="82" ry="20" fill="url(#tray-brass)" stroke="#451A03" strokeWidth="2" />
            <ellipse cx="150" cy="263" rx="74" ry="16" fill="#92400E" stroke="#451A03" strokeWidth="1.2" />
            <ellipse cx="150" cy="260" rx="66" ry="13" fill="#451A03" />

            {/* Giant High-Detail Hero Clove (حبة القرنفل العملاقة المتقنة) */}
            <g transform="translate(150, 160) rotate(-35)">
              {/* Woody Stem (عصا المسمار) */}
              <path d="M -12 15 L 12 15 L 8 110 L -8 110 Z" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="2" />
              <path d="M 0 16 L 0 108" stroke="#B45309" strokeWidth="2" opacity="0.7" />

              {/* 4 Sepal Calyx Crown (تيجان القرنفل التراثية الرباعية) */}
              <path d="M -12 15 Q -25 0 -30 -10 Q -18 -8 -10 5 Z" fill="#78350F" stroke="#240B02" strokeWidth="1.6" />
              <path d="M 12 15 Q 25 0 30 -10 Q 18 -8 10 5 Z" fill="#78350F" stroke="#240B02" strokeWidth="1.6" />
              <path d="M -7 16 Q -10 -5 -12 -16 Q -2 -10 -4 8 Z" fill="#92400E" stroke="#240B02" strokeWidth="1.4" />
              <path d="M 7 16 Q 10 -5 12 -16 Q 2 -10 4 8 Z" fill="#B45309" stroke="#240B02" strokeWidth="1.4" />

              {/* Central Bud Sphere (رأس / برعم القرنفل المستدير الغني بالزيوت) */}
              <circle cx="0" cy="-6" r="17" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="2" />
              <ellipse cx="-4" cy="-10" rx="6" ry="4" fill="#D97706" opacity="0.8" />
              <circle cx="-5" cy="-11" r="2" fill="#FEF3C7" />
            </g>

            {/* Second Clove lying on tray */}
            <g transform="translate(125, 220) rotate(50)">
              <path d="M -7 10 L 7 10 L 5 65 L -5 65 Z" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="1.4" />
              <circle cx="0" cy="-3" r="10" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="1.4" />
              <path d="M -7 8 Q -16 -2 -20 -8 Q -12 -6 -6 2 Z" fill="#78350F" stroke="#240B02" strokeWidth="1" />
              <path d="M 7 8 Q 16 -2 20 -8 Q 12 -6 6 2 Z" fill="#78350F" stroke="#240B02" strokeWidth="1" />
            </g>

            {/* Third Clove on right */}
            <g transform="translate(195, 235) rotate(-65)">
              <path d="M -6 8 L 6 8 L 4 55 L -4 55 Z" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="1.2" />
              <circle cx="0" cy="-2" r="8" fill="url(#clove-stem)" stroke="#240B02" strokeWidth="1.2" />
            </g>

            {/* Aromatic steam swirls */}
            <path d="M 125 100 Q 115 70 128 45 Q 140 20 125 0" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" fill="none" className="animate-pulse" />
          </svg>
        );

      /* ============================================================
         3. FABRICS & WEAVING SHOP (الأقمشة والسلال والخوص)
      ============================================================ */
      case 'basket': // السلة الخوص (المخرافة القطرية المجدولة)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="basket-straw" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#784E07" />
                <stop offset="25%" stopColor="#E4D4B8" />
                <stop offset="60%" stopColor="#C7AB7A" />
                <stop offset="100%" stopColor="#5B3805" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="72" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Tall Arched Woven Handle (مقبض السلة المقوس المتين) */}
            <path
              d="M 85 170 C 85 50 215 50 215 170 L 203 170 C 203 64 97 64 97 170 Z"
              fill="#C7AB7A"
              stroke="#5B3805"
              strokeWidth="2"
            />
            {/* Spiral cord wrap on handle */}
            <path d="M 90 140 L 98 145 M 95 110 L 104 116 M 110 85 L 120 90 M 140 68 L 148 74 M 170 78 L 178 84 M 192 105 L 200 112 M 200 140 L 208 146" stroke="#8A1538" strokeWidth="2.5" strokeLinecap="round" />

            {/* Basket Body (جرم السلة البيضاوي من سعف النخيل) */}
            <path
              d="M 60 170 
                 C 60 255 100 278 150 278 
                 C 200 278 240 255 240 170 Z"
              fill="url(#basket-straw)"
              stroke="#5B3805"
              strokeWidth="2.2"
            />
            {/* Basket Rim */}
            <ellipse cx="150" cy="170" rx="90" ry="18" fill="#E4D4B8" stroke="#5B3805" strokeWidth="2" />
            <ellipse cx="150" cy="168" rx="82" ry="14" fill="#3D2403" />

            {/* Coiled Woven Rings (الضفائر الحلزونية الدائرية لسعف النخل) */}
            <path d="M 68 190 Q 150 218 232 190" stroke="#8A1538" strokeWidth="4" strokeDasharray="6,4" fill="none" />
            <path d="M 75 210 Q 150 238 225 210" stroke="#3F6212" strokeWidth="3.5" strokeDasharray="6,4" fill="none" />
            <path d="M 85 230 Q 150 255 215 230" stroke="#8A1538" strokeWidth="4" strokeDasharray="6,4" fill="none" />
            <path d="M 100 250 Q 150 270 200 250" stroke="#3F6212" strokeWidth="3" strokeDasharray="5,4" fill="none" />

            {/* Natural straw cross-stitches */}
            <path d="M 72 175 Q 150 200 228 175" stroke="#FFF7ED" strokeWidth="2" strokeDasharray="3,3" fill="none" />
            <path d="M 70 200 Q 150 228 230 200" stroke="#FFF7ED" strokeWidth="1.5" strokeDasharray="4,4" fill="none" opacity="0.8" />
          </svg>
        );

      case 'palm': // الخوص / المهفة القطرية (مروحة اليد من سعف النخيل الملون)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="palm-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#E4D4B8" />
                <stop offset="70%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#713F12" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="290" rx="55" ry="10" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Bamboo / Palm Midrib Handle (عصا المهفة المتينة) */}
            <path d="M 144 140 L 142 295 L 158 295 L 156 140 Z" fill="#D4A373" stroke="#5B3805" strokeWidth="2" />
            <path d="M 146 160 L 154 160 M 145 200 L 155 200 M 144 240 L 156 240 M 143 280 L 157 280" stroke="#78350F" strokeWidth="2" />

            {/* Hand-fan Woven Palm Blade (شراع المهفة المنسوج الملون) */}
            <g transform="translate(150, 110) rotate(-15)">
              {/* Outer Trapezoid Palm Frond Weave */}
              <path
                d="M -75 -85 L 75 -85 L 60 55 L -60 55 Z"
                fill="url(#palm-leaf)"
                stroke="#5B3805"
                strokeWidth="2.5"
              />

              {/* Authentic Dyed Frond Bands (عنابي قطري وأخضر نخل وخوص طبيعي) */}
              {/* Top Maroon Band */}
              <path d="M -75 -65 L 75 -65 L 72 -45 L -72 -45 Z" fill="#8A1538" stroke="#4C0519" strokeWidth="1" />
              {/* Middle Green Band */}
              <path d="M -68 -25 L 68 -25 L 65 -5 L -65 -5 Z" fill="#365314" stroke="#1A2E05" strokeWidth="1" />
              {/* Lower Maroon Band */}
              <path d="M -64 15 L 64 15 L 62 35 L -62 35 Z" fill="#8A1538" stroke="#4C0519" strokeWidth="1" />

              {/* Diamond & Chevron Weave Hatch Lines (سف الخوص المتقن) */}
              <path d="M -70 -85 L -50 55 M -50 -85 L -30 55 M -30 -85 L -10 55 M -10 -85 L 10 55 M 10 -85 L 30 55 M 30 -85 L 50 55 M 50 -85 L 70 55" stroke="#713F12" strokeWidth="1.2" opacity="0.6" />
              <path d="M 70 -85 L 50 55 M 50 -85 L 30 55 M 30 -85 L 10 55 M 10 -85 L -10 55 M -10 -85 L -30 55 M -30 -85 L -50 55 M -50 -85 L -70 55" stroke="#713F12" strokeWidth="1.2" opacity="0.6" />

              {/* Palm Frond Fringe Top Trim (شراشيب وسعف القمة) */}
              <path d="M -75 -85 C -65 -98 -55 -85 -45 -98 C -35 -85 -25 -98 -15 -85 C -5 -98 5 -85 15 -98 C 25 -85 35 -98 45 -85 C 55 -98 65 -85 75 -98" stroke="#E4D4B8" strokeWidth="2.5" fill="none" />
            </g>

            {/* Decorative hanging tassel */}
            <circle cx="150" cy="295" r="5" fill="#8A1538" />
            <path d="M 150 298 L 150 315" stroke="#FFE082" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'fabric': // الأقمشة (طاقة قماش حريري عنابي مع تطريز الزري الذهبي)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="maroon-silk" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A081A" />
                <stop offset="30%" stopColor="#8A1538" />
                <stop offset="65%" stopColor="#B3204D" />
                <stop offset="100%" stopColor="#3B0514" />
              </linearGradient>
              <linearGradient id="gold-zari" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="50%" stopColor="#F5BE38" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="78" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Draped Bolt of Silk Fabric (طاقة القماش الفاخر المنسدل) */}
            <path
              d="M 65 140 
                 C 65 110 235 110 235 140 
                 L 230 260 
                 C 230 280 70 280 70 260 Z"
              fill="url(#maroon-silk)"
              stroke="#3B0514"
              strokeWidth="2"
            />
            {/* Cylinder Top Rim */}
            <ellipse cx="150" cy="140" rx="85" ry="20" fill="#B3204D" stroke="#3B0514" strokeWidth="2" />
            <ellipse cx="150" cy="138" rx="75" ry="15" fill="#580C21" />

            {/* Flowing Silk Ripple Folds */}
            <path d="M 115 155 C 110 200 112 245 110 270" stroke="#FFF" strokeWidth="2.5" opacity="0.3" fill="none" />
            <path d="M 155 158 C 158 205 154 248 160 272" stroke="#FFF" strokeWidth="3" opacity="0.35" fill="none" />
            <path d="M 195 155 C 190 200 192 245 190 268" stroke="#3B0514" strokeWidth="2.5" opacity="0.6" fill="none" />

            {/* Elaborate Qatari "Zari" Gold Border Embroidery (تطريز الزري الذهبي التراثي) */}
            <g id="zari-embroidery">
              <path d="M 68 220 Q 150 240 232 220" stroke="url(#gold-zari)" strokeWidth="3.5" fill="none" />
              <path d="M 69 240 Q 150 260 231 240" stroke="url(#gold-zari)" strokeWidth="3.5" fill="none" />

              {/* Intricate Gold Arabesque Flowers along the hem */}
              <circle cx="95" cy="233" r="4.5" fill="url(#gold-zari)" />
              <circle cx="125" cy="239" r="5" fill="url(#gold-zari)" />
              <circle cx="155" cy="242" r="5.5" fill="url(#gold-zari)" />
              <circle cx="185" cy="239" r="5" fill="url(#gold-zari)" />
              <circle cx="210" cy="233" r="4.5" fill="url(#gold-zari)" />

              {/* Star sparkles on the gold embroidery */}
              <circle cx="155" cy="242" r="1.8" fill="#FFF" className="animate-pulse" />
              <circle cx="125" cy="239" r="1.5" fill="#FFF" />
            </g>

            {/* Vintage Golden Scissors & Needle with Gold Thread */}
            <g transform="translate(195, 100) rotate(35)">
              <line x1="0" y1="0" x2="0" y2="70" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="0" cy="4" rx="2" ry="5" fill="none" stroke="#FDE047" strokeWidth="1.5" />
              {/* Thread looping */}
              <path d="M 0 5 Q -25 20 -15 45 Q -5 70 -35 85" stroke="#FBBF24" strokeWidth="1.8" fill="none" />
            </g>
          </svg>
        );

      /* ============================================================
         4. ANTIQUES SHOP (الأدوات القديمة)
      ============================================================ */
      case 'scale': // ميزان اللؤلؤ والتجار التراثي ذو الكفتين
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brass-scale" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#784E07" />
                <stop offset="30%" stopColor="#F5BE38" />
                <stop offset="70%" stopColor="#B88214" />
                <stop offset="100%" stopColor="#452702" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="290" rx="65" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Heavy Stepped Base */}
            <path d="M 115 285 L 185 285 L 175 265 L 125 265 Z" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.8" />
            <ellipse cx="150" cy="265" rx="25" ry="4" fill="#FDE047" />

            {/* Central Pillar Column (عمود الميزان النحاسي الشامخ) */}
            <rect x="144" y="65" width="12" height="200" rx="3" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.8" />
            <circle cx="150" cy="120" r="10" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.5" />
            <circle cx="150" cy="180" r="9" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.5" />

            {/* Pillar Top Finial & Fulcrum Ring */}
            <circle cx="150" cy="65" r="8" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.5" />
            <circle cx="150" cy="48" r="6" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.4" />

            {/* Horizontal Fulcrum Balance Beam (عارضة الميزان الأفقية) */}
            <g transform="translate(150, 65) rotate(-6)">
              <rect x="-105" y="-5" width="210" height="10" rx="4" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="6" fill="#FDE047" stroke="#452702" strokeWidth="1.2" />

              {/* Beam End Rings */}
              <circle cx="-100" cy="0" r="5" fill="none" stroke="#452702" strokeWidth="2" />
              <circle cx="100" cy="0" r="5" fill="none" stroke="#452702" strokeWidth="2" />

              {/* Left Pan Chains & Pan */}
              <g transform="translate(-100, 0)">
                <line x1="0" y1="5" x2="-28" y2="85" stroke="#D97706" strokeWidth="1.4" strokeDasharray="3,2" />
                <line x1="0" y1="5" x2="28" y2="85" stroke="#D97706" strokeWidth="1.4" strokeDasharray="3,2" />
                <line x1="0" y1="5" x2="0" y2="85" stroke="#B45309" strokeWidth="1.2" strokeDasharray="3,2" />
                {/* Curved Brass Weighing Pan */}
                <path d="M -35 85 Q 0 115 35 85 Z" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.8" />
                <ellipse cx="0" cy="85" rx="35" ry="6" fill="#FDE68A" stroke="#452702" strokeWidth="1.2" />
                {/* Natural Lustrous Sea Pearls (لآلئ قطر الطبيعية في الكفة) */}
                <circle cx="-8" cy="83" r="4.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                <circle cx="-9" cy="82" r="1.5" fill="#FFFFFF" />
                <circle cx="5" cy="84" r="5" fill="#FFFBEB" stroke="#CBD5E1" strokeWidth="0.8" />
                <circle cx="4" cy="83" r="1.5" fill="#FFFFFF" />
                <circle cx="-1" cy="80" r="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
              </g>

              {/* Right Pan Chains & Pan */}
              <g transform="translate(100, 0)">
                <line x1="0" y1="5" x2="-28" y2="85" stroke="#D97706" strokeWidth="1.4" strokeDasharray="3,2" />
                <line x1="0" y1="5" x2="28" y2="85" stroke="#D97706" strokeWidth="1.4" strokeDasharray="3,2" />
                <line x1="0" y1="5" x2="0" y2="85" stroke="#B45309" strokeWidth="1.2" strokeDasharray="3,2" />
                {/* Curved Brass Pan */}
                <path d="M -35 85 Q 0 115 35 85 Z" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1.8" />
                <ellipse cx="0" cy="85" rx="35" ry="6" fill="#FDE68A" stroke="#452702" strokeWidth="1.2" />
                {/* Antique Brass Calibration Weights (المثاقيل والأوزان) */}
                <rect x="-12" y="74" width="10" height="12" rx="2" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1" />
                <rect x="2" y="77" width="8" height="9" rx="1.5" fill="url(#brass-scale)" stroke="#452702" strokeWidth="1" />
              </g>
            </g>
          </svg>
        );

      case 'box': // المندوس / البشتختة (الصندوق الخشبي التراثي المصفح بالنحاس)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="teak-wood" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2A1408" />
                <stop offset="35%" stopColor="#5E2C14" />
                <stop offset="70%" stopColor="#451E0C" />
                <stop offset="100%" stopColor="#1E0B04" />
              </linearGradient>
              <linearGradient id="brass-trim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="50%" stopColor="#F5BE38" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="85" ry="14" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Chest Feet */}
            <rect x="52" y="260" width="24" height="18" rx="4" fill="#1E0B04" stroke="#451E0C" strokeWidth="1.5" />
            <rect x="224" y="260" width="24" height="18" rx="4" fill="#1E0B04" stroke="#451E0C" strokeWidth="1.5" />

            {/* Main Chest Body */}
            <rect x="45" y="150" width="210" height="115" rx="8" fill="url(#teak-wood)" stroke="#1E0B04" strokeWidth="2.5" />

            {/* Domed Hinged Lid */}
            <path
              d="M 40 150 C 40 100 260 100 260 150 Z"
              fill="url(#teak-wood)"
              stroke="#1E0B04"
              strokeWidth="2.5"
            />
            {/* Lid Rim Border */}
            <rect x="38" y="145" width="224" height="12" rx="3" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.6" />

            {/* Brass Corner Brackets & Straps (صفائح وتصفيح النحاس الذهبي) */}
            <rect x="45" y="157" width="18" height="108" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.2" />
            <rect x="237" y="157" width="18" height="108" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.2" />
            <rect x="115" y="157" width="14" height="108" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.2" />
            <rect x="171" y="157" width="14" height="108" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.2" />

            {/* Domed Brass Studs / Nailheads (المسامير النحاسية القبتية التراثية للمندوس) */}
            {/* Studs on lid */}
            <circle cx="85" cy="125" r="3.2" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
            <circle cx="120" cy="115" r="3.2" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
            <circle cx="150" cy="110" r="3.5" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
            <circle cx="180" cy="115" r="3.2" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
            <circle cx="215" cy="125" r="3.2" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
            {/* Studs on vertical straps */}
            <circle cx="54" cy="175" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />
            <circle cx="54" cy="205" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />
            <circle cx="54" cy="235" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />
            <circle cx="246" cy="175" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />
            <circle cx="246" cy="205" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />
            <circle cx="246" cy="235" r="2.8" fill="#FEF08A" stroke="#451A03" strokeWidth="0.8" />

            {/* Central Ornate Lock Hasp & Padlock (قفل المندوس النحاسي الكبير) */}
            <path d="M 136 142 L 164 142 L 158 190 L 142 190 Z" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.6" />
            <rect x="140" y="185" width="20" height="24" rx="4" fill="url(#brass-trim)" stroke="#1E0B04" strokeWidth="1.6" />
            <path d="M 144 185 C 144 174 156 174 156 185" stroke="#1E0B04" strokeWidth="2.5" fill="none" />
            <circle cx="150" cy="195" r="2.2" fill="#1E0B04" />
            <rect x="149" y="195" width="2" height="6" fill="#1E0B04" />

            {/* Heavy Brass Side Handles */}
            <path d="M 45 195 C 32 195 32 225 45 225" stroke="url(#brass-trim)" strokeWidth="3" fill="none" />
            <path d="M 255 195 C 268 195 268 225 255 225" stroke="url(#brass-trim)" strokeWidth="3" fill="none" />
          </svg>
        );

      case 'lantern': // الفانوس التراثي المضيء بلهب متوهج
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lantern-brass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#784E07" />
                <stop offset="35%" stopColor="#EAB308" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
              <radialGradient id="flame-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#DC2626" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="60" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Carrying Wire Bail Handle (حلقة التعليق العلوية) */}
            <path
              d="M 95 135 C 95 30 205 30 205 135"
              stroke="#EAB308"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="150" cy="36" r="6" fill="#FDE047" stroke="#451A03" strokeWidth="1.5" />

            {/* Top Vented Dome Cap & Smoke Bell (قبعة الفانوس المخرمة للتهوية) */}
            <path d="M 125 120 L 150 78 L 175 120 Z" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="1.8" />
            <circle cx="150" cy="74" r="7" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="1.5" />
            {/* Vent holes */}
            <circle cx="142" cy="106" r="2" fill="#451A03" />
            <circle cx="150" cy="104" r="2" fill="#451A03" />
            <circle cx="158" cy="106" r="2" fill="#451A03" />
            <ellipse cx="150" cy="120" rx="30" ry="6" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="1.5" />

            {/* Glass Chimney (الزجاجة الشفافة مع التوهج الدافئ) */}
            <path
              d="M 122 124 
                 C 98 160 98 210 122 238 
                 L 178 238 
                 C 202 210 202 160 178 124 Z"
              fill="rgba(254, 243, 199, 0.25)"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1.6"
            />
            {/* Luminous Inner Glow Field */}
            <ellipse cx="150" cy="180" rx="42" ry="48" fill="url(#flame-glow)" className="animate-pulse" />

            {/* Protective Brass Wire Guards (أسلاك الحماية النحاسية المحيطة بالزجاج) */}
            <line x1="126" y1="124" x2="126" y2="238" stroke="url(#lantern-brass)" strokeWidth="2.5" />
            <line x1="174" y1="124" x2="174" y2="238" stroke="url(#lantern-brass)" strokeWidth="2.5" />
            <path d="M 112 180 Q 150 195 188 180" stroke="url(#lantern-brass)" strokeWidth="2" fill="none" />

            {/* The Living Flame & Wick (فتيل اللهب المتراقص) */}
            {/* Wick burner collar */}
            <rect x="142" y="218" width="16" height="8" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1" />
            {/* Flame */}
            <path
              d="M 150 162 
                 C 142 182 140 198 146 218 
                 C 150 220 154 220 156 218 
                 C 160 198 158 182 150 162 Z"
              fill="#F59E0B"
              className="animate-pulse"
            />
            <ellipse cx="150" cy="198" rx="4" ry="12" fill="#FEF08A" />
            <circle cx="150" cy="194" r="2" fill="#FFFFFF" />

            {/* Oil Reservoir Tank Base (خزان الكيروسين والزيت النحاسي) */}
            <ellipse cx="150" cy="238" rx="35" ry="6" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="1.5" />
            <path d="M 114 240 L 102 272 L 198 272 L 186 240 Z" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="2" />
            <ellipse cx="150" cy="272" rx="48" ry="8" fill="url(#lantern-brass)" stroke="#451A03" strokeWidth="1.8" />
            <ellipse cx="150" cy="270" rx="42" ry="5" fill="#503303" />

            {/* Oil filler cap */}
            <circle cx="176" cy="254" r="4.5" fill="#FEF08A" stroke="#451A03" strokeWidth="1" />
          </svg>
        );

      /* ============================================================
         5. FALCONER CORNER (ركن الصقّار)
      ============================================================ */
      case 'falcon': // الصقر العربي الأصيل بالبرقع المطرز
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="falcon-hood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8A1538" />
                <stop offset="50%" stopColor="#580C21" />
                <stop offset="100%" stopColor="#2E040F" />
              </linearGradient>
              <linearGradient id="feather-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3E2723" />
                <stop offset="35%" stopColor="#8D6E63" />
                <stop offset="70%" stopColor="#D7CCC8" />
                <stop offset="100%" stopColor="#2D150B" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="290" rx="65" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Falcon Muscular Chest & Feathered Mantle (صدر الصقر وريشه المميز) */}
            <path
              d="M 110 180 
                 C 80 220 75 285 105 295 
                 L 195 295 
                 C 225 285 220 220 190 180 Z"
              fill="url(#feather-grad)"
              stroke="#2D150B"
              strokeWidth="2.2"
            />
            {/* Detailed Chevron Speckles on Breast (نقوش ريش الشاهين التراثية) */}
            <path d="M 135 210 L 140 216 L 145 210" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 155 210 L 160 216 L 165 210" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 125 235 L 130 242 L 135 235" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 145 235 L 150 242 L 155 235" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 165 235 L 170 242 L 175 235" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 135 260 L 140 268 L 145 260" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 155 260 L 160 268 L 165 260" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Falcon Neck & Head Base */}
            <path d="M 120 170 C 115 130 185 130 180 170 Z" fill="#D7CCC8" stroke="#2D150B" strokeWidth="2" />

            {/* The Famous Embroidered Leather Hood "البرقع" (غطاء رأس الصقر التراثي) */}
            <path
              d="M 115 145 
                 C 105 85 195 85 185 145 
                 C 175 165 125 165 115 145 Z"
              fill="url(#falcon-hood)"
              stroke="#2E040F"
              strokeWidth="2.2"
            />
            {/* Eye Openings blind pads */}
            <ellipse cx="132" cy="125" rx="14" ry="12" fill="#3B0514" stroke="#F5BE38" strokeWidth="1.8" />
            <circle cx="132" cy="125" r="3" fill="#F5BE38" />
            <ellipse cx="168" cy="125" rx="14" ry="12" fill="#3B0514" stroke="#F5BE38" strokeWidth="1.8" />
            <circle cx="168" cy="125" r="3" fill="#F5BE38" />

            {/* Gold Zari Embroidery along the Burqa rim */}
            <path d="M 116 142 Q 150 160 184 142" stroke="#F5BE38" strokeWidth="2.5" fill="none" />
            <path d="M 120 100 Q 150 115 180 100" stroke="#F5BE38" strokeWidth="2" strokeDasharray="3,2" fill="none" />

            {/* Burqa Crown Plume / Tuft (شوشة البرقع العلوية الملونة) */}
            <g id="burqa-plume" transform="translate(150, 78)">
              <circle cx="0" cy="0" r="5" fill="#F5BE38" stroke="#3B0514" strokeWidth="1" />
              <path d="M 0 0 C -15 -25 -25 -40 -12 -55 C -6 -40 2 -25 0 0" fill="#8A1538" stroke="#3B0514" strokeWidth="1" />
              <path d="M 0 0 C 15 -25 25 -40 12 -55 C 6 -40 -2 -25 0 0" fill="#EAB308" stroke="#3B0514" strokeWidth="1" />
              <path d="M 0 0 C -5 -30 0 -48 0 -60 C 5 -48 5 -30 0 0" fill="#FFFFFF" stroke="#3B0514" strokeWidth="1" />
            </g>

            {/* Sharp Curved Beak (منقار الصقر المعقوف الحاد) */}
            <path
              d="M 144 142 
                 C 144 135 156 135 156 142 
                 L 155 158 
                 C 155 174 145 174 143 162 Z"
              fill="#F59E0B"
              stroke="#2D150B"
              strokeWidth="1.8"
            />
            {/* Dark Hook Tip */}
            <path d="M 147 155 C 153 155 153 172 144 172 Z" fill="#1E293B" />
          </svg>
        );

      case 'glove': // قفاز الصقّار (الدّس الجلدي المطرز)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="leather-glove" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#451A03" />
                <stop offset="35%" stopColor="#854D0E" />
                <stop offset="70%" stopColor="#A16207" />
                <stop offset="100%" stopColor="#2E1002" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="285" rx="60" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Thick Leather Gauntlet Forearm (ساعد الدس الجلدي المتين) */}
            <path
              d="M 100 170 L 90 280 L 210 280 L 200 170 Z"
              fill="url(#leather-glove)"
              stroke="#2E1002"
              strokeWidth="2.5"
            />
            {/* Flared Cuff Band (ياقة الدس العريضة بألوان التراث القطري) */}
            <rect x="85" y="250" width="130" height="32" rx="6" fill="#8A1538" stroke="#2E1002" strokeWidth="2" />
            <path d="M 88 266 L 212 266" stroke="#FEF08A" strokeWidth="2" strokeDasharray="5,4" />

            {/* Glove Hand & Reinforced Falcon Talon Padding (كف الدس والوسادة المصفحة) */}
            <path
              d="M 100 170 
                 C 90 140 85 95 110 80 
                 C 125 70 145 90 150 120 
                 C 155 85 175 65 190 75 
                 C 210 90 205 140 200 170 Z"
              fill="url(#leather-glove)"
              stroke="#2E1002"
              strokeWidth="2.5"
            />

            {/* Curved Falcon-Rest Thumb (إبهام الدس المقوس) */}
            <path
              d="M 98 140 
                 C 70 125 60 90 75 80 
                 C 88 70 102 95 106 125 Z"
              fill="url(#leather-glove)"
              stroke="#2E1002"
              strokeWidth="2"
            />

            {/* Heavy-Duty Stitching Seams (خيوط الدرز المتينة المزدوجة) */}
            <path d="M 108 170 L 108 85" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="4,3" fill="none" />
            <path d="M 148 170 L 148 115" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="4,3" fill="none" />
            <path d="M 190 170 L 190 85" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="4,3" fill="none" />

            {/* Hanging Leather Tie Straps & Brass Ring (حبال الربط وحلقة التثبيت) */}
            <circle cx="150" cy="275" r="7" fill="none" stroke="#FDE047" strokeWidth="2.5" />
            <path d="M 146 282 L 142 310" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <path d="M 154 282 L 158 312" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'perch': // المجثم / الوكر التراثي (المسند الخشبي المكسو بالمخمل)
        return (
          <svg viewBox="0 0 300 320" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="perch-wood" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E1002" />
                <stop offset="35%" stopColor="#78350F" />
                <stop offset="70%" stopColor="#9A3412" />
                <stop offset="100%" stopColor="#1C0A02" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="295" rx="60" ry="12" fill="#000" opacity="0.45" filter="blur(6px)" />

            {/* Ground Iron Spike (السنان الحديدي السفلي المغروز في الرمل) */}
            <path d="M 145 250 L 150 305 L 155 250 Z" fill="#64748B" stroke="#1E293B" strokeWidth="1.6" />

            {/* Lathe-Turned Wooden Shaft (عمود الوكر الخشبي المخروط بنقوش دائرية) */}
            <rect x="140" y="105" width="20" height="150" rx="4" fill="url(#perch-wood)" stroke="#1C0A02" strokeWidth="2" />
            <circle cx="150" cy="150" r="14" fill="url(#perch-wood)" stroke="#1C0A02" strokeWidth="1.8" />
            <ellipse cx="150" cy="150" rx="14" ry="4" fill="#FDE047" stroke="#1C0A02" strokeWidth="1" />
            <circle cx="150" cy="205" r="12" fill="url(#perch-wood)" stroke="#1C0A02" strokeWidth="1.8" />

            {/* Brass Leash Ring (حلقة السبوق المعدنية لربط الصقر) */}
            <circle cx="128" cy="150" r="8" fill="none" stroke="#FDE047" strokeWidth="3" />
            <path d="M 124 156 L 115 190" stroke="#8A1538" strokeWidth="2.5" strokeLinecap="round" />

            {/* Perch Platform Cushion (وسادة ومسند الوكر المكسوة بالمخمل التراثي) */}
            <ellipse cx="150" cy="105" rx="68" ry="16" fill="url(#perch-wood)" stroke="#1C0A02" strokeWidth="2" />
            {/* Velvet Cap (المخمل العنابي الوثير لراحة مخالب الصقر) */}
            <path
              d="M 84 105 C 84 65 216 65 216 105 Z"
              fill="#8A1538"
              stroke="#1C0A02"
              strokeWidth="2.2"
            />
            {/* Velvet Top Surface Rim */}
            <ellipse cx="150" cy="72" rx="55" ry="14" fill="#A21CAF" stroke="#1C0A02" strokeWidth="1.5" />
            <ellipse cx="150" cy="70" rx="48" ry="11" fill="#701A75" />

            {/* Gold Piping & Fringe (تطريز وقيطان الزري الذهبي حول حافة الوكر) */}
            <ellipse cx="150" cy="105" rx="66" ry="12" fill="none" stroke="#FDE047" strokeWidth="3" />
            <path d="M 90 105 L 90 115 M 110 112 L 110 122 M 130 115 L 130 125 M 150 117 L 150 127 M 170 115 L 170 125 M 190 112 L 190 122 M 210 105 L 210 115" stroke="#FDE047" strokeWidth="2" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {renderItemSvg()}
    </div>
  );
}
