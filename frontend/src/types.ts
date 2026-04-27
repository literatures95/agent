export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
}

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