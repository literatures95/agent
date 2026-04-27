import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = key === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const shiftMatch = shortcut.shift ? shiftKey : !shiftKey;
        const altMatch = shortcut.alt ? altKey : !altKey;
        const metaMatch = shortcut.meta ? metaKey : !metaKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}