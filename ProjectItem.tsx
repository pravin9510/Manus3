
import React from 'react';
import { 
  Gamepad2, TrendingUp, Globe, 
  Smartphone, ChevronRight, Palette, 
  Zap, Box, Eye, Share2, Rocket, Download, Cloud
} from 'lucide-react';
import { Project } from '../types';

interface ProjectItemProps {
  project: Project;
  isDarkMode: boolean;
  onForge?: (e: React.MouseEvent, project: Project) => void;
  onPreview?: (e: React.MouseEvent, project: Project) => void;
  onPublish?: (e: React.MouseEvent, project: Project) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, isDarkMode, onForge, onPreview, onPublish }) => {
  const getIcon = () => {
    switch (project.icon) {
      case 'web': return Globe;
      case 'mobile': return Smartphone;
      case 'chart': return TrendingUp;
      case 'palette': return Palette;
      default: return Gamepad2;
    }
  };
  
  const Icon = getIcon();
  const isPending = project.status === 'pending';
  const isCompleted = project.status === 'completed';
  const isMobile = project.icon === 'mobile';
  const isWeb = project.icon === 'web';
  const isGame = project.icon === 'game';

  return (
    <article className={`group relative mx-6 mb-4 p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden backface-hidden will-change-transform ${
      isDarkMode 
        ? 'bg-[#141414] border-white/[0.06] hover:bg-[#1A1A1A] hover:border-white/[0.1] shadow-2xl' 
        : 'bg-white border-black/[0.05] hover:border-black/10 shadow-lg'
    }`} aria-busy={isPending}>
      
      {isPending && (
        <div className="absolute inset-0 bg-blue-600/[0.02] animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start space-x-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shrink-0 overflow-hidden ${
          isPending 
            ? 'bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)] animate-pulse' 
            : 'bg-white/[0.03] border border-white/[0.08] group-hover:scale-105 group-hover:border-blue-500/40'
        }`}>
          {project.generatedLogo ? (
            <img src={project.generatedLogo} alt="Project Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <Icon className={`w-6 h-6 transition-colors duration-500 ${isPending ? 'text-white' : 'text-white/40 group-hover:text-blue-500'}`} strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-[16px] font-black tracking-tight text-white/90 truncate pr-2 group-hover:text-white transition-colors">{project.title}</h3>
            {isPending ? (
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500 animate-pulse">Processing</span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10">{project.date}</span>
            )}
          </div>
          
          <p className="text-[12px] font-medium text-white/30 truncate pr-4 leading-relaxed group-hover:text-white/50 transition-colors">{project.description}</p>
          
          {isPending ? (
            <div className="mt-4 space-y-2">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000 ease-out" 
                  style={{ width: `${project.progress || 45}%` }} 
                />
              </div>
            </div>
          ) : isCompleted ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {/* Common Preview Button */}
              {(isWeb || isMobile || isGame) && onPreview && (
                <button 
                  onClick={(e) => onPreview(e, project)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all tap-scale"
                >
                  <Eye size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Preview</span>
                </button>
              )}

              {/* Mobile Specific: Build APK */}
              {isMobile && onForge && project.mobileAppData && (
                <button 
                  onClick={(e) => onForge(e, project)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all tap-scale"
                >
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Build APK & AAB</span>
                </button>
              )}

              {/* Web Specific: Host Website */}
              {isWeb && onPublish && (
                <button 
                  onClick={(e) => onPublish(e, project)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-green-600/10 border border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white transition-all tap-scale"
                >
                  <Cloud size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Host Website</span>
                </button>
              )}

              {/* Common: Public/Publish */}
              {onPublish && (
                <button 
                  onClick={(e) => onPublish(e, project)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-500 hover:bg-purple-600 hover:text-white transition-all tap-scale"
                >
                  <Share2 size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Public</span>
                </button>
              )}
            </div>
          ) : (
             <div className="mt-5 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] w-fit">
                <Box size={10} className="text-white/20" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">v1.0.4</span>
              </div>
          )}
        </div>

        <div className="self-center p-1 text-white/10 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </article>
  );
};

export default ProjectItem;
