import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, ArrowUp, Plus, Loader2, X, 
  Globe, Smartphone, AlertCircle, ArrowLeft, 
  FileText, Share, Download, Play, CheckCircle2,
  Terminal, BrainCircuit, User, ChevronDown, 
  Shield, Zap, Palette, Bot, Settings2, Save, BookmarkCheck,
  ListTodo, Search, Code, Construction, Activity,
  Layout, Kanban, ShoppingCart, LineChart, HeartPulse,
  FileUp, FileCheck, Layers, Gamepad2, Box, Cpu, Upload, ExternalLink,
  AlertTriangle, Image as ImageIcon, ChevronUp, ImageIcon as IconSelector,
  Timer, Cpu as CpuIcon, Network, Rocket, Paperclip, File,
  SearchCheck, Megaphone, Fingerprint, Palette as PaletteIcon,
  AppWindow, CloudLightning, Wand2, Languages
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ChatMessage, Project, CustomAgent, AIProvider, AgentStep } from '../types';
import MobileAppPreview from './MobileAppPreview';
import WebsitePreview from './WebsitePreview';
import GamePreview from './GamePreview';
import PublishModal from './PublishModal';
import ApkBuildModal from './ApkBuildModal';

interface ChatPageProps {
  onBack: () => void;
  project: Project | null;
  onCreateProject: (p: Project) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  credits: number;
  onDeductCredits: (amount: number) => boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onExportProject?: (project: Project) => void;
  customAgents?: CustomAgent[];
  onOpenAgentManager?: () => void;
  initialPrompt?: string | null;
}

const DEFAULT_AGENT: CustomAgent = {
  id: 'manus-core',
  name: 'Manus Core',
  systemInstruction: `You are a World-Class Senior Full-Stack Developer and SEO Expert. 
When generating websites or apps:
1. ALWAYS include metadata and semantic structure.
2. If you create a website or app, ALWAYS call the 'generate_logo' tool to create a visual identity for the brand.
3. If the user asks for a website, automatically suggest and call 'generate_pwa_config' to make it a Progressive Web App.
4. Ensure the manifest includes professional PWA fields (name, short_name, theme_color, background_color, display: standalone).`,
  iconType: 'brain',
  color: '#2563EB',
  provider: 'gemini'
};

const SUGGESTIONS = [
  { label: 'Build Game', icon: <Gamepad2 size={12} />, prompt: 'Create a simple 2D & 3D platformer game using HTML and JavaScript' },
  { label: 'SaaS Page', icon: <Layout size={12} />, prompt: 'Design a premium SEO-optimized SaaS landing page for a cloud computing platform.' },
  { label: 'Python App', icon: <Terminal size={12} />, prompt: 'Create a basic Python web application using Flask or Django' },
  { label: 'Task App', icon: <ListTodo size={12} />, prompt: 'Forge a React Native task manager app with neural categorization and voice commands.' },
  { label: 'Crypto Dash', icon: <LineChart size={12} />, prompt: 'Build a real-time crypto portfolio dashboard with dark mode and high-fidelity charts.' },
  { label: 'Portfolio', icon: <User size={12} />, prompt: 'Build a high-end SEO-friendly designer portfolio website with smooth scroll animations.' },
  { label: 'E-com UI', icon: <ShoppingCart size={12} />, prompt: 'Design a mobile-first SEO-optimized e-commerce interface for a luxury fashion brand.' }
];

