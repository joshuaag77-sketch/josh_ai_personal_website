"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SCHOOLS = [
  { name: "Wharton", total: 267500 },
  { name: "Chicago Booth", total: 252000 },
  { name: "Yale SOM", total: 228000 },
  { name: "Cornell Johnson", total: 205000 },
  { name: "Kellogg", total: 248000 },
  { name: "Columbia", total: 260000 },
];

function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

export function MbaRoiCalculator() {
  const [schoolIdx, setSchoolIdx] = useState(0);
  const [scholarship, setScholarship] = useState(0);
  const [preSalary, setPreSalary] = useState(100000);
  const [postSalary, setPostSalary] = useState(200000);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<unknown>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const totalCost = SCHOOLS[schoolIdx].total;
  const netDebt = Math.max(0, totalCost - scholarship);
  const annualRate = 0.07;
  const monthlyRate = annualRate / 12;
  const months = 120;
  const monthlyPayment = useMemo(() => {
    if (netDebt <= 0) return 0;
    return (
      (netDebt * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }, [netDebt]);
  const totalInterest = Math.max(0, monthlyPayment * months - netDebt);
  const salaryLift = Math.max(0, postSalary - preSalary);
  const breakEven = salaryLift > 0 ? (totalCost - scholarship) / salaryLift : 0;

  const balances = useMemo(() => {
    const out: number[] = [];
    let bal = netDebt;
    out.push(Math.round(bal));
    for (let year = 1; year <= 10; year++) {
      for (let m = 0; m < 12; m++) {
        const interest = bal * monthlyRate;
        const principalPaid = monthlyPayment - interest;
        bal = Math.max(0, bal - principalPaid);
      }
      out.push(Math.round(bal));
    }
    return out;
  }, [netDebt, monthlyPayment]);

  // Lazy-load Chart.js from CDN once
  useEffect(() => {
    let cancelled = false;
    async function loadChart() {
      // @ts-expect-error - Chart attached to window
      if (typeof window.Chart !== "undefined") return;
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-chartjs-loader="true"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
        s.async = true;
        s.dataset.chartjsLoader = "true";
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.head.appendChild(s);
      });
      if (!cancelled) renderChart();
    }
    loadChart().catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render chart whenever balances change
  useEffect(() => {
    renderChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances]);

  function renderChart() {
    if (!canvasRef.current) return;
    // @ts-expect-error - Chart on window
    const Chart = window.Chart;
    if (!Chart) return;
    const labels = ["0", ...Array.from({ length: 10 }, (_, i) => `Yr ${i + 1}`)];

    if (chartRef.current) {
      // @ts-expect-error - chart instance
      chartRef.current.data.labels = labels;
      // @ts-expect-error - chart instance
      chartRef.current.data.datasets[0].data = balances;
      // @ts-expect-error - chart instance
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Loan Balance",
            data: balances,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Loan Balance Over 10 Years",
            font: { size: 14 },
          },
          tooltip: {
            callbacks: {
              label: (c: { parsed: { y: number } }) =>
                "$" + c.parsed.y.toLocaleString(),
            },
          },
        },
        scales: {
          x: { grid: { color: "rgba(148,163,184,0.15)" } },
          y: {
            ticks: {
              callback: (v: number | string) =>
                "$" + Math.round(Number(v) / 1000) + "K",
            },
            grid: { color: "rgba(148,163,184,0.15)" },
          },
        },
      },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url =
      "https://calendly.com/m7strategy?name=" +
      encodeURIComponent(name) +
      "&email=" +
      encodeURIComponent(email);
    window.location.href = url;
  }

  return (
    <div className="my-10 space-y-10">
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-6 sm:p-8 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.5)]">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 mb-2">
          Interactive
        </p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          MBA Cost Reality Check
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Adjust the inputs to see what attending actually costs you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Target School
            </label>
            <select
              value={schoolIdx}
              onChange={(e) => setSchoolIdx(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              {SCHOOLS.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name} ({fmtMoney(s.total)} est. total)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Scholarship: {fmtMoney(scholarship)}
            </label>
            <input
              type="range"
              min={0}
              max={150000}
              step={5000}
              value={scholarship}
              onChange={(e) => setScholarship(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$0</span>
              <span>$150K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Pre-MBA Salary: {fmtMoney(preSalary)}
            </label>
            <input
              type="range"
              min={50000}
              max={200000}
              step={5000}
              value={preSalary}
              onChange={(e) => setPreSalary(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$50K</span>
              <span>$200K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Post-MBA Salary: {fmtMoney(postSalary)}
            </label>
            <input
              type="range"
              min={100000}
              max={350000}
              step={5000}
              value={postSalary}
              onChange={(e) => setPostSalary(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$100K</span>
              <span>$350K</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
          {[
            { label: "Net Debt", value: fmtMoney(netDebt) },
            { label: "Monthly (10yr @ 7%)", value: fmtMoney(monthlyPayment) },
            { label: "Total Interest", value: fmtMoney(totalInterest) },
            { label: "Salary Lift", value: "$" + Math.round(salaryLift / 1000) + "K" },
            {
              label: "Break-Even",
              value: breakEven > 0 ? breakEven.toFixed(1) + " yrs" : "N/A",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-900/60 p-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {m.label}
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <canvas ref={canvasRef} height={120} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          10-year amortization at 7%. Opportunity cost (2 years foregone salary)
          is included in the school&apos;s estimated total. Directional model,
          not financial advice.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 mb-2">
          Strategy Session
        </p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          One hour with someone who just did it.
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
          Profile review, school strategy, essay narrative, scholarship
          negotiation. $200 · 1 hour · video call.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 text-sm transition-colors"
          >
            Book a Strategy Session →
          </button>
        </form>
      </div>
    </div>
  );
}
