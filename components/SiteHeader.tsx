"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, [pathname]);

  if (pathname === "/login" || pathname === "/signup") return null;

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await fetch("/api/auth/account", { method: "DELETE" });
      router.push("/signup");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-serif text-lg font-semibold text-stone-900">Staged</span>
        {email && !confirmingDelete && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-stone-600 hover:text-clay-600"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm font-medium text-stone-400 hover:text-red-600"
            >
              Delete account
            </button>
          </div>
        )}
        {email && confirmingDelete && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600">
              Delete your account and all your rooms? This can&apos;t be undone.
            </span>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
