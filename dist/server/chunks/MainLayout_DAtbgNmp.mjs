import { c as createComponent } from './astro-component_DKWqRa2-.mjs';
import 'piccolore';
import { h as addAttribute, p as renderHead, o as renderComponent, q as renderSlot, v as Fragment, r as renderTemplate, u as unescapeHTML } from './server_VSg7zcZ5.mjs';
import { a as $token, b as $userProfile } from './authStore_BMyVodq8.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Navbar, NavbarBrand, NavbarContent, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, Listbox, ListboxItem, Chip, Divider } from '@heroui/react';
import { atom } from 'nanostores';

const AcmeLogo = () => /* @__PURE__ */ jsx("svg", { fill: "none", height: "32", viewBox: "0 0 32 32", width: "32", children: /* @__PURE__ */ jsx(
  "path",
  {
    clipRule: "evenodd",
    d: "M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z",
    fill: "currentColor",
    fillRule: "evenodd"
  }
) });
function Nav() {
  const token = useStore($token);
  const profile = useStore($userProfile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!token || profile) return;
    fetch("https://i3p-server-1.onrender.com/api/user/GetProfile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) $userProfile.set(data);
    }).catch(() => {
    });
  }, [token]);
  const displayName = profile?.name ?? "";
  const handleLogout = () => {
    $token.set(null);
    $userProfile.set(null);
    window.location.href = "/login";
  };
  return /* @__PURE__ */ jsxs(
    Navbar,
    {
      shouldHideOnScroll: true,
      maxWidth: "full",
      className: "h-16 border-b border-divider",
      children: [
        /* @__PURE__ */ jsx(NavbarBrand, { children: /* @__PURE__ */ jsxs("a", { href: "/", className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(AcmeLogo, {}),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-inherit", children: "i3P" })
        ] }) }),
        /* @__PURE__ */ jsx(NavbarContent, { justify: "end", children: mounted && /* @__PURE__ */ jsxs(Dropdown, { children: [
          /* @__PURE__ */ jsx(DropdownTrigger, { children: /* @__PURE__ */ jsx(
            Avatar,
            {
              name: displayName || void 0,
              showFallback: true,
              className: "hover:cursor-pointer w-8 h-8 text-sm"
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenu, { "aria-label": "User menu", children: [
            profile != null ? /* @__PURE__ */ jsx(
              DropdownItem,
              {
                isReadOnly: true,
                className: "opacity-100 cursor-default data-[hover=true]:bg-transparent",
                textValue: profile.name,
                children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 py-0.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-default-800 truncate", children: profile.name }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400 truncate", children: profile.email })
                ] })
              },
              "user-info"
            ) : /* @__PURE__ */ jsx(
              DropdownItem,
              {
                isReadOnly: true,
                className: "opacity-100 cursor-default",
                textValue: "Loading",
                children: /* @__PURE__ */ jsx("span", { className: "text-xs text-default-400", children: "Loading…" })
              },
              "user-info"
            ),
            /* @__PURE__ */ jsx(DropdownItem, { href: "/profile", children: "My Profile" }, "profile"),
            /* @__PURE__ */ jsx(
              DropdownItem,
              {
                className: "text-danger",
                color: "danger",
                onPress: handleLogout,
                children: "Sign Out"
              },
              "logout"
            )
          ] })
        ] }) })
      ]
    }
  );
}

const NAV_ITEMS = [
  { key: "General Expenditure Summary", label: "General Expenditure Summary" },
  { key: "Item Procurement List", label: "Detailed Expenditure List" }
  // { key: "Expenditure",              label: "Expenditure"               },
  // { key: "PPMP",                     label: "PPMP"                      },
  // { key: "Procurement",              label: "Procurement"               },
];
const $filterOptions = NAV_ITEMS.map((n) => n.key);
const $fileFilter = atom(NAV_ITEMS[0].key);

