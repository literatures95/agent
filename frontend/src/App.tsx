import { useState, useEffect } from 'react';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { MemoryViewer } from './components/MemoryViewer';
import { SettingsPanel } from './components/SettingsPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { api } from './lib/api';
import type { Message, Session } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({
    default: { id: 'default', name: '默认会话', created_at: new Date().toISOString() },
  });
  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryViewer, setShowMemoryViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    loadTheme();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('加载会话失败:', error);
    }
  };

  const loadTheme = () => {
    const settings = localStorage.getItem('amy-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      document.documentElement.classList.toggle('dark', parsed.theme === 'dark');
    }
  };

  const handleSend = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const settings = JSON.parse(localStorage.getItem('amy-settings') || '{}');
      const withVoice = settings.voiceEnabled !== false;

      const response = await api.chat(message, currentSessionId, withVoice);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.audio_file) {
        const audioUrl = await api.getAudioUrl(response.audio_file);
        setCurrentAudio(audioUrl);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    const newId = `session_${Date.now()}`;
    const name = `会话 ${Object.keys(sessions).length}`;

    try {
      await api.createSession(newId, name);
      await loadSessions();
      setCurrentSessionId(newId);
      setMessages([]);
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      await loadSessions();
      if (currentSessionId === sessionId) {
        setCurrentSessionId('default');
        setMessages([]);
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  const handleSessionChange = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionChange={handleSessionChange}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onViewMemory={() => setShowMemoryViewer(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} isLoading={isLoading} />
          {currentAudio && (
            <div className="p-2 border-t bg-muted">
              <AudioPlayer
                audioUrl={currentAudio}
                onEnd={() => setCurrentAudio(null)}
              />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>

      {showMemoryViewer && (
        <MemoryViewer onClose={() => setShowMemoryViewer(false)} />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;