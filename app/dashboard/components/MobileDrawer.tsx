"use client";

import { useState } from "react";
import Link from "next/link";
<<<<<<< HEAD
import { usePathname } from "next/navigation";

import {
  RiMenuLine,
  RiCloseLine,
  RiBook2Line,
  RiDashboardLine,
  RiPagesLine,
  RiGroupLine,
} from "react-icons/ri";

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);
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
  const pageTitle =
    links.find(({ href }) => pathname === href)?.label ?? "Dashboard";
=======

import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Users,
  Settings,
} from "lucide-react";

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7

  return (
    <>
      {/* Top Mobile Navbar */}
<<<<<<< HEAD
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#dfc7ab] bg-[#f6ead8]/90 px-4 py-4 shadow-[0_6px_20px_rgba(75,47,32,0.12)] backdrop-blur-xl md:hidden">
        <button onClick={() => setOpen(true)}>
          <RiMenuLine className="h-7 w-7" />
        </button>

        <h1 className="text-xl font-bold text-[#4b2f20]">{pageTitle}</h1>
=======
      <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-4">
        <button onClick={() => setOpen(true)}>
          <Menu size={28} />
        </button>

        <h1 className="text-xl font-bold">
          Dashboard
        </h1>
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
<<<<<<< HEAD
          fixed top-0 left-0 z-50 h-full w-64 bg-[#4b2f20] text-[#fffaf2] shadow-[12px_0_35px_rgba(43,27,20,0.22)]
=======
          fixed top-0 left-0 h-full w-64 bg-black text-white z-50
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
<<<<<<< HEAD
        <div className="flex items-center justify-between border-b border-[#6e4932] p-5">
          <h1 className="text-2xl font-bold">My Dashboard</h1>

          <button onClick={() => setOpen(false)}>
            <RiCloseLine className="h-5 w-5" />
=======
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold">
            My Dashboard
          </h1>

          <button onClick={() => setOpen(false)}>
            <X />
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 p-4">
<<<<<<< HEAD
          {links.map(({ href, label, icon: Icon }) => {
            const selected =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={selected ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl p-3 transition ${
                  selected
                    ? "bg-[#f3cf95] font-bold text-[#4b2f20]"
                    : "text-[#f6ead8] hover:bg-[#6e4932]"
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
=======
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard />
            Dashboard
          </Link>

          <Link
            href="/projects"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <Package />
            Projects
          </Link>

          <Link
            href="/steps"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <Users />
            Steps
          </Link>

          <Link
            href="/techniques"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <Settings />
            Techniques
          </Link>
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
        </nav>
      </div>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
