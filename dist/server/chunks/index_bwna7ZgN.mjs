import { c as createComponent } from './astro-component_DduJEcoZ.mjs';
import 'piccolore';
import { o as renderComponent, r as renderTemplate } from './server_Cawgcfpy.mjs';
import { $ as $$MainLayout } from './MainLayout_D2DXQPA9.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Profile", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/components/Profile", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/profile/index.astro", void 0);

const $$file = "C:/Users/Junrey/Desktop/i3p_frontend/i3p/src/pages/profile/index.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
