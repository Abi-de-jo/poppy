// components/MessageList.tsx
"use client";

import { Message } from "@/app/types";
import { escapeHtml } from "@/app/lib/utils";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user"
                ? "bg-gradient-to-br from-[#60a5fa] to-[#818cf8]"
                : "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]"
            }`}>
              {msg.role === "user" ? (
                <i className="fa-solid fa-user text-white text-xs"></i>
              ) : (
                <i className="fa-solid fa-robot text-white text-xs"></i>
              )}
            </div>
          </div>
          
          {/* Message content */}
          <div className={`flex-1 ${msg.role === "user" ? "flex justify-end" : ""}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-[#3b82f6] text-white rounded-br-md"
                  : "bg-[#111620] border border-[rgba(148,163,184,0.07)] text-[#e2e8f0] rounded-bl-md"
              }`}>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
                
 
                
                {/* Document sources */}
                {msg.docsUsed && msg.docsUsed.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] text-xs text-[#94a3b8]">
                    <i className="fa-solid fa-paperclip text-[10px]"></i>
                    <span className="truncate">{msg.docsUsed.map(d => escapeHtml(d)).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}