"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  Package,
  History,
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
          href="/carpenter/ask-ai"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Bot />
          {open && <span>Ask AI</span>}
        </Link>

        <Link
          href="/carpenter/projects"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Package />
          {open && <span>Projects</span>}
        </Link>

        <Link
          href="/carpenter/history"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <History />
          {open && <span>History</span>}
        </Link>
      </nav>
    </div>
  );
}