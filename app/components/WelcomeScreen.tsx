// components/WelcomeScreen.tsx
"use client";

interface WelcomeScreenProps {
  onSendMessage: (text: string) => void;
}

const starters = [
  { 
    icon: "fa-solid fa-list-check", 
    text: "Summarize the key points from my document",
    description: "Get a concise summary of the main ideas"
  },
  { 
    icon: "fa-solid fa-magnifying-glass", 
    text: "What are the main findings?",
    description: "Extract key discoveries and conclusions"
  },
  { 
    icon: "fa-solid fa-calendar-days", 
    text: "Extract all dates and deadlines mentioned",
    description: "Find time-sensitive information"
  },
  { 
    icon: "fa-solid fa-square-check", 
    text: "Create a list of action items",
    description: "Generate actionable tasks from content"
  },
];

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#818cf8] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <i className="fa-solid fa-file-lines text-white text-4xl"></i>
      </div>
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 font-['Syne',var(--font-syne)]">
        Chat with your <span className="bg-gradient-to-r from-[#60a5fa] to-[#818cf8] bg-clip-text text-transparent">documents</span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-[#94a3b8] text-center max-w-lg mb-10 text-base">
        Upload PDFs or text files and get instant, intelligent answers powered by LLMs.
      </p>
      
      {/* Starter questions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {starters.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(starter.text)}
            className="text-left p-4 bg-[#111620] border border-[rgba(148,163,184,0.1)] rounded-xl hover:bg-[#161d2a] hover:border-[rgba(59,130,246,0.3)] transition-all duration-200 group"
          >
            <i className={`${starter.icon} text-[#60a5fa] text-lg mb-2 block group-hover:scale-110 transition-transform`}></i>
            <div className="text-sm font-medium text-[#e2e8f0] mb-1">{starter.text}</div>
            <div className="text-xs text-[#546880]">{starter.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}