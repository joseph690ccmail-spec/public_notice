import React from "react";
import Image from "next/image";

interface AdminLoginShellProps {
  children: React.ReactNode;
}

export function AdminLoginShell({ children }: AdminLoginShellProps) {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-shell__body">
        <section className="admin-login-shell__form-panel" aria-label="Admin sign in">
          <div className="admin-login-shell__form-inner">{children}</div>
        </section>

        <aside className="admin-login-shell__visual-panel" aria-hidden>
          <div className="admin-login-shell__visual-frame">
            <Image
              src="/assets/img/2992.jpg"
              alt=""
              fill
              priority
              className="admin-login-shell__visual-image object-cover"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}