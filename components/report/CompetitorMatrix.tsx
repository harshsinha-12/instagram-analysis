import { MatrixPoint } from "@/lib/mock-strategy";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LabelList, Cell } from "recharts";

export function CompetitorMatrix({ matrixData, brand }: { matrixData: { points: MatrixPoint[], target: MatrixPoint }, brand: string }) {
  const data = [...matrixData.points, matrixData.target];

  return (
    <section id="competitor-matrix" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Competitor Positioning Matrix</h2>
      
      <div className="relative bg-surface border border-line p-6 pl-12">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
              <XAxis type="number" dataKey="x" name="Style" domain={[0, 100]} hide />
              <YAxis type="number" dataKey="y" name="Trust" domain={[0, 100]} hide />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-navy text-white text-xs p-2 rounded shadow-md border border-navy">
                        {data.name}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="3 3">
              </ReferenceLine>
              <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3">
              </ReferenceLine>
              <Scatter name="Competitors" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.handle === matrixData.target.handle ? '#0F766E' : '#ea580c'} />
                ))}
                <LabelList dataKey="name" position="bottom" className="text-xs font-medium fill-ink" offset={10} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Axis Labels outside chart for cleaner look */}
        <div className="relative mt-4">
          <div className="absolute left-0 text-[10px] font-bold uppercase tracking-wider text-muted">Entertainment-led</div>
          <div className="absolute right-0 text-[10px] font-bold uppercase tracking-wider text-muted">Education-led</div>
        </div>
        <div className="absolute left-2 top-6 bottom-40 flex flex-col items-center justify-between pointer-events-none" style={{ width: '20px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-10">Low Trust</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mt-10">High Trust</div>
        </div>

        <div className="mt-12 bg-paper p-4 border border-line text-sm text-ink">
          <p className="font-semibold mb-2">Interpretation</p>
          <p className="leading-relaxed text-muted">
            Competitors currently cluster toward the entertainment and lower-trust quadrants, focusing heavily on viral memes and fast-paced trend chasing. The white-space opportunity for <strong className="text-ink">{brand}</strong> lies in the upper-right quadrant: combining high-trust educational content with engaging, relatable everyday framing.
          </p>
        </div>
      </div>
    </section>
  );
}
