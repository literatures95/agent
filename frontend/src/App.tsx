import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Layout } from './components/layout/Layout';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { NotificationsProvider } from './components/NotificationsProvider';
import { useTheme } from './hooks/use-theme';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { api } from './lib/api-client';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Message, Session } from './types';

// Lazy load heavy components
const MemoryViewer = lazy(() => import('./components/MemoryViewer'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer'));

function App() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({
    default: { id: 'default', name: '默认会话', created_at: new Date().toISOString() },
  });
  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMemoryViewer, setShowMemoryViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('加载会话失败:', error);
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
    setError(null);

    try {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const settings = JSON.parse(localStorage.getItem('amy-settings') || '{}');
      const withVoice = settings.voiceEnabled !== false;

      const response = await api.chat(message, currentSessionId, {
        withVoice,
        onStream: (chunk: string) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return prev.map((m) =>
                m.id === lastMessage.id
                  ? { ...m, content: m.content + chunk }
                  : m
              );
            }
            return [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant' as const,
                content: chunk,
                timestamp: new Date().toISOString(),
              },
            ];
          });
        },
      });

      // 流式响应完成后，更新最终消息
      setMessages((prev) => {
        const lastUser = prev[prev.length - 2];
        const lastAssistant = prev[prev.length - 1];

        if (lastAssistant && lastAssistant.role === 'assistant') {
          return prev.map((m) =>
            m.id === lastAssistant.id
              ? { ...m, content: response.response, timestamp: response.timestamp }
              : m
          );
        }
        return prev;
      });

      if (response.audio_file) {
        const audioUrl = await api.getAudioUrl(response.audio_file);
        setCurrentAudio(audioUrl);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已取消');
      } else {
        console.error('发送消息失败:', error);
        setError('发送消息失败，请重试');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        handleCreateSession();
      },
    },
    {
      key: 'm',
      ctrl: true,
      action: () => {
        setShowMemoryViewer(true);
      },
    },
    {
      key: ',',
      ctrl: true,
      action: () => {
        setShowSettings(true);
      },
    },
    {
      key: 'Escape',
      action: () => {
        if (isLoading) {
          handleCancel();
        }
        if (showMemoryViewer) {
          setShowMemoryViewer(false);
        }
        if (showSettings) {
          setShowSettings(false);
        }
      },
    },
  ]);

  return (
    <ErrorBoundary>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <NotificationsProvider />
        <Layout>
          <div className="flex-1 flex flex-col h-full">
            <MessageList messages={messages} isLoading={isLoading} error={error} />
            {currentAudio && (
              <div className="p-2 border-t bg-muted">
                <Suspense fallback={<div className="p-2 text-center text-sm text-muted-foreground">加载音频播放器...</div>}>
                  <AudioPlayer
                    audioUrl={currentAudio}
                    onEnd={() => setCurrentAudio(null)}
                  />
                </Suspense>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 pb-4">
            <div className="flex-1">
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
            {isLoading && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </Layout>

        <Suspense fallback={<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-lg">加载中...</div>
        </div>}>
          {showMemoryViewer && (
            <MemoryViewer onClose={() => setShowMemoryViewer(false)} />
          )}

          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;