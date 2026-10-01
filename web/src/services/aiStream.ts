import { ByokService } from './byok';

export interface StreamOptions {
  prompt: string;
  systemPrompt?: string;
  currentLatex?: string;
  onToken: (token: string) => void;
  onLatexChunk?: (latex: string) => void;
  onError: (error: string) => void;
  onDone: (fullText: string) => void;
}

export async function streamAiGeneration(options: StreamOptions): Promise<void> {
  const { prompt, systemPrompt, currentLatex, onToken, onLatexChunk, onError, onDone } = options;
  const byok = ByokService.getConfig();

  try {
    const res = await fetch('/api/ai/stream', {
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
    let accumulatedText = '';
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
              // Extraction of LaTeX block if present
              extractLatexIfPresent(accumulatedText, onLatexChunk);
              onDone(accumulatedText);
              return;
            }
            if (data.token) {
              accumulatedText += data.token;
              onToken(data.token);
              // Check if currently inside a latex code fence
              extractLatexIfPresent(accumulatedText, onLatexChunk);
            }
          } catch (e) {
            // Ignore parse errors on partial frames
          }
        }
      }
    }

    extractLatexIfPresent(accumulatedText, onLatexChunk);
    onDone(accumulatedText);
  } catch (err: any) {
    onError(err.message || 'Stream connection failed');
  }
}

function extractLatexIfPresent(text: string, callback?: (latex: string) => void) {
  if (!callback) return;

  // Match ```latex ... ``` or ``` ... ``` containing \documentclass
  const latexBlockMatch = text.match(/```(?:latex)?\s*([\s\S]*?)(?:```|$)/i);
  if (latexBlockMatch && latexBlockMatch[1]) {
    const rawLatex = latexBlockMatch[1].trim();
    if (rawLatex.includes('\\documentclass') || rawLatex.includes('\\begin{document}')) {
      callback(rawLatex);
    }
  } else if (text.includes('\\documentclass') && text.includes('\\begin{document}')) {
    callback(text.trim());
  }
}
