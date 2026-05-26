"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type CategoryData = {
  name: string;
  value: number;
  products: { name: string }[];
};

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const productNames = data.products.map((p) => p.name);

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-2 text-sm font-semibold text-foreground dark:text-white">{data.name}</p>
      <p className="mb-1 text-xs text-muted-foreground dark:text-slate-400">{data.value} products</p>
      {productNames.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-border pt-2 dark:border-slate-700">
          {productNames.map((name, idx) => (
            <li key={idx} className="flex items-center gap-1.5 text-xs text-foreground/70 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CategoryDonutChart({ data }: { data: CategoryData[] }): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}