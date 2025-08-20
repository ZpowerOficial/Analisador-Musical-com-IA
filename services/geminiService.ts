
import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis, PlaylistAnalysis } from '../types';
import YouTubeService, { type YouTubeVideoData, type YouTubePlaylistData } from './youtube.service';
import LastFmService, { type LastFmTrackInfo, type LastFmArtistInfo } from './lastfm.service';
import LyricsService, { type LyricsData, type LyricsAnalysis } from './lyrics.service';
import AudioAnalysisService, { type AudioAnalysisResult, type LyricsExtractionResult } from './audioAnalysis.service';
import PromptEngineeringService, { type AnalysisPromptConfig } from './promptEngineering.service';

/**
 * Dados consolidados para análise musical profissional
 */
export interface ConsolidatedMusicData {
  // Dados básicos
  title: string;
  artist: string;
  album?: string;
  duration: number; // em segundos

  // Dados do YouTube
  youtube?: {
    videoId: string;
    channelTitle: string;
    description: string;
    viewCount: number;
    likeCount: number;
    publishedAt: string;
    tags: string[];
    categoryId: string;
  };

  // Dados do Last.fm
  lastfm?: {
    playcount: number;
    listeners: number;
    tags: Array<{ name: string; count: number }>;
    wiki?: { summary: string; content: string };
    similar: Array<{ name: string; artist: string; match: number }>;
    artistInfo?: LastFmArtistInfo;
    popularityAnalysis: {
      popularityScore: number;
      trendingStatus: string;
      genreRelevance: number;
      culturalImpact: string;
    };
  };

  // Dados de letras
  lyrics?: {
    data: LyricsData;
    analysis: LyricsAnalysis;
  };

  // Metadados de análise
  platform: 'youtube' | 'spotify' | 'mixed';
  analysisTimestamp: string;
}

// Função para extrair o ID do vídeo do YouTube
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Função para validar se é uma URL válida do YouTube
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Função para obter informações do vídeo do YouTube (usando oEmbed - não requer API key)
const getYouTubeVideoInfo = async (videoId: string): Promise<{title: string, author_name: string} | null> => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      console.warn('Falha ao obter informações do vídeo via oEmbed');
      return null;
    }

    const data = await response.json();
    return {
      title: data.title || '',
      author_name: data.author_name || ''
    };
  } catch (error: any) {
    console.warn('Erro ao obter informações do vídeo:', error);
    return null;
  }
};

const advancedAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    error: {
        type: Type.STRING,
        description: "Se a análise falhar por não conseguir identificar a música ou não ter informações sobre ela, preencha este campo com a mensagem de erro. Caso contrário, deixe-o vazio.",
    },
    songInfo: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "O título da música." },
        artist: { type: Type.STRING, description: "O artista ou banda." },
        year: { type: Type.INTEGER, description: "O ano de lançamento." },
        mainGenre: { type: Type.STRING, description: "O gênero principal." },
        subgenres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de subgêneros." },
      },
      required: ["title", "artist", "year", "mainGenre", "subgenres"]
    },
    musicalElements: {
      type: Type.OBJECT,
      properties: {
        bpm: { type: Type.INTEGER, description: "Batidas por minuto (BPM)." },
        key: { type: Type.STRING, description: "A tonalidade (ex: C Major)." },
        mode: { type: Type.STRING, description: "O modo (ex: Ionian, Dorian)." },
        timeSignature: { type: Type.STRING, description: "A fórmula de compasso (ex: 4/4)." },
        mood: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Descritores do humor/atmosfera." },
        tonality: { type: Type.STRING, description: "A base tonal (Tonal, Atonal, Modal)." },
        tempoDescription: { type: Type.STRING, description: "Descrição do andamento (ex: Andante, Allegro)." },
      },
      required: ["bpm", "key", "mode", "timeSignature", "mood", "tonality", "tempoDescription"]
    },
    composition: {
      type: Type.OBJECT,
      properties: {
        formAnalysis: { type: Type.STRING, description: "Análise da forma e estrutura da música (ex: AABA, Verso-Refrão)." },
        transitionDetails: { type: Type.STRING, description: "Como as seções da música se conectam." },
        harmony: { type: Type.STRING, description: "Análise geral da harmonia." },
        chordProgressions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Progressões de acordes específicas utilizadas." },
        harmonicDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dispositivos harmônicos (ex: 'Modal Interchange', 'Secondary Dominants')." },
        melody: { type: Type.STRING, description: "Análise geral da melodia." },
        melodicContour: { type: Type.STRING, description: "O contorno e a forma das linhas melódicas." },
        vocalTechnique: { type: Type.STRING, description: "Técnicas vocais notáveis (ex: Belting, Falsetto, Vibrato)." },
        rhythm: { type: Type.STRING, description: "Análise geral do ritmo (flow)." },
        rhythmicPatterns: { type: Type.STRING, description: "Padrões rítmicos importantes." },
        syncopationDetails: { type: Type.STRING, description: "Análise do uso de sincopação." },
      },
      required: ["formAnalysis", "transitionDetails", "harmony", "chordProgressions", "harmonicDevices", "melody", "melodicContour", "vocalTechnique", "rhythm", "rhythmicPatterns", "syncopationDetails"]
    },
    soundEngineering: {
      type: Type.OBJECT,
      properties: {
        instrumentation: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              instrument: { type: Type.STRING },
              performanceAnalysis: { type: Type.STRING }
            },
            required: ["instrument", "performanceAnalysis"]
          },
          description: "Lista de instrumentos e uma análise de sua performance."
        },
        mixing: { type: Type.STRING, description: "Análise das técnicas de mixagem." },
        dynamicRange: { type: Type.STRING, description: "Análise da faixa dinâmica (ex: 'Altamente comprimido', 'Amplo e dinâmico')." },
        panningDetails: { type: Type.STRING, description: "Descrição do posicionamento estéreo (panning)." },
        frequencyBalance: { type: Type.STRING, description: "O balanço de frequências (ex: 'Grave-pesado', 'Agudos brilhantes')." },
        mastering: { type: Type.STRING, description: "Análise da masterização." },
        lufs: { type: Type.STRING, description: "Valor de LUFS integrado estimado." },
        stereoWidth: { type: Type.STRING, description: "Análise da largura do estéreo." },
        soundstage: { type: Type.STRING, description: "Descrição do palco sonoro." },
        effects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de efeitos notáveis utilizados." },
      },
      required: ["instrumentation", "mixing", "dynamicRange", "panningDetails", "frequencyBalance", "mastering", "lufs", "stereoWidth", "soundstage", "effects"]
    },
    lyricalAnalysis: {
        type: Type.OBJECT,
        properties: {
            theme: { type: Type.STRING, description: "O tema central das letras." },
            narrativeStructure: { type: Type.STRING, description: "A estrutura narrativa ou história contada." },
            literaryDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dispositivos literários utilizados (metáforas, etc.)." },
            rhymeScheme: { type: Type.STRING, description: "O esquema de rimas (ex: AABB, ABAB)." },
        },
        required: ["theme", "narrativeStructure", "literaryDevices", "rhymeScheme"]
    },
    culturalContext: {
        type: Type.OBJECT,
        properties: {
            historicalSignificance: { type: Type.STRING, description: "O significado histórico da música." },
            influences: { type: Type.STRING, description: "Artistas ou gêneros que influenciaram esta faixa." },
            impact: { type: Type.STRING, description: "O impacto da música no gênero ou cultura." },
        },
        required: ["historicalSignificance", "influences", "impact"]
    },
    genreAnalysis: {
        type: Type.OBJECT,
        properties: {
            primaryGenre: { type: Type.STRING, description: "Gênero musical principal identificado com precisão acadêmica." },
            subgenres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de subgêneros específicos presentes na música." },
            genreConfidence: { type: Type.INTEGER, description: "Nível de confiança na classificação de gênero (0-100)." },
            crossGenreInfluences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Influências de outros gêneros detectadas." },
            genreEvolution: { type: Type.STRING, description: "Como esta música se relaciona com a evolução do gênero." },
            regionalInfluences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Influências regionais ou culturais específicas." }
        },
        required: ["primaryGenre", "subgenres", "genreConfidence", "crossGenreInfluences", "genreEvolution", "regionalInfluences"]
    },
    flowAnalysis: {
        type: Type.OBJECT,
        properties: {
            overallFlow: { type: Type.STRING, description: "Análise geral do flow e cadência da música." },
            rhythmicComplexity: { type: Type.INTEGER, description: "Complexidade rítmica em escala de 1-10." },
            syncopationLevel: { type: Type.INTEGER, description: "Nível de sincopação presente (1-10)." },
            groovePattern: { type: Type.STRING, description: "Padrão de groove característico identificado." },
            rhythmicVariations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Variações rítmicas notáveis ao longo da música." },
            polyrhythmicElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Elementos polirrítmicos presentes." }
        },
        required: ["overallFlow", "rhythmicComplexity", "syncopationLevel", "groovePattern", "rhythmicVariations", "polyrhythmicElements"]
    },
    popularityMetrics: {
        type: Type.OBJECT,
        properties: {
            globalPopularity: { type: Type.INTEGER, description: "Popularidade global estimada (0-100)." },
            regionalPopularity: { type: Type.STRING, description: "Descrição da popularidade por região geográfica." },
            trendingStatus: { type: Type.STRING, description: "Status de tendência: rising, stable, declining, viral, classic." },
            culturalImpact: { type: Type.STRING, description: "Impacto cultural: minimal, moderate, significant, revolutionary." },
            crossoverAppeal: { type: Type.INTEGER, description: "Apelo crossover entre diferentes audiências (0-100)." }
        },
        required: ["globalPopularity", "regionalPopularity", "trendingStatus", "culturalImpact", "crossoverAppeal"]
    },
    technicalAnalysis: {
        type: Type.OBJECT,
        properties: {
            productionQuality: { type: Type.INTEGER, description: "Qualidade da produção em escala de 1-10." },
            mixingTechniques: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Técnicas de mixagem identificadas." },
            masteringApproach: { type: Type.STRING, description: "Abordagem de masterização utilizada." },
            spatialDesign: { type: Type.STRING, description: "Design espacial e posicionamento dos elementos." },
            frequencySpectrum: {
                type: Type.OBJECT,
                properties: {
                    lowEnd: { type: Type.STRING, description: "Análise das frequências graves." },
                    midRange: { type: Type.STRING, description: "Análise das frequências médias." },
                    highEnd: { type: Type.STRING, description: "Análise das frequências agudas." }
                },
                required: ["lowEnd", "midRange", "highEnd"]
            },
            dynamicProcessing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Processamento dinâmico aplicado." }
        },
        required: ["productionQuality", "mixingTechniques", "masteringApproach", "spatialDesign", "frequencySpectrum", "dynamicProcessing"]
    }
  },
  required: ["songInfo", "musicalElements", "composition", "soundEngineering", "lyricalAnalysis", "culturalContext", "genreAnalysis", "flowAnalysis", "popularityMetrics", "technicalAnalysis"]
};


