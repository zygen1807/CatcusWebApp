"use client";

import Link from "next/link";
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
      ${open ? "w-64" : "w-20"}
      hidden md:flex flex-col`}
    >
      <button
        onClick={() => setOpen(!open)}
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
