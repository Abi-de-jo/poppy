// components/ChatArea.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/app/contexts/AppContext";
import { callChatAPI } from "@/app/lib/api";
import { Message, Chat } from "@/app/types";
import MessageList from "./MessageList";
import WelcomeScreen from "./WelcomeScreen";
import InputArea from "./InputArea";

interface ChatAreaProps {
  onOpenDocs: () => void;
}

export default function ChatArea({ onOpenDocs }: ChatAreaProps) {
  const {
    chats,
    activeChat,
    addChat,
    updateChat,
    documents,
    selectedDocuments,
    getDocStore,
  } = useApp();

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === activeChat);

  // Debug logging
  useEffect(() => {
    console.log("ChatArea Debug:", {
      activeChat,
      totalChats: chats.length,
      currentChat: currentChat?.id,
      messagesCount: currentChat?.messages.length,
      allChats: chats.map(c => ({ id: c.id, title: c.title, msgCount: c.messages.length }))
    });
  }, [activeChat, chats, currentChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };




  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isTyping]);

  const buildDocumentContext = (): string => {
    const selected = documents.filter(
      (d) => d.status === "ready" && selectedDocuments.includes(d.id) && getDocStore(d.id)
    );
    if (!selected.length) return "";

    let context = "";
    for (const doc of selected) {
      const docStoreItem = getDocStore(doc.id);
      if (!docStoreItem) continue;
      const text = docStoreItem.text;
      const remaining = 80000 - context.length;
      if (remaining <= 200) break;
      const snippet =
        text.length > remaining ? text.slice(0, remaining) + "\n[... content truncated ...]" : text;
      context += `\n\n=== Document: ${doc.name} ===\n${snippet}`;
    }
    return context.trim();
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    console.log("Sending message:", question);
    setError(null);

    // Create a new chat if none exists
    let chat = currentChat;
    if (!chat) {
      console.log("No active chat, creating new one...");
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        title: question.length > 42 ? question.slice(0, 42) + "…" : question,
        messages: [],
        projectId: null,
        timestamp: Date.now(),
      };
      addChat(newChat);
      chat = newChat;
      console.log("Created new chat:", newChat.id);
    }

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    const updatedMessages = [...(chat?.messages || []), userMessage];
    console.log("Updating chat with user message. New message count:", updatedMessages.length);
    updateChat(chat.id, { messages: updatedMessages });

    // Update title if first message
    if (updatedMessages.length === 1 && question.length > 42) {
      updateChat(chat.id, { title: question.slice(0, 42) + "…" });
    }

    // Start typing indicator
    setIsTyping(true);

    try {
      const docContext = buildDocumentContext();
      const systemPrompt = docContext
        ? `You are DocMind AI, an intelligent document assistant. Answer the user's questions based ONLY on the provided document content below. Be precise, cite relevant sections when helpful, and if the answer is not in the documents, say so clearly.\n\n${docContext}`
        : `You are DocMind AI, an intelligent assistant. No documents are currently selected. Help the user upload and select documents first, or answer general questions.`;

      const historyMessages = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log("Calling API...");
      const response = await callChatAPI(systemPrompt, historyMessages);

      console.log("API Response received:", response);

      const docsUsed = documents
        .filter((d) => d.status === "ready" && selectedDocuments.includes(d.id) && getDocStore(d.id))
        .map((d) => d.name);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer || "No response received.",
        docsUsed,
        usedModel: response.usedModel,
        timestamp: Date.now(),
      };

      console.log("Adding assistant message to chat");
      updateChat(chat.id, { messages: [...updatedMessages, assistantMessage] });
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ Error: ${error instanceof Error ? error.message : "Unknown error occurred. Please try again."}`,
        timestamp: Date.now(),
      };
      updateChat(chat.id, { messages: [...updatedMessages, errorMessage] });
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsTyping(false);
    }
  };

  const showWelcome = !currentChat || currentChat.messages.length === 0;
  console.log("Show welcome:", showWelcome, "Current chat:", currentChat?.id, "Messages:", currentChat?.messages.length);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full">
          {showWelcome ? (
            <WelcomeScreen onSendMessage={sendMessage} />
          ) : (
            <>
              <MessageList messages={currentChat?.messages || []} />

              {isTyping && (
                <div className="max-w-3xl mx-auto px-4 py-2">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
                        <i className="fa-solid fa-robot text-white text-xs"></i>
                      </div>
                    </div>
                    <div className="bg-[#111620] border border-[rgba(148,163,184,0.07)] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#546880] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#546880] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-[#546880] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="max-w-3xl mx-auto px-4 py-2">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <InputArea onSendMessage={sendMessage} onOpenDocs={onOpenDocs} />
    </>
  );
}