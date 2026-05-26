"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Minus,
  Plus,
  Filter,
  X,
  Sparkles,
  PlusCircle,
  FileUp,
  Bell,
  Activity,
  History,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardExportButtons } from "./dashboard-export-buttons";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Movement = {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  date: Date;
  product: { name: string; sku: string };
};

type KpiData = {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  supplierCount: number;
};

type DashboardClientProps = {
  kpiData: KpiData;
  movements: Movement[];
  products: { id: string; name: string }[];
};

const movementIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RESTOCK: Plus,
  SALE: ArrowUpRight,
  DAMAGE: Minus,
  ADJUSTMENT: RotateCcw,
  RETURN: ArrowDownRight,
};

const movementColorMap: Record<string, string> = {
  RESTOCK: "text-emerald-600 bg-emerald-50 border border-emerald-100/50 shadow-sm shadow-emerald-500/5 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25",
  SALE: "text-blue-600 bg-blue-50 border border-blue-100/50 shadow-sm shadow-blue-500/5 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25",
  DAMAGE: "text-red-600 bg-red-50 border border-red-100/50 shadow-sm shadow-red-500/5 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25",
  ADJUSTMENT: "text-amber-600 bg-amber-50 border border-amber-100/50 shadow-sm shadow-amber-500/5 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25",
  RETURN: "text-violet-600 bg-violet-50 border border-violet-100/50 shadow-sm shadow-violet-500/5 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/25",
};

const movementBadgeMap: Record<string, string> = {
  RESTOCK: "bg-emerald-100/60 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-500/5 hover:bg-emerald-100/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25",
  SALE: "bg-blue-100/60 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-500/5 hover:bg-blue-100/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/25",
  DAMAGE: "bg-red-100/60 text-red-700 border border-red-200/50 shadow-sm shadow-red-500/5 hover:bg-red-100/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25",
  ADJUSTMENT: "bg-amber-100/60 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/5 hover:bg-amber-100/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
  RETURN: "bg-violet-100/60 text-violet-700 border border-violet-200/50 shadow-sm shadow-violet-500/5 hover:bg-violet-100/80 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/25",
};

const MOVEMENT_TYPES = ["RESTOCK", "SALE", "DAMAGE", "ADJUSTMENT", "RETURN"] as const;

function getTrendData(movements: Movement[]) {
  if (movements.length === 0) return [];
  
  const formatDateStr = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const grouped: Record<string, { dateStr: string; volume: number; Restock: number; Sale: number; timestamp: number }> = {};

  movements.forEach((m) => {
    const dStr = formatDateStr(m.date);
    const ts = new Date(m.date).getTime();
    if (!grouped[dStr]) {
      grouped[dStr] = {
        dateStr: dStr,
        volume: 0,
        Restock: 0,
        Sale: 0,
        timestamp: ts,
      };
    }
    const qty = m.quantity;
    if (m.type === "RESTOCK" || m.type === "RETURN" || (m.type === "ADJUSTMENT" && qty > 0)) {
      grouped[dStr].Restock += Math.abs(qty);
    } else {
      grouped[dStr].Sale += Math.abs(qty);
    }
    grouped[dStr].volume += Math.abs(qty);
  });

  return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
}

function getPieData(movements: Movement[]) {
  const counts: Record<string, number> = {
    RESTOCK: 0,
    SALE: 0,
    DAMAGE: 0,
    ADJUSTMENT: 0,
    RETURN: 0,
  };

  movements.forEach((m) => {
    if (m.type in counts) {
      counts[m.type] += 1;
    }
  });

  const MOVEMENT_LABELS: Record<string, string> = {
    RESTOCK: "Restocks (+)",
    SALE: "Sales (-)",
    DAMAGE: "Damages (-)",
    ADJUSTMENT: "Adjustments (±)",
    RETURN: "Returns (+)",
  };

  const MOVEMENT_COLORS: Record<string, string> = {
    RESTOCK: "#10b981",
    SALE: "#3b82f6",
    DAMAGE: "#f43f5e",
    ADJUSTMENT: "#f59e0b",
    RETURN: "#8b5cf6",
  };

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: MOVEMENT_LABELS[type] || type,
      value: count,
      color: MOVEMENT_COLORS[type] || "#64748b",
    }));
}

