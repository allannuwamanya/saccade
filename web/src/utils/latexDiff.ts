export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  oldNum?: number;
  newNum?: number;
}

export interface LatexToken {
  type: 'command' | 'comment' | 'math' | 'brace' | 'bracket' | 'text';
  text: string;
}

/**
 * Tokenizes a single LaTeX line into syntax-highlighted tokens.
 */
export function tokenizeLatex(line: string): LatexToken[] {
  if (line.trim().startsWith('%')) {
    return [{ type: 'comment', text: line }];
  }

  const regex = /(\\[a-zA-Z*]+|%[^\n]*|\$[^\$]+\$|\{|\}|\[|\])/g;
  let lastIndex = 0;
  const tokens: LatexToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: line.substring(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('\\')) {
      tokens.push({ type: 'command', text: token });
    } else if (token.startsWith('%')) {
      tokens.push({ type: 'comment', text: token });
    } else if (token.startsWith('$')) {
      tokens.push({ type: 'math', text: token });
    } else if (token === '{' || token === '}') {
      tokens.push({ type: 'brace', text: token });
    } else if (token === '[' || token === ']') {
      tokens.push({ type: 'bracket', text: token });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'text', text: line.substring(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', text: line }];
}

/**
 * Computes a line-by-line unified diff between oldStr and newStr.
 */
export function computeLatexDiff(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const n = oldLines.length;
  const m = newLines.length;

  // LCS Dynamic Programming table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({ type: 'unchanged', text: oldLines[i - 1], oldNum: i, newNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', text: newLines[j - 1], newNum: j });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.push({ type: 'removed', text: oldLines[i - 1], oldNum: i });
      i--;
    }
  }

  return result.reverse();
}
