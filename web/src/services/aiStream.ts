import { ByokService, ByokConfig } from './byok';
import { API_BASE } from './api';

export interface StreamParseResult {
  chatText: string;
  latexCode: string | null;
  isWritingLatex: boolean;
}

export interface StreamOptions {
  prompt: string;
  systemPrompt?: string;
  currentLatex?: string;
  onChatText: (chatText: string, isWritingLatex: boolean) => void;
  onLatexChunk?: (latex: string) => void;
  onError: (error: string) => void;
  onDone: (result: { chatText: string; latexCode: string | null }) => void;
}

/**
 * Intelligent stream demuxer separating conversational commentary from LaTeX source code.
 */
export function parseStreamingResponse(raw: string): StreamParseResult {
  // Pattern 1: Markdown code block ```latex or ```tex or ```
  const codeBlockStartRegex = /```(?:latex|tex)?\s*\n?/i;
  const match = codeBlockStartRegex.exec(raw);

  if (match) {
    const beforeCode = raw.substring(0, match.index).trim();
    const contentStart = match.index + match[0].length;
    const remaining = raw.substring(contentStart);

    // Look for closing fence ```
    const closeIndex = remaining.indexOf('```');
    if (closeIndex !== -1) {
      // Complete code block
      const latexCode = remaining.substring(0, closeIndex).trim();
      const afterCode = remaining.substring(closeIndex + 3).trim();
      const chatParts = [beforeCode, afterCode].filter(Boolean);
      return {
        chatText: chatParts.join('\n\n'),
        latexCode: latexCode.length > 0 ? latexCode : null,
        isWritingLatex: false
      };
    } else {
      // In the middle of streaming code
      return {
        chatText: beforeCode,
        latexCode: remaining,
        isWritingLatex: true
      };
    }
  }

  // Pattern 2: Raw LaTeX without fences starting with \documentclass
  const docClassIdx = raw.indexOf('\\documentclass');
  if (docClassIdx !== -1) {
    const beforeCode = raw.substring(0, docClassIdx).trim();
    const remaining = raw.substring(docClassIdx);
    const endDocStr = '\\end{document}';
    const endDocIdx = remaining.indexOf(endDocStr);

    if (endDocIdx !== -1) {
      const latexCode = remaining.substring(0, endDocIdx + endDocStr.length).trim();
      const afterCode = remaining.substring(endDocIdx + endDocStr.length).trim();
      const chatParts = [beforeCode, afterCode].filter(Boolean);
      return {
        chatText: chatParts.join('\n\n'),
        latexCode,
        isWritingLatex: false
      };
    } else {
      return {
        chatText: beforeCode,
        latexCode: remaining,
        isWritingLatex: true
      };
    }
  }

  // Pure conversational prose (no LaTeX code)
  return {
    chatText: raw,
    latexCode: null,
    isWritingLatex: false
  };
}

export async function streamAiGeneration(options: StreamOptions): Promise<void> {
  const { prompt, systemPrompt, currentLatex, onChatText, onLatexChunk, onError, onDone } = options;
  const byok = ByokService.getConfig();

  let accumulatedRaw = '';

  const processChunk = (token: string) => {
    accumulatedRaw += token;
    const parsed = parseStreamingResponse(accumulatedRaw);
    onChatText(parsed.chatText, parsed.isWritingLatex);
    if (parsed.latexCode !== null && onLatexChunk) {
      onLatexChunk(parsed.latexCode);
    }
  };

  const finalize = () => {
    const finalParsed = parseStreamingResponse(accumulatedRaw);
    onChatText(finalParsed.chatText, false);
    if (finalParsed.latexCode !== null && onLatexChunk) {
      onLatexChunk(finalParsed.latexCode);
    }
    onDone({
      chatText: finalParsed.chatText,
      latexCode: finalParsed.latexCode
    });
  };

  // 1. Direct browser streaming to OpenRouter (Fast, 0ms backend cold start, CORS native)
  if (byok.provider === 'openrouter' && byok.apiKey && byok.apiKey.trim().length > 5) {
    try {
      const defaultSystemPrompt =
        'You are an expert LaTeX Resume Engineer and Career Copilot. If the user greets you (e.g. "hello", "hi") or asks general questions or advice, respond purely conversationally in the chat. Do NOT output any ```latex code block unless the user explicitly asks to edit, rewrite, tailor, update, or generate resume code.';

      const messages: any[] = [
        { role: 'system', content: systemPrompt || defaultSystemPrompt }
      ];

      if (currentLatex && currentLatex.trim()) {
        messages.push({
          role: 'user',
          content: `Current LaTeX document:\n\`\`\`latex\n${currentLatex}\n\`\`\``
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${byok.apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://saccade.langratia.com',
          'X-Title': 'Saccade Studio'
        },
        body: JSON.stringify({
          model: byok.model || 'openrouter/free',
          messages,
          stream: true
        })
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                finalize();
                return;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const deltaToken = parsed.choices?.[0]?.delta?.content || '';
                if (deltaToken) {
                  processChunk(deltaToken);
                }
              } catch {
                // Ignore partial frames
              }
            }
          }
        }

        finalize();
        return;
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMessage = errJson.error?.message || `HTTP ${res.status}`;
        console.warn('Direct OpenRouter streaming failed, falling back to backend:', errMessage);
      }
    } catch (err) {
      console.warn('Direct OpenRouter network exception, falling back to backend:', err);
    }
  }

  // 2. Backend streaming proxy fallback (/api/ai/stream)
  try {
    const res = await fetch(`${API_BASE}/api/ai/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        system_prompt: systemPrompt,
        provider: byok.provider,
        model: byok.model,
        api_key: byok.apiKey || undefined,
        current_latex: currentLatex
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      onError(`API returned HTTP ${res.status}: ${errText}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('ReadableStream not supported by browser body.');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.error) {
              onError(data.error);
              return;
            }
            if (data.done) {
              finalize();
              return;
            }
            if (data.token) {
              processChunk(data.token);
            }
          } catch {
            // Ignore partial frames
          }
        }
      }
    }

    finalize();
  } catch (err: any) {
    onError(err.message || 'Stream connection failed');
  }
}