/**
 * Consolida dados de múltiplas fontes para análise musical profissional
 */
async function consolidateMusicData(
  url: string,
  youtubeApiKey: string,
  lastfmApiKey: string,
  stands4ApiKey: string,
  geniusApiKey: string,
  onProgress?: (message: string) => void
): Promise<ConsolidatedMusicData | null> {
  const youtubeService = new YouTubeService(youtubeApiKey);
  const lastfmService = new LastFmService(lastfmApiKey);
  const lyricsService = new LyricsService(stands4ApiKey, geniusApiKey);

  // Determinar tipo de URL e extrair dados
  const urlType = youtubeService.getUrlType(url);

  if (urlType === 'video') {
    const videoId = youtubeService.extractVideoId(url);
    if (!videoId) return null;

    const youtubeData = await youtubeService.getVideoData(videoId);
    if (!youtubeData) return null;

    // Extrair título e artista do título do vídeo
    const { title, artist } = extractTitleAndArtist(youtubeData.title);

    // Obter dados do Last.fm
    onProgress?.('🎶 Buscando dados de popularidade no Last.fm...');
    const lastfmTrackInfo = await lastfmService.getTrackInfo(artist, title);
    const lastfmArtistInfo = await lastfmService.getArtistInfo(artist);
    const popularityAnalysis = await lastfmService.getPopularityAnalysis(artist, title);

    // Obter letras da música
    onProgress?.('📝 Buscando letras da música...');
    const lyricsData = await lyricsService.getLyrics(artist, title, youtubeData.title);
    const lyricsAnalysis = lyricsData.found ?
      lyricsService.analyzeLyricsContent(lyricsData.lyrics) : null;

    onProgress?.('🔄 Consolidando dados para análise...');

    return {
      title,
      artist,
      album: lastfmTrackInfo?.album,
      duration: parseDuration(youtubeData.duration),
      youtube: {
        videoId: youtubeData.id,
        channelTitle: youtubeData.channelTitle,
        description: youtubeData.description,
        viewCount: parseInt(youtubeData.viewCount),
        likeCount: parseInt(youtubeData.likeCount),
        publishedAt: youtubeData.publishedAt,
        tags: youtubeData.tags,
        categoryId: youtubeData.categoryId
      },
      lastfm: lastfmTrackInfo ? {
        playcount: lastfmTrackInfo.playcount,
        listeners: lastfmTrackInfo.listeners,
        tags: lastfmTrackInfo.tags,
        wiki: lastfmTrackInfo.wiki,
        similar: lastfmTrackInfo.similar || [],
        artistInfo: lastfmArtistInfo || undefined,
        popularityAnalysis
      } : undefined,
      lyrics: lyricsData.found && lyricsAnalysis ? {
        data: lyricsData,
        analysis: lyricsAnalysis
      } : undefined,
      platform: 'youtube',
      analysisTimestamp: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Extrai título e artista de títulos de vídeo do YouTube
 */
function extractTitleAndArtist(videoTitle: string): { title: string; artist: string } {
  // Padrões comuns: "Artista - Título", "Artista: Título", "Título by Artista"
  const patterns = [
    /^(.+?)\s*[-–—]\s*(.+?)(?:\s*\(.*\))?(?:\s*\[.*\])?$/,
    /^(.+?)\s*:\s*(.+?)(?:\s*\(.*\))?(?:\s*\[.*\])?$/,
    /^(.+?)\s+by\s+(.+?)(?:\s*\(.*\))?(?:\s*\[.*\])?$/i
  ];

  for (const pattern of patterns) {
    const match = videoTitle.match(pattern);
    if (match) {
      return {
        artist: match[1].trim(),
        title: match[2].trim()
      };
    }
  }

  // Fallback: usar o título completo como título e tentar extrair artista do canal
  return {
    title: videoTitle.replace(/\s*\(.*\)|\s*\[.*\]/g, '').trim(),
    artist: 'Unknown Artist'
  };
}

/**
 * Converte duração ISO 8601 para segundos
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Advanced Audio Analysis Frameworks
 */
const AUDIO_ANALYSIS_FRAMEWORKS = {
  harmonic: {
    methods: ['Schenkerian Analysis', 'Neo-Riemannian Theory', 'Functional Harmony', 'Jazz Theory'],
    parameters: ['chord_progressions', 'voice_leading', 'modulations', 'harmonic_rhythm']
  },
  rhythmic: {
    methods: ['Metric Analysis', 'Groove Quantization', 'Polyrhythmic Detection', 'Temporal Displacement'],
    parameters: ['beat_tracking', 'tempo_variations', 'syncopation_patterns', 'metric_modulation']
  },
  spectral: {
    methods: ['FFT Analysis', 'Mel-frequency Cepstral Coefficients', 'Chromagram Analysis', 'Spectral Centroid'],
    parameters: ['frequency_distribution', 'harmonic_content', 'noise_floor', 'dynamic_range']
  },
  production: {
    methods: ['LUFS Measurement', 'Stereo Imaging Analysis', 'Frequency Response', 'Compression Detection'],
    parameters: ['loudness_range', 'stereo_width', 'eq_curve', 'compression_ratio']
  }
};

/**
 * Specialized AI Roles for Musical Analysis
 */
const AI_SPECIALIST_ROLES = {
  audio_engineer: {
    expertise: 'Grammy-winning mixing/mastering engineer with 25+ years experience',
    focus: 'Technical audio analysis, production quality, sonic characteristics',
    tools: ['Pro Tools', 'Logic Pro', 'Ableton Live', 'Hardware analyzers'],
    certifications: ['AES Fellow', 'NARAS Voting Member', 'Dolby Atmos Certified']
  },
  musicologist: {
    expertise: 'PhD in Historical Musicology and Ethnomusicology from Harvard/Juilliard',
    focus: 'Theoretical analysis, cultural context, historical significance',
    specializations: ['Western Classical', 'Jazz Theory', 'World Music', 'Popular Music Studies'],
    publications: ['Peer-reviewed journals', 'Academic books', 'Conference presentations']
  },
  lyricist_analyst: {
    expertise: 'Professional songwriter and literary analyst with linguistics background',
    focus: 'Lyrical content, poetic devices, narrative structure, vocal delivery',
    skills: ['Phonetic analysis', 'Prosodic analysis', 'Semantic analysis', 'Cultural linguistics'],
    experience: ['Billboard charting songs', 'Literary criticism', 'Vocal coaching']
  },
  genre_specialist: {
    expertise: 'Multi-genre music curator and trend analyst',
    focus: 'Genre classification, cross-genre influences, cultural movements',
    knowledge: ['Regional scenes', 'Historical evolution', 'Fusion genres', 'Emerging trends'],
    networks: ['Industry contacts', 'Cultural institutions', 'Academic partnerships']
  }
};

/**
 * Mapeamento de idiomas suportados
 */
const LANGUAGE_MAPPING = {
  'pt-BR': {
    name: 'Português (Brasil)',
    instruction: 'Responda EXCLUSIVAMENTE em português brasileiro. Use terminologia musical em português.',
    expertise: 'Dr. Musicólogo Brasileiro, Eng. de Som Master, Compositor Virtuoso, Analista de Tendências'
  },
  'en-US': {
    name: 'English (US)',
    instruction: 'Respond EXCLUSIVELY in English. Use proper musical terminology in English.',
    expertise: 'Dr. Musicologist, Master Sound Engineer, Virtuoso Composer, Trends Analyst'
  },
  'es-ES': {
    name: 'Español (España)',
    instruction: 'Responde EXCLUSIVAMENTE en español. Usa terminología musical en español.',
    expertise: 'Dr. Musicólogo, Ingeniero de Sonido Master, Compositor Virtuoso, Analista de Tendencias'
  },
  'fr-FR': {
    name: 'Français (France)',
    instruction: 'Répondez EXCLUSIVEMENT en français. Utilisez la terminologie musicale en français.',
    expertise: 'Dr. Musicologue, Ingénieur du Son Master, Compositeur Virtuose, Analyste de Tendances'
  },
  'de-DE': {
    name: 'Deutsch (Deutschland)',
    instruction: 'Antworten Sie AUSSCHLIESSLICH auf Deutsch. Verwenden Sie deutsche Musikterminologie.',
    expertise: 'Dr. Musikwissenschaftler, Master-Toningenieur, Virtuoser Komponist, Trend-Analyst'
  },
  'it-IT': {
    name: 'Italiano (Italia)',
    instruction: 'Rispondi ESCLUSIVAMENTE in italiano. Usa la terminologia musicale in italiano.',
    expertise: 'Dr. Musicologo, Ingegnere del Suono Master, Compositore Virtuoso, Analista di Tendenze'
  },
  'ja-JP': {
    name: '日本語 (日本)',
    instruction: 'Respond EXCLUSIVELY in Japanese. Use proper musical terminology in Japanese.',
    expertise: '音楽学博士、マスター音響エンジニア、バーチュオーゾ作曲家、トレンドアナリスト'
  },
  'ko-KR': {
    name: '한국어 (대한민국)',
    instruction: 'Respond EXCLUSIVELY in Korean. Use proper musical terminology in Korean.',
    expertise: '음악학 박사, 마스터 사운드 엔지니어, 비르투오소 작곡가, 트렌드 분석가'
  }
};

/**
 * Cria prompt de análise musical de nível pós-doutorado
 */
function createAdvancedAnalysisPrompt(data: ConsolidatedMusicData, language: string = 'pt-BR'): string {
  const lastfmData = data.lastfm;
  const youtubeData = data.youtube;

  // Obter configurações do idioma
  const langConfig = LANGUAGE_MAPPING[language as keyof typeof LANGUAGE_MAPPING] || LANGUAGE_MAPPING['pt-BR'];

  return `
# ANÁLISE MUSICAL ACADÊMICA AVANÇADA
## Nível: Pós-Doutorado em Musicologia, Engenharia de Áudio e Composição

**IDIOMA DE RESPOSTA**: ${langConfig.instruction}

Você é um consórcio de especialistas de elite mundial:
- **${langConfig.expertise.split(', ')[0]}**: PhD em Musicologia Histórica e Etnomusicologia (Harvard/Juilliard)
- **${langConfig.expertise.split(', ')[1]}**: 30+ anos, Grammy winner, especialista em análise espectral
- **${langConfig.expertise.split(', ')[2]}**: Mestre em teoria musical avançada e análise harmônica
- **${langConfig.expertise.split(', ')[3]}**: Especialista em sociologia musical e impacto cultural

---

## DADOS CONSOLIDADOS PARA ANÁLISE

### IDENTIFICAÇÃO MUSICAL
- **Título**: "${data.title}"
- **Artista**: "${data.artist}"
- **Álbum**: ${data.album || 'N/A'}
- **Duração**: ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}
- **Plataforma**: ${data.platform}

### DADOS YOUTUBE (Engagement & Distribuição)
${youtubeData ? `
- **Canal**: ${youtubeData.channelTitle}
- **Visualizações**: ${youtubeData.viewCount.toLocaleString()}
- **Likes**: ${youtubeData.likeCount.toLocaleString()}
- **Data de Publicação**: ${new Date(youtubeData.publishedAt).toLocaleDateString()}
- **Tags**: ${youtubeData.tags.slice(0, 10).join(', ')}
- **Categoria**: ${youtubeData.categoryId}
` : 'Dados não disponíveis'}

### DADOS LAST.FM (Popularidade & Contexto Cultural)
${lastfmData ? `
- **Plays Globais**: ${lastfmData.playcount.toLocaleString()}
- **Ouvintes Únicos**: ${lastfmData.listeners.toLocaleString()}
- **Tags de Gênero**: ${lastfmData.tags.slice(0, 8).map(t => `${t.name} (${t.count})`).join(', ')}
- **Popularidade Score**: ${lastfmData.popularityAnalysis.popularityScore}/100
- **Impacto Cultural**: ${lastfmData.popularityAnalysis.culturalImpact}
- **Status de Tendência**: ${lastfmData.popularityAnalysis.trendingStatus}
${lastfmData.similar.length > 0 ? `- **Faixas Similares**: ${lastfmData.similar.slice(0, 3).map(s => `${s.name} - ${s.artist}`).join(', ')}` : ''}
` : 'Dados não disponíveis'}

### DADOS DE LETRAS (Análise Baseada em Conhecimento)
- **Status**: Letras não disponíveis (limitações de CORS das APIs)
- **Método de Análise**: Baseado em conhecimento extenso sobre a música
- **Fonte**: Conhecimento da IA sobre o artista "${data.artist}" e música "${data.title}"
- **Contexto**: Use seu conhecimento sobre o gênero, artista e período para análise lírica
- **Instruções**: Forneça análise lírica detalhada baseada em:
  - Conhecimento sobre o artista e suas obras
  - Características típicas do gênero musical
  - Contexto cultural e histórico
  - Temas comuns do artista/gênero

---

## INSTRUÇÕES DE ANÁLISE CRÍTICA

### 1. ANÁLISE DE GÊNERO E ESTILO (Nível PhD)
- Identifique o **gênero primário** com precisão acadêmica
- Mapeie **subgêneros** e **micro-gêneros** específicos
- Analise **influências cross-genre** e **fusões estilísticas**
- Determine **evolução do gênero** e posicionamento histórico
- Identifique **influências regionais/culturais** específicas

### 2. ANÁLISE DE FLOW E RITMO (Engenharia de Precisão)
- Avalie **complexidade rítmica** em escala técnica (1-10)
- Analise **padrões de sincopação** e **deslocamentos métricos**
- Identifique **groove patterns** característicos
- Mapeie **variações rítmicas** ao longo da estrutura
- Detecte **elementos polirrítmicos** e **cross-rhythms**

### 3. ANÁLISE TÉCNICA DE PRODUÇÃO (Master Engineer Level)
- Avalie **qualidade de produção** (1-10) com justificativa técnica
- Identifique **técnicas de mixagem** específicas utilizadas
- Analise **abordagem de masterização** e **processamento dinâmico**
- Mapeie **design espacial** e **posicionamento estéreo**
- Analise **espectro de frequências** (graves/médios/agudos) detalhadamente

### 4. ANÁLISE LÍRICA E SEMÂNTICA (Nível Literário Acadêmico)
**IMPORTANTE**: As letras não estão disponíveis devido a limitações de CORS das APIs.
Realize análise lírica baseada em seu **conhecimento extenso** sobre a música:

- Analise **temas prováveis** baseado no artista, gênero e contexto cultural
- Estime **tom emocional** típico do artista e estilo musical
- Identifique **características líricas** comuns do gênero
- Avalie **dispositivos literários** típicos do estilo
- Determine **perspectiva narrativa** comum no gênero
- Correlacione **estilo lírico** com elementos musicais
- Baseie-se em **conhecimento sobre o artista** e suas obras conhecidas
- Use **contexto cultural** e **período histórico** da música

### 5. MÉTRICAS DE POPULARIDADE E IMPACTO
- Calcule **popularidade global** baseada em dados consolidados
- Analise **status de tendência** e **momentum cultural**
- Avalie **apelo crossover** entre diferentes demografias
- Determine **impacto cultural** com base em métricas objetivas

---

## FORMATO DE RESPOSTA OBRIGATÓRIO

**IDIOMA OBRIGATÓRIO**: ${langConfig.instruction}

Responda EXCLUSIVAMENTE em formato JSON seguindo o schema fornecido.
Cada campo deve ser preenchido com análise profunda e tecnicamente precisa.
Use terminologia acadêmica apropriada para cada área de especialização.
TODOS os textos dentro do JSON devem estar no idioma especificado acima.

**CRÍTICO**: Esta análise deve refletir o nível de um paper acadêmico de pós-doutorado.
Seja específico, técnico e fundamentado em dados quando disponível.
LEMBRE-SE: Toda a resposta deve estar no idioma ${langConfig.name}.
`;
}

/**
 * Enhanced Music Analysis with Advanced Audio Processing and Prompt Engineering
 */
export const analyzeMusicAdvanced = async (
  url: string,
  geminiApiKey: string,
  youtubeApiKey: string,
  lastfmApiKey: string,
  stands4ApiKey: string = '',
  geniusApiKey: string = '',
  language: string = 'pt-BR',
  analysisDepth: 'basic' | 'advanced' | 'expert' = 'advanced'
): Promise<Analysis & {
  audioAnalysis: AudioAnalysisResult;
  lyricsExtraction: LyricsExtractionResult;
  confidenceScores: Record<string, number>;
  analysisTransparency: {
    methods: string[];
    limitations: string[];
    dataSource: string;
  };
}> => {
  console.log('🎵 Starting Advanced Musical Analysis...');

  // Initialize advanced services
  const audioAnalysisService = new AudioAnalysisService();
  const promptEngineeringService = new PromptEngineeringService();

  // Extract video ID
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // Step 1: Use existing data gathering (call the regular analyzeMusic first)
  console.log('📊 Gathering basic music data...');
  const basicAnalysis = await analyzeMusic(url, geminiApiKey, youtubeApiKey, lastfmApiKey, stands4ApiKey, geniusApiKey, language);

  // Extract consolidated data from basic analysis
  const basicData: ConsolidatedMusicData = {
    title: basicAnalysis.songInfo.title,
    artist: basicAnalysis.songInfo.artist,
    duration: 0, // Will be filled by audio analysis
    platform: 'youtube',
    analysisTimestamp: new Date().toISOString(),
    youtube: {
      videoId,
      channelTitle: basicAnalysis.songInfo.artist,
      description: '',
      viewCount: 0,
      likeCount: 0,
      publishedAt: new Date().toISOString(),
      tags: [],
      categoryId: 'Music'
    }
  };

  // Step 2: Advanced audio analysis
  console.log('🔊 Performing advanced audio analysis...');
  const audioAnalysis = await audioAnalysisService.analyzeAudioFromYouTube(videoId, youtubeApiKey);

  // Step 3: Enhanced lyrics extraction
  console.log('🎤 Extracting lyrics with advanced methods...');
  const lyricsExtraction = await audioAnalysisService.extractLyricsAdvanced(
    basicAnalysis.songInfo.artist,
    basicAnalysis.songInfo.title,
    videoId
  );

  // Step 4: Generate advanced prompt
  const promptConfig: AnalysisPromptConfig = {
    language,
    analysisDepth,
    specializations: ['audio_engineer', 'musicologist', 'lyricist_analyst', 'genre_specialist'],
    confidenceThreshold: 0.6
  };

  const advancedPrompt = promptEngineeringService.generateAdvancedPrompt(
    basicData,
    audioAnalysis,
    lyricsExtraction,
    promptConfig
  );

  // Step 5: AI Analysis with advanced prompt
  console.log('🧠 Performing AI analysis with advanced prompting...');
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: advancedPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: advancedAnalysisSchema,
      temperature: 0.3,
      maxOutputTokens: 8192
    }
  });

  // Step 6: Parse and enhance results
  const responseText = response.text || '{}';
  const analysis = JSON.parse(responseText) as Analysis;

  // Step 7: Add advanced analysis data
  return {
    ...analysis,
    audioAnalysis,
    lyricsExtraction,
    confidenceScores: {
      overall: audioAnalysis.confidence_scores.overall,
      audio: audioAnalysis.confidence_scores.overall,
      lyrics: lyricsExtraction.confidence,
      harmonic: audioAnalysis.confidence_scores.harmonic,
      rhythmic: audioAnalysis.confidence_scores.rhythmic,
      production: audioAnalysis.confidence_scores.production
    },
    analysisTransparency: {
      methods: [
        'Advanced AI Prompt Engineering',
        'Multi-Specialist Analysis Framework',
        'Chain-of-Thought Reasoning',
        ...audioAnalysis.analysis_methods
      ],
      limitations: [
        'Browser-based audio processing limitations',
        'AI knowledge-based lyrical analysis',
        ...audioAnalysis.limitations
      ],
      dataSource: `YouTube API + Last.fm API + Advanced AI Analysis (${analysisDepth} mode)`
    }
  };
};

