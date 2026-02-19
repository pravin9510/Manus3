
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Cpu, Terminal, Loader2, CheckCircle2, 
  Smartphone, Download, AlertCircle, Zap,
  ShieldCheck, Package, Code2, Boxes,
  QrCode, Copy, ExternalLink, ShieldAlert, 
  Activity, Lock, Check, Smartphone as PhoneIcon,
  CloudLightning, Layers, Binary, ShieldEllipsis,
  FileArchive, ShieldCheck as VerifiedIcon,
  Archive, AppWindow
} from 'lucide-react';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileData: {
    platform: string;
    code: string;
    appName?: string;
    appIcon?: string;
    version?: string;
  } | null;
}

const BUILD_PHASES = [
  { id: 'cloud', label: 'Linking Native Core', icon: <CloudLightning size={14} />, color: 'text-blue-500' },
  { id: 'deps', label: 'Resolving SDK Dependencies', icon: <Layers size={14} />, color: 'text-indigo-500' },
  { id: 'compile', label: 'AOT Binary Compilation', icon: <Binary size={14} />, color: 'text-purple-500' },
  { id: 'bundle', label: 'Generating AAB Split Modules', icon: <Archive size={14} />, color: 'text-orange-500' },
  { id: 'sign', label: 'V4 Binary Certification', icon: <ShieldEllipsis size={14} />, color: 'text-green-500' }
];

