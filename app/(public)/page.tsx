<<<<<<< HEAD
// "use client";
//
// import { motion } from "framer-motion";
//
// export default function Page() {
//   return (
//     <motion.main
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 1 }}
//       className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-gray-50"
//     >
//       <motion.h1
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.4 }}
//         className="text-5xl font-bold"
//       >
//         🪵 Premium Furniture Shop
//       </motion.h1>
//
//       <p className="mt-4 text-gray-600 text-lg">
//         Custom-made wooden furniture for your home and office.
//       </p>
//
//       {/* BUTTONS */}
//       <div className="mt-6 flex gap-4">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="px-6 py-3 bg-black text-white rounded"
//         >
//           Shop Now
//         </motion.button>
//
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="px-6 py-3 border rounded"
//         >
//           Custom Order
//         </motion.button>
//       </div>
//
//       {/* FEATURES */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//         className="grid grid-cols-3 gap-6 mt-16 max-w-4xl"
//       >
//         <div className="p-4 border rounded">✔ Handmade Quality</div>
//         <div className="p-4 border rounded">✔ Durable Wood</div>
//         <div className="p-4 border rounded">✔ Custom Design</div>
//       </motion.div>
//     </motion.main>
//   );
// }

//export default function Page() {
//return null;
//}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // EMAIL + PASSWORD LOGIN
  const handleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/dashboard/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8B5E3C] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(161,98,7,0.25),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(120,53,15,0.25),_transparent_20%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white/95 shadow-[0_32px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      >
        <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 opacity-25 blur-3xl" />

        <div className="relative px-8 py-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10">
              <span className="text-2xl">🪵</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              CATCUS Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage catalogs, customers, projects, and quotations.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email address
            </label>

            <input
              type="email"
              placeholder="hello@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleLogin}
            className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-amber-800 hover:bg-amber-900 px-5 py-4 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-3xl border border-gray-900 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm transition duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FcGoogle size={22} />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </motion.button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?
            <button
              onClick={() => router.push("/credentials/RegisterPage")}
              className="ml-1 font-semibold text-amber-800 hover:text-amber-900 hover:underline"
            >
              Register
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
=======
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
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
