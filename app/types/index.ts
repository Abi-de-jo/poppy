// types/index.ts
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  docsUsed?: string[];
  usedModel?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  projectId: string | null;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  timestamp: number;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  ext: string;
  status: "ready" | "processing" | "error";
  pages?: number | null;
  chars?: number;
}

export interface DocStoreItem {
  text: string;
  name: string;
}

export interface AppState {
  chats: Chat[];
  projects: Project[];
  documents: Document[];
  selectedDocuments: string[];
  activeChat: string | null;
}