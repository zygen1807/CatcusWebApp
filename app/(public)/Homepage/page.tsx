"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        min-h-screen
        bg-gray-50
        flex
        flex-col
        justify-center
        items-center
        p-10
      "
    >
      <h1 className="text-5xl font-bold mb-3">
        🪵 CATCUS
      </h1>

      <p className="text-gray-500 mb-10">
        Catalog & Customization System
      </p>

      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() =>
          router.push("/credentials/AdminLoginPage")
        }
        className="
          bg-white
          p-10
          rounded-3xl
          shadow-lg
          cursor-pointer
          w-[400px]
        "
      >
        <h2 className="text-3xl font-bold">
          👤 Owner / Admin
        </h2>

        <p className="text-gray-500 mt-3">
          Login to manage catalogs, customers, projects, quotations, and settings.
        </p>

        <button
          className="
            mt-6
            w-full
            bg-black
            text-white
            py-3
            rounded-xl
          "
        >
          Login
        </button>
      </motion.div>
    </motion.main>
  );
}