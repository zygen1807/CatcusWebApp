
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adminKey, setAdminKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Please complete all fields");
      return;
    }

    setShowModal(true);
  };

  const createUser = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) throw error;

      if (!data.user) {
        throw new Error("User not created");
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: "master",
            },
          ]);

      if (profileError) {
        throw profileError;
      }

      alert("Administrator account created");

      router.push("/credentials/MasterLoginPage");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminKey = async () => {
    if (adminKey !== "1803") {
      alert("Invalid Admin Key");
      return;
    }

    setShowModal(false);

    await createUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center p-5">

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >

        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🧑‍🏭
          </div>

          <h1 className="text-3xl font-bold">
            Master Register
          </h1>

          <p className="text-gray-500 mt-2">
            Create your administrator account
          </p>

        </div>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Admin Name"
          className="w-full border rounded-2xl p-4 mb-4 outline-none focus:ring-2 focus:ring-black"
        />

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Email Address"
          className="w-full border rounded-2xl p-4 mb-4 outline-none focus:ring-2 focus:ring-black"
        />

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Password"
          className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
        />

        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={loading}
          onClick={handleRegister}
          className="w-full mt-6 bg-black text-white p-4 rounded-2xl disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </motion.button>

        <div className="text-center mt-6">

          <span className="text-gray-500">
            Already have an account?
          </span>

          <button
            onClick={() =>
              router.push(
                "/credentials/MasterLoginPage"
              )
            }
            className="ml-2 font-semibold hover:underline"
          >
            Login
          </button>

        </div>

      </motion.div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">

          <motion.div
            initial={{
              scale: .9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="bg-white rounded-3xl w-full max-w-sm p-8"
          >

            <h2 className="text-2xl font-bold">
              Admin Verification
            </h2>

            <p className="text-gray-500 mt-2">
              Enter Admin Key
            </p>

            <input
              value={adminKey}
              onChange={(e) =>
                setAdminKey(
                  e.target.value
                )
              }
              placeholder="Admin Key"
              className="w-full border rounded-2xl p-4 mt-5"
            />

            <button
              onClick={verifyAdminKey}
              className="w-full mt-5 bg-black text-white rounded-2xl p-4"
            >
              Verify & Register
            </button>

          </motion.div>

        </div>

      )}

    </div>
  );
}

