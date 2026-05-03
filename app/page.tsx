// app/page.tsx - Add debug info
"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/contexts/AppContext";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import ChatArea from "@/app/components/ChatArea";

export default function Home() {
  const { chats, activeChat } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Debug info
  const currentChat = chats.find(c => c.id === activeChat);
  console.log("Main page - Active chat:", activeChat, "Messages:", currentChat?.messages.length);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f14]">
      {/* Debug button - remove in production */}




      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={closeSidebar}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar onMenuClick={toggleSidebar} />
        <ChatArea onOpenDocs={closeSidebar} />
      </main>
    </div>
  );
}