import React, { useState } from 'react';
import { CharacterGender } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { Check, ArrowRight, UserCheck } from 'lucide-react';
import { soundManager } from '../services/soundEffects';

interface CharacterSelectProps {
  initialName?: string;
  initialGender?: CharacterGender;
  onSelect: (gender: CharacterGender, name: string) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  initialName = '',
  initialGender = 'boy',
  onSelect,
  onBack,
}) => {
  const [selectedGender, setSelectedGender] = useState<CharacterGender>(initialGender);
  const [studentName, setStudentName] = useState<string>(
    initialName && initialName !== 'منتسب قطري' && initialName !== 'منتسبة قطرية'
      ? initialName
      : ''
  );

  const handleGenderChoose = (gender: CharacterGender) => {
    setSelectedGender(gender);
    soundManager.playClick();
  };

  const handleConfirm = () => {
    const trimmed = studentName.trim();
    const finalName = trimmed || (selectedGender === 'boy' ? 'منتسب قطري' : 'منتسبة قطرية');
    soundManager.playSuccess();
    onSelect(selectedGender, finalName);
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-between overflow-y-auto bg-gradient-to-b from-[#180f0a] via-[#2a170e] to-[#120a05] text-[#FAF5EA] p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between pt-2">
        <button
          id="char-select-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#24150e] border border-[#d49b4b]/40 text-[#E6C280] font-bold text-sm sm:text-base hover:bg-[#381f13] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للبوابة</span>
        </button>

        <div className="text-center">
          <span className="text-xs text-[#d49b4b] uppercase tracking-wider font-semibold">
            الخطوة الأولى • اختيار الشخصية
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-[#FFF4D4]">
            اختر رفيق رحلتك في «قطر لوّل»
          </h2>
        </div>

        <div className="w-24 hidden sm:block" />
      </header>

      {/* Main Selection Area */}
      <main className="w-full max-w-4xl my-auto py-6 flex flex-col items-center">
        {/* Character Selection Cards: Boy & Girl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl mb-6">
          {/* Card 1: Boy (الولد) */}
          <div
            id="select-boy-card"
            onClick={() => handleGenderChoose('boy')}
            className={`group relative flex flex-col items-center p-6 rounded-3xl cursor-pointer transition-all duration-300 border-3 text-center ${
              selectedGender === 'boy'
                ? 'bg-gradient-to-b from-[#3d1e11] to-[#24130a] border-[#E6C280] shadow-[0_0_30px_rgba(230,194,128,0.3)] scale-[1.02]'
                : 'bg-[#20130c]/80 border-[#5a331c]/60 hover:border-[#a36838] opacity-85 hover:opacity-100'
            }`}
          >
            {/* Selected Badge */}
            {selectedGender === 'boy' && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#8A1538] border-2 border-[#E6C280] flex items-center justify-center text-white shadow-md">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            )}

            {/* Character Graphic */}
            <div className="h-44 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <CharacterAvatar
                gender="boy"
                direction="down"
                isMoving={selectedGender === 'boy'}
                isCelebrating={selectedGender === 'boy'}
                size={110}
              />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-[#FFF4D4] mb-1">
              شخصية الولد
            </h3>
            <p className="text-sm text-[#E6C280] font-semibold mb-3">
              منتسب قطري
            </p>

            {/* Attire Features Checklist */}
            <ul className="text-xs text-[#d8c5b2] space-y-1.5 bg-[#170c07]/60 p-3 rounded-xl w-full border border-white/5 text-right">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span>ثوب أبيض ناصع بتفاصيل قطرية</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                <span>غترة بيضاء وعقال أسود أصيل</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8A1538] inline-block" />
                <span>حقيبة مدرسية عنابية بشعار ذهبي</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Girl (البنت) */}
          <div
            id="select-girl-card"
            onClick={() => handleGenderChoose('girl')}
            className={`group relative flex flex-col items-center p-6 rounded-3xl cursor-pointer transition-all duration-300 border-3 text-center ${
              selectedGender === 'girl'
                ? 'bg-gradient-to-b from-[#3d1e11] to-[#24130a] border-[#E6C280] shadow-[0_0_30px_rgba(230,194,128,0.3)] scale-[1.02]'
                : 'bg-[#20130c]/80 border-[#5a331c]/60 hover:border-[#a36838] opacity-85 hover:opacity-100'
            }`}
          >
            {/* Selected Badge */}
            {selectedGender === 'girl' && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#8A1538] border-2 border-[#E6C280] flex items-center justify-center text-white shadow-md">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            )}

            {/* Character Graphic */}
            <div className="h-44 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <CharacterAvatar
                gender="girl"
                direction="down"
                isMoving={selectedGender === 'girl'}
                isCelebrating={selectedGender === 'girl'}
                size={110}
              />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-[#FFF4D4] mb-1">
              شخصية البنت
            </h3>
            <p className="text-sm text-[#E6C280] font-semibold mb-3">
              منتسبة قطرية
            </p>

            {/* Attire Features Checklist */}
            <ul className="text-xs text-[#d8c5b2] space-y-1.5 bg-[#170c07]/60 p-3 rounded-xl w-full border border-white/5 text-right">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#292524] inline-block" />
                <span>بخنق قطري محتشم مطرز بالزري الذهبي</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6B21A8] inline-block" />
                <span>زي تراثي محتشم وأنيق مناسب للعمر</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8A1538] inline-block" />
                <span>حقيبة مدرسية عنابية لحفظ الجواز</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Optional Student Name Input for Passport */}
        <div className="w-full max-w-md bg-[#24140b] p-4 rounded-2xl border border-[#d49b4b]/30 mb-6 text-right">
          <label htmlFor="student-name-input" className="block text-xs sm:text-sm font-bold text-[#E6C280] mb-1.5">
            اسم المنتسب (يكتب تلقائياً على جواز قطر لوّل والشهادة):
          </label>
          <input
            id="student-name-input"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder={selectedGender === 'boy' ? 'مثال: جاسم القطري (أو اتركه للافتراضي)' : 'مثال: مريم القطرية (أو اتركه للافتراضي)'}
            className="w-full bg-[#150a04] border border-[#5a331c] rounded-xl px-4 py-3 text-base text-[#FAF5EA] placeholder-[#7d5f49] focus:outline-none focus:border-[#E6C280]"
          />
          <p className="text-[11px] text-[#cca583] mt-2 flex items-center gap-1">
            <span>📅</span>
            <span>يتم تسجيل تاريخ البدء تلقائياً اليوم في الجواز، ويمكنك تعديل الاسم لاحقاً من الجواز أو الإعدادات.</span>
          </p>
        </div>

        {/* Confirm Button */}
        <button
          id="confirm-character-btn"
          onClick={handleConfirm}
          className="w-full max-w-md flex items-center justify-center gap-3 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#8A1538] via-[#ab1a45] to-[#8A1538] text-white font-extrabold text-lg sm:text-xl border-2 border-[#E6C280] shadow-[0_8px_25px_rgba(138,21,56,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserCheck className="w-6 h-6 text-[#FFE082]" />
          <span>تأكيد الشخصية والدخول إلى القرية</span>
        </button>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-xs text-[#a38b77] pb-2">
        يمكن تغيير الشخصية في أي وقت لاحقاً من شاشة الإعدادات ⚙
      </footer>
    </div>
  );
};
