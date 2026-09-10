import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameScene, 
  CharacterGender, 
  StationId, 
  GameSettings, 
  PassportRecord 
} from './types';
import { STATIONS_DATA } from './data/stationsData';
import { IntroScene } from './components/IntroScene';
import { CharacterSelect } from './components/CharacterSelect';
import { GateOpeningScene } from './components/GateOpeningScene';
import { VillageScene } from './components/VillageScene';
import { StationInteriorModal } from './components/StationInteriorModal';
import { PassportModal } from './components/PassportModal';
import { SettingsModal } from './components/SettingsModal';
import { MinimalHud } from './components/MinimalHud';
import { soundManager } from './services/soundEffects';

const STORAGE_KEY = 'qatar_lowwal_heritage_save_v1';

export default function App() {
  // Current game scene - default to 'village' for direct preview of the Master Map
  const [currentScene, setCurrentScene] = useState<GameScene>('village');
  const [activeStationId, setActiveStationId] = useState<StationId | null>(null);

  // Character state
  const [gender, setGender] = useState<CharacterGender>('boy');
  const [studentName, setStudentName] = useState<string>('طالب قطري');

  // Modals state
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Passport stamps
  const [passportRecord, setPassportRecord] = useState<PassportRecord>({
    collectedStamps: {
      souq: false,
      pearl: false,
      games: false,
      majlis: false,
      crafts: false,
      akkas: false,
    },
    studentName: 'طالب قطري',
    gender: 'boy',
    journeyStartDate: new Date().toLocaleDateString('ar-QA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    isQuietMode: false,
    isSoundEnabled: false,
    volume: 0.6,
    walkSpeed: 'normal',
    highContrast: false,
    dpadSize: 'medium',
  });

  // Ref to reset village character position
  const resetPositionRef = useRef<(() => void) | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.passport) setPassportRecord(parsed.passport);
        if (parsed.settings) {
          setSettings((prev) => ({
            ...prev,
            ...parsed.settings,
            // Audio starts disabled per browser policy until clicked
            isSoundEnabled: false,
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          gender,
          studentName,
          passport: passportRecord,
          settings,
        })
      );
    } catch {
      // ignore
    }
  }, [gender, studentName, passportRecord, settings]);

  // Handle Quiet Mode class on document body
  useEffect(() => {
    if (settings.isQuietMode) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }
  }, [settings.isQuietMode]);

  // Audio volume sync
  useEffect(() => {
    soundManager.setVolume(settings.volume);
  }, [settings.volume]);

  // Sound toggle handler
  const handleToggleSound = useCallback(() => {
    const next = !settings.isSoundEnabled;
    setSettings((prev) => ({ ...prev, isSoundEnabled: next }));
    soundManager.setEnabled(next);
    if (next) soundManager.playSuccess();
  }, [settings.isSoundEnabled]);

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Character selection completion
  const handleCharacterSelect = (selectedGender: CharacterGender, name: string) => {
    setGender(selectedGender);
    setStudentName(name);
    setPassportRecord((prev) => ({
      ...prev,
      gender: selectedGender,
      studentName: name,
    }));
    // Move to gate opening sequence
    setCurrentScene('gate_opening');
  };

  // Stamping passport at a station
  const handleStampStation = (stationId: StationId) => {
    setPassportRecord((prev) => ({
      ...prev,
      collectedStamps: {
        ...prev.collectedStamps,
        [stationId]: true,
      },
    }));
  };

  // Count stamped stations
  const stampedCount = Object.values(passportRecord.collectedStamps).filter(Boolean).length;

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#1a0e08] text-[#FAF5EA] font-sans">
      {/* SCENE 1: Cinematic Intro Screen */}
      {currentScene === 'intro' && (
        <IntroScene
          onStart={() => setCurrentScene('character_select')}
          isSoundEnabled={settings.isSoundEnabled}
          onToggleSound={handleToggleSound}
          isQuietMode={settings.isQuietMode}
          onToggleQuietMode={() =>
            handleUpdateSettings({ isQuietMode: !settings.isQuietMode })
          }
        />
      )}

      {/* SCENE 2: Character Selection (Boy / Girl) */}
      {currentScene === 'character_select' && (
        <CharacterSelect
          onSelect={handleCharacterSelect}
          onBack={() => setCurrentScene('intro')}
        />
      )}

      {/* SCENE 3: 3D Gate Opening Transition */}
      {currentScene === 'gate_opening' && (
        <GateOpeningScene
          gender={gender}
          isQuietMode={settings.isQuietMode}
          onComplete={() => setCurrentScene('village')}
        />
      )}

      {/* SCENE 4: 2.5D Isometric Village World (Main Gameplay) */}
      {(currentScene === 'village' || currentScene === 'station_interior') && (
        <>
          <VillageScene
            gender={gender}
            settings={settings}
            stampedStations={passportRecord.collectedStamps}
            onEnterStation={(id) => {
              setActiveStationId(id);
              setCurrentScene('station_interior');
            }}
            onResetPositionRef={(fn) => {
              resetPositionRef.current = fn;
            }}
          />

          {/* Sleek, Compact Minimal Heritage HUD */}
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

      {/* MODAL / SCENE 5: Station Interior View */}
      {currentScene === 'station_interior' && activeStationId && (
        <StationInteriorModal
          station={STATIONS_DATA[activeStationId]}
          gender={gender}
          isStamped={passportRecord.collectedStamps[activeStationId]}
          onStampPassport={(id) => handleStampStation(id as StationId)}
          onClose={() => {
            setCurrentScene('village');
            setActiveStationId(null);
          }}
        />
      )}

      {/* GLOBAL MODAL: Passport Booklet («جوازي») */}
      {isPassportOpen && (
        <PassportModal
          passport={passportRecord}
          onClose={() => setIsPassportOpen(false)}
          onStampStation={handleStampStation}
        />
      )}

      {/* GLOBAL MODAL: Settings & Accessibility */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          gender={gender}
          onUpdateSettings={handleUpdateSettings}
          onChangeGender={(newGender) => {
            setGender(newGender);
            setPassportRecord((prev) => ({ ...prev, gender: newGender }));
          }}
          onResetPosition={() => {
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
