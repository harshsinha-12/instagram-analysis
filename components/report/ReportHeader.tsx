import { Report } from "@/declaration";
import { Download, Printer } from "lucide-react";

export function ReportHeader({ report }: { report: Report }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="mb-12 border-b border-line pb-8 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              Strategic Working Draft
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted border border-line px-2 py-1 rounded-sm">
              For Internal Planning
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight mb-2">
            Instagram Competitive Intelligence Report
          </h1>
          <p className="text-xl text-muted font-light mb-6">
            Creative strategy analysis for <strong className="font-semibold text-ink">{report.input.brand}</strong>
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink">Target:</span> {report.input.competitors.join(", ")}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink">Period:</span> {report.input.lookbackDays} Days
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink">Format:</span> <span className="capitalize">{report.input.contentType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink">Generated:</span> {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 no-print">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-line rounded-md text-sm font-medium text-ink hover:bg-surface transition-colors focus-ring">
            <Printer className="w-4 h-4" />
            Print PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-line rounded-md text-sm font-medium text-ink hover:bg-surface transition-colors focus-ring">
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>
    </header>
  );
}
