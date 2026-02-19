
import React, { useState, useEffect } from 'react';
import { 
  X, Smartphone, Play, Copy, Check, Terminal, 
  Wifi, Battery, Signal, Zap, ShieldCheck, Search,
  Menu, Bell, User, LayoutGrid, Heart, MessageCircle,
  Share2, Camera, MoreHorizontal, Plus, Loader2, Cpu, FileCode
} from 'lucide-react';

interface MobileAppPreviewProps {
  platform: 'React Native' | 'Flutter';
  code: string;
  isOpen: boolean;
  onClose: () => void;
  appIcon?: string;
  appName?: string;
}

const MobileAppPreview: React.FC<MobileAppPreviewProps> = ({ platform, code, isOpen, onClose, appIcon, appName }) => {
  const [tab, setTab] = useState<'preview' | 'code' | 'logs'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#0A0A0B] flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <div className="h-16 bg-[#121214] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <Cpu className="w-5 h-5 text-blue-500" />
          <div className="flex items-center space-x-2">
            {appIcon && <img src={appIcon} className="w-5 h-5 rounded-md object-cover border border-white/10" />}
            <h3 className="text-[12px] font-black text-white uppercase tracking-widest truncate max-w-[120px]">{appName || platform} Simulator</h3>
          </div>
        </div>

        <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10">
          <button onClick={() => setTab('preview')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'preview' ? 'bg-white text-black' : 'text-white/30'}`}>Preview</button>
          <button onClick={() => setTab('code')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-white text-black' : 'text-white/30'}`}>Code</button>
        </div>

        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X className="w-6 h-6 text-white/40" /></button>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#0A0A0B] relative justify-center items-center p-8">
        {tab === 'preview' && (
          <div className="relative border-[8px] border-[#1C1C1E] rounded-[3rem] w-[320px] h-[640px] shadow-2xl bg-black overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-10 text-[11px] font-black text-white z-[90]">
              <span>9:41</span>
              <div className="flex items-center space-x-2"><Wifi size={14} /><Battery size={16} /></div>
            </div>
            <div className="w-full h-full pt-10 bg-white relative">
              <iframe 
                srcDoc={code || "<html><body style='display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;'>No simulation code received.</body></html>"} 
                className="w-full h-full border-none" 
                title="App Simulator" 
              />
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
          </div>
        )}

        {tab === 'code' && (
          <div className="w-full h-full max-w-4xl bg-[#121214] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
             <div className="h-12 px-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <span className="text-[10px] font-mono text-white/40 uppercase">source_bundle.js</span>
                <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">{copied ? 'Copied' : 'Copy'}</button>
             </div>
             <pre className="flex-1 p-8 overflow-auto font-mono text-[12px] text-blue-200/60 whitespace-pre no-scrollbar">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAppPreview;
