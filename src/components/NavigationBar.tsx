import React from 'react';
import { StationId } from '../types';
import { 
  Home, 
  Store, 
  Waves, 
  Gamepad2, 
  Coffee, 
  Scissors, 
  Camera, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Settings 
} from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface NavigationBarProps {
  currentStationId: StationId | null;
  onNavigateToStation: (id: StationId) => void;
  onGoHome: () => void;
  onOpenPassport: () => void;
  onOpenSettings: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  stampedCount: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentStationId,
  onNavigateToStation,
  onGoHome,
  onOpenPassport,
  onOpenSettings,
  isSoundEnabled,
  onToggleSound,
  stampedCount,
}) => {
  const items = [
    {
      id: 'home',
      label: 'الصفحة الرئيسية',
      icon: Home,
      onClick: () => {
        soundManager.playClick();
        onGoHome();
      },
      isActive: false,
    },
    {
      id: 'souq',
      label: 'سوق لوّل',
      icon: Store,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('souq');
      },
      isActive: currentStationId === 'souq',
    },
    {
      id: 'pearl',
      label: 'بحر اللؤلؤ',
      icon: Waves,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('pearl');
      },
      isActive: currentStationId === 'pearl',
    },
    {
      id: 'games',
      label: 'فريج الألعاب',
      icon: Gamepad2,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('games');
      },
      isActive: currentStationId === 'games',
    },
    {
      id: 'majlis',
      label: 'مجلس لوّل',
      icon: Coffee,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('majlis');
      },
      isActive: currentStationId === 'majlis',
    },
    {
      id: 'crafts',
      label: 'بيت الحرف',
      icon: Scissors,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('crafts');
      },
      isActive: currentStationId === 'crafts',
    },
    {
      id: 'akkas',
      label: 'عكّاس لوّل',
      icon: Camera,
      onClick: () => {
        soundManager.playClick();
        onNavigateToStation('akkas');
      },
      isActive: currentStationId === 'akkas',
    },
  ];

  return (
    <nav
      id="bottom-heritage-nav-bar"
      aria-label="شريط التنقل التراثي"
      className="fixed bottom-2 sm:bottom-4 inset-x-2 sm:inset-x-6 z-40 max-w-5xl mx-auto"
    >
      <div className="relative flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#241108]/95 via-[#381a0e]/95 to-[#241108]/95 border-2 border-[#E6C280]/60 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-x-auto">
        {/* Navigation Items (Home & 6 Stations) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={item.onClick}
                className={`group flex flex-col items-center justify-center min-w-[50px] sm:min-w-[64px] px-1.5 py-1 sm:py-1.5 rounded-xl transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-[#8A1538] text-[#FFE082] shadow-[0_0_12px_rgba(138,21,56,0.8)] scale-105'
                    : 'text-[#d6c2ad] hover:text-[#FFF4D4] hover:bg-[#482414]/70'
                }`}
                title={item.label}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-0.5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-[#E6C280]/30 mx-1 hidden sm:block shrink-0" />

        {/* Action Controls: Passport, Sound, Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Passport Button (جوازي) */}
          <button
            id="nav-passport-btn"
            onClick={() => {
              soundManager.playSuccess();
              onOpenPassport();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#8A1538] to-[#6e0f2b] border border-[#E6C280] text-[#FFF4D4] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="جواز قطر لوّل"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE082]" />
            <div className="text-right leading-none">
              <span className="text-[11px] sm:text-xs font-black block">جوازي</span>
              <span className="text-[9px] text-[#FFE082] font-mono">{stampedCount}/6</span>
            </div>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-btn"
            onClick={() => {
              onToggleSound();
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isSoundEnabled
                ? 'bg-emerald-900/70 border-emerald-500 text-emerald-300'
                : 'bg-[#2b170c] border-[#5e351b] text-[#fca5a5] hover:bg-[#3d1f11]'
            }`}
            title={isSoundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Settings Modal Toggle */}
          <button
            id="nav-settings-btn"
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2b170c] hover:bg-[#3d1f11] border border-[#d49b4b]/40 text-[#E6C280] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="الإعدادات وإمكانية الوصول"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
