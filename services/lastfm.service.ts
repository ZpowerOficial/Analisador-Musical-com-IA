/**
 * Last.fm API Service
 * Serviço para enriquecimento de dados musicais e análise de tendências
 * Nível: Musicologia Acadêmica Avançada
 */

export interface LastFmTrackInfo {
  name: string;
  artist: string;
  album?: string;
  playcount: number;
  listeners: number;
  tags: Array<{
    name: string;
    count: number;
    url: string;
  }>;
  wiki?: {
    summary: string;
    content: string;
    published: string;
  };
  similar?: Array<{
    name: string;
    artist: string;
    match: number;
  }>;
}

export interface LastFmArtistInfo {
  name: string;
  playcount: number;
  listeners: number;
  bio: {
    summary: string;
    content: string;
  };
  tags: Array<{
    name: string;
    count: number;
  }>;
  similar: Array<{
    name: string;
    match: number;
  }>;
  stats: {
    playcount: number;
    listeners: number;
  };
}

export interface LastFmAlbumInfo {
  name: string;
  artist: string;
  playcount: number;
  listeners: number;
  tags: Array<{
    name: string;
    count: number;
  }>;
  wiki?: {
    summary: string;
    content: string;
  };
  tracks: Array<{
    name: string;
    duration: number;
    rank: number;
  }>;
}

class LastFmService {
  private readonly apiKey: string;
  private readonly baseUrl = 'http://ws.audioscrobbler.com/2.0/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Normaliza nomes de artistas e faixas para melhor matching
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Obtém informações detalhadas de uma faixa
   */
  async getTrackInfo(artist: string, track: string): Promise<LastFmTrackInfo | null> {
    try {
      const params = new URLSearchParams({
        method: 'track.getInfo',
        api_key: this.apiKey,
        artist: artist,
        track: track,
        format: 'json',
        autocorrect: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error || !data.track) {
        return null;
      }

      const trackData = data.track;

      return {
        name: trackData.name,
        artist: trackData.artist.name,
        album: trackData.album?.title,
        playcount: parseInt(trackData.playcount || '0'),
        listeners: parseInt(trackData.listeners || '0'),
        tags: trackData.toptags?.tag?.map((tag: any) => ({
          name: tag.name,
          count: parseInt(tag.count || '0'),
          url: tag.url
        })) || [],
        wiki: trackData.wiki ? {
          summary: trackData.wiki.summary,
          content: trackData.wiki.content,
          published: trackData.wiki.published
        } : undefined,
        similar: trackData.similar?.track?.map((similar: any) => ({
          name: similar.name,
          artist: similar.artist.name,
          match: parseFloat(similar.match || '0')
        })) || []
      };
    } catch (error) {
      console.error('Erro ao obter informações da faixa:', error);
      return null;
    }
  }

  /**
   * Obtém informações detalhadas de um artista
   */
  async getArtistInfo(artist: string): Promise<LastFmArtistInfo | null> {
    try {
      const params = new URLSearchParams({
        method: 'artist.getInfo',
        api_key: this.apiKey,
        artist: artist,
        format: 'json',
        autocorrect: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      if (data.error || !data.artist) {
        return null;
      }

      const artistData = data.artist;

      return {
        name: artistData.name,
        playcount: parseInt(artistData.stats.playcount || '0'),
        listeners: parseInt(artistData.stats.listeners || '0'),
        bio: {
          summary: artistData.bio.summary || '',
          content: artistData.bio.content || ''
        },
        tags: artistData.tags?.tag?.map((tag: any) => ({
          name: tag.name,
          count: parseInt(tag.count || '0')
        })) || [],
        similar: artistData.similar?.artist?.map((similar: any) => ({
          name: similar.name,
          match: parseFloat(similar.match || '0')
        })) || [],
        stats: {
          playcount: parseInt(artistData.stats.playcount || '0'),
          listeners: parseInt(artistData.stats.listeners || '0')
        }
      };
    } catch (error) {
      console.error('Erro ao obter informações do artista:', error);
      return null;
    }
  }

  /**
   * Obtém top tags de um artista para análise de gênero
   */
  async getArtistTopTags(artist: string): Promise<Array<{name: string; count: number}>> {
    try {
      const params = new URLSearchParams({
        method: 'artist.getTopTags',
        api_key: this.apiKey,
        artist: artist,
        format: 'json',
        autocorrect: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      if (data.error || !data.toptags?.tag) {
        return [];
      }

      return data.toptags.tag.map((tag: any) => ({
        name: tag.name,
        count: parseInt(tag.count || '0')
      }));
    } catch (error) {
      console.error('Erro ao obter top tags do artista:', error);
      return [];
    }
  }

  /**
   * Obtém faixas similares para análise comparativa
   */
  async getSimilarTracks(artist: string, track: string, limit: number = 10): Promise<Array<{name: string; artist: string; match: number}>> {
    try {
      const params = new URLSearchParams({
        method: 'track.getSimilar',
        api_key: this.apiKey,
        artist: artist,
        track: track,
        limit: limit.toString(),
        format: 'json',
        autocorrect: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      if (data.error || !data.similartracks?.track) {
        return [];
      }

      return data.similartracks.track.map((similar: any) => ({
        name: similar.name,
        artist: similar.artist.name,
        match: parseFloat(similar.match || '0')
      }));
    } catch (error) {
      console.error('Erro ao obter faixas similares:', error);
      return [];
    }
  }

  /**
   * Análise de popularidade e tendências
   */
  async getPopularityAnalysis(artist: string, track: string): Promise<{
    popularityScore: number;
    trendingStatus: 'rising' | 'stable' | 'declining' | 'unknown';
    genreRelevance: number;
    culturalImpact: 'low' | 'medium' | 'high' | 'legendary';
  }> {
    const trackInfo = await this.getTrackInfo(artist, track);
    const artistInfo = await this.getArtistInfo(artist);

    if (!trackInfo || !artistInfo) {
      return {
        popularityScore: 0,
        trendingStatus: 'unknown',
        genreRelevance: 0,
        culturalImpact: 'low'
      };
    }

    // Cálculo de score de popularidade (0-100)
    const maxListeners = 10000000; // Referência para normalização
    const popularityScore = Math.min((trackInfo.listeners / maxListeners) * 100, 100);

    // Análise de relevância de gênero baseada em tags
    const genreRelevance = trackInfo.tags.length > 0 ? 
      Math.min(trackInfo.tags.reduce((sum, tag) => sum + tag.count, 0) / 100, 100) : 0;

    // Determinação de impacto cultural
    let culturalImpact: 'low' | 'medium' | 'high' | 'legendary' = 'low';
    if (trackInfo.listeners > 5000000) culturalImpact = 'legendary';
    else if (trackInfo.listeners > 1000000) culturalImpact = 'high';
    else if (trackInfo.listeners > 100000) culturalImpact = 'medium';

    return {
      popularityScore,
      trendingStatus: 'stable', // Seria necessário dados temporais para determinar tendência
      genreRelevance,
      culturalImpact
    };
  }
}

export default LastFmService;
