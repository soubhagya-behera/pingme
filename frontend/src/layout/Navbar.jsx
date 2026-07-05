import { Bell, Menu, Search } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import ProfileDropdown from "../components/ui/ProfileDropdown";

export default function Navbar({
  onMenuClick
}) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-8">
      <button
        className="rounded-xl border border-[var(--border)] p-2 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
        type="button"
      >
        <Menu size={20} />
      </button>

      <div className="hidden w-96 items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-2 md:flex">
        <Search size={18} />
        <input placeholder="Search..." className="w-full outline-none" />
      </div>

      <div className="flex items-center gap-5">
        <ThemeToggle />
        <Bell size={22} />
        <ProfileDropdown />
      </div>
    </header>
  );
}
