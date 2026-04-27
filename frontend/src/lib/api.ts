import type { ChatResponse, Session, MemoryContent } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export class ApiClient {
  async chat(message: string, sessionId: string, withVoice: boolean = false): Promise<ChatResponse> {
    const endpoint = withVoice ? `${API_BASE}/chat/voice` : `${API_BASE}/chat`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId, with_voice: withVoice }),
    });
    if (!response.ok) throw new Error('API 请求失败');
    return response.json();
  }

  async getAudioUrl(filename: string): Promise<string> {
    return `${API_BASE}/audio/${filename}`;
  }

  async getLongMemory(): Promise<MemoryContent> {
    const response = await fetch(`${API_BASE}/memory/long`);
    if (!response.ok) throw new Error('获取长期记忆失败');
    return response.json();
  }

  async getDailyMemory(): Promise<MemoryContent> {
    const response = await fetch(`${API_BASE}/memory/daily`);
    if (!response.ok) throw new Error('获取每日记忆失败');
    return response.json();
  }

  async getSessions(): Promise<{ sessions: Record<string, Session> }> {
    const response = await fetch(`${API_BASE}/sessions`);
    if (!response.ok) throw new Error('获取会话列表失败');
    return response.json();
  }

  async createSession(sessionId: string, name: string): Promise<{ message: string; session_id: string }> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, name }),
    });
    if (!response.ok) throw new Error('创建会话失败');
    return response.json();
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除会话失败');
    return response.json();
  }
}

export const api = new ApiClient();