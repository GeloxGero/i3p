import { Listbox, ListboxItem} from "@heroui/react";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 p-4 border-r border-divider flex flex-col gap-4">
      <div className="px-2 py-4">
        <h2 className="text-xl font-bold tracking-tight">MY APP</h2>
      </div>
      
      <Listbox
        aria-label="Main Navigation"
        onAction={(key) => window.location.href = `${key}`}
        className="p-0 gap-2"
        itemClasses={{
          base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100",
          title: "text-medium font-medium",
        }}
      >
        <ListboxItem key="/" startContent={<h1>Dashboard</h1>}>
          Dashboard
        </ListboxItem>
        <ListboxItem key="/projects" startContent={<h1>Projects</h1>}>
          Projects
        </ListboxItem>
        <ListboxItem key="/team" startContent={<h1>Team</h1>}>
          Team
        </ListboxItem>
      </Listbox>
    </div>
  );
}