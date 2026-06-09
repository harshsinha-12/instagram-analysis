"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
      onClick={() => window.print()}
      type="button"
    >
      <Printer className="h-4 w-4" />
      Print PDF
    </button>
  );
}
