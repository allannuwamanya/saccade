import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ByokService, ByokConfig, AiProvider, DEFAULT_MODELS } from '../services/byok';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: ByokConfig) => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [config, setConfig] = useState<ByokConfig>(ByokService.getConfig());
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(ByokService.getConfig());
      setVerifyStatus(null);
      setHasSaved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AiProvider) => {
    const defaultModel = DEFAULT_MODELS[provider][0];
    setConfig({
      ...config,
      provider,
      model: defaultModel
    });
    setVerifyStatus(null);
  };

  const handleTestKey = async () => {
    if (!config.apiKey.trim()) {
      setVerifyStatus({ success: false, message: 'Please enter an API key first' });
      return;
    }
    setIsVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await ByokService.verifyKey(config.provider, config.apiKey.trim());
      setVerifyStatus({
        success: res.valid,
        message: res.message
      });
    } catch (e: any) {
      setVerifyStatus({ success: false, message: e.message || 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    ByokService.saveConfig(config);
    setHasSaved(true);
    if (onSaved) onSaved(config);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleClear = () => {
    ByokService.clearConfig();
    setConfig({
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o'
    });
    setVerifyStatus(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="byok-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
              <Key size={17} />
            </div>
            <div>
              <h2 id="byok-title" className="text-sm font-bold text-white">
                Bring Your Own Key (BYOK)
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Stream tokens directly from frontier models with your own API credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Select Provider</label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
            {[
              { id: 'openai', label: 'OpenAI' },
              { id: 'anthropic', label: 'Anthropic' },
              { id: 'openrouter', label: 'OpenRouter' },
              { id: 'gemini', label: 'Gemini' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id as AiProvider)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  config.provider === p.id
                    ? 'bg-[var(--color-surface-2)] text-white shadow-sm border border-[var(--color-border)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">
              {config.provider.toUpperCase()} API Key
            </label>
            {config.provider === 'openai' && (
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Get OpenAI Key <ExternalLink size={10} />
              </a>
            )}
            {config.provider === 'anthropic' && (
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Get Anthropic Key <ExternalLink size={10} />
              </a>
            )}
            {config.provider === 'openrouter' && (
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Get OpenRouter Key <ExternalLink size={10} />
              </a>
            )}
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={config.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
              className="w-full px-3 py-2 pr-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Model</label>
          <select
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
          >
            {DEFAULT_MODELS[config.provider].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status Banner */}
        {verifyStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              verifyStatus.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {verifyStatus.success ? <Check size={14} /> : <X size={14} />}
            <span className="flex-1">{verifyStatus.message}</span>
          </div>
        )}

        {/* Security & Sovereignty Callout */}
        <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)] flex items-start gap-2.5">
          <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Client-Side Sovereignty: Your API key is stored strictly inside your browser’s <code className="text-zinc-300">localStorage</code>. It is never logged or retained on our backend.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-zinc-500 hover:text-red-400"
          >
            <Trash2 size={13} className="mr-1" /> Clear Key
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestKey}
              isLoading={isVerifying}
            >
              Test Key
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className={hasSaved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
            >
              {hasSaved ? (
                <>
                  <Check size={13} className="mr-1.5" /> Saved
                </>
              ) : (
                'Save & Use Key'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
