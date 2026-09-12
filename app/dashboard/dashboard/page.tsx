"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardList,
  FaCouch,
  FaMoneyBillWave,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type Summary = {
  deliveredProjects: number;
  totalQuotations: number;
  monthlyIncome: number;
};

type MonthPoint = {
  label: string;
  income: number;
  projects: number;
};

const emptySummary: Summary = {
  deliveredProjects: 0,
  totalQuotations: 0,
  monthlyIncome: 0,
};

function formatCurrency(value: number) {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function getMonthPoints(): MonthPoint[] {
  const today = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);

    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      income: 0,
      projects: 0,
    };
  });
}

function monthIndex(value: string | null | undefined) {
  if (!value) return -1;

  const date = new Date(value);
  const today = new Date();
  const difference =
    (today.getFullYear() - date.getFullYear()) * 12 +
    today.getMonth() -
    date.getMonth();

  return difference >= 0 && difference < 6 ? 5 - difference : -1;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(emptySummary);
  const [monthPoints, setMonthPoints] = useState<MonthPoint[]>(getMonthPoints);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const [projectsResult, quotationsResult] = await Promise.all([
        supabase
          .from("finished_projects")
          .select("finish_date", { count: "exact" }),
        supabase.from("quotations").select("quotation_date,total_cost,status"),
      ]);

      if (projectsResult.error) {
        console.error("Dashboard projects error:", projectsResult.error);
      }

      if (quotationsResult.error) {
        console.error("Dashboard quotations error:", quotationsResult.error);
      }

      const points = getMonthPoints();
      let monthlyIncome = 0;

      for (const quotation of quotationsResult.data ?? []) {
        const index = monthIndex(quotation.quotation_date);

        if (index < 0) continue;

        const total = Number(quotation.total_cost) || 0;

        if (quotation.status === "approved") {
          points[index].income += total;
          monthlyIncome += total;
        }
      }

      for (const project of projectsResult.data ?? []) {
        const index = monthIndex(project.finish_date);

        if (index >= 0) points[index].projects += 1;
      }

      setSummary({
        deliveredProjects: projectsResult.count ?? 0,
        totalQuotations: quotationsResult.data?.length ?? 0,
        monthlyIncome,
      });
      setMonthPoints(points);
      setLoading(false);
    }

    void loadDashboard();
  }, []);

  const lineChart = useMemo(() => {
    const width = 620;
    const height = 230;
    const padding = 24;
    const maxValue = Math.max(...monthPoints.map((point) => point.income), 1);
    const step = (width - padding * 2) / Math.max(monthPoints.length - 1, 1);
    const points = monthPoints.map((point, index) => ({
      x: padding + index * step,
      y: height - padding - (point.income / maxValue) * (height - padding * 2),
    }));

    return {
      points,
      path: points
        .map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`)
        .join(" "),
    };
  }, [monthPoints]);

  const maxProjects = Math.max(
    ...monthPoints.map((point) => point.projects),
    1,
  );

  return (
    <section className="dashboard-home min-h-full px-1 pb-8 md:px-3">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#a06a3e]">
            Business overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#4b2f20] md:text-4xl">
            Good morning, let&apos;s build something beautiful.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8a6247]">
            A quick look at your workshop&apos;s projects, quotations, and
            income.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#ead3b6] bg-[#fff8eb] px-4 py-2 text-sm font-semibold text-[#6e4932] md:self-auto">
          <FaCalendarAlt className="text-[#a06a3e]" />
          {new Date().toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Delivered Projects"
          value={summary.deliveredProjects.toLocaleString()}
          caption="Finished pieces in your catalog"
          icon={<FaCouch />}
          accent="bg-[#ead4bd] text-[#70482f]"
          loading={loading}
        />
        <SummaryCard
          title="Total Quotations"
          value={summary.totalQuotations.toLocaleString()}
          caption="Quotes created in your workspace"
          icon={<FaClipboardList />}
          accent="bg-[#d9e2d1] text-[#4f6a43]"
          loading={loading}
        />
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyIncome)}
          caption="Approved quotations, last 6 months"
          icon={<FaMoneyBillWave />}
          accent="bg-[#f3cf95] text-[#805322]"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="dashboard-panel min-w-0">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a06a3e]">
                Income trend
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#4b2f20]">
                Quotation income
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f7ead8] px-3 py-1.5 text-xs font-bold text-[#a06a3e]">
              <FaArrowUp /> Approved
            </span>
          </div>
          <div className="h-[250px] w-full overflow-hidden">
            <svg
              viewBox="0 0 620 230"
              className="h-full w-full"
              role="img"
              aria-label="Six month quotation income line chart"
            >
              <defs>
                <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a06a3e" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#a06a3e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => {
                const y = 24 + line * 60.5;
                return (
                  <line
                    key={line}
                    x1="24"
                    x2="596"
                    y1={y}
                    y2={y}
                    stroke="#ead8c3"
                    strokeDasharray="4 6"
                  />
                );
              })}
              <path
                d={`${lineChart.path} L596,206 L24,206 Z`}
                fill="url(#incomeFill)"
              />
              <path
                d={lineChart.path}
                fill="none"
                stroke="#a06a3e"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
              {lineChart.points.map((point, index) => (
                <g key={monthPoints[index].label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#fff8eb"
                    stroke="#a06a3e"
                    strokeWidth="3"
                  />
                  <text
                    x={point.x}
                    y="225"
                    textAnchor="middle"
                    className="fill-[#9a7559] text-[12px]"
                  >
                    {monthPoints[index].label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="dashboard-panel min-w-0">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a06a3e]">
              Delivery activity
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#4b2f20]">
              Projects completed
            </h2>
          </div>
          <div className="flex h-[250px] items-end justify-between gap-3 px-2 pb-6">
            {monthPoints.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-3"
              >
                <span className="text-xs font-bold text-[#6e4932]">
                  {point.projects || ""}
                </span>
                <div className="flex h-[175px] w-full items-end justify-center rounded-t-xl bg-[#fbf1e2]">
                  <div
                    className="w-[58%] rounded-t-xl bg-gradient-to-t from-[#6e4932] to-[#b57b4c] transition-all duration-500"
                    style={{
                      height: `${Math.max((point.projects / maxProjects) * 100, point.projects ? 8 : 2)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#9a7559]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#ead3b6] bg-[#fff8eb] px-5 py-4 text-sm text-[#6e4932]">
        <FaChartLine className="text-lg text-[#a06a3e]" />
        <span>
          Charts update from your approved quotations and completed projects.
        </span>
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  caption,
  icon,
  accent,
  loading,
}: {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="dashboard-card group">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accent}`}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-[#b28a6c]">
          This workspace
        </span>
      </div>
      <p className="mt-7 text-sm font-semibold text-[#8a6247]">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[#4b2f20]">
        {loading ? (
          <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-[#ead8c3]" />
        ) : (
          value
        )}
      </p>
      <p className="mt-2 text-xs text-[#9a7559]">{caption}</p>
    </div>
  );
}