const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'build_website',
    description: 'Generates a unique, SEO-optimized website. Must include meta tags, JSON-LD schema, and semantic structure.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "Technical and SEO strategy summary." },
        html_code: { type: Type.STRING, description: "Complete source code." }
      },
      required: ['description', 'html_code'],
    },
  },
  {
    name: 'build_mobile_app',
    description: 'Generates a mobile app simulation and native package metadata.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        platform: { type: Type.STRING, enum: ['React Native', 'Flutter'] },
        code: { type: Type.STRING, description: "Simulator HTML code." },
        app_name: { type: Type.STRING },
        package_name: { type: Type.STRING, description: "Android package name" },
        version: { type: Type.STRING },
        splash_color: { type: Type.STRING }
      },
      required: ['platform', 'code', 'app_name', 'package_name', 'version'],
    },
  },
  {
    name: 'build_game',
    description: 'Generates a unique game. Must be a standalone HTML/JS game.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        game_name: { type: Type.STRING },
        code: { type: Type.STRING, description: "Web-based game source code (HTML/JS)." }
      },
      required: ['game_name', 'code'],
    },
  },
  {
    name: 'generate_logo',
    description: 'Generates a professional, high-fidelity brand logo for the project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_name: { type: Type.STRING, description: "Name of the project." },
        visual_prompt: { type: Type.STRING, description: "Detailed visual description for the logo." }
      },
      required: ['project_name', 'visual_prompt'],
    },
  },
  {
    name: 'generate_pwa_config',
    description: 'Generates a web app manifest and service worker to transform a website into a Progressive Web App (PWA).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        manifest_json: { type: Type.STRING, description: "Stringified JSON for manifest.json." },
        sw_javascript: { type: Type.STRING, description: "Javascript code for the service worker (sw.js)." }
      },
      required: ['manifest_json', 'sw_javascript'],
    },
  }
];

// ─── Multi-Provider API Handler ───────────────────────────────────────────────
async function callProviderAPI(
  agent: CustomAgent,
  messages: ChatMessage[],
  userText: string,
  selectedFile: { name: string; data: string; type: string } | null,
  systemInstruction: string
): Promise<{
  text: string;
  functionCalls?: Array<{ name: string; args: any }>;
}> {
  const provider = agent.provider || 'gemini';
  const apiKey = agent.apiKey || process.env.API_KEY || '';

  // ── GEMINI (default) ────────────────────────────────────────────────────────
  if (provider === 'gemini' || !agent.apiKey) {
    const geminiKey = agent.apiKey || process.env.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const contents: any[] = [
      ...messages.map(m => ({ role: m.role as any, parts: [{ text: m.text }] })),
      {
        role: 'user',
        parts: selectedFile
          ? [
              { text: userText },
              { inlineData: { mimeType: selectedFile.type, data: selectedFile.data.split(',')[1] } }
            ]
          : [{ text: userText }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }]
      }
    });

    const calls = response.functionCalls?.map(fc => ({ name: fc.name, args: fc.args as any }));
    return { text: response.text || 'Synthesis complete.', functionCalls: calls };
  }

  // ── OPENAI ──────────────────────────────────────────────────────────────────
  if (provider === 'openai') {
    const openaiMessages: any[] = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: userText }
    ];

    // Convert toolDeclarations to OpenAI format
    const openaiTools = toolDeclarations.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        tools: openaiTools,
        tool_choice: 'auto'
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const msg = choice?.message;

    let functionCalls: Array<{ name: string; args: any }> | undefined;
    if (msg?.tool_calls?.length) {
      functionCalls = msg.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments || '{}')
      }));
    }

    return {
      text: msg?.content || 'Synthesis complete.',
      functionCalls
    };
  }

  // ── ANTHROPIC (Claude) ──────────────────────────────────────────────────────
  if (provider === 'anthropic') {
    const anthropicMessages: any[] = [
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: userText }
    ];

    // Convert toolDeclarations to Anthropic format
    const anthropicTools = toolDeclarations.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters
    }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8192,
        system: systemInstruction,
        messages: anthropicMessages,
        tools: anthropicTools
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic API error: ${res.status}`);
    }

    const data = await res.json();

    let text = '';
    let functionCalls: Array<{ name: string; args: any }> | undefined;

    for (const block of data.content || []) {
      if (block.type === 'text') text += block.text;
      if (block.type === 'tool_use') {
        if (!functionCalls) functionCalls = [];
        functionCalls.push({ name: block.name, args: block.input });
      }
    }

    return { text: text || 'Synthesis complete.', functionCalls };
  }

  // ── DEEPSEEK ────────────────────────────────────────────────────────────────
  if (provider === 'deepseek') {
    const deepseekMessages: any[] = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: userText }
    ];

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        max_tokens: 8192
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `DeepSeek API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || 'Synthesis complete.';
    return { text: content };
  }

  // ── CUSTOM / OTHER (OpenAI-compatible) ──────────────────────────────────────
  const customMessages: any[] = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    })),
    { role: 'user', content: userText }
  ];

  const customRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: customMessages
    })
  });

  if (!customRes.ok) throw new Error(`API error: ${customRes.status}`);
  const customData = await customRes.json();
  return { text: customData.choices?.[0]?.message?.content || 'Synthesis complete.' };
}

