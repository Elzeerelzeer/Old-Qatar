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
import { StationScene } from './components/StationScene';
import { SouqScene } from './components/SouqScene';
import { PassportModal } from './components/PassportModal';
import { SettingsModal } from './components/SettingsModal';
import { MinimalHud } from './components/MinimalHud';
import { soundManager } from './services/soundEffects';
import { Direction } from './types';

const STORAGE_KEY = 'qatar_lowwal_heritage_save_v1';

export default function App() {
  // Current game scene - default to 'village' for direct preview of the Master Map
  const [currentScene, setCurrentScene] = useState<GameScene>('village');
  const [activeStationId, setActiveStationId] = useState<StationId | null>(null);

  // Cinematic fade transition state
  const [isFading, setIsFading] = useState(false);

  // Player position in village: starts in front of «بوابة قطر لوّل» (x: 50, y: 87)
  const [playerVillagePos, setPlayerVillagePos] = useState<{
    x: number;
    y: number;
    direction: Direction;
  }>({
    x: 50,
    y: 87,
    direction: 'up',
  });

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

  // Transition into Station Scene with Short Cinematic Fade
  const handleEnterStation = (id: StationId) => {
    const station = STATIONS_DATA[id];
    // Record exact station door entrance coordinates as spawn point when returning
    setPlayerVillagePos({
      x: station.doorX,
      y: station.doorY,
      direction: 'down',
    });
    setIsFading(true);
    setTimeout(() => {
      setActiveStationId(id);
      setCurrentScene('station_interior');
      setIsFading(false);
    }, 280);
  };

  // Return to Village with Short Cinematic Fade (character stays at same station entrance)
  const handleReturnToVillage = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentScene('village');
      setActiveStationId(null);
      setIsFading(false);
    }, 280);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#1a0e08] text-[#FAF5EA] font-sans">
      {/* Cinematic Fade Transition Overlay */}
      <div
        id="cinematic-fade-overlay"
        className={`fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-300 ease-in-out ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
      />

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

      {/* SCENE 5: Independent Station Scene */}
      {currentScene === 'station_interior' && activeStationId && (
        activeStationId === 'souq' ? (
          <SouqScene
            gender={gender}
            settings={settings}
            onReturnToVillage={handleReturnToVillage}
          />
        ) : (
          <StationScene
            station={STATIONS_DATA[activeStationId]}
            gender={gender}
            isStamped={passportRecord.collectedStamps[activeStationId]}
            onStampPassport={(id) => handleStampStation(id as StationId)}
            onReturnToVillage={handleReturnToVillage}
          />
        )
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
            setPlayerVillagePos({ x: 50, y: 87, direction: 'up' });
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
