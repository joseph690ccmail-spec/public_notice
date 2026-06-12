"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { FieldError } from "@/components/publish/wizard/ui/FieldError";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        data?: unknown;
        error?: { message?: string };
      };

      if (!response.ok) {
        setError(payload.error?.message ?? "Could not sign in. Please try again.");
        return;
      }

      const next = searchParams.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-ink)]">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Sign in to manage public notices and review publications.
        </p>
      </div>

      <TextInput
        id="admin-email"
        type="email"
        labelText="Email"
        placeholder="admin@publicnotice.ng"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
        disabled={loading}
        invalid={Boolean(error)}
        autoComplete="username"
      />

      <div>
        <PasswordInput
          id="admin-password"
          labelText="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
          disabled={loading}
          invalid={Boolean(error)}
          autoComplete="current-password"
        />
        <FieldError message={error ?? undefined} />
      </div>

      <Button
        type="submit"
        kind="primary"
        className="home-search__btn w-full max-w-none"
        disabled={loading || !email.trim() || !password}
      >
        <ButtonLabel loading={loading}>Sign in</ButtonLabel>
      </Button>
    </form>
  );
}