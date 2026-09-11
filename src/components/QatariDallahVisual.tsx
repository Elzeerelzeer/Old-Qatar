import React from 'react';

export type DallahStyle = 'qatari_gold' | 'raslan_brass' | 'royal_silver';

interface QatariDallahVisualProps {
  styleType?: DallahStyle;
  className?: string;
  size?: number;
  showSteam?: boolean;
  showFinjan?: boolean;
}

export function QatariDallahVisual({
  styleType = 'qatari_gold',
  className = '',
  size = 280,
  showSteam = true,
  showFinjan = true,
}: QatariDallahVisualProps) {
  // Theme palettes for different authentic Dallah styles
  const palettes = {
    qatari_gold: {
      primaryStart: '#FFF3B0',
      primaryMid: '#F5BE38',
      primaryDark: '#B88214',
      primaryDeep: '#784E07',
      accentGold: '#FFEBA3',
      accentShadow: '#4D3002',
      highlight: '#FFFDF0',
      engravingStroke: '#8A5906',
      engravingGlow: '#FFDE7A',
      finjanFill: '#FAF5EA',
      finjanPattern: '#B88214',
      glowColor: 'rgba(245, 190, 56, 0.45)',
    },
    raslan_brass: {
      primaryStart: '#FEE0B2',
      primaryMid: '#D97706',
      primaryDark: '#9A3412',
      primaryDeep: '#451A03',
      accentGold: '#FCD34D',
      accentShadow: '#2E1002',
      highlight: '#FFF7ED',
      engravingStroke: '#7C2D12',
      engravingGlow: '#FDBA74',
      finjanFill: '#FAF5EA',
      finjanPattern: '#9A3412',
      glowColor: 'rgba(217, 119, 6, 0.45)',
    },
    royal_silver: {
      primaryStart: '#FFFFFF',
      primaryMid: '#CBD5E1',
      primaryDark: '#64748B',
      primaryDeep: '#1E293B',
      accentGold: '#F59E0B',
      accentShadow: '#0F172A',
      highlight: '#FFFFFF',
      engravingStroke: '#D97706',
      engravingGlow: '#FDE68A',
      finjanFill: '#F8FAFC',
      finjanPattern: '#64748B',
      glowColor: 'rgba(203, 213, 225, 0.45)',
    },
  };

  const p = palettes[styleType] || palettes.qatari_gold;
  const uniqueId = `dallah-${styleType}`;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 300 320"
        className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={p.primaryDark} />
            <stop offset="22%" stopColor={p.primaryStart} />
            <stop offset="48%" stopColor={p.primaryMid} />
            <stop offset="78%" stopColor={p.primaryDark} />
            <stop offset="100%" stopColor={p.primaryDeep} />
          </linearGradient>

          {/* Specular Highlight Strip */}
          <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Gold Accent Trim Gradient */}
          <linearGradient id={`${uniqueId}-gold-accent`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.accentGold} />
            <stop offset="50%" stopColor={p.primaryStart} />
            <stop offset="100%" stopColor={p.primaryDark} />
          </linearGradient>

          {/* Spout Gradient */}
          <linearGradient id={`${uniqueId}-spout`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.primaryStart} />
            <stop offset="35%" stopColor={p.primaryMid} />
            <stop offset="70%" stopColor={p.primaryDark} />
            <stop offset="100%" stopColor={p.primaryDeep} />
          </linearGradient>

          {/* Handle Gradient */}
          <linearGradient id={`${uniqueId}-handle`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.primaryStart} />
            <stop offset="45%" stopColor={p.primaryMid} />
            <stop offset="85%" stopColor={p.primaryDark} />
            <stop offset="100%" stopColor={p.primaryDeep} />
          </linearGradient>

          {/* Radial glow for 3D belly sphere */}
          <radialGradient id={`${uniqueId}-belly-glow`} cx="38%" cy="40%" r="60%">
            <stop offset="0%" stopColor={p.highlight} stopOpacity="0.8" />
            <stop offset="35%" stopColor={p.primaryStart} stopOpacity="0.4" />
            <stop offset="80%" stopColor={p.primaryDark} stopOpacity="0" />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id={`${uniqueId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* --- PEDESTAL GROUND SHADOW --- */}
        <ellipse cx="148" cy="296" rx="65" ry="12" fill="#000000" opacity="0.45" filter="blur(6px)" />

        {/* --- FINJAN (CUP OF COFFEE) BESIDE THE DALLAH --- */}
        {showFinjan && (
          <g id="dallah-finjan" transform="translate(202, 246)">
            {/* Finjan shadow */}
            <ellipse cx="22" cy="46" rx="20" ry="6" fill="#000000" opacity="0.4" filter="blur(3px)" />
            {/* Finjan Cup Base */}
            <path
              d="M 10 24 Q 10 44 22 44 Q 34 44 34 24 Z"
              fill={p.finjanFill}
              stroke={p.finjanPattern}
              strokeWidth="1.5"
            />
            {/* Porcelain Rim */}
            <ellipse cx="22" cy="24" rx="12" ry="4" fill="#FFFFFF" stroke={p.finjanPattern} strokeWidth="1" />
            {/* Golden Rich Arabic Qahwa Coffee Liquid */}
            <ellipse cx="22" cy="25" rx="10" ry="3" fill="#5C3415" />
            <ellipse cx="21" cy="24.5" rx="6" ry="1.5" fill="#78350F" opacity="0.8" />
            {/* Cardamom foam speckle */}
            <circle cx="23" cy="24.8" r="0.8" fill="#D4A373" />
            <circle cx="19" cy="25.2" r="0.6" fill="#FEF08A" />
            {/* Traditional geometric bands on Finjan */}
            <path
              d="M 13 32 Q 22 36 31 32"
              stroke={p.finjanPattern}
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M 15 37 Q 22 40 29 37"
              stroke={p.finjanPattern}
              strokeWidth="1"
              strokeDasharray="2,2"
              fill="none"
            />
            {/* Subtle steam from Finjan */}
            <path
              d="M 22 20 Q 20 14 23 10 Q 26 6 22 2"
              stroke="#FFF"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.35"
              fill="none"
            />
          </g>
        )}

        {/* --- SIGNATURE SWEEPING DALLAH HANDLE (العروة والمقبض) --- */}
        <g id="dallah-handle">
          {/* Handle shadow behind body */}
          <path
            d="M 166 128 C 220 120 236 170 220 208 C 206 234 186 242 172 238 L 174 228 C 185 231 199 224 210 202 C 222 174 210 134 168 136 Z"
            fill="#000000"
            opacity="0.25"
            transform="translate(2, 4)"
          />

          {/* Main Handle Brass Arc */}
          <path
            d="M 166 128 C 222 118 238 172 220 210 C 206 236 186 244 172 238 L 174 228 C 185 231 199 224 210 202 C 222 174 210 134 168 136 Z"
            fill={`url(#${uniqueId}-handle)`}
            stroke={p.primaryDeep}
            strokeWidth="1.6"
          />

          {/* Inner Highlight on handle curve */}
          <path
            d="M 174 133 C 215 128 226 168 214 200 C 205 220 192 228 180 228"
            stroke={p.highlight}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.75"
            fill="none"
          />

          {/* Handle Thumb Rest (مهماز الإبهام التراثي المقوس في الأعلى) */}
          <path
            d="M 168 127 C 178 114 194 112 198 117 C 195 123 184 127 174 131 Z"
            fill={`url(#${uniqueId}-gold-accent)`}
            stroke={p.primaryDeep}
            strokeWidth="1.2"
          />
          <circle cx="196" cy="116" r="2.5" fill={p.accentGold} stroke={p.primaryDeep} strokeWidth="0.8" />

          {/* Handle Lower Curl (حلية المقبض السفلية) */}
          <path
            d="M 172 238 C 168 244 160 244 158 239 C 158 235 164 233 170 236 Z"
            fill={p.primaryMid}
            stroke={p.primaryDeep}
            strokeWidth="1"
          />

          {/* Upper & Lower Brass Rivets (مسامير التثبيت المعدنية) */}
          <circle cx="169" cy="133" r="2.8" fill={p.accentGold} stroke={p.primaryDeep} strokeWidth="1" />
          <circle cx="169" cy="133" r="1" fill="#FFFFFF" />
          <circle cx="174" cy="233" r="2.8" fill={p.accentGold} stroke={p.primaryDeep} strokeWidth="1" />
          <circle cx="174" cy="233" r="1" fill="#FFFFFF" />
        </g>

        {/* --- SIGNATURE LONG CURVED DALLAH BEAK SPOUT (المصب / الثعبان) --- */}
        <g id="dallah-spout">
          {/* Spout Outer Path with curved eagle-beak lip */}
          <path
            d="M 112 216 C 68 216 38 178 36 128 C 35 96 42 74 46 60 C 48 53 54 50 58 48 C 51 64 50 94 65 134 C 78 168 94 190 114 198 Z"
            fill={`url(#${uniqueId}-spout)`}
            stroke={p.primaryDeep}
            strokeWidth="1.6"
          />

          {/* Signature Beak Tip (فوهة المصب المقوسة الحادة للسكب) */}
          <path
            d="M 46 60 C 47 54 52 48 58 48 C 60 50 58 56 54 62 Z"
            fill={p.accentGold}
            stroke={p.primaryDeep}
            strokeWidth="1"
          />

          {/* Inside of Spout Opening (الفوهة المفتوحة للصب) */}
          <ellipse cx="53" cy="52" rx="2.5" ry="5.5" transform="rotate(-30 53 52)" fill="#3B1E04" />
          <ellipse cx="53.5" cy="52.2" rx="1.5" ry="4" transform="rotate(-30 53.5 52.2)" fill="#5C3415" />

          {/* Spout Graceful Specular Highlight */}
          <path
            d="M 104 208 C 66 205 44 170 42 125 C 42 98 48 76 52 64"
            stroke={p.highlight}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
            fill="none"
          />

          {/* Spout Joining Ring / Collar at body joint */}
          <path
            d="M 110 196 C 105 204 105 212 112 216"
            stroke={p.primaryDeep}
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* --- DALLAH BODY (قاعدة وبطن وعنق الدلة) --- */}
        <g id="dallah-body">
          {/* STEP 1: FLARED STEPPED CIRCULAR BASE (القاعدة الدائرية المتدرجة) */}
          {/* Base Lower Tier */}
          <path
            d="M 104 290 L 192 290 Q 192 284 186 280 L 110 280 Q 104 284 104 290 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.6"
          />
          {/* Base Rim Ring */}
          <ellipse cx="148" cy="280" rx="38" ry="4.5" fill={`url(#${uniqueId}-gold-accent)`} stroke={p.primaryDeep} strokeWidth="1" />
          {/* Base Middle Inset */}
          <path
            d="M 114 280 L 122 260 L 174 260 L 182 280 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.4"
          />
          {/* Base Upper Ring */}
          <ellipse cx="148" cy="260" rx="26" ry="3.5" fill={p.primaryStart} stroke={p.primaryDeep} strokeWidth="1" />

          {/* STEP 2: BULBOUS LOWER BELLY (بطن الدلة المستدير الممتلئ) */}
          <path
            d="M 128 196 C 110 206 94 222 96 242 C 98 256 112 260 122 260 L 174 260 C 184 260 198 256 200 242 C 202 222 186 206 168 196 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.6"
          />
          {/* Belly Spherical 3D Light Glow */}
          <path
            d="M 128 196 C 110 206 94 222 96 242 C 98 256 112 260 122 260 L 174 260 C 184 260 198 256 200 242 C 202 222 186 206 168 196 Z"
            fill={`url(#${uniqueId}-belly-glow)`}
            pointerEvents="none"
          />

          {/* Traditional Vertical Fluted Ribs on Belly (التضليع التراثي الأنيق) */}
          <path d="M 112 228 C 114 242 120 254 126 258" stroke={p.highlight} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />
          <path d="M 126 210 C 128 228 132 248 136 259" stroke={p.highlight} strokeWidth="1.8" strokeLinecap="round" opacity="0.75" fill="none" />
          <path d="M 148 200 C 148 222 148 244 148 260" stroke={p.highlight} strokeWidth="2.2" strokeLinecap="round" opacity="0.85" fill="none" />
          <path d="M 166 208 C 165 226 162 246 158 259" stroke={p.primaryDeep} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
          <path d="M 182 222 C 180 238 174 250 170 258" stroke={p.primaryDeep} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none" />

          {/* STEP 3: SLENDER EMBOSSED WAIST (الخصر النحيل ذو الحزام المزخرف) */}
          <rect
            x="126"
            y="190"
            width="44"
            height="8"
            rx="3"
            fill={`url(#${uniqueId}-gold-accent)`}
            stroke={p.primaryDeep}
            strokeWidth="1.2"
          />
          {/* Chevron Engravings along the waist ring */}
          <path
            d="M 130 194 L 134 191 L 138 194 L 142 191 L 146 194 L 150 191 L 154 194 L 158 191 L 162 194 L 166 191"
            stroke={p.engravingStroke}
            strokeWidth="1"
            fill="none"
          />

          {/* STEP 4: UPPER CONICAL NECK (عنق الدلة الأنيق الممشوق) */}
          <path
            d="M 128 190 L 120 128 L 176 128 L 168 190 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.6"
          />

          {/* Traditional Geometric Engraved Bands on Neck (نقوش وزخارف تراثية دقيقة) */}
          <path d="M 125 174 L 171 174" stroke={p.engravingStroke} strokeWidth="1" strokeDasharray="3,2" />
          <path d="M 124 162 L 172 162" stroke={p.engravingStroke} strokeWidth="1.2" />
          {/* Diamond / zigzag arabesque pattern */}
          <path
            d="M 126 162 L 132 154 L 138 162 L 144 154 L 150 162 L 156 154 L 162 162 L 168 154 L 172 162"
            stroke={p.engravingStroke}
            strokeWidth="1.1"
            fill="none"
          />
          <path d="M 123 154 L 173 154" stroke={p.engravingStroke} strokeWidth="1.2" />
          <path d="M 122 142 L 174 142" stroke={p.engravingStroke} strokeWidth="1" strokeDasharray="2,2" />

          {/* Neck Highlight Strip */}
          <path d="M 144 130 L 146 188" stroke={p.highlight} strokeWidth="2.5" opacity="0.8" />

          {/* Neck Rim / Collar (طوق فوهة الدلة) */}
          <ellipse cx="148" cy="128" rx="29" ry="5" fill={`url(#${uniqueId}-gold-accent)`} stroke={p.primaryDeep} strokeWidth="1.2" />
          <ellipse cx="148" cy="125" rx="26" ry="4.2" fill={p.primaryStart} stroke={p.primaryDeep} strokeWidth="0.8" />
        </g>

        {/* --- DALLAH LID & SOARING FINIAL SPIRE (غطاء الدلة وتاج الهلال والرمانة) --- */}
        <g id="dallah-lid">
          {/* Hinged Dome Tier 1 (الطبقة الأولى من الغطاء) */}
          <path
            d="M 122 125 C 122 112 174 112 174 125 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.4"
          />
          <ellipse cx="148" cy="125" rx="26" ry="3.8" fill={p.primaryMid} stroke={p.primaryDeep} strokeWidth="0.8" />

          {/* Dome Tier 2 (الطبقة الثانية المتدرجة) */}
          <path
            d="M 128 113 C 128 100 168 100 168 113 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.2"
          />
          <ellipse cx="148" cy="113" rx="20" ry="3.2" fill={`url(#${uniqueId}-gold-accent)`} stroke={p.primaryDeep} strokeWidth="0.8" />

          {/* Dome Tier 3 (القبة العلوية) */}
          <path
            d="M 134 101 C 134 88 162 88 162 101 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.2"
          />
          <ellipse cx="148" cy="101" rx="14" ry="2.5" fill={p.accentGold} stroke={p.primaryDeep} strokeWidth="0.8" />

          {/* Hinge Connection Chain to Handle (سلسلة الغطاء التراثية المربوطة بالعروة) */}
          <path
            d="M 166 118 Q 174 116 172 128"
            stroke={p.primaryDeep}
            strokeWidth="1.4"
            strokeDasharray="2,2"
            fill="none"
          />

          {/* THE SOARING SPIRE FINIAL (تاج الدلة المدبب الشامخ) */}
          {/* Spire Lower Brass Ring */}
          <ellipse cx="148" cy="88" rx="8" ry="2.2" fill={p.primaryStart} stroke={p.primaryDeep} strokeWidth="1" />
          {/* Lower Bead (حبة الرمان السفلية) */}
          <circle cx="148" cy="82" r="5" fill={`url(#${uniqueId}-gold-accent)`} stroke={p.primaryDeep} strokeWidth="1" />
          <circle cx="146.5" cy="80.5" r="1.5" fill="#FFFFFF" />

          {/* Middle Ring & Bead */}
          <ellipse cx="148" cy="74" rx="5.5" ry="1.8" fill={p.primaryStart} stroke={p.primaryDeep} strokeWidth="0.8" />
          <circle cx="148" cy="68" r="4" fill={`url(#${uniqueId}-gold-accent)`} stroke={p.primaryDeep} strokeWidth="1" />
          <circle cx="146.8" cy="66.8" r="1.2" fill="#FFFFFF" />

          {/* Soaring Needle Spire (المخروط الحاد المتسامي نحو القمة) */}
          <path
            d="M 144 68 L 148 24 L 152 68 Z"
            fill={`url(#${uniqueId}-grad)`}
            stroke={p.primaryDeep}
            strokeWidth="1.2"
          />
          <path d="M 148 26 L 148 68" stroke={p.highlight} strokeWidth="1.2" opacity="0.9" />

          {/* Top Crown / Crescent Finial (رأس التاج - الهلال أو سنان الرمح المذهب) */}
          <circle cx="148" cy="22" r="3.2" fill={p.accentGold} stroke={p.primaryDeep} strokeWidth="0.8" />
          <path
            d="M 148 19 L 148 10"
            stroke={p.accentGold}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Crescent finial tip */}
          <path
            d="M 145 13 C 145 8 151 8 151 13 C 149 10 147 10 145 13 Z"
            fill={p.accentGold}
            stroke={p.primaryDeep}
            strokeWidth="0.6"
          />
          {/* Star sparkle at the apex */}
          <circle cx="148" cy="10" r="1.2" fill="#FFFFFF" className="animate-pulse" />
        </g>

        {/* --- STEAM & AROMA OF CARDAMOM (بخار الهيل والقهوة الزكية) --- */}
        {showSteam && (
          <g id="dallah-steam" className="pointer-events-none">
            <path
              d="M 52 44 Q 48 30 56 20 Q 64 10 54 2"
              stroke="#FFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="4,4"
              opacity="0.45"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M 57 40 Q 64 28 58 18 Q 52 8 60 0"
              stroke="#FEF08A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="3,3"
              opacity="0.35"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
