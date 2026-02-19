
export type ProjectStatus = 'completed' | 'pending' | 'failed';

export type AgentEngine = string;

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'other';

export interface CustomAgent {
  id: string;
  name: string;
  systemInstruction: string;
  iconType: 'brain' | 'shield' | 'palette' | 'zap' | 'bot' | 'sparkles';
  color: string;
  provider: AIProvider;
  apiKey?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: 'game' | 'chart' | 'web' | 'mobile' | 'palette';
  isDashedIcon?: boolean;
  category: Category;
  status?: ProjectStatus;
  progress?: number;
  messages: ChatMessage[];
  agentId?: AgentEngine;
  websiteCode?: string;
  gameCode?: string;
  generatedLogo?: string; // Base64 or URL of generated logo
  pwaData?: {
    manifest: string;
    serviceWorker: string;
    isPwaEnabled: boolean;
  };
  mobileAppData?: {
    platform: 'React Native' | 'Flutter';
    code: string;
    description: string;
    appName?: string;
    appIcon?: string;
    version?: string;
    packageName?: string;
  };
}

export type Category = 'All' | 'Favorites' | 'Scheduled';

export interface AgentStep {
  id: string;
  type: 'plan' | 'search' | 'code' | 'action' | 'website' | 'mobile_app' | 'heal';
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  agentId?: AgentEngine;
  steps?: AgentStep[];
  websiteCode?: string;
  gameCode?: string;
  generatedLogo?: string; // Base64 of generated logo
  pwaData?: {
    manifest: string;
    serviceWorker: string;
    isPwaEnabled: boolean;
  };
  mobileAppData?: {
    platform: 'React Native' | 'Flutter';
    code: string;
    description: string;
    appName?: string;
    appIcon?: string;
    version?: string;
    packageName?: string;
  };
}
