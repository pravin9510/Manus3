
import React, { useState, useRef } from 'react';
import { 
  X, Plus, Trash2, Shield, BrainCircuit, Palette, Zap, Bot, Sparkles, 
  Save, Key, Info, ArrowLeft, Download, Upload,
  AlertTriangle, Eye, EyeOff, CheckCircle2, Check
} from 'lucide-react';
import { CustomAgent, AIProvider } from '../types';

interface AgentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: CustomAgent[];
  onUpdateAgents: (agents: CustomAgent[]) => void;
}

const PROVIDERS: {id: AIProvider, name: string, icon: string}[] = [
  { id: 'gemini', name: 'Google Gemini', icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b5d9207ad271.svg' },
  { id: 'openai', name: 'OpenAI GPT', icon: 'https://openai.com/favicon.ico' },
  { id: 'anthropic', name: 'Anthropic Claude', icon: 'https://anthropic.com/favicon.ico' },
  { id: 'deepseek', name: 'DeepSeek', icon: 'https://deepseek.com/favicon.ico' },
  { id: 'other', name: 'Other Llama/Custom', icon: 'https://meta.com/favicon.ico' }
];

const ICONS = ['brain', 'shield', 'palette', 'zap', 'bot', 'sparkles'];
const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

const AgentManagerModal: React.FC<AgentManagerModalProps> = ({ isOpen, onClose, agents, onUpdateAgents }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAgent, setNewAgent] = useState<Partial<CustomAgent>>({
    name: '',
    provider: 'gemini',
    systemInstruction: '',
    iconType: 'bot',
    color: '#2563EB',
    apiKey: ''
  });

  if (!isOpen) return null;

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

        if (validAgents.length === 0) {
          setImportError("Invalid agent configuration.");
          return;
        }

        const processed: CustomAgent[] = validAgents.map(a => ({
          name: String(a.name),
          systemInstruction: String(a.systemInstruction),
          provider: a.provider as AIProvider,
          iconType: a.iconType as any,
          color: a.color || COLORS[0],
          apiKey: a.apiKey || '',
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }));

        onUpdateAgents([...agents, ...processed]);
        setImportSuccess(`Imported ${processed.length} agents.`);
        setTimeout(() => setImportSuccess(null), 4000);
      } catch (err) {
        setImportError("Failed to parse JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = () => {
    if (!newAgent.name || !newAgent.systemInstruction) return;
    const agent: CustomAgent = { ...newAgent as CustomAgent, id: Date.now().toString() };
    onUpdateAgents([...agents, agent]);
    setIsCreating(false);
  };

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

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-end justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />

      <div className="relative w-full max-w-lg bg-[#0F0F0F] rounded-t-[3rem] border-t border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-white/5">
          <h2 className="text-2xl font-black">{isCreating ? 'Create Agent' : 'Agent Fleet'}</h2>
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-2xl"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          {!isCreating ? (
            <div className="space-y-4">
              {agents.map(agent => (
                <div key={agent.id} className="p-5 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getIcon(agent.iconType, agent.color, 24)}
                    <div>
                      <h3 className="text-[16px] font-black">{agent.name}</h3>
                      <span className="text-[10px] font-black text-blue-500 uppercase">{agent.provider}</span>
                    </div>
                  </div>
                  <button onClick={() => onUpdateAgents(agents.filter(a => a.id !== agent.id))} className="text-red-500/40 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button onClick={() => setIsCreating(true)} className="w-full py-4 border-2 border-dashed border-white/10 rounded-[2.5rem] text-white/40">Deploy New Agent</button>
            </div>
          ) : (
            <div className="space-y-6">
              <input placeholder="Agent Name" className="w-full bg-white/5 p-4 rounded-2xl" onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
              <textarea placeholder="Directives..." className="w-full bg-white/5 p-4 rounded-2xl h-32" onChange={e => setNewAgent({...newAgent, systemInstruction: e.target.value})} />
              <button onClick={handleCreate} className="w-full h-16 bg-white text-black rounded-[2rem] font-black">Save Agent</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentManagerModal;