function StockTrendChart({ movements }: { movements: Movement[] }): React.ReactElement {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const data = getTrendData(movements);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 animate-pulse rounded-lg">
        <Activity className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl bg-muted/20">
        <History className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-semibold text-foreground">No Historical Flow</p>
        <p className="text-xs text-muted-foreground">Perform movements to see your inventory activity</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRestock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis 
          dataKey="dateStr" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }} 
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }} 
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            color: "var(--foreground)",
            fontSize: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
          labelStyle={{ fontWeight: "bold", color: "var(--muted-foreground)", marginBottom: "4px" }}
        />
        <Legend 
          verticalAlign="top" 
          height={36} 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}
        />
        <Area 
          name="Stock Inflow (Restocks/Returns)" 
          type="monotone" 
          dataKey="Restock" 
          stroke="#10b981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRestock)" 
        />
        <Area 
          name="Stock Outflow (Sales/Damages)" 
          type="monotone" 
          dataKey="Sale" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorSale)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TransactionMixChart({ movements }: { movements: Movement[] }): React.ReactElement {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const data = getPieData(movements);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 animate-pulse rounded-lg">
        <Activity className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl bg-muted/20">
        <Activity className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-semibold text-foreground">No Activity Breakdown</p>
        <p className="text-xs text-muted-foreground">Perform movements to see chart breakdown</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="42%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            color: "var(--foreground)",
            fontSize: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          layout="horizontal"
          wrapperStyle={{ fontSize: "11px", fontWeight: 500, paddingTop: "10px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DashboardClient({
  kpiData,
  movements,
  products,
}: DashboardClientProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [showFilters, setShowFilters] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [greeting, setGreeting] = useState("Welcome back");
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");

      // Dynamic clean date-string for header
      setFormattedTime(new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filterProduct = searchParams.get("product") ?? "";
  const filterType = searchParams.get("type") ?? "";
  const filterStartDate = searchParams.get("startDate") ?? "";
  const filterEndDate = searchParams.get("endDate") ?? "";

  const [localProduct, setLocalProduct] = useState(filterProduct);
  const [localType, setLocalType] = useState(filterType);
  const [localStartDate, setLocalStartDate] = useState(filterStartDate);
  const [localEndDate, setLocalEndDate] = useState(filterEndDate);

  const applyFilters = useCallback(
    (product: string, type: string, startDate: string, endDate: string) => {
      const params = new URLSearchParams();
      if (product) params.set("product", product);
      if (type) params.set("type", type);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `/?${query}` : "/");
      });
    },
    [router, startTransition]
  );

  function handleProductChange(value: string): void {
    setLocalProduct(value);
    const type = localType;
    const start = localStartDate;
    const end = localEndDate;
    applyFilters(value, type, start, end);
  }

  function handleTypeChange(value: string): void {
    setLocalType(value);
    const product = localProduct;
    const start = localStartDate;
    const end = localEndDate;
    applyFilters(product, value, start, end);
  }

  function handleStartDateChange(value: string): void {
    setLocalStartDate(value);
    const product = localProduct;
    const type = localType;
    const end = localEndDate;
    applyFilters(product, type, value, end);
  }

  function handleEndDateChange(value: string): void {
    setLocalEndDate(value);
    const product = localProduct;
    const type = localType;
    const start = localStartDate;
    applyFilters(product, type, start, value);
  }

  function clearFilters(): void {
    setLocalProduct("");
    setLocalType("");
    setLocalStartDate("");
    setLocalEndDate("");
    setFilterKey((k) => k + 1);
    startTransition(() => {
      router.push("/");
    });
  }

  const hasActiveFilters =
    Boolean(localProduct || localType || localStartDate || localEndDate);

  const kpiCards = [
    {
      title: "Total Products",
      value: kpiData.totalProducts.toString(),
      icon: Package,
      gradient: "from-indigo-500 to-blue-600",
      bgLight: "bg-indigo-50/50",
      glowColor: "group-hover:border-indigo-400/50 group-hover:shadow-indigo-500/10",
      shadow: "shadow-indigo-500/20",
      textColor: "text-indigo-600",
      subtext: "Active catalog items",
    },
    {
      title: "Stock Value",
      value: formatCurrency(kpiData.totalValue),
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/50",
      glowColor: "group-hover:border-emerald-400/50 group-hover:shadow-emerald-500/10",
      shadow: "shadow-emerald-500/20",
      textColor: "text-emerald-600",
      subtext: "Capital valuation",
    },
    {
      title: "Low Stock Alerts",
      value: kpiData.lowStockCount.toString(),
      icon: AlertTriangle,
      gradient:
        kpiData.lowStockCount > 0
          ? "from-rose-500 to-red-600 animate-pulse"
          : "from-slate-400 to-slate-500",
      bgLight: kpiData.lowStockCount > 0 ? "bg-red-50/50 dark:bg-red-500/10" : "bg-muted/50",
      glowColor: kpiData.lowStockCount > 0 
        ? "group-hover:border-red-400/50 group-hover:shadow-red-500/10" 
        : "group-hover:border-border group-hover:shadow-border/10",
      shadow:
        kpiData.lowStockCount > 0 ? "shadow-red-500/20" : "shadow-muted-foreground/20",
      textColor: kpiData.lowStockCount > 0 ? "text-red-600" : "text-muted-foreground",
      subtext: kpiData.lowStockCount > 0 ? "Requires restock" : "All levels balanced",
    },
    {
      title: "Suppliers",
      value: kpiData.supplierCount.toString(),
      icon: Truck,
      gradient: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50/50",
      glowColor: "group-hover:border-violet-400/50 group-hover:shadow-violet-500/10",
      shadow: "shadow-violet-500/20",
      textColor: "text-violet-600",
      subtext: "Active distributors",
    },
  ];

  return (
    <div className="space-y-8" key={filterKey}>
      {/* Top Banner Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600/80">StockWise Hub</h2>
          <p className="text-xs text-muted-foreground">{formattedTime || "Loading overview..."}</p>
        </div>
        <DashboardExportButtons
          filters={{
            product: localProduct,
            type: localType,
            startDate: localStartDate,
            endDate: localEndDate,
          }}
        />
      </div>

      {/* Glassmorphic Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Operator Console Active
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
              {greeting}, <span className="text-indigo-200 font-extrabold">Operator</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-indigo-200/80">
              {kpiData.lowStockCount > 0 
                ? `Attention required: ${kpiData.lowStockCount} items are running low or depleted. Review low stock alerts to restock inventory levels.`
                : "All systems fully operational. Your inventory levels are balanced and no alerts require your attention."
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:flex-shrink-0 lg:items-center">
            <Link href="/products" className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors duration-300 hover:border-indigo-400/50 hover:bg-indigo-950/40 hover:shadow-lg hover:shadow-indigo-500/10 lg:w-44">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300/80">Catalog</p>
                <p className="text-xs font-bold text-white">Add Product</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <PlusCircle className="h-4 w-4" />
              </div>
            </Link>
            
            <Link href="/import" className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors duration-300 hover:border-violet-400/50 hover:bg-violet-950/40 hover:shadow-lg hover:shadow-violet-500/10 lg:w-44">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-300/80">Logistics</p>
                <p className="text-xs font-bold text-white">Import CSV</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                <FileUp className="h-4 w-4" />
              </div>
            </Link>
            
            <Link href="/alerts" className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors duration-300 hover:border-rose-400/50 hover:bg-rose-950/40 hover:shadow-lg hover:shadow-rose-500/10 lg:w-44">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-rose-300/80">Monitoring</p>
                <p className="text-xs font-bold text-white">Stock Alerts</p>
              </div>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                <Bell className="h-4 w-4" />
                {kpiData.lowStockCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const isLowStock = card.title === "Low Stock Alerts" && kpiData.lowStockCount > 0;
          return (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${card.glowColor}`}
            >
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </span>
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {card.value}
                  </h3>
                  
                  <div className="flex items-center gap-1.5">
                    {card.title === "Low Stock Alerts" ? (
                      isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-100/50 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Requires Action
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                          ✓ All Balanced
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">{card.subtext}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            </div>
          );
        })}
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Movements Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300 hover:border-border/80">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Stock Activity Trend</h3>
              <p className="text-xs text-muted-foreground">Cumulative transactional stock adjustments over time</p>
            </div>
            <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Active Ledger Graph
            </span>
          </div>
          <div className="h-[280px] w-full">
            <StockTrendChart movements={movements} />
          </div>
        </div>

        {/* Action Type Pie Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300 hover:border-border/80">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Transaction Mix</h3>
            <p className="text-xs text-muted-foreground">Distribution of stock transaction actions</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <TransactionMixChart movements={movements} />
          </div>
        </div>
      </div>

      {/* Recent Movements Ledger */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Recent Stock Movements Ledger
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest inventory changes across all products
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:border-border/80 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:border-border/80 hover:text-foreground"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Animated Filters Panel */}
        <div 
          className={`transition-all duration-300 ease-in-out border-b border-border bg-muted/20 overflow-hidden ${
            showFilters ? "max-h-[500px] opacity-100 py-5 px-6" : "max-h-0 opacity-0 py-0 px-6 border-transparent"
          }`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                Product Filter
              </Label>
              <Select value={localProduct || "all"} onValueChange={(v) => handleProductChange(v === "all" || !v ? "" : v)}>
                <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                Transaction Action
              </Label>
              <Select value={localType || "all"} onValueChange={(v) => handleTypeChange(v === "all" || !v ? "" : v)}>
                <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {MOVEMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                Start Date
              </Label>
              <Input
                type="date"
                value={localStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                End Date
              </Label>
              <Input
                type="date"
                value={localEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-wrapper">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-muted/40">
                <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  Product Details
                </TableHead>
                <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  Action Taken
                </TableHead>
                <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  Quantity
                </TableHead>
                <TableHead className="hidden px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60 sm:table-cell">
                  Note / Reference
                </TableHead>
                <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  Logged Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground/60 shadow-sm border border-border/50">
                        <History className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-sm font-bold text-foreground/90">No movements match filters</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        We couldn&apos;t find any stock movements matching your selected criteria. Try adjusting your filters or resetting them to see all records.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => {
                  const Icon =
                    movementIconMap[movement.type] ?? RotateCcw;
                  const colorClass =
                    movementColorMap[movement.type] ??
                    "text-muted-foreground bg-muted border border-border shadow-sm";
                  const badgeClass =
                    movementBadgeMap[movement.type] ?? "bg-muted text-muted-foreground";
                  return (
                    <TableRow
                      key={movement.id}
                      className="transition-colors duration-200 hover:bg-muted/40"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {movement.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground/80 font-medium">
                              {movement.product.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`${badgeClass} font-semibold`} variant="secondary">
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          movement.type === "SALE" || movement.type === "DAMAGE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {movement.type === "SALE" ||
                          movement.type === "DAMAGE"
                            ? "−"
                            : "+"}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="hidden px-6 py-4 sm:table-cell">
                        <span className="inline-block max-w-[200px] truncate text-sm text-muted-foreground font-medium">
                          {movement.note ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground bg-muted border border-border/40 px-2.5 py-1 rounded-full">
                          {formatDate(movement.date)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}