export const analyzeMusic = async (
  url: string,
  geminiApiKey: string,
  youtubeApiKey: string,
  lastfmApiKey: string,
  stands4ApiKey: string = '',
  geniusApiKey: string = '',
  language: string = 'pt-BR',
  onProgress?: (message: string) => void
): Promise<Analysis> => {
    if (!geminiApiKey) {
        throw new Error("A chave de API da Gemini não foi fornecida.");
    }

    if (!youtubeApiKey) {
        throw new Error("A chave de API do YouTube não foi fornecida.");
    }

    if (!lastfmApiKey) {
        throw new Error("A chave de API do Last.fm não foi fornecida.");
    }

    onProgress?.('📊 Coletando dados do YouTube...');
    // Consolidar dados de múltiplas fontes
    const consolidatedData = await consolidateMusicData(url, youtubeApiKey, lastfmApiKey, stands4ApiKey, geniusApiKey, onProgress);

    if (!consolidatedData) {
        throw new Error("Não foi possível obter dados da música. Verifique se a URL é válida.");
    }

    onProgress?.('🤖 Enviando para análise com IA Gemini...');

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Criar prompt profissional de nível pós-doutorado
    const prompt = createAdvancedAnalysisPrompt(consolidatedData, language);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: advancedAnalysisSchema,
        temperature: 0.1, // Menor temperatura para maior precisão técnica
      },
    });

    const text = response.text?.trim() || '';
    const parsedData: Analysis = JSON.parse(text);
    return parsedData;

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);

    // Tratamento específico para diferentes tipos de erro
    if (error?.message?.includes('API key not valid') || error?.message?.includes('INVALID_ARGUMENT')) {
      throw new Error('A chave de API fornecida é inválida. Verifique se a chave está correta e tente novamente.');
    }

    if (error?.message?.includes('SERVICE_DISABLED') || error?.message?.includes('PERMISSION_DENIED')) {
      throw new Error('A API Generative Language não está habilitada no seu projeto Google Cloud. Acesse https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview e habilite a API, depois aguarde alguns minutos antes de tentar novamente.');
    }

    if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Cota da API Gemini excedida. Verifique os limites da sua chave de API no Google Cloud Console.');
    }

    if (error?.message?.includes('xhr error') || error?.message?.includes('CORS')) {
      throw new Error('Erro de rede ao contatar a API Gemini. Isso pode ser um problema de CORS ou conectividade. Verifique sua conexão com a internet.');
    }

    if (error?.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Recursos da API temporariamente esgotados. Tente novamente em alguns minutos.');
    }

    // Erro genérico com mais informações
    const errorMessage = error?.message || 'Erro desconhecido';
    throw new Error(`Falha ao obter a análise da API Gemini: ${errorMessage}. Verifique o console para mais detalhes.`);
  }
};

