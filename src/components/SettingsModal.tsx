import React from 'react';
import { GameSettings, CharacterGender } from '../types';
import { X, Volume2, VolumeX, ShieldCheck, Gauge, User, Sliders, RotateCcw } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  gender: CharacterGender;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onChangeGender: (gender: CharacterGender) => void;
  onResetPosition: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  gender,
  onUpdateSettings,
  onChangeGender,
  onResetPosition,
  onClose,
}) => {
  const handleToggleSound = () => {
    const next = !settings.isSoundEnabled;
    onUpdateSettings({ isSoundEnabled: next });
    soundManager.setEnabled(next);
    if (next) soundManager.playSuccess();
  };

  const handleToggleQuietMode = () => {
    const next = !settings.isQuietMode;
    onUpdateSettings({ isQuietMode: next });
    soundManager.playClick();
  };

  const handleSpeedChange = (speed: 'calm' | 'normal') => {
    onUpdateSettings({ walkSpeed: speed });
    soundManager.playClick();
  };

  const handleGenderToggle = (newGender: CharacterGender) => {
    onChangeGender(newGender);
    soundManager.playSuccess();
  };

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-right">
      <div
        id="settings-modal-card"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#22130b] border-2 sm:border-3 border-[#E6C280] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-[#FAF5EA] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3b1d0f] to-[#251209] border-b-2 border-[#E6C280]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8A1538] border border-[#E6C280] flex items-center justify-center text-[#FFE082]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#FFF4D4]">
                الإعدادات وإمكانية الوصول
              </h3>
              <p className="text-xs text-[#E6C280]">
                خيارات ملائمة لجميع المنتسبين وذوي الإعاقة
              </p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-[#341b10] hover:bg-[#4d2817] border border-[#E6C280]/60 flex items-center justify-center text-[#FFE082] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. الوضع الهادئ (Quiet Mode) - Crucial for Sensory Accessibility */}
          <div
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
              settings.isQuietMode
                ? 'bg-[#401f11] border-[#E6C280] shadow-md'
                : 'bg-[#180d06] border-[#4a2612]'
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-7 h-7 text-[#E6C280] shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-black text-[#FFF4D4]">
                  الوضع الهادئ (Sensory Friendly)
                </h4>
                <p className="text-xs text-[#d6beaa] leading-relaxed">
                  يقلل الحركات المفاجئة، ويخفض المؤثرات البصرية والأصوات لتجربة حسية هادئة ومريحة.
                </p>
              </div>
            </div>

            <button
              id="settings-quiet-mode-toggle"
              onClick={handleToggleQuietMode}
              className={`px-6 py-3 rounded-2xl font-extrabold text-sm border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                settings.isQuietMode
                  ? 'bg-[#8A1538] border-[#FFE082] text-white'
                  : 'bg-[#2b170c] border-[#5e3419] text-[#e6c280]'
              }`}
            >
              {settings.isQuietMode ? 'مفعّل ✓' : 'غير مفعّل'}
            </button>
          </div>

          {/* 2. التحكم بالصوت (Sound Volume & Toggle) */}
          <div className="p-5 rounded-2xl bg-[#180d06] border border-[#4a2612] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.isSoundEnabled ? (
                  <Volume2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <VolumeX className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <h4 className="text-base font-black text-[#FFF4D4]">
                    المؤثرات الصوتية التراثية
                  </h4>
                  <p className="text-xs text-[#ab927e]">
                    أصوات فتح الباب، البحر، الخطوات، ورنات المجلس
                  </p>
                </div>
              </div>

              <button
                id="settings-sound-switch-btn"
                onClick={handleToggleSound}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-colors cursor-pointer ${
                  settings.isSoundEnabled
                    ? 'bg-emerald-800/80 border-emerald-400 text-emerald-100'
                    : 'bg-[#2e180d] border-[#6b3819] text-[#e6c280]'
                }`}
              >
                {settings.isSoundEnabled ? 'الصوت مفعّل' : 'تفعيل الصوت'}
              </button>
            </div>

            {/* Volume Slider */}
            {settings.isSoundEnabled && (
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-[#a38b77] font-bold">مستوى الصوت:</span>
                <input
                  id="settings-volume-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    onUpdateSettings({ volume: v });
                    soundManager.setVolume(v);
                  }}
                  className="flex-1 accent-[#8A1538] cursor-pointer"
                />
                <span className="text-xs font-mono text-[#E6C280]">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* 3. سرعة حركة الشخصية (Walking Speed Control for Accessibility) */}
          <div className="p-5 rounded-2xl bg-[#180d06] border border-[#4a2612] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gauge className="w-6 h-6 text-[#E6C280]" />
              <div>
                <h4 className="text-base font-black text-[#FFF4D4]">
                  سرعة حركة الشخصية
                </h4>
                <p className="text-xs text-[#ab927e]">
                  تناسب أجهزة التحكم باللمس والسبورة الذكية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="walk-speed-calm-btn"
                onClick={() => handleSpeedChange('calm')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                  settings.walkSpeed === 'calm'
                    ? 'bg-[#8A1538] border-[#E6C280] text-white'
                    : 'bg-[#2b170c] border-[#5e3419] text-[#e6c280]'
                }`}
              >
                هادئة وبطيئة 🐢
              </button>
              <button
                id="walk-speed-normal-btn"
                onClick={() => handleSpeedChange('normal')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                  settings.walkSpeed === 'normal'
                    ? 'bg-[#8A1538] border-[#E6C280] text-white'
                    : 'bg-[#2b170c] border-[#5e3419] text-[#e6c280]'
                }`}
              >
                عادية 🏃
              </button>
            </div>
          </div>

          {/* 4. تبديل الشخصية (Switch Character) */}
          <div className="p-5 rounded-2xl bg-[#180d06] border border-[#4a2612] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-[#E6C280]" />
              <div>
                <h4 className="text-base font-black text-[#FFF4D4]">
                  شخصية المنتسب
                </h4>
                <p className="text-xs text-[#ab927e]">
                  اختر بين شخصية الولد بالثوب والغترة أو البنت بالبخنق
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="switch-char-boy-btn"
                onClick={() => handleGenderToggle('boy')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  gender === 'boy'
                    ? 'bg-[#8A1538] border-[#E6C280] text-white'
                    : 'bg-[#2b170c] border-[#5e3419] text-[#e6c280]'
                }`}
              >
                <span>👦 ولد</span>
              </button>
              <button
                id="switch-char-girl-btn"
                onClick={() => handleGenderToggle('girl')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  gender === 'girl'
                    ? 'bg-[#8A1538] border-[#E6C280] text-white'
                    : 'bg-[#2b170c] border-[#5e3419] text-[#e6c280]'
                }`}
              >
                <span>👧 بنت</span>
              </button>
            </div>
          </div>

          {/* 5. إعادة تموضع الشخصية إلى الساحة المركزية */}
          <div className="p-4 rounded-xl bg-[#2e190e]/60 border border-[#5a331c] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#E6C280] block">
                هل تود العودة لوسط الساحة؟
              </span>
              <span className="text-[11px] text-[#baa28e]">
                يعيدك فوراً إلى جانب بئر الماء وشجرة السدر
              </span>
            </div>
            <button
              id="reset-pos-center-btn"
              onClick={() => {
                onResetPosition();
                soundManager.playSuccess();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22120a] hover:bg-[#3d2011] border border-[#d49b4b]/40 text-xs font-bold text-[#FFE082] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلى الساحة المركزية</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#170c07] border-t border-[#E6C280]/20 flex justify-end">
          <button
            id="settings-save-and-close-btn"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl bg-[#8A1538] hover:bg-[#9f1941] text-white font-bold text-sm border border-[#E6C280] shadow-md transition-colors cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
