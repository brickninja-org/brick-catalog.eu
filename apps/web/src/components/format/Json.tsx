import type { FC, ReactNode } from 'react';

import { Code } from '@/components/layout/Code';

export interface JsonProps {
  data: object,
  borderless?: boolean,
}

const ELLIPSIS_TOKEN = '__JSON_PREVIEW_ELLIPSIS__';
const tokenPattern = /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|\b(true|false)\b|\bnull\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])/g;

function renderJsonLine(line: string): ReactNode {
  const segments: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > cursor) {
      segments.push(line.slice(cursor, matchIndex));
    }

    const [token, key, str, bool, num, punct] = match;

    if (key) {
      segments.push(<span key={`${matchIndex}-k`} className="text-primary">{token}</span>);
    } else if (str) {
      segments.push(<span key={`${matchIndex}-s`} className="text-accent">{token}</span>);
    } else if (bool) {
      segments.push(<span key={`${matchIndex}-b`} className="text-warning">{token}</span>);
    } else if (num) {
      segments.push(<span key={`${matchIndex}-n`} className="text-danger">{token}</span>);
    } else if (punct) {
      segments.push(<span key={`${matchIndex}-p`} className="text-muted">{token}</span>);
    } else {
      segments.push(token);
    }

    cursor = matchIndex + token.length;
  }

  if (cursor < line.length) {
    segments.push(line.slice(cursor));
  }

  return segments.length > 0 ? segments : line;
}

export const Json: FC<JsonProps> = ({ data, borderless = false }) => {
  const prepared = truncateLargeArrays(data);
  const raw = JSON.stringify(prepared, null, 2)
    .replaceAll(`"${ELLIPSIS_TOKEN}"`, '...');
  const lines = raw
    .split('\n')
    .map(renderJsonLine);

  return (
    <Code borderless={borderless} lines={lines} showLineNumbers={false}/>
  );
};

function truncateLargeArrays(value: unknown): unknown {
  if (Array.isArray(value)) {
    const processed = value.map(truncateLargeArrays);

    if (processed.length > 10) {
      return [
        ...processed.slice(0, 3),
        ELLIPSIS_TOKEN,
        ...processed.slice(-3),
      ];
    }

    return processed;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, truncateLargeArrays(nestedValue)]),
    );
  }

  return value;
}
