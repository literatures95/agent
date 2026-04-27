import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { X } from 'lucide-react';
import { api } from '../lib/api';

interface MemoryViewerProps {
  onClose: () => void;
}

export function MemoryViewer({ onClose }: MemoryViewerProps) {
  const [activeTab, setActiveTab] = useState<'long' | 'daily'>('long');
  const [longMemory, setLongMemory] = useState('');
  const [dailyMemory, setDailyMemory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const [long, daily] = await Promise.all([
        api.getLongMemory(),
        api.getDailyMemory(),
      ]);
      setLongMemory(long.content);
      setDailyMemory(daily.content);
    } catch (error) {
      console.error('加载记忆失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[800px] h-[600px] bg-card rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">记忆查看器</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex border-b">
          <Button
            variant={activeTab === 'long' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('long')}
          >
            长期记忆
          </Button>
          <Button
            variant={activeTab === 'daily' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('daily')}
          >
            当日记忆
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              加载中...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {activeTab === 'long' ? longMemory || '暂无长期记忆' : dailyMemory || '暂无当日记忆'}
            </pre>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button onClick={loadMemories}>刷新记忆</Button>
        </div>
      </div>
    </div>
  );
}