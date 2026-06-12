"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@carbon/react";

export function AdminSignOutButton() {
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

  return (
    <Button kind="secondary" disabled={loading} onClick={() => void handleSignOut()}>
      Sign out
    </Button>
  );
}