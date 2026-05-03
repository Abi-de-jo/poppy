// components/ProjectModal.tsx
"use client";

import { useState } from "react";
import { useApp } from "@/app/contexts/AppContext";
import { PROJECT_COLORS, PROJECT_ICONS } from "@/app/lib/utils";
import { Project } from "@/app/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { addProject } = useApp();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
      timestamp: Date.now(),
    };
    addProject(newProject);
    setName("");
    setSelectedColor(PROJECT_COLORS[0]);
    setSelectedIcon(PROJECT_ICONS[0]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-[10px] z-[100] flex items-center justify-center transition-opacity duration-220 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`} 
      onClick={onClose}
    >
      <div 
        className="bg-[#111620] border border-[rgba(148,163,184,0.12)] rounded-[20px] p-[26px] w-[440px] max-w-[calc(100vw-40px)] shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-transform duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Syne',var(--font-syne)] text-[17px] font-bold mb-5 text-[#e2e8f0] flex items-center gap-2">
          <i className="fa-solid fa-folder-plus text-[#60a5fa] text-[15px]"></i> Create New Project
        </h3>
        
        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#546880] mb-1.5 block">Project Name</label>
        <input
          type="text"
          placeholder="e.g. Q3 Financial Reports…"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-[10px_13px] bg-[#161d2a] border border-[rgba(148,163,184,0.12)] rounded-[10px] text-[#e2e8f0] font-['DM_Sans',var(--font-dm-sans)] text-[14px] outline-none mb-4 transition-all duration-180 focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
          autoFocus
        />
        
        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#546880] mb-1.5 block">Icon</label>
        <div className="grid grid-cols-8 gap-1.5 mb-[18px] max-h-[130px] overflow-y-auto">
          {PROJECT_ICONS.map((icon) => (
            <div
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              className={`w-[34px] h-[34px] rounded-[6px] bg-[#161d2a] border border-[rgba(148,163,184,0.07)] text-[#94a3b8] cursor-pointer flex items-center justify-center text-[13px] transition-all duration-150 hover:bg-[#1e2738] hover:text-[#e2e8f0] hover:border-[rgba(148,163,184,0.12)] ${
                selectedIcon === icon ? "bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)] text-[#60a5fa]" : ""
              }`}
            >
              <i className={`fa-solid ${icon}`}></i>
            </div>
          ))}
        </div>
        
        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#546880] mb-1.5 block">Color</label>
        <div className="flex gap-2 flex-wrap mb-4">
          {PROJECT_COLORS.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-180 flex-shrink-0 ${
                selectedColor === color ? "border-2.5 border-white scale-110 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]" : ""
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
        
        <div className="flex gap-2 justify-end mt-1">
          <button 
            onClick={onClose}
            className="px-[18px] py-2.5 border border-[rgba(148,163,184,0.07)] rounded-[10px] font-['DM_Sans',var(--font-dm-sans)] text-[13.5px] font-medium cursor-pointer transition-all duration-180 flex items-center gap-1.5 bg-[#161d2a] text-[#94a3b8] hover:bg-[#1e2738] hover:text-[#e2e8f0]"
          >
            <i className="fa-solid fa-xmark"></i> Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-[18px] py-2.5 rounded-[10px] font-['DM_Sans',var(--font-dm-sans)] text-[13.5px] font-medium cursor-pointer transition-all duration-180 flex items-center gap-1.5 bg-[#3b82f6] text-white hover:bg-[#2563eb] hover:-translate-y-px hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]"
          >
            <i className="fa-solid fa-folder-plus"></i> Create
          </button>
        </div>
      </div>
    </div>
  );
}