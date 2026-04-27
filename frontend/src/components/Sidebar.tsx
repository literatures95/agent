import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, BookOpen, Settings, Plus, Trash2 } from 'lucide-react';
import type { Session } from '../types';
import { SidebarContent } from './sidebar/SidebarContent';

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
  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <SidebarContent
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionChange={onSessionChange}
        onCreateSession={onCreateSession}
        onDeleteSession={onDeleteSession}
        onViewMemory={onViewMemory}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}