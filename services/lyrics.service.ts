/**
 * Lyrics API Service
 * Serviço para obtenção de letras de músicas
 * Nível: Análise Literária e Semântica Profissional
 */

export interface LyricsData {
  lyrics: string;
  found: boolean;
  source: string;
  language?: string;
  wordCount?: number;
  lineCount?: number;
  hasChorus?: boolean;
  structure?: {
    verses: number;
    chorus: number;
    bridge: number;
    outro: number;
  };
}

export interface LyricsAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  themes: string[];
  literaryDevices: string[];
  vocabulary: 'simple' | 'moderate' | 'complex' | 'sophisticated';
  narrativePerspective: 'first-person' | 'second-person' | 'third-person' | 'mixed';
  emotionalTone: string[];
  culturalReferences: string[];
}

class LyricsService {
  private readonly baseUrls = [
    'https://api.lyrics.ovh/v1',
    'https://lyrist.vercel.app/api'
  ];

  /**
   * Normaliza nomes de artistas e músicas para melhor busca
   */
  private normalizeForSearch(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s*\(.*?\)\s*/g, '') // Remove conteúdo entre parênteses
      .replace(/\s*\[.*?\]\s*/g, '') // Remove conteúdo entre colchetes
      .replace(/\s*feat\.?\s+.*$/i, '') // Remove "feat." e tudo após
      .replace(/\s*ft\.?\s+.*$/i, '') // Remove "ft." e tudo após
      .replace(/\s*featuring\s+.*$/i, '') // Remove "featuring" e tudo após
      .replace(/[^\w\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Extrai título e artista de um título de vídeo do YouTube
   */
  private extractTitleAndArtist(videoTitle: string): { title: string; artist: string } {
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
          artist: this.normalizeForSearch(match[1]),
          title: this.normalizeForSearch(match[2])
        };
      }
    }
    
