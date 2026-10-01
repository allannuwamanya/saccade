export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface ByokConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  isFree?: boolean;
}

const STORAGE_KEY = 'saccade_byok_config';

export const DEFAULT_MODELS: Record<AiProvider, string[]> = {
  openrouter: [
    'openrouter/free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'qwen/qwen3.8-27b:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'inclusionai/ling-3.0-flash-sante:free',
    'liquid/lfm-2.5-2.6b:free',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat'
  ],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro']
};

export const ByokService = {
  getConfig(): ByokConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.apiKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse BYOK config from localStorage', e);
    }
    // Default configuration with free openrouter model
    return {
      provider: 'openrouter',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      model: 'openrouter/free'
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

  async verifyKey(provider: string, apiKey: string): Promise<{ valid: boolean; message: string; isFreeTier?: boolean }> {
    if (!apiKey || !apiKey.trim()) {
      return { valid: false, message: 'Please enter an API key.' };
    }

    // Direct browser verification for OpenRouter
    if (provider === 'openrouter') {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`
          }
        });
        if (res.ok) {
          const body = await res.json();
          const d = body.data || {};
          const isFree = d.is_free_tier;
          const freeReqs = d.free_model_daily_requests;
          if (freeReqs) {
            return {
              valid: true,
              message: `Active OpenRouter key (${freeReqs.remaining ?? 0}/${freeReqs.limit ?? 50} free requests left today)`,
              isFreeTier: isFree
            };
          }
          return {
            valid: true,
            message: `Active OpenRouter key (Credits used: $${(d.usage || 0).toFixed(2)})`,
            isFreeTier: isFree
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          return {
            valid: false,
            message: errData.error?.message || `Verification failed (HTTP ${res.status})`
          };
        }
      } catch (err) {
        // Fallback to backend verification if direct fetch blocked
      }
    }

    try {
      const res = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey.trim() })
      });
      if (res.ok) {
        return await res.json();
      }
      return { valid: false, message: `Server returned HTTP ${res.status}` };
    } catch (err: any) {
      return { valid: false, message: err.message || 'Verification request failed' };
    }
  },

  async fetchOpenRouterModels(): Promise<{ free: ModelOption[]; paid: ModelOption[] }> {
    const fallbackFree: ModelOption[] = [
      { id: 'openrouter/free', name: '⭐ Auto-Select Best Free Model', isFree: true },
      { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B (Free)', isFree: true },
      { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google: Gemma 4 26B (Free)', isFree: true },
      { id: 'qwen/qwen3.8-27b:free', name: 'Qwen 3.8 27B (Free)', isFree: true },
      { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nvidia Nemotron 3 Super (Free)', isFree: true },
      { id: 'inclusionai/ling-3.0-flash-sante:free', name: 'Ling 3.0 Flash (Free)', isFree: true },
      { id: 'liquid/lfm-2.5-2.6b:free', name: 'Liquid LFM 2.5 (Free)', isFree: true }
    ];

    const fallbackPaid: ModelOption[] = [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet', isFree: false },
      { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o', isFree: false },
      { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o Mini', isFree: false },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek: V3', isFree: false },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B Instruct', isFree: false }
    ];

    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      if (res.ok) {
        const data = await res.json();
        const models: any[] = data.data || [];
        const free: ModelOption[] = [
          { id: 'openrouter/free', name: '⭐ Auto-Select Best Free Model', isFree: true }
        ];
        const paid: ModelOption[] = [];

        for (const m of models) {
          const id = m.id;
          const name = m.name || id;
          const promptPrice = parseFloat(m.pricing?.prompt || '1');
          if (id.includes(':free') || promptPrice === 0) {
            if (id !== 'openrouter/free') {
              free.push({ id, name: `${name} (Free)`, isFree: true });
            }
          } else {
            paid.push({ id, name, isFree: false });
          }
        }
        return {
          free: free.length > 1 ? free : fallbackFree,
          paid: paid.length > 0 ? paid.slice(0, 80) : fallbackPaid
        };
      }
    } catch (e) {
      console.warn('Failed to fetch OpenRouter models dynamically, using curated list', e);
    }

    return { free: fallbackFree, paid: fallbackPaid };
  }
};
