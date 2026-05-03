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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) setIsSidebarOpen(true);
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#0b0f14] overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Overlay (mobile) */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={closeSidebar}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* ✅ FIXED TOPBAR */}
        <div className="sticky top-0 z-50">
          <Topbar onMenuClick={toggleSidebar} />
        </div>

        {/* ✅ CHAT AREA SCROLL ONLY */}
        <div className="flex-1 overflow-hidden">
          <ChatArea onOpenDocs={closeSidebar} />
        </div>

      </main>
    </div>
  );
}