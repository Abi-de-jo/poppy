 
export interface ChatResponse {
  success: boolean;
  answer?: string;
  usedModel?: string;
  error?: string;
}

export async function callChatAPI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<{ answer: string; usedModel: string }> {
  try {
    console.log("Calling API with:", { systemPrompt: systemPrompt.slice(0, 100), messages });
    
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt, messages }),
    });

    const data: ChatResponse = await response.json();
    console.log("API Response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || `API call failed with status ${response.status}`);
    }

    if (!data.answer) {
      throw new Error("No answer received from API");
    }

    return { 
      answer: data.answer, 
      usedModel: data.usedModel || "unknown" 
    };
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}