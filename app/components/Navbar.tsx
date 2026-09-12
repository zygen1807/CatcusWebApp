"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
<<<<<<< HEAD
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto h-20 px-6 flex items-center">

          {/* LEFT - LOGO */}
          <div className="flex-1">
            <Link href="/" className="text-2xl font-bold">
              🪵 CATCUS
            </Link>
          </div>

          {/* CENTER MENU */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-10">

            <Link
              href="/Homepage"
              className="hover:text-blue-600 transition"
            >
              Home
            </Link>

            <Link
              href="/Catalogs"
              className="hover:text-blue-600 transition"
            >
              Catalogs
            </Link>

            <Link
              href="/About"
              className="hover:text-blue-600 transition"
            >
              About
            </Link>

            <Link
              href="/Contact"
              className="hover:text-blue-600 transition"
            >
              Contact
            </Link>

          </div>

          {/* RIGHT BUTTONS */}
          <div className="hidden md:flex flex-1 justify-end gap-3">

            <Link href="/credentials/LoginPage">
              <button className="px-5 py-2 rounded-xl border hover:bg-gray-100 transition">
                Login
              </button>
            </Link>

            <Link href="/credentials/RegisterPage">
              <button className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition">
                Register
              </button>
            </Link>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-3xl"
          >
            ☰
          </button>

        </div>
      </motion.nav>

      {/* ================= MOBILE DRAWER ================= */}

=======
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
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
<<<<<<< HEAD
        className="fixed top-0 left-0 w-72 h-full bg-white shadow-xl z-50"
      >

        <div className="flex justify-between items-center p-5 border-b">

          <h2 className="text-xl font-bold">
            🪵 CATCUS
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        <div className="flex flex-col p-5 gap-5">

          <Link
            href="/Homepage"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/Catalogs"
            onClick={() => setOpen(false)}
          >
            Catalogs
          </Link>

          <Link
            href="/About"
            onClick={() => setOpen(false)}
          >
            About
          </Link>

          <Link
            href="/Contact"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>

          <hr />

          <Link
            href="/credentials/AdminLoginPage"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>

          <Link
            href="/credentials/AdminRegisterPage"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>

        </div>

      </motion.div>

      {/* ================= BACKDROP ================= */}

=======
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
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}
    </>
  );
}