    // Fallback: usar o título completo como título
    return {
      title: this.normalizeForSearch(videoTitle),
      artist: ''
    };
  }

  /**
   * Busca letras usando múltiplas APIs como fallback
   */
  async getLyrics(artist: string, title: string, videoTitle?: string): Promise<LyricsData> {
    // Normalizar entradas
    const normalizedArtist = this.normalizeForSearch(artist);
    const normalizedTitle = this.normalizeForSearch(title);
    
    // Se temos título do vídeo, tentar extrair informações mais precisas
    let searchVariants = [
      { artist: normalizedArtist, title: normalizedTitle }
    ];
    
    if (videoTitle) {
      const extracted = this.extractTitleAndArtist(videoTitle);
      if (extracted.artist && extracted.title) {
        searchVariants.unshift(extracted);
      }
    }
    
    // Tentar cada variante de busca
    for (const variant of searchVariants) {
      if (!variant.artist || !variant.title) continue;
      
      // Tentar cada API
      for (const baseUrl of this.baseUrls) {
        try {
          const lyrics = await this.fetchFromApi(baseUrl, variant.artist, variant.title);
          if (lyrics.found) {
            return {
              ...lyrics,
              source: baseUrl,
              ...this.analyzeLyricsStructure(lyrics.lyrics)
            };
          }
        } catch (error) {
          console.warn(`Erro na API ${baseUrl}:`, error);
          continue;
        }
      }
    }
    
    return {
      lyrics: '',
      found: false,
      source: 'none',
      wordCount: 0,
      lineCount: 0,
      hasChorus: false
    };
  }

  /**
   * Busca letras em uma API específica
   */
  private async fetchFromApi(baseUrl: string, artist: string, title: string): Promise<LyricsData> {
    try {
      let url: string;
      
      if (baseUrl.includes('lyrics.ovh')) {
        url = `${baseUrl}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      } else {
        url = `${baseUrl}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MusicAnalyzer/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Diferentes formatos de resposta das APIs
      let lyrics = '';
      if (data.lyrics) {
        lyrics = data.lyrics;
      } else if (data.result) {
        lyrics = data.result;
      } else if (typeof data === 'string') {
        lyrics = data;
      }
      
      if (lyrics && lyrics.trim() && !lyrics.includes('error') && !lyrics.includes('not found')) {
        return {
          lyrics: lyrics.trim(),
          found: true,
          source: baseUrl
        };
      }
      
      return { lyrics: '', found: false, source: baseUrl };
      
    } catch (error) {
      console.warn(`Erro ao buscar letras em ${baseUrl}:`, error);
      return { lyrics: '', found: false, source: baseUrl };
    }
  }

  /**
   * Analisa a estrutura das letras
   */
  private analyzeLyricsStructure(lyrics: string): {
    wordCount: number;
    lineCount: number;
    hasChorus: boolean;
    structure?: {
      verses: number;
      chorus: number;
      bridge: number;
      outro: number;
    };
  } {
    if (!lyrics) {
      return { wordCount: 0, lineCount: 0, hasChorus: false };
    }
    
    const lines = lyrics.split('\n').filter(line => line.trim());
    const words = lyrics.split(/\s+/).filter(word => word.trim());
    
    // Detectar estrutura básica
    const lyricsLower = lyrics.toLowerCase();
    const hasChorus = /\b(chorus|refrão|refrain)\b/i.test(lyrics) || 
                     this.detectRepeatingPatterns(lines);
    
    const structure = {
      verses: (lyricsLower.match(/\b(verse|verso)\b/gi) || []).length,
      chorus: (lyricsLower.match(/\b(chorus|refrão|refrain)\b/gi) || []).length,
      bridge: (lyricsLower.match(/\b(bridge|ponte)\b/gi) || []).length,
      outro: (lyricsLower.match(/\b(outro|final)\b/gi) || []).length
    };
    
    return {
      wordCount: words.length,
      lineCount: lines.length,
      hasChorus,
      structure
    };
  }

  /**
   * Detecta padrões repetitivos que podem indicar refrão
   */
  private detectRepeatingPatterns(lines: string[]): boolean {
    const lineGroups: { [key: string]: number } = {};
    
    for (const line of lines) {
      const normalized = line.trim().toLowerCase();
      if (normalized.length > 10) { // Apenas linhas significativas
        lineGroups[normalized] = (lineGroups[normalized] || 0) + 1;
      }
    }
    
    // Se alguma linha aparece 2+ vezes, provavelmente é refrão
    return Object.values(lineGroups).some(count => count >= 2);
  }

  /**
   * Análise semântica básica das letras
   */
  analyzeLyricsContent(lyrics: string): LyricsAnalysis {
    if (!lyrics) {
      return {
        sentiment: 'neutral',
        themes: [],
        literaryDevices: [],
        vocabulary: 'simple',
        narrativePerspective: 'first-person',
        emotionalTone: [],
        culturalReferences: []
      };
    }
    
    const lyricsLower = lyrics.toLowerCase();
    
    // Análise de sentimento básica
    const positiveWords = ['love', 'happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'great', 'good', 'best', 'perfect'];
    const negativeWords = ['hate', 'sad', 'pain', 'hurt', 'broken', 'lost', 'alone', 'dark', 'death', 'cry'];
    
    const positiveCount = positiveWords.filter(word => lyricsLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lyricsLower.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';
    else if (positiveCount > 0 && negativeCount > 0) sentiment = 'mixed';
    
    // Detectar temas comuns
    const themes: string[] = [];
    if (/\b(love|amor|heart|coração)\b/i.test(lyrics)) themes.push('Love/Romance');
    if (/\b(money|dinheiro|cash|grana)\b/i.test(lyrics)) themes.push('Money/Wealth');
    if (/\b(party|festa|dance|dançar)\b/i.test(lyrics)) themes.push('Party/Celebration');
    if (/\b(family|família|mother|father|mãe|pai)\b/i.test(lyrics)) themes.push('Family');
    if (/\b(street|rua|hood|quebrada)\b/i.test(lyrics)) themes.push('Street Life');
    if (/\b(dream|sonho|hope|esperança)\b/i.test(lyrics)) themes.push('Dreams/Aspirations');
    
    // Detectar dispositivos literários
    const literaryDevices: string[] = [];
    if (/\b(\w+)\s+like\s+(\w+)\b/i.test(lyrics)) literaryDevices.push('Simile');
    if (lyrics.match(/\b(\w+)\s+is\s+(\w+)\b/i)) literaryDevices.push('Metaphor');
    if (lyrics.match(/\b(\w)\w*\s+\1\w*/i)) literaryDevices.push('Alliteration');
    
    // Perspectiva narrativa
    let narrativePerspective: 'first-person' | 'second-person' | 'third-person' | 'mixed' = 'first-person';
    const firstPerson = (lyricsLower.match(/\b(i|me|my|we|us|our)\b/g) || []).length;
    const secondPerson = (lyricsLower.match(/\b(you|your|yours)\b/g) || []).length;
    const thirdPerson = (lyricsLower.match(/\b(he|she|they|him|her|them)\b/g) || []).length;
    
    if (secondPerson > firstPerson && secondPerson > thirdPerson) {
      narrativePerspective = 'second-person';
    } else if (thirdPerson > firstPerson && thirdPerson > secondPerson) {
      narrativePerspective = 'third-person';
    } else if (firstPerson > 0 && secondPerson > 0 && thirdPerson > 0) {
      narrativePerspective = 'mixed';
    }
    
    return {
      sentiment,
      themes,
      literaryDevices,
      vocabulary: this.analyzeVocabulary(lyrics),
      narrativePerspective,
      emotionalTone: this.analyzeEmotionalTone(lyrics),
      culturalReferences: this.detectCulturalReferences(lyrics)
    };
  }

  private analyzeVocabulary(lyrics: string): 'simple' | 'moderate' | 'complex' | 'sophisticated' {
    const words = lyrics.split(/\s+/).filter(word => word.length > 3);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (avgWordLength < 4) return 'simple';
    if (avgWordLength < 5.5) return 'moderate';
    if (avgWordLength < 7) return 'complex';
    return 'sophisticated';
  }

  private analyzeEmotionalTone(lyrics: string): string[] {
    const tones: string[] = [];
    const lyricsLower = lyrics.toLowerCase();
    
    if (/\b(angry|mad|rage|furious)\b/i.test(lyrics)) tones.push('Angry');
    if (/\b(sad|melancholy|depressed|blue)\b/i.test(lyrics)) tones.push('Melancholic');
    if (/\b(happy|joyful|excited|euphoric)\b/i.test(lyrics)) tones.push('Joyful');
    if (/\b(romantic|tender|intimate|sweet)\b/i.test(lyrics)) tones.push('Romantic');
    if (/\b(confident|strong|powerful|bold)\b/i.test(lyrics)) tones.push('Confident');
    if (/\b(nostalgic|remember|past|memories)\b/i.test(lyrics)) tones.push('Nostalgic');
    
    return tones.length > 0 ? tones : ['Neutral'];
  }

  private detectCulturalReferences(lyrics: string): string[] {
    const references: string[] = [];
    
    // Referências brasileiras
    if (/\b(brasil|brazil|rio|são paulo|favela|samba|funk)\b/i.test(lyrics)) {
      references.push('Brazilian Culture');
    }
    
    // Referências americanas
    if (/\b(america|usa|hollywood|brooklyn|atlanta|la)\b/i.test(lyrics)) {
      references.push('American Culture');
    }
    
    // Referências urbanas
    if (/\b(street|hood|block|corner|city)\b/i.test(lyrics)) {
      references.push('Urban Culture');
    }
    
    return references;
  }
}

export default LyricsService;
