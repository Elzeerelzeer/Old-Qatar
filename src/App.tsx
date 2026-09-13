import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  CharacterGender,
  Direction,
  GameScene,
  GameSettings,
  PassportRecord,
  StationId,
} from './types';

import { STATIONS_DATA } from './data/stationsData';

import { IntroScene } from './components/IntroScene';
import { CharacterSelect } from './components/CharacterSelect';
import { GateOpeningScene } from './components/GateOpeningScene';
import { VillageScene } from './components/VillageScene';
import { StationScene } from './components/StationScene';
import { SouqScene } from './components/SouqScene';
import { PearlScene } from './components/PearlScene';
import { GamesScene } from './components/GamesScene';
import { MajlisScene } from './components/MajlisScene';
import { CraftsScene } from './components/CraftsScene';
import { AkkasScene } from './components/AkkasScene';
import { FinalCelebrationScene } from './components/FinalCelebrationScene';

import { PassportModal } from './components/PassportModal';
import { SettingsModal } from './components/SettingsModal';
import { MinimalHud } from './components/MinimalHud';

import { soundManager } from './services/soundEffects';

const STORAGE_KEY = 'qatar_lowwal_heritage_save_v1';

const createEmptyStamps = (): Record<StationId, boolean> => ({
  souq: false,
  pearl: false,
  games: false,
  majlis: false,
  crafts: false,
  akkas: false,
});

