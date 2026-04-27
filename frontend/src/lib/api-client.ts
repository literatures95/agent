import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

class ApiClient {
  private baseUrl: string;
  private controller: AbortController;

  constructor(baseUrl = 'http://127.0.0.1:8000/api') {
    this.baseUrl = baseUrl;
    this.controller = new AbortController();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: this.controller.signal,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求已取消');
      }
      throw error;
    }
  }

  async chat(message: string, sessionId: string, options?: {
    withVoice?: boolean;
    onStream?: (chunk: string) => void;
  }) {
    const endpoint = options?.withVoice ? '/chat/voice' : '/chat';

    if (options?.onStream) {
      return this.streamChat(message, sessionId, options);
    }

    return this.request<ChatResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        with_voice: options?.withVoice,
      }),
    });
  }

  private async *streamChat(
    message: string,
    sessionId: string,
    options: { onStream: (chunk: string) => void }
  ) {
    const response = await fetch(`${this.baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
      signal: this.controller.signal,
    });

    if (!response.ok) {
      throw new Error('Stream 请求失败');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取数据流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const chunk = JSON.parse(data);
              options.onStream(chunk.content || '');
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getAudioUrl(filename: string): Promise<string> {
    return `${this.baseUrl}/audio/${filename}`;
  }

  async getLongMemory(): Promise<MemoryContent> {
    return this.request<MemoryContent>('/memory/long');
  }

  async getDailyMemory(): Promise<MemoryContent> {
    return this.request<MemoryContent>('/memory/daily');
  }

  async getSessions(): Promise<SessionsResponse> {
    return this.request<SessionsResponse>('/sessions');
  }

  async createSession(sessionId: string, name: string): Promise<{ message: string; session_id: string }> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, name }),
    });
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  cancel() {
    this.controller.abort();
    this.controller = new AbortController();
  }
}

// Types
export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  audio_file?: string;
}

export interface MemoryContent {
  content: string;
  date?: string;
}

export interface SessionsResponse {
  sessions: Record<string, Session>;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
}

export const api = new ApiClient();