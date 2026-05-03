// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_CONFIGS = [
  { key: process.env.Model_1, model: "openai/gpt-4o" },
  { key: process.env.Model_2, model: "openai/gpt-4o" },
  { key: process.env.Model_3, model: "openai/gpt-4o" },
  { key: process.env.Model_4, model: "openai/gpt-4o" },
];

const FALLBACK_STATUS_CODES = new Set([429, 402, 503, 401, 403]);
const FALLBACK_ERROR_SNIPPETS = [
  "rate limit",
  "quota",
  "limit exceeded",
  "insufficient",
  "no endpoints",
  "overloaded",
];

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, messages } = await request.json();

    const validConfigs = API_CONFIGS.filter(
      (c) => c.key && c.key.startsWith("sk-") && !c.key.includes("PASTE")
    );

    if (validConfigs.length === 0) {
      console.error("No valid API keys found. Please check your environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: No API keys available" },
        { status: 500 }
      );
    }

    let answer: string | null = null;
    let lastError: string | null = null;
 
    // Try each API key in order
    for (let i = 0; i < validConfigs.length; i++) {
      const cfg = validConfigs[i];
      console.log(`Attempting with API key ${i + 1}/${validConfigs.length}, model: ${cfg.model}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfg.key}`,
            "Content-Type": "application/json",
            "X-Title": "DocMind AI",
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 2048,
            temperature: 0.3,
            model: cfg.model,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          const errMsg = (data.error?.message || `API error ${response.status}`).toLowerCase();
          console.warn(`API key ${i + 1} failed with status ${response.status}: ${errMsg}`);
          
          const shouldFallback =
            FALLBACK_STATUS_CODES.has(response.status) ||
            FALLBACK_ERROR_SNIPPETS.some((s) => errMsg.includes(s));

          if (shouldFallback && i < validConfigs.length - 1) {
            lastError = `Key ${i + 1} (${cfg.model}): ${data.error?.message || response.status}`;
            console.log(`Falling back to next key...`);
            continue;
          }
          throw new Error(data.error?.message || `API error ${response.status}`);
        }

        answer = data.choices?.[0]?.message?.content || "No answer returned.";
         console.log(`Successfully used API key ${i + 1} with model ${cfg.model}`);
        break;
      } catch (fetchErr) {
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          console.warn(`API key ${i + 1} timed out`);
          lastError = `Key ${i + 1} (${cfg.model}): Request timeout`;
        } else if (i < validConfigs.length - 1) {
          lastError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          console.warn(`Key ${i + 1} failed, trying next →`, lastError);
          continue;
        } else {
          throw fetchErr;
        }
      }
    }

    if (!answer) {
      throw new Error(`All API keys exhausted. Last error: ${lastError}`);
    }

    return NextResponse.json({ 
      success: true, 
      answer, 
     });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}