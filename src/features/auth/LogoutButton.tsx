"use client";

import { logout } from "@/features/auth/auth.api";
import { useState } from "react";

type LogoutButtonProps = {
  label?: string;
  loadingLabel?: string;
  redirectTo?: string;
};

export function LogoutButton({
  label = "Logout",
  loadingLabel = "Signing out...",
  redirectTo = "/login",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logout();
      try {
        for (const key of Object.keys(sessionStorage))
          if (key.startsWith("sivar-judge:")) sessionStorage.removeItem(key);
      } catch {
        /* Device storage is optional. */
      }
      window.location.replace(redirectTo);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white disabled:opacity-60"
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
