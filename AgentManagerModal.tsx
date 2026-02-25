import React, { useState, useRef } from 'react';
import { 
  X, Plus, Trash2, Shield, BrainCircuit, Palette, Zap, Bot, Sparkles, 
  Save, Key, Info, ArrowLeft, Download, Upload,
  AlertTriangle, Eye, EyeOff, CheckCircle2, Check, ChevronDown
} from 'lucide-react';
import { CustomAgent, AIProvider } from '../types';

interface AgentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: CustomAgent[];
  onUpdateAgents: (agents: CustomAgent[]) => void;
}

const PROVIDERS: {id: AIProvider, name: string, color: string, placeholder: string}[] = [
  { id: 'gemini', name: 'Google Gemini', color: '#4285F4', placeholder: 'AIza...' },
  { id: 'openai', name: 'OpenAI GPT', color: '#10A37F', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic Claude', color: '#D97706', placeholder: 'sk-ant-...' },
  { id: 'deepseek', name: 'DeepSeek', color: '#6366F1', placeholder: 'sk-...' },
  { id: 'other', name: 'Custom / Llama', color: '#8B5CF6', placeholder: 'API Key...' }
];

const ICONS: {id: CustomAgent['iconType'], label: string}[] = [
  { id: 'brain', label: 'Brain' },
  { id: 'shield', label: 'Shield' },
  { id: 'palette', label: 'Palette' },
  { id: 'zap', label: 'Zap' },
  { id: 'bot', label: 'Bot' },
  { id: 'sparkles', label: 'Sparkles' },
];

const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444', '#14B8A6'];

const AgentManagerModal: React.FC<AgentManagerModalProps> = ({ isOpen, onClose, agents, onUpdateAgents }) => {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<CustomAgent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyAgent: Partial<CustomAgent> = {
    name: '',
    provider: 'gemini',
    systemInstruction: '',
    iconType: 'bot',
    color: '#2563EB',
    apiKey: ''
  };
  const [newAgent, setNewAgent] = useState<Partial<CustomAgent>>(emptyAgent);

  if (!isOpen) return null;

  const selectedProvider = PROVIDERS.find(p => p.id === newAgent.provider) || PROVIDERS[0];

  // --- Export / Import ---
  const handleExportFleet = () => {
    if (agents.length === 0) return;
    const data = JSON.stringify(agents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manus-agent-fleet-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        const rawItems = Array.isArray(importedData) ? importedData : [importedData];
        const validAgents = rawItems.filter(a => a && typeof a === 'object' && a.name && a.systemInstruction && a.provider);
        if (validAgents.length === 0) { setImportError("Invalid agent configuration."); return; }
        const processed: CustomAgent[] = validAgents.map(a => ({
          name: String(a.name),
          systemInstruction: String(a.systemInstruction),
          provider: a.provider as AIProvider,
          iconType: a.iconType || 'bot',
          color: a.color || COLORS[0],
          apiKey: a.apiKey || '',
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }));
        onUpdateAgents([...agents, ...processed]);
        setImportSuccess(`${processed.length} agent(s) import ho gaye!`);
        setTimeout(() => setImportSuccess(null), 4000);
      } catch (err) {
        setImportError("JSON parse karne mein error aaya.");
      }
    };
    reader.readAsText(file);
  };

  // --- Test API Key ---
  const handleTestApiKey = async () => {
    if (!newAgent.apiKey?.trim()) return;
    setIsTesting(true);
    setApiKeyValid(null);
    try {
      // Lightweight test: for Gemini we hit the models list endpoint
      let testUrl = '';
      let headers: Record<string, string> = {};

      if (newAgent.provider === 'gemini') {
        testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${newAgent.apiKey}`;
      } else if (newAgent.provider === 'openai') {
        testUrl = 'https://api.openai.com/v1/models';
        headers['Authorization'] = `Bearer ${newAgent.apiKey}`;
      } else if (newAgent.provider === 'anthropic') {
        testUrl = 'https://api.anthropic.com/v1/models';
        headers['x-api-key'] = newAgent.apiKey!;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        // For deepseek/other, just mark as assumed valid
        setApiKeyValid(true);
        setIsTesting(false);
        return;
      }

      const res = await fetch(testUrl, { headers });
      setApiKeyValid(res.ok);
    } catch {
      setApiKeyValid(false);
    } finally {
      setIsTesting(false);
    }
  };

  // --- Create Agent ---
  const handleCreate = () => {
    if (!newAgent.name?.trim() || !newAgent.systemInstruction?.trim()) return;
    const agent: CustomAgent = {
      ...newAgent as CustomAgent,
      id: Date.now().toString()
    };
    onUpdateAgents([...agents, agent]);
    setNewAgent(emptyAgent);
    setApiKeyValid(null);
    setShowApiKey(false);
    setView('list');
  };

  const handleDelete = (id: string) => {
    onUpdateAgents(agents.filter(a => a.id !== id));
    if (selectedAgent?.id === id) setView('list');
  };

  // --- Icon Renderer ---
  const getIcon = (type: string, color: string, size = 20) => {
    const props = { size, style: { color } };
    switch (type) {
      case 'brain': return <BrainCircuit {...props} />;
      case 'shield': return <Shield {...props} />;
      case 'palette': return <Palette {...props} />;
      case 'zap': return <Zap {...props} />;
      case 'bot': return <Bot {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  // ===================== VIEWS =====================

  // --- Detail View ---
  if (view === 'detail' && selectedAgent) {
    const provider = PROVIDERS.find(p => p.id === selectedAgent.provider);
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-end justify-center">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-[#0F0F0F] rounded-t-[3rem] border-t border-white/10 flex flex-col max-h-[88vh] overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex items-center space-x-4 border-b border-white/5">
            <button onClick={() => setView('list')} className="p-2 bg-white/5 rounded-2xl"><ArrowLeft size={18} /></button>
            <h2 className="text-xl font-black flex-1">Agent Details</h2>
            <button onClick={() => handleDelete(selectedAgent.id)} className="p-2 bg-red-500/10 rounded-2xl text-red-500"><Trash2 size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 no-scrollbar">
            <div className="flex items-center space-x-4 p-5 bg-white/[0.03] rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                {getIcon(selectedAgent.iconType, selectedAgent.color, 26)}
              </div>
              <div>
                <h3 className="text-lg font-black">{selectedAgent.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: provider?.color }}>{provider?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">System Instructions</label>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-sm text-white/60 leading-relaxed font-medium">
                {selectedAgent.systemInstruction}
              </div>
            </div>

            {selectedAgent.apiKey && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">API Key</label>
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-sm text-green-400/60 flex items-center space-x-3">
                  <Key size={14} className="text-green-500/50" />
                  <span>{selectedAgent.apiKey.slice(0, 8)}{'•'.repeat(16)}</span>
                  <CheckCircle2 size={14} className="text-green-500 ml-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Create View ---
  if (view === 'create') {
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-end justify-center">
        <div className="absolute inset-0" onClick={onClose} />
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />

        <div className="relative w-full max-w-lg bg-[#0F0F0F] rounded-t-[3rem] border-t border-white/10 flex flex-col max-h-[95vh] overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex items-center space-x-4 border-b border-white/5">
            <button onClick={() => { setView('list'); setNewAgent(emptyAgent); setApiKeyValid(null); }} className="p-2 bg-white/5 rounded-2xl">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xl font-black flex-1">Naya Agent Banao</h2>
            <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
              {getIcon(newAgent.iconType || 'bot', newAgent.color || '#2563EB', 18)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
            
            {/* Agent Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Agent Ka Naam *</label>
              <input
                placeholder="Jaise: My SEO Expert"
                value={newAgent.name || ''}
                onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 p-4 rounded-2xl text-white outline-none transition-all font-medium"
              />
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">AI Provider *</label>
              <div className="grid grid-cols-1 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setNewAgent({...newAgent, provider: p.id})}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      newAgent.provider === p.id
                        ? 'border-opacity-50 bg-white/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                    style={{ borderColor: newAgent.provider === p.id ? p.color : undefined }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-[13px] font-bold text-white">{p.name}</span>
                    </div>
                    {newAgent.provider === p.id && <Check size={14} style={{ color: p.color }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">API Key *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Key size={16} className="text-white/20" />
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={selectedProvider.placeholder}
                  value={newAgent.apiKey || ''}
                  onChange={e => { setNewAgent({...newAgent, apiKey: e.target.value}); setApiKeyValid(null); }}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 pl-10 pr-24 py-4 rounded-2xl text-white outline-none transition-all font-mono text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 text-white/30 hover:text-white transition-colors">
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Test + Status */}
              <div className="flex items-center space-x-3 px-1">
                <button
                  onClick={handleTestApiKey}
                  disabled={!newAgent.apiKey?.trim() || isTesting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    newAgent.apiKey?.trim() && !isTesting
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
                      : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {isTesting ? (
                    <span className="animate-pulse">Testing...</span>
                  ) : (
                    <><Zap size={11} /><span>Key Test Karo</span></>
                  )}
                </button>

                {apiKeyValid === true && (
                  <div className="flex items-center space-x-1.5 text-green-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Valid Key!</span>
                  </div>
                )}
                {apiKeyValid === false && (
                  <div className="flex items-center space-x-1.5 text-red-500">
                    <AlertTriangle size={14} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Invalid Key</span>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 px-1 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                <Info size={12} className="text-yellow-500/60 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-500/50 font-medium leading-relaxed">
                  API key sirf aapke device par store hoti hai. Kabhi kisi ke saath share mat karo.
                </p>
              </div>
            </div>

            {/* System Instruction */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">System Instructions *</label>
              <textarea
                placeholder="Is agent ko kya karna chahiye? Jaise: Tum ek expert SEO writer ho jo hamesha meta tags aur structured data include karta hai..."
                value={newAgent.systemInstruction || ''}
                onChange={e => setNewAgent({...newAgent, systemInstruction: e.target.value})}
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 p-4 rounded-2xl text-white outline-none transition-all h-32 resize-none font-medium text-sm leading-relaxed"
              />
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Icon</label>
              <div className="flex space-x-2">
                {ICONS.map(icon => (
                  <button
                    key={icon.id}
                    onClick={() => setNewAgent({...newAgent, iconType: icon.id})}
                    className={`flex-1 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      newAgent.iconType === icon.id
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                    }`}
                  >
                    {getIcon(icon.id, newAgent.iconType === icon.id ? (newAgent.color || '#2563EB') : 'rgba(255,255,255,0.3)', 18)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Color</label>
              <div className="flex space-x-2 flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewAgent({...newAgent, color})}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      newAgent.color === color ? 'scale-110 border-white' : 'border-transparent scale-90 hover:scale-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-white/5">
            <button
              onClick={handleCreate}
              disabled={!newAgent.name?.trim() || !newAgent.systemInstruction?.trim()}
              className={`w-full h-14 rounded-[2rem] font-black text-[13px] uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${
                newAgent.name?.trim() && newAgent.systemInstruction?.trim()
                  ? 'bg-white text-black shadow-2xl active:scale-95'
                  : 'bg-white/10 text-white/20 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              <span>Agent Deploy Karo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- List View (Default) ---
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-end justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />

      <div className="relative w-full max-w-lg bg-[#0F0F0F] rounded-t-[3rem] border-t border-white/10 flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black">Agent Fleet</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-0.5">{agents.length} Agent{agents.length !== 1 ? 's' : ''} Deployed</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleExportFleet} disabled={agents.length === 0} className="p-2.5 bg-white/5 rounded-2xl text-white/30 hover:text-white disabled:opacity-20 transition-all" title="Fleet Export Karo">
              <Download size={18} />
            </button>
            <button onClick={handleImportClick} className="p-2.5 bg-white/5 rounded-2xl text-white/30 hover:text-white transition-all" title="Fleet Import Karo">
              <Upload size={18} />
            </button>
            <button onClick={onClose} className="p-2.5 bg-white/5 rounded-2xl">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {importSuccess && (
          <div className="mx-6 mt-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center space-x-2 text-green-500">
            <CheckCircle2 size={14} />
            <span className="text-[12px] font-bold">{importSuccess}</span>
          </div>
        )}
        {importError && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-2 text-red-500">
            <AlertTriangle size={14} />
            <span className="text-[12px] font-bold">{importError}</span>
            <button onClick={() => setImportError(null)} className="ml-auto"><X size={12} /></button>
          </div>
        )}

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar space-y-3">
          {agents.length === 0 && (
            <div className="py-16 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Bot size={28} className="text-white/10" />
              </div>
              <div>
                <p className="text-white/40 font-bold">Koi agent nahi hai abhi</p>
                <p className="text-[11px] text-white/20 mt-1">Neeche button se apna pehla agent banao</p>
              </div>
            </div>
          )}

          {agents.map(agent => {
            const provider = PROVIDERS.find(p => p.id === agent.provider);
            return (
              <div
                key={agent.id}
                className="p-5 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer"
                onClick={() => { setSelectedAgent(agent); setView('detail'); }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                    {getIcon(agent.iconType, agent.color, 22)}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black">{agent.name}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: provider?.color }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: provider?.color }}>
                        {provider?.name}
                      </span>
                      {agent.apiKey && (
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-500/10 rounded-md">
                          <Key size={8} className="text-green-500" />
                          <span className="text-[8px] font-black text-green-500 uppercase">Key Set</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
                  className="p-2 text-red-500/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {/* Add New Agent Button */}
          <button
            onClick={() => setView('create')}
            className="w-full py-5 border-2 border-dashed border-white/10 rounded-[2.5rem] text-white/30 hover:text-white hover:border-blue-500/30 hover:bg-blue-600/5 transition-all flex items-center justify-center space-x-3"
          >
            <Plus size={20} />
            <span className="text-[12px] font-black uppercase tracking-widest">Naya Agent Deploy Karo</span>
          </button>
        </div>

        {/* Info Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex items-start space-x-3">
          <Info size={14} className="text-blue-500/40 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/20 font-medium leading-relaxed">
            Har agent apni API key use karta hai. Gemini agents ke liye default app key bhi kaam karti hai.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentManagerModal;
