import React from 'react';
import { ChatbotSidebar } from './ChatbotSidebar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ResizablePanels';
import { useChatbot } from '@/contexts/ChatbotContext';

export const GlobalChatbotSidebar: React.FC = () => {
  const { isOpen } = useChatbot();
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 right-0 h-full z-[99999] w-full pointer-events-none">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Invisible spacer panel that grows/shrinks */}
        <ResizablePanel defaultSize={75} minSize={0} maxSize={95} className="pointer-events-none" />
        <ResizableHandle 
          withHandle 
          className="w-2 bg-gradient-to-b from-emerald-500/20 via-teal-500/20 to-emerald-500/20 hover:bg-gradient-to-b hover:from-emerald-500/40 hover:via-teal-500/40 hover:to-emerald-500/40 transition-colors border-l border-white/40 flex items-center justify-center cursor-col-resize pointer-events-auto backdrop-blur-sm touch-pan-x"
          style={{ 
            touchAction: 'pan-x',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        />
        <ResizablePanel 
          defaultSize={25} 
          minSize={5} 
          maxSize={100}
          className="min-w-[280px] sm:min-w-[320px] pointer-events-auto h-full"
        >
          <div className="h-full w-full flex flex-col shadow-2xl relative bg-background/95 backdrop-blur-xl border-l border-border/20">
            <div className="relative flex flex-col h-full w-full">
              <ChatbotSidebar />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}; 