function DashboardIcon({ size = 20 }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "aria-hidden": true,
      fill: "none",
      height: size,
      width: size,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" })
      ]
    }
  );
}
function PPAsIcon({ size = 20 }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "aria-hidden": true,
      fill: "none",
      height: size,
      width: size,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
        /* @__PURE__ */ jsx("polyline", { points: "14 2 14 8 20 8" }),
        /* @__PURE__ */ jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
        /* @__PURE__ */ jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
        /* @__PURE__ */ jsx("polyline", { points: "10 9 9 9 8 9" })
      ]
    }
  );
}
function MatchIcon({ size = 20 }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "aria-hidden": true,
      fill: "none",
      height: size,
      width: size,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
        /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
      ]
    }
  );
}
const MAIN_NAV = [
  { key: "/", label: "Dashboard", icon: /* @__PURE__ */ jsx(DashboardIcon, {}) },
  { key: "/projects", label: "PPAs", icon: /* @__PURE__ */ jsx(PPAsIcon, {}) },
  { key: "/match", label: "Match", icon: /* @__PURE__ */ jsx(MatchIcon, {}) }
];
function Sidebar({ pathname }) {
  const activeFilter = useStore($fileFilter);
  const token = useStore($token);
  const isProjectsPage = pathname === "/projects";
  const [pendingCount, setPendingCount] = useState(null);
  useEffect(() => {
    if (!token) return;
    fetch("https://i3p-server-1.onrender.com/api/PlanCrossReference/pending", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((r) => r.json()).then((d) => setPendingCount(d.length)).catch(() => setPendingCount(null));
  }, [token]);
  return /* @__PURE__ */ jsxs("aside", { className: "h-screen w-56 p-3 border-r border-divider flex flex-col gap-3 bg-background overflow-y-auto", children: [
    /* @__PURE__ */ jsx(
      Listbox,
      {
        "aria-label": "Main Navigation",
        onAction: (key) => window.location.href = `${key}`,
        className: "p-0 gap-1",
        itemClasses: {
          base: "px-3 rounded-lg gap-3 h-11 data-[hover=true]:bg-default-100",
          title: "text-sm font-medium"
        },
        children: MAIN_NAV.map(({ key, label, icon }) => /* @__PURE__ */ jsx(
          ListboxItem,
          {
            startContent: icon,
            classNames: {
              base: pathname === key ? "bg-default-100" : void 0
            },
            endContent: key === "/match" && pendingCount && pendingCount > 0 ? /* @__PURE__ */ jsx(
              Chip,
              {
                size: "sm",
                color: "warning",
                variant: "solid",
                className: "h-5 min-w-5 text-[10px] font-bold px-1",
                children: pendingCount > 99 ? "99+" : pendingCount
              }
            ) : void 0,
            children: label
          },
          key
        ))
      }
    ),
    isProjectsPage && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 animate-in fade-in slide-in-from-top-1", children: [
      /* @__PURE__ */ jsx(Divider, { className: "my-1" }),
      /* @__PURE__ */ jsx("p", { className: "px-3 text-[10px] font-bold text-default-400 uppercase tracking-wider", children: "Filters" }),
      /* @__PURE__ */ jsx(
        Listbox,
        {
          "aria-label": "File Filters",
          variant: "flat",
          disallowEmptySelection: true,
          selectionMode: "single",
          selectedKeys: [activeFilter],
          onSelectionChange: (keys) => {
            const s = Array.from(keys)[0];
            $fileFilter.set(s);
          },
          children: $filterOptions.map((key) => {
            const label = NAV_ITEMS.find((n) => n.key === key)?.label ?? key;
            return /* @__PURE__ */ jsx(ListboxItem, { className: "h-9 text-sm", children: label }, key);
          })
        }
      )
    ] })
  ] });
}

const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MainLayout;
  const pathname = Astro2.url.pathname;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>i3P Dashboard</title>${renderHead()}</head> <body class="relative"> ${renderComponent($$result, "Nav", Nav, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/Nav", "client:component-export": "default" })} <div class="flex h-[calc(100dvh-64px)]"> <!-- Sidebar: hidden on mobile, visible md+ --> <aside class="hidden md:flex sticky top-0 h-full overflow-y-auto shrink-0"> ${renderComponent($$result, "Sidebar", Sidebar, { "client:load": true, "pathname": pathname, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/Sidebar", "client:component-export": "default" })} </aside> <main class="flex-1 overflow-y-auto overflow-x-hidden"> ${renderSlot($$result, $$slots["default"])} </main> </div> <!-- Mobile bottom nav — same icons as Sidebar --> <nav class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-divider flex md:hidden"> ${[
    { href: "/", label: "Dashboard", icon: `<svg fill="none" height="20" width="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
    { href: "/projects", label: "PPAs", icon: `<svg fill="none" height="20" width="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>` }
    ///{ href: "/match",   label: "Match",     icon: `<svg fill="none" height="20" width="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` },
    // { href: "/profile", label: "Profile",   icon: `<svg fill="none" height="20" width="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  ].map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${pathname === item.href ? "text-primary" : "text-default-500"}`, "class")}> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(item.icon)}` })} ${item.label} </a>`)} </nav> <div class="h-[60px] md:hidden" aria-hidden="true"></div> </body></html>`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $, $fileFilter as a };
