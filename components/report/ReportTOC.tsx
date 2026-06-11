"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "executive-summary", label: "Executive Summary" },
  { id: "kpi-snapshot", label: "KPI Snapshot" },
  { id: "strategic-takeaways", label: "Strategic Takeaways" },
  { id: "competitor-matrix", label: "Competitor Matrix" },
  { id: "creative-patterns", label: "Creative Patterns" },
  { id: "competitor-breakdown", label: "Competitor Breakdown" },
  { id: "top-reels", label: "Top Reels" },
  { id: "content-pillars", label: "Content Pillars" },
  { id: "opportunity-map", label: "Opportunity Map" },
  { id: "action-plan", label: "30-Day Plan" },
  { id: "reel-ideas", label: "Reel Ideas" },
  { id: "final-recommendation", label: "Final Recommendation" },
];

export function ReportTOC() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-8 w-64 shrink-0 no-print">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 px-3">Contents</h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === section.id
                  ? "bg-navy text-white font-medium shadow-sm"
                  : "text-muted hover:text-ink hover:bg-black/5"
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
