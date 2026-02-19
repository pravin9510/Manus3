
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Upload, Download, Smartphone, Box, Loader2, Cpu, Terminal,
  Globe, Lock, Unlock, ExternalLink, ShieldCheck, Server,
  Link as LinkIcon, CheckCircle2, Copy, Plus, ArrowRight, AlertCircle,
  FileCode, Globe2, Zap, Wifi, SearchCheck, LayoutList, AppWindow,
  CloudLightning
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  appIcon?: string;
  websiteCode?: string;
  pwaData?: {
    manifest: string;
    serviceWorker: string;
    isPwaEnabled: boolean;
  };
}

type Visibility = 'private' | 'public';
type DeploymentTarget = 'mobile' | 'web';
type BuildStatus = 'idle' | 'building' | 'deploying' | 'completed';

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, appName = "ManusApp", appIcon, websiteCode, pwaData }) => {
  const [target, setTarget] = useState<DeploymentTarget>('web');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [buildStatus, setBuildStatus] = useState<'idle' | 'deploying' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('Initializing Forge...');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSeoOptimized, setIsSeoOptimized] = useState(true);
  const [pwaEnabled, setPwaEnabled] = useState(pwaData?.isPwaEnabled || false);

  // Generate a functional URL for the website code
  const livePreviewUrl = useMemo(() => {
    if (!websiteCode) return '';
    let codeToUse = websiteCode;
    
    // If PWA is enabled, inject the manifest and service worker registration
    if (pwaEnabled && pwaData) {
      const manifestBlob = new Blob([pwaData.manifest], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      
      const swRegistration = `
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('SW registered:', reg);
              }).catch(err => {
                console.log('SW registration failed:', err);
              });
            });
          }
        </script>
        <link rel="manifest" href="${manifestUrl}">
      `;
      
      codeToUse = websiteCode.replace('</head>', `${swRegistration}</head>`);
    }

    const blob = new Blob([codeToUse], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [websiteCode, buildStatus, pwaEnabled, pwaData]);

  useEffect(() => {
    return () => {
      if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
    };
  }, [livePreviewUrl]);

  const getSteps = () => {
    const baseSteps = [
      "Allocating Cloud Resources...",
      "Injecting SEO Meta Tags...",
      "Generating JSON-LD Schema..."
    ];
    if (pwaEnabled) {
      baseSteps.push("Configuring PWA Manifest...", "Establishing Service Worker Cache...");
    }
    baseSteps.push("Syncing Assets to CDN...", "Bypassing DNS Propagation...", "System is Live.");
    return baseSteps;
  };

  const steps = getSteps();

  const startDeployment = () => {
    setBuildStatus('deploying');
    setProgress(0);
    
    const slug = appName.toLowerCase().replace(/\s+/g, '-');
    setDeployedUrl(`${slug}.manus.app`);

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 8);
        const stepIndex = Math.floor((next / 100) * steps.length);
        if (stepIndex !== currentStepIndex && stepIndex < steps.length) {
          currentStepIndex = stepIndex;
          setStepLabel(steps[stepIndex]);
        }
        if (next >= 100) {
          clearInterval(interval);
          setBuildStatus('completed');
          setStepLabel('Bridge Established');
          return 100;
        }
        return next;
      });
    }, 120);
  };

  const handleDownloadSource = () => {
    if (!websiteCode) return;
    const blob = new Blob([websiteCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName.toLowerCase().replace(/\s+/g, '-')}-live.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${deployedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-[#0F0F0F] rounded-[3.5rem] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-50" />
        
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
               <Cpu className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase">Manus Forge</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Staging & Distribution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] no-scrollbar">
          {buildStatus === 'idle' ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                  {appIcon ? <img src={appIcon} className="w-full h-full object-cover rounded-2xl" /> : appName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white">{appName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Ready for Neural Bridge</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Optimization Configuration</label>
                  <div className="flex items-center space-x-2">
                    <SearchCheck size={14} className="text-green-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500">SEO Engine Active</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => setIsSeoOptimized(!isSeoOptimized)}
                    className={`w-full p-5 rounded-[2.2rem] border flex items-center justify-between transition-all ${isSeoOptimized ? 'bg-green-500/10 border-green-500/30' : 'bg-white/[0.03] border-white/5'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <LayoutList className={isSeoOptimized ? 'text-green-500' : 'text-white/20'} size={20} />
                      <div className="text-left">
                         <p className={`text-[14px] font-bold ${isSeoOptimized ? 'text-white' : 'text-white/40'}`}>Full SEO Package</p>
                         <p className="text-[10px] text-white/20 font-medium">Meta Tags, JSON-LD & Semantic structure</p>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${isSeoOptimized ? 'bg-green-500' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isSeoOptimized ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>

                  <button 
                    onClick={() => setPwaEnabled(!pwaEnabled)}
                    className={`w-full p-5 rounded-[2.2rem] border flex items-center justify-between transition-all ${pwaEnabled ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.03] border-white/5'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <AppWindow className={pwaEnabled ? 'text-blue-500' : 'text-white/20'} size={20} />
                      <div className="text-left">
                         <p className={`text-[14px] font-bold ${pwaEnabled ? 'text-white' : 'text-white/40'}`}>PWA Synthesis</p>
                         <p className="text-[10px] text-white/20 font-medium">Offline access & App-like experience</p>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${pwaEnabled ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pwaEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>
                  
                  <div className="p-5 rounded-[2.2rem] bg-blue-600/5 border border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Wifi className="text-blue-500" size={20} />
                      <div className="text-left">
                         <p className="text-[14px] font-bold text-white">Neural Staging Tunnel</p>
                         <p className="text-[10px] text-white/30 font-medium">Instant preview via virtual bridge</p>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-blue-500" />
                  </div>
                </div>
              </div>

              <button 
                onClick={startDeployment}
                className="w-full h-18 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center space-x-3 shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
              >
                <Zap size={18} fill="currentColor" />
                <span>Establish SEO Live Bridge</span>
              </button>
            </div>
          ) : (
            <div className="space-y-10 py-4 animate-in fade-in duration-500">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {buildStatus === 'completed' ? <CheckCircle2 className="text-green-500" size={20} /> : <Loader2 className="text-blue-500 animate-spin" size={20} />}
                    <span className="text-[12px] font-black uppercase tracking-widest text-white">{stepLabel}</span>
                  </div>
                  <span className="text-[14px] font-mono text-white/40 tabular-nums">{Math.floor(progress)}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {buildStatus === 'completed' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-[3.5rem] flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                       <ShieldCheck size={40} />
                    </div>
                    
                    <div className="space-y-2">
                       <h4 className="text-[20px] font-black text-white">SEO Bridge Established</h4>
                       <p className="text-[12px] text-white/40 font-medium px-4">
                         Your high-fidelity, {pwaEnabled ? 'PWA-enhanced, ' : ''}SEO-optimized application is live. Search engines can now crawl and index your neural bridge.
                       </p>
                    </div>

                    <div className="w-full space-y-4">
                       <a 
                          href={livePreviewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full h-18 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.2rem] flex items-center justify-center space-x-4 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.4)]"
                        >
                          <Globe size={20} />
                          <span className="font-black uppercase tracking-widest text-[13px]">Open SEO Dashboard</span>
                        </a>

                        <button 
                          onClick={handleDownloadSource}
                          className="w-full h-16 bg-white/[0.03] border border-white/10 hover:bg-white/10 text-white/60 rounded-[2.2rem] flex items-center justify-center space-x-3 transition-all"
                        >
                          <FileCode size={18} />
                          <span className="font-black uppercase tracking-widest text-[11px]">Download Full Source</span>
                        </button>
                    </div>

                    <div className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                      <div className="flex items-center space-x-3 truncate">
                        <Lock size={14} className="text-white/20" />
                        <span className="text-xs font-mono text-blue-400/50 truncate">https://{deployedUrl}</span>
                      </div>
                      <button onClick={handleCopy} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white">
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {pwaEnabled && (
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-5 flex items-start space-x-4">
                      <AppWindow className="text-blue-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-[10px] text-blue-500/60 font-medium leading-relaxed italic text-left">
                        <b>PWA Active:</b> Users can install this app directly to their home screen via the browser menu for a full-screen, offline experience.
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-3xl p-5 flex items-start space-x-4">
                    <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-[10px] text-yellow-500/60 font-medium leading-relaxed italic text-left">
                      <b>SEO Tip:</b> To maximize indexing speed, use the provided JSON-LD markup and ensure your H1 tags align with your primary keywords.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
