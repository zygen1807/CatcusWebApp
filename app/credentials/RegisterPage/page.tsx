"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  const isEditing = Boolean(userId);

  // Validation Errors
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    // Clear previous errors
    const newErrors = {
      name: "",
      phone: "",
      email: "",
      password: "",
    };
    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Full Name is required.";
      valid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone Number is required.";
      valid = false;
    } else if (!/^09\d{9}$/.test(phone)) {
      newErrors.phone =
        "Phone Number must be exactly 11 digits and start with 09.";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email Address is required.";
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
      newErrors.email =
        "Please enter a valid Gmail address (example@gmail.com).";
      valid = false;
    }

    if (!userId) {
      if (!password.trim()) {
        newErrors.password = "Password is required.";
        valid = false;
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
        valid = false;
      }
    }

    setErrors(newErrors);

    if (!valid) return;

    try {
      setLoading(true);

      if (userId) {
        const payload = {
          name,
          phone,
          email,
        };

        const { error: profileError } = profileExists
          ? await supabase.from("profiles").update(payload).eq("id", userId)
          : await supabase.from("profiles").insert({ id: userId, ...payload });

        if (profileError) throw profileError;

        setProfileExists(true);
        alert("Profile saved successfully.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("User not created.");
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        phone,
        email,
      });

      if (profileError) throw profileError;

      alert(
        "Account created successfully! Please verify your email before logging in.",
      );

      router.replace("/credentials/LoginPage");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(authError);
        setUserId(null);
        return;
      }

      if (!user) {
        setUserId(null);
        return;
      }

      setUserId(user.id);
      setEmail(user.email || email);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id,name,phone,email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
      }

      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
        setProfileExists(true);
      } else {
        setProfileExists(false);
      }
    }

    loadProfile();
  }, []);

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
              {isEditing ? "Edit Profile" : "Create Account"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {isEditing
                ? "Update your profile details."
                : "Create an account and start managing catalogs, customers, projects, and quotations."}
            </p>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Juan Dela Cruz"
                className={`w-full rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border border-red-500 focus:ring-red-200"
                    : "border border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>

              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="09XXXXXXXXX"
                className={`w-full rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border border-red-500 focus:ring-red-200"
                    : "border border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />

              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="hello@gmail.com"
                className={`w-full rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border border-red-500 focus:ring-red-200"
                    : "border border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="Create your password"
                    className={`w-full rounded-3xl bg-slate-50 px-4 py-4 pr-12 text-sm text-slate-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border border-red-500 focus:ring-red-200"
                        : "border border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleRegister}
            className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-amber-800 hover:bg-amber-900 px-5 py-4 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isEditing
                ? "Saving..."
                : "Creating Account..."
              : isEditing
                ? "Save Profile"
                : "Create Account"}
          </motion.button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?
            <button
              onClick={() => router.push("/credentials/LoginPage")}
              className="ml-1 font-semibold text-amber-800 hover:text-amber-900 hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
