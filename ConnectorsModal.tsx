
import React, { useState } from 'react';
import { 
  Chrome, Mail, Calendar, HardDrive, Github, Plus, Settings2, 
  ChevronRight, XCircle, AlertCircle, CheckCircle2, Loader2,
  SlidersHorizontal, Trash2, ShieldAlert, RefreshCw, Settings,
  ArrowLeft, Code2, Database, GitBranch, Search, Lock
} from 'lucide-react';

interface ConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface ConnectorItemProps {
  id: string;
  icon: React.ReactNode;
  name: string;
  isConnected: boolean;
  isManaging: boolean;
  onToggle: (id: string) => void;
  onConfigure: (id: string) => void;
  isDarkMode: boolean;
}

const ConnectorItem: React.FC<ConnectorItemProps> = ({ 
  id, icon, name, isConnected, isManaging, onToggle, onConfigure, isDarkMode
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onToggle(id);
    setIsProcessing(false);
  };

  return (
    <div className={`flex items-center justify-between py-4.5 px-6 transition-all duration-300 ${
      isConnected 
        ? 'bg-blue-600/5' 
        : 'hover:bg-white/[0.03]'
    } border-b border-white/[0.05] last:border-b-0`}>
      <div className="flex items-center space-x-4">
        <div className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 ${
          isConnected 
            ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' 
            : 'bg-white/5 border border-white/[0.08] text-white/30'
        }`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-[15px] font-bold tracking-tight ${isConnected ? 'text-white' : 'text-white/50'}`}>
            {name}
          </span>
          {isConnected && (
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.15em]">System Link Established</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isConnected && (
          <button 
            onClick={(e) => { e.stopPropagation(); onConfigure(id); }}
            className="p-2.5 rounded-xl transition-all active:scale-90 bg-white/5 hover:bg-white/10 text-white/60"
            aria-label={`Configure ${name}`}
          >
            <Settings size={16} />
          </button>
        )}
        <button 
          onClick={handleAction}
          disabled={isProcessing}
          className={`text-[11px] font-black tracking-widest uppercase px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-30 ${
            isConnected 
              ? 'text-white/40 bg-white/5 hover:text-red-400 hover:bg-red-500/10'
              : 'bg-white text-black shadow-xl hover:scale-105'
          }`}
          aria-label={isConnected ? `Unlink ${name}` : `Link ${name}`}
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : isConnected ? 'Unlink' : 'Link'}
        </button>
      </div>
    </div>
  );
};

