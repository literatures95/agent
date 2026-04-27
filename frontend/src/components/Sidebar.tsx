import { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, BookOpen, Settings, Plus, Trash2 } from 'lucide-react';
import type { Session } from '../types';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onViewMemory: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSessionChange,
  onCreateSession,
  onDeleteSession,
  onViewMemory,
  onOpenSettings,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'memory'>('sessions');

  return (
    <div className="w-64 border-r bg-card flex flex-col">
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
          <div className="p-2">
            {Object.values(sessions).map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent group ${
                  currentSessionId === session.id ? 'bg-accent' : ''
                }`}
              >
                <div
                  className="flex-1 text-sm truncate"
                  onClick={() => onSessionChange(session.id)}
                >
                  {session.name}
                </div>
                {session.id !== 'default' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
          <div className="p-4 text-sm text-muted-foreground">
            <p>点击上方"查看记忆"按钮</p>
            <p className="mt-2">查看长期记忆和当日记忆</p>
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