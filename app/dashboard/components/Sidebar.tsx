"use client";

import Link from "next/link";
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
      ${open ? "w-64" : "w-20"}
      hidden md:flex flex-col`}
    >
      <button
        onClick={() => setOpen(!open)}
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