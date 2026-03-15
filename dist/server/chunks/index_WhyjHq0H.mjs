import { c as createComponent } from './astro-component_DduJEcoZ.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_Cawgcfpy.mjs';
import { $ as $$AuthLayout } from './AuthLayout_Dizi5qD6.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $ as $isAuthLoading, a as $token, b as $userProfile } from './authStore_BMyVodq8.mjs';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const isLoading = useStore($isAuthLoading);
  useEffect(() => {
    const t = $token.get();
    if (!t) return;
    fetch("https://i3p-server-1.onrender.com/api/user/GetProfile", {
      headers: { Authorization: `Bearer ${t}` }
    }).then((r) => {
      if (r.ok) window.location.href = "/";
      else {
        $token.set(null);
        $userProfile.set(null);
      }
    }).catch(() => {
    });
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    $isAuthLoading.set(true);
    setErr("");
    try {
      const res = await fetch(
        "https://i3p-server-1.onrender.com/api/user/Login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await res.json();
      if (res.ok) {
        $token.set(data.token);
        $userProfile.set(data.user);
        window.location.href = "/";
      } else setErr("Invalid email or password");
    } catch {
      setErr("Cannot connect to server");
    } finally {
      $isAuthLoading.set(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-[#111111] px-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 pointer-events-none opacity-[0.015]",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-[380px]", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/[0.08] bg-[#191919] p-8 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(
          "svg",
          {
            "aria-hidden": true,
            width: "16",
            height: "16",
            viewBox: "0 0 32 32",
            fill: "none",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                clipRule: "evenodd",
                d: "M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z",
                fill: "white",
                fillRule: "evenodd"
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx("span", { className: "text-white font-medium tracking-tight", children: "i3P Ledger" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-white mb-1", children: "Sign in" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40 mb-7", children: "Access the school implementation ledger" }),
      err && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm mb-5", children: [
        /* @__PURE__ */ jsxs(
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
            className: "shrink-0 text-white/40",
            children: [
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
            ]
          }
        ),
        err
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-white/40 uppercase tracking-wider", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              disabled: isLoading,
              placeholder: "you@school.edu.ph",
              className: "w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-white/40 uppercase tracking-wider", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showPass ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                disabled: isLoading,
                placeholder: "••••••••",
                className: "w-full px-3.5 py-2.5 pr-11 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPass((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors",
                children: showPass ? /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    width: "15",
                    height: "15",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }),
                      /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
                    ]
                  }
                ) : /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    width: "15",
                    height: "15",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
                    ]
                  }
                )
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading || !email || !password,
            className: "mt-1 w-full py-2.5 rounded-lg bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-[#111] text-sm font-semibold transition-all",
            children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "animate-spin",
                  width: "13",
                  height: "13",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2.5,
                  children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
                }
              ),
              "Signing in…"
            ] }) : "Sign In"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-6 text-xs text-white/25", children: [
        /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white/50 transition-colors", children: "Forgot password?" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/register",
            className: "hover:text-white/50 transition-colors",
            children: "Create account →"
          }
        )
      ] })
    ] }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/LoginForm.tsx", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/login/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/login/index.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
