
import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis } from '../types';

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
  } catch (error) {
    console.warn('Erro ao obter informações do vídeo:', error);
    return null;
  }
};

const analysisSchema = {
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
  },
  required: ["songInfo", "musicalElements", "composition", "soundEngineering", "lyricalAnalysis", "culturalContext"]
};


export const analyzeMusic = async (youtubeUrl: string, apiKey: string): Promise<Analysis> => {
    if (!apiKey) {
        throw new Error("A chave de API da Gemini não foi fornecida.");
    }

    // Validar se é uma URL válida do YouTube
    if (!isValidYouTubeUrl(youtubeUrl)) {
        throw new Error("Por favor, forneça uma URL válida do YouTube.");
    }

    // Extrair o ID do vídeo
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
        throw new Error("Não foi possível extrair o ID do vídeo do YouTube da URL fornecida.");
    }

    // Obter informações do vídeo do YouTube
    const videoInfo = await getYouTubeVideoInfo(videoId);

    const ai = new GoogleGenAI({ apiKey });

    // Construir informações do vídeo para o prompt
    let videoInfoText = '';
    if (videoInfo) {
        videoInfoText = `
**INFORMAÇÕES OBTIDAS DO VÍDEO:**
- Título do vídeo: "${videoInfo.title}"
- Canal/Artista: "${videoInfo.author_name}"`;
    }

    const prompt = `Sua função é atuar como um musicólogo acadêmico, engenheiro de som mestre e compositor virtuoso. Sua missão é realizar uma análise musical detalhada e profunda da música contida no vídeo do YouTube especificado.

**INFORMAÇÕES DO VÍDEO:**
- URL completa: ${youtubeUrl}
- ID do vídeo: ${videoId}
- Link direto: https://www.youtube.com/watch?v=${videoId}${videoInfoText}

**Instruções Críticas:**
1.  **Identificação OBRIGATÓRIA**: ${videoInfo ? `Você DEVE analisar EXCLUSIVAMENTE a música "${videoInfo.title}" do artista/canal "${videoInfo.author_name}". Esta é a música correta que deve ser analisada.` : `Identifique EXATAMENTE o título e o artista da música do vídeo com ID "${videoId}".`}
2.  **Verificação OBRIGATÓRIA**: ${videoInfo ? `CONFIRME que você está analisando "${videoInfo.title}" de "${videoInfo.author_name}" e NÃO qualquer outra música.` : `Certifique-se de que está analisando especificamente o vídeo com ID "${videoId}".`}
3.  **Título e Artista CORRETOS**: ${videoInfo ? `No campo "title" use EXATAMENTE "${videoInfo.title.split(' - ')[1]?.split(' (')[0] || videoInfo.title}" e no campo "artist" use EXATAMENTE "${videoInfo.author_name}".` : `Use as informações corretas do vídeo especificado.`}
4.  **Fonte de Análise**: Baseie sua análise em seu conhecimento sobre esta música específica identificada.
5.  **Formato de Saída**: A resposta DEVE ser um objeto JSON único que adira estritamente ao esquema JSON fornecido.
6.  **Falha na Análise**: Se você não conseguir identificar com certeza esta música específica ou não tiver informações suficientes sobre ela, **preencha o campo "error"** com a mensagem "Não foi possível identificar ou analisar a música especificada.". Neste caso, preencha os outros campos obrigatórios com valores padrão apropriados.

**CRÍTICO**: ${videoInfo ? `A música a ser analisada é "${videoInfo.title}" de "${videoInfo.author_name}". NÃO analise nenhuma outra música. Se você analisar uma música diferente, isso será considerado um erro grave.` : `Analise especificamente o vídeo com ID "${videoId}".`}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const text = response.text.trim();
    const parsedData: Analysis = JSON.parse(text);
    return parsedData;

  } catch (error) {
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
