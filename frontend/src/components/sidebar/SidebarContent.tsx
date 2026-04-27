import { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, BookOpen, Settings, Plus, Trash2, Users } from 'lucide-react';
import type { Session } from '../../types';

interface SidebarContentProps {
  sessions: Session[];
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onViewMemory: () => void;
  onOpenSettings: () => void;
}

export function SidebarContent({
  sessions,
  currentSessionId,
  onSessionChange,
  onCreateSession,
  onDeleteSession,
  onViewMemory,
  onOpenSettings,
}: SidebarContentProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'memory'>('sessions');

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('sessions')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            会话
          </Button>
          <Button
            variant={activeTab === 'memory' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('memory')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            记忆
          </Button>
        </div>

        {activeTab === 'sessions' && (
          <Button onClick={onCreateSession} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新建会话
          </Button>
        )}

        {activeTab === 'memory' && (
          <Button onClick={onViewMemory} className="w-full" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            查看记忆
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {activeTab === 'sessions' && (
          <div className="p-2 space-y-1">
            {Object.values(sessions).map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                  currentSessionId === session.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSessionChange(session.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{session.name}</span>
                </div>
                {session.id !== 'default' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="p-4 space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">点击上方"查看记忆"按钮</p>
              <p className="text-xs text-muted-foreground mt-1">查看长期记忆和当日记忆</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
              <p>📝 每日记忆：记录当日对话内容</p>
              <p className="mt-1">🧠 长期记忆：累积的重要信息</p>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          设置
        </Button>
      </div>
    </div>
  );
}