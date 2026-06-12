"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@carbon/react";

interface AdminSignOutButtonProps {
  kind?: "secondary" | "utility";
}

export function AdminSignOutButton({ kind = "secondary" }: AdminSignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (kind === "utility") {
    return (
      <button
        type="button"
        className="admin-utility-bar__sign-out text-xs tracking-[0.16px] text-white/75 transition-colors hover:text-white disabled:opacity-60"
        disabled={loading}
        onClick={() => void handleSignOut()}
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
    );
  }

  return (
    <Button kind="secondary" disabled={loading} onClick={() => void handleSignOut()}>
      Sign out
    </Button>
  );
}