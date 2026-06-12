"use client";

import React from "react";
import { AdminNavBar } from "@/components/admin/AdminNavBar";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { AdminUtilityBar } from "@/components/admin/AdminUtilityBar";

export function AdminChrome() {
  return (
    <header className="admin-chrome">
      <AdminUtilityBar trailing={<AdminSignOutButton kind="utility" />} />
      <AdminNavBar />
    </header>
  );
}