/**
 * Analisa uma playlist completa do YouTube
 */
export const analyzePlaylist = async (
  playlistUrl: string,
  geminiApiKey: string,
  youtubeApiKey: string,
  lastfmApiKey: string,
  stands4ApiKey: string = '',
  geniusApiKey: string = '',
  language: string = 'pt-BR',
  maxTracks: number = 20,
  onProgress?: (message: string) => void
): Promise<PlaylistAnalysis> => {
  const youtubeService = new YouTubeService(youtubeApiKey);

  // Extrair ID da playlist
  const playlistId = youtubeService.extractPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error("Não foi possível extrair o ID da playlist da URL fornecida.");
  }

  // Obter dados da playlist
  onProgress?.('📋 Obtendo dados da playlist...');
  const playlistData = await youtubeService.getPlaylistData(playlistId, maxTracks);
  if (!playlistData) {
    throw new Error("Não foi possível obter dados da playlist.");
  }

  // Analisar cada música da playlist
  const trackAnalyses: Analysis[] = [];
  const genreDistribution: { [genre: string]: number } = {};
  let totalBPM = 0;
  let validBPMCount = 0;

  onProgress?.(`🎵 Iniciando análise de ${playlistData.videos.length} músicas...`);

  for (let i = 0; i < playlistData.videos.length; i++) {
    const video = playlistData.videos[i];
    onProgress?.(`🎶 Analisando ${i + 1}/${playlistData.videos.length}: ${video.title}`);

    try {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      const analysis = await analyzeMusic(videoUrl, geminiApiKey, youtubeApiKey, lastfmApiKey, stands4ApiKey, geniusApiKey, language, onProgress);

      trackAnalyses.push(analysis);

      // Coletar dados para análise geral
      if (analysis.genreAnalysis?.primaryGenre) {
        genreDistribution[analysis.genreAnalysis.primaryGenre] =
          (genreDistribution[analysis.genreAnalysis.primaryGenre] || 0) + 1;
      }

      if (analysis.musicalElements?.bpm && analysis.musicalElements.bpm > 0) {
        totalBPM += analysis.musicalElements.bpm;
        validBPMCount++;
      }

      // Pequena pausa para respeitar rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`Erro ao analisar ${video.title}:`, error);
      // Continuar com as outras músicas mesmo se uma falhar
    }
  }

  // Calcular métricas gerais
  const averageBPM = validBPMCount > 0 ? Math.round(totalBPM / validBPMCount) : 0;

  // Determinar gêneros dominantes
  const dominantGenres = Object.entries(genreDistribution)
    .map(([genre, count]) => ({
      genre,
      percentage: Math.round((count / trackAnalyses.length) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Calcular score de coesão baseado na diversidade de gêneros
  const genreCount = Object.keys(genreDistribution).length;
  const cohesionScore = Math.max(0, 100 - (genreCount * 10)); // Menos gêneros = mais coesão

  // Calcular duração total
  const totalDurationSeconds = playlistData.videos.reduce((sum, video) => {
    return sum + parseDuration(video.duration);
  }, 0);

  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    playlistInfo: {
      title: playlistData.title,
      totalTracks: trackAnalyses.length,
      totalDuration,
      curator: playlistData.channelTitle
    },
    overallAnalysis: {
      dominantGenres,
      averageBPM,
      moodProgression: analyzeMoodProgression(trackAnalyses),
      energyFlow: analyzeEnergyFlow(trackAnalyses),
      cohesionScore
    },
    trackAnalyses,
    playlistInsights: {
      genreDistribution,
      temporalFlow: analyzeTemporalFlow(trackAnalyses),
      emotionalJourney: analyzeEmotionalJourney(trackAnalyses),
      recommendedListeningContext: generateListeningRecommendations(trackAnalyses, dominantGenres)
    }
  };
};

/**
 * Analisa a progressão de humor ao longo da playlist
 */
function analyzeMoodProgression(analyses: Analysis[]): string {
  if (analyses.length === 0) return "Não foi possível determinar";

  const moods = analyses.map(a => a.musicalElements?.mood || []).flat();
  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as { [mood: string]: number });

  const dominantMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "variado";

  return `Progressão predominantemente ${dominantMood} com variações ao longo da playlist`;
}

/**
 * Analisa o fluxo de energia da playlist
 */
function analyzeEnergyFlow(analyses: Analysis[]): string {
  if (analyses.length === 0) return "Não foi possível determinar";

  const bpms = analyses
    .map(a => a.musicalElements?.bpm)
    .filter(bpm => bpm && bpm > 0) as number[];

  if (bpms.length < 2) return "Fluxo de energia estável";

  const start = bpms.slice(0, Math.ceil(bpms.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(bpms.length / 3);
  const end = bpms.slice(-Math.ceil(bpms.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(bpms.length / 3);

  const difference = end - start;

  if (difference > 10) return "Energia crescente ao longo da playlist";
  if (difference < -10) return "Energia decrescente, ideal para relaxamento";
  return "Energia equilibrada e consistente";
}

/**
 * Analisa o fluxo temporal da playlist
 */
function analyzeTemporalFlow(analyses: Analysis[]): string {
  const tempos = analyses.map(a => a.musicalElements?.tempoDescription).filter(Boolean);
  const uniqueTempos = [...new Set(tempos)];

  if (uniqueTempos.length <= 2) return "Fluxo temporal consistente";
  if (uniqueTempos.length <= 4) return "Variação temporal moderada";
  return "Grande diversidade temporal";
}

/**
 * Analisa a jornada emocional da playlist
 */
function analyzeEmotionalJourney(analyses: Analysis[]): string {
  const themes = analyses.map(a => a.lyricalAnalysis?.theme).filter(Boolean);
  const uniqueThemes = [...new Set(themes)];

  if (uniqueThemes.length <= 2) return "Jornada emocional focada e coesa";
  if (uniqueThemes.length <= 4) return "Exploração emocional variada";
  return "Ampla gama de experiências emocionais";
}

/**
 * Gera recomendações de contexto de escuta
 */
function generateListeningRecommendations(
  analyses: Analysis[],
  dominantGenres: Array<{ genre: string; percentage: number }>
): string[] {
  const recommendations: string[] = [];

  // Baseado nos gêneros dominantes
  const topGenre = dominantGenres[0]?.genre.toLowerCase() || "";

  if (topGenre.includes("rock") || topGenre.includes("metal")) {
    recommendations.push("Treino intenso", "Dirigindo", "Concentração para trabalho");
  } else if (topGenre.includes("jazz") || topGenre.includes("blues")) {
    recommendations.push("Jantar romântico", "Leitura", "Trabalho criativo");
  } else if (topGenre.includes("electronic") || topGenre.includes("dance")) {
    recommendations.push("Festa", "Exercícios", "Limpeza da casa");
  } else if (topGenre.includes("classical") || topGenre.includes("ambient")) {
    recommendations.push("Meditação", "Estudo", "Relaxamento");
  } else if (topGenre.includes("pop")) {
    recommendations.push("Viagem de carro", "Atividades sociais", "Background casual");
  }

  // Baseado na energia média
  const avgBPM = analyses.reduce((sum, a) => sum + (a.musicalElements?.bpm || 0), 0) / analyses.length;

  if (avgBPM > 140) {
    recommendations.push("Exercícios de alta intensidade");
  } else if (avgBPM < 80) {
    recommendations.push("Relaxamento noturno");
  }

  return [...new Set(recommendations)].slice(0, 4);
};
