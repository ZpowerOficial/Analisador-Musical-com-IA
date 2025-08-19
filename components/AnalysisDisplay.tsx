
import React, { useState, useCallback } from 'react';
import type { Analysis } from '../types';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { ComposerIcon } from './icons/ComposerIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface AnalysisDisplayProps {
  analysis: Analysis;
  youtubeUrl?: string;
}

const AnalysisCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center">
            {icon}
            <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <dt className="font-semibold text-slate-400 text-sm uppercase tracking-wider">{label}</dt>
        <dd className="mt-1 text-slate-200 whitespace-pre-wrap">{children}</dd>
    </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-slate-700 text-cyan-300 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
        {children}
    </span>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, youtubeUrl }) => {
  const [isCopied, setIsCopied] = useState(false);
  const {
    songInfo,
    musicalElements,
    composition,
    soundEngineering,
    lyricalAnalysis,
    culturalContext,
    genreAnalysis,
    flowAnalysis,
    popularityMetrics,
    technicalAnalysis
  } = analysis;

  // Função para extrair ID do vídeo da URL
  const extractVideoId = (url: string): string | null => {
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

  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  const handleCopy = useCallback(() => {
    const promptText = `# ANÁLISE MUSICAL PROFISSIONAL COMPLETA

## Identificação Musical
- **Título**: ${songInfo.title}
- **Artista**: ${songInfo.artist}
- **Ano**: ${songInfo.year}
- **Gênero Principal**: ${songInfo.mainGenre}
- **Subgêneros**: ${songInfo.subgenres.join(', ')}

## Elementos Musicais Fundamentais
- **BPM**: ${musicalElements.bpm} (${musicalElements.tempoDescription})
- **Tonalidade**: ${musicalElements.key}
- **Modo**: ${musicalElements.mode}
- **Fórmula de Compasso**: ${musicalElements.timeSignature}
- **Atmosfera**: ${musicalElements.mood.join(', ')}
- **Caráter Tonal**: ${musicalElements.tonality}

## Análise de Gênero Avançada
${analysis.genreAnalysis ? `
- **Gênero Primário**: ${analysis.genreAnalysis.primaryGenre}
- **Subgêneros Específicos**: ${analysis.genreAnalysis.subgenres.join(', ')}
- **Confiança na Classificação**: ${analysis.genreAnalysis.genreConfidence}%
- **Influências Cross-Genre**: ${analysis.genreAnalysis.crossGenreInfluences.join(', ')}
- **Evolução do Gênero**: ${analysis.genreAnalysis.genreEvolution}
- **Influências Regionais**: ${analysis.genreAnalysis.regionalInfluences.join(', ')}
` : ''}

## Análise de Flow e Ritmo
${analysis.flowAnalysis ? `
- **Flow Geral**: ${analysis.flowAnalysis.overallFlow}
- **Complexidade Rítmica**: ${analysis.flowAnalysis.rhythmicComplexity}/10
- **Nível de Sincopação**: ${analysis.flowAnalysis.syncopationLevel}/10
- **Padrão de Groove**: ${analysis.flowAnalysis.groovePattern}
- **Variações Rítmicas**: ${analysis.flowAnalysis.rhythmicVariations.join(', ')}
- **Elementos Polirrítmicos**: ${analysis.flowAnalysis.polyrhythmicElements.join(', ')}
` : ''}

## Métricas de Popularidade
${analysis.popularityMetrics ? `
- **Popularidade Global**: ${analysis.popularityMetrics.globalPopularity}/100
- **Status de Tendência**: ${analysis.popularityMetrics.trendingStatus}
- **Impacto Cultural**: ${analysis.popularityMetrics.culturalImpact}
- **Apelo Crossover**: ${analysis.popularityMetrics.crossoverAppeal}/100
` : ''}

## Análise Técnica de Produção
${analysis.technicalAnalysis ? `
- **Qualidade de Produção**: ${analysis.technicalAnalysis.productionQuality}/10
- **Técnicas de Mixagem**: ${analysis.technicalAnalysis.mixingTechniques.join(', ')}
- **Abordagem de Masterização**: ${analysis.technicalAnalysis.masteringApproach}
- **Design Espacial**: ${analysis.technicalAnalysis.spatialDesign}
- **Espectro de Frequências**:
  - Graves: ${analysis.technicalAnalysis.frequencySpectrum.lowEnd}
  - Médios: ${analysis.technicalAnalysis.frequencySpectrum.midRange}
  - Agudos: ${analysis.technicalAnalysis.frequencySpectrum.highEnd}
- **Processamento Dinâmico**: ${analysis.technicalAnalysis.dynamicProcessing.join(', ')}
` : ''}

## Blueprint de Composição

### Identidade Sonora
- **Gênero Principal:** ${songInfo.mainGenre}
- **Subgêneros:** ${songInfo.subgenres.join(', ')}
- **Estilo de Artista (Referência):** ${songInfo.artist}
- **Clima/Atmosfera:** ${musicalElements.mood.join(', ')}

### DNA Musical
- **BPM:** ${musicalElements.bpm} (${musicalElements.tempoDescription})
- **Tonalidade:** ${musicalElements.key}
- **Modo:** ${musicalElements.mode}
- **Fórmula de Compasso:** ${musicalElements.timeSignature}
- **Caráter Tonal:** ${musicalElements.tonality}

### Blueprint de Composição
- **Análise de Forma:** ${composition.formAnalysis}
- **Progressões Harmônicas Chave:** ${composition.chordProgressions.join(' | ')}
- **Dispositivos Harmônicos:** ${composition.harmonicDevices.join(', ')}
- **Contorno Melódico:** ${composition.melodicContour}
- **Técnica Vocal (se aplicável):** ${composition.vocalTechnique}
- **Padrões Rítmicos e Sincopação:** ${composition.rhythmicPatterns}. ${composition.syncopationDetails}

### Filosofia de Produção
- **Instrumentação e Performance:**
${soundEngineering.instrumentation.map(i => `- ${i.instrument}: ${i.performanceAnalysis}`).join('\n')}
- **Balanço de Frequência:** ${soundEngineering.frequencyBalance}
- **Dinâmica:** ${soundEngineering.dynamicRange}
- **Palco Sonoro e Panning:** ${soundEngineering.soundstage}. ${soundEngineering.panningDetails}
- **Largura Estéreo:** ${soundEngineering.stereoWidth}
- **Efeitos Notáveis:** ${soundEngineering.effects.join(', ')}

### Temática Lírica
- **Tema Central:** ${lyricalAnalysis.theme}
- **Estrutura Narrativa:** ${lyricalAnalysis.narrativeStructure}
- **Dispositivos Literários:** ${lyricalAnalysis.literaryDevices.join(', ')}
- **Esquema de Rimas:** ${lyricalAnalysis.rhymeScheme}
`;

    navigator.clipboard.writeText(promptText.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [analysis]);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Video Info */}
      {youtubeUrl && videoId && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Vídeo Analisado</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div><span className="text-slate-400">ID do Vídeo:</span> <code className="bg-slate-700 px-2 py-1 rounded text-cyan-300">{videoId}</code></div>
            <div><span className="text-slate-400">URL:</span> <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">{youtubeUrl}</a></div>
          </div>
        </div>
      )}

      {/* Lyrics Info */}
      {analysis.lyricalAnalysis && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-2">📝 Letras Analisadas</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div><span className="text-slate-400">Status:</span> <span className="text-green-400">✅ Letras encontradas e analisadas</span></div>
            <div><span className="text-slate-400">Tema Principal:</span> <span className="text-cyan-300">{analysis.lyricalAnalysis.theme}</span></div>
            <div><span className="text-slate-400">Tom Emocional:</span> <span className="text-purple-300">{analysis.lyricalAnalysis.emotionalTone}</span></div>
            <div><span className="text-slate-400">Perspectiva:</span> <span className="text-yellow-300">{analysis.lyricalAnalysis.narrativePerspective}</span></div>
          </div>
        </div>
      )}

      {/* Song Info Header */}
      <div className="text-center p-6 bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700 relative">
        <div className="absolute top-4 right-4">
          <button onClick={handleCopy} className="flex items-center px-3 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-sm font-semibold text-cyan-300 rounded-md transition-all duration-200 disabled:opacity-50">
            {isCopied ? <CheckIcon className="w-4 h-4 mr-2" /> : <ClipboardIcon className="w-4 h-4 mr-2" />}
            {isCopied ? 'Copiado!' : 'Copiar Análise'}
          </button>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">{songInfo.title}</h2>
        <p className="text-xl md:text-2xl text-slate-300 mt-2">{songInfo.artist}</p>
        <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-slate-400">
          <span>{songInfo.year}</span>
          <span className="hidden sm:inline">|</span>
          <span>{songInfo.mainGenre}</span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
            {songInfo.subgenres.map((g, i) => <Pill key={i}>{g}</Pill>)}
        </div>
      </div>

      {/* Musical Elements */}
      <AnalysisCard title="Elementos Musicais" icon={<MusicNoteIcon className="w-6 h-6 mr-3 text-cyan-400"/>}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><DetailItem label="BPM">{musicalElements.bpm} ({musicalElements.tempoDescription})</DetailItem></div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><DetailItem label="Tonalidade">{musicalElements.key}</DetailItem></div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><DetailItem label="Modo">{musicalElements.mode}</DetailItem></div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><DetailItem label="Compasso">{musicalElements.timeSignature}</DetailItem></div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><DetailItem label="Caráter Tonal">{musicalElements.tonality}</DetailItem></div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center col-span-2 md:col-span-1"><DetailItem label="Humor">{musicalElements.mood.join(', ')}</DetailItem></div>
        </div>
      </AnalysisCard>
      
      {/* Composition */}
      <AnalysisCard title="Composição e Estrutura" icon={<ComposerIcon className="w-6 h-6 mr-3 text-cyan-400"/>}>
        <dl className="space-y-4">
            <DetailItem label="Análise de Forma">{composition.formAnalysis}</DetailItem>
            <DetailItem label="Transições">{composition.transitionDetails}</DetailItem>
            <DetailItem label="Harmonia">{composition.harmony}</DetailItem>
            <DetailItem label="Progressões de Acordes"><div className="flex flex-wrap gap-2 mt-1">{composition.chordProgressions.map((p, i) => <Pill key={i}>{p}</Pill>)}</div></DetailItem>
            <DetailItem label="Dispositivos Harmônicos"><div className="flex flex-wrap gap-2 mt-1">{composition.harmonicDevices.map((d, i) => <Pill key={i}>{d}</Pill>)}</div></DetailItem>
            <DetailItem label="Melodia">{composition.melody}</DetailItem>
            <DetailItem label="Contorno Melódico">{composition.melodicContour}</DetailItem>
            <DetailItem label="Técnica Vocal">{composition.vocalTechnique}</DetailItem>
            <DetailItem label="Ritmo (Flow)">{composition.rhythm}</DetailItem>
             <DetailItem label="Padrões Rítmicos">{composition.rhythmicPatterns}</DetailItem>
             <DetailItem label="Sincopação">{composition.syncopationDetails}</DetailItem>
        </dl>
      </AnalysisCard>

      {/* Sound Engineering */}
      <AnalysisCard title="Engenharia de Som e Produção" icon={<SoundWaveIcon className="w-6 h-6 mr-3 text-cyan-400"/>}>
         <dl className="space-y-4">
            <DetailItem label="Instrumentação e Performance">
                <div className="space-y-3 mt-1">
                    {soundEngineering.instrumentation.map((item, i) => (
                        <div key={i} className="p-3 bg-slate-900/70 border border-slate-700 rounded-md">
                            <p className="font-semibold text-cyan-300">{item.instrument}</p>
                            <p className="text-slate-300 text-sm mt-1">{item.performanceAnalysis}</p>
                        </div>
                    ))}
                </div>
            </DetailItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Mixagem">{soundEngineering.mixing}</DetailItem>
                <DetailItem label="Masterização">{soundEngineering.mastering}</DetailItem>
                <DetailItem label="Balanço de Frequência">{soundEngineering.frequencyBalance}</DetailItem>
                <DetailItem label="Faixa Dinâmica">{soundEngineering.dynamicRange}</DetailItem>
                <DetailItem label="Palco Sonoro">{soundEngineering.soundstage}</DetailItem>
                <DetailItem label="Detalhes de Panning">{soundEngineering.panningDetails}</DetailItem>
                <DetailItem label="Largura Estéreo">{soundEngineering.stereoWidth}</DetailItem>
                <DetailItem label="LUFS (Estimado)">{soundEngineering.lufs}</DetailItem>
            </div>
            <DetailItem label="Efeitos Notáveis">
                 <div className="flex flex-wrap gap-2 mt-1">
                    {soundEngineering.effects.map((effect, i) => <Pill key={i}>{effect}</Pill>)}
                </div>
            </DetailItem>
        </dl>
      </AnalysisCard>

      {/* Lyrical Analysis */}
      <AnalysisCard title="Análise Lírica" icon={<BookOpenIcon className="w-6 h-6 mr-3 text-cyan-400"/>}>
        <dl className="space-y-4">
          <DetailItem label="Tema Central">{lyricalAnalysis.theme}</DetailItem>
          <DetailItem label="Estrutura Narrativa">{lyricalAnalysis.narrativeStructure}</DetailItem>
          <DetailItem label="Esquema de Rimas">{lyricalAnalysis.rhymeScheme}</DetailItem>
          <DetailItem label="Dispositivos Literários">
            <div className="flex flex-wrap gap-2 mt-1">
              {lyricalAnalysis.literaryDevices.map((device, i) => <Pill key={i}>{device}</Pill>)}
            </div>
          </DetailItem>
        </dl>
      </AnalysisCard>

      {/* Cultural Context */}
      <AnalysisCard title="Contexto Cultural" icon={<GlobeIcon className="w-6 h-6 mr-3 text-cyan-400"/>}>
        <dl className="space-y-4">
          <DetailItem label="Significado Histórico">{culturalContext.historicalSignificance}</DetailItem>
          <DetailItem label="Influências">{culturalContext.influences}</DetailItem>
          <DetailItem label="Impacto e Legado">{culturalContext.impact}</DetailItem>
        </dl>
      </AnalysisCard>

      {/* Genre Analysis */}
      {genreAnalysis && (
        <AnalysisCard title="Análise de Gênero Avançada" icon={<span className="w-6 h-6 mr-3 text-cyan-400">🎭</span>}>
          <dl className="space-y-4">
            <DetailItem label="Gênero Primário">{genreAnalysis.primaryGenre}</DetailItem>
            <DetailItem label="Confiança na Classificação">{genreAnalysis.genreConfidence}%</DetailItem>
            <DetailItem label="Subgêneros Específicos">
              <div className="flex flex-wrap gap-2 mt-1">
                {genreAnalysis.subgenres.map((genre, i) => <Pill key={i}>{genre}</Pill>)}
              </div>
            </DetailItem>
            <DetailItem label="Influências Cross-Genre">
              <div className="flex flex-wrap gap-2 mt-1">
                {genreAnalysis.crossGenreInfluences.map((influence, i) => <Pill key={i}>{influence}</Pill>)}
              </div>
            </DetailItem>
            <DetailItem label="Evolução do Gênero">{genreAnalysis.genreEvolution}</DetailItem>
            <DetailItem label="Influências Regionais">
              <div className="flex flex-wrap gap-2 mt-1">
                {genreAnalysis.regionalInfluences.map((region, i) => <Pill key={i}>{region}</Pill>)}
              </div>
            </DetailItem>
          </dl>
        </AnalysisCard>
      )}

      {/* Flow Analysis */}
      {flowAnalysis && (
        <AnalysisCard title="Análise de Flow e Ritmo" icon={<span className="w-6 h-6 mr-3 text-cyan-400">🌊</span>}>
          <dl className="space-y-4">
            <DetailItem label="Flow Geral">{flowAnalysis.overallFlow}</DetailItem>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Complexidade Rítmica">
                <div className="flex items-center">
                  <div className="w-full bg-slate-700 rounded-full h-2 mr-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${(flowAnalysis.rhythmicComplexity / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{flowAnalysis.rhythmicComplexity}/10</span>
                </div>
              </DetailItem>
              <DetailItem label="Nível de Sincopação">
                <div className="flex items-center">
                  <div className="w-full bg-slate-700 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(flowAnalysis.syncopationLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{flowAnalysis.syncopationLevel}/10</span>
                </div>
              </DetailItem>
            </div>
            <DetailItem label="Padrão de Groove">{flowAnalysis.groovePattern}</DetailItem>
            <DetailItem label="Variações Rítmicas">
              <div className="flex flex-wrap gap-2 mt-1">
                {flowAnalysis.rhythmicVariations.map((variation, i) => <Pill key={i}>{variation}</Pill>)}
              </div>
            </DetailItem>
            <DetailItem label="Elementos Polirrítmicos">
              <div className="flex flex-wrap gap-2 mt-1">
                {flowAnalysis.polyrhythmicElements.map((element, i) => <Pill key={i}>{element}</Pill>)}
              </div>
            </DetailItem>
          </dl>
        </AnalysisCard>
      )}

    </div>
  );
};
