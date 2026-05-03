// lib/utils.ts
export const PROJECT_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
];

export const PROJECT_ICONS = [
  "fa-folder",
  "fa-briefcase",
  "fa-book",
  "fa-chart-line",
  "fa-database",
  "fa-code",
  "fa-flask",
  "fa-lightbulb",
  "fa-rocket",
  "fa-star",
  "fa-heart",
  "fa-fire",
  "fa-gem",
  "fa-globe",
  "fa-shield-halved",
  "fa-graduation-cap",
  "fa-building",
  "fa-users",
  "fa-tag",
  "fa-flag",
  "fa-crown",
  "fa-trophy",
  "fa-bolt",
  "fa-leaf",
];

const CHAT_NAME_WORDS = [
  ["Clever", "Swift", "Bright", "Deep", "Keen", "Sharp", "Smart", "Wise"],
  ["Query", "Thread", "Session", "Chat", "Explore", "Review", "Analysis", "Brief"],
];

export function randomChatName(): string {
  const a = CHAT_NAME_WORDS[0][Math.floor(Math.random() * 8)];
  const b = CHAT_NAME_WORDS[1][Math.floor(Math.random() * 8)];
  return `${a} ${b} #${Math.floor(Math.random() * 900 + 100)}`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function getExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["xlsx", "xls"].includes(ext)) return "xlsx";
  if (["docx", "doc"].includes(ext)) return "docx";
  if (ext === "pdf") return "pdf";
  return "txt";
}

export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}