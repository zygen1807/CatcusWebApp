"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get current session first
        let {
          data: { session },
        } = await supabase.auth.getSession();

        // If no session yet, try exchanging the code
        if (!session) {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error("Exchange Error:", error);
              router.replace("/credentials/LoginPage");
              return;
            }

            const result = await supabase.auth.getSession();
            session = result.data.session;
          }
        }

        if (!session) {
          console.error("No authenticated session.");
          router.replace("/credentials/LoginPage");
          return;
        }

        const user = session.user;

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(profileError);
        }

        // Create profile if it doesn't exist
        if (!profile) {
          const { error } = await supabase.from("profiles").upsert(
            {
              id: user.id,
              name:
                user.user_metadata?.full_name || user.user_metadata?.name || "",
              email: user.email,
              avatar:
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                null,
              shop_name: "My Furniture Shop",
            },
            {
              onConflict: "id",
            },
          );

          if (error) {
            console.error(error);
          }
        }

        router.replace("/dashboard/dashboard");
      } catch (error) {
        console.error("Callback Error:", error);
        router.replace("/credentials/LoginPage");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Signing you in...</h1>

        <p className="text-gray-500 mt-2">
          Please wait while we prepare your workspace.
        </p>
      </div>
    </div>
  );
}
