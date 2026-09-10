import React from 'react';
import { Home, BookOpen, Volume2, VolumeX, Settings } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface MinimalHudProps {
  onGoHome: () => void;
  onOpenPassport: () => void;
  onOpenSettings: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  stampedCount: number;
}

export const MinimalHud: React.FC<MinimalHudProps> = ({
  onGoHome,
  onOpenPassport,
  onOpenSettings,
  isSoundEnabled,
  onToggleSound,
  stampedCount,
}) => {
  return (
    <header
      id="minimal-heritage-hud"
      aria-label="قائمة التحكم السريعة"
      className="fixed top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-50 pointer-events-auto"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-[#120804]/40 backdrop-blur-md border border-[#E6C280]/25 shadow-[0_4px_16px_rgba(0,0,0,0.4)] text-[#FAF5EA]">
        {/* Home */}
        <button
          id="hud-home-btn"
          onClick={() => {
            soundManager.playClick();
            onGoHome();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#e2cfbd] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="الرئيسية"
        >
          <Home className="w-3.5 h-3.5 text-[#E6C280]" />
          <span className="hidden sm:inline">الرئيسية</span>
        </button>

        <div className="h-3 w-px bg-white/15" />

        {/* جوازي */}
        <button
          id="hud-passport-btn"
          onClick={() => {
            soundManager.playSuccess();
            onOpenPassport();
          }}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8A1538]/75 hover:bg-[#8A1538]/90 text-[#FFF4D4] border border-[#E6C280]/40 text-[11px] font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
          title="جواز قطر لوّل"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FFE082]" />
          <span>جوازي</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#4a0718]/80 text-[#FFE082] font-mono">
            {stampedCount}/6
          </span>
        </button>

        <div className="h-3 w-px bg-white/15" />

        {/* الصوت */}
        <button
          id="hud-sound-btn"
          onClick={onToggleSound}
          className={`p-1 rounded-full transition-colors cursor-pointer ${
            isSoundEnabled
              ? 'text-emerald-400 hover:bg-emerald-950/30'
              : 'text-[#e2cfbd]/60 hover:bg-white/10'
          }`}
          title={isSoundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* الإعدادات */}
        <button
          id="hud-settings-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-1 rounded-full text-[#e2cfbd] hover:text-[#FFE082] hover:bg-white/10 transition-colors cursor-pointer"
          title="الإعدادات"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
