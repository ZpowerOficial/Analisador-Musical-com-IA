export interface SongInfo {
  title: string;
  artist: string;
  year: number;
  mainGenre: string;
  subgenres: string[];
}

export interface MusicalElements {
  bpm: number;
  key: string;
  mode: string;
  timeSignature: string;
  mood: string[];
  tonality: string;
  tempoDescription: string;
}

export interface Composition {
  formAnalysis: string;
  transitionDetails: string;
  harmony: string;
  chordProgressions: string[];
  harmonicDevices: string[];
  melody: string;
  melodicContour: string;
  vocalTechnique: string;
  rhythm: string;
  rhythmicPatterns: string;
  syncopationDetails: string;
}

export interface SoundEngineering {
  instrumentation: {
    instrument: string;
    performanceAnalysis: string;
  }[];
  mixing: string;
  dynamicRange: string;
  panningDetails: string;
  frequencyBalance: string;
  mastering: string;
  lufs: string;
  stereoWidth: string;
  soundstage: string;
  effects: string[];
}

export interface LyricalAnalysis {
  theme: string;
  narrativeStructure: string;
  literaryDevices: string[];
  rhymeScheme: string;
}

export interface CulturalContext {
  historicalSignificance: string;
  influences: string;
  impact: string;
}

export interface Analysis {
  error?: string;
  songInfo: SongInfo;
  musicalElements: MusicalElements;
  composition: Composition;
  soundEngineering: SoundEngineering;
  lyricalAnalysis: LyricalAnalysis;
  culturalContext: CulturalContext;
}
