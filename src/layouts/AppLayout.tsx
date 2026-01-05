import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NewNavbar } from '@/components/NewNavbar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showNavbar?: boolean;
  showSearch?: boolean;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = false,
  showNavbar = true,
  showSearch = true,
  className,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar */}
      {showNavbar && <NewNavbar showSearch={showSearch} />}

      {/* Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            showSidebar && 'ml-64',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
