"use client";

import { PlayCircle } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

export function HeroSection() {
  return (
    <section className="relative w-full bg-paper pb-20 pt-24 md:pt-32 overflow-x-auto">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="w-full px-6 md:px-12 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <p className="inline-block rounded-full bg-leaf/10 px-3 py-1 text-sm font-semibold text-leaf mb-6">
              Creative intelligence for social teams
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-6xl mb-6">
              Know why competitor reels win before your next sprint.
            </h1>
            <p className="text-lg leading-8 text-muted mb-8">
              Fetch public Instagram posts, rank high-signal performers, decode hooks and audience triggers, then generate a practical content strategy report in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  document.getElementById('analyzer-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex h-12 items-center justify-center rounded-md bg-leaf px-8 text-sm font-semibold text-white transition-colors hover:bg-leaf/90 focus:outline-none focus:ring-2 focus:ring-leaf/50"
              >
                Start analysis
              </button>
              <a 
                href="/reports/demo-report"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface px-8 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-leaf/50"
              >
                <PlayCircle className="h-4 w-4 text-muted" />
                View demo report
              </a>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-muted">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-leaf"></div>
                30-day lookback
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-coral"></div>
                Pattern mining
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gold"></div>
                Reel idea generation
              </div>
            </div>
          </div>
          
          <div className="relative lg:ml-auto w-full">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
