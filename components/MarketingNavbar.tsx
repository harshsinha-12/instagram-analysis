"use client";

import { BarChart3, ExternalLink } from "lucide-react";
import Link from "next/link";

export function MarketingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="border-b border-line bg-ink px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>Deployed preview: use the sample report.</span>
          <Link href="/reports/demo-report" className="font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">
            View sample
          </Link>
          <span className="text-white/70">Full analysis runs need the complete deployment pipeline, or</span>
          <a
            href="https://github.com/harshsinha-12/instagram-analysis#readme"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            run locally from the README
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </span>
      </div>
      <div className="flex w-full items-center justify-between px-6 md:px-12 py-4">
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
