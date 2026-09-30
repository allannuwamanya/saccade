import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'json' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-[var(--radius-lg)] bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} className="text-[var(--color-success)]" /> : <Copy size={16} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-[var(--text-sm)] font-mono text-[var(--color-text-secondary)] whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};
