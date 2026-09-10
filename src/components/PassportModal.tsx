import React from 'react';
import { PassportRecord, StationId } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { STATIONS_DATA } from '../data/stationsData';
import { X, Award, Sparkles } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface PassportModalProps {
  passport: PassportRecord;
  onClose: () => void;
  onStampStation?: (stationId: StationId) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({ passport, onClose }) => {
  const stationList: StationId[] = ['souq', 'pearl', 'games', 'majlis', 'crafts', 'akkas'];

  const stampedCount = Object.values(passport.collectedStamps).filter(Boolean).length;

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Passport Booklet Outer Container */}
      <div
        id="passport-booklet-container"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#8A1538] border-4 border-[#E6C280] shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-[#FAF5EA] overflow-hidden"
      >
        {/* Passport Leather Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#6e0f2b] via-[#8A1538] to-[#540a20] border-b-2 border-[#E6C280]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Golden Palm & Swords Emblem */}
            <div className="w-10 h-10 rounded-full border-2 border-[#FFE082] bg-[#540a20] flex items-center justify-center text-[#FFE082] shadow">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h3 className="text-xl sm:text-2xl font-black text-[#FFF4D4] tracking-wide">
                جواز قطر لوّل
              </h3>
              <p className="text-xs text-[#FFE082] font-semibold">
                وثيقة استكشاف التراث القطري الأصيل
              </p>
            </div>
          </div>

          <button
            id="close-passport-btn"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-[#540a20] hover:bg-[#3d0616] border border-[#E6C280] flex items-center justify-center text-[#FFE082] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Passport Inner Spread (Paper parchment effect) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fbf5e8] text-[#2c1810]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Page: Student Identity Card (4 cols on desktop) */}
            <div className="md:col-span-5 bg-[#f4ebd9] p-5 rounded-2xl border-2 border-[#d6be9a] shadow-md text-right flex flex-col items-center">
              {/* Official Seal Watermark */}
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-[#8A1538] tracking-widest block uppercase">
                  دولة قطر • تراث لوّل
                </span>
                <h4 className="text-lg font-black text-[#3d2011]">
                  بطاقة المنتسب
                </h4>
              </div>

              {/* Student Photo Frame */}
              <div className="w-28 h-36 rounded-xl border-3 border-[#8A1538] bg-[#eadecc] p-2 flex items-center justify-center shadow-inner relative overflow-hidden mb-4">
                <CharacterAvatar
                  gender={passport.gender}
                  direction="down"
                  size={90}
                />
                <div className="absolute bottom-1 inset-x-0 text-center bg-[#8A1538]/90 text-white text-[10px] font-bold py-0.5">
                  معتمد
                </div>
              </div>

              {/* Identification Details */}
              <div className="w-full space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#d6be9a]/70 pb-1">
                  <span className="text-[#7d5f49] font-bold">الاسم:</span>
                  <span className="font-black text-[#2c1810] text-sm">{passport.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-[#d6be9a]/70 pb-1">
                  <span className="text-[#7d5f49] font-bold">الصفة:</span>
                  <span className="font-bold text-[#8A1538]">سفير تراث قطر لوّل</span>
                </div>
                <div className="flex justify-between border-b border-[#d6be9a]/70 pb-1">
                  <span className="text-[#7d5f49] font-bold">تاريخ البدء:</span>
                  <span className="font-mono text-[#3d2011]">{passport.journeyStartDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d5f49] font-bold">الأختام المجمعة:</span>
                  <span className="font-bold text-[#8A1538] text-sm">{stampedCount} من 6</span>
                </div>
              </div>
            </div>

            {/* Right Page: 6 Stamp Places (7 cols on desktop) */}
            <div className="md:col-span-7 bg-[#f7efe0] p-5 rounded-2xl border-2 border-[#d6be9a] shadow-md">
              <div className="flex items-center justify-between mb-4 text-right">
                <div>
                  <h4 className="text-lg font-black text-[#8A1538]">
                    أختام محطات قطر لوّل
                  </h4>
                  <p className="text-xs text-[#705642]">
                    الأختام مجهزة للمرحلة القادمة – يمكنك ختم الجواز عند زيارة كل محطة!
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#8A1538]" />
              </div>

              {/* 6 Stamp Circles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stationList.map((id) => {
                  const station = STATIONS_DATA[id];
                  const isStamped = passport.collectedStamps[id];

                  return (
                    <div
                      key={id}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-h-[120px] text-center ${
                        isStamped
                          ? 'border-[#8A1538] bg-[#8A1538]/5 shadow-sm'
                          : 'border-dashed border-[#b89f81] bg-[#ece2cf]/40'
                      }`}
                    >
                      {/* Stamp Seal Graphic */}
                      {isStamped ? (
                        /* Authenticated Stamp Seal */
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#8A1538] flex flex-col items-center justify-center text-[#8A1538] p-1 rotate-[-6deg] animate-stamp">
                          <span className="text-[9px] font-black leading-none">قطر لوّل</span>
                          <span className="text-[11px] font-black my-0.5">{station.title}</span>
                          <span className="text-[8px] font-bold">معتمد ✓</span>
                        </div>
                      ) : (
                        /* Blank Stamp Slot for Phase 1 */
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#a68a6f] flex flex-col items-center justify-center text-[#8d7159] p-1">
                          <span className="text-[10px] font-bold mb-0.5">{station.title}</span>
                          <span className="text-[8px] text-[#a68a6f]">مجهز للختم</span>
                        </div>
                      )}

                      <span className="text-xs font-bold text-[#3d2011] mt-2">
                        {station.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Passport Instructions / Mission Note */}
              <div className="mt-5 p-3 rounded-xl bg-[#ede3d1] text-xs text-[#593d28] leading-relaxed text-right border border-[#d6be9a]">
                <strong>توجيه تربوي:</strong> زُر جميع المحطات الست في القرية وتعرف على كنوز الماضي لتصبح سفيراً معتمداً لتراث قطر لوّل.
              </div>
            </div>
          </div>
        </div>

        {/* Passport Footer */}
        <div className="p-3 bg-[#6e0f2b] border-t border-[#E6C280]/30 text-center text-xs text-[#f4ecd8]">
          وثيقة تراثية رسمية مخصصة لمنتسبي رحلة «قطر لوّل»
        </div>
      </div>
    </div>
  );
};
