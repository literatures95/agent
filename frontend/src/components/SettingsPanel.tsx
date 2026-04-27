import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { X, Moon, Sun } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

interface Settings {
  voiceEnabled: boolean;
  voiceSpeed: number;
  voice: string;
  theme: 'light' | 'dark';
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>({
    voiceEnabled: true,
    voiceSpeed: 0,
    voice: 'zh-CN-XiaoxiaoNeural',
    theme: 'light',
  });

  useEffect(() => {
    const saved = localStorage.getItem('amy-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('amy-settings', JSON.stringify(settings));

    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    onClose();
  };

  const voices = [
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓（女）' },
    { value: 'zh-CN-XiaoyiNeural', label: '晓伊（女）' },
    { value: 'zh-CN-YunxiNeural', label: '云希（女）' },
    { value: 'zh-CN-YunjianNeural', label: '云健（男）' },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[600px] max-h-[80vh] bg-card rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">设置</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">界面主题</h3>
            <div className="flex gap-2">
              <Button
                variant={settings.theme === 'light' ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, theme: 'light' })}
              >
                <Sun className="h-4 w-4 mr-2" />
                浅色
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
              >
                <Moon className="h-4 w-4 mr-2" />
                深色
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">语音设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">启用语音</label>
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => setSettings({ ...settings, voiceEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="text-sm block mb-2">语音选择</label>
                <select
                  value={settings.voice}
                  onChange={(e) => setSettings({ ...settings, voice: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {voices.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm block mb-2">语速: {settings.voiceSpeed}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({ ...settings, voiceSpeed: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}