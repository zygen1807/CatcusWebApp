"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", user.email)
        .single();

      if (data?.role === "master") {
        router.push("/dashboard/dashboard");
      } else {
        alert("Not authorized as Master Carpenter");
        await supabase.auth.signOut();
        router.push("/");
      }
    };

    checkUser();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      Logging in...
    </div>
  );
}