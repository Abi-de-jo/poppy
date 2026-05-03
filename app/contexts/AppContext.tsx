// contexts/AppContext.tsx
"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useAppState } from "@/app/hooks/useAppState";
import { AppState, Chat, Project, Document, DocStoreItem } from "@/app/types";

interface AppContextValue extends AppState {
  setActiveChat: (id: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  toggleDocumentSelection: (docId: string) => void;
  getDocStore: (id: string) => DocStoreItem | undefined;
  setDocStore: (id: string, item: DocStoreItem) => void;
  deleteDocStore: (id: string) => void;
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  
  // Debug logging
  useEffect(() => {
    console.log("AppState updated:", {
      chats: appState.chats.length,
      activeChat: appState.activeChat,
      messages: appState.chats.find(c => c.id === appState.activeChat)?.messages.length
    });
  }, [appState.chats, appState.activeChat]);
  
  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}