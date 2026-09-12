"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
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
              ðŸªµ CATCUS
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
            â˜°
          </button>

        </div>
      </motion.nav>

      {/* ================= MOBILE DRAWER ================= */}

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-72 h-full bg-white shadow-xl z-50"
      >

        <div className="flex justify-between items-center p-5 border-b">

          <h2 className="text-xl font-bold">
            ðŸªµ CATCUS
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl"
          >
            âœ•
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

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}
    </>
  );
}
