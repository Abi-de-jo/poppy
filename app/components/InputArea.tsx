// components/InputArea.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/app/contexts/AppContext";

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  onOpenDocs: () => void;
}

export default function InputArea({ onSendMessage, onOpenDocs }: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { documents, selectedDocuments, getDocStore } = useApp();

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
    setTimeout(() => autoResize(), 0);
  };

  const selectedReadyDocs = documents.filter(
    (d) => d.status === "ready" && selectedDocuments.includes(d.id) && getDocStore(d.id)
  );

  const iconMap: Record<string, string> = {
    pdf: "fa-file-pdf",
    txt: "fa-file-lines",
    xlsx: "fa-file-excel",
    docx: "fa-file-word",
  };

  return (
    <div className="border-t border-[rgba(148,163,184,0.07)] bg-[#0b0f14] p-4">
      <div className="max-w-3xl mx-auto">
        {/* Selected documents chips */}
        {selectedReadyDocs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-1">
            {selectedReadyDocs.map((doc) => (
              <div 
                key={doc.id} 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                  doc.ext === 'pdf' ? 'bg-[rgba(251,113,133,0.1)] text-[#fb7185]' : 
                  doc.ext === 'xlsx' ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]' : 
                  doc.ext === 'docx' ? 'bg-[rgba(56,189,248,0.1)] text-[#38bdf8]' : 
                  'bg-[rgba(59,130,246,0.1)] text-[#60a5fa]'
                }`}
              >
                <i className={`fa-solid ${iconMap[doc.ext] || "fa-file"} text-xs`}></i>
                <span className="max-w-[150px] truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Input container */}
        <div className="bg-[#111620] rounded-xl border border-[rgba(148,163,184,0.1)] focus-within:border-[#3b82f6] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all">
          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask anything about your documents…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] text-sm leading-relaxed resize-none max-h-32 placeholder:text-[#546880] font-['DM_Sans',var(--font-dm-sans)]"
            />
            
            <div className="flex gap-1.5">
              <button
                onClick={onOpenDocs}
                className="w-9 h-9 rounded-lg bg-[#161d2a] border border-[rgba(148,163,184,0.1)] text-[#94a3b8] hover:bg-[#1e2738] hover:text-[#e2e8f0] transition-all"
                title="Upload documents"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3b82f6]"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#546880]">
          <i className="fa-solid fa-shield-halved text-[#34d399] text-xs"></i>
          <span>Answers grounded in your uploaded documents · Powered by LLM's</span>
        </div>
      </div>
    </div>
  );
}