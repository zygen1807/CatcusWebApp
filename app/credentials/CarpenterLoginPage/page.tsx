"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // EMAIL LOGIN (NO ROLE CHECK)
  const handleLogin = async () => {
    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        alert(error.message);
        return;
      }

      // DIRECT REDIRECT (NO AUTHORIZATION CHECK)
      router.push("/dashboard/dashboard");

    } catch (err) {
      console.log(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN (NO ROLE CHECK)
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        alert(error.message);
      }

    } catch (err) {
      console.log(err);
      alert("Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-[420px] rounded-3xl shadow-xl p-8"
      >

        <h1 className="text-3xl font-bold text-center mb-2">
          🧑‍🏭 Master Login
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Sign in to continue
        </p>

        {/* GOOGLE LOGIN */}
        <motion.button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full bg-red-500 text-white p-4 rounded-xl mb-4 disabled:opacity-50"
        >
          {googleLoading
            ? "Redirecting..."
            : "Continue with Google"}
        </motion.button>

        <div className="text-center text-gray-400 mb-4">
          OR
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-4 rounded-xl border mb-4"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-4 rounded-xl border"
        />

        {/* LOGIN */}
        <motion.button
          disabled={loading}
          onClick={handleLogin}
          className="w-full mt-6 bg-black text-white p-4 rounded-xl disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* REGISTER */}
        <div className="text-center mt-6">

          <span className="text-gray-500">
            Dont have an account?
          </span>

          <button
            onClick={() =>
              router.push(
                "/credentials/MasterRegisterPage"
              )
            }
            className="ml-2 font-semibold hover:underline"
          >
            Register
          </button>

        </div>

      </motion.div>

    </div>
  );
}