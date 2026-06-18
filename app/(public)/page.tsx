"use client";

import { motion } from "framer-motion";


export default function Page() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-gray-50"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl font-bold"
      >
        🪵 Premium Furniture Shop
      </motion.h1>

      <p className="mt-4 text-gray-600 text-lg">
        Custom-made wooden furniture for your home and office.
      </p>

      {/* BUTTONS */}
      <div className="mt-6 flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-black text-white rounded"
        >
          Shop Now
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 border rounded"
        >
          Custom Order
        </motion.button>
      </div>

      {/* FEATURES */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-6 mt-16 max-w-4xl"
      >
        <div className="p-4 border rounded">✔ Handmade Quality</div>
        <div className="p-4 border rounded">✔ Durable Wood</div>
        <div className="p-4 border rounded">✔ Custom Design</div>
      </motion.div>
    </motion.main>
  );
}