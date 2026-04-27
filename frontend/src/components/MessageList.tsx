import { useEffect, useRef, useState, memo } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { AlertIcon } from './ui/alert';
import { Card } from './ui/card';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
}

const MessageList = memo(({ messages, isLoading, error }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertIcon variant="destructive" />
            <AlertTitle>发送失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Card className="max-w-sm p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">你好，我是艾米</h3>
              <p className="text-sm text-muted-foreground">
                我是一个 AI 助手，可以回答问题、提供帮助或陪你聊天。
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>💡 提示：输入消息开始对话</p>
                <p className="mt-1">🔊 支持语音播放</p>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isLoading && index === messages.length - 1}
            />
          ))}
        </div>

        {isLoading && messages.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm text-muted-foreground">艾米正在思考...</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {messages.length > 0 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground text-center">
            {autoScroll ? '📍 滚动到底部' : '⬆️ 滚动以查看最新消息'}
          </div>
        </div>
      )}
    </div>
  );
}