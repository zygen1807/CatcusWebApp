"use client";

import Link from "next/link";
<<<<<<< HEAD
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  RiDashboardLine,
  RiBook2Line,
  RiPagesLine,
  RiGroupLine,
  RiMenuLine,
} from "react-icons/ri";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const links = [
    { href: "/dashboard/dashboard", label: "Dashboard", icon: RiDashboardLine },
    { href: "/dashboard/projects", label: "Projects", icon: RiBook2Line },
    { href: "/dashboard/inventory", label: "Inventory", icon: RiPagesLine },
    {
      href: "/dashboard/price-list",
      label: "Materials Price List",
      icon: RiPagesLine,
    },
    { href: "/dashboard/quotation", label: "Quotation", icon: RiGroupLine },
  ];

  return (
    <div
      className={`sticky top-0 z-30 h-screen shrink-0 bg-[#4b2f20] text-[#fffaf2] transition-all duration-300
=======
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Menu,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`bg-black text-white transition-all duration-300
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
      ${open ? "w-64" : "w-20"}
      hidden md:flex flex-col`}
    >
      <button
        onClick={() => setOpen(!open)}
<<<<<<< HEAD
        className="p-5 text-[#f6ead8] hover:text-white"
      >
        <RiMenuLine className="h-5 w-5" />
      </button>

      <nav className="flex flex-col gap-3 px-4">
        {links.map(({ href, label, icon: Icon }) => {
          const selected = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={selected ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl p-3 transition ${
                selected
                  ? "bg-[#f3cf95] font-bold text-[#4b2f20] shadow-[0_6px_18px_rgba(43,27,20,0.18)]"
                  : "text-[#f6ead8] hover:bg-[#6e4932]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
=======
        className="p-5"
      >
        <Menu />
      </button>

      <nav className="flex flex-col gap-4 px-4">
        <Link
          href="/dashboard/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <LayoutDashboard />
          {open && <span>Dashboard</span>}
        </Link>

        <Link
          href="/dashboard/projects"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Package />
          {open && <span>Projects</span>}
        </Link>

        <Link
          href="/dashboard/steps"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Users />
          {open && <span>Steps</span>}
        </Link>

        <Link
          href="/dashboard/techniques"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Settings />
          {open && <span>Techniques</span>}
        </Link>
      </nav>
    </div>
  );
}
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
