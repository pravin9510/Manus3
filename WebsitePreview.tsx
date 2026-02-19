
import React, { useState } from 'react';
import { X, RotateCcw, Smartphone, Monitor, Copy, Check } from 'lucide-react';

interface WebsitePreviewProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ code, isOpen, onClose, title }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="h-14 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3 text-white/40 text-[11px] font-mono">
          <div className="flex space-x-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
          <span>preview.manus.ai/v{key}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
            <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-md ${viewMode === 'desktop' ? 'bg-white text-black' : 'text-white/40'}`}><Monitor size={14} /></button>
            <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md ${viewMode === 'mobile' ? 'bg-white text-black' : 'text-white/40'}`}><Smartphone size={14} /></button>
          </div>
          <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg text-white/60">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          <button onClick={() => setKey(k => k + 1)} className="p-2 hover:bg-white/10 rounded-lg text-white/60"><RotateCcw size={16} /></button>
          <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg text-white/60"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 bg-[#0F0F0F] p-4 flex items-center justify-center">
        <div className={`transition-all duration-500 bg-white shadow-2xl overflow-hidden ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[32px] border-[8px] border-[#1C1C1E]' : 'w-full h-full rounded-xl'}`}>
          <iframe key={key} srcDoc={code} className="w-full h-full border-none" title="Web" sandbox="allow-scripts" />
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;