// components/Topbar.tsx
"use client";

import { useApp } from "@/app/contexts/AppContext";
import { escapeHtml } from "@/app/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { chats, activeChat, projects } = useApp();
  const currentChat = chats.find((c) => c.id === activeChat);
  const project = currentChat?.projectId
    ? projects.find((p) => p.id === currentChat.projectId)
    : null;

  return (
    <div className="h-[58px] bg-[#111620] border-b border-[rgba(148,163,184,0.07)] px-[22px] flex items-center gap-3 flex-shrink-0 max-[900px]:px-3 max-[900px]:gap-2">
      <button 
        className="lg:hidden w-8 h-8 bg-transparent border border-[rgba(208, 65, 17, 0.07)] rounded-[10px] text-[#94a3b8] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-[#161d2a] hover:border-[rgba(148,163,184,0.12)] hover:text-[#e2e8f0] max-[900px]:w-[30px] max-[900px]:h-[30px]"
        title="Menu" 
        onClick={onMenuClick}
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      
      <div className="font-['Syne',var(--font-syne)] text-[15px] font-bold text-[#e2e8f0] flex-1 whitespace-nowrap overflow-hidden text-ellipsis max-[900px]:text-[14px]">
        {currentChat ? escapeHtml(currentChat.title) : "DocMind AI"}
      </div>
      
      {project && (
        <div className="flex items-center gap-1.5 py-1 px-2.5 bg-[#161d2a] border border-[rgba(148,163,184,0.07)] rounded-3xl text-[11px] text-[#94a3b8] flex-shrink-0 max-[900px]:hidden">
          <i className={`fa-solid ${project.icon}`} style={{ color: project.color, fontSize: "11px" }}></i>
          <span>{escapeHtml(project.name)}</span>
        </div>
      )}
    </div>
  );
}