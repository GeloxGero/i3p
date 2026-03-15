import { c as createComponent } from './astro-component_DKWqRa2-.mjs';
import 'piccolore';
import { h as addAttribute, p as renderHead, q as renderSlot, r as renderTemplate } from './server_VSg7zcZ5.mjs';
import 'clsx';
import './authStore_BMyVodq8.mjs';

const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AuthLayout;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Login/Register</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/layouts/AuthLayout.astro", void 0);

export { $$AuthLayout as $ };
