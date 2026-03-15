import { c as createComponent } from './astro-component_DduJEcoZ.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_Cawgcfpy.mjs';
import { $ as $$MainLayout } from './MainLayout_D2DXQPA9.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { useDisclosure, Spinner, Button, Chip, Progress, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, Input, ModalFooter } from '@heroui/react';
import { a as $token } from './authStore_BMyVodq8.mjs';

const API = "http://localhost:5109";
function fmt(n) {
  if (n == null) return "—";
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function ImageViewerModal({
  item,
  isOpen,
  onClose,
  token,
  onVerified
}) {
  const [verifying, setVerifying] = useState(false);
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [item]);
  if (!item) return null;
  const photoUrl = item.photoPath ? `${API}/${item.photoPath}` : null;
  const downloadUrl = photoUrl;
  const filename = item.photoPath?.split("/").pop() ?? "receipt";
  const verify = async () => {
    setVerifying(true);
    try {
      await fetch(
        `https://i3p-server-1.onrender.com/api/Ar/verify-photo/${item.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ verifiedBy: "admin" })
        }
      );
      onVerified();
      onClose();
    } finally {
      setVerifying(false);
    }
  };
  const downloadFile = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onOpenChange: onClose,
      size: "3xl",
      scrollBehavior: "inside",
      children: /* @__PURE__ */ jsxs(ModalContent, { children: [
        /* @__PURE__ */ jsxs(ModalHeader, { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Photo Evidence" }),
            item.isPhotoVerified && /* @__PURE__ */ jsx(Chip, { size: "sm", color: "success", variant: "flat", children: "Verified ✓" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-default-500 truncate", children: item.itemDescription ?? "APP Item" })
        ] }),
        /* @__PURE__ */ jsxs(ModalBody, { className: "px-6 pb-2", children: [
          !photoUrl ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-64 bg-default-50 rounded-xl border border-dashed border-default-200 text-default-400", children: [
            /* @__PURE__ */ jsxs(
              "svg",
              {
                "aria-hidden": true,
                width: "40",
                height: "40",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                className: "mb-3 opacity-40",
                children: [
                  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                  /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
                  /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "No photo uploaded" })
          ] }) : item.photoPath?.toLowerCase().endsWith(".pdf") ? (
            // PDF — embed viewer
            /* @__PURE__ */ jsx("div", { className: "w-full h-[500px] rounded-xl overflow-hidden border border-default-200", children: /* @__PURE__ */ jsx(
              "iframe",
              {
                src: photoUrl,
                className: "w-full h-full",
                title: "Receipt PDF"
              }
            ) })
          ) : imgError ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-64 bg-danger-50 rounded-xl border border-danger-200 text-danger-500 gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Could not load image" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "flat",
                color: "primary",
                onPress: downloadFile,
                children: "Download instead"
              }
            )
          ] }) : (
            // Image — show full-size with zoom-on-hover feel
            /* @__PURE__ */ jsxs("div", { className: "relative w-full rounded-xl overflow-hidden border border-default-200 bg-default-50 flex items-center justify-center min-h-[300px]", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: photoUrl,
                  alt: `Receipt for ${item.itemDescription}`,
                  className: "max-w-full max-h-[520px] object-contain",
                  onError: () => setImgError(true)
                }
              ),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: photoUrl,
                  download: filename,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors backdrop-blur-sm",
                  children: [
                    /* @__PURE__ */ jsxs(
                      "svg",
                      {
                        "aria-hidden": true,
                        width: "13",
                        height: "13",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: [
                          /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                          /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
                          /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
                        ]
                      }
                    ),
                    "Download"
                  ]
                }
              )
            ] })
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-default-50 rounded-xl p-3 flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Unit Price" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: fmt(item.price) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-default-50 rounded-xl p-3 flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Total Amount" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: fmt(item.totalAmount) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-default-50 rounded-xl p-3 flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Quantity" }),
              /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
                item.totalQuantity ?? "—",
                " ",
                item.unitOfMeasure ?? ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-default-50 rounded-xl p-3 flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 uppercase tracking-wide", children: "Verification" }),
              item.isPhotoVerified ? /* @__PURE__ */ jsxs("span", { className: "text-success-600 font-semibold text-xs", children: [
                "✓ Verified by ",
                item.verifiedBy ?? "admin",
                item.verifiedAt && ` on ${new Date(item.verifiedAt).toLocaleDateString("en-PH")}`
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-warning-600 font-semibold text-xs", children: "Pending review" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(ModalFooter, { children: [
          photoUrl && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "flat",
              onPress: downloadFile,
              startContent: /* @__PURE__ */ jsxs(
                "svg",
                {
                  "aria-hidden": true,
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                    /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
                    /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
                  ]
                }
              ),
              children: "Download"
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "flat", onPress: onClose, children: "Close" }),
          photoUrl && !item.isPhotoVerified && /* @__PURE__ */ jsx(Button, { color: "success", isLoading: verifying, onPress: verify, children: "✓ Mark as Verified" })
        ] })
      ] })
    }
  );
}
function PhotoCell({
  item,
  token,
  onRefresh,
  onViewPhoto
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    await fetch(`https://i3p-server-1.onrender.com/api/Ar/photo/${item.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    setUploading(false);
    onRefresh();
    e.target.value = "";
  };
  if (item.isPhotoVerified) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
      /* @__PURE__ */ jsx(Chip, { size: "sm", color: "success", variant: "flat", children: "✓ Verified" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onViewPhoto(item),
          className: "text-xs text-primary underline hover:text-primary-600 transition-colors",
          children: "View photo"
        }
      )
    ] });
  }
  if (item.photoPath) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onViewPhoto(item),
          className: "text-xs text-primary underline hover:text-primary-600 transition-colors font-medium",
          children: "View photo ↗"
        }
      ),
      /* @__PURE__ */ jsx(Chip, { size: "sm", color: "warning", variant: "flat", children: "Pending review" })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/*,.pdf",
        className: "hidden",
        onChange: upload
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "flat",
        isLoading: uploading,
        onPress: () => inputRef.current?.click(),
        children: "Upload photo"
      }
    )
  ] });
}
function AddItemModal({
  sipItemId,
  arCode,
  isOpen,
  onClose,
  onAdded,
  token
}) {
  const blank = {
    itemDescription: "",
    specification: "",
    unitOfMeasure: "",
    totalQuantity: "",
    price: ""
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const totalPreview = Number(form.totalQuantity) * Number(form.price) || null;
  const save = async () => {
    setSaving(true);
    try {
      await fetch(
        `https://i3p-server-1.onrender.com/api/Ar/add-item/${sipItemId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            itemDescription: form.itemDescription,
            specification: form.specification,
            unitOfMeasure: form.unitOfMeasure,
            totalQuantity: Number(form.totalQuantity) || null,
            price: Number(form.price) || null
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
  return /* @__PURE__ */ jsx(Modal, { isOpen, onOpenChange: onClose, size: "lg", children: /* @__PURE__ */ jsxs(ModalContent, { children: [
    /* @__PURE__ */ jsx(ModalHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
      /* @__PURE__ */ jsx("span", { children: "Add APP Item" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-default-500 font-mono", children: arCode })
    ] }) }),
    /* @__PURE__ */ jsx(ModalBody, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Item Description",
          value: form.itemDescription,
          onValueChange: set("itemDescription"),
          className: "col-span-2"
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Specification",
          value: form.specification,
          onValueChange: set("specification"),
          className: "col-span-2"
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Unit of Measure",
          value: form.unitOfMeasure,
          onValueChange: set("unitOfMeasure")
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Total Quantity",
          value: form.totalQuantity,
          onValueChange: set("totalQuantity"),
          type: "number"
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Price (₱)",
          value: form.price,
          onValueChange: set("price"),
          type: "number"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-default-500", children: [
        "Total:",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-default-800", children: fmt(totalPreview) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(ModalFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "flat", onPress: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: "primary",
          isLoading: saving,
          onPress: save,
          isDisabled: !form.itemDescription || !form.price,
          children: "Add Item"
        }
      )
    ] })
  ] }) });
}
function ArDetailPage({
  arCode: arCodeProp
}) {
  const token = useStore($token);
  const arCode = (() => {
    if (typeof arCodeProp === "string" && arCodeProp.length > 0)
      return decodeURIComponent(arCodeProp);
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/ar/");
      return decodeURIComponent(parts[parts.length - 1] ?? "");
    }
    return "";
  })();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const {
    isOpen: addOpen,
    onOpen: openAdd,
    onClose: closeAdd
  } = useDisclosure();
  const {
    isOpen: imgOpen,
    onOpen: openImg,
    onClose: closeImg
  } = useDisclosure();
  const [viewingItem, setViewingItem] = useState(null);
  const fetchDetail = useCallback(async () => {
    if (!arCode) return;
    const cleanArCode = arCode.includes("/") ? arCode.split("/").pop() : arCode;
    setLoading(true);
    try {
      const res = await fetch(
        `https://i3p-server-1.onrender.com/api/Ar/${encodeURIComponent(cleanArCode)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      setDetail(await res.json());
      setNotFound(false);
    } finally {
      setLoading(false);
    }
  }, [arCode, token]);
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  const handleViewPhoto = (item) => {
    setViewingItem(item);
    openImg();
  };
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-64", children: /* @__PURE__ */ jsx(Spinner, { label: "Loading AR details…" }) });
  if (notFound || !detail)
    return /* @__PURE__ */ jsxs("div", { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-default-400 text-lg mb-2", children: "AR code not found" }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-default-600 font-bold", children: arCode }),
      /* @__PURE__ */ jsx(Button, { variant: "flat", className: "mt-4", onPress: () => history.back(), children: "← Go back" })
    ] });
  const verificationPct = detail.totalCount > 0 ? Math.round(detail.verifiedCount / detail.totalCount * 100) : 0;
  const costDelta = detail.estimatedCost != null ? detail.totalAppCost - detail.estimatedCost : null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 p-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => history.back(),
        className: "flex items-center gap-1.5 text-sm text-default-400 hover:text-primary w-fit transition-colors",
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              "aria-hidden": true,
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" })
            }
          ),
          "Back to School Implementation Plan"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xl font-bold text-primary tracking-wide", children: detail.arCode }),
            detail.sipIsVerified ? /* @__PURE__ */ jsx(Chip, { color: "success", size: "sm", variant: "solid", children: "All Items Verified ✓" }) : /* @__PURE__ */ jsx(Chip, { color: "warning", size: "sm", variant: "flat", children: "Pending Verification" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-default-700 font-medium text-base", children: detail.activity ?? "—" }),
          /* @__PURE__ */ jsx("p", { className: "text-default-400 text-sm", children: [detail.kra, detail.category].filter(Boolean).join(" · ") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400 uppercase tracking-wide mb-0.5", children: "Program Estimated Cost" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-default-700", children: fmt(detail.estimatedCost) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-default-400 uppercase tracking-wide mb-0.5", children: "Current Total Cost" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-primary", children: fmt(detail.totalAppCost) }),
            costDelta != null && /* @__PURE__ */ jsxs(
              "p",
              {
                className: `text-xs font-semibold mt-0.5 ${costDelta > 0 ? "text-danger-500" : "text-success-600"}`,
                children: [
                  costDelta > 0 ? "+" : "",
                  fmt(costDelta),
                  " vs estimate"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-default-500", children: [
          /* @__PURE__ */ jsx("span", { children: "Photo Verification Progress" }),
          /* @__PURE__ */ jsxs("span", { children: [
            detail.verifiedCount,
            " / ",
            detail.totalCount,
            " items verified"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Progress,
          {
            value: verificationPct,
            color: verificationPct === 100 ? "success" : verificationPct > 0 ? "warning" : "default",
            size: "sm",
            className: "w-full"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Linked APP Items" }),
          /* @__PURE__ */ jsx(Chip, { size: "sm", variant: "flat", children: detail.appItems.length })
        ] }),
        /* @__PURE__ */ jsx(Button, { color: "primary", size: "sm", onPress: openAdd, children: "+ Add Item" })
      ] }),
      /* @__PURE__ */ jsxs(Table, { "aria-label": "Linked APP items", removeWrapper: true, children: [
        /* @__PURE__ */ jsxs(TableHeader, { children: [
          /* @__PURE__ */ jsx(TableColumn, { className: "w-8", children: "#" }),
          /* @__PURE__ */ jsx(TableColumn, { children: "Item Description" }),
          /* @__PURE__ */ jsx(TableColumn, { children: "Specification" }),
          /* @__PURE__ */ jsx(TableColumn, { className: "w-20", children: "UOM" }),
          /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-14", children: "Qty" }),
          /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-28", children: "Price" }),
          /* @__PURE__ */ jsx(TableColumn, { className: "text-right w-32", children: "Total" }),
          /* @__PURE__ */ jsx(TableColumn, { className: "w-52", children: "Photo / Status" })
        ] }),
        /* @__PURE__ */ jsx(
          TableBody,
          {
            emptyContent: /* @__PURE__ */ jsxs("div", { className: "py-8 text-default-400 text-center", children: [
              /* @__PURE__ */ jsx("p", { children: "No APP items linked yet." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: 'Use "+ Add Item" above, or seed fake items for testing.' })
            ] }),
            children: detail.appItems.map((item, idx) => /* @__PURE__ */ jsxs(
              TableRow,
              {
                className: item.isPhotoVerified ? "bg-success-50/40" : "",
                children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "text-default-400 text-xs", children: idx + 1 }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-snug", children: item.itemDescription ?? "—" }) }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-xs text-default-500 leading-snug", children: item.specification ?? "—" }) }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-xs", children: item.unitOfMeasure ?? "—" }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right text-sm", children: item.totalQuantity ?? "—" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: fmt(item.price) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right font-bold", children: fmt(item.totalAmount) }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
                    PhotoCell,
                    {
                      item,
                      token,
                      onRefresh: fetchDetail,
                      onViewPhoto: handleViewPhoto
                    }
                  ) })
                ]
              },
              item.id
            ))
          }
        )
      ] }),
      detail.appItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 bg-default-50 border border-default-200 rounded-xl px-5 py-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-default-500", children: "Total APP Cost" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-primary", children: fmt(detail.totalAppCost) }),
        costDelta != null && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-default-400 border-l border-default-200 pl-6", children: "vs SIP Estimate" }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: `text-sm font-semibold ${costDelta > 0 ? "text-danger-500" : "text-success-600"}`,
              children: [
                costDelta > 0 ? "+" : "",
                fmt(costDelta)
              ]
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      AddItemModal,
      {
        sipItemId: detail.sipItemId,
        arCode: detail.arCode,
        isOpen: addOpen,
        onClose: closeAdd,
        onAdded: fetchDetail,
        token
      }
    ),
    /* @__PURE__ */ jsx(
      ImageViewerModal,
      {
        item: viewingItem,
        isOpen: imgOpen,
        onClose: closeImg,
        token,
        onVerified: fetchDetail
      }
    )
  ] });
}

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { arCode } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ArDetailPage", ArDetailPage, { "arCode": arCode, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/ArDetailPage", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/projects/[arcode]/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/projects/[arcode]/index.astro";
const $$url = "/projects/[arcode]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
