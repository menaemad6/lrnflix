
import React from "react";
import { Brain, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSettingsSidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardSettingsSidebar: React.FC<DashboardSettingsSidebarProps> = ({ activeTab, onTabChange }) => (
  <aside className="w-full lg:w-64 lg:min-w-[220px] h-fit bg-card border border-border rounded-2xl shadow-xl p-4 mt-2 lg:sticky lg:top-24">
    <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
      <button
        onClick={() => onTabChange?.("ai-assistant")}
        className={cn(
          "group flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-sm lg:text-base font-medium transition-all w-full text-center lg:text-left whitespace-nowrap lg:whitespace-normal",
          activeTab === "ai-assistant"
            ? "bg-gradient-to-r from-primary to-primary-400 text-primary-foreground shadow"
            : "hover:bg-accent"
        )}
      >
        <Brain className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>
      
      <button
        onClick={() => onTabChange?.("announcements")}
        className={cn(
          "group flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-sm lg:text-base font-medium transition-all w-full text-center lg:text-left whitespace-nowrap lg:whitespace-normal",
          activeTab === "announcements"
            ? "bg-gradient-to-r from-primary to-primary-400 text-primary-foreground shadow"
            : "hover:bg-accent"
        )}
      >
        <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
        <span className="hidden sm:inline">Announcements</span>
      </button>
    </nav>
  </aside>
);