// ─── Logo generation (Gemini only, graceful fallback) ─────────────────────────
async function generateLogoWithGemini(
  projectName: string,
  visualPrompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: {
        parts: [{
          text: `Professional high-fidelity app logo. Subject: ${projectName}. Visual Style: ${visualPrompt}. Minimalist, 4K, premium vector style, clean background.`
        }]
      },
      config: { responseModalities: ['IMAGE', 'TEXT'] }
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
  } catch (imgErr) {
    console.warn('Logo generation skipped (model unavailable):', imgErr);
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ChatPage: React.FC<ChatPageProps> = ({ 
  onBack, project, onCreateProject, onUpdateProject, 
  credits, onDeductCredits, isDarkMode, onToggleTheme, 
  customAgents = [], onOpenAgentManager, initialPrompt
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(project?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<AgentStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(project?.agentId || 'manus-core');
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  
  const [previewWebCode, setPreviewWebCode] = useState<string | null>(null);
  const [previewGameCode, setPreviewGameCode] = useState<string | null>(null);
  const [previewMobileData, setPreviewMobileData] = useState<ChatMessage['mobileAppData'] | null>(null);
  const [apkBuildData, setApkBuildData] = useState<ChatMessage['mobileAppData'] | null>(null);
  
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [activeMsgIdForIcon, setActiveMsgIdForIcon] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{name: string, data: string, type: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitial = useRef(false);

  const allAgents = [DEFAULT_AGENT, ...customAgents];
  const selectedAgent = allAgents.find(a => a.id === selectedAgentId) || DEFAULT_AGENT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, loadingSteps]);

  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitial.current && messages.length === 0) {
      hasTriggeredInitial.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, messages.length]);

  useEffect(() => {
    if (!isLoading || loadingSteps.length === 0) return;
    const interval = setInterval(() => {
      setLoadingSteps(prev => {
        const runIdx = prev.findIndex(s => s.status === 'running');
        if (runIdx === -1) return prev;
        if (Math.random() > 0.8 && runIdx < prev.length - 1) {
          const next = [...prev];
          next[runIdx] = { ...next[runIdx], status: 'completed' };
          next[runIdx + 1] = { ...next[runIdx + 1], status: 'running' };
          return next;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, loadingSteps.length]);

  const handleRefinePrompt = async () => {
    if (!input.trim() || isRefining || isLoading) return;
    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Improve this prompt for an autonomous AI agent:\n\n"${input}"\n\nReturn ONLY the refined prompt, no preamble.`,
        config: {
          systemInstruction: 'You are a world-class prompt engineering assistant. Rewrite user prompts to maximise AI agent performance.'
        }
      });
      const refined = response.text?.trim();
      if (refined) setInput(refined);
    } catch (err) {
      console.error('Refinement failed', err);
      setError('Prompt refinement failed. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSendMessage = async (customInput?: string) => {
    const finalInput = (customInput || input).trim();
    if (!finalInput && !selectedFile) return;
    if (isLoading) return;

    setError(null);
    if (!onDeductCredits(50)) return;

    const attachmentText = selectedFile ? `\n\n[Attached File: ${selectedFile.name}]` : '';
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: finalInput + attachmentText,
      timestamp: new Date(),
      agentId: selectedAgentId
    };

    const currentFile = selectedFile;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    const initialSteps: AgentStep[] = [
      { id: 'step-1', type: 'plan',   label: 'Analyzing Goal',           status: 'running' },
      { id: 'step-2', type: 'search', label: 'Decomposing Tasks',        status: 'pending' },
      { id: 'step-3', type: 'code',   label: 'Synthesizing Architecture',status: 'pending' },
      { id: 'step-4', type: 'action', label: 'Finalizing Synthesis',     status: 'pending' }
    ];
    setLoadingSteps(initialSteps);

    try {
      // Call the correct provider API
      const result = await callProviderAPI(
        selectedAgent,
        messages,
        finalInput,
        currentFile,
        selectedAgent.systemInstruction
      );

      let webCode      = project?.websiteCode;
      let gameCode     = project?.gameCode;
      let mobileData   = project?.mobileAppData;
      let generatedLogo = project?.generatedLogo;
      let pwaData      = project?.pwaData;

      // Process function calls (only available for Gemini / OpenAI / Anthropic)
      if (result.functionCalls?.length) {
        const geminiApiKey = selectedAgent.provider === 'gemini'
          ? (selectedAgent.apiKey || process.env.API_KEY || '')
          : (process.env.API_KEY || '');

        for (const call of result.functionCalls) {
          const args = call.args || {};

          if (call.name === 'build_website') {
            webCode = args.html_code;
          }
          if (call.name === 'build_game') {
            gameCode = args.code;
          }
          if (call.name === 'build_mobile_app') {
            mobileData = {
              platform: args.platform || 'React Native',
              code: args.code,
              description: args.description || 'App',
              appName: args.app_name,
              version: args.version || '1.0.0',
              packageName: args.package_name
            };
          }
          if (call.name === 'generate_logo') {
            const logo = await generateLogoWithGemini(
              args.project_name,
              args.visual_prompt,
              geminiApiKey
            );
            if (logo) {
              generatedLogo = logo;
              if (mobileData) mobileData = { ...mobileData, appIcon: logo };
            }
          }
          if (call.name === 'generate_pwa_config') {
            pwaData = {
              manifest: args.manifest_json,
              serviceWorker: args.sw_javascript,
              isPwaEnabled: true
            };
          }
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        websiteCode: webCode,
        gameCode,
        mobileAppData: mobileData,
        generatedLogo,
        pwaData,
        agentId: selectedAgentId,
        steps: loadingSteps.map(s => ({ ...s, status: 'completed' }))
      };

      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);

      const projectUpdates = {
        messages: updatedMessages,
        websiteCode: webCode,
        gameCode,
        mobileAppData: mobileData,
        generatedLogo,
        pwaData,
        agentId: selectedAgentId
      };

      if (project) {
        onUpdateProject(project.id, projectUpdates);
      } else {
        onCreateProject({
          id: Date.now().toString(),
          title: userMsg.text.slice(0, 30),
          description: aiMsg.text.slice(0, 100),
          date: 'Today',
          icon: webCode ? 'web' : mobileData ? 'mobile' : gameCode ? 'game' : 'web',
          category: 'All',
          status: 'completed',
          ...projectUpdates
        });
      }

    } catch (err: any) {
      console.error('API Error:', err);
      // Show a meaningful error message
      const msg = err?.message || '';
      if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        setError('Invalid or missing API key. Please check your agent settings.');
      } else if (msg.includes('quota') || msg.includes('429')) {
        setError('Rate limit reached. Please wait a moment and try again.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(msg ? `Error: ${msg}` : 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setLoadingSteps([]);
    }
  };

  const handleIconUploadClick = (msgId: string) => {
    setActiveMsgIdForIcon(msgId);
    iconInputRef.current?.click();
  };

  const handleDirectDownloadApk = (data: ChatMessage['mobileAppData']) => {
    if (!data) return;
    const appName = data.appName || 'ManusProject';
    const filename = `${appName.toLowerCase().replace(/\s+/g, '-')}-v${data.version || '1.0'}.apk`;
    const blob = new Blob([data.code], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAttachmentClick = () => attachmentInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      setSelectedFile({ name: file.name, type: file.type, data: event.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeMsgIdForIcon) return;
    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      const updatedMessages = messages.map(m => {
        if (m.id === activeMsgIdForIcon && m.mobileAppData) {
          return { ...m, mobileAppData: { ...m.mobileAppData, appIcon: base64 } };
        }
        return m;
      });
      setMessages(updatedMessages);
      const latestMobile = updatedMessages.find(m => m.id === activeMsgIdForIcon)?.mobileAppData;
      if (latestMobile && previewMobileData) setPreviewMobileData(latestMobile);
      if (project) onUpdateProject(project.id, { messages: updatedMessages, mobileAppData: latestMobile });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getAgentIcon = (type: string, color: string) => {
    const props = { size: 16, style: { color } };
    switch (type) {
      case 'brain':   return <BrainCircuit {...props} />;
      case 'shield':  return <Shield {...props} />;
      case 'palette': return <PaletteIcon {...props} />;
      case 'zap':     return <Zap {...props} />;
      case 'bot':     return <Bot {...props} />;
      default:        return <Sparkles {...props} />;
    }
  };

  const latestWebCode  = messages.slice().reverse().find(m => m.websiteCode)?.websiteCode  || project?.websiteCode;
  const latestPwaData  = messages.slice().reverse().find(m => m.pwaData)?.pwaData          || project?.pwaData;

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] text-white overflow-hidden safe-pt relative">
      <input type="file" ref={iconInputRef}       onChange={handleIconFileChange} accept="image/*"  className="hidden" aria-hidden="true" />
      <input type="file" ref={attachmentInputRef} onChange={handleFileChange}                       className="hidden" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="px-6 py-5 flex items-center justify-between z-[100] bg-black/50 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=User&background=2563EB&color=fff" alt="Profile" className="w-full h-full object-cover" />
          </button>
          <button onClick={onBack} className="p-2 text-white/30 hover:text-white transition-colors" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsAgentSelectorOpen(!isAgentSelectorOpen)}
            className="flex flex-col items-center group active:scale-95 transition-all"
          >
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Autonomous core</span>
              <ChevronDown size={10} className={`text-blue-500 transition-transform duration-300 ${isAgentSelectorOpen ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white/40 mt-0.5 uppercase tracking-widest group-hover:text-white/60 transition-colors">
              {selectedAgent.name}
            </span>
          </button>

          {isAgentSelectorOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsAgentSelectorOpen(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-[#141414] border border-white/[0.08] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 animate-in fade-in zoom-in duration-300 overflow-hidden backdrop-blur-3xl z-50">
                <div className="px-4 py-3 border-b border-white/[0.04] mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Select Engine</span>
                </div>
                <div className="max-h-72 overflow-y-auto no-scrollbar py-1">
                  {allAgents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => { setSelectedAgentId(agent.id); setIsAgentSelectorOpen(false); }}
                      className={`w-full flex items-center space-x-4 p-4 rounded-[1.5rem] transition-all ${selectedAgentId === agent.id ? 'bg-blue-600/10 text-white' : 'hover:bg-white/[0.03] text-white/40'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center ${selectedAgentId === agent.id ? 'border-blue-500/30' : ''}`}>
                        {getAgentIcon(agent.iconType, agent.color)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[13px] font-black">{agent.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{agent.provider}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2.5 rounded-2xl border transition-all bg-white/5 text-white/30 hover:text-white border-white/5">
            <Save size={18} />
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-10 no-scrollbar" role="log">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 py-12">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8">
              <Rocket className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-3">Ready for Synthesis</h2>
            <p className="text-sm text-white/30 max-w-[240px] leading-relaxed">
              Manus is ready to forge your vision. Select a prompt below or enter your own directives.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 text-[15px] leading-relaxed shadow-xl relative ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#141414] border border-white/[0.08] text-white/90'}`}>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>

              {msg.generatedLogo && (
                <div className="mt-4 p-2 rounded-2xl bg-white/5 border border-white/10 w-fit animate-in zoom-in duration-500">
                  <div className="flex items-center space-x-2 mb-2 px-1">
                    <PaletteIcon size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Synthesized Identity</span>
                  </div>
                  <img src={msg.generatedLogo} alt="Generated Logo" className="w-24 h-24 rounded-xl object-cover shadow-2xl" />
                </div>
              )}

              {msg.role === 'model' && msg.websiteCode && (
                <div className="mt-4 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 w-fit">
                  <SearchCheck size={12} className="text-green-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">SEO Optimized & Indexed</span>
                </div>
              )}

              {msg.role === 'model' && msg.pwaData?.isPwaEnabled && (
                <div className="mt-2 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
                  <AppWindow size={12} className="text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">PWA Engine Active</span>
                </div>
              )}

              {msg.role === 'model' && msg.mobileAppData && (
                <div className="mt-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
                    <Fingerprint size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                      App ID: {msg.mobileAppData.packageName || 'com.manus.synthetic'}
                    </span>
                  </div>
                </div>
              )}

              {msg.role === 'model' && (msg.websiteCode || msg.mobileAppData || msg.gameCode) && (
                <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap gap-2">
                  {msg.websiteCode && (
                    <>
                      <button onClick={() => setPreviewWebCode(msg.websiteCode!)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[11px]">
                        <Globe size={13} /><span>Website</span>
                      </button>
                      {!msg.pwaData?.isPwaEnabled && (
                        <button
                          onClick={() => handleSendMessage('Upgrade this website to a PWA with manifest and service worker.')}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 font-bold text-[11px] hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <AppWindow size={13} /><span>PWA Engine</span>
                        </button>
                      )}
                    </>
                  )}
                  {msg.gameCode && (
                    <button onClick={() => setPreviewGameCode(msg.gameCode!)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-[11px]">
                      <Gamepad2 size={13} /><span>Play Game</span>
                    </button>
                  )}
                  {msg.mobileAppData && (
                    <>
                      <button onClick={() => setPreviewMobileData(msg.mobileAppData!)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[11px]">
                        <Smartphone size={13} /><span>App</span>
                      </button>
                      <button
                        onClick={() => handleIconUploadClick(msg.id)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 font-bold text-[11px] hover:bg-white/20 transition-all"
                      >
                        {msg.mobileAppData.appIcon
                          ? <img src={msg.mobileAppData.appIcon} alt="Icon" className="w-4 h-4 rounded-sm object-cover" />
                          : <IconSelector size={13} />}
                        <span>Icon</span>
                      </button>
                      <button
                        onClick={() => setApkBuildData(msg.mobileAppData!)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-[11px] bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-600/20 group"
                      >
                        <Zap size={13} className="group-hover:animate-bounce" fill="currentColor" /><span>Forge APK</span>
                      </button>
                      <button
                        onClick={() => handleDirectDownloadApk(msg.mobileAppData)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-black font-black text-[11px] hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                      >
                        <Download size={13} /><span>Download APK</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => setIsPublishModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 font-bold text-[11px]">
                    <Upload size={13} /><span>Publish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-4 animate-in fade-in duration-500 max-w-[85%]">
            <div className="w-full bg-[#141414] border border-blue-500/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/[0.02] animate-pulse pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <CpuIcon size={18} className="text-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Neural Synthesis</h4>
                    <p className="text-[12px] font-bold text-white/60">
                      {selectedAgent.provider !== 'gemini' && selectedAgent.apiKey
                        ? `Using ${selectedAgent.name} (${selectedAgent.provider})...`
                        : 'Establishing high-fidelity layer...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Active</span>
                </div>
              </div>
              <div className="space-y-5">
                {loadingSteps.map((step, idx) => (
                  <div key={step.id} className={`flex items-center justify-between transition-all duration-500 ${step.status === 'pending' ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                        step.status === 'completed' ? 'bg-green-600/10 border-green-500/20 text-green-500' :
                        step.status === 'running'   ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.2)]' :
                        'bg-white/5 border-white/5 text-white/20'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle2 size={14} /> :
                         step.status === 'running'   ? (idx === 0 ? <Timer size={14} /> : idx === 1 ? <Search size={14} /> : idx === 2 ? <Code size={14} /> : <Zap size={14} />) :
                         <Timer size={14} />}
                      </div>
                      <span className={`text-[13px] font-bold ${step.status === 'running' ? 'text-white' : 'text-white/40'}`}>{step.label}</span>
                    </div>
                    {step.status === 'running' && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.04]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Synthesis Bridge Status</span>
                  <span className="text-[10px] font-mono text-blue-400 tabular-nums">
                    {Math.floor((loadingSteps.filter(s => s.status === 'completed').length / Math.max(loadingSteps.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    style={{ width: `${(loadingSteps.filter(s => s.status === 'completed').length / Math.max(loadingSteps.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </main>

      {/* ── Error Banner ── */}
      {error && (
        <div className="px-5 py-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center space-x-3 text-red-500 text-xs animate-in slide-in-from-bottom-2">
            <AlertTriangle size={14} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="opacity-40 hover:opacity-100"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* ── Suggestion Chips ── */}
      {!isLoading && (
        <div className="px-5 py-2 overflow-x-auto no-scrollbar flex items-center space-x-3 animate-in fade-in duration-700">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.prompt)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-blue-500/30 transition-all whitespace-nowrap tap-scale shrink-0 group"
            >
              <span className="text-blue-500 group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-[10px] font-black text-white/60 group-hover:text-white uppercase tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Input Footer ── */}
      <footer className="p-5 glass border-t border-white/[0.04] z-[110]">
        <div className="relative flex flex-col space-y-3">
          {input.length > 5 && !isLoading && (
            <div className="flex justify-end px-2">
              <button
                onClick={handleRefinePrompt}
                disabled={isRefining}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all group active:scale-95"
              >
                {isRefining
                  ? <Loader2 size={12} className="animate-spin text-blue-500" />
                  : <Sparkles size={12} className="text-blue-500 group-hover:rotate-12 transition-transform" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  {isRefining ? 'Refining...' : 'Magic Refine'}
                </span>
              </button>
            </div>
          )}

          {/* Selected file chip */}
          {selectedFile && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl w-fit">
              <File size={12} className="text-blue-400" />
              <span className="text-[11px] text-blue-400 font-bold truncate max-w-[150px]">{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="text-blue-400/60 hover:text-red-400 transition-colors"><X size={12} /></button>
            </div>
          )}

          <div className="relative flex items-center">
            <button
              onClick={handleAttachmentClick}
              className="p-3 mr-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white active:scale-90 transition-all"
            >
              <Paperclip size={20} />
            </button>
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Instruct ${selectedAgent.name}...`}
                className={`w-full bg-[#141414] border border-white/[0.06] rounded-[2rem] pl-6 pr-14 py-4 min-h-[64px] max-h-40 text-[15px] outline-none transition-all resize-none font-medium ${isRefining ? 'opacity-50 pointer-events-none' : ''}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!input.trim() && !selectedFile) || isLoading || isRefining}
                className={`absolute right-2.5 bottom-2.5 p-2.5 rounded-2xl transition-all ${(input.trim() || selectedFile) && !isLoading && !isRefining ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/10'}`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} />}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {previewWebCode   && <WebsitePreview   code={previewWebCode}  isOpen={true} onClose={() => setPreviewWebCode(null)} />}
      {previewGameCode  && <GamePreview      code={previewGameCode} isOpen={true} onClose={() => setPreviewGameCode(null)}  gameName={project?.title} />}
      {previewMobileData && <MobileAppPreview platform={previewMobileData.platform} code={previewMobileData.code} isOpen={true} onClose={() => setPreviewMobileData(null)} appIcon={previewMobileData.appIcon} appName={previewMobileData.appName} />}
      {apkBuildData     && <ApkBuildModal    isOpen={true} onClose={() => setApkBuildData(null)} mobileData={apkBuildData} />}
      {isPublishModalOpen && <PublishModal   isOpen={true} onClose={() => setIsPublishModalOpen(false)} appName={project?.title} websiteCode={latestWebCode} pwaData={latestPwaData} />}
    </div>
  );
};

export default ChatPage;
