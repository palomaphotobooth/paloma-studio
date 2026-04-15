import Link from "next/link";
import { Home, Layers3, PlaySquare, Tv } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/channels", label: "Channels", icon: Tv },
  { href: "/dashboard/series", label: "Series", icon: Layers3 },
  { href: "/dashboard/videos", label: "Videos", icon: PlaySquare }
];

export function Sidebar() {
  return (
    <>
      <aside className="hidden w-64 border-r bg-white p-4 lg:block">
        <div className="mb-8 text-xl font-bold">ShortForge</div>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t bg-white p-2 lg:hidden">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-md p-2 text-xs">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
