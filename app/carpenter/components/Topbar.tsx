"use client";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  UserCircle2,
  X,
  Camera,
  Mail,
  Phone,
} from "lucide-react";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function getAvatarUrl(avatarPathOrUrl: string) {
    if (!avatarPathOrUrl) return "";
    if (avatarPathOrUrl.startsWith("http")) return avatarPathOrUrl;

    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPathOrUrl);
    return data?.publicUrl ?? "";
  }

  async function loadProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setProfile(data);

  if (data.avatar) {
    const { data: imageData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.avatar);

    setAvatarUrl(imageData.publicUrl);
  }
}

 async function uploadImage(e: ChangeEvent<HTMLInputElement>) {
  setError("");

  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const fileExt = file.name.split(".").pop();

    // pics folder
    const filePath = `pics/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // SAVE STORAGE PATH ONLY
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar: filePath,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // GET URL FOR IMMEDIATE DISPLAY
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);

    setProfile((prev) => ({
      ...prev,
      avatar: filePath,
    }));
  } catch (error: any) {
    console.error(error);
    setError(error.message);
  } finally {
    setUploading(false);
  }
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  router.push("/");
}

  return (
    <>
      {/* TOPBAR */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">

        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl w-[300px]">
          <Search size={18} />
          <input className="bg-transparent ml-2 outline-none w-full" placeholder="Search..." />
        </div>

        <div className="flex gap-4 items-center">

          <Bell className="cursor-pointer" />

          {/* PROFILE ICON (NOW SHOWS IMAGE AFTER UPLOAD) */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl"
          >
           {avatarUrl ? (
  <img
    src={avatarUrl}
    alt="Avatar"
    className="w-6 h-6 rounded-full object-cover"
  />
) : (
  <UserCircle2 />
)}

            <span>Profile</span>
          </button>

        </div>
      </header>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-[400px] rounded-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5"
            >
              <X />
            </button>

            <div className="flex flex-col items-center">

              {/* PROFILE IMAGE */}
              <div className="relative">

                <img
                  src={avatarUrl || "/profile.png"}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                    />

                <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer">
                  <Camera size={14} />
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                  />
                </label>

              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <p className="text-red-500 text-sm mt-2">
                  {error}
                </p>
              )}

              {/* LOADING */}
              {uploading && (
                <p className="text-gray-500 text-sm mt-2">
                  Uploading...
                </p>
              )}

              {/* USER INFO */}
              <h2 className="mt-4 text-xl font-bold">
                {profile.name}
              </h2>

              <div className="mt-5 space-y-3">

                <div className="flex gap-2 items-center">
                  <Mail size={16} />
                  {profile.email}
                </div>

                <div className="flex gap-2 items-center">
                  <Phone size={16} />
                  {profile.phone}
                </div>

              </div>

              <button
  onClick={handleLogout}
  className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
>
  Logout
</button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}