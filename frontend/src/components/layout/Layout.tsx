import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from '../Sidebar';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          sessions={{
            default: { id: 'default', name: '默认会话', created_at: new Date().toISOString() },
            // 会话数据从 props 传递，这里简化处理
          }}
          currentSessionId="default"
          onSessionChange={() => {}}
          onCreateSession={() => {}}
          onDeleteSession={() => {}}
          onViewMemory={() => {}}
          onOpenSettings={() => {}}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}