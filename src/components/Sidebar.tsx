import { Listbox, ListboxItem} from "@heroui/react";
import { ChartIcon, TableIcon } from "../icons/Icons";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 p-4 border-r border-divider flex flex-col gap-4 bg-background overflow-y-auto">
      <Listbox
        aria-label="Main Navigation"
        onAction={(key) => window.location.href = `${key}`}
        className="p-0 gap-2"
        itemClasses={{
          base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100",
          title: "text-medium font-medium",
        }}
      >
        <ListboxItem key="/" startContent={<ChartIcon/>}>
          Dashboard
        </ListboxItem>
        <ListboxItem key="/projects" startContent={<TableIcon/>}>
          PPAs
        </ListboxItem>
      </Listbox>
    </aside>
  );
}