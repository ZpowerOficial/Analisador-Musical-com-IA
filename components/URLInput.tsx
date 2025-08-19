
import React, { useState } from 'react';

interface URLInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

// Função para validar URL do YouTube
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

export const URLInput: React.FC<URLInputProps> = ({ url, setUrl, onAnalyze, isLoading }) => {
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
    </div>
  );
};
