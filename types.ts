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
  // Novos campos para análise avançada
  genreAnalysis?: GenreAnalysis;
  flowAnalysis?: FlowAnalysis;
  popularityMetrics?: PopularityMetrics;
  technicalAnalysis?: TechnicalAnalysis;
}

export interface GenreAnalysis {
  primaryGenre: string;
  subgenres: string[];
  genreConfidence: number; // 0-100
  crossGenreInfluences: string[];
  genreEvolution: string;
  regionalInfluences: string[];
}

export interface FlowAnalysis {
  overallFlow: string;
  rhythmicComplexity: number; // 1-10
  syncopationLevel: number; // 1-10
  groovePattern: string;
  rhythmicVariations: string[];
  polyrhythmicElements: string[];
}

export interface PopularityMetrics {
  globalPopularity: number; // 0-100
  regionalPopularity: string; // Descrição da popularidade regional
  trendingStatus: 'rising' | 'stable' | 'declining' | 'viral' | 'classic';
  culturalImpact: 'minimal' | 'moderate' | 'significant' | 'revolutionary';
  crossoverAppeal: number; // 0-100
}

export interface TechnicalAnalysis {
  productionQuality: number; // 1-10
  mixingTechniques: string[];
  masteringApproach: string;
  spatialDesign: string;
  frequencySpectrum: {
    lowEnd: string;
    midRange: string;
    highEnd: string;
  };
  dynamicProcessing: string[];
}

export interface PlaylistAnalysis {
  playlistInfo: {
    title: string;
    totalTracks: number;
    totalDuration: string;
    curator: string;
  };
  overallAnalysis: {
    dominantGenres: Array<{ genre: string; percentage: number }>;
    averageBPM: number;
    moodProgression: string;
    energyFlow: string;
    cohesionScore: number; // 0-100
  };
  trackAnalyses: Analysis[];
  playlistInsights: {
    genreDistribution: { [genre: string]: number };
    temporalFlow: string;
    emotionalJourney: string;
    recommendedListeningContext: string[];
  };
}
