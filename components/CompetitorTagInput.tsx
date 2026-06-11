"use client";

import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface CompetitorTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function CompetitorTagInput({ value, onChange, error }: CompetitorTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    // Ensure it starts with @
    const formatted = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
    
    if (!value.includes(formatted)) {
      onChange([...value, formatted]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div 
        className={`flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2 transition-colors ${
          error ? "border-red-500 focus-within:ring-red-500/30" : "border-line focus-within:border-leaf focus-within:ring-2 focus-within:ring-leaf/30"
        }`}
      >
        {value.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-leaf/10 px-2.5 py-1 text-sm font-medium text-leaf"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-full p-0.5 hover:bg-leaf/20 focus:bg-leaf/20 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? "e.g. @competitor1, @competitor2" : "Add competitor..."}
          className="flex-1 bg-transparent min-w-[120px] text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
