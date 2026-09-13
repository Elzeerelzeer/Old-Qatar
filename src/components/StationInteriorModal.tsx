import React from 'react';
import { StationData, CharacterGender } from '../types';
import { ArrowRight, Sparkles, Compass, CheckCircle2, Bookmark } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface StationInteriorModalProps {
  station: StationData;
  gender: CharacterGender;
  onClose: () => void;
  onStampPassport?: (stationId: string) => void;
  isStamped?: boolean;
}

export const StationInteriorModal: React.FC<StationInteriorModalProps> = ({
  station,
  gender,
  onClose,
  onStampPassport,
  isStamped = false,
}) => {
  const { interiorInfo } = station;

  const handleReturn = () => {
    soundManager.playClick();
    onClose();
  };

  const handleStamp = () => {
    if (onStampPassport) {
      soundManager.playSuccess();
      onStampPassport(station.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Container with Qatari Heritage Frame */}
      <div
        id={`interior-modal-${station.id}`}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#20130b] border-2 sm:border-3 border-[#E6C280] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-[#FAF5EA] overflow-hidden"
      >
        {/* Top Themed Header Banner */}
        <div
          className="relative px-6 py-5 sm:py-6 flex items-center justify-between border-b-2 border-[#E6C280]/30"
          style={{
            background: `linear-gradient(135deg, ${station.color} 0%, #1c0e07 100%)`,
          }}
        >
          {/* Station Title & Subtitle */}
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#E6C280] text-[#1c0e07] mb-1.5 shadow-sm">
              {station.badgeText}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#FFF4D4] drop-shadow-md">
              {station.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#FFE082] font-semibold mt-0.5">
              {interiorInfo.subText}
            </p>
          </div>

          {/* Return to Village Button (زر العودة إلى القرية) */}
          <button
            id="interior-return-to-village-btn"
            onClick={handleReturn}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl bg-[#8A1538] hover:bg-[#a61a44] border-2 border-[#E6C280] text-white font-extrabold text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>العودة إلى القرية</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Visual Card / Temporary Graphic Presentation */}
          <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#2e180d] via-[#3a1f11] to-[#25130a] border border-[#d49b4b]/30 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#E6C280] text-xs sm:text-sm font-bold mb-1">
                  <Compass className="w-4 h-4" />
                  <span>المحطة التراثية • المرحلة الأولى</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#FFF4D4] mb-2">
                  {interiorInfo.bannerText}
                </h3>
                <p className="text-xs sm:text-sm text-[#d6beaa] leading-relaxed max-w-xl">
                  {station.description}
                </p>
              </div>

              {/* Stamp Action Pill */}
              <button
                id="stamp-passport-station-btn"
                onClick={handleStamp}
                disabled={isStamped}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shrink-0 border ${
                  isStamped
                    ? 'bg-[#14532d] border-[#4ade80] text-[#dcfce7] cursor-default'
                    : 'bg-[#8A1538] hover:bg-[#9f1941] border-[#E6C280] text-white cursor-pointer hover:scale-105'
                }`}
              >
                {isStamped ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>تم ختم الجواز للمحطة ✓</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5 text-[#FFE082]" />
                    <span>ختم جواز قطر لوّل</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Educational Artifacts / Highlights Grid */}
          <div>
            <h4 className="text-lg font-black text-[#E6C280] mb-3 text-right flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E6C280]" />
              <span>مقتنيات ومعالم {station.title}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interiorInfo.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#1b0f08]/90 border border-[#5a331c]/50 hover:border-[#E6C280]/60 transition-colors text-right"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8A1538]/70 text-[#FFE082] font-semibold">
                      {item.tag || 'تراث قطري'}
                    </span>
                    <h5 className="font-extrabold text-[#FAF5EA] text-base">
                      {item.title}
                    </h5>
                  </div>
                  <p className="text-xs sm:text-sm text-[#c9b39e] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Future Prepared Activities for Phase 2 */}
          {interiorInfo.futureOptions && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#170c07] border border-[#d49b4b]/20 text-right">
              <span className="text-xs text-[#E6C280] font-bold block mb-2">
                {interiorInfo.futureOptionsTitle || 'أنشطة وتجارب قادمة في هذه المحطة:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {interiorInfo.futureOptions.map((opt, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#28150c] border border-[#5e3217] text-xs font-semibold text-[#e2cfbd]"
                  >
                    ✨ {opt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="p-4 sm:p-5 bg-[#170c07] border-t border-[#E6C280]/20 flex items-center justify-between">
          <span className="text-xs text-[#a8907a]">
            المنتسب: {gender === 'boy' ? 'منتسب قطري بالثوب والغترة' : 'منتسبة قطرية بالبخنق التراثي'}
          </span>
          <button
            id="interior-modal-close-bottom-btn"
            onClick={handleReturn}
            className="px-6 py-2 rounded-xl bg-[#2a160d] hover:bg-[#3d1f11] border border-[#E6C280]/40 text-[#E6C280] font-bold text-sm transition-colors cursor-pointer"
          >
            إغلاق والعودة للساحة
          </button>
        </div>
      </div>
    </div>
  );
};
