"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleRegister = async () => {
  try {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      throw error;
    }

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
            phone,
            email,
            role: "apprentice",
          },
        ]);

    if (profileError) {
      throw profileError;
    }

    alert("Apprentice Account Created!");

  } catch (err: any) {

    console.log(err);

    alert(err.message);

  }
};

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <div className="p-6 border rounded w-80 bg-white">
        <h2 className="text-xl font-bold mb-4">Apprentice Register</h2>

        <input
          placeholder="Name"
          className="w-full p-2 border mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone"
          className="w-full p-2 border mb-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full p-2 border mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white py-2"
        >
          Create Account
        </button>
        <div className="text-center mt-6">

          <span className="text-gray-500">
            Already have an account?
          </span>

          <button
            onClick={() =>
              router.push(
                "/credentials/CarpenterLoginPage"
              )
            }
            className="ml-2 font-semibold hover:underline"
          >
            Login
          </button>

        </div>
      </div>
    </motion.div>
  );
}