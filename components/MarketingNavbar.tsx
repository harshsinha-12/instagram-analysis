"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";

export function MarketingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="font-semibold text-ink">Creative Intelligence</span>
        </div>
        
        <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <Link href="#product" className="hover:text-ink transition-colors">Product</Link>
          <Link href="#workflow" className="hover:text-ink transition-colors">Workflow</Link>
          <Link href="/reports/demo-report" className="hover:text-ink transition-colors">Demo Report</Link>
        </div>

        <button 
          onClick={() => {
            document.getElementById('analyzer-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-leaf focus:outline-none focus:ring-2 focus:ring-leaf/50"
        >
          Analyze competitors
        </button>
      </div>
    </nav>
  );
}
