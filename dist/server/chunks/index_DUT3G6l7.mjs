import { c as createComponent } from './astro-component_DKWqRa2-.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_VSg7zcZ5.mjs';
import { $ as $$MainLayout } from './MainLayout_DAtbgNmp.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useDisclosure, Spinner, Select, SelectItem, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, Input, ModalFooter } from '@heroui/react';
import { a as $token } from './authStore_BMyVodq8.mjs';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
const API = "http://localhost:5109";
const CATEGORY_COLORS = {
  "Regular Expenditure": "#3b82f6",
  "Project Related Expenditure": "#22c55e",
  "Repair and Maintenance": "#f59e0b",
  Others: "#a855f7"
};
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const BUDGET_COLOR = "#64748b";
const SPENT_COLOR = "#3b82f6";
function fmt(n) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function fmtM(n) {
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `₱${(n / 1e3).toFixed(0)}k`;
  return `₱${n.toFixed(0)}`;
}
function BudgetGauge({ budget, spent }) {
  const over = spent > budget;
  const delta = Math.abs(spent - budget);
  const pct = budget > 0 ? Math.min(spent / budget * 100, 100) : 0;
  const data = {
    datasets: [
      {
        data: over ? [budget, delta] : [spent, Math.max(budget - spent, 0)],
        backgroundColor: over ? [SPENT_COLOR, "#ef4444"] : [SPENT_COLOR, "#e2e8f0"],
        borderWidth: 0,
        circumference: 360,
        rotation: 0
      }
    ]
  };
  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    maintainAspectRatio: false
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-44 h-44", children: [
      /* @__PURE__ */ jsx(Pie, { data, options }),
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: `text-xl font-bold tabular-nums ${over ? "text-danger-500" : "text-default-800"}`,
            children: [
              pct.toFixed(1),
              "%"
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-default-400 uppercase tracking-wide", children: "utilised" })
      ] })
    ] }),
    over ? /* @__PURE__ */ jsxs(Chip, { size: "sm", color: "danger", variant: "flat", children: [
      "Over by ",
      fmt(delta)
    ] }) : /* @__PURE__ */ jsxs("span", { className: "text-sm text-success-600 font-semibold", children: [
      fmt(Math.max(budget - spent, 0)),
      " remaining"
    ] })
  ] });
}
function CategoryPie({ plan }) {
  const catMap = {};
  plan.months.forEach((sheet) => {
    Object.entries(sheet.subTotals ?? {}).forEach(([cat, val]) => {
      catMap[cat] = (catMap[cat] ?? 0) + val;
    });
  });
  const entries = Object.entries(catMap).filter(([, v]) => v > 0);
  const data = {
    labels: entries.map(([name]) => name),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: entries.map(
          ([name]) => CATEGORY_COLORS[name] ?? "#94a3b8"
        ),
        borderWidth: 0
      }
    ]
  };
  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${fmt(context.raw)}`
        }
      }
    },
    maintainAspectRatio: false
  };
  return /* @__PURE__ */ jsx("div", { className: "h-[280px]", children: /* @__PURE__ */ jsx(Pie, { data, options }) });
}
function MonthlyBar({ plan }) {
  const data = {
    labels: plan.months.map((s, i) => MONTH_SHORT[i] ?? s.month.slice(0, 3)),
    datasets: [
      {
        label: "Expenditure",
        data: plan.months.map((s) => s.grandTotal),
        backgroundColor: SPENT_COLOR,
        borderRadius: 4
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { callback: (val) => fmtM(val), font: { size: 10 } },
        grid: { color: "#e2e8f0" }
      },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } }
    },
    maintainAspectRatio: false
  };
  return /* @__PURE__ */ jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsx(Bar, { data, options }) });
}
function BudgetVsActualBar({ plan }) {
  if (!plan.annualBudget) return null;
  const monthlyTarget = plan.annualBudget / 12;
  const data = {
    labels: plan.months.map((s, i) => MONTH_SHORT[i] ?? s.month.slice(0, 3)),
    datasets: [
      {
        label: "Monthly Budget",
        data: plan.months.map(() => monthlyTarget),
        backgroundColor: BUDGET_COLOR,
        borderRadius: 4
      },
      {
        label: "Actual Spent",
        data: plan.months.map((s) => s.grandTotal),
        backgroundColor: SPENT_COLOR,
        borderRadius: 4
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.raw)}`
        }
      }
    },
    scales: {
      y: { ticks: { callback: (val) => fmtM(val), font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } }
    },
    maintainAspectRatio: false
  };
  return /* @__PURE__ */ jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsx(Bar, { data, options }) });
}
function SummaryCards({ plan }) {
  const budget = plan.annualBudget;
  const spent = plan.totalEstimatedCost;
  const remaining = budget != null ? budget - spent : null;
  const utilPct = budget != null && budget > 0 ? spent / budget * 100 : null;
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Total Expenditure" }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-primary", children: fmt(spent) })
    ] }),
    budget != null ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Annual Budget" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-default-700", children: fmt(budget) })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `border rounded-2xl p-4 flex flex-col gap-1 ${(remaining ?? 0) < 0 ? "bg-danger-50 border-danger-200" : "bg-success-50 border-success-200"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: (remaining ?? 0) < 0 ? "Over Budget" : "Remaining" }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `text-xl font-bold ${(remaining ?? 0) < 0 ? "text-danger-600" : "text-success-600"}`,
                children: fmt(Math.abs(remaining ?? 0))
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Utilisation" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `text-xl font-bold ${(utilPct ?? 0) > 100 ? "text-danger-600" : "text-default-700"}`,
            children: utilPct != null ? `${utilPct.toFixed(1)}%` : "—"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "col-span-3 flex items-center justify-center border border-dashed border-default-200 rounded-2xl p-4 text-sm text-default-400", children: 'No annual budget set — click "Set Budget" to enable comparison charts.' })
  ] });
}
function Charts() {
  const token = useStore($token);
  const [headers, setHeaders] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fetchHeaders = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API}/api/SchoolImplementation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHeaders(await res.json());
    } finally {
      setLoadingList(false);
    }
  }, [token]);
  const fetchPlan = async (id) => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`${API}/api/SchoolImplementation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPlan(await res.json());
    } finally {
      setLoadingPlan(false);
    }
  };
  useEffect(() => {
    fetchHeaders();
  }, [fetchHeaders]);
  const onBudgetSaved = (budget) => {
    setSelectedPlan((p) => p ? { ...p, annualBudget: budget } : p);
    setHeaders(
      (hs) => hs.map(
        (h) => h.id === selectedPlan?.id ? { ...h, annualBudget: budget } : h
      )
    );
  };
  if (loadingList)
    return /* @__PURE__ */ jsx(Spinner, { classNames: { label: "text-foreground mt-4" }, variant: "wave" });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Budget Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-default-500 text-sm", children: "Annual budget comparison and expenditure breakdown" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsx(
          Select,
          {
            label: "Select Plan Year",
            className: "w-72",
            onSelectionChange: (keys) => {
              const id = Array.from(keys)[0];
              if (id) fetchPlan(id);
            },
            children: headers.map((h) => /* @__PURE__ */ jsxs(SelectItem, { children: [
              h.year,
              " — ",
              h.school,
              h.annualBudget != null ? ` · ${fmtM(h.annualBudget)}` : ""
            ] }, h.id))
          }
        ),
        selectedPlan && /* @__PURE__ */ jsx(
          Button,
          {
            size: "sm",
            color: "primary",
            variant: selectedPlan.annualBudget != null ? "flat" : "solid",
            onPress: onOpen,
            children: selectedPlan.annualBudget != null ? "Edit Budget" : "Set Budget"
          }
        )
      ] })
    ] }),
    loadingPlan ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Spinner, { label: "Loading plan data…" }) }) : selectedPlan ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SummaryCards, { plan: selectedPlan }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        selectedPlan.annualBudget != null && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-default-600 uppercase tracking-wide", children: "Budget Utilisation" }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
            BudgetGauge,
            {
              budget: selectedPlan.annualBudget,
              spent: selectedPlan.totalEstimatedCost
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-default-400 px-2", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Budget: ",
              fmt(selectedPlan.annualBudget)
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Spent: ",
              fmt(selectedPlan.totalEstimatedCost)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5 ${selectedPlan.annualBudget != null ? "" : "sm:col-span-2"}`,
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-default-600 uppercase tracking-wide", children: "Expenditure by Category" }),
              /* @__PURE__ */ jsx(CategoryPie, { plan: selectedPlan })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-default-600 uppercase tracking-wide", children: "Category Totals" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2.5", children: Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
            const total = selectedPlan.months.reduce(
              (s, m) => s + (m.subTotals?.[cat] ?? 0),
              0
            );
            const pct = selectedPlan.totalEstimatedCost > 0 ? total / selectedPlan.totalEstimatedCost * 100 : 0;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-2.5 h-2.5 rounded-full shrink-0",
                  style: { background: color }
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-600 flex-1 truncate", children: cat }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-default-700 tabular-nums", children: fmtM(total) }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-400 w-9 text-right tabular-nums", children: [
                pct.toFixed(0),
                "%"
              ] })
            ] }, cat);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-default-50 border border-default-200 rounded-2xl p-5 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-default-600 uppercase tracking-wide", children: "Monthly Expenditure" }),
        /* @__PURE__ */ jsx(MonthlyBar, { plan: selectedPlan })
      ] }),
      selectedPlan.annualBudget != null && /* @__PURE__ */ jsxs("div", { className: "bg-default-50 border border-default-200 rounded-2xl p-5 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-default-600 uppercase tracking-wide", children: "Monthly Budget vs Actual" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-400", children: [
            "Monthly target: ",
            fmtM(selectedPlan.annualBudget / 12)
          ] })
        ] }),
        /* @__PURE__ */ jsx(BudgetVsActualBar, { plan: selectedPlan })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "text-center text-default-400 py-20", children: "Select a plan year to view charts." }),
    /* @__PURE__ */ jsx(
      SetBudgetModal,
      {
        plan: selectedPlan,
        isOpen,
        onClose,
        onSaved: onBudgetSaved,
        token
      }
    )
  ] });
}
function SetBudgetModal({
  plan,
  isOpen,
  onClose,
  onSaved,
  token
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setValue(plan?.annualBudget != null ? plan.annualBudget.toString() : "");
  }, [plan, isOpen]);
  const call = async (budget) => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/api/SchoolImplementation/${plan.id}/budget`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ annualBudget: budget })
        }
      );
      if (res.ok) {
        onSaved(budget);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx(Modal, { isOpen, onOpenChange: onClose, size: "sm", children: /* @__PURE__ */ jsxs(ModalContent, { children: [
    /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-0.5", children: [
      /* @__PURE__ */ jsx("span", { children: "Set Annual Budget" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-normal text-default-500", children: [
        plan?.year,
        " — ",
        plan?.school
      ] })
    ] }),
    /* @__PURE__ */ jsxs(ModalBody, { children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Annual Budget (₱)",
          placeholder: "e.g. 5000000",
          value,
          onValueChange: setValue,
          type: "number",
          description: "Leave blank and save to remove the budget target."
        }
      ),
      plan?.totalEstimatedCost != null && /* @__PURE__ */ jsxs("div", { className: "text-xs text-default-400 bg-default-50 rounded-lg p-3", children: [
        "Current total expenditure:",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-default-600", children: fmt(plan.totalEstimatedCost) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(ModalFooter, { className: "flex gap-2", children: [
      plan?.annualBudget != null && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "flat",
          color: "danger",
          isLoading: saving,
          onPress: () => call(null),
          children: "Clear"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsx(Button, { variant: "flat", onPress: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: "primary",
          isLoading: saving,
          onPress: () => call(value.trim() ? parseFloat(value.replace(/,/g, "")) : null),
          children: "Save"
        }
      )
    ] })
  ] }) });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Charts", Charts, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/Charts", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
