"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "@carbon/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { NavAnchor } from "@/components/site/NavAnchor";

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
    <>
      <div className="admin-login-shell__intro">
        <Image
          src="/assets/img/seal.svg"
          alt="Federal Republic of Nigeria coat of arms"
          width={80}
          height={80}
          priority
          className="admin-login-shell__emblem"
        />
        <h1
          className="admin-login-shell__title text-4xl"
          style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
        >
          Log in
        </h1>
        <p className="admin-login-shell__lede">
          Authorized access only.{" "}
          <NavAnchor href="/" className="admin-login-shell__inline-link">
            Return to public site
          </NavAnchor>
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="admin-login-shell__form">
        <div className="admin-login-shell__fields">
          <p className="admin-login-shell__section-label">Continue with admin credentials</p>

          <TextInput
            id="admin-email"
            type="email"
            size="lg"
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

          <PasswordInput
            id="admin-password"
            size="lg"
            labelText="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            invalid={Boolean(error)}
            invalidText={error ?? undefined}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            kind="primary"
            size="lg"
            renderIcon={ArrowRight}
            className="admin-login-shell__submit home-search__btn"
            disabled={loading || !email.trim() || !password}
          >
            <ButtonLabel loading={loading}>Login</ButtonLabel>
          </Button>
        </div>
      </form>

      <p className="admin-login-shell__help">
        Need help? Contact your system administrator.
      </p>
    </>
  );
}