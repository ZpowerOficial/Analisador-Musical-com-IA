
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { URLInput } from './components/URLInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeMusic } from './services/geminiService';
import type { Analysis } from './types';

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleAnalyze = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave de API da Gemini.');
      return;
    }
    if (!youtubeUrl.trim()) {
      setError('Por favor, insira um URL do YouTube.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeMusic(youtubeUrl, apiKey);
      if (result.error) {
        setError(result.error);
        setAnalysis(null);
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido durante a análise.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [youtubeUrl, apiKey]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg md:text-xl text-slate-400 mb-8">
            Cole um link de uma música do YouTube para receber uma análise musical completa gerada por IA, como se fosse feita por um especialista.
          </p>

          <div className="mb-6 text-left">
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-400 mb-2">
              Sua Chave de API da Gemini
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave de API aqui"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500 disabled:opacity-50"
            />
             <p className="text-xs text-slate-500 mt-2">
              Sua chave de API é usada apenas no seu navegador e não é armazenada.
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">
                Obtenha sua chave aqui.
              </a>
            </p>
            <details className="mt-3 text-xs text-slate-500">
              <summary className="cursor-pointer hover:text-slate-400">💡 Problemas com a API? Clique aqui para ajuda</summary>
              <div className="mt-2 p-3 bg-slate-800/50 rounded border border-slate-700 space-y-2">
                <p><strong>Se você receber erro de "SERVICE_DISABLED":</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Acesse o Google Cloud Console</li>
                  <li>Habilite a "Generative Language API"</li>
                  <li>Aguarde alguns minutos para a ativação</li>
                  <li>Tente novamente</li>
                </ol>
              </div>
            </details>
          </div>

          <URLInput
            url={youtubeUrl}
            setUrl={setYoutubeUrl}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {analysis && <AnalysisDisplay analysis={analysis} youtubeUrl={youtubeUrl} />}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Desenvolvido com React, Tailwind CSS, e a magia da API Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
