import React, { useMemo } from 'react';
import { SouqHotspot } from '../types';
import { Sparkles } from 'lucide-react';

interface SouqDokanGlowProps {
  spot: SouqHotspot;
  playerPos: { x: number; y: number };
  isNear: boolean;
  isQuietMode?: boolean;
  onOpen: (spot: SouqHotspot) => void;
}

export const SouqDokanGlow: React.FC<SouqDokanGlowProps> = ({
  spot,
  playerPos,
  isNear,
  isQuietMode = false,
  onOpen,
}) => {
  // Calculate distance between player and dokan hotspot
  const distance = useMemo(() => {
    return Math.hypot(playerPos.x - spot.x, playerPos.y - spot.y);
  }, [playerPos.x, playerPos.y, spot.x, spot.y]);

  // Approach distance threshold: 1.85x the interaction radius
  const approachRadius = spot.radius * 1.85;

  // Proximity factor (0 to 1) for gradual, soft radial illumination
  const proximityFactor = useMemo(() => {
    if (distance >= approachRadius) {
      // Idle ambient baseline: small warm glow to show the shop is lit and active
      return 0.22;
    }
    if (distance <= spot.radius) {
      return 1.0;
    }
    // Smooth cosine/cubic ease interpolation as the visitor approaches
    const t = (approachRadius - distance) / (approachRadius - spot.radius);
    const smoothT = t * t * (3 - 2 * t); // Smoothstep curve
    return 0.22 + smoothT * 0.78;
  }, [distance, approachRadius, spot.radius]);

  // Primary icon from first item
  const dokanIcon = spot.items[0]?.icon || '🏺';

  const handleOpen = () => {
    // Broadcast a lightweight event so the Souq progress tracker can count
    // DISTINCT shops without coupling the original Souq scene to passport logic.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('qatar-lowwal:souq-hotspot-opened', {
          detail: {
            spotId: spot.id,
            spotName: spot.name,
          },
        })
      );
    }

    onOpen(spot);
  };

  return (
    <div
      id={`dokan-hotspot-${spot.id}`}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none transition-transform duration-300 ease-out"
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. WIDE RADIAL GRADIENT ILLUMINATION (إضاءة شعاعية ناعمة ومتدرجة) */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ease-out ${
          isQuietMode ? '' : 'anim-dokan-breathe'
        }`}
        style={{
          width: `${Math.round(240 + proximityFactor * 80)}px`,
          height: `${Math.round(190 + proximityFactor * 70)}px`,
          opacity: proximityFactor,
          background: `radial-gradient(ellipse at 50% 50%, rgba(255, 226, 135, ${
            0.42 * proximityFactor
          }) 0%, rgba(245, 158, 11, ${
            0.24 * proximityFactor
          }) 28%, rgba(217, 119, 6, ${
            0.12 * proximityFactor
          }) 54%, rgba(180, 83, 9, ${
            0.03 * proximityFactor
          }) 74%, transparent 100%)`,
          filter: 'blur(14px)',
        }}
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. INNER CONCENTRATED HEARTH LIGHT (قلب الإضاءة الدافئة الفاقع) */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ease-out ${
          isQuietMode ? '' : 'anim-dokan-flicker'
        }`}
        style={{
          width: `${Math.round(110 + proximityFactor * 45)}px`,
          height: `${Math.round(90 + proximityFactor * 35)}px`,
          opacity: Math.max(0.3, proximityFactor),
          background: `radial-gradient(circle at center, rgba(255, 252, 235, ${
            0.78 * proximityFactor
          }) 0%, rgba(255, 224, 130, ${
            0.48 * proximityFactor
          }) 36%, rgba(245, 158, 11, ${
            0.2 * proximityFactor
          }) 68%, transparent 100%)`,
          filter: 'blur(7px)',
        }}
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. SUBTLE ACTIVE BEACON / PULSE RING (حلقة وميض تدل على نشاط الدكان) */}
      {/* ------------------------------------------------------------- */}
      {!isQuietMode && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full anim-dokan-beacon border border-[#FFE082]/40"
          style={{
            width: '90px',
            height: '75px',
            opacity: proximityFactor * 0.75,
          }}
          aria-hidden="true"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ACTIVE DOKAN INDICATOR (شارة وميض خفيف توحي بأن الدكان نشط ومفتوح) */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 ${
          isQuietMode ? '' : 'anim-dokan-flicker'
        }`}
      >
        {/* Subtle active Dokan overhead beacon badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-lg backdrop-blur-xs transition-all duration-300 ${
            isNear
              ? 'bg-[#8A1538]/95 border-[#FFE082] scale-105 shadow-[#FFE082]/30'
              : 'bg-[#2b170e]/85 border-[#FFE082]/50 scale-95'
          }`}
          style={{
            boxShadow: `0 0 ${Math.round(8 + proximityFactor * 14)}px rgba(255, 224, 130, ${
              0.35 * proximityFactor
            })`,
          }}
        >
          {/* Active green/gold pulsing dot indicator */}
          <span className="relative flex h-2 w-2">
            {!isQuietMode && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE082] opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE082]" />
          </span>

          <span className="text-sm select-none" role="img" aria-label={spot.name}>
            {dokanIcon}
          </span>

          <span
            className={`text-[11px] font-black tracking-wide ${
              isNear ? 'text-[#FFE082]' : 'text-amber-100/90'
            }`}
          >
            {spot.name}
          </span>
        </div>

        {/* Floating motes / sparks of light */}
        {!isQuietMode && proximityFactor > 0.4 && (
          <>
            <div
              className="absolute -top-3 left-2 w-1.5 h-1.5 rounded-full bg-[#FFE082] anim-dokan-mote pointer-events-none shadow-[0_0_6px_#FFE082]"
              style={{ animationDelay: '0.4s' }}
              aria-hidden="true"
            />
            <div
              className="absolute -top-2 right-1 w-1 h-1 rounded-full bg-[#FFD76B] anim-dokan-mote pointer-events-none shadow-[0_0_4px_#FFD76B]"
              style={{ animationDelay: '1.8s' }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. INTERACTIVE ACTION BUTTON («تعرّف») WHEN PLAYER IS NEAR       */}
      {/* ------------------------------------------------------------- */}
      {isNear && (
        <div className="absolute top-7 left-1/2 -translate-x-1/2 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleOpen}
            className="group relative flex items-center gap-2 bg-[#8A1538] hover:bg-[#6e102d] active:scale-95 text-[#FFE082] border-2 border-[#FFE082] px-5 py-2 rounded-full shadow-[0_4px_20px_rgba(138,21,56,0.65)] font-black text-sm transition-all cursor-pointer whitespace-nowrap"
            title={`تفضل بالدخول إلى ${spot.name}`}
            aria-label={`تصفح معروضات ${spot.name}`}
          >
            {/* Subtle button radial sheen */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#FFE082]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              aria-hidden="true"
            />
            <Sparkles className="w-4 h-4 text-[#FFE082] group-hover:rotate-12 transition-transform" />
            <span>تعرّف على المعروضات</span>
          </button>
        </div>
      )}
    </div>
  );
};
