export type CharacterGender = 'boy' | 'girl';

export type GameScene = 
  | 'intro' 
  | 'character_select' 
  | 'gate_opening' 
  | 'village' 
  | 'station_interior';

export type StationId = 
  | 'souq' 
  | 'pearl' 
  | 'games' 
  | 'majlis' 
  | 'crafts' 
  | 'akkas';

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface StationData {
  id: StationId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  x: number; // Isometric/canvas coordinates (percentage or grid units)
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
  color: string;
  accentColor: string;
  badgeText: string;
  features: string[];
  interiorInfo: {
    bannerText: string;
    subText: string;
    highlights: Array<{
      title: string;
      desc: string;
      tag?: string;
    }>;
    futureOptionsTitle?: string;
    futureOptions?: string[];
  };
}

export interface PlayerPosition {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isCelebrating: boolean;
}

export interface GameSettings {
  isQuietMode: boolean; // الوضع الهادئ
  isSoundEnabled: boolean;
  volume: number; // 0 to 1
  walkSpeed: 'calm' | 'normal'; // calm for accessibility
  highContrast: boolean;
  dpadSize: 'medium' | 'large';
}

export interface PassportRecord {
  collectedStamps: Record<StationId, boolean>;
  studentName: string;
  gender: CharacterGender;
  journeyStartDate: string;
}

export interface SouqItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  accent: string;
}

export interface SouqHotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  intro: string;
  items: SouqItem[];
}
