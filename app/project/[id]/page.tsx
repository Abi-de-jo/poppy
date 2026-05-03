// app/project/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/app/contexts/AppContext";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import ChatArea from "@/app/components/ChatArea";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projects, chats, activeChat, setActiveChat } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const project = projects.find((p) => p.id === params.id);
  const projectChats = chats.filter((c) => c.projectId === params.id);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (projectChats.length > 0 && !activeChat) {
      setActiveChat(projectChats[0].id);
    }
  }, [projectChats, activeChat, setActiveChat]);

  if (!project) {
    notFound();
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="sidebar-overlay" onClick={closeSidebar}></div>
      <main className="main-area">
        <Topbar onMenuClick={toggleSidebar} />
        <ChatArea onOpenDocs={closeSidebar} />
      </main>
    </div>
  );
}