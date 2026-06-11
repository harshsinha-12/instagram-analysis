"use client";

import { motion } from "framer-motion";
import { BarChart2, Hash, Layers, Star, Target, Zap } from "lucide-react";

export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf/20 blur-[80px]" />

      {/* Main Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 overflow-hidden rounded-2xl border border-line bg-white/50 p-6 shadow-floating backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf/10 text-leaf">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Competitor Overview</h3>
              <p className="text-xs text-muted">vs 3 top competitors</p>
            </div>
          </div>
          <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            Live Analysis
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted">
              <Zap className="h-4 w-4 text-coral" /> Winning Pattern
            </div>
            <p className="font-medium text-ink">Hooks under 3s</p>
            <p className="text-xs text-muted mt-1">+42% retention lift</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted">
              <Star className="h-4 w-4 text-gold" /> Top Reel Score
            </div>
            <p className="font-medium text-ink">94.2 / 100</p>
            <p className="text-xs text-muted mt-1">&quot;Why we built X&quot;</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Pipeline Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="absolute -bottom-8 -right-8 z-20 w-64 rounded-xl border border-line bg-surface p-4 shadow-soft"
      >
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Analysis Pipeline</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-white">
              <Hash className="h-3 w-3" />
            </div>
            <span className="text-ink">Fetch public posts</span>
          </div>
          <div className="ml-3 h-3 border-l-2 border-line border-dashed" />
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-coral/20 text-coral">
              <Target className="h-3 w-3" />
            </div>
            <span className="text-ink">Rank outlier performance</span>
          </div>
          <div className="ml-3 h-3 border-l-2 border-line border-dashed" />
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-muted">
              <Layers className="h-3 w-3" />
            </div>
            <span className="text-ink">Analyze scripts & hooks</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
