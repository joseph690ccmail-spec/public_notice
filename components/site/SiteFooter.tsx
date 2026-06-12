import React from "react";

const footerLinks = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms of Use" },
  { href: "#", label: "Accessibility" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t-2 border-[var(--color-primary)] bg-[var(--color-inverse-canvas)]">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="site-footer__copyright order-2 text-xs tracking-[0.16px] text-white/50 md:order-1 md:text-sm">
            © {new Date().getFullYear()} Federal Republic of Nigeria — PNN
          </p>

          <nav
            className="site-footer__nav order-1 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs tracking-[0.16px] sm:gap-x-0 md:order-2 md:text-sm"
            aria-label="Footer"
          >
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                {index > 0 && (
                  <span
                    className="hidden px-3 text-white/20 select-none sm:inline"
                    aria-hidden="true"
                  >
                    |
                  </span>
                )}
                <a href={link.href} className="site-footer__link">
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}