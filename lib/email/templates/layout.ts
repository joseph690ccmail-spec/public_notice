import { appBaseUrl } from "@/lib/app-url";
import { escapeHtml } from "@/lib/email/escape";

const FONT = "'IBM Plex Sans', Arial, sans-serif";
const INK = "#161616";
const MUTED = "#525252";
const CANVAS = "#f4f4f4";
const OUTER = "#dcdcdc";
const HAIRLINE = "#c6c6c6";
const PRIMARY = "#008751";
const PRIMARY_DARK = "#005c38";

export interface EmailLayoutOptions {
  headline: string;
  bodyRows: string;
  recipientEmail: string;
}

function brandLogoUrl(): string {
  return `${appBaseUrl()}/assets/img/icon.png`;
}

function footerLinks(): string {
  const base = appBaseUrl();
  const linkStyle = `color:${PRIMARY};text-decoration:none`;
  return `<a href="${base}" rel="noopener noreferrer" style="${linkStyle}" target="_blank">Public Notice System</a>
    &nbsp;|&nbsp;
    <a href="${base}/notices" rel="noopener noreferrer" style="${linkStyle}" target="_blank">Verify a notice</a>
    &nbsp;|&nbsp;
    <a href="${base}" rel="noopener noreferrer" style="${linkStyle}" target="_blank">Help</a>`;
}

export function renderEmailLayout({
  headline,
  bodyRows,
  recipientEmail,
}: EmailLayoutOptions): string {
  const logoUrl = brandLogoUrl();
  const safeEmail = escapeHtml(recipientEmail);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Public Notice System</title>
  </head>
  <body style="margin:0;padding:0;background-color:${OUTER}">
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;padding:40px 0;background-color:${OUTER};min-width:100%">
      <tbody>
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="700" style="width:700px;max-width:700px;background-color:#ffffff">
              <tbody>
                <tr>
                  <td style="background-color:${CANVAS};padding:24px 32px 0 32px">
                    <img src="${logoUrl}" width="48" height="48" alt="Public Notice System" title="Public Notice System" style="display:block">
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${CANVAS};padding:40px 32px 48px 32px">
                    <div style="color:${INK};font-family:${FONT};font-size:42px;font-weight:300;line-height:50px">
                      ${headline}
                    </div>
                  </td>
                </tr>
                ${bodyRows}
                <tr>
                  <td style="background-color:${CANVAS};padding:16px 32px">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tbody>
                        <tr>
                          <td style="vertical-align:middle">
                            <span style="color:${INK};font-family:${FONT};font-size:14px;font-weight:400;line-height:18px">
                              © ${year} Federal Republic of Nigeria — Public Notice System
                            </span>
                          </td>
                          <td align="right" style="vertical-align:middle">
                            <img src="${logoUrl}" width="40" height="40" alt="Public Notice System" style="display:block">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${CANVAS};padding:0 32px">
                    <hr style="border:none;border-top:1px solid ${HAIRLINE};margin:0">
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${CANVAS};padding:16px 32px 8px 32px">
                    <p style="margin:0;color:${MUTED};font-family:${FONT};font-size:12px;font-weight:400;line-height:16px">
                      This email was sent to <a href="mailto:${safeEmail}" style="color:${PRIMARY_DARK};text-decoration:none">${safeEmail}</a>. Do not reply or forward.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${CANVAS};padding:8px 32px">
                    <p style="margin:0;color:${MUTED};font-family:${FONT};font-size:12px;font-weight:400;line-height:16px">
                      ${footerLinks()}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:${CANVAS};padding:8px 32px 24px 32px">
                    <p style="margin:0;color:${MUTED};font-family:${FONT};font-size:12px;font-weight:400;line-height:16px">
                      Federal Republic of Nigeria — Public Notice Registry
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}

export function emailParagraph(text: string, padding = "42px 32px 0 32px"): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:${padding}">
      <p style="margin:0;color:${INK};font-family:${FONT};font-size:16px;font-weight:400;line-height:22px">
        ${text}
      </p>
    </td>
  </tr>`;
}

export function emailLabelValue(label: string, valueHtml: string): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:24px 32px 0 32px">
      <p style="margin:0 0 4px 0;color:${INK};font-family:${FONT};font-size:16px;font-weight:600;line-height:22px">
        ${label}
      </p>
      <p style="margin:0;color:${MUTED};font-family:${FONT};font-size:16px;font-weight:400;line-height:22px">
        ${valueHtml}
      </p>
    </td>
  </tr>`;
}

export function emailDivider(): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:32px 32px 0 32px">
      <hr style="border:none;border-top:1px solid ${HAIRLINE};margin:0">
    </td>
  </tr>`;
}

export function emailCtaBlock(copy: string, buttonLabel: string, buttonUrl: string): string {
  const safeUrl = escapeHtml(buttonUrl);
  return `<tr>
    <td style="background-color:#ffffff;padding:32px 32px 0 32px">
      <p style="margin:0 0 16px 0;color:${INK};font-family:${FONT};font-size:16px;font-weight:400;line-height:22px">
        ${copy}
      </p>
      <a href="${safeUrl}" rel="noopener noreferrer" style="display:inline-block;padding:14px 24px;background-color:${PRIMARY};color:#ffffff;text-decoration:none;font-family:${FONT};font-size:14px;font-weight:500;line-height:1.28572;letter-spacing:0.16px;border-radius:0" target="_blank">${escapeHtml(buttonLabel)}</a>
    </td>
  </tr>`;
}

export function emailClosing(text: string): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:24px 32px 40px 32px">
      <p style="margin:0;color:${INK};font-family:${FONT};font-size:16px;font-weight:400;line-height:22px">
        ${text}
      </p>
    </td>
  </tr>`;
}