export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface ByokConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

const STORAGE_KEY = 'saccade_byok_config';

export const DEFAULT_MODELS: Record<AiProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
  openrouter: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct']
};

export const ByokService = {
  getConfig(): ByokConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse BYOK config from localStorage', e);
    }
    return {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o'
    };
  },

  saveConfig(config: ByokConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  clearConfig(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  hasKey(): boolean {
    const config = this.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 5);
  },

  async verifyKey(provider: string, apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
      const res = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey })
      });
      if (res.ok) {
        return await res.json();
      }
      return { valid: false, message: `Server returned HTTP ${res.status}` };
    } catch (err: any) {
      return { valid: false, message: err.message || 'Verification request failed' };
    }
  }
};
