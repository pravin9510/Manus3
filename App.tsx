
import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import CategoryTabs from './CategoryTabs';
import ProjectItem from './ProjectItem';
import FloatingButton from './FloatingButton';
import ChatPage from './ChatPage';
import SettingsMenu from './SettingsMenu';
import SkillsModal from './SkillsModal';
import ConnectorsModal from './ConnectorsModal';
import SubscriptionModal from './SubscriptionModal';
import AgentManagerModal from './AgentManagerModal';
import ApkBuildModal from './ApkBuildModal';
import PublishModal from './PublishModal';
import WebsitePreview from './WebsitePreview';
import MobileAppPreview from './MobileAppPreview';
import GamePreview from './GamePreview';
import { Sparkles, FolderOpen, Zap, User, Search, Bot, BrainCircuit, ArrowUp, Command } from 'lucide-react';
import { Category, Project, CustomAgent } from './types';

const STORAGE_KEY = 'manus_projects_v1';
const AGENTS_STORAGE_KEY = 'manus_custom_agents_v1';
const THEME_KEY = 'manus_theme_preference';

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Visual Novel Engine',
    description: 'Autonomous layer for story branching and asset synthesis...',
    date: 'Today',
    icon: 'game',
    category: 'Favorites',
    status: 'pending',
    progress: 72,
    messages: [
      { id: 'm1', role: 'user', text: 'Build a visual novel engine', timestamp: new Date() }
    ]
  },
  {
    id: 'mobile-app-1',
    title: 'Fitness Tracker App',
    description: 'A premium mobile application for tracking neural health and workouts.',
    date: 'Mon',
    icon: 'mobile',
    category: 'All',
    status: 'completed',
    messages: [],
    mobileAppData: {
      platform: 'React Native',
      code: '<html><body>Fitness App Mock</body></html>',
      description: 'Fitness tracker app logic.',
      appName: 'HealthFlow',
      version: '1.2.0'
    }
  }
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAgentManagerOpen, setIsAgentManagerOpen] = useState(false);
  const [homePrompt, setHomePrompt] = useState('');
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);
  
  const [apkBuildData, setApkBuildData] = useState<Project['mobileAppData'] | null>(null);
  const [publishProject, setPublishProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, photo: string} | null>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEY);
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed.map((p: any) => ({
          ...p,
          messages: (p.messages || []).map((m: any) => ({ 
            ...m, 
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date() 
          }))
        })));
      } catch (e) { setProjects(INITIAL_PROJECTS); }
    } else { setProjects(INITIAL_PROJECTS); }

    const savedAgents = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (savedAgents) {
      try { setCustomAgents(JSON.parse(savedAgents)); } catch (e) { setCustomAgents([]); }
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      if (!query) return matchesCategory;
      return matchesCategory && (p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    });
  }, [projects, activeCategory, searchQuery]);

  const activeTasks = filteredProjects.filter(p => p.status === 'pending');
  const historyProjects = filteredProjects.filter(p => p.status === 'completed');

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setInitialChatPrompt(null);
    setCurrentView('chat');
  };

  const handleNewChat = () => {
    setSelectedProject(null);
    setInitialChatPrompt(null);
    setCurrentView('chat');
  };

  const handleStartSynthesis = () => {
    if (!homePrompt.trim()) return;
    setInitialChatPrompt(homePrompt);
    setSelectedProject(null);
    setHomePrompt('');
    setCurrentView('chat');
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const createProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
  };

  const handleGoogleLogin = () => {
    setIsLoggedIn(true);
    setUser({
      name: 'User',
      email: 'user@manus.ai',
      photo: 'https://ui-avatars.com/api/?name=User&background=2563EB&color=fff'
    });
    setCredits(1000);
  };

  const handleSettingAction = (action: string) => {
    switch (action) {
      case 'login': handleGoogleLogin(); break;
      case 'logout': setIsLoggedIn(false); setUser(null); setCredits(0); break;
      case 'agents': setIsAgentManagerOpen(true); break;
      case 'connectors': setIsConnectorsOpen(true); break;
      case 'history': setActiveCategory('All'); setIsSettingsOpen(false); break;
      default: break;
    }
    setIsSettingsOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <main className={`h-screen flex flex-col p-10 justify-between relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#fcfcfc] text-black'}`}>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse-slow" />
        </div>
        <div className="mt-20 flex flex-col items-center text-center relative z-10 animate-spring-up">
          <div className={`w-24 h-24 rounded-[3rem] border flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.15)] animate-float ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10'}`}>
            <BrainCircuit className="w-12 h-12 text-blue-500" />
          </div>
          <div className="mt-12 space-y-4">
            <h1 className="text-6xl font-manus lowercase tracking-tighter italic font-black">manus</h1>
            <p className={`text-[16px] font-medium tracking-tight px-6 leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>The first autonomous AI agent framework for high-fidelity synthesis.</p>
          </div>
        </div>
        <div className="space-y-6 relative z-10 safe-pb animate-spring-up">
          <button onClick={handleGoogleLogin} className={`w-full h-18 rounded-[2.2rem] font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center space-x-4 tap-scale shadow-2xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
            <span>Link Identity</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden safe-pt transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      {currentView === 'chat' ? (
        <ChatPage 
          onBack={() => { setCurrentView('home'); setSelectedProject(null); }} 
          project={selectedProject}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          credits={credits}
          onDeductCredits={(amt) => { if (credits < amt) { setIsSubscriptionOpen(true); return false; } setCredits(prev => prev - amt); return true; }}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          customAgents={customAgents}
          onOpenAgentManager={() => setIsAgentManagerOpen(true)}
          initialPrompt={initialChatPrompt}
        />
      ) : (
        <div className="flex-1 flex flex-col relative h-full animate-fade-in">
          <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onAction={(a) => handleSettingAction(a)} credits={credits} isLoggedIn={isLoggedIn} user={user} isDarkMode={isDarkMode} />
          <SkillsModal isOpen={isSkillsOpen} onClose={() => setIsSkillsOpen(false)} onSkillClick={(p) => { setInitialChatPrompt(p); setSelectedProject(null); setCurrentView('chat'); }} />
          <ConnectorsModal isOpen={isConnectorsOpen} onClose={() => setIsConnectorsOpen(false)} isDarkMode={isDarkMode} />
          <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} onPurchase={(amt) => { setCredits(prev => prev + amt); setIsSubscriptionOpen(false); }} isDarkMode={isDarkMode} />
          <AgentManagerModal isOpen={isAgentManagerOpen} onClose={() => setIsAgentManagerOpen(false)} agents={customAgents} onUpdateAgents={setCustomAgents} />
          
          {apkBuildData && <ApkBuildModal isOpen={true} onClose={() => setApkBuildData(null)} mobileData={apkBuildData} />}
          {publishProject && <PublishModal isOpen={true} onClose={() => setPublishProject(null)} appName={publishProject.title} websiteCode={publishProject.websiteCode} pwaData={publishProject.pwaData} />}
          
          <Header onProfileClick={() => setIsSettingsOpen(true)} credits={credits} isLoggedIn={isLoggedIn} user={user} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
          
          <main className="flex-1 overflow-y-auto no-scrollbar pb-40">
            {/* HERO PROMPT SECTION */}
            <section className="px-6 pt-10 pb-6 animate-spring-up">
               <div className={`p-10 rounded-[3.5rem] border shadow-2xl relative overflow-hidden group transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-[#121212] to-[#0A0A0A] border-white/[0.06] hover:border-white/10' : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] border-black/[0.06] hover:border-black/10'}`}>
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000" />
                  
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 animate-float">
                           <Sparkles className="text-blue-500" size={24} fill="currentColor" />
                        </div>
                        <div className="flex items-center space-x-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Autonomous core active</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h2 className={`text-4xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>What can I forge <br/>for you today?</h2>
                        <div className="relative group/input">
                          <textarea 
                            value={homePrompt}
                            onChange={(e) => setHomePrompt(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStartSynthesis(); } }}
                            placeholder="Describe your vision..."
                            className={`w-full bg-black/20 border border-white/5 rounded-[2rem] px-6 py-5 min-h-[120px] max-h-40 text-[16px] font-medium outline-none transition-all resize-none shadow-inner focus:border-blue-500/30 ${isDarkMode ? 'placeholder:text-white/10 text-white' : 'placeholder:text-black/10 text-black'}`}
                          />
                          <button 
                             onClick={handleStartSynthesis}
                             disabled={!homePrompt.trim()}
                             className={`absolute right-3 bottom-3 p-4 rounded-2xl transition-all tap-scale ${homePrompt.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-100' : 'bg-white/5 text-white/10 scale-90 opacity-0'}`}
                          >
                             <ArrowUp size={20} strokeWidth={3} />
                          </button>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <div className="px-6 pb-2 animate-spring-up [animation-delay:100ms]">
              <div className={`group relative rounded-[2rem] border flex items-center px-6 py-4.5 focus-within:border-blue-500/30 transition-all shadow-inner ${isDarkMode ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-black/[0.03] border-black/[0.06]'}`}>
                <Search size={18} className={`mr-4 opacity-20 group-focus-within:text-blue-500 transition-all ${isDarkMode ? 'text-white' : 'text-black'}`} />
                <input 
                  type="search" 
                  placeholder="Find your creations..." 
                  className={`bg-transparent border-none outline-none w-full text-[14px] font-bold placeholder:opacity-20 ${isDarkMode ? 'text-white' : 'text-black'}`} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>

            <div className="animate-spring-up [animation-delay:200ms]">
              <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} isDarkMode={isDarkMode} />
            </div>
            
            <section className="mt-8 px-0 animate-spring-up [animation-delay:300ms]">
              {activeTasks.length > 0 && (
                <div className="mb-10">
                   <div className="px-8 mb-5 flex items-center space-x-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                      <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Neural Stream</h2>
                    </div>
                    {activeTasks.map((p) => (
                      <div key={p.id} onClick={() => handleOpenProject(p)} className="tap-scale">
                        <ProjectItem project={p} isDarkMode={isDarkMode} />
                      </div>
                    ))}
                </div>
              )}

              <div className="px-8 mb-5 flex items-center space-x-2.5 opacity-20">
                <FolderOpen size={12} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Synthesized Vault</h2>
              </div>
              <div className="space-y-1">
                {historyProjects.map((p) => (
                  <div key={p.id} onClick={() => handleOpenProject(p)} className="w-full text-left outline-none tap-scale">
                    <ProjectItem 
                      project={p} 
                      isDarkMode={isDarkMode} 
                      onPreview={(e, proj) => { e.stopPropagation(); setPreviewProject(proj); }} 
                    />
                  </div>
                ))}
              </div>
            </section>
          </main>
          
          <FloatingButton onClick={handleNewChat} isDarkMode={isDarkMode} />
          
          <nav className={`absolute bottom-6 left-6 right-6 h-20 backdrop-blur-3xl border rounded-[2.5rem] flex items-center justify-around px-8 shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/60 border-black/10'}`}>
             <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center space-y-1 transition-all ${currentView === 'home' ? 'text-blue-500' : 'opacity-20 hover:opacity-100'}`}>
                <Zap size={22} fill={currentView === 'home' ? "currentColor" : "none"} />
                <span className="text-[9px] font-black uppercase tracking-widest">Core</span>
             </button>
             <button onClick={() => setIsAgentManagerOpen(true)} className="flex flex-col items-center space-y-1 opacity-20 hover:opacity-100 transition-all">
                <Bot size={22} />
                <span className="text-[9px] font-black uppercase tracking-widest">Fleet</span>
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center space-y-1 opacity-20 hover:opacity-100 transition-all">
                <User size={22} />
                <span className="text-[9px] font-black uppercase tracking-widest">Identity</span>
             </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
