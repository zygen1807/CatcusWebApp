"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      {/* TOP NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 py-4 shadow-md bg-white"
      >
        {/* LOGO */}
        <h1 className="text-xl font-bold">🪵 WoodCraft</h1>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/Homepage" className="hover:text-blue-500">
            Home
          </Link>

          <div className="relative group">
            <button className="hover:text-blue-500">Products ▾</button>

            <div className="absolute hidden group-hover:block bg-white shadow-lg mt-2 rounded w-40">
              <Link href="/(public)/products/chairs" className="block px-4 py-2 hover:bg-gray-100">
                Chairs
              </Link>
              <Link href="/(public)/products/tables" className="block px-4 py-2 hover:bg-gray-100">
                Tables
              </Link>
              <Link href="/products/cabinets" className="block px-4 py-2 hover:bg-gray-100">
                Cabinets
              </Link>
            </div>
          </div>

          <Link href="/About" className="hover:text-blue-500">
            About
          </Link>
          <Link href="/Contact" className="hover:text-blue-500">
            Contact
          </Link>
        </div>


        {/* MOBILE */}
        <button onClick={() => setOpen(true)} className="md:hidden text-2xl">
          ☰
        </button>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold">Menu</h2>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="flex flex-col p-4 gap-4">
          <Link href="/landing" onClick={() => setOpen(false)}>Home</Link>

          <p className="font-semibold mt-2">Products</p>

          <Link href="/products/chairs" onClick={() => setOpen(false)}>Chairs</Link>
          <Link href="/products/tables" onClick={() => setOpen(false)}>Tables</Link>
          <Link href="/products/cabinets" onClick={() => setOpen(false)}>Cabinets</Link>

          <hr />

          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>

          <hr />

        </div>
      </motion.div>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}
    </>
  );
}