const createJourneyDate = () =>
  new Date().toLocaleDateString('ar-QA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function App() {
  const [currentScene, setCurrentScene] = useState<GameScene>('village');
  const [activeStationId, setActiveStationId] = useState<StationId | null>(null);
  const [isFading, setIsFading] = useState(false);

  const [playerVillagePos, setPlayerVillagePos] = useState<{
    x: number;
    y: number;
    direction: Direction;
  }>({
    x: 50,
    y: 87,
    direction: 'up',
  });

  const [gender, setGender] = useState<CharacterGender>('boy');
  const [studentName, setStudentName] = useState<string>('طالب قطري');

  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [finaleSeen, setFinaleSeen] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);

  const [passportRecord, setPassportRecord] = useState<PassportRecord>({
    collectedStamps: createEmptyStamps(),
    studentName: 'طالب قطري',
    gender: 'boy',
    journeyStartDate: createJourneyDate(),
  });

  const [settings, setSettings] = useState<GameSettings>({
    isQuietMode: false,
    isSoundEnabled: false,
    volume: 0.6,
    walkSpeed: 'normal',
    highContrast: false,
    dpadSize: 'medium',
  });

  const resetPositionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed.gender) setGender(parsed.gender);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.passport) setPassportRecord(parsed.passport);
        if (typeof parsed.finaleSeen === 'boolean') setFinaleSeen(parsed.finaleSeen);

        if (parsed.settings) {
          setSettings((prev) => ({
            ...prev,
            ...parsed.settings,
            isSoundEnabled: false,
          }));
        }
      }
    } catch {
      // Ignore corrupted save data.
    } finally {
      setSaveLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!saveLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          gender,
          studentName,
          passport: passportRecord,
          settings,
          finaleSeen,
        })
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [gender, studentName, passportRecord, settings, finaleSeen, saveLoaded]);

  useEffect(() => {
    if (settings.isQuietMode) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }
  }, [settings.isQuietMode]);

  useEffect(() => {
    soundManager.setVolume(settings.volume);
  }, [settings.volume]);

  const handleToggleSound = useCallback(() => {
    const next = !settings.isSoundEnabled;

    setSettings((prev) => ({
      ...prev,
      isSoundEnabled: next,
    }));

    soundManager.setEnabled(next);

    if (next) {
      soundManager.playSuccess();
    }
  }, [settings.isSoundEnabled]);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const handleCharacterSelect = (
    selectedGender: CharacterGender,
    name: string
  ) => {
    setGender(selectedGender);
    setStudentName(name);

    setPassportRecord((prev) => ({
      ...prev,
      gender: selectedGender,
      studentName: name,
    }));

    setCurrentScene('gate_opening');
  };

  const handleStampStation = (stationId: StationId) => {
    setPassportRecord((prev) => ({
      ...prev,
      collectedStamps: {
        ...prev.collectedStamps,
        [stationId]: true,
      },
    }));
  };

  const stampedCount = Object.values(passportRecord.collectedStamps).filter(Boolean).length;

  useEffect(() => {
    if (!saveLoaded || finaleSeen || stampedCount !== 6 || currentScene !== 'village') {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setIsFading(true);

      const sceneTimer = window.setTimeout(() => {
        setCurrentScene('finale');
        setActiveStationId(null);
        setIsFading(false);
      }, 280);

      return () => window.clearTimeout(sceneTimer);
    }, 700);

    return () => window.clearTimeout(revealTimer);
  }, [saveLoaded, finaleSeen, stampedCount, currentScene]);

  const handleEnterStation = (id: StationId) => {
    const station = STATIONS_DATA[id];

    setPlayerVillagePos({
      x: station.doorX,
      y: station.doorY,
      direction: 'down',
    });

    setIsFading(true);

    window.setTimeout(() => {
      setActiveStationId(id);
      setCurrentScene('station_interior');
      setIsFading(false);
    }, 280);
  };

  const handleReturnToVillage = () => {
    /*
      Souq currently has no onComplete callback in its component.
      Register its stamp when the visitor finishes the visit and returns.
      The other five stations continue to stamp through their own completion flows.
    */
    if (activeStationId === 'souq' && !passportRecord.collectedStamps.souq) {
      handleStampStation('souq');
    }

    setIsFading(true);

    window.setTimeout(() => {
      setCurrentScene('village');
      setActiveStationId(null);
      setIsFading(false);
    }, 280);
  };

  const handleReturnFromFinale = () => {
    setFinaleSeen(true);
    setCurrentScene('village');
    setActiveStationId(null);
  };

  const handleStartNewJourney = () => {
    setFinaleSeen(false);
    setPassportRecord((prev) => ({
      ...prev,
      collectedStamps: createEmptyStamps(),
      journeyStartDate: createJourneyDate(),
    }));

    setPlayerVillagePos({
      x: 50,
      y: 87,
      direction: 'up',
    });

    setActiveStationId(null);
    setCurrentScene('gate_opening');
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden select-none bg-[#1a0e08] text-[#FAF5EA] font-sans">
      <div
        id="cinematic-fade-overlay"
        className={`fixed inset-0 z-[500] bg-black pointer-events-none transition-opacity duration-300 ease-in-out ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {currentScene === 'intro' && (
        <IntroScene
          onStart={() => setCurrentScene('character_select')}
          isSoundEnabled={settings.isSoundEnabled}
          onToggleSound={handleToggleSound}
          isQuietMode={settings.isQuietMode}
          onToggleQuietMode={() =>
            handleUpdateSettings({
              isQuietMode: !settings.isQuietMode,
            })
          }
        />
      )}

      {currentScene === 'character_select' && (
        <CharacterSelect
          onSelect={handleCharacterSelect}
          onBack={() => setCurrentScene('intro')}
        />
      )}

      {currentScene === 'gate_opening' && (
        <GateOpeningScene
          gender={gender}
          isQuietMode={settings.isQuietMode}
          onComplete={() => setCurrentScene('village')}
        />
      )}

      {currentScene === 'village' && (
        <>
          <VillageScene
            gender={gender}
            settings={settings}
            stampedStations={passportRecord.collectedStamps}
            initialPos={playerVillagePos}
            onEnterStation={handleEnterStation}
            onResetPositionRef={(fn) => {
              resetPositionRef.current = fn;
            }}
          />

          <MinimalHud
            onGoHome={() => {
              setCurrentScene('intro');
              setActiveStationId(null);
            }}
            onOpenPassport={() => setIsPassportOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isSoundEnabled={settings.isSoundEnabled}
            onToggleSound={handleToggleSound}
            stampedCount={stampedCount}
          />
        </>
      )}

      {currentScene === 'station_interior' && activeStationId && (
        <>
          {activeStationId === 'souq' && (
            <SouqScene
              gender={gender}
              settings={settings}
              onReturnToVillage={handleReturnToVillage}
            />
          )}

          {activeStationId === 'pearl' && (
            <PearlScene
              gender={gender}
              settings={settings}
              onReturnToVillage={handleReturnToVillage}
              onComplete={() => handleStampStation('pearl')}
            />
          )}

          {activeStationId === 'games' && (
            <GamesScene
              gender={gender}
              settings={settings}
              onReturnToVillage={handleReturnToVillage}
              onComplete={() => handleStampStation('games')}
            />
          )}

          {activeStationId === 'majlis' && (
            <MajlisScene
              gender={gender}
              settings={settings}
              onReturnToVillage={handleReturnToVillage}
              onComplete={() => handleStampStation('majlis')}
            />
          )}

          {activeStationId === 'crafts' && (
            <CraftsScene
              gender={gender}
              settings={settings}
              onReturnToVillage={handleReturnToVillage}
              onComplete={() => handleStampStation('crafts')}
            />
          )}

          {activeStationId === 'akkas' && (
            <AkkasScene
              gender={gender}
              settings={settings}
              studentName={studentName}
              onReturnToVillage={handleReturnToVillage}
              onComplete={() => handleStampStation('akkas')}
            />
          )}

          {activeStationId !== 'souq' &&
            activeStationId !== 'pearl' &&
            activeStationId !== 'games' &&
            activeStationId !== 'majlis' &&
            activeStationId !== 'crafts' &&
            activeStationId !== 'akkas' && (
              <StationScene
                station={STATIONS_DATA[activeStationId]}
                gender={gender}
                isStamped={passportRecord.collectedStamps[activeStationId]}
                onStampPassport={(id) => handleStampStation(id as StationId)}
                onReturnToVillage={handleReturnToVillage}
              />
            )}
        </>
      )}

      {currentScene === 'finale' && (
        <FinalCelebrationScene
          passport={passportRecord}
          gender={gender}
          settings={settings}
          onOpenPassport={() => setIsPassportOpen(true)}
          onReturnToVillage={handleReturnFromFinale}
          onStartNewJourney={handleStartNewJourney}
        />
      )}

      {isPassportOpen && (
        <PassportModal
          passport={passportRecord}
          onClose={() => setIsPassportOpen(false)}
          onStampStation={handleStampStation}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          gender={gender}
          onUpdateSettings={handleUpdateSettings}
          onChangeGender={(newGender) => {
            setGender(newGender);
            setPassportRecord((prev) => ({
              ...prev,
              gender: newGender,
            }));
          }}
          onResetPosition={() => {
            setPlayerVillagePos({
              x: 50,
              y: 87,
              direction: 'up',
            });

            if (resetPositionRef.current) {
              resetPositionRef.current();
            }
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
