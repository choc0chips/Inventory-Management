"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type MovementBarData = {
  month: string;
  RESTOCK: number;
  SALE: number;
  DAMAGE: number;
  ADJUSTMENT: number;
  RETURN: number;
};

const MOVEMENT_COLORS: Record<string, string> = {
  RESTOCK: "#22c55e",
  SALE: "#3b82f6",
  DAMAGE: "#ef4444",
  ADJUSTMENT: "#f59e0b",
  RETURN: "#8b5cf6",
};

export function MovementBarChart({ data }: { data: MovementBarData[] }): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No movement data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--foreground)",
            fontSize: "13px",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {Object.entries(MOVEMENT_COLORS).map(([key, color]) => (
          <Bar key={key} dataKey={key} fill={color} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
