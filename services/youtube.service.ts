/**
 * YouTube Data API v3 Service
 * Serviço profissional para extração de metadados do YouTube
 * Nível: Engenharia de Áudio Profissional
 */

export interface YouTubeVideoData {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  publishedAt: string;
  categoryId: string;
  tags: string[];
  defaultLanguage?: string;
  thumbnails: {
    high: { url: string; width: number; height: number };
  };
}

export interface YouTubePlaylistData {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  itemCount: number;
  videos: YouTubeVideoData[];
}

class YouTubeService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Extrai ID do vídeo de URLs do YouTube com suporte a todos os formatos
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  /**
   * Extrai ID da playlist de URLs do YouTube
   */
  extractPlaylistId(url: string): string | null {
    const match = url.match(/[&?]list=([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Converte duração ISO 8601 para segundos
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Obtém dados detalhados de um vídeo
   */
  async getVideoData(videoId: string): Promise<YouTubeVideoData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const video = data.items[0];
      
      return {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount || '0',
        likeCount: video.statistics.likeCount || '0',
        publishedAt: video.snippet.publishedAt,
        categoryId: video.snippet.categoryId,
        tags: video.snippet.tags || [],
        defaultLanguage: video.snippet.defaultLanguage,
        thumbnails: video.snippet.thumbnails
      };
    } catch (error) {
      console.error('Erro ao obter dados do vídeo:', error);
      return null;
    }
  }

  /**
   * Obtém dados de uma playlist completa
   */
  async getPlaylistData(playlistId: string, maxResults: number = 50): Promise<YouTubePlaylistData | null> {
    try {
      // Obter informações da playlist
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlists?id=${playlistId}&part=snippet,contentDetails&key=${this.apiKey}`
      );

      if (!playlistResponse.ok) {
        throw new Error(`YouTube API error: ${playlistResponse.status}`);
      }

      const playlistData = await playlistResponse.json();
      
      if (!playlistData.items || playlistData.items.length === 0) {
        return null;
      }

      const playlist = playlistData.items[0];

      // Obter vídeos da playlist
      const videosResponse = await fetch(
        `${this.baseUrl}/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=${maxResults}&key=${this.apiKey}`
      );

      const videosData = await videosResponse.json();
      const videoIds = videosData.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .filter(Boolean);

      // Obter dados detalhados dos vídeos em lotes
      const videos: YouTubeVideoData[] = [];
      const batchSize = 50; // Limite da API do YouTube

      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const batchResponse = await fetch(
          `${this.baseUrl}/videos?id=${batch.join(',')}&part=snippet,statistics,contentDetails&key=${this.apiKey}`
        );

        const batchData = await batchResponse.json();
        
        if (batchData.items) {
          const batchVideos = batchData.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            channelTitle: video.snippet.channelTitle,
            description: video.snippet.description,
            duration: video.contentDetails.duration,
            viewCount: video.statistics.viewCount || '0',
            likeCount: video.statistics.likeCount || '0',
            publishedAt: video.snippet.publishedAt,
            categoryId: video.snippet.categoryId,
            tags: video.snippet.tags || [],
            defaultLanguage: video.snippet.defaultLanguage,
            thumbnails: video.snippet.thumbnails
          }));

          videos.push(...batchVideos);
        }
      }

      return {
        id: playlist.id,
        title: playlist.snippet.title,
        channelTitle: playlist.snippet.channelTitle,
        description: playlist.snippet.description,
        itemCount: playlist.contentDetails.itemCount,
        videos
      };
    } catch (error) {
      console.error('Erro ao obter dados da playlist:', error);
      return null;
    }
  }

  /**
   * Determina se uma URL é de playlist ou vídeo individual
   */
  getUrlType(url: string): 'video' | 'playlist' | 'unknown' {
    if (this.extractPlaylistId(url)) return 'playlist';
    if (this.extractVideoId(url)) return 'video';
    return 'unknown';
  }
}

export default YouTubeService;
