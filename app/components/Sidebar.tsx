// components/Sidebar.tsx
"use client";

import { useState, useCallback } from "react";
import { useApp } from "@/app/contexts/AppContext";
import { randomChatName,  escapeHtml, formatSize, getExtension } from "@/app/lib/utils";
import { extractPdfText, extractTxtText } from "@/app/lib/pdf";
import ProjectModal from "./ProjectModal";
import { Chat, Document } from "@/app/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const {
    chats,
    projects,
    documents,
    selectedDocuments,
    activeChat,
    setActiveChat,
    addChat,
    deleteChat,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleDocumentSelection,
    getDocStore,
    setDocStore,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"chats" | "projects" | "docs">("chats");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateChat = (projectId: string | null = null) => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: randomChatName(),
      messages: [],
      projectId,
      timestamp: Date.now(),
    };
    addChat(newChat);
    setActiveChat(newChat.id);
    onClose();
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this chat?")) {
      deleteChat(id);
    }
  };

  // Working file upload function
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const ext = getExtension(file.name);
      
      // Check if file type is supported
      if (!['pdf', 'txt'].includes(ext)) {
        alert(`Sorry, ${ext.toUpperCase()} files are not supported. Please upload PDF or TXT files.`);
        continue;
      }

      // Create document object
      const doc: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: formatSize(file.size),
        ext,
        status: "processing",
      };

      // Add to state
      addDocument(doc);

      try {
        let result;
        
        // Extract text based on file type
        if (ext === 'pdf') {
          result = await extractPdfText(file);
        } else {
          result = await extractTxtText(file);
        }

        // Store extracted text
        setDocStore(doc.id, {
          text: result.text,
          name: file.name,
        });

        // Update document status
        updateDocument(doc.id, {
          status: "ready",
          pages: result.pages || undefined,
          chars: result.text.length,
        });

        // Auto-select the document
        toggleDocumentSelection(doc.id);

        console.log(`Successfully uploaded: ${file.name} (${result.text.length} characters)`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        updateDocument(doc.id, { status: "error" });
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }

    setIsUploading(false);
    e.target.value = ""; // Reset input
    
    // Show success message
    if (files.length > 0) {
      console.log(`Uploaded ${files.length} file(s)`);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const ext = getExtension(file.name);
      
      if (!['pdf', 'txt'].includes(ext)) {
        alert(`Sorry, ${ext.toUpperCase()} files are not supported. Please upload PDF or TXT files.`);
        continue;
      }

      const doc: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: formatSize(file.size),
        ext,
        status: "processing",
      };

      addDocument(doc);

      try {
        let result;
        
        if (ext === 'pdf') {
          result = await extractPdfText(file);
        } else {
          result = await extractTxtText(file);
        }

        setDocStore(doc.id, {
          text: result.text,
          name: file.name,
        });

        updateDocument(doc.id, {
          status: "ready",
          pages: result.pages || undefined,
          chars: result.text.length,
        });

        toggleDocumentSelection(doc.id);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        updateDocument(doc.id, { status: "error" });
      }
    }

    setIsUploading(false);
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const standaloneChats = chats.filter((c) => !c.projectId);
  const chatsByProject = projects.map((proj) => ({
    ...proj,
    chats: chats.filter((c) => c.projectId === proj.id),
  }));

  const iconMap: Record<string, string> = {
    pdf: "fa-file-pdf",
    txt: "fa-file-lines",
    xlsx: "fa-file-excel",
    docx: "fa-file-word",
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative top-0 left-0 bottom-0 w-[84vw] max-w-80
          bg-[#111620] border-r border-white/7
          flex flex-col z-30 transition-transform duration-250 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-[18px_16px_14px] border-b border-white/7 shrink-0">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#3b82f6] to-[#818cf8] rounded-[10px] flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.15)] shrink-0">
              <i className="fa-solid fa-file-lines text-white text-[15px]"></i>
            </div>
            <div className="font-['Syne',var(--font-syne)] text-[17px] font-extrabold tracking-[-0.4px] text-[#e2e8f0]">
              Doc<span className="bg-gradient-to-r from-[#60a5fa] to-[#818cf8] bg-clip-text text-transparent">Mind</span>
            </div>
          </div>
          <button 
            onClick={() => handleCreateChat(null)}
            className="w-full px-3.5 py-2.5 bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.3)] rounded-[10px] text-[#60a5fa] font-['DM_Sans',var(--font-dm-sans)] text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-[rgba(59,130,246,0.2)] hover:border-[#3b82f6] hover:-translate-y-px hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]"
          >
            <i className="fa-solid fa-plus"></i> New Chat
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-2.5 pt-2.5 gap-0.5 border-b border-white/7 shrink-0">
          {[
            { id: "chats", icon: "fa-regular fa-message", label: "Chats" },
            { id: "projects", icon: "fa-solid fa-layer-group", label: "Projects" },
            { id: "docs", icon: "fa-regular fa-file", label: "Upload" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex-1 py-2 px-1.5 pb-2.5 bg-transparent border-none rounded-t-sm
                text-[11.5px] font-medium cursor-pointer transition-all duration-200
                flex items-center justify-center gap-1.5 relative tracking-[0.1px]
                ${activeTab === tab.id 
                  ? 'text-[#60a5fa]' 
                  : 'text-[#546880] hover:text-[#94a3b8]'
                }
              `}
            >
              <i className={tab.icon}></i>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#3b82f6] rounded-t-[2px]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Chats Panel */}
          <div className={`h-full flex flex-col ${activeTab === "chats" ? "flex" : "hidden"}`}>
            <div className="flex-1 overflow-y-auto p-1.5">
              <div className="flex items-center justify-between pt-3.5 pb-1.5 px-2">
                <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#546880]">Recent Chats</span>
              </div>
              <div className="flex flex-col gap-1">
                {standaloneChats.length === 0 ? (
                  <div className="py-7 px-3.5 text-center text-[#546880] text-[12.5px] leading-relaxed">
                    <i className="fa-regular fa-comment-dots text-[22px] block mb-2 opacity-40"></i>
                    No chats yet.<br />Click "New Chat" to begin.
                  </div>
                ) : (
                  standaloneChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat.id);
                        onClose();
                      }}
                      className={`
                        flex items-center gap-2.5 p-2 border border-transparent rounded-[10px] cursor-pointer 
                        transition-all duration-180 relative w-full group
                        ${activeChat === chat.id 
                          ? 'bg-[#1e2738] border-white/12' 
                          : 'hover:bg-[#161d2a] hover:border-white/7'
                        }
                      `}
                    >
                      {activeChat === chat.id && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#3b82f6] rounded-r-[2px]" />
                      )}
                      <div className={`
                        w-[30px] h-[30px] rounded-sm flex items-center justify-center text-[13px] shrink-0
                        ${activeChat === chat.id 
                          ? 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa]' 
                          : 'bg-[#243044] text-[#94a3b8]'
                        }
                      `}>
                        <i className={`fa-regular ${chat.messages.length ? "fa-message" : "fa-sparkles"}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[12.5px] font-medium text-[#94a3b8] whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                            {escapeHtml(chat.title)}
                          </div>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="w-[22px] h-[22px] bg-transparent border-none rounded-[5px] text-[#546880] cursor-pointer flex items-center justify-center transition-all duration-150 text-[11px] hover:bg-[#243044] hover:text-[#fb7185] opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                        {chat.messages.length > 0 && (
                          <div className="text-[11px] text-[#546880] whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                            {escapeHtml(chat.messages[chat.messages.length - 1].content.slice(0, 38))}…
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Projects Panel */}
          <div className={`h-full flex flex-col ${activeTab === "projects" ? "flex" : "hidden"}`}>
            <div className="flex-1 overflow-y-auto p-1.5">
              <div className="flex items-center justify-between pt-3.5 pb-1.5 px-2">
                <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#546880]">Projects</span>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="w-[22px] h-[22px] bg-transparent border border-white/12 rounded-sm text-[#94a3b8] cursor-pointer flex items-center justify-center transition-all duration-200 text-[12px] hover:bg-[#1e2738] hover:border-white/20 hover:text-[#e2e8f0]"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              {projects.length === 0 ? (
                <div className="py-7 px-3.5 text-center text-[#546880] text-[12.5px] leading-relaxed">
                  <i className="fa-solid fa-folder-open text-[22px] block mb-2 opacity-40"></i>
                  No projects yet.<br />Click + to create one.
                </div>
              ) : (
                chatsByProject.map((proj) => (
                  <div key={proj.id} className="mb-1 rounded-[10px]">
                    <button
                      onClick={() => toggleProject(proj.id)}
                      className="flex items-center gap-2.5 p-2 bg-transparent border border-transparent rounded-[10px] cursor-pointer transition-all duration-180 w-full text-left font-['DM_Sans',var(--font-dm-sans)] text-inherit hover:bg-[#161d2a] hover:border-white/7"
                    >
                      <div 
                        className="w-[28px] h-[28px] rounded-sm flex items-center justify-center text-[13px] shrink-0"
                        style={{ background: `${proj.color}20`, color: proj.color }}
                      >
                        <i className={`fa-solid ${proj.icon}`}></i>
                      </div>
                      <div className="flex-1 text-[12.5px] font-medium text-[#e2e8f0] whitespace-nowrap overflow-hidden text-ellipsis">
                        {escapeHtml(proj.name)}
                      </div>
                      <div className="text-[10px] text-[#546880] bg-[#1e2738] py-0.5 px-2 rounded-[10px] shrink-0">
                        {proj.chats.length}
                      </div>
                      <i className={`fa-solid fa-chevron-right text-[#546880] transition-transform duration-200 text-[10px] shrink-0 ${expandedProjects.has(proj.id) ? 'rotate-90' : ''}`}></i>
                    </button>
                    <div className={`${expandedProjects.has(proj.id) ? 'block' : 'hidden'} py-0.5 pl-[18px]`}>
                      {proj.chats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            setActiveChat(chat.id);
                            onClose();
                          }}
                          className={`
                            flex items-center gap-2.5 p-2 border border-transparent rounded-[10px] cursor-pointer 
                            transition-all duration-180 relative w-full group
                            ${activeChat === chat.id 
                              ? 'bg-[#1e2738] border-white/12' 
                              : 'hover:bg-[#161d2a] hover:border-white/7'
                            }
                          `}
                        >
                          <div className="w-[30px] h-[30px] rounded-sm bg-[#243044] flex items-center justify-center text-[13px] shrink-0 text-[#94a3b8]">
                            <i className={`fa-regular ${chat.messages.length ? "fa-message" : "fa-sparkles"}`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[12.5px] font-medium text-[#94a3b8] whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                                {escapeHtml(chat.title)}
                              </div>
                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="w-[22px] h-[22px] bg-transparent border-none rounded-[5px] text-[#546880] cursor-pointer flex items-center justify-center transition-all duration-150 text-[11px] hover:bg-[#243044] hover:text-[#fb7185]"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={() => handleCreateChat(proj.id)}
                        className="flex items-center gap-2.5 p-2 border border-transparent rounded-[10px] cursor-pointer transition-all duration-180 w-full text-[11.5px] text-[#546880] hover:bg-[#161d2a] hover:border-white/7"
                      >
                        <div className="w-[30px] h-[30px] rounded-sm bg-[#243044] flex items-center justify-center text-[13px] shrink-0">
                          <i className="fa-solid fa-plus"></i>
                        </div>
                        <div className="flex-1">
                          <div className="text-[12.5px]">New chat in project</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents Panel with Working Upload */}
          <div className={`h-full flex flex-col ${activeTab === "docs" ? "flex" : "hidden"}`}>
            <div className="flex-1 overflow-y-auto p-1.5">
              <div className="flex items-center justify-between pt-3.5 pb-1.5 px-2">
                <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#546880]">Documents</span>
              </div>
              
              {/* Upload Zone */}
              <div 
                className="m-2 p-[22px_14px] border-2 border-dashed border-white/12 rounded-xl text-center cursor-pointer transition-all duration-200 relative hover:border-[#3b82f6] hover:bg-[rgba(59,130,246,0.12)]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <i className="fa-solid fa-cloud-arrow-up text-[26px] text-[#546880] mb-2.5 block"></i>
                <div className="text-[12.5px] text-[#94a3b8] mb-1">
                  <strong className="text-[#60a5fa] font-semibold">Click to upload</strong> or drag & drop
                </div>
                <div className="text-[10.5px] text-[#546880] mt-1.5">PDF · TXT</div>
                {isUploading && (
                  <div className="mt-3">
                    <i className="fa-solid fa-spinner fa-spin text-[#60a5fa]"></i>
                    <span className="text-xs text-[#94a3b8] ml-2">Uploading and processing...</span>
                  </div>
                )}
              </div>

              {/* Documents List */}
              <div className="flex flex-col gap-1.5 px-0.5">
                {documents.length === 0 ? (
                  <div className="py-7 px-3.5 text-center text-[#546880] text-[12.5px] leading-relaxed">
                    <i className="fa-regular fa-file-lines text-[22px] block mb-2 opacity-40"></i>
                    No documents uploaded yet
                  </div>
                ) : (
                  documents.map((doc) => {
                    const isSelected = selectedDocuments.includes(doc.id);
                    const isReady = doc.status === "ready";
                    const docStoreItem = getDocStore(doc.id);
                    const needsReupload = !docStoreItem && doc.status === "error";
                    return (
                      <div 
                        key={doc.id} 
                        className={`flex items-center gap-2.5 p-[10px_12px] bg-[#161d2a] border rounded-[10px] transition-all duration-180 ${isSelected ? 'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)]' : 'border-white/7 hover:border-white/12 hover:bg-[#1e2738]'}`}
                      >
                        <button
                          onClick={() => toggleDocumentSelection(doc.id)}
                          disabled={!isReady}
                          className={`
                            w-6 h-6 rounded-[7px] border flex items-center justify-center shrink-0 text-[11px] transition-all duration-150
                            ${isSelected 
                              ? 'bg-[#3b82f6] border-[#3b82f6] text-white' 
                              : 'border-white/12 bg-[#111620] text-[#546880] hover:border-[#3b82f6] hover:text-[#60a5fa]'
                            }
                            ${!isReady && 'opacity-40 cursor-not-allowed'}
                          `}
                        >
                          <i className={`fa-solid ${isSelected ? "fa-check" : "fa-plus"}`}></i>
                        </button>
                        <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-[13px] font-bold font-['Syne',var(--font-syne)] shrink-0 ${doc.ext === 'pdf' ? 'bg-[rgba(251,113,133,0.12)] text-[#fb7185]' : doc.ext === 'xlsx' ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]' : doc.ext === 'docx' ? 'bg-[rgba(56,189,248,0.1)] text-[#38bdf8]' : 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa]'}`}>
                          <i className={`fa-solid ${iconMap[doc.ext] || "fa-file"}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium text-[#e2e8f0] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
                            {escapeHtml(doc.name)}
                          </div>
                          <div className="text-[10.5px] text-[#546880]">
                            {doc.size}
                            {doc.pages && ` · ${doc.pages} pages`}
                            {doc.chars && ` · ${(doc.chars / 1000).toFixed(0)}k chars`}
                            {needsReupload && " · Re-upload needed"}
                          </div>
                          {doc.status === "processing" && (
                            <div className="mt-1 w-full h-0.5 bg-[#243044] rounded-full overflow-hidden">
                              <div className="h-full bg-[#fbbf24] rounded-full animate-pulse" style={{ width: "60%" }}></div>
                            </div>
                          )}
                        </div>
                        <div className={`text-[9.5px] font-semibold py-0.5 px-2 rounded-[10px] shrink-0 uppercase tracking-[0.4px] ${doc.status === 'ready' ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]' : doc.status === 'processing' ? 'bg-[rgba(251,191,36,0.1)] text-[#fbbf24]' : 'bg-[rgba(251,113,133,0.12)] text-[#fb7185]'}`}>
                          {doc.status}
                        </div>
                        <button 
                          onClick={() => deleteDocument(doc.id)} 
                          className="w-[26px] h-[26px] bg-transparent border-none rounded-sm text-[#546880] cursor-pointer flex items-center justify-center transition-all duration-150 shrink-0 text-[11px] opacity-0 group-hover:opacity-100 hover:bg-[rgba(251,113,133,0.12)] hover:text-[#fb7185]"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/7 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            <i className="fa-solid fa-user text-[12px]"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#e2e8f0]">User</div>
            <div className="text-[10.5px] text-[#546880]">
              <i className="fa-solid fa-circle-check" style={{ color: "#34d399", fontSize: "9px", marginRight: "3px" }}></i>
              OpenRouter
            </div>
          </div>
        </div>
      </aside>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </>
  );
}