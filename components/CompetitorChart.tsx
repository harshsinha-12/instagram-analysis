"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Report } from "@/lib/types";

export function CompetitorChart({ competitors }: { competitors: Report["competitors"] }) {
  const data = competitors.map((competitor) => ({
    name: competitor.name,
    engagement: Number((competitor.avgEngagement * 100).toFixed(2)),
    score: Number((competitor.bestScore * 100).toFixed(0))
  }));

  return (
    <div className="h-72 rounded-lg border border-line bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#ece8df" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "#f7f6f2" }} />
          <Bar dataKey="engagement" fill="#176b5d" radius={[4, 4, 0, 0]} name="Avg engagement %" />
          <Bar dataKey="score" fill="#bf5b45" radius={[4, 4, 0, 0]} name="Best score x100" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
