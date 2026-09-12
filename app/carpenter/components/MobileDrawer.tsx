"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Menu,
  X,
  Bot,
  Package,
  Users,
  Settings,
  History,
} from "lucide-react";

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-4">
        <button onClick={() => setOpen(true)}>
          <Menu size={28} />
        </button>

        <h1 className="text-xl font-bold">
          Dashboard
        </h1>
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
          fixed top-0 left-0 h-full w-64 bg-black text-white z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold">
            My Dashboard
          </h1>

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 p-4">
          <Link
            href="/carpenter/ask-ai"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <Bot />
            Ask AI
          </Link>

          <Link
            href="/carpenter/projects"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <Package />
            Projects
          </Link>

          <Link
            href="/carpenter/history"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            <History />
            History
          </Link>
        </nav>
      </div>
    </>
  );
}