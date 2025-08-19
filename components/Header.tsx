
import React from 'react';
import { MusicNoteIcon } from './icons/MusicNoteIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <MusicNoteIcon className="w-8 h-8 text-cyan-400 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          Analisador Musical com IA
        </h1>
      </div>
    </header>
  );
};
