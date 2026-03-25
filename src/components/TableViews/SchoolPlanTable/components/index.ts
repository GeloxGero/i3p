// components/index.ts — barrel export
// Single import point for all SchoolPlanTable sub-components.
// Keeps import paths short and stable — rename a file here, not everywhere.

export { default as MonthNavigation } from "./monthNavigation";
export { default as TableRenderer } from "./tableRenderer";
export { default as CardRenderer } from "./cardRenderer";
export { default as TotalView } from "./totalView";
export { default as ActionsBar } from "./actions";
export { default as ImportModal } from "./importModal";
export { default as DuplicateResolver } from "./duplicateResolver";
export { default as AddItemModal } from "./addItemModal";
export { default as SkeletonTable } from "./skeletonTable";
export { default as TemplateModal } from "./TemplateModal";
