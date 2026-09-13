import React, { useState, useEffect } from 'react';
import { PassportRecord, StationId } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { STATIONS_DATA } from '../data/stationsData';
import { X, Award, Sparkles, Edit3, Check, RotateCw } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface PassportModalProps {
  passport: PassportRecord;
  onClose: () => void;
  onStampStation?: (stationId: StationId) => void;
  onUpdateName?: (name: string) => void;
  onUpdateStartDate?: (date: string) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  passport,
  onClose,
  onUpdateName,
  onUpdateStartDate,
}) => {
  const stationList: StationId[] = ['souq', 'pearl', 'games', 'majlis', 'crafts', 'akkas'];
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(passport.studentName);

  useEffect(() => {
    setNameInput(passport.studentName);
  }, [passport.studentName]);

  const stampedCount = Object.values(passport.collectedStamps).filter(Boolean).length;

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && onUpdateName) {
      onUpdateName(trimmed);
      soundManager.playSuccess();
    }
    setIsEditingName(false);
  };

  const handleAutoRefreshDate = () => {
    const today = new Date().toLocaleDateString('ar-QA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (onUpdateStartDate) {
      onUpdateStartDate(today);
      soundManager.playSuccess();
    }
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
              <div className="w-full space-y-2.5 text-xs">
                {/* Editable Name Field */}
                {isEditingName ? (
                  <div className="border-b border-[#d6be9a]/70 pb-2 bg-[#ecd9be]/40 p-2 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#7d5f49] font-bold">الاسم:</span>
                      <span className="text-[10px] text-[#8A1538] font-semibold">تعديل اسم المنتسب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        id="passport-edit-name-input"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="أدخل اسم المنتسب..."
                        className="flex-1 bg-white border border-[#8A1538] text-[#2c1810] font-bold px-2.5 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8A1538]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                      />
                      <button
                        id="passport-save-name-btn"
                        onClick={handleSaveName}
                        className="bg-[#8A1538] text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-[#a01a42] flex items-center gap-1 transition-colors cursor-pointer"
                        title="حفظ الاسم"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ</span>
                      </button>
                      <button
                        onClick={() => {
                          setNameInput(passport.studentName);
                          setIsEditingName(false);
                        }}
                        className="bg-[#dccbbb] text-[#543b27] px-2 py-1 rounded text-xs font-semibold hover:bg-[#cfbdab] transition-colors cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-[#d6be9a]/70 pb-1.5">
                    <span className="text-[#7d5f49] font-bold">الاسم:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#2c1810] text-sm">{passport.studentName}</span>
                      {onUpdateName && (
                        <button
                          id="passport-open-edit-name-btn"
                          onClick={() => {
                            setNameInput(passport.studentName);
                            setIsEditingName(true);
                          }}
                          className="text-[#8A1538] hover:text-[#a01a42] text-[11px] font-bold flex items-center gap-1 bg-[#8A1538]/10 hover:bg-[#8A1538]/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          title="انقر لتعديل الاسم في الجواز"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between border-b border-[#d6be9a]/70 pb-1">
                  <span className="text-[#7d5f49] font-bold">الصفة:</span>
                  <span className="font-bold text-[#8A1538]">سفير تراث قطر لوّل</span>
                </div>

                {/* Start Date Field with Auto-Update */}
                <div className="flex items-center justify-between border-b border-[#d6be9a]/70 pb-1">
                  <span className="text-[#7d5f49] font-bold">تاريخ البدء:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#3d2011] font-semibold">
                      {passport.journeyStartDate || new Date().toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {onUpdateStartDate && (
                      <button
                        id="passport-auto-refresh-date-btn"
                        onClick={handleAutoRefreshDate}
                        className="text-[#8A1538] hover:text-[#a01a42] text-[10px] font-bold flex items-center gap-1 bg-[#8A1538]/10 hover:bg-[#8A1538]/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        title="تحديث تلقائي لتاريخ اليوم"
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                        <span>اليوم</span>
                      </button>
                    )}
                  </div>
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
