import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { CharacterGender, GameSettings } from '../types';
import { soundManager } from '../services/soundEffects';
import { SouqScene } from './SouqScene';

interface SouqSceneWithProgressProps {
  gender: CharacterGender;
  settings: GameSettings;
  isStamped?: boolean;
  onReturnToVillage: () => void;
  onComplete: () => void;
}

interface SouqHotspotOpenedDetail {
  spotId?: string;
  spotName?: string;
}

const SOUQ_PROGRESS_EVENT = 'qatar-lowwal:souq-hotspot-opened';
const REQUIRED_SHOPS = 2;

export const SouqSceneWithProgress: React.FC<SouqSceneWithProgressProps> = ({
  gender,
  settings,
  isStamped = false,
  onReturnToVillage,
  onComplete,
}) => {
  const [visitedShops, setVisitedShops] = useState<Set<string>>(() => new Set());
  const [completed, setCompleted] = useState(isStamped);
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  const completionSentRef = useRef(isStamped);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isStamped) {
      setCompleted(true);
      completionSentRef.current = true;
    }
  }, [isStamped]);

  useEffect(() => {
    const handleHotspotOpened = (event: Event) => {
      if (completed || completionSentRef.current) return;

      const customEvent = event as CustomEvent<SouqHotspotOpenedDetail>;
      const spotId = customEvent.detail?.spotId;

      if (!spotId) return;

      setVisitedShops((previous) => {
        if (previous.has(spotId)) {
          return previous;
        }

        const next = new Set(previous);
        next.add(spotId);

        if (next.size >= REQUIRED_SHOPS && !completionSentRef.current) {
          completionSentRef.current = true;
          setCompleted(true);
          setShowCompletionToast(true);
          onComplete();

          if (settings.isSoundEnabled && !settings.isQuietMode) {
            soundManager.playSuccess();
          }

          if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
          }

          toastTimerRef.current = window.setTimeout(() => {
            setShowCompletionToast(false);
          }, 2600);
        }

        return next;
      });
    };

    window.addEventListener(SOUQ_PROGRESS_EVENT, handleHotspotOpened);

    return () => {
      window.removeEventListener(SOUQ_PROGRESS_EVENT, handleHotspotOpened);

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [completed, onComplete, settings.isQuietMode, settings.isSoundEnabled]);

  /*
    The legacy Souq header still contains a static "0/2" badge.
    Hide that badge only, then display the real live progress badge below.
    This keeps the rich existing SouqScene untouched.
  */
  useEffect(() => {
    const hideLegacyProgressBadge = () => {
      const root = document.getElementById('souq-exploration-viewport');
      if (!root) return;

      const candidates = root.querySelectorAll<HTMLElement>('div');

      candidates.forEach((element) => {
        const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        const hasLegacyValue = text.includes('رحلة السوق') && text.includes('0/2');
        const isSmallBadge = element.className.includes('rounded-full');

        if (hasLegacyValue && isSmallBadge) {
          element.style.display = 'none';
        }
      });
    };

    hideLegacyProgressBadge();

    const observer = new MutationObserver(hideLegacyProgressBadge);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const visitedCount = completed
    ? REQUIRED_SHOPS
    : Math.min(REQUIRED_SHOPS, visitedShops.size);

  return (
    <div className="relative w-full h-full">
      <SouqScene
        gender={gender}
        settings={settings}
        onReturnToVillage={onReturnToVillage}
      />

      <div
        className={`fixed top-[72px] right-[max(12px,env(safe-area-inset-right))] z-[180] rounded-2xl border-2 px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all ${
          completed
            ? 'bg-emerald-950/90 border-emerald-300 text-emerald-100'
            : 'bg-[#2b170d]/92 border-[#E6C280] text-[#FAF5EA]'
        }`}
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#FFE082] shrink-0" />
          )}

          <div className="leading-tight">
            <div className="text-xs font-black">
              {completed ? 'اكتملت رحلة السوق' : 'رحلة السوق'}
            </div>
            <div className="mt-0.5 text-[11px] font-bold opacity-90">
              {visitedCount}/{REQUIRED_SHOPS} دكاكين
            </div>
          </div>
        </div>
      </div>

      {showCompletionToast && (
        <div
          className="fixed inset-0 z-[360] pointer-events-none flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="w-[min(90vw,460px)] rounded-[28px] border-2 border-[#FFE082] bg-[#2B170F]/96 p-5 text-center shadow-[0_24px_90px_rgba(0,0,0,.75)] backdrop-blur-md">
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#FFE082] bg-[#8A1538] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#FFE082]" />
            </div>

            <h3 className="mt-3 text-2xl font-black text-[#FFE082]">
              أحسنت!
            </h3>

            <p className="mt-1 text-sm sm:text-base font-bold text-white/90">
              زرت دكانين مختلفين وأكملت رحلة سوق لوّل.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-950/45 px-3 py-1.5 text-xs font-black text-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              تم إضافة ختم السوق إلى الجواز
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
