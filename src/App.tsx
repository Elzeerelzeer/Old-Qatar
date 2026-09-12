import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import {
  GameScene,
  CharacterGender,
  StationId,
  GameSettings,
  PassportRecord,
  Direction,
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

import { PassportModal } from './components/PassportModal';
import { SettingsModal } from './components/SettingsModal';
import { MinimalHud } from './components/MinimalHud';

import { soundManager } from './services/soundEffects';

const STORAGE_KEY = 'qatar_lowwal_heritage_save_v1';

export default function App() {
  /* ============================================================
     CURRENT SCENE
  ============================================================ */

  const [currentScene, setCurrentScene] =
    useState<GameScene>('village');

  const [activeStationId, setActiveStationId] =
    useState<StationId | null>(null);

  /* ============================================================
     CINEMATIC FADE
  ============================================================ */

  const [isFading, setIsFading] =
    useState(false);

  /* ============================================================
     VILLAGE PLAYER POSITION
  ============================================================ */

  const [
    playerVillagePos,
    setPlayerVillagePos,
  ] = useState<{
    x: number;
    y: number;
    direction: Direction;
  }>({
    x: 50,
    y: 87,
    direction: 'up',
  });

  /* ============================================================
     CHARACTER
  ============================================================ */

  const [gender, setGender] =
    useState<CharacterGender>('boy');

  const [studentName, setStudentName] =
    useState<string>('طالب قطري');

  /* ============================================================
     GLOBAL MODALS
  ============================================================ */

  const [isPassportOpen, setIsPassportOpen] =
    useState(false);

  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);

  /* ============================================================
     PASSPORT
  ============================================================ */

  const [passportRecord, setPassportRecord] =
    useState<PassportRecord>({
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

      journeyStartDate:
        new Date().toLocaleDateString('ar-QA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
    });

  /* ============================================================
     SETTINGS
  ============================================================ */

  const [settings, setSettings] =
    useState<GameSettings>({
      isQuietMode: false,
      isSoundEnabled: false,
      volume: 0.6,
      walkSpeed: 'normal',
      highContrast: false,
      dpadSize: 'medium',
    });

  /* ============================================================
     RESET POSITION REF
  ============================================================ */

  const resetPositionRef =
    useRef<(() => void) | null>(null);

  /* ============================================================
     LOAD SAVE
  ============================================================ */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed =
        JSON.parse(saved);

      if (parsed.gender) {
        setGender(parsed.gender);
      }

      if (parsed.studentName) {
        setStudentName(parsed.studentName);
      }

      if (parsed.passport) {
        setPassportRecord(parsed.passport);
      }

      if (parsed.settings) {
        setSettings((prev) => ({
          ...prev,
          ...parsed.settings,

          // Browser policy: audio starts disabled until user interaction.
          isSoundEnabled: false,
        }));
      }
    } catch {
      // Ignore corrupted save data.
    }
  }, []);

  /* ============================================================
     SAVE DATA
  ============================================================ */

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
      // Ignore localStorage failures.
    }
  }, [
    gender,
    studentName,
    passportRecord,
    settings,
  ]);

  /* ============================================================
     QUIET MODE
  ============================================================ */

  useEffect(() => {
    if (settings.isQuietMode) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }
  }, [settings.isQuietMode]);

  /* ============================================================
     AUDIO VOLUME
  ============================================================ */

  useEffect(() => {
    soundManager.setVolume(settings.volume);
  }, [settings.volume]);

  /* ============================================================
     SOUND TOGGLE
  ============================================================ */

  const handleToggleSound =
    useCallback(() => {
      const next =
        !settings.isSoundEnabled;

      setSettings((prev) => ({
        ...prev,
        isSoundEnabled: next,
      }));

      soundManager.setEnabled(next);

      if (next) {
        soundManager.playSuccess();
      }
    }, [settings.isSoundEnabled]);

  /* ============================================================
     SETTINGS UPDATE
  ============================================================ */

  const handleUpdateSettings = (
    newSettings: Partial<GameSettings>
  ) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  /* ============================================================
     CHARACTER SELECTION
  ============================================================ */

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

  /* ============================================================
     STAMP PASSPORT
  ============================================================ */

  const handleStampStation = (
    stationId: StationId
  ) => {
    setPassportRecord((prev) => ({
      ...prev,

      collectedStamps: {
        ...prev.collectedStamps,
        [stationId]: true,
      },
    }));
  };

  /* ============================================================
     STAMP COUNT
  ============================================================ */

  const stampedCount =
    Object.values(
      passportRecord.collectedStamps
    ).filter(Boolean).length;

  /* ============================================================
     ENTER STATION
  ============================================================ */

  const handleEnterStation = (
    id: StationId
  ) => {
    const station =
      STATIONS_DATA[id];

    /*
      Keep the village player positioned at the station entrance
      when returning from that station.
    */
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

  /* ============================================================
     RETURN TO VILLAGE
  ============================================================ */

  const handleReturnToVillage =
    () => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentScene('village');
        setActiveStationId(null);
        setIsFading(false);
      }, 280);
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        relative
        w-full
        h-screen
        overflow-hidden
        select-none
        bg-[#1a0e08]
        text-[#FAF5EA]
        font-sans
      "
    >
      {/* ========================================================
          CINEMATIC FADE
      ======================================================== */}

      <div
        id="cinematic-fade-overlay"
        className={`
          fixed
          inset-0
          z-[100]
          bg-black
          pointer-events-none
          transition-opacity
          duration-300
          ease-in-out

          ${
            isFading
              ? 'opacity-100'
              : 'opacity-0'
          }
        `}
      />

      {/* ========================================================
          SCENE 1 — INTRO
      ======================================================== */}

      {currentScene === 'intro' && (
        <IntroScene
          onStart={() =>
            setCurrentScene('character_select')
          }
          isSoundEnabled={settings.isSoundEnabled}
          onToggleSound={handleToggleSound}
          isQuietMode={settings.isQuietMode}
          onToggleQuietMode={() =>
            handleUpdateSettings({
              isQuietMode:
                !settings.isQuietMode,
            })
          }
        />
      )}

      {/* ========================================================
          SCENE 2 — CHARACTER SELECT
      ======================================================== */}

      {currentScene === 'character_select' && (
        <CharacterSelect
          onSelect={handleCharacterSelect}
          onBack={() =>
            setCurrentScene('intro')
          }
        />
      )}

      {/* ========================================================
          SCENE 3 — GATE OPENING
      ======================================================== */}

      {currentScene === 'gate_opening' && (
        <GateOpeningScene
          gender={gender}
          isQuietMode={settings.isQuietMode}
          onComplete={() =>
            setCurrentScene('village')
          }
        />
      )}

      {/* ========================================================
          SCENE 4 — VILLAGE
      ======================================================== */}

      {currentScene === 'village' && (
        <>
          <VillageScene
            gender={gender}
            settings={settings}
            stampedStations={
              passportRecord.collectedStamps
            }
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
            onOpenPassport={() =>
              setIsPassportOpen(true)
            }
            onOpenSettings={() =>
              setIsSettingsOpen(true)
            }
            isSoundEnabled={
              settings.isSoundEnabled
            }
            onToggleSound={
              handleToggleSound
            }
            stampedCount={
              stampedCount
            }
          />
        </>
      )}

      {/* ========================================================
          SCENE 5 — STATION INTERIOR
      ======================================================== */}

      {currentScene === 'station_interior' &&
        activeStationId && (
          <>
            {/* ==============================
                SOUQ LOWWAL
            ============================== */}

            {activeStationId === 'souq' && (
              <SouqScene
                gender={gender}
                settings={settings}
                onReturnToVillage={
                  handleReturnToVillage
                }
              />
            )}

            {/* ==============================
                PEARL SEA
            ============================== */}

            {activeStationId === 'pearl' && (
              <PearlScene
                gender={gender}
                settings={settings}
                onReturnToVillage={
                  handleReturnToVillage
                }
                onComplete={() =>
                  handleStampStation('pearl')
                }
              />
            )}

            {/* ==============================
                FEREEJ GAMES
            ============================== */}

            {activeStationId === 'games' && (
              <GamesScene
                gender={gender}
                settings={settings}
                onReturnToVillage={
                  handleReturnToVillage
                }
                onComplete={() =>
                  handleStampStation('games')
                }
              />
            )}

            {/* ==============================
                OTHER STATIONS
            ============================== */}

            {activeStationId !== 'souq' &&
              activeStationId !== 'pearl' &&
              activeStationId !== 'games' && (
                <StationScene
                  station={
                    STATIONS_DATA[
                      activeStationId
                    ]
                  }
                  gender={gender}
                  isStamped={
                    passportRecord
                      .collectedStamps[
                      activeStationId
                    ]
                  }
                  onStampPassport={(id) =>
                    handleStampStation(
                      id as StationId
                    )
                  }
                  onReturnToVillage={
                    handleReturnToVillage
                  }
                />
              )}
          </>
        )}

      {/* ========================================================
          PASSPORT
      ======================================================== */}

      {isPassportOpen && (
        <PassportModal
          passport={passportRecord}
          onClose={() =>
            setIsPassportOpen(false)
          }
          onStampStation={
            handleStampStation
          }
        />
      )}

      {/* ========================================================
          SETTINGS
      ======================================================== */}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          gender={gender}
          onUpdateSettings={
            handleUpdateSettings
          }
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

            if (
              resetPositionRef.current
            ) {
              resetPositionRef.current();
            }
          }}
          onClose={() =>
            setIsSettingsOpen(false)
          }
        />
      )}
    </div>
  );
}
