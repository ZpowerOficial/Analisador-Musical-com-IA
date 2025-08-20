
import React, { useState } from 'react';

interface URLInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  isPlaylist?: boolean;
  progressMessage?: string;
}

// Função para validar URL do YouTube
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

export const URLInput: React.FC<URLInputProps> = ({ url, setUrl, onAnalyze, isLoading, isPlaylist, progressMessage }) => {
  const [urlError, setUrlError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar URL antes de enviar
    if (!url.trim()) {
      setUrlError('Por favor, insira uma URL do YouTube.');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setUrlError('Por favor, insira uma URL válida do YouTube (youtube.com ou youtu.be).');
      return;
    }

    setUrlError('');
    onAnalyze();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Limpar erro quando o usuário começar a digitar
    if (urlError) {
      setUrlError('');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="w-full">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-slate-800 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500 disabled:opacity-50 ${
              urlError ? 'border-red-500' : 'border-slate-600'
            }`}
            required
          />
          {urlError && (
            <p className="text-red-400 text-sm mt-1">{urlError}</p>
          )}
          {url && !urlError && (
            <div className="flex items-center mt-2 text-sm">
              {isPlaylist ? (
                <span className="flex items-center text-purple-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  📋 Playlist detectada - Analisará múltiplas músicas
                </span>
              ) : (
                <span className="flex items-center text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                  </svg>
                  🎵 Vídeo individual detectado
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !!urlError}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando...
            </>
          ) : (
            'Analisar Música'
          )}
        </button>
      </form>

      {/* Progress Message */}
      {isLoading && progressMessage && (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-400">Progresso da Análise</p>
              <p className="text-sm text-slate-300">{progressMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
