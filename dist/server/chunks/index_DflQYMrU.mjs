import { c as createComponent } from './astro-component_DKWqRa2-.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_VSg7zcZ5.mjs';
import { a as $fileFilter, $ as $$MainLayout } from './MainLayout_DAtbgNmp.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { useDisclosure, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, Chip, ModalFooter, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Tooltip, Tabs, Tab } from '@heroui/react';
import { a as $token } from './authStore_BMyVodq8.mjs';
import * as XLSX from 'xlsx';
import { createRoot } from 'react-dom/client';

let _addToast = null;
let _counter = 0;
function ToastContainer() {
  const [items, setItems] = useState([]);
  const add = useCallback((t) => {
    const id = ++_counter;
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4e3);
  }, []);
  useEffect(() => {
    _addToast = add;
    return () => {
      _addToast = null;
    };
  }, [add]);
  const dismiss = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const COLORS = {
    success: {
      bg: "bg-[#0f1a0f]",
      border: "border-green-700/60",
      icon: "text-green-400",
      text: "text-green-300"
    },
    error: {
      bg: "bg-[#1a0f0f]",
      border: "border-red-700/60",
      icon: "text-red-400",
      text: "text-red-300"
    },
    warning: {
      bg: "bg-[#1a160f]",
      border: "border-amber-700/60",
      icon: "text-amber-400",
      text: "text-amber-300"
    },
    info: {
      bg: "bg-[#0f131a]",
      border: "border-blue-700/60",
      icon: "text-blue-400",
      text: "text-blue-300"
    }
  };
  const ICONS = {
    success: /* @__PURE__ */ jsx(
      "svg",
      {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" })
      }
    ),
    error: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsx("line", { x1: "15", y1: "9", x2: "9", y2: "15" }),
          /* @__PURE__ */ jsx("line", { x1: "9", y1: "9", x2: "15", y2: "15" })
        ]
      }
    ),
    warning: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
        ]
      }
    ),
    info: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
        ]
      }
    )
  };
  if (!items.length) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:max-w-xs", children: items.map((item) => {
    const c = COLORS[item.type];
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-start gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} shadow-2xl backdrop-blur-xl pointer-events-auto
							animate-in slide-in-from-bottom-2 fade-in duration-200`,
        children: [
          /* @__PURE__ */ jsx("span", { className: `shrink-0 mt-0.5 ${c.icon}`, children: ICONS[item.type] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white leading-snug", children: item.title }),
            item.message && /* @__PURE__ */ jsx("p", { className: `text-xs mt-0.5 leading-snug ${c.text}`, children: item.message })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => dismiss(item.id),
              className: "shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5",
              children: /* @__PURE__ */ jsxs(
                "svg",
                {
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                  ]
                }
              )
            }
          )
        ]
      },
      item.id
    );
  }) });
}
function ensureMounted() {
  if (typeof window === "undefined") return;
  if (document.getElementById("toast-root")) return;
  const el = document.createElement("div");
  el.id = "toast-root";
  document.body.appendChild(el);
  createRoot(el).render(/* @__PURE__ */ jsx(ToastContainer, {}));
}
function show(type, title, message) {
  ensureMounted();
  setTimeout(() => {
    if (_addToast) _addToast({ type, title, message });
  }, 50);
}
const toast = {
  success: (title, message) => show("success", title, message),
  error: (title, message) => show("error", title, message),
  info: (title, message) => show("info", title, message),
  warning: (title, message) => show("warning", title, message)
};

const ALL_COLUMNS$1 = [
  { uid: "no", label: "No.", className: "w-12" },
  { uid: "unspsc", label: "UNSPSC", className: "w-28" },
  { uid: "itemDescription", label: "Item Description" },
  { uid: "specification", label: "Specification" },
  { uid: "unitOfMeasure", label: "Unit", className: "w-16" },
  { uid: "totalQuantity", label: "Qty", className: "text-right w-14" },
  { uid: "price", label: "Unit Price (₱)", className: "text-right w-32" },
  {
    uid: "totalAmount",
    label: "Total Amount (₱)",
    className: "text-right w-32"
  }
];
const MOBILE_VISIBLE$1 = /* @__PURE__ */ new Set([
  "itemDescription",
  "totalQuantity",
  "totalAmount"
]);
const DEFAULT_VISIBLE$1 = /* @__PURE__ */ new Set([
  "no",
  "itemDescription",
  "specification",
  "unitOfMeasure",
  "totalQuantity",
  "price",
  "totalAmount"
]);
function fmtPeso(value) {
  if (value == null) return "—";
  return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function parseAppTemplate(workbook) {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: ""
  });
  const headerRow = rows[1] ?? [];
  const h1 = String(headerRow[0] ?? "").toLowerCase();
  const h2 = String(headerRow[1] ?? "").toLowerCase();
  if (!h1.includes("unspsc") || !h2.includes("item description"))
    return "The file does not match the official APP template. Expected UNSPSC in column A and Item Description in column B of row 2.";
  const items = [];
  for (let ri = 4; ri < rows.length; ri++) {
    const row = rows[ri];
    const desc = String(row[1] ?? "").trim();
    const unspsc = String(row[0] ?? "").trim();
    if (!desc && !unspsc) continue;
    if (desc.toLowerCase().includes("total") || unspsc.toLowerCase().includes("total"))
      break;
    const qty = parseFloat(String(row[4] ?? "").replace(/[₱,\s]/g, "")) || 0;
    const price = parseFloat(String(row[5] ?? "").replace(/[₱,\s]/g, "")) || 0;
    const amt = parseFloat(String(row[6] ?? "").replace(/[₱,\s]/g, "")) || qty * price;
    items.push({
      no: String(ri - 3),
      unspsc: unspsc || void 0,
      itemDescription: desc,
      specification: String(row[2] ?? "").trim(),
      unitOfMeasure: String(row[3] ?? "").trim(),
      totalQuantity: qty,
      price,
      totalAmount: amt
    });
  }
  return items;
}
function ColumnChooser$1({
  visibleCols,
  onChange
}) {
  return /* @__PURE__ */ jsxs(Dropdown, { closeOnSelect: false, children: [
    /* @__PURE__ */ jsx(DropdownTrigger, { children: /* @__PURE__ */ jsx(Button, { variant: "flat", size: "sm", children: "Columns" }) }),
    /* @__PURE__ */ jsx(
      DropdownMenu,
      {
        disallowEmptySelection: true,
        "aria-label": "Toggle columns",
        selectionMode: "multiple",
        selectedKeys: visibleCols,
        onSelectionChange: (k) => onChange(new Set(k)),
        children: ALL_COLUMNS$1.map((col) => /* @__PURE__ */ jsx(DropdownItem, { children: col.label }, col.uid))
      }
    )
  ] });
}
function GrandTotalCard$1({
  yearTotal,
  year,
  itemCount,
  toolbarButtons
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-500 uppercase tracking-wide", children: [
          "Annual Procurement Total — ",
          year
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xl sm:text-2xl font-bold text-primary", children: fmtPeso(yearTotal) })
      ] }),
      /* @__PURE__ */ jsxs(Chip, { size: "sm", variant: "flat", color: "primary", children: [
        itemCount,
        " line items"
      ] })
    ] }),
    toolbarButtons && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 pt-1 border-t border-primary/15 flex-wrap", children: toolbarButtons })
  ] });
}
function MobileItemCard$1({ item }) {
  return /* @__PURE__ */ jsxs("div", { className: "border border-default-200 rounded-xl p-3 flex flex-col gap-2 bg-background", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium leading-snug", children: item.itemDescription }),
    item.specification && /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400", children: item.specification }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-500", children: [
        item.unitOfMeasure,
        " × ",
        item.totalQuantity
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-primary", children: fmtPeso(item.totalAmount) })
    ] })
  ] });
}
function ItemTable({
  items,
  visibleCols,
  isMobile
}) {
  const activeCols = ALL_COLUMNS$1.filter((c) => visibleCols.has(c.uid));
  if (isMobile) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: items.map((item, i) => /* @__PURE__ */ jsx(MobileItemCard$1, { item }, i)) });
  }
  function renderCell(item, uid) {
    switch (uid) {
      case "no":
        return /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-default-400", children: item.no });
      case "unspsc":
        return /* @__PURE__ */ jsx("span", { className: "text-xs font-mono", children: item.unspsc ?? "—" });
      case "itemDescription":
        return /* @__PURE__ */ jsx("span", { className: "font-medium text-sm leading-snug", children: item.itemDescription });
      case "specification":
        return /* @__PURE__ */ jsx("span", { className: "text-xs text-default-500 leading-tight", children: item.specification });
      case "unitOfMeasure":
        return /* @__PURE__ */ jsx("span", { className: "text-xs", children: item.unitOfMeasure });
      case "totalQuantity":
        return /* @__PURE__ */ jsx("span", { className: "block text-right", children: item.totalQuantity });
      case "price":
        return /* @__PURE__ */ jsx("span", { className: "block text-right text-default-600", children: fmtPeso(item.price) });
      case "totalAmount":
        return /* @__PURE__ */ jsx("span", { className: "block text-right font-semibold text-primary", children: fmtPeso(item.totalAmount) });
      default:
        return null;
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { "aria-label": "Annual Procurement Plan items", removeWrapper: true, children: [
    /* @__PURE__ */ jsx(TableHeader, { children: activeCols.map((col) => /* @__PURE__ */ jsx(TableColumn, { className: col.className ?? "", children: col.label }, col.uid)) }),
    /* @__PURE__ */ jsx(TableBody, { emptyContent: "No items found.", items, children: (item) => /* @__PURE__ */ jsx(TableRow, { children: activeCols.map((col) => /* @__PURE__ */ jsx(TableCell, { children: renderCell(item, col.uid) }, col.uid)) }, item.id ?? item.no) })
  ] }) });
}
function AnnualPlanTable() {
  const [planHeaders, setPlanHeaders] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingHeaders, setLoadingHeaders] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE$1);
  const [isMobile, setIsMobile] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const token = useStore($token);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setVisibleCols(mobile ? MOBILE_VISIBLE$1 : DEFAULT_VISIBLE$1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, { type: "binary" });
      const result = parseAppTemplate(workbook);
      if (typeof result === "string") {
        setValidationError(result);
        e.target.value = "";
        return;
      }
      setValidationError(null);
      setFileToUpload(file);
      setPreviewItems(result);
      onOpen();
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };
  const confirmUpload = async () => {
    if (!fileToUpload) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/AnnualProcurementPlan/import`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        toast.error("Import failed", msg);
        return;
      }
      const data = await res.json();
      await fetchPlanHeaders();
      toast.success(
        "Import successful",
        `${data.itemCount} items imported · ${fmtPeso(Number(data.yearTotal))}`
      );
      onClose();
    } catch (err) {
      toast.error("Upload failed", "Could not connect to server.");
    } finally {
      setUploading(false);
    }
  };
  const fetchPlanHeaders = async () => {
    setLoadingHeaders(true);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/AnnualProcurementPlan`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setPlanHeaders(data);
      if (data.length > 0 && !selectedPlan) fetchPlanById(String(data[0].id));
    } finally {
      setLoadingHeaders(false);
    }
  };
  const fetchPlanById = async (planId) => {
    setLoadingItems(true);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/AnnualProcurementPlan/${planId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setSelectedPlan(data);
    } finally {
      setLoadingItems(false);
    }
  };
  useEffect(() => {
    fetchPlanHeaders();
  }, [token]);
  const handleSelectionChange = (keys) => {
    const id = Array.from(keys)[0];
    if (id) fetchPlanById(id);
  };
  const previewTotal = previewItems.reduce(
    (s, i) => s + (Number(i.totalAmount) || 0),
    0
  );
  if (loadingHeaders)
    return /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-8 text-default-500", children: "Loading plans..." });
  const toolbarButtons = /* @__PURE__ */ jsx(Fragment, { children: !isMobile && /* @__PURE__ */ jsx(ColumnChooser$1, { visibleCols, onChange: setVisibleCols }) });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        Select,
        {
          label: "Plan Year",
          className: "flex-1 min-w-0 max-w-xs",
          selectedKeys: selectedPlan ? /* @__PURE__ */ new Set([String(selectedPlan.id)]) : void 0,
          onSelectionChange: handleSelectionChange,
          children: planHeaders.map((p) => /* @__PURE__ */ jsxs(SelectItem, { children: [
            p.year,
            " — ",
            p.fileName
          ] }, p.id))
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          onChange: handleFileChange,
          accept: ".xlsx,.xls",
          className: "hidden"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: "primary",
          size: "sm",
          onPress: () => fileInputRef.current?.click(),
          isLoading: uploading,
          children: uploading ? "Importing..." : "Import Excel"
        }
      ),
      isMobile && /* @__PURE__ */ jsx(ColumnChooser$1, { visibleCols, onChange: setVisibleCols })
    ] }),
    validationError && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 px-3 sm:px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-danger-600 shrink-0", children: "⚠" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-danger-700", children: "Invalid File Format" }),
        /* @__PURE__ */ jsx("span", { className: "text-danger-600 text-xs break-words", children: validationError })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setValidationError(null),
          className: "text-danger-400 hover:text-danger-600 shrink-0",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen,
        onOpenChange,
        size: "full",
        scrollBehavior: "normal",
        classNames: { wrapper: "overflow-hidden" },
        children: /* @__PURE__ */ jsxs(ModalContent, { className: "flex flex-col h-[100dvh] overflow-hidden", children: [
          /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-1 shrink-0 px-4 sm:px-6", children: [
            /* @__PURE__ */ jsx("span", { children: "Preview Import Data" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-normal text-default-500", children: "Review before confirming." })
          ] }),
          /* @__PURE__ */ jsx(ModalBody, { className: "flex-1 overflow-y-auto min-h-0 px-3 sm:px-6 py-3", children: previewItems.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-3 flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs text-default-500 uppercase tracking-wide", children: "Preview Total" }),
                /* @__PURE__ */ jsx("span", { className: "text-xl sm:text-2xl font-bold text-primary", children: fmtPeso(previewTotal) })
              ] }),
              /* @__PURE__ */ jsxs(Chip, { size: "sm", variant: "flat", color: "primary", children: [
                previewItems.length,
                " line items"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              ItemTable,
              {
                items: previewItems,
                visibleCols,
                isMobile
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "text-center text-default-400 p-10", children: "No recognisable items found in the file." }) }),
          /* @__PURE__ */ jsxs(ModalFooter, { className: "shrink-0 px-4 sm:px-6", children: [
            /* @__PURE__ */ jsx(Button, { color: "danger", variant: "flat", size: "sm", onPress: onClose, children: "Cancel" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                color: "primary",
                size: "sm",
                isLoading: uploading,
                onPress: confirmUpload,
                children: "Confirm & Import"
              }
            )
          ] })
        ] })
      }
    ),
    loadingItems ? /* @__PURE__ */ jsx("div", { className: "flex justify-center p-10", children: /* @__PURE__ */ jsx(
      Spinner,
      {
        classNames: { label: "text-foreground mt-4" },
        variant: "wave"
      }
    ) }) : selectedPlan ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg sm:text-2xl font-bold leading-tight", children: [
          "Annual Procurement Plan — ",
          selectedPlan.year
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-default-500 mt-0.5", children: selectedPlan.fileName })
      ] }),
      /* @__PURE__ */ jsx(
        GrandTotalCard$1,
        {
          yearTotal: selectedPlan.yearTotal,
          year: selectedPlan.year,
          itemCount: selectedPlan.items?.length ?? 0,
          toolbarButtons
        }
      ),
      /* @__PURE__ */ jsx(
        ItemTable,
        {
          items: selectedPlan.items ?? [],
          visibleCols,
          isMobile
        }
      )
    ] }) : /* @__PURE__ */ jsx("div", { className: "text-default-500 text-center p-10 text-sm", children: "Select a year to view the Annual Procurement Plan." })
  ] });
}

const ALL_COLUMNS = [
  { uid: "kraArea", label: "KRA", className: "w-[140px]" },
  {
    uid: "specificProgram",
    label: "Specific Program (SiP)",
    className: "w-[120px]"
  },
  { uid: "programActivity", label: "Programs / Projects / Activities" },
  { uid: "purpose", label: "Purpose / Objectives" },
  { uid: "performanceIndicator", label: "Performance Indicator" },
  { uid: "resourceDescription", label: "Resources" },
  { uid: "quantity", label: "Qty", className: "text-right w-12" },
  {
    uid: "estimatedCost",
    label: "Est. Cost (₱)",
    className: "text-right w-32"
  },
  { uid: "accountTitle", label: "Account Title" },
  { uid: "accountCode", label: "Account Code", className: "w-24" },
  { uid: "arCode", label: "AR Code", className: "w-40" },
  { uid: "status", label: "Status", className: "w-28" }
];
const MOBILE_VISIBLE = /* @__PURE__ */ new Set(["programActivity", "estimatedCost", "status"]);
const DEFAULT_VISIBLE = /* @__PURE__ */ new Set([
  "kraArea",
  "specificProgram",
  "programActivity",
  "purpose",
  "quantity",
  "estimatedCost",
  "accountTitle",
  "accountCode",
  "arCode",
  "status"
]);
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const EXPENDITURE_TYPES = [
  "Regular Expenditure",
  "Project Related Expenditure",
  "Repair and Maintenance",
  "Others"
];
const CATEGORY_LABELS = {
  "Regular Expenditure": "Regular",
  "Project Related Expenditure": "Project",
  "Repair and Maintenance": "Repair",
  Others: "Others"
};
const CATEGORY_COLORS = {
  "Regular Expenditure": "primary",
  "Project Related Expenditure": "success",
  "Repair and Maintenance": "warning",
  Others: "secondary"
};
const API = "http://localhost:5109";
const TEMPLATE_SECTIONS = [
  { category: "Regular Expenditure", startCol: 0 },
  { category: "Project Related Expenditure", startCol: 11 },
  { category: "Repair and Maintenance", startCol: 22 },
  { category: "Others", startCol: 33 }
];
const OFF_KRA = 0, OFF_SIP = 1, OFF_PPA = 2, OFF_PURPOSE = 3, OFF_PERF_IND = 4, OFF_RES_DESC = 5, OFF_QTY = 6, OFF_COST = 7, OFF_ACC_TITLE = 8, OFF_ACC_CODE = 9;
const HEADER_ROW_INDEX = 3, DATA_START_INDEX = 4;
const REQUIRED_HEADER_KEYWORDS = [
  "key result area",
  "specific program",
  "programs/projects",
  "estimated",
  "account"
];
function isMonthSheet(n) {
  return MONTH_NAMES.some((m) => n.trim().toLowerCase() === m.toLowerCase());
}
function normalizeMonthName(n) {
  const t = n.trim().toLowerCase();
  return MONTH_NAMES.find((m) => m.toLowerCase() === t) ?? n.trim();
}
function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function parseCost(raw) {
  return parseFloat(String(raw ?? "").replace(/[₱,\s]/g, "")) || 0;
}
function cellStr(row, col) {
  return String(row[col] ?? "").trim();
}
function fmt(n) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function validateSipTemplate(workbook) {
  const monthSheets = workbook.SheetNames.filter(isMonthSheet);
  if (monthSheets.length === 0)
    return "No month-named sheets found. Use the official SIP template.";
  const ws = workbook.Sheets[monthSheets[0]];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: ""
  });
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];
  const headerJoined = headerRow.map((c) => String(c).toLowerCase()).join(" ");
  for (const kw of REQUIRED_HEADER_KEYWORDS)
    if (!headerJoined.includes(kw))
      return `Missing header: "${kw}". Use the official SIP template.`;
  for (const { category, startCol } of TEMPLATE_SECTIONS)
    if (!String(headerRow[startCol] ?? "").toLowerCase().includes("key result area"))
      return `Template mismatch in "${category}" at column ${startCol + 1}.`;
  return null;
}
function parseSchoolPlanWorkbook(workbook) {
  const results = [];
  for (const sheetName of workbook.SheetNames) {
    if (!isMonthSheet(sheetName)) continue;
    const month = normalizeMonthName(sheetName);
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: ""
    });
    const items = [];
    const subTotals = {};
    for (let ri = DATA_START_INDEX; ri < rows.length; ri++) {
      const row = rows[ri];
      for (const { category, startCol } of TEMPLATE_SECTIONS) {
        const kra = cellStr(row, startCol + OFF_KRA);
        const ppa = cellStr(row, startCol + OFF_PPA);
        const sip = cellStr(row, startCol + OFF_SIP);
        if (!kra && !ppa) continue;
        if (kra.toUpperCase() === "NONE" || ppa.toUpperCase() === "NONE")
          continue;
        if (ppa.toUpperCase().includes("SUB-TOTAL") || kra.toUpperCase().includes("SUB-TOTAL")) {
          subTotals[category] = parseCost(row[startCol + OFF_COST]);
          continue;
        }
        if (ppa.toLowerCase().includes("total budget") || kra.toLowerCase().includes("total budget"))
          continue;
        const estimatedCost = parseCost(row[startCol + OFF_COST]);
        if (!ppa && estimatedCost === 0) continue;
        items.push({
          kraArea: kra,
          specificProgram: sip || "Unimplemented",
          programActivity: ppa,
          purpose: cellStr(row, startCol + OFF_PURPOSE),
          performanceIndicator: cellStr(row, startCol + OFF_PERF_IND),
          resourceDescription: cellStr(row, startCol + OFF_RES_DESC),
          quantity: row[startCol + OFF_QTY] ? row[startCol + OFF_QTY] : "",
          estimatedCost,
          accountTitle: cellStr(row, startCol + OFF_ACC_TITLE),
          accountCode: cellStr(row, startCol + OFF_ACC_CODE),
          category
        });
      }
    }
    for (const { category } of TEMPLATE_SECTIONS) {
      if (subTotals[category] === void 0) {
        const t = items.filter((i) => i.category === category).reduce((s, i) => s + i.estimatedCost, 0);
        if (t > 0) subTotals[category] = t;
      }
    }
    const grandTotal = items.reduce((s, i) => s + i.estimatedCost, 0);
    const hasSip = items.some(
      (i) => i.specificProgram && i.specificProgram !== "Unimplemented"
    );
    results.push({ month, hasSip, items, subTotals, grandTotal });
  }
  results.sort(
    (a, b) => (MONTH_NAMES.indexOf(a.month) || 99) - (MONTH_NAMES.indexOf(b.month) || 99)
  );
  return results;
}
function MobileItemCard({ item }) {
  const isApproved = item.status === "Approved" || item.status === 1 || item.status === "1";
  return /* @__PURE__ */ jsxs("div", { className: "border border-default-200 rounded-xl p-3 flex flex-col gap-2 bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium leading-snug flex-1", children: item.programActivity }),
      /* @__PURE__ */ jsx(
        Chip,
        {
          size: "sm",
          variant: "flat",
          color: isApproved ? "success" : "warning",
          className: "shrink-0",
          children: isApproved ? "Verified" : "Implemented"
        }
      )
    ] }),
    item.kraArea && /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400", children: item.kraArea }),
    item.arCode && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-bold text-default-400 tracking-tight", children: "AR Code:" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/projects/${encodeURIComponent(item.arCode)}`,
          className: "text-xs font-mono font-semibold text-primary hover:text-primary-400 transition-colors underline underline-offset-2 flex items-center gap-1",
          children: [
            item.arCode,
            item.isVerified ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-success text-white text-[8px] font-bold", children: "✓" }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-warning/20 text-warning-700 text-[8px] font-bold border border-warning/30", children: "!" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1 pt-1 border-t border-default-50", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-default-500 truncate max-w-[60%]", children: item.accountTitle || "—" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: item.estimatedCost > 0 ? fmt(item.estimatedCost) : "—" })
    ] })
  ] });
}
function ArCodeCell({ row }) {
  if (!row.arCode)
    return /* @__PURE__ */ jsx("span", { className: "text-xs text-default-300 italic", children: "—" });
  return /* @__PURE__ */ jsx(
    Tooltip,
    {
      content: row.isVerified ? "All linked APP items verified ✓" : "Pending photo verification — click to review",
      children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/projects/${encodeURIComponent(row.arCode)}`,
          className: "inline-flex items-center gap-1.5 group",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-primary underline underline-offset-2 group-hover:text-primary-600 transition-colors", children: row.arCode }),
            row.isVerified ? /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center w-4 h-4 rounded-full bg-success text-white text-[9px] font-bold shrink-0", children: "✓" }) : /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center w-4 h-4 rounded-full bg-warning/20 text-warning-700 text-[9px] font-bold shrink-0", children: "!" })
          ]
        }
      )
    }
  );
}
function StatusCell({ row }) {
  return /* @__PURE__ */ jsx(
    Chip,
    {
      size: "sm",
      variant: "flat",
      color: row.isVerified ? "success" : "warning",
      children: row.isVerified ? "Approved" : "Implemented"
    }
  );
}
function renderCell(row, uid) {
  switch (uid) {
    case "kraArea":
      return /* @__PURE__ */ jsx("span", { className: "text-xs text-default-500 leading-tight", children: row.kraArea });
    case "specificProgram":
      return row.specificProgram === "Unimplemented" ? null : /* @__PURE__ */ jsx("span", { className: "text-xs leading-tight", children: row.specificProgram });
    case "programActivity":
      return /* @__PURE__ */ jsx("span", { className: "text-sm leading-snug", children: row.programActivity });
    case "purpose":
      return /* @__PURE__ */ jsx("span", { className: "text-xs leading-tight", children: row.purpose });
    case "performanceIndicator":
      return /* @__PURE__ */ jsx("span", { className: "text-xs leading-tight", children: row.performanceIndicator });
    case "resourceDescription":
      return /* @__PURE__ */ jsx("span", { className: "text-xs leading-tight", children: row.resourceDescription });
    case "quantity":
      return /* @__PURE__ */ jsx("span", { className: "block text-right", children: row.quantity });
    case "estimatedCost":
      return /* @__PURE__ */ jsx("span", { className: "block text-right font-medium", children: row.estimatedCost > 0 ? fmt(row.estimatedCost) : "—" });
    case "accountTitle":
      return /* @__PURE__ */ jsx("span", { className: "text-xs", children: row.accountTitle });
    case "accountCode":
      return /* @__PURE__ */ jsx("span", { className: "text-xs font-mono", children: row.accountCode });
    case "arCode":
      return /* @__PURE__ */ jsx(ArCodeCell, { row });
    case "status":
      return /* @__PURE__ */ jsx(StatusCell, { row });
    default:
      return null;
  }
}
function ColumnChooser({
  visibleCols,
  onChange
}) {
  return /* @__PURE__ */ jsxs(Dropdown, { closeOnSelect: false, children: [
    /* @__PURE__ */ jsx(DropdownTrigger, { children: /* @__PURE__ */ jsx(Button, { variant: "flat", size: "sm", children: "Columns" }) }),
    /* @__PURE__ */ jsx(
      DropdownMenu,
      {
        disallowEmptySelection: true,
        "aria-label": "Toggle columns",
        selectionMode: "multiple",
        selectedKeys: visibleCols,
        onSelectionChange: (k) => onChange(new Set(k)),
        children: ALL_COLUMNS.map((col) => /* @__PURE__ */ jsx(DropdownItem, { children: col.label }, col.uid))
      }
    )
  ] });
}
function TemplateDownloadDropdown() {
  return /* @__PURE__ */ jsxs(Dropdown, { children: [
    /* @__PURE__ */ jsx(DropdownTrigger, { children: /* @__PURE__ */ jsx(Button, { variant: "flat", size: "sm", children: "Templates" }) }),
    /* @__PURE__ */ jsxs(DropdownMenu, { "aria-label": "Download Excel templates", children: [
      /* @__PURE__ */ jsx(
        DropdownItem,
        {
          onPress: () => triggerDownload(
            `${API}/api/Template/SchoolImplementationPlan_Template.xlsx`,
            "SchoolImplementationPlan_Template.xlsx"
          ),
          children: "School Implementation Plan"
        },
        "sip"
      ),
      /* @__PURE__ */ jsx(
        DropdownItem,
        {
          onPress: () => triggerDownload(
            `${API}/api/Template/AnnualProcurementPlan_Template.xlsx`,
            "AnnualProcurementPlan_Template.xlsx"
          ),
          children: "Annual Procurement Plan"
        },
        "app"
      )
    ] })
  ] });
}
function GrandTotalCard({
  sheet,
  annualBudget
}) {
  const monthlyTarget = annualBudget ? annualBudget / 12 : null;
  const overTarget = monthlyTarget && sheet.grandTotal > monthlyTarget;
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-500 uppercase tracking-wide", children: [
        "Total Budget — ",
        sheet.month
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xl sm:text-2xl font-bold text-primary", children: fmt(sheet.grandTotal) }),
      monthlyTarget && /* @__PURE__ */ jsxs(
        "span",
        {
          className: `text-xs mt-0.5 font-medium ${overTarget ? "text-danger-500" : "text-success-600"}`,
          children: [
            overTarget ? "▲" : "▼",
            " vs monthly target ",
            fmt(monthlyTarget)
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 text-sm text-default-500", children: Object.entries(sheet.subTotals).map(([cat, val]) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: CATEGORY_LABELS[cat] ?? cat }),
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-default-700", children: fmt(val) })
    ] }, cat)) })
  ] }) });
}
function MonthTable({
  sheet,
  visibleCols,
  isMobile
}) {
  const categories = Array.from(new Set(sheet.items.map((i) => i.category)));
  const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 pb-4", children: categories.map((cat) => {
    const catItems = sheet.items.filter((i) => i.category === cat);
    const subtotal = sheet.subTotals[cat];
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xs sm:text-sm font-semibold text-default-600 uppercase tracking-wide", children: cat }),
        /* @__PURE__ */ jsxs(
          Chip,
          {
            size: "sm",
            color: CATEGORY_COLORS[cat] ?? "default",
            variant: "flat",
            children: [
              CATEGORY_LABELS[cat] ?? cat,
              " · ",
              catItems.length
            ]
          }
        )
      ] }),
      isMobile ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        catItems.map((item, idx) => /* @__PURE__ */ jsx(MobileItemCard, { item }, idx)),
        subtotal !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2 bg-default-100/80 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-default-500 uppercase tracking-wide", children: "Sub-Total" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: fmt(subtotal) })
        ] }),
        catItems.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400 px-1", children: "No items." })
      ] }) : (
        // Desktop/tablet: scrollable table
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto -mx-0", children: /* @__PURE__ */ jsxs(Table, { "aria-label": `${cat} items`, removeWrapper: true, children: [
          /* @__PURE__ */ jsx(TableHeader, { children: activeCols.map((col) => /* @__PURE__ */ jsx(
            TableColumn,
            {
              className: col.className ?? "",
              children: col.label
            },
            col.uid
          )) }),
          /* @__PURE__ */ jsx(
            TableBody,
            {
              emptyContent: "No items.",
              items: [
                ...catItems.map(
                  (item, idx) => ({ ...item, _rowKey: `item-${idx}` })
                ),
                ...subtotal !== void 0 ? [
                  {
                    _rowKey: "subtotal",
                    _isSubtotal: true,
                    _subtotalValue: subtotal,
                    kraArea: "",
                    specificProgram: "",
                    programActivity: "",
                    purpose: "",
                    performanceIndicator: "",
                    resourceDescription: "",
                    quantity: "",
                    estimatedCost: 0,
                    accountTitle: "",
                    accountCode: "",
                    category: cat
                  }
                ] : []
              ],
              children: (row) => row._isSubtotal ? /* @__PURE__ */ jsx(
                TableRow,
                {
                  className: "bg-default-100/60 font-bold",
                  children: activeCols.map((col) => {
                    if (col.uid === "estimatedCost")
                      return /* @__PURE__ */ jsxs(
                        TableCell,
                        {
                          className: "text-right font-bold text-primary",
                          children: [
                            "₱",
                            row._subtotalValue.toLocaleString("en-PH", {
                              minimumFractionDigits: 2
                            })
                          ]
                        },
                        col.uid
                      );
                    if (col.uid === "accountTitle")
                      return /* @__PURE__ */ jsx(
                        TableCell,
                        {
                          className: "text-right font-semibold text-default-500",
                          children: "Sub-Total"
                        },
                        col.uid
                      );
                    return /* @__PURE__ */ jsx(TableCell, { children: "" }, col.uid);
                  })
                },
                row._rowKey
              ) : /* @__PURE__ */ jsx(TableRow, { children: activeCols.map((col) => /* @__PURE__ */ jsx(TableCell, { children: renderCell(row, col.uid) }, col.uid)) }, row._rowKey)
            }
          )
        ] }) })
      )
    ] }, cat);
  }) });
}
function MonthFilterBar({
  sheets,
  activeMonth,
  onSelect
}) {
  return /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-default-200 px-3 sm:px-6 py-2.5 shrink-0", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide", children: sheets.map((sheet) => {
    const isActive = sheet.month === activeMonth;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => onSelect(sheet.month),
        className: [
          "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0",
          isActive ? "bg-primary text-white shadow" : "bg-default-100 text-default-600 hover:bg-default-200"
        ].join(" "),
        children: [
          sheet.month.slice(0, 3),
          sheet.grandTotal > 0 && /* @__PURE__ */ jsxs(
            "span",
            {
              className: [
                "text-[10px] px-1 py-0.5 rounded-full",
                isActive ? "bg-white/20 text-white" : "bg-default-200 text-default-500"
              ].join(" "),
              children: [
                "₱",
                (sheet.grandTotal / 1e3).toFixed(0),
                "k"
              ]
            }
          )
        ]
      },
      sheet.month
    );
  }) }) });
}
function MonthTabBar({
  sheets,
  activeMonth,
  onSelect
}) {
  const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 pb-2 border-b border-default-200 overflow-x-auto scrollbar-hide", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => onSelect("TOTAL"),
        className: [
          "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
          activeMonth === "TOTAL" ? "bg-default-800 text-white shadow" : "bg-default-100 text-default-600 hover:bg-default-200"
        ].join(" "),
        children: [
          "Total",
          planTotal > 0 && /* @__PURE__ */ jsxs(
            "span",
            {
              className: [
                "text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
                activeMonth === "TOTAL" ? "bg-white/20 text-white" : "bg-default-200 text-default-500"
              ].join(" "),
              children: [
                "₱",
                (planTotal / 1e6).toFixed(2),
                "M"
              ]
            }
          )
        ]
      }
    ),
    sheets.map((sheet) => {
      const isActive = sheet.month === activeMonth;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onSelect(sheet.month),
          className: [
            "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
            isActive ? "bg-primary text-white shadow" : "bg-default-100 text-default-600 hover:bg-default-200"
          ].join(" "),
          children: [
            /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: sheet.month.slice(0, 3) }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: sheet.month }),
            sheet.grandTotal > 0 && /* @__PURE__ */ jsxs(
              "span",
              {
                className: [
                  "text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-default-200 text-default-500"
                ].join(" "),
                children: [
                  "₱",
                  (sheet.grandTotal / 1e3).toFixed(0),
                  "k"
                ]
              }
            )
          ]
        },
        sheet.month
      );
    })
  ] });
}
function TotalView({
  sheets,
  annualBudget
}) {
  const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
  const budget = annualBudget ?? null;
  const remaining = budget != null ? budget - planTotal : null;
  const utilPct = budget != null && budget > 0 ? Math.min(planTotal / budget * 100, 100) : null;
  const overBudget = budget != null && planTotal > budget;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-default-800 text-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-white/50 mb-1", children: "Annual Total Expenditure" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl sm:text-3xl font-bold", children: fmt(planTotal) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 uppercase tracking-wide mb-1", children: "Months with data" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl sm:text-2xl font-semibold", children: [
          sheets.filter((s) => s.grandTotal > 0).length,
          " / ",
          sheets.length
        ] })
      ] })
    ] }),
    budget != null && /* @__PURE__ */ jsxs(
      "div",
      {
        className: [
          "rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4",
          overBudget ? "bg-danger-50 border-danger-200" : "bg-primary/5 border-primary/20"
        ].join(" "),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide mb-0.5", children: "Expenditure" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg sm:text-2xl font-bold text-primary", children: fmt(planTotal) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-right sm:text-right", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide mb-0.5", children: "Budget" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg sm:text-2xl font-bold text-default-700", children: fmt(budget) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col col-span-2 sm:col-span-1 sm:text-right", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide mb-0.5", children: overBudget ? "Over Budget" : "Remaining" }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `text-lg sm:text-2xl font-bold ${overBudget ? "text-danger-600" : "text-success-600"}`,
                  children: [
                    overBudget ? "+" : "",
                    fmt(Math.abs(remaining))
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-default-500", children: [
              /* @__PURE__ */ jsx("span", { children: overBudget ? "Over budget" : `${utilPct.toFixed(1)}% utilised` }),
              /* @__PURE__ */ jsxs("span", { children: [
                fmt(planTotal),
                " of ",
                fmt(budget)
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 bg-default-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-full rounded-full transition-all ${overBudget ? "bg-danger-500" : "bg-primary"}`,
                style: { width: `${Math.min(utilPct ?? 0, 100)}%` }
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-default-200 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-default-50 border-b border-default-200", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide", children: "Month" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide", children: "Expenditure" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 sm:px-4 py-3 w-32 sm:w-52 hidden sm:table-cell" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: sheets.map((sheet) => {
        const pct = planTotal > 0 ? sheet.grandTotal / planTotal * 100 : 0;
        const hasData = sheet.grandTotal > 0;
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: [
              "border-b border-default-100 hover:bg-default-50/60 transition-colors",
              !hasData ? "opacity-40" : ""
            ].join(" "),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 sm:px-4 py-2.5", children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: hasData ? "font-medium" : "text-default-400",
                  children: sheet.month
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 sm:px-4 py-2.5 text-right font-semibold tabular-nums", children: hasData ? /* @__PURE__ */ jsx("span", { className: "text-primary", children: fmt(sheet.grandTotal) }) : /* @__PURE__ */ jsx("span", { className: "text-default-300 font-normal", children: "—" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 sm:px-4 py-2.5 hidden sm:table-cell", children: hasData && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-default-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full bg-primary rounded-full",
                    style: { width: `${pct}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-default-400 w-10 text-right tabular-nums", children: [
                  pct.toFixed(1),
                  "%"
                ] })
              ] }) })
            ]
          },
          sheet.month
        );
      }) }),
      /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-default-100 border-t-2 border-default-300", children: [
        /* @__PURE__ */ jsx("td", { className: "px-3 sm:px-4 py-3 font-bold text-default-700 uppercase text-xs tracking-wide", children: "TOTAL" }),
        /* @__PURE__ */ jsx("td", { className: "px-3 sm:px-4 py-3 text-right font-bold text-base sm:text-lg text-primary tabular-nums", children: fmt(planTotal) }),
        /* @__PURE__ */ jsx("td", { className: "hidden sm:table-cell px-4 py-3" })
      ] }) })
    ] }) })
  ] });
}
function AddItemModal({
  activeMonth,
  token,
  isOpen,
  onClose,
  onAdded
}) {
  const yr = (/* @__PURE__ */ new Date()).getFullYear();
  const mi = MONTH_NAMES.indexOf(activeMonth);
  const initialDate = mi >= 0 ? `${yr}-${String(mi + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
  const blank = {
    date: initialDate,
    kra: "",
    sipProgram: "",
    activity: "",
    purpose: "",
    indicator: "",
    resources: "",
    quantity: "",
    estimatedCost: "",
    accountTitle: "",
    accountCode: "",
    expenditureType: "Regular Expenditure",
    status: "Implemented"
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const m = MONTH_NAMES.indexOf(activeMonth);
    const d = m >= 0 ? `${yr}-${String(m + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
    setForm((f) => ({ ...f, date: d }));
  }, [activeMonth, isOpen]);
  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));
  const save = async () => {
    if (!form.activity || !form.estimatedCost) return;
    setSaving(true);
    try {
      await fetch(
        `https://i3p-server-1.onrender.com/api/SchoolImplementation/item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            date: form.date,
            kra: form.kra || null,
            sipProgram: form.sipProgram || "Unimplemented",
            activity: form.activity,
            purpose: form.purpose || null,
            indicator: form.indicator || null,
            resources: form.resources || null,
            quantity: form.quantity || null,
            estimatedCost: parseFloat(form.estimatedCost) || 0,
            accountTitle: form.accountTitle || null,
            accountCode: form.accountCode || null,
            expenditureType: form.expenditureType,
            status: form.status === "Approved" ? 1 : 0
          })
        }
      );
      setForm(blank);
      onAdded();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onOpenChange: onClose,
      size: "lg",
      scrollBehavior: "inside",
      children: /* @__PURE__ */ jsxs(ModalContent, { children: [
        /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "Add Implementation Item" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-default-500", children: "An AR code will be auto-generated." })
        ] }),
        /* @__PURE__ */ jsx(ModalBody, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Date",
              type: "date",
              value: form.date,
              onValueChange: set("date"),
              className: "col-span-1 sm:col-span-2"
            }
          ),
          /* @__PURE__ */ jsx(
            Select,
            {
              label: "Expenditure Type",
              className: "col-span-1 sm:col-span-2",
              selectedKeys: [form.expenditureType],
              onSelectionChange: (k) => set("expenditureType")(Array.from(k)[0]),
              children: EXPENDITURE_TYPES.map((t) => /* @__PURE__ */ jsx(SelectItem, { children: t }, t))
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "KRA",
              value: form.kra,
              onValueChange: set("kra"),
              className: "col-span-1 sm:col-span-2"
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Specific Program (SiP)",
              value: form.sipProgram,
              onValueChange: set("sipProgram")
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Activity / PPA",
              value: form.activity,
              onValueChange: set("activity"),
              isRequired: true
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Purpose",
              value: form.purpose,
              onValueChange: set("purpose"),
              className: "col-span-1 sm:col-span-2"
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Performance Indicator",
              value: form.indicator,
              onValueChange: set("indicator"),
              className: "col-span-1 sm:col-span-2"
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Resources",
              value: form.resources,
              onValueChange: set("resources")
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Quantity",
              value: form.quantity,
              onValueChange: set("quantity")
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Estimated Cost (₱)",
              value: form.estimatedCost,
              onValueChange: set("estimatedCost"),
              type: "number",
              isRequired: true
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-default-600", children: "Status" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["Implemented", "Approved"].map((s) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm((f) => ({ ...f, status: s })),
                className: [
                  "flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all",
                  form.status === s ? s === "Approved" ? "border-success bg-success/10 text-success-700" : "border-warning bg-warning/10 text-warning-700" : "border-default-200 text-default-500 hover:border-default-300"
                ].join(" "),
                children: s
              },
              s
            )) })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Account Title",
              value: form.accountTitle,
              onValueChange: set("accountTitle"),
              className: "col-span-1 sm:col-span-2"
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Account Code",
              value: form.accountCode,
              onValueChange: set("accountCode")
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(ModalFooter, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "flat", onPress: onClose, children: "Cancel" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              color: "primary",
              isLoading: saving,
              onPress: save,
              isDisabled: !form.activity || !form.estimatedCost,
              children: "Add Item"
            }
          )
        ] })
      ] })
    }
  );
}
function SeedFakeBanner({
  planId,
  items,
  token,
  onDone
}) {
  const [loading, setLoading] = useState(false);
  const seed = async () => {
    setLoading(true);
    try {
      await fetch(
        `https://i3p-server-1.onrender.com/api/Ar/seed-fake-links/${items[0].id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onDone();
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-warning-50 border border-warning-200 rounded-xl text-sm", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-warning-700 font-medium", children: [
      items.length,
      " SIP item",
      items.length !== 1 ? "s" : "",
      " without an AR code."
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        color: "warning",
        variant: "flat",
        isLoading: loading,
        onPress: seed,
        children: "Seed fake APP items (dev)"
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "text-warning-500 text-xs", children: "Generates 3 test APP items linked to the first unlinked row." })
  ] });
}
function SchoolPlanTable() {
  const [planHeaders, setPlanHeaders] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeMonth, setActiveMonth] = useState("January");
  const [loadingHeaders, setLoadingHeaders] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [validationError, setValidationError] = useState(null);
  const [previewSheets, setPreviewSheets] = useState([]);
  const [previewActiveMonth, setPreviewActiveMonth] = useState("January");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: addItemOpen,
    onOpen: openAddItem,
    onClose: closeAddItem
  } = useDisclosure();
  const token = useStore($token);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setVisibleCols(mobile ? MOBILE_VISIBLE : DEFAULT_VISIBLE);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, { type: "binary" });
      const error = validateSipTemplate(workbook);
      if (error) {
        setValidationError(error);
        e.target.value = "";
        return;
      }
      setValidationError(null);
      setFileToUpload(file);
      const parsed = parseSchoolPlanWorkbook(workbook);
      setPreviewSheets(parsed);
      setPreviewActiveMonth(parsed[0]?.month ?? "January");
      onOpen();
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };
  const confirmUpload = async () => {
    if (!fileToUpload) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/SchoolImplementation/import`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );
      if (!res.ok) {
        toast.error("Import failed", await res.text());
        return;
      }
      const data = await res.json();
      await fetchPlanHeaders();
      toast.success(
        "Import successful",
        data.message ?? `${data.itemCount} items imported`
      );
      onClose();
    } catch {
      toast.error("Upload failed", "Could not connect to server.");
    } finally {
      setUploading(false);
    }
  };
  const fetchPlanHeaders = async () => {
    setLoadingHeaders(true);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/SchoolImplementation`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setPlanHeaders(data);
      if (data.length > 0 && !selectedPlan) fetchPlanById(data[0].id);
    } finally {
      setLoadingHeaders(false);
    }
  };
  const fetchPlanById = async (planId) => {
    setLoadingItems(true);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/SchoolImplementation/${planId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setSelectedPlan(data);
      setActiveMonth(data.months?.[0]?.month ?? "January");
    } finally {
      setLoadingItems(false);
    }
  };
  useEffect(() => {
    fetchPlanHeaders();
  }, [token]);
  const handleSelectionChange = (keys) => {
    const id = Array.from(keys)[0];
    if (id) fetchPlanById(id);
  };
  const activeSheet = selectedPlan?.months?.find(
    (m) => m.month === activeMonth
  );
  const previewSheet = previewSheets.find(
    (m) => m.month === previewActiveMonth
  );
  const unlinkedItems = (activeSheet?.items ?? []).filter(
    (i) => !i.arCode && i.id != null
  );
  if (loadingHeaders)
    return /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-8 text-default-500", children: "Loading plans..." });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        Select,
        {
          label: "Plan Year",
          className: "flex-1 min-w-0 max-w-xs",
          selectedKeys: selectedPlan ? /* @__PURE__ */ new Set([String(selectedPlan.id)]) : void 0,
          onSelectionChange: handleSelectionChange,
          children: planHeaders.map((p) => /* @__PURE__ */ jsxs(SelectItem, { children: [
            p.year,
            " — ",
            p.school
          ] }, p.id))
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          onChange: handleFileChange,
          accept: ".xlsx,.xls",
          className: "hidden"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: "primary",
          size: "sm",
          onPress: () => fileInputRef.current?.click(),
          isLoading: uploading,
          children: uploading ? "Importing..." : "Import Excel"
        }
      )
    ] }),
    validationError && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 px-3 sm:px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-danger-600 shrink-0", children: "⚠" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-danger-700", children: "Invalid File Format" }),
        /* @__PURE__ */ jsx("span", { className: "text-danger-600 text-xs break-words", children: validationError })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setValidationError(null),
          className: "text-danger-400 hover:text-danger-600 shrink-0",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen,
        onOpenChange,
        size: "full",
        scrollBehavior: "normal",
        classNames: { wrapper: "overflow-hidden" },
        children: /* @__PURE__ */ jsxs(ModalContent, { className: "flex flex-col h-[100dvh] overflow-hidden", children: [
          /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-1 shrink-0 px-4 sm:px-6", children: [
            /* @__PURE__ */ jsx("span", { children: "Preview Import Data" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-normal text-default-500", children: "Review before confirming." })
          ] }),
          /* @__PURE__ */ jsx(ModalBody, { className: "flex-1 overflow-y-auto min-h-0 px-3 sm:px-6 py-3", children: previewSheets.length > 0 ? previewSheet ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx(GrandTotalCard, { sheet: previewSheet }),
            /* @__PURE__ */ jsx(
              MonthTable,
              {
                sheet: previewSheet,
                visibleCols,
                isMobile
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "text-center text-default-400 p-10", children: "Select a month below." }) : /* @__PURE__ */ jsx("div", { className: "text-center text-default-400 p-10", children: "No data found in file." }) }),
          previewSheets.length > 0 && /* @__PURE__ */ jsx(
            MonthFilterBar,
            {
              sheets: previewSheets,
              activeMonth: previewActiveMonth,
              onSelect: setPreviewActiveMonth
            }
          ),
          /* @__PURE__ */ jsxs(ModalFooter, { className: "shrink-0 px-4 sm:px-6", children: [
            /* @__PURE__ */ jsx(Button, { color: "danger", variant: "flat", size: "sm", onPress: onClose, children: "Cancel" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                color: "primary",
                size: "sm",
                isLoading: uploading,
                onPress: confirmUpload,
                children: "Confirm & Import"
              }
            )
          ] })
        ] })
      }
    ),
    loadingItems ? /* @__PURE__ */ jsx("div", { className: "flex justify-center p-10", children: /* @__PURE__ */ jsx(
      Spinner,
      {
        classNames: { label: "text-foreground mt-4" },
        variant: "wave"
      }
    ) }) : selectedPlan ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg sm:text-2xl font-bold leading-tight", children: [
          "School Implementation Plan — ",
          selectedPlan.year
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-default-500 mt-0.5", children: selectedPlan.school })
      ] }),
      /* @__PURE__ */ jsx(
        MonthTabBar,
        {
          sheets: selectedPlan.months ?? [],
          activeMonth,
          onSelect: setActiveMonth
        }
      ),
      activeMonth === "TOTAL" ? /* @__PURE__ */ jsx(
        TotalView,
        {
          sheets: selectedPlan.months ?? [],
          annualBudget: selectedPlan.annualBudget
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        activeSheet && /* @__PURE__ */ jsx(
          GrandTotalCard,
          {
            sheet: activeSheet,
            annualBudget: selectedPlan.annualBudget
          }
        ),
        unlinkedItems.length > 0 && /* @__PURE__ */ jsx(
          SeedFakeBanner,
          {
            planId: selectedPlan.id,
            items: unlinkedItems,
            token,
            onDone: () => fetchPlanById(selectedPlan.id)
          }
        ),
        activeSheet && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap border border-default-200 rounded-xl px-4 py-2.5 bg-default-50/50", children: [
          /* @__PURE__ */ jsx(
            ColumnChooser,
            {
              visibleCols,
              onChange: setVisibleCols
            }
          ),
          /* @__PURE__ */ jsx(TemplateDownloadDropdown, {}),
          /* @__PURE__ */ jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsx(Button, { color: "success", size: "sm", onPress: openAddItem, children: "+ Add Item" })
        ] }),
        activeSheet ? /* @__PURE__ */ jsx(
          MonthTable,
          {
            sheet: activeSheet,
            visibleCols,
            isMobile
          }
        ) : /* @__PURE__ */ jsx("div", { className: "text-center text-default-400 p-10", children: "Select a month above." })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "text-default-500 text-center p-10 text-sm", children: "Select a year to view the School Implementation Plan." }),
    selectedPlan && /* @__PURE__ */ jsx(
      AddItemModal,
      {
        activeMonth: activeMonth === "TOTAL" ? "January" : activeMonth,
        token,
        isOpen: addItemOpen,
        onClose: closeAddItem,
        onAdded: () => fetchPlanById(selectedPlan.id)
      }
    )
  ] });
}

function ProjectTable() {
  const filter = useStore($fileFilter);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const tableMap = {
    "Item Procurement List": AnnualPlanTable,
    "General Expenditure Summary": SchoolPlanTable
  };
  const SelectedTable = tableMap[filter] ?? SchoolPlanTable;
  if (!mounted) return /* @__PURE__ */ jsx("div", { className: "p-4 opacity-0", children: "Loading..." });
  const handleFilterChange = (key) => {
    $fileFilter.set(key);
  };
  return /* @__PURE__ */ jsxs("div", { className: "px-3 sm:px-6 py-4 pb-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 mb-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold", children: filter }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden w-full", children: /* @__PURE__ */ jsxs(
        Tabs,
        {
          selectedKey: filter,
          onSelectionChange: handleFilterChange,
          "aria-label": "Table View Selection",
          fullWidth: true,
          size: "md",
          color: "primary",
          children: [
            /* @__PURE__ */ jsx(Tab, { title: "School Plan" }, "General Expenditure Summary"),
            /* @__PURE__ */ jsx(Tab, { title: "Annual Plan" }, "Item Procurement List")
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(SelectedTable, {})
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ProjectTable", ProjectTable, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/ProjectTable", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/projects/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/projects/index.astro";
const $$url = "/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
