
import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Copy, Check, Smartphone, Monitor, Loader2 } from 'lucide-react';

interface GamePreviewProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
  gameName?: string;
}

const GamePreview: React.FC<GamePreviewProps> = ({ code, isOpen, onClose, gameName }) => {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsReady(false);
      const timer = setTimeout(() => setIsReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="h-16 bg-[#0D0D0E] border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Gamepad2 className="text-purple-500" size={20} />
          <h3 className="text-[12px] font-black text-white uppercase tracking-widest">{gameName || 'Game Engine'}</h3>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button onClick={() => setTab('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'preview' ? 'bg-white text-black' : 'text-white/40'}`}>Game</button>
          <button onClick={() => setTab('code')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-white text-black' : 'text-white/40'}`}>Source</button>
        </div>
        <button onClick={onClose} className="p-2 bg-red-500/10 text-red-400 rounded-full"><X size={20} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#050505]">
        {tab === 'preview' && (
          <div className="w-[80vw] max-w-[960px] aspect-video rounded-3xl border border-white/10 bg-black overflow-hidden relative">
            {!isReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <Loader2 size={32} className="text-purple-500 animate-spin" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Initializing Engine...</p>
              </div>
            ) : (
              <iframe srcDoc={code} className="w-full h-full border-none" title="Game" />
            )}
          </div>
        )}
        {tab === 'code' && (
          <div className="w-full h-full max-w-5xl bg-[#0F0F10] rounded-[2rem] border border-white/10 flex flex-col p-8">
            <pre className="font-mono text-sm text-purple-200/60 overflow-auto whitespace-pre no-scrollbar">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePreview;
