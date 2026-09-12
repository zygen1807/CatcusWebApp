"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import {
  HiOutlineBell,
  HiOutlineUserCircle,
  HiOutlineXMark,
  HiOutlineCamera,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlinePencilSquare,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

type Profile = {
  id?: string;
  name: string;
  shop_name: string;
  email: string;
  phone: string;
  avatar: string;
};

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    shop_name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [draftProfile, setDraftProfile] = useState({
    name: "",
    shop_name: "",
    phone: "",
  });

  const pageTitles: Record<string, string> = {
    "/dashboard/dashboard": "Dashboard",
    "/dashboard/projects": "Projects",
    "/dashboard/inventory": "Inventory",
    "/dashboard/price-list": "Materials Price List",
    "/dashboard/cutting-layout": "Cutting Layout",
  };
  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    setDraftProfile({
      name: profile.name,
      shop_name: profile.shop_name,
      phone: profile.phone,
    });
  }, [profile]);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,shop_name,email,phone,avatar")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (!data) {
      setProfileExists(false);
      setProfile({
        name: "",
        shop_name: "",
        email: user.email || "",
        phone: "",
        avatar: "",
      });
      setDraftProfile({ name: "", shop_name: "", phone: "" });
      return;
    }

    setProfileExists(true);
    setProfile({
      name: data.name || "",
      shop_name: data.shop_name || "",
      email: data.email || user.email || "",
      phone: data.phone || "",
      avatar: data.avatar || "",
    });
    setDraftProfile({
      name: data.name || "",
      shop_name: data.shop_name || "",
      phone: data.phone || "",
    });

    if (data.avatar) {
      const { data: imageData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.avatar);
      setAvatarUrl(imageData.publicUrl || "");
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
      const filePath = `pics/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const profilePayload = { avatar: filePath };
      const action = profileExists ? "update" : "insert";
      const profileQuery = profileExists
        ? supabase.from("profiles").update(profilePayload).eq("id", user.id)
        : supabase.from("profiles").insert({ id: user.id, ...profilePayload });

      const { error: updateError } = await profileQuery;
      if (updateError) throw updateError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl || "");
      setProfile((prev) => ({ ...prev, avatar: filePath }));
      setProfileExists(true);
    } catch (error: any) {
      console.error(error);
      setError(error.message ?? "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setError("");

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        name: draftProfile.name,
        shop_name: draftProfile.shop_name,
        phone: draftProfile.phone,
        email: profile.email,
      };

      const { error } = profileExists
        ? await supabase.from("profiles").update(payload).eq("id", user.id)
        : await supabase.from("profiles").upsert(
            {
              id: user.id,
              ...payload,
            },
            {
              onConflict: "id",
            },
          );

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        name: draftProfile.name,
        shop_name: draftProfile.shop_name,
        phone: draftProfile.phone,
      }));
      setProfileExists(true);
      setMode("view");
    } catch (error: any) {
      console.error(error);
      setError(error.message ?? "Unable to save profile.");
    } finally {
      setSaving(false);
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
      <header className="sticky top-0 z-20 border-b border-[#c9a77f]/70 bg-[#f6ead8]/75 px-4 py-3 shadow-[0_8px_28px_rgba(75,47,32,0.14)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a06a3e]">
              Workspace
            </p>
            <h1 className="text-xl font-bold text-[#4b2f20]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a77f] bg-[#4b2f20] text-[#fffaf2] transition hover:bg-[#6e4932]">
              <HiOutlineBell className="h-5 w-5" />
            </button>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-3 rounded-2xl border border-[#dfc7ab] bg-[#fffaf2] px-4 py-2 shadow-sm transition hover:shadow-md"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4b2f20] text-white">
                  <HiOutlineUserCircle className="h-6 w-6" />
                </span>
              )}
              <span className="text-sm font-medium text-[#2b1b14]">
                {profile.name || "Profile"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-white/95 shadow-[0_35px_120px_rgba(15,23,42,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Close profile modal"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>

            <div className="grid gap-8 px-8 py-8 lg:grid-cols-[220px_1fr]">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full bg-slate-900 text-white shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-slate-100">
                      <HiOutlineUserCircle />
                    </div>
                  )}

                  <label className="absolute right-0 bottom-0 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-900">
                    <HiOutlineCamera className="h-5 w-5" />
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={uploadImage}
                    />
                  </label>
                </div>

                <div className="space-y-3 text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Account
                  </p>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {profile.name || "Your name"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {profile.email || "No email available"}
                  </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">
                    Quick actions
                  </p>
                  <button
                    onClick={() => setMode("edit")}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <HiOutlinePencilSquare className="h-4 w-4" />
                    Edit profile
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-slate-950/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Profile
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {mode === "view" ? "Profile overview" : "Edit details"}
                      </h3>
                    </div>
                    <div className="inline-flex rounded-full bg-white/90 p-1 shadow-sm">
                      {(["view", "edit"] as const).map((item) => (
                        <button
                          key={item}
                          onClick={() => setMode(item)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            mode === item
                              ? "bg-slate-950 text-white"
                              : "text-slate-500 hover:bg-white"
                          }`}
                        >
                          {item === "view" ? "View" : "Edit"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {mode === "view" ? (
                  <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Name
                        </p>
                        <p className="mt-2 text-sm text-slate-950">
                          {profile.name || "Not set"}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Shop Name
                        </p>
                        <p className="mt-2 text-sm text-slate-950">
                          {profile.shop_name || "Not set"}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Phone
                        </p>
                        <p className="mt-2 text-sm text-slate-950">
                          {profile.phone || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
                        <HiOutlineEnvelope className="h-5 w-5 text-slate-500" />
                        <span className="text-sm text-slate-700">
                          {profile.email || "No email set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
                        <HiOutlinePhone className="h-5 w-5 text-slate-500" />
                        <span className="text-sm text-slate-700">
                          {profile.phone || "No phone set"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Name
                      </label>
                      <input
                        value={draftProfile.name}
                        onChange={(e) =>
                          setDraftProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Shop Name
                      </label>
                      <input
                        value={draftProfile.shop_name}
                        onChange={(e) =>
                          setDraftProfile((prev) => ({
                            ...prev,
                            shop_name: e.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Phone
                      </label>
                      <input
                        value={draftProfile.phone}
                        onChange={(e) =>
                          setDraftProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Email
                      </label>
                      <input
                        value={profile.email}
                        disabled
                        className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex min-w-[140px] items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        onClick={() => {
                          setMode("view");
                          setDraftProfile({
                            name: profile.name,
                            shop_name: profile.shop_name,
                            phone: profile.phone,
                          });
                        }}
                        className="inline-flex min-w-[140px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
                  Logout
                </button>

                {uploading && (
                  <p className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-600">
                    Uploading avatar...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