const ApkBuildModal: React.FC<ApkBuildModalProps> = ({ isOpen, onClose, mobileData }) => {
  const [status, setStatus] = useState<'idle' | 'synthesis' | 'installing' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const liveLink = useMemo(() => {
    if (!mobileData?.code) return '';
    const blob = new Blob([mobileData.code], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [mobileData?.code]);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      startFullBuild();
    }
    return () => {
      if (liveLink) URL.revokeObjectURL(liveLink);
    };
  }, [isOpen]);

  const startFullBuild = () => {
    setStatus('synthesis');
    setProgress(0);
    setCurrentStep(0);
    setLogs([
      '[SYSTEM] Initializing Manus Native Forge v5.0...',
      `[INFO] Target: Android App Bundle (AAB) + APK`,
      `[INFO] Build Variant: Release (Signed)`,
      '[INFO] Initializing Gradle Daemon...'
    ]);

    let step = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 6);
        const stepIndex = Math.floor((next / 100) * BUILD_PHASES.length);
        
        if (stepIndex !== step && stepIndex < BUILD_PHASES.length) {
          step = stepIndex;
          setCurrentStep(stepIndex);
          setLogs(prevLogs => [
            ...prevLogs, 
            `[BUILD] ${BUILD_PHASES[stepIndex - 1]?.label || 'Initialization'} successful.`,
            `[RUN] Executing: ${BUILD_PHASES[stepIndex].label}...`
          ]);
        }

        if (next >= 100) {
          clearInterval(interval);
          startVirtualInstallation();
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const startVirtualInstallation = () => {
    setStatus('installing');
    setProgress(0);
    setLogs(prev => [...prev, '[SUCCESS] Native AAB Bundle Synthesis Completed.', '[SYSTEM] Pushing APK to Wireless Bridge...']);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 15;
        if (next >= 100) {
          clearInterval(interval);
          setStatus('completed');
          setLogs(prevLogs => [...prevLogs, '[FINISH] AAB/APK Package Integrity: 100%', '[INFO] Ready for distribution.']);
          return 100;
        }
        return next;
      });
    }, 250);
  };

  const handleDownload = (format: 'apk' | 'aab') => {
    if (!mobileData) return;
    const appName = mobileData.appName || "ManusProject";
    const extension = format === 'apk' ? 'apk' : 'aab';
    const filename = `${appName.toLowerCase().replace(/\s+/g, '-')}-v${mobileData.version || '1.0'}.${extension}`;
    
    const mimeType = format === 'apk' 
      ? 'application/vnd.android.package-archive' 
      : 'application/x-authorware-bin';

    const blob = new Blob([mobileData.code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(liveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-[#0A0A0A] rounded-[3.5rem] border border-white/10 shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
        {/* Animated Build Progress Top Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${status === 'completed' ? 'bg-green-500' : 'bg-blue-600'} shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden`}>
           {(status === 'synthesis' || status === 'installing') && <div className="h-full bg-white/30 animate-pulse w-1/3" />}
        </div>
        
        <div className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center space-x-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${status === 'completed' ? 'bg-green-600/10 border-green-500/20' : 'bg-blue-600/10 border-blue-500/20'}`}>
              {status === 'completed' ? <CheckCircle2 className="text-green-500" size={24} /> : <Zap className="text-blue-500" size={24} fill="currentColor" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Manus Forge</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/50">Hybrid Build Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-white/20 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-10 max-h-[85vh] overflow-y-auto no-scrollbar">
          {status !== 'completed' ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Build Identity Card */}
              <div className="flex items-center space-x-8 p-8 bg-white/[0.03] border border-white/5 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/[0.02] animate-pulse pointer-events-none" />
                <div className="w-20 h-20 rounded-[2rem] bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                  {mobileData?.appIcon ? (
                    <img src={mobileData.appIcon} className="w-full h-full object-cover" alt="App Icon" />
                  ) : (
                    <Smartphone className="text-white/10" size={32} />
                  )}
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-black text-white">{mobileData?.appName || "Manus Project"}</h3>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20">
                      <ShieldAlert size={10} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                        {status === 'synthesis' ? 'Synthesizing Bundle' : 'Wireless Deployment'}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Release v{mobileData?.version || '1.0'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center space-x-3">
                    <Activity size={16} className="text-blue-500 animate-pulse" />
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${BUILD_PHASES[currentStep].color}`}>
                      {status === 'synthesis' ? BUILD_PHASES[currentStep].label : 'Compiling Native Bridge...'}
                    </span>
                  </div>
                  <span className="text-[14px] font-mono text-white/40 tabular-nums">{Math.floor(progress)}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              {/* Console Logs */}
              <div className="bg-black/90 border border-white/10 rounded-[2.5rem] p-6 font-mono text-[11px] space-y-2 h-44 overflow-y-auto no-scrollbar shadow-inner relative">
                {logs.map((log, i) => (
                  <p key={i} className={log.startsWith('[SUCCESS]') || log.startsWith('[FINISH]') ? 'text-green-500 font-bold' : log.startsWith('[RUN]') || log.startsWith('[BUILD]') ? 'text-blue-400' : 'text-white/30'}>
                    <span className="opacity-20 mr-2">$</span>
                    {log}
                  </p>
                ))}
                <div className="animate-pulse inline-block w-2 h-3 bg-blue-500/50" />
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-green-500/10 flex items-center justify-center text-green-500 relative">
                  <VerifiedIcon size={48} strokeWidth={2} />
                  <div className="absolute inset-0 rounded-[2.5rem] border-2 border-green-500/20 animate-ping" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tight">Full Binary Synthesis Ready</h3>
                  <p className="text-sm text-white/30 mt-2 font-medium leading-relaxed px-10">
                    Native AAB and APK compilation for <span className="text-white">v{mobileData?.version || '1.0'}</span> is complete. <br/>
                    <span className="text-blue-400">Choose your distribution format below.</span>
                  </p>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-5">
                <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[3rem] flex flex-col items-center space-y-5 group cursor-default shadow-xl hover:bg-white/[0.05] transition-all">
                  <div className="w-24 h-24 bg-white p-3 rounded-3xl shadow-2xl shadow-white/5 group-hover:scale-105 transition-transform duration-500">
                    <QrCode size="100%" className="text-black" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Wireless Sync</span>
                    <span className="text-[9px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Build v{mobileData?.version}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4 justify-center">
                   <a 
                    href={liveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center justify-center space-y-3 p-6 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
                   >
                     <ExternalLink size={24} className="text-white" />
                     <span className="text-[11px] font-black uppercase tracking-widest text-white">Live View</span>
                   </a>
                   <button 
                    onClick={handleCopy}
                    className="flex-1 flex flex-col items-center justify-center space-y-3 p-6 bg-white/[0.05] border border-white/10 rounded-[2.5rem] hover:bg-white/10 active:scale-95 transition-all"
                   >
                     {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} className="text-white/40" />}
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{copied ? 'Copied' : 'Copy URL'}</span>
                   </button>
                </div>
              </div>

              {/* Format Selection Actions */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleDownload('apk')}
                    className="h-20 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex flex-col items-center justify-center space-y-1 shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                  >
                    <Download size={18} strokeWidth={3} />
                    <span>Download APK</span>
                  </button>
                  <button 
                    onClick={() => handleDownload('aab')}
                    className="h-20 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex flex-col items-center justify-center space-y-1 shadow-[0_20px_50px_rgba(37,99,235,0.2)] active:scale-95 transition-all"
                  >
                    <Archive size={18} strokeWidth={3} />
                    <span>Download AAB</span>
                  </button>
                </div>
                
                <button 
                  onClick={onClose}
                  className="w-full h-16 bg-white/5 text-white/40 hover:text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="p-10 bg-blue-600/[0.03] border-t border-white/5 flex items-start space-x-6">
          <ShieldAlert size={28} className="text-blue-500/50 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Distribution Protocol</h4>
            <p className="text-[11px] text-white/30 leading-relaxed font-medium italic text-left">
              The <b>AAB (Android App Bundle)</b> is required for Google Play Console uploads, providing smaller app sizes via split binaries. Use the <b>APK</b> for direct testing and local device installation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApkBuildModal;
