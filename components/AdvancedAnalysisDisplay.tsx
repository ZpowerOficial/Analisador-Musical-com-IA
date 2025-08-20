import React from 'react';
import type { AudioAnalysisResult, LyricsExtractionResult } from '../services/audioAnalysis.service';

interface AdvancedAnalysisDisplayProps {
  audioAnalysis?: AudioAnalysisResult;
  lyricsExtraction?: LyricsExtractionResult;
  confidenceScores?: Record<string, number>;
  analysisTransparency?: {
    methods: string[];
    limitations: string[];
    dataSource: string;
  };
}

export const AdvancedAnalysisDisplay: React.FC<AdvancedAnalysisDisplayProps> = ({
  audioAnalysis,
  lyricsExtraction,
  confidenceScores,
  analysisTransparency
}) => {
  if (!audioAnalysis && !lyricsExtraction && !confidenceScores) {
    return null;
  }

  const formatConfidence = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 0.9) return 'Excelente';
    if (score >= 0.8) return 'Muito Boa';
    if (score >= 0.7) return 'Boa';
    if (score >= 0.6) return 'Moderada';
    if (score >= 0.5) return 'Baixa';
    return 'Muito Baixa';
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
          🔬 Análise Avançada - Dados Técnicos
        </h3>

        {/* Confidence Scores */}
        {confidenceScores && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">📊 Scores de Confiança</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(confidenceScores).map(([key, score]) => (
                <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 capitalize mb-1">
                    {key.replace('_', ' ')}
                  </div>
                  <div className={`text-lg font-bold ${getConfidenceColor(score)}`}>
                    {formatConfidence(score)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {getConfidenceLabel(score)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Analysis */}
        {audioAnalysis && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔊 Análise de Áudio Técnica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tempo & Key */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">🎵 Elementos Musicais</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">BPM:</span>
                    <span className="text-white">{audioAnalysis.features.tempo.bpm.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tonalidade:</span>
                    <span className="text-white">{audioAnalysis.features.key.key} {audioAnalysis.features.key.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estabilidade do Tempo:</span>
                    <span className="text-white">{(audioAnalysis.features.tempo.tempo_stability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Range */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">📈 Dinâmica</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loudness (LUFS):</span>
                    <span className="text-white">{audioAnalysis.features.dynamic.loudness_lufs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Range Dinâmico:</span>
                    <span className="text-white">{audioAnalysis.features.dynamic.dynamic_range.toFixed(1)}dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qualidade:</span>
                    <span className={`capitalize ${
                      audioAnalysis.audio_quality === 'excellent' ? 'text-green-400' :
                      audioAnalysis.audio_quality === 'good' ? 'text-blue-400' :
                      audioAnalysis.audio_quality === 'fair' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {audioAnalysis.audio_quality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spectral Analysis */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">🌈 Análise Espectral</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Centroide Espectral:</span>
                    <span className="text-white">{audioAnalysis.features.spectral.spectral_centroid.toFixed(0)}Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rolloff:</span>
                    <span className="text-white">{audioAnalysis.features.spectral.spectral_rolloff.toFixed(0)}Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Largura de Banda:</span>
                    <span className="text-white">{audioAnalysis.features.spectral.spectral_bandwidth.toFixed(0)}Hz</span>
                  </div>
                </div>
              </div>

              {/* Production Analysis */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">🎛️ Produção</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Largura Estéreo:</span>
                    <span className="text-white">{(audioAnalysis.features.production.stereo_width * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ruído de Fundo:</span>
                    <span className="text-white">{audioAnalysis.features.production.noise_floor.toFixed(1)}dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distorção:</span>
                    <span className="text-white">{(audioAnalysis.features.production.distortion_level * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lyrics Extraction */}
        {lyricsExtraction && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎤 Análise Vocal e Lírica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">🗣️ Características Vocais</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Range de Pitch:</span>
                    <span className="text-white">
                      {lyricsExtraction.vocal_characteristics.pitch_range.min}-{lyricsExtraction.vocal_characteristics.pitch_range.max}Hz
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clareza:</span>
                    <span className="text-white">{(lyricsExtraction.vocal_characteristics.articulation_clarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Intensidade Emocional:</span>
                    <span className="text-white">{(lyricsExtraction.vocal_characteristics.emotional_intensity * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-cyan-300 mb-2">📝 Análise Fonética</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxa de Fala:</span>
                    <span className="text-white">{lyricsExtraction.phonetic_analysis.speech_rate} pal/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clareza Consonantal:</span>
                    <span className="text-white">{(lyricsExtraction.phonetic_analysis.consonant_clarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Método:</span>
                    <span className="text-white capitalize">{lyricsExtraction.method.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Transparency */}
        {analysisTransparency && (
          <div className="bg-slate-800/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">🔍 Transparência da Análise</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-semibold text-cyan-300 mb-2">Métodos Utilizados</h5>
                <ul className="text-sm text-slate-300 space-y-1">
                  {analysisTransparency.methods.map((method, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-yellow-300 mb-2">Limitações</h5>
                <ul className="text-sm text-slate-300 space-y-1">
                  {analysisTransparency.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-400 mr-2">⚠</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-green-300 mb-2">Fonte dos Dados</h5>
                <p className="text-sm text-slate-300">
                  {analysisTransparency.dataSource}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
