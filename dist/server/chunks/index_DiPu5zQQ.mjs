import { c as createComponent } from './astro-component_DduJEcoZ.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_Cawgcfpy.mjs';
import { $ as $$MainLayout } from './MainLayout_D2DXQPA9.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useDisclosure, Select, SelectItem, Button, Chip, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, Textarea, ModalFooter } from '@heroui/react';
import { a as $token } from './authStore_BMyVodq8.mjs';

const STATUS_MAP = {
  0: "Unmatched",
  1: "PendingReview",
  2: "Verified",
  3: "Rejected",
  4: "Orphaned"
};
const BASE = "https://i3p-server-1.onrender.com/api/PlanCrossReference";
function statusLabel(n) {
  return STATUS_MAP[n] ?? "Unmatched";
}
function StatusChip({ status }) {
  const label = statusLabel(status);
  const colorMap = {
    Unmatched: "default",
    PendingReview: "warning",
    Verified: "success",
    Rejected: "danger",
    Orphaned: "default"
  };
  return /* @__PURE__ */ jsx(Chip, { size: "sm", color: colorMap[label], variant: "flat", children: label });
}
function fmt(n) {
  if (n == null) return "—";
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function ReviewModal({
  row,
  action,
  isOpen,
  onClose,
  onDone,
  token
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!row) return;
    setLoading(true);
    try {
      await fetch(`${BASE}/review/${row.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, adminNote: note, reviewedBy: "admin" })
      });
      onDone();
      onClose();
    } finally {
      setLoading(false);
      setNote("");
    }
  };
  return /* @__PURE__ */ jsx(Modal, { isOpen, onOpenChange: onClose, size: "md", children: /* @__PURE__ */ jsxs(ModalContent, { children: [
    /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: action === "verify" ? "text-success" : "text-danger",
          children: action === "verify" ? "✓ Verify Match" : "✗ Reject Match"
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-normal text-default-500", children: [
        row?.appItemDescription ?? "APP Item",
        " ↔",
        " ",
        row?.sipItemActivity ?? "SIP Item"
      ] })
    ] }),
    /* @__PURE__ */ jsx(ModalBody, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 bg-default-50 rounded-xl p-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400", children: "APP Price" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmt(row?.appItemPrice) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400", children: "SIP Cost" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmt(row?.sipItemCost) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400", children: "Match Score" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: row ? `${(row.matchScore * 100).toFixed(1)}%` : "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          label: "Admin note (optional)",
          placeholder: "Reason for this decision…",
          value: note,
          onValueChange: setNote,
          minRows: 2
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(ModalFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "flat", onPress: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: action === "verify" ? "success" : "danger",
          isLoading: loading,
          onPress: submit,
          children: action === "verify" ? "Confirm Verify" : "Confirm Reject"
        }
      )
    ] })
  ] }) });
}
function MatchPage() {
  const token = useStore($token);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const [year, setYear] = useState(currentYear);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeRow, setActiveRow] = useState(null);
  const [reviewAction, setReviewAction] = useState(
    "verify"
  );
  const headers = { Authorization: `Bearer ${token}` };
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rowsRes, summaryRes] = await Promise.all([
        fetch(`${BASE}/${year}`, { headers }),
        fetch(`${BASE}/summary/${year}`, { headers })
      ]);
      const [rowsData, summaryData] = await Promise.all([
        rowsRes.json(),
        summaryRes.json()
      ]);
      setRows(rowsData);
      setSummary(summaryData);
    } finally {
      setLoading(false);
    }
  }, [year, token]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const runMatch = async () => {
    setRunning(true);
    try {
      await fetch(`${BASE}/match/${year}`, {
        method: "POST",
        headers
      });
      await fetchData();
    } finally {
      setRunning(false);
    }
  };
  const openReview = (row, action) => {
    setActiveRow(row);
    setReviewAction(action);
    onOpen();
  };
  const pendingRows = rows.filter(
    (r) => statusLabel(r.status) === "PendingReview" || statusLabel(r.status) === "Verified"
  );
  const unmatchedRows = rows.filter(
    (r) => statusLabel(r.status) === "Unmatched" || statusLabel(r.status) === "Rejected" || statusLabel(r.status) === "Orphaned"
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Cross-Reference Matching" }),
        /* @__PURE__ */ jsx("p", { className: "text-default-500 text-sm mt-0.5", children: "Match Annual Procurement Plan items against School Implementation Plan items by cost." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-center", children: [
        /* @__PURE__ */ jsx(
          Select,
          {
            label: "Fiscal Year",
            className: "w-36",
            selectedKeys: [String(year)],
            onSelectionChange: (keys) => setYear(Number(Array.from(keys)[0])),
            size: "sm",
            children: yearOptions.map((y) => /* @__PURE__ */ jsx(SelectItem, { children: String(y) }, String(y)))
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            color: "primary",
            size: "sm",
            isLoading: running,
            onPress: runMatch,
            children: running ? "Running…" : "Run Matching"
          }
        )
      ] })
    ] }),
    summary && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: [
      {
        label: "Total APP Items",
        value: summary.totalAppItems,
        color: "default"
      },
      {
        label: "Pending Review",
        value: summary.pendingReview,
        color: "warning"
      },
      {
        label: "Verified",
        value: summary.verified,
        color: "success"
      },
      {
        label: "Unmatched",
        value: summary.unmatched,
        color: "default"
      },
      {
        label: "Rejected",
        value: summary.rejected,
        color: "danger"
      },
      {
        label: "Orphaned",
        value: summary.orphaned,
        color: "default"
      }
    ].map(({ label, value, color }) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex flex-col items-center bg-default-50 border border-default-200 rounded-xl px-4 py-2 min-w-[90px]",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: value }),
          /* @__PURE__ */ jsx(
            Chip,
            {
              size: "sm",
              color,
              variant: "flat",
              className: "mt-1 text-[10px]",
              children: label
            }
          )
        ]
      },
      label
    )) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Spinner, { label: "Loading cross-references…" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Matched Items" }),
          /* @__PURE__ */ jsxs(Chip, { size: "sm", color: "warning", variant: "flat", children: [
            pendingRows.length,
            " rows"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: "Pending review and verified matches — confirm or reject each link below." })
        ] }),
        /* @__PURE__ */ jsxs(Table, { "aria-label": "Matched items", removeWrapper: true, children: [
          /* @__PURE__ */ jsxs(TableHeader, { children: [
            /* @__PURE__ */ jsx(TableColumn, { className: "w-8", children: "#" }),
            /* @__PURE__ */ jsx(TableColumn, { children: "APP Item" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-32", children: "APP Price" }),
            /* @__PURE__ */ jsx(TableColumn, { children: "SIP Activity" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-32", children: "SIP Cost" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "w-24 text-right", children: "Score" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "w-32", children: "Status" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "w-40 text-center", children: "Actions" })
          ] }),
          /* @__PURE__ */ jsx(TableBody, { emptyContent: "No matched items yet. Run matching to find candidates.", children: pendingRows.map((row, idx) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "text-default-400 text-xs", children: idx + 1 }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm leading-tight", children: row.appItemDescription ?? "—" }),
              row.isOrphaned && /* @__PURE__ */ jsx(
                Chip,
                {
                  size: "sm",
                  color: "default",
                  variant: "flat",
                  className: "ml-1 text-[10px]",
                  children: "orphaned"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: fmt(row.appItemPrice) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm leading-tight", children: row.sipItemActivity ?? "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: fmt(row.sipItemCost) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: [
                  "text-sm font-semibold",
                  row.matchScore === 1 ? "text-success-600" : "text-warning-600"
                ].join(" "),
                children: [
                  (row.matchScore * 100).toFixed(1),
                  "%"
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { status: row.status }) }),
            /* @__PURE__ */ jsx(TableCell, { children: statusLabel(row.status) === "PendingReview" ? /* @__PURE__ */ jsxs("div", { className: "flex gap-1 justify-center", children: [
              /* @__PURE__ */ jsx(Tooltip, { content: "Verify this match", children: /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  color: "success",
                  variant: "flat",
                  isIconOnly: true,
                  onPress: () => openReview(row, "verify"),
                  children: "✓"
                }
              ) }),
              /* @__PURE__ */ jsx(Tooltip, { content: "Reject this match", children: /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  color: "danger",
                  variant: "flat",
                  isIconOnly: true,
                  onPress: () => openReview(row, "reject"),
                  children: "✗"
                }
              ) })
            ] }) : /* @__PURE__ */ jsx("div", { className: "flex gap-1 justify-center", children: /* @__PURE__ */ jsx(Tooltip, { content: row.adminNote ?? "No note", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 cursor-help", children: row.reviewedBy ?? "—" }) }) }) })
          ] }, row.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Unmatched Items" }),
          /* @__PURE__ */ jsxs(Chip, { size: "sm", color: "default", variant: "flat", children: [
            unmatchedRows.length,
            " rows"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: "APP items with no SIP cost match, rejected candidates, and orphaned links." })
        ] }),
        /* @__PURE__ */ jsxs(Table, { "aria-label": "Unmatched items", removeWrapper: true, children: [
          /* @__PURE__ */ jsxs(TableHeader, { children: [
            /* @__PURE__ */ jsx(TableColumn, { className: "w-8", children: "#" }),
            /* @__PURE__ */ jsx(TableColumn, { children: "APP Item" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-32", children: "APP Price" }),
            /* @__PURE__ */ jsx(TableColumn, { className: "w-32", children: "Status" }),
            /* @__PURE__ */ jsx(TableColumn, { children: "Note" }),
            /* @__PURE__ */ jsx(TableColumn, { children: "Detected" })
          ] }),
          /* @__PURE__ */ jsx(TableBody, { emptyContent: "No unmatched items for this year.", children: unmatchedRows.map((row, idx) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "text-default-400 text-xs", children: idx + 1 }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm leading-tight", children: row.appItemDescription ?? "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: fmt(row.appItemPrice) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { status: row.status }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: row.adminNote ?? "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: new Date(row.detectedAt).toLocaleDateString("en-PH") }) })
          ] }, row.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ReviewModal,
      {
        row: activeRow,
        action: reviewAction,
        isOpen,
        onClose,
        onDone: fetchData,
        token
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MatchPage", MatchPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/MatchPage", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/match/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/match/index.astro";
const $$url = "/match";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
