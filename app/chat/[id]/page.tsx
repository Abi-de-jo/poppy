// app/chat/[id]/page.tsx
"use client";
 
import { useState, useEffect } from "react";
import { useApp } from "@/app/contexts/AppContext";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import ChatArea from "@/app/components/ChatArea";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { chats, activeChat, setActiveChat } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    const chatExists = chats.some((c) => c.id === params.id);
    if (chatExists) {
      setActiveChat(params.id);
    }
  }, [params.id, chats, setActiveChat]);

  useEffect(() => {
    const chatExists = chats.some((c) => c.id === params.id);
    if (!chatExists && chats.length > 0) {
      // Redirect to first chat or home
      window.location.href = "/";
    }
  }, [chats, params.id]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="sidebar-overlay" onClick={closeSidebar}></div>
      <main className="main-area">
        <Topbar onMenuClick={toggleSidebar} />
       </main>
    </div>
  );
}