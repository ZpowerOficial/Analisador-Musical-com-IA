import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis } from '../types';

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
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Sua função é atuar como um musicólogo acadêmico, engenheiro de som mestre e compositor virtuoso. Sua missão é realizar uma análise musical detalhada e profunda da música contida no link do YouTube fornecido.

**Instruções Críticas:**
1.  **Identificação**: Primeiro, identifique o título e o artista da música a partir do link ou título do vídeo do YouTube. Se não conseguir identificar a música com certeza, retorne um erro.
2.  **Fonte de Análise**: Baseie sua análise em seu vasto conhecimento sobre esta música específica. Analise a composição, produção e contexto cultural como se estivesse consultando uma enciclopédia musical completa.
3.  **Formato de Saída**: A resposta DEVE ser um objeto JSON único que adira estritamente ao esquema JSON fornecido.
4.  **Falha na Análise**: Se você não conseguir identificar a música no link ou não tiver informações suficientes sobre ela para realizar uma análise detalhada, **preencha o campo "error"** com a mensagem "Não foi possível identificar ou analisar a música do link fornecido.". Neste caso, preencha os outros campos obrigatórios com valores padrão apropriados (ex: "N/A" para strings, 0 para números, e arrays vazios [] para listas).

O link para análise é: ${youtubeUrl}`;

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
    if (error?.message?.includes('API key not valid')) {
      throw new Error('A chave de API fornecida é inválida. Verifique se a chave está correta e tente novamente.');
    }
    if (error?.message?.includes('xhr error')) {
      throw new Error('Erro de rede ao contatar a API Gemini. Isso pode ser um problema de CORS ou uma restrição na sua chave de API. Verifique as configurações da sua chave no Google Cloud Console.');
    }
    throw new Error("Falha ao obter a análise da API Gemini. Verifique o console para mais detalhes.");
  }
};