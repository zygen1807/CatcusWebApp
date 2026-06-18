"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full bg-white border-t mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-bold">🪵 WoodCraft</h2>
          <p className="text-gray-600 mt-2">
            Premium custom-made furniture for modern homes.
          </p>
        </div>

        {/* LINKS */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Quick Links</h3>

          <Link href="/landing" className="text-gray-600 hover:text-black">
            Home
          </Link>

          <Link href="/about" className="text-gray-600 hover:text-black">
            About
          </Link>

          <Link href="/contact" className="text-gray-600 hover:text-black">
            Contact
          </Link>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold">Contact</h3>
          <p className="text-gray-600 mt-2">📍 Philippines</p>
          <p className="text-gray-600">📞 +63 900 000 000</p>
          <p className="text-gray-600">✉ support@woodcraft.com</p>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="text-center py-4 border-t text-gray-500 text-sm">
        © {new Date().getFullYear()} WoodCraft. All rights reserved.
      </div>
    </motion.footer>
  );
}