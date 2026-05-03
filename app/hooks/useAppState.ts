// hooks/useAppState.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { AppState, Chat, Project, Document, DocStoreItem } from "@/app/types";

const STORAGE_KEY = "docmind_v3";
const DOC_STORE_KEY = "docmind_docs_v3";

interface UseAppStateReturn extends AppState {
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

export function useAppState(): UseAppStateReturn {
  const [state, setState] = useState<AppState>({
    chats: [],
    projects: [],
    documents: [],
    selectedDocuments: [],
    activeChat: null,
  });

  const [docStore, setDocStore] = useState<Record<string, DocStoreItem>>({});

  // Load from localStorage on mount
  useEffect(() => {
    console.log("Loading from localStorage...");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("Loaded state:", parsed);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    const savedDocs = localStorage.getItem(DOC_STORE_KEY);
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        setDocStore(parsed);
      } catch (e) {
        console.error("Failed to parse doc store", e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    console.log("Saving state to localStorage:", state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(DOC_STORE_KEY, JSON.stringify(docStore));
  }, [docStore]);

  const setActiveChat = useCallback((id: string | null) => {
    console.log("Setting active chat to:", id);
    setState((prev) => ({ ...prev, activeChat: id }));
  }, []);

  const addChat = useCallback((chat: Chat) => {
    console.log("Adding chat:", chat);
    setState((prev) => ({ ...prev, chats: [chat, ...prev.chats], activeChat: chat.id }));
  }, []);

  const updateChat = useCallback((id: string, updates: Partial<Chat>) => {
    console.log("Updating chat:", id, updates);
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteChat = useCallback((id: string) => {
    console.log("Deleting chat:", id);
    setState((prev) => ({
      ...prev,
      chats: prev.chats.filter((c) => c.id !== id),
      activeChat: prev.activeChat === id ? prev.chats[0]?.id || null : prev.activeChat,
    }));
  }, []);

  const addProject = useCallback((project: Project) => {
    console.log("Adding project:", project);
    setState((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      chats: prev.chats.map((c) =>
        c.projectId === id ? { ...c, projectId: null } : c
      ),
    }));
  }, []);

  const addDocument = useCallback((doc: Document) => {
    console.log("Adding document:", doc);
    setState((prev) => ({ ...prev, documents: [doc, ...prev.documents] }));
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    console.log("Deleting document:", id);
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
      selectedDocuments: prev.selectedDocuments.filter((sid) => sid !== id),
    }));
    setDocStore((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const toggleDocumentSelection = useCallback((docId: string) => {
    setState((prev) => {
      const exists = prev.selectedDocuments.includes(docId);
      return {
        ...prev,
        selectedDocuments: exists
          ? prev.selectedDocuments.filter((id) => id !== docId)
          : [...prev.selectedDocuments, docId],
      };
    });
  }, []);

  const getDocStore = useCallback(
    (id: string) => docStore[id],
    [docStore]
  );

  const setDocStoreItem = useCallback((id: string, item: DocStoreItem) => {
    console.log("Setting doc store:", id, item.name);
    setDocStore((prev) => ({ ...prev, [id]: item }));
  }, []);

  const deleteDocStore = useCallback((id: string) => {
    setDocStore((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAll = useCallback(() => {
    setState({
      chats: [],
      projects: [],
      documents: [],
      selectedDocuments: [],
      activeChat: null,
    });
    setDocStore({});
  }, []);

  return {
    ...state,
    setActiveChat,
    addChat,
    updateChat,
    deleteChat,
    addProject,
    deleteProject,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleDocumentSelection,
    getDocStore,
    setDocStore: setDocStoreItem,
    deleteDocStore,
    clearAll,
  };
}