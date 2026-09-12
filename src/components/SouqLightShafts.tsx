import React, { useMemo } from 'react';

interface SouqLightShaftsProps {
  worldWidth: number;
  worldHeight: number;
  isQuietMode?: boolean;
}

interface DustMote {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animClass: string;
  delay: number;
  duration: number;
}

export const SouqLightShafts: React.FC<SouqLightShaftsProps> = ({
  worldWidth,
  worldHeight,
  isQuietMode = false,
}) => {
  // Dust motes positioned within the light shafts
  const dustMotes = useMemo<DustMote[]>(() => {
    // Clusters around the main light shafts:
    // Left shaft (x: 280-450, y: 150-650)
    // Center shaft (x: 700-950, y: 120-750)
    // Slit shaft (x: 930-1050, y: 180-680)
    // Right shaft (x: 1140-1300, y: 160-700)
    const motes: DustMote[] = [
      // Left Shaft Motes
      { id: 1, x: 330, y: 220, size: 2.2, opacity: 0.85, animClass: 'anim-mote-1', delay: 0.2, duration: 6.2 },
      { id: 2, x: 380, y: 340, size: 3.0, opacity: 0.90, animClass: 'anim-mote-2', delay: 1.5, duration: 8.0 },
      { id: 3, x: 310, y: 460, size: 1.8, opacity: 0.75, animClass: 'anim-mote-1', delay: 2.8, duration: 7.1 },
      { id: 4, x: 360, y: 550, size: 2.5, opacity: 0.80, animClass: 'anim-mote-2', delay: 0.9, duration: 8.4 },
      { id: 5, x: 410, y: 400, size: 2.0, opacity: 0.70, animClass: 'anim-mote-1', delay: 3.5, duration: 6.8 },

      // Central Grand Shaft Motes (Main spectacle)
      { id: 6, x: 770, y: 180, size: 3.2, opacity: 0.95, animClass: 'anim-mote-1', delay: 0.5, duration: 7.5 },
      { id: 7, x: 820, y: 260, size: 2.4, opacity: 0.85, animClass: 'anim-mote-2', delay: 1.8, duration: 8.2 },
      { id: 8, x: 740, y: 360, size: 3.5, opacity: 0.92, animClass: 'anim-mote-1', delay: 3.1, duration: 9.0 },
      { id: 9, x: 860, y: 440, size: 2.6, opacity: 0.88, animClass: 'anim-mote-2', delay: 0.7, duration: 7.8 },
      { id: 10, x: 790, y: 520, size: 3.0, opacity: 0.90, animClass: 'anim-mote-1', delay: 2.2, duration: 8.5 },
      { id: 11, x: 840, y: 620, size: 2.2, opacity: 0.75, animClass: 'anim-mote-2', delay: 4.0, duration: 7.0 },
      { id: 12, x: 720, y: 480, size: 2.8, opacity: 0.82, animClass: 'anim-mote-1', delay: 1.2, duration: 8.7 },
      { id: 13, x: 890, y: 320, size: 2.0, opacity: 0.80, animClass: 'anim-mote-2', delay: 2.9, duration: 6.9 },

      // Slit Shaft Motes
      { id: 14, x: 960, y: 250, size: 2.4, opacity: 0.88, animClass: 'anim-mote-1', delay: 1.0, duration: 7.4 },
      { id: 15, x: 990, y: 410, size: 3.0, opacity: 0.92, animClass: 'anim-mote-2', delay: 2.4, duration: 8.1 },
      { id: 16, x: 1030, y: 560, size: 2.0, opacity: 0.78, animClass: 'anim-mote-1', delay: 3.7, duration: 6.5 },

      // Right Shaft Motes (Spices)
      { id: 17, x: 1180, y: 230, size: 2.8, opacity: 0.85, animClass: 'anim-mote-2', delay: 0.4, duration: 7.6 },
      { id: 18, x: 1240, y: 350, size: 3.4, opacity: 0.90, animClass: 'anim-mote-1', delay: 1.9, duration: 8.8 },
      { id: 19, x: 1160, y: 480, size: 2.2, opacity: 0.80, animClass: 'anim-mote-2', delay: 3.3, duration: 7.2 },
      { id: 20, x: 1220, y: 590, size: 2.5, opacity: 0.75, animClass: 'anim-mote-1', delay: 0.8, duration: 8.0 },
      { id: 21, x: 1280, y: 430, size: 2.0, opacity: 0.70, animClass: 'anim-mote-2', delay: 2.5, duration: 6.7 },

      // Peripheral Accent Motes
      { id: 22, x: 170, y: 380, size: 2.2, opacity: 0.72, animClass: 'anim-mote-1', delay: 1.6, duration: 7.9 },
      { id: 23, x: 1420, y: 410, size: 2.4, opacity: 0.76, animClass: 'anim-mote-2', delay: 2.1, duration: 8.3 },
      { id: 24, x: 800, y: 680, size: 2.0, opacity: 0.65, animClass: 'anim-mote-1', delay: 3.8, duration: 7.0 },
    ];
    return motes;
  }, []);

  return (
    <div
      id="souq-light-shafts-layer"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ==================== 1. WARM GROUND LIGHT POOLS ==================== */}
      <div className="absolute inset-0 z-[21] pointer-events-none">
        {/* Left Ground Pool (Near Pottery) */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '260px',
            top: '680px',
            width: '240px',
            height: '95px',
            background: 'radial-gradient(ellipse at center, rgba(255, 225, 140, 0.28) 0%, rgba(245, 190, 80, 0.12) 50%, rgba(200, 130, 40, 0) 75%)',
            filter: 'blur(12px)',
            transform: 'rotate(-5deg)',
          }}
        />

        {/* Center Grand Ground Pool (Main walkway floor) */}
        <div
          className={`absolute rounded-full pointer-events-none ${isQuietMode ? '' : 'anim-ray-1'}`}
          style={{
            left: '660px',
            top: '730px',
            width: '340px',
            height: '130px',
            background: 'radial-gradient(ellipse at center, rgba(255, 238, 160, 0.38) 0%, rgba(255, 210, 100, 0.20) 45%, rgba(220, 145, 45, 0) 75%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Slit Ground Pool */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '940px',
            top: '690px',
            width: '160px',
            height: '70px',
            background: 'radial-gradient(ellipse at center, rgba(255, 230, 150, 0.30) 0%, rgba(245, 195, 90, 0.12) 55%, rgba(200, 140, 50, 0) 80%)',
            filter: 'blur(10px)',
            transform: 'rotate(8deg)',
          }}
        />

        {/* Right Ground Pool (Near Spices) */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '1100px',
            top: '710px',
            width: '260px',
            height: '100px',
            background: 'radial-gradient(ellipse at center, rgba(255, 228, 145, 0.30) 0%, rgba(250, 195, 85, 0.14) 50%, rgba(200, 135, 45, 0) 75%)',
            filter: 'blur(14px)',
            transform: 'rotate(6deg)',
          }}
        />
      </div>

      {/* ==================== 2. VOLUMETRIC SVG GOD RAYS ==================== */}
      <svg
        className="absolute inset-0 w-full h-full z-[26] pointer-events-none"
        viewBox={`0 0 ${worldWidth} ${worldHeight}`}
        preserveAspectRatio="none"
        style={{
          mixBlendMode: 'screen',
        }}
      >
        <defs>
          {/* Blur filters for soft optical diffusion */}
          <filter id="shaft-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" result="blur" />
          </filter>
          <filter id="shaft-blur-core" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
          </filter>
          <filter id="aperture-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="glow" />
          </filter>

          {/* Linear Gradients: Roof Aperture (bright) to Floor (dissipated haze) */}
          {/* Main Grand Beam Gradient */}
          <linearGradient id="grand-ray-grad" x1="50%" y1="0%" x2="52%" y2="100%">
            <stop offset="0%" stopColor="#FFFEEB" stopOpacity="0.85" />
            <stop offset="12%" stopColor="#FFEAA5" stopOpacity="0.72" />
            <stop offset="38%" stopColor="#FED872" stopOpacity="0.48" />
            <stop offset="68%" stopColor="#F5BE4E" stopOpacity="0.26" />
            <stop offset="92%" stopColor="#DC9730" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#B8731E" stopOpacity="0" />
          </linearGradient>

          {/* Left Shaft Gradient */}
          <linearGradient id="left-ray-grad" x1="45%" y1="0%" x2="48%" y2="100%">
            <stop offset="0%" stopColor="#FFF9DC" stopOpacity="0.78" />
            <stop offset="15%" stopColor="#FFE28C" stopOpacity="0.60" />
            <stop offset="45%" stopColor="#F8C75E" stopOpacity="0.38" />
            <stop offset="75%" stopColor="#E5A73E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C07E20" stopOpacity="0" />
          </linearGradient>

          {/* Slit Piercing Beam Gradient */}
          <linearGradient id="slit-ray-grad" x1="48%" y1="0%" x2="54%" y2="100%">
            <stop offset="0%" stopColor="#FFFFF2" stopOpacity="0.90" />
            <stop offset="18%" stopColor="#FFEDA8" stopOpacity="0.68" />
            <stop offset="48%" stopColor="#F9CC66" stopOpacity="0.42" />
            <stop offset="80%" stopColor="#E29F34" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#B8751C" stopOpacity="0" />
          </linearGradient>

          {/* Right Shaft Gradient */}
          <linearGradient id="right-ray-grad" x1="50%" y1="0%" x2="52%" y2="100%">
            <stop offset="0%" stopColor="#FFF8D5" stopOpacity="0.78" />
            <stop offset="15%" stopColor="#FFE084" stopOpacity="0.58" />
            <stop offset="45%" stopColor="#F6C458" stopOpacity="0.36" />
            <stop offset="78%" stopColor="#E09E35" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#BD7920" stopOpacity="0" />
          </linearGradient>

          {/* Accent Beams Gradient */}
          <linearGradient id="accent-ray-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFF5CC" stopOpacity="0.65" />
            <stop offset="25%" stopColor="#FFDC7A" stopOpacity="0.42" />
            <stop offset="65%" stopColor="#F2B742" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#B8721A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ----------------- RAY 1: Left Wing Beam (Pottery side) ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-2'}>
          {/* Soft outer volumetric halo */}
          <polygon
            points="330,8 410,8 510,780 230,780"
            fill="url(#left-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.75"
          />
          {/* Bright inner core shaft */}
          <polygon
            points="350,10 390,10 450,760 300,760"
            fill="url(#left-ray-grad)"
            filter="url(#shaft-blur-core)"
            opacity="0.9"
          />
        </g>

        {/* ----------------- RAY 2: Grand Central God Ray (Alley Heart) ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-1'}>
          {/* Broad atmospheric haze cone */}
          <polygon
            points="730,4 865,4 1020,890 640,890"
            fill="url(#grand-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.85"
          />
          {/* Intense sunbeam central blade */}
          <polygon
            points="760,6 835,6 940,870 710,870"
            fill="url(#grand-ray-grad)"
            filter="url(#shaft-blur-core)"
            opacity="0.95"
          />
          {/* Brightest piercing core */}
          <polygon
            points="785,6 815,6 880,840 760,840"
            fill="url(#grand-ray-grad)"
            opacity="0.8"
          />
        </g>

        {/* ----------------- RAY 3: Piercing Roof Slit Beam ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-3'}>
          {/* Outer soft ray */}
          <polygon
            points="920,10 962,10 1100,790 940,790"
            fill="url(#slit-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.8"
          />
          {/* Sharp direct beam */}
          <polygon
            points="932,10 950,10 1060,780 970,780"
            fill="url(#slit-ray-grad)"
            filter="url(#shaft-blur-core)"
            opacity="0.95"
          />
        </g>

        {/* ----------------- RAY 4: Right Wing Beam (Spices side) ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-2'}>
          {/* Soft outer glow */}
          <polygon
            points="1140,8 1225,8 1350,830 1090,830"
            fill="url(#right-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.8"
          />
          {/* Concentrated ray core */}
          <polygon
            points="1160,10 1205,10 1290,815 1140,815"
            fill="url(#right-ray-grad)"
            filter="url(#shaft-blur-core)"
            opacity="0.9"
          />
        </g>

        {/* ----------------- RAY 5: Far Left Entrance Accent Ray ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-1'}>
          <polygon
            points="140,12 185,12 280,730 80,730"
            fill="url(#accent-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.55"
          />
        </g>

        {/* ----------------- RAY 6: Far Right Alley Accent Ray ----------------- */}
        <g className={isQuietMode ? '' : 'anim-ray-3'}>
          <polygon
            points="1380,12 1435,12 1530,750 1350,750"
            fill="url(#accent-ray-grad)"
            filter="url(#shaft-blur-soft)"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* ==================== 3. ROOF APERTURES / CANOPY SLITS ==================== */}
      {/* Visual representation of the glowing sunlight bursting through gaps in the awning and chandal timber beams */}
      <div className="absolute top-0 left-0 right-0 h-16 z-[27] pointer-events-none">
        {/* Left Roof Opening Flare */}
        <div
          className={`absolute top-0 rounded-b-full pointer-events-none ${isQuietMode ? '' : 'anim-aperture'}`}
          style={{
            left: '335px',
            width: '85px',
            height: '14px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFE99E 60%, rgba(255, 210, 80, 0) 100%)',
            boxShadow: '0 4px 22px rgba(255, 235, 160, 0.9), 0 0 35px rgba(255, 195, 70, 0.7)',
          }}
        />

        {/* Central Grand Roof Skylight Opening */}
        <div
          className={`absolute top-0 rounded-b-full pointer-events-none ${isQuietMode ? '' : 'anim-aperture'}`}
          style={{
            left: '735px',
            width: '135px',
            height: '20px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3C4 50%, rgba(255, 220, 100, 0) 100%)',
            boxShadow: '0 6px 30px rgba(255, 245, 180, 0.95), 0 0 45px rgba(255, 205, 80, 0.8)',
          }}
        />

        {/* Wooden Chandal Slat Shadows (slats cutting through central light aperture) */}
        <div className="absolute top-0 left-[750px] w-2.5 h-6 bg-[#26150a]/90 shadow-sm pointer-events-none" />
        <div className="absolute top-0 left-[785px] w-2 h-6 bg-[#26150a]/90 shadow-sm pointer-events-none" />
        <div className="absolute top-0 left-[820px] w-2.5 h-6 bg-[#26150a]/90 shadow-sm pointer-events-none" />
        <div className="absolute top-0 left-[850px] w-2 h-6 bg-[#26150a]/90 shadow-sm pointer-events-none" />

        {/* Slit Roof Opening Flare */}
        <div
          className={`absolute top-0 rounded-b-full pointer-events-none ${isQuietMode ? '' : 'anim-aperture'}`}
          style={{
            left: '925px',
            width: '42px',
            height: '12px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFEBA6 70%, rgba(255, 215, 85, 0) 100%)',
            boxShadow: '0 3px 18px rgba(255, 235, 150, 0.85), 0 0 25px rgba(255, 195, 65, 0.65)',
          }}
        />

        {/* Right Roof Opening Flare */}
        <div
          className={`absolute top-0 rounded-b-full pointer-events-none ${isQuietMode ? '' : 'anim-aperture'}`}
          style={{
            left: '1145px',
            width: '90px',
            height: '15px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFEAA0 60%, rgba(255, 210, 80, 0) 100%)',
            boxShadow: '0 4px 22px rgba(255, 235, 160, 0.9), 0 0 32px rgba(255, 195, 70, 0.7)',
          }}
        />

        {/* Slat Shadows on Right Aperture */}
        <div className="absolute top-0 left-[1170px] w-2 h-5 bg-[#26150a]/90 pointer-events-none" />
        <div className="absolute top-0 left-[1200px] w-2 h-5 bg-[#26150a]/90 pointer-events-none" />
      </div>

      {/* ==================== 4. CINEMATIC FLOATING DUST MOTES ==================== */}
      {/* Golden micro-particles drifting and glittering in the sunbeams */}
      {!isQuietMode && (
        <div className="absolute inset-0 z-[28] pointer-events-none overflow-hidden">
          {dustMotes.map((mote) => (
            <div
              key={mote.id}
              className={`absolute rounded-full pointer-events-none ${mote.animClass}`}
              style={{
                left: `${mote.x}px`,
                top: `${mote.y}px`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                backgroundColor: '#FFF4CD',
                boxShadow: `0 0 ${mote.size * 3}px ${mote.size}px rgba(255, 220, 110, 0.9), 0 0 ${mote.size * 6}px rgba(255, 180, 50, 0.5)`,
                opacity: mote.opacity,
                animationDelay: `${mote.delay}s`,
                animationDuration: `${mote.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ==================== 5. ATMOSPHERIC WARM UPPER HAZE ==================== */}
      <div
        className="absolute top-0 left-0 right-0 h-40 z-[25] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 220, 130, 0.16) 0%, rgba(245, 185, 75, 0.08) 50%, rgba(230, 150, 40, 0) 100%)',
        }}
      />

      {/* ==================== 6. FOREGROUND VOLUMETRIC GLOW OVER CHARACTER ==================== */}
      {/* Soft light overlay positioned above player (z-32) for volumetric depth */}
      <svg
        className="absolute inset-0 w-full h-full z-[32] pointer-events-none"
        viewBox={`0 0 ${worldWidth} ${worldHeight}`}
        preserveAspectRatio="none"
        style={{
          mixBlendMode: 'screen',
          opacity: isQuietMode ? 0.12 : 0.22,
        }}
      >
        <g className={isQuietMode ? '' : 'anim-ray-1'}>
          {/* Subtle foreground pass of Grand Ray */}
          <polygon
            points="750,5 845,5 960,880 690,880"
            fill="url(#grand-ray-grad)"
            filter="url(#shaft-blur-soft)"
          />
        </g>
        <g className={isQuietMode ? '' : 'anim-ray-2'}>
          {/* Subtle foreground pass of Left Ray */}
          <polygon
            points="340,10 400,10 480,770 270,770"
            fill="url(#left-ray-grad)"
            filter="url(#shaft-blur-soft)"
          />
        </g>
        <g className={isQuietMode ? '' : 'anim-ray-2'}>
          {/* Subtle foreground pass of Right Ray */}
          <polygon
            points="1150,10 1215,10 1310,820 1120,820"
            fill="url(#right-ray-grad)"
            filter="url(#shaft-blur-soft)"
          />
        </g>
      </svg>
    </div>
  );
};
