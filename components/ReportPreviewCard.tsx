import { ReactNode } from "react";
import { Zap, Play, FileText, LayoutList } from "lucide-react";

interface ReportPreviewCardProps {
  title: string;
  icon: "zap" | "play" | "file" | "layout";
  children: ReactNode;
  badge?: string;
  className?: string;
}

const icons = {
  zap: <Zap className="h-4 w-4 text-coral" />,
  play: <Play className="h-4 w-4 text-leaf" />,
  file: <FileText className="h-4 w-4 text-muted" />,
  layout: <LayoutList className="h-4 w-4 text-gold" />
};

export function ReportPreviewCard({ title, icon, children, badge, className = "" }: ReportPreviewCardProps) {
  return (
    <div className={`rounded-xl border border-line bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-paper border border-line">
            {icons[icon]}
          </div>
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>
        {badge && (
          <span className="rounded-full bg-leaf/10 px-2.5 py-1 text-xs font-semibold text-leaf">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
