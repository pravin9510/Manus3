
import React from 'react';
import { User, Sparkles, Sun, Moon, Menu } from 'lucide-react';

interface HeaderProps {
  onProfileClick: () => void;
  credits: number;
  isLoggedIn: boolean;
  user: { name: string, email: string, photo: string } | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, credits, isLoggedIn, user, isDarkMode, onToggleTheme }) => {
  return (
    <header className="flex items-center justify-between px-6 py-6 sticky top-0 backdrop-blur-3xl z-40 bg-black/60 border-b border-white/[0.04]">
      {/* LEFT: Profile Icon (As requested) */}
      <div className="flex-1 flex justify-start items-center">
        <button 
          onClick={onProfileClick} 
          className="flex items-center space-x-3 active:scale-95 transition-transform group focus:outline-none"
          aria-label={isLoggedIn ? `Open profile for ${user?.name}` : "Log in to Manus"}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/40 group-hover:bg-white/[0.06] shadow-inner">
              {isLoggedIn && user ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 opacity-30" />
              )}
            </div>
            {isLoggedIn && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse" />}
          </div>
          
          {isLoggedIn && user && (
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[13px] font-black text-white/90 truncate max-w-[100px]">
                {user.name}
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500">Core Active</span>
            </div>
          )}
        </button>
      </div>
      
      {/* CENTER: Brand Logo */}
      <div className="flex-none flex flex-col items-center select-none">
        <h1 className="text-xl font-manus lowercase tracking-tighter leading-none text-white font-black italic">manus</h1>
      </div>
      
      {/* RIGHT: Credits & Theme */}
      <div className="flex-1 flex justify-end items-center space-x-3">
        <div 
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl group cursor-pointer active:scale-95 transition-all shadow-lg shadow-blue-600/5"
          aria-label={`${credits} tokens available`}
        >
          <Sparkles className="w-3 h-3 text-blue-500" fill="currentColor" />
          <span className="text-[10px] font-black tracking-widest text-blue-500">{credits}</span>
        </div>

        <button 
          onClick={onToggleTheme} 
          className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl active:scale-90 transition-all text-white/30 hover:text-white"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
