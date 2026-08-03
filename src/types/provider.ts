// ─────────────────────────────────────────────────────────────────────────────
// Provider / API Layer Types
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderMode = 'mock' | 'live';

export interface ProviderConfig {
  mode: ProviderMode;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface ProviderResponse<T> {
  data: T;
  provider: string;
  cached: boolean;
  fetchedAt: string;
  latencyMs?: number;
  error?: string;
}

export interface ProviderError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
  statusCode?: number;
}

// Generic search result container
export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  currency: string;
  searchId: string;
  expiresAt?: string;
}

// MCP Tool definitions
export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPToolParameter[];
}

export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface MCPToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  callId: string;
  calledAt: string;
}

export interface MCPToolResult {
  callId: string;
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
  executionMs?: number;
}
