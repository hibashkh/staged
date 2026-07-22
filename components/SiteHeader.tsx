"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

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

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-serif text-lg font-semibold text-stone-900">Staged</span>
        {email && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-stone-600 hover:text-clay-600"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
