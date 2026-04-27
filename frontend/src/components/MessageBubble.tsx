import { MarkdownRenderer } from './MarkdownRenderer';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble = React.memo(({ message, isStreaming = false }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-200 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-3">
          {!isUser && (
            <Avatar className="bg-primary text-primary-foreground flex-shrink-0">
              <span className="font-semibold text-xs">艾</span>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            <MarkdownRenderer content={message.content} />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {isStreaming && !isUser && (
                <Badge variant="secondary" className="text-xs">
                  生成中...
                </Badge>
              )}
            </div>
          </div>

          {isUser && (
            <Avatar className="bg-muted text-muted-foreground flex-shrink-0">
              <span className="font-semibold text-xs">你</span>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}