const ConnectorsModal: React.FC<ConnectorsModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set(['chrome', 'github']));
  const [isManaging, setIsManaging] = useState(false);
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setConnectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const connectors = [
    { id: 'chrome', icon: <Chrome size={20} />, name: 'Manus Browser Extension' },
    { id: 'gmail', icon: <Mail size={20} />, name: 'Google Mail Services' },
    { id: 'gcal', icon: <Calendar size={20} />, name: 'Neural Calendar Sync' },
    { id: 'gdrive', icon: <HardDrive size={20} />, name: 'Cloud Drive Access' },
    { id: 'github', icon: <Github size={20} />, name: 'GitHub Repositories' },
  ];

  if (configuringId) {
    const activeC = connectors.find(c => c.id === configuringId);
    const isGithub = configuringId === 'github';

    return (
      <div className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="relative w-full max-w-md mx-auto rounded-t-[3rem] border-t border-white/[0.08] flex flex-col h-[75vh] animate-in slide-in-from-bottom duration-500 bg-[#0F0F0F]">
          <div className="p-8 flex items-center space-x-4 border-b border-white/[0.05]">
            <button onClick={() => setConfiguringId(null)} className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10" aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="text-xl font-black">{activeC?.name}</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 mt-0.5">Neural Configuration</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {isGithub ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="p-6 rounded-[2.5rem] bg-blue-600/5 border border-blue-500/10 space-y-4">
                  <div className="flex items-center space-x-3 text-blue-400">
                    <Code2 size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Code Intelligence</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    Grant the AI access to perform deep analysis, automated code reviews, and direct repository interactions.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Access Scope</label>
                  <div className="space-y-2">
                    {[
                      { icon: <Database size={16} />, label: 'Repository Analysis', desc: 'Read-only access for code review' },
                      { icon: <GitBranch size={16} />, label: 'PR Automation', desc: 'Submit automated improvements' },
                      { icon: <Search size={16} />, label: 'Issue Tracking', desc: 'Auto-categorize repository bugs' }
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.06] flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="text-white/20 group-hover:text-blue-500 transition-colors">{item.icon}</div>
                          <div>
                             <p className="text-[14px] font-bold text-white">{item.label}</p>
                             <p className="text-[10px] text-white/20 font-medium">{item.desc}</p>
                          </div>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 shadow-inner shadow-black/20">
                          <div className="w-3.5 h-3.5 bg-white rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Auth Credential</label>
                   <div className="p-5 rounded-[1.75rem] bg-black/40 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Lock size={16} className="text-white/20" />
                        <span className="text-xs font-mono text-white/40">OAUTH_TOKEN_ACTIVE</span>
                      </div>
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Sync Frequency</label>
                  <div className="flex space-x-2">
                    {['Realtime', 'Hourly', 'Daily'].map(v => (
                      <button key={v} className="flex-1 py-3.5 rounded-2xl text-[12px] font-bold bg-blue-600/10 border border-blue-500/20 text-blue-400">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-sm font-bold text-white/90">Autonomous Write Permissions</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 shadow-inner shadow-black/20">
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/[0.05]">
            <button onClick={() => setConfiguringId(null)} className="w-full h-16 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
              Establish Neural Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-auto rounded-t-[3.5rem] border-t border-white/[0.08] flex flex-col shadow-[0_-20px_80px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-500 max-h-[92vh] bg-[#0F0F0F]">
        
        <div className="w-12 h-1.5 rounded-full mx-auto mt-4 mb-8 bg-white/10" />
        
        <div className="px-8 flex items-center justify-between mb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight text-white">System Connectors</h2>
            <p className="text-[14px] font-medium text-white/30 mt-1">Bridging the Manus core framework.</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <span className="text-[10px] font-black uppercase tracking-widest">{connectedIds.size} Linked</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
          <div className="rounded-[2.5rem] overflow-hidden border border-white/[0.05] bg-white/[0.02] shadow-inner mb-8">
            {connectors.map((c) => (
              <ConnectorItem 
                key={c.id} 
                id={c.id}
                icon={c.icon} 
                name={c.name}
                isConnected={connectedIds.has(c.id)}
                isManaging={isManaging}
                onToggle={toggleService}
                onConfigure={(id) => setConfiguringId(id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setIsManaging(!isManaging)}
              className={`w-full group flex items-center justify-between px-7 py-5.5 rounded-[2.25rem] border transition-all duration-500 ${
                isManaging 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/40' 
                  : 'bg-white/5 border-white/[0.05] text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <Settings2 size={18} className={isManaging ? 'rotate-180 transition-transform' : ''} />
                <span className="text-[15px] font-black uppercase tracking-[0.2em]">{isManaging ? 'Close Admin' : 'Admin Panel'}</span>
              </div>
              {!isManaging && <ChevronRight size={18} className="opacity-30 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>

        <div className="px-10 py-8 bg-black/40 border-t border-white/[0.04] flex items-start space-x-5">
          <ShieldAlert size={22} className="text-yellow-500/80 shrink-0 mt-1" />
          <div className="space-y-1.5">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Core Security Protocol</h4>
             <p className="text-[11px] leading-relaxed font-medium text-white/25">
               Manus isolated sandboxing ensures tokens remain local. Neural bridge endpoints are encrypted at rest.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectorsModal;
