import { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Volume2, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../../hooks/use-theme';
import { Tooltip } from '../ui/tooltip';
import { useNotifications } from '../../hooks/use-notifications';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { showSuccess } = useNotifications();

  const toggleMute = () => {
    showSuccess('语音已静音', '点击播放图标取消静音');
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center h-full px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center flex-1 justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="bg-primary text-primary-foreground">
              <span className="font-semibold">艾</span>
            </Avatar>
            <div>
              <h1 className="font-semibold text-lg">艾米</h1>
              <p className="text-xs text-muted-foreground">在线</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip content="语音控制">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="切换主题">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}