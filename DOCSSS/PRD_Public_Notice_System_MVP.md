# Public Notice System (PNS)
## Product Requirements Document (MVP) — Change of Name Focus
**Version:** 1.0  
**Date:** June 11, 2026  
**Status:** Draft for Review  
**Author:** Grok (xAI) — Research & Product Team  
**For:** Digital Public Notice Platform for Nigeria

---

## 1. Executive Summary

Nigeria's current system for publishing public notices — especially **Change of Name** — relies on archaic, expensive, and fragmented newspaper publications. Individuals spend ₦8,000–₦20,000+ and several days to swear an affidavit and publish in a national daily. The process is paper-based, difficult to search or verify years later, environmentally wasteful, and not centrally archived.

The **Public Notice System (PNS)** is a modern digital platform that replaces and improves this process. It provides a centralized, searchable, timestamped, and verifiable digital public notice registry.

**MVP Focus:** Individual **Change of Name** public notices.

**Core Value Proposition:**
- **Affordable**: Target cost ₦1,500 – ₦4,000 per notice (vs ₦8k–20k+ today).
- **Fast**: Publish in minutes/hours (vs 1–3 days).
- **Verifiable**: Unique **Public Notice Number (PNN)** + QR-coded PDF certificate.
- **Searchable**: Anyone can instantly search and view notices nationwide.
- **Legal-Supporting**: Issues professional digital publication proof that complements (and can eventually integrate with) the Supreme Court-mandated Deed Poll + National Population Commission (NPC) Official Gazette process.
- **Transparent & Eco-friendly**: Paperless, permanent digital record, public objection capability for relevant notices.

The platform issues every published notice a unique **PNN** (e.g., `PNS/CON/2026/000123`). Users and institutions can verify notices instantly via web or future API.

**Long-term Vision:** Become Nigeria’s trusted digital public notice infrastructure — eventually recognized by NPC, CAC, banks, immigration, and courts as a valid or supplementary channel for public notices.

---

## 2. Problem Statement

### Current State (Research Summary)
- **Most common path today** (widely accepted by banks, schools, NIMC updates, etc.):
  1. Swear **Change of Name Affidavit** at court or via online services (₦1,000–₦5,000).
  2. Publish notice in a **national newspaper** (₦3,000–₦15,000+ depending on paper and agent).
  3. Total cost: ₦8,000–₦20,000+. Time: 2–5 days. Physical newspaper copy required by many institutions.
- **Supreme Court Ruling** (PDP v. Degi-Eremienyo & related cases): Affidavit + newspaper publication is **insufficient** for official legal name change affecting national records. Proper process requires:
  - Execute **Deed Poll** (lawyer-drafted, signed with 2 witnesses).
  - Lodge with **National Population Commission (NPC)** Civil Registry (currently physical submission in Abuja; online portal planned).
  - Publish in **Official Gazette**.
  - Obtain **Certificate of Change of Name**.
- Many institutions still accept newspaper publication for practical record updates (passport, bank, WAEC, etc.).
- **Pain Points**:
  - High and variable cost.
  - Fragmented (different newspapers = different reach/credibility).
  - Not easily searchable or archivable.
  - Environmental waste (paper).
  - Time-consuming and requires physical visits/agents.
  - No central public database.
  - Limited transparency (hard for public to see all notices or raise objections easily).
  - For CAC-related notices (NGOs, company name changes): Mandatory newspaper publication for 28-day objection period is cumbersome.

### Opportunity
Digitize the **public notice / publication** layer — the part that newspaper currently handles — while guiding users on the full legal pathway (Affidavit vs Deed Poll + NPC).

---

## 3. Goals & Objectives

### Primary Goals (MVP — 3–6 months)
1. Launch a reliable, user-friendly web platform for publishing and discovering Change of Name public notices.
2. Reduce average cost of publishing a Change of Name notice by **≥60%**.
3. Achieve **< 4 hours** average time from payment to live public notice.
4. Build a searchable public database with **≥5,000 notices** in first 6 months.
5. Attain high user trust: ≥4.5/5 satisfaction, strong verification features.

### Success Metrics / KPIs
| Metric                        | Target (6 months)     | Measurement Method          |
|-------------------------------|-----------------------|-----------------------------|
| Notices Published             | 5,000+                | Platform analytics          |
| Unique Public Visitors        | 50,000+/month         | Google Analytics / Plausible|
| Average Cost per Notice       | ≤ ₦3,500              | Transaction data            |
| Time to Publish (post-payment)| < 4 hours (median)    | Timestamp logs              |
| Search / View Actions         | 100,000+/month        | Analytics                   |
| User NPS / CSAT               | ≥ 45 / 4.5            | Post-publish survey         |
| Verification Rate (QR/PNN checks) | High engagement    | QR scan / page view logs    |
| Repeat Users / Agents         | 30%+ of publishers    | Cohort analysis             |

---

## 4. Target Users & Personas

### Primary
- **Everyday Individual (Chidinma, 32)**: Recently married, wants to update records. Tech-savvy but values simplicity and low cost. Uses phone primarily.
- **Name Correction User (Emeka, 45)**: Spelling error on birth certificate or old documents; needs clean public record.
- **Religious/Cultural Change User**: Adopts new name for faith or family reasons.

### Secondary
- **Legal Agents / Lawyers / Paralegals**: Handle bulk or client notices; want efficiency and professional output.
- **Institutions (Banks, Schools, NPC, CAC, Immigration)**: Need easy verification of notices (future API + manual search).
- **Public / Researchers**: Curious citizens, journalists, or people checking for conflicts.

### Admin / Operations
- Platform moderators (review for abuse, completeness).
- Super admins (analytics, compliance, user support).

---

## 5. Scope

### In Scope — MVP
- User registration & authentication (email + phone OTP; optional NIN for "Verified" tier).
- **Change of Name (Individual)** notice type only.
- Guided submission flow with:
  - Auto-generated standard notice text.
  - Upload of supporting document (scanned affidavit, Deed Poll, or ID).
  - Preview before publish.
- Payment integration (Paystack / Flutterwave).
- **Public Notice Number (PNN)** generation and assignment.
- Professional PDF certificate generation (with QR code, security features, watermark).
- **Public searchable database** (no login required): Search by old/new name, PNN, date range, keyword. Detail view + shareable link.
- User dashboard: My notices, download PDFs, view public links, status.
- Basic moderation queue (approve/reject with reason; auto-publish for verified users).
- Mobile-responsive web app (PWA-ready).
- Clear legal disclaimers on every page and document.
- Privacy Policy + NDPR-compliant data handling.
- Basic analytics dashboard (internal).

### Out of Scope — MVP
- Company / NGO / CAC change of name notices (Phase 2).
- Other notice types (loss of documents, chieftaincy, land, marriage banns, etc.).
- Full NPC Deed Poll execution or direct Gazette integration (future partnership).
- Native mobile apps (iOS/Android).
- Advanced AI fraud detection or biometric verification.
- Built-in e-signature for legal documents (research legal validity first).
- Objection workflow / 28-day comment period (simple reporting/flagging in MVP; full workflow later).
- Programmatic API for institutions (Phase 2+).
- Offline mode or USSD (future accessibility play).

**Explicit MVP Positioning Statement** (to appear on site):
> "PNS provides fast, affordable, and verifiable **digital public notice publication**. It complements — but does not replace — the official legal process of executing a Deed Poll and publishing in the National Population Commission Official Gazette for full legal name change recognition. Always consult a legal practitioner for your specific situation."

---

## 6. Functional Requirements

### 6.1 User Registration & Profile
- **FR-REG-01**: Register with email + Nigerian phone number (OTP verification via Termii/AfricasTalking or similar).
- **FR-REG-02**: Optional "Verified Publisher" tier: Upload NIN slip + selfie or link NIN (future NIMC integration research). Unlocks faster auto-publish and badge.
- **FR-REG-03**: Profile fields: Full name, address, optional DOB, profile photo (for trust?).
- **FR-REG-04**: Passwordless login preference (magic link + OTP).

### 6.2 Change of Name Notice Submission
- **FR-NOT-01**: Form fields (required):
  - Old Full Legal Name (exact match to existing docs)
  - New Full Legal Name
  - Date of Birth (optional but recommended)
  - Current Residential Address
  - State / LGA
  - Reason category (dropdown: Marriage, Spelling Correction, Religious/Cultural, Family, Other — with free text)
  - Contact phone/email (pre-filled from profile)
- **FR-NOT-02**: Supporting Document upload (PDF/JPG, max 5MB): Scanned court affidavit, Deed Poll, or valid government ID. Clear guidance on what is acceptable.
- **FR-NOT-03**: Auto-generated notice preview in standard professional format:
  > **PUBLIC NOTICE**  
  > **CHANGE OF NAME**  
  > I, **[OLD NAME]**, of **[ADDRESS]**, do hereby give notice that I have renounced and abandoned the use of my former name and have assumed the name **[NEW NAME]**.  
  > All documents, records, and correspondences bearing my former name remain valid and should be treated as referring to my new name.  
  > The general public and all relevant authorities are hereby notified.  
  > Dated this ___ day of __________, 20__.  
  > Signed: ________________  
  > **Public Notice Number: PNS/CON/2026/XXXXXX**
- **FR-NOT-04**: User can edit the generated text slightly (with limits to prevent abuse).
- **FR-NOT-05**: Payment tiers (suggested):
  - **Standard**: ₦2,500 — Basic publication + PDF.
  - **Verified**: ₦3,500 — + "Verified Publisher" badge + priority review (for NIN-linked users).
  - Optional add-on: Featured / highlighted for 30 days (+₦1,000).
- **FR-NOT-06**: Submission creates "Pending" record. Auto-publish for Verified users after payment + basic checks. Manual review queue for others (SLA: 2 hours during business hours).

### 6.3 Publication & Certificate
- **FR-PUB-01**: Upon publish: Generate unique **PNN** (format: `PNS/CON/YYYY/NNNNNN` — sequential, zero-padded).
- **FR-PUB-02**: Create beautiful, print-ready PDF certificate:
  - Professional header with PNS logo + Nigerian coat of arms style.
  - Full notice text.
  - QR code linking to public verification page (`https://pns.ng/verify/{pnn}` or `/notices/{id}`).
  - Timestamp (published date/time + timezone WAT).
  - Digital signature / hash for tamper detection (future).
  - Watermark "DIGITAL PUBLIC NOTICE — VERIFY AT pns.ng".
  - Downloadable immediately; also emailed.
- **FR-PUB-03**: Live public page for every notice with share buttons (WhatsApp, X, Facebook, copy link), print option.

### 6.4 Public Discovery & Verification
- **FR-PUB-04**: **Public Search** (no login):
  - Prominent search bar on homepage.
  - Filters: Date range, State, Reason category, Verified only.
  - Results: Card list (Old → New name, PNN, date, location snippet).
  - Click → Full detail page + PDF download option.
- **FR-PUB-05**: Direct verification: `/verify/{PNN}` shows notice or "Not Found".
- **FR-PUB-06**: Recent notices feed on homepage (last 50 or so).
- **FR-PUB-07**: Basic stats on homepage (anonymized): "X notices published this month", "Most common reason: Marriage (42%)".

### 6.5 User Dashboard
- **FR-DASH-01**: "My Notices" list with status, PNN, date, actions (View Public, Download PDF, Share).
- **FR-DASH-02**: Ability to "Republish" or correct minor errors (new version with new PNN? or amendment notice — design carefully).
- **FR-DASH-03**: Notification center: Email + in-app on publish success, and optional SMS.

### 6.6 Admin & Moderation
- **FR-ADM-01**: Moderation queue: View pending notices, approve/reject with reason (e.g., "Incomplete document", "Potential duplicate", "Policy violation").
- **FR-ADM-02**: User management, flagging abusive accounts.
- **FR-ADM-03**: Analytics: Notices per day/week, top reasons, geographic distribution, revenue, etc. (anonymized where needed).
- **FR-ADM-04**: Export tools (CSV of notices for compliance/backup).

### 6.7 Compliance & Legal
- **FR-LEG-01**: Prominent disclaimers on all forms, PDFs, and public pages.
- **FR-LEG-02**: Privacy Policy + Terms of Service (clear consent for public publication of notice data).
- **FR-LEG-03**: NDPR / NDPA 2023 compliance: Data minimization, consent management, breach procedures, audit logging. Register as Data Controller of Major Importance with NDPC if thresholds met.
- **FR-LEG-04**: Content moderation policy (no hate speech, no impersonation, clear appeals process).

---

## 7. Non-Functional Requirements

| Category          | Requirement                                                                 | Priority |
|-------------------|-----------------------------------------------------------------------------|----------|
| **Performance**   | Homepage & search load < 2.5s on 4G. Publish flow < 10s after payment.     | High    |
| **Scalability**   | Support 10,000+ concurrent users; horizontal scaling ready.                 | High    |
| **Security**      | HTTPS everywhere, OWASP Top 10 mitigation, rate limiting, input sanitization. File uploads scanned. | Critical |
| **Data Protection**| Full NDPR/NDPA compliance. Personal data encrypted at rest. Public notice data intentionally public. Audit logs for all access/changes. | Critical |
| **Reliability**   | 99.5%+ uptime. Automated backups daily. Disaster recovery plan.             | High    |
| **Accessibility** | WCAG 2.1 AA. Mobile-first responsive design. Screen reader friendly.        | High    |
| **Usability**     | Intuitive for non-tech users (age 18–65). Clear error messages & guidance.  | High    |
| **Browser Support**| Modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions).         | Medium  |
| **Payments**      | Secure, reliable local gateways (Paystack primary). Webhook handling.       | Critical |
| **SEO**           | Public notice pages indexable by Google (for discoverability).              | Medium  |

---

## 8. Key User Flows (High-Level)

1. **Publish a Notice (New User)**
   - Land on homepage → "Publish Change of Name" CTA.
   - Register / Login (OTP).
   - Fill form → Upload document → Preview notice text.
   - Choose tier → Pay.
   - Confirmation screen + "Your notice is being processed".
   - (If Verified) → Immediate publish + PDF ready.
   - (Else) → Email when live (within 2h).

2. **Search & Verify (Public)**
   - Homepage search bar or `/notices`.
   - Enter name or PNN → See results or direct match.
   - View full notice + download PDF or scan QR.

3. **Admin Review**
   - Dashboard → Pending queue.
   - Review details + document.
   - Approve (auto-generates PNN/PDF) or Reject with note to user.

---

## 9. Technical Considerations (High-Level)

- **Frontend**: Next.js (React) + Tailwind CSS + shadcn/ui or similar for clean, modern UI.
- **Backend**: Node.js (NestJS) or Python (FastAPI/Django) — preference for strong typing and speed.
- **Database**: PostgreSQL (notices, users, payments). Full-text search + filters.
- **Search**: Postgres + pg_trgm or Elasticsearch for advanced name search (fuzzy matching important for names).
- **File Storage**: AWS S3 or Cloudflare R2 (PDFs, uploads) with signed URLs.
- **PDF Generation**: Server-side (Puppeteer / React-PDF / PDFKit) for consistent, high-quality certificates.
- **Auth**: Supabase Auth or Clerk + custom OTP/SMS.
- **Payments**: Paystack (primary) + Flutterwave fallback.
- **Hosting**: Vercel (frontend) + Railway / Render / AWS (backend). Or all-in-one on Railway.
- **Monitoring**: Sentry (errors), PostHog or Mixpanel (product analytics), UptimeRobot.
- **Future-proof**: Design with clear separation for multi-notice-type expansion and government integrations.

**Recommended Architecture Principle**: Start simple and monolithic; extract services only when scale demands it.

---

## 10. Risks, Assumptions & Dependencies

### Key Assumptions
- Significant demand exists for a cheaper, faster, digital alternative to newspaper publications (validated by existing online agents like Affidafy, VeinsNG, etc.).
- Users are willing to pay a small transparent fee for convenience + professional digital proof.
- Institutions will gradually accept PNS certificates (marketing + partnerships needed).
- Nigeria's mobile/internet penetration supports web-first experience.

### Risks & Mitigations
| Risk                              | Likelihood | Impact | Mitigation |
|-----------------------------------|------------|--------|----------|
| Legal challenge on validity of digital notices | Medium    | High   | Strong disclaimers; consult Nigerian lawyers early; position as "publication layer" only; pursue NPC/CAC recognition in Phase 2. |
| Low initial adoption              | Medium    | High   | Heavy marketing to lawyers/agents; referral program; partner with existing affidavit services; free first notice for early users. |
| Fraud / Fake notices              | Medium    | Medium | Verification tier (NIN), manual moderation, reporting tools, digital signatures on PDFs. |
| Data privacy breach               | Low       | High   | NDPR compliance from day 1; minimal data collection; encryption; regular audits. |
| Payment gateway downtime          | Low       | Medium | Multiple gateways + fallback messaging. |
| Government regulation changes     | Low       | Medium | Monitor NPC/CAC developments; flexible architecture. |

### Dependencies
- Reliable SMS/OTP provider with good Nigeria coverage.
- Payment processor approval (KYC for business account).
- Legal review of all templates, disclaimers, and terms (critical before launch).
- Initial content seeding (sample notices) for search engine visibility.

---

## 11. Future Roadmap (Post-MVP)

**Phase 2 (Months 4–9)**
- Company / NGO / Incorporated Trustees change of name notices (with built-in 28-day public objection/comment period).
- Loss of Documents public notices.
- Deeper NPC integration research / pilot (digital submission support or recognition of PNS as supplementary publication).
- Basic API for institutions to verify PNN programmatically.
- Enhanced verification (lawyer/notary digital stamp upload).

**Phase 3 (Year 2)**
- Full multi-notice-type platform (land, chieftaincy, invitations to treat, etc.).
- Official recognition/partnership with NPC and/or CAC.
- Mobile apps + USSD for low-tech users.
- AI-assisted name matching / duplicate detection.
- Analytics dashboard for public policy insights (anonymized).

---

## 12. Appendix

### A. Research Sources (Key)
- Affidafy.com.ng and similar agents: Current newspaper + affidavit process & pricing.
- Supreme Court ruling references (PDP v. Degi-Eremienyo): Deed Poll + NPC Gazette is the proper legal route.
- National Population Commission (nationalpopulation.gov.ng): Current physical process; online portal in development.
- CAC requirements for Incorporated Trustees name changes: Mandatory newspaper publication for objections.
- NDPC / NDPR guidance: Data protection obligations for platforms handling personal data.

### B. Sample Notice Text (Standard Format)
*(Auto-generated and customizable within limits)*

> **PUBLIC NOTICE**  
> **CHANGE OF NAME**  
> 
> I, **CHIAMAKA OLUCHI EZE**, of No. 15B Adeniyi Jones Avenue, Ikeja, Lagos State, do hereby give public notice that I have renounced and abandoned the use of my former name **CHIAMAKA OLUCHI EZE** and have assumed and adopted the name **CHIAMAKA OLUCHI ADEbayo**.  
> 
> All documents, bank records, academic certificates, and correspondences bearing my former name remain valid and should henceforth be read and construed as referring to my new name **CHIAMAKA OLUCHI ADEbayo**.  
> 
> The general public, all government agencies, financial institutions, and relevant authorities are hereby notified of this change.  
> 
> Dated this 11th day of June, 2026.  
> 
> **Public Notice Number:** PNS/CON/2026/000847  
> **Published on:** PNS.ng — Digital Public Notice Registry

### C. Recommended Next Steps Before Development
1. Engage Nigerian corporate/commercial lawyer to review all legal positioning, disclaimers, and templates.
2. Validate pricing and demand with 20–30 target users (lawyers + individuals).
3. Secure domain `pns.ng` or `publicnotice.ng` + branding.
4. Define exact moderation policy and escalation matrix.
5. Plan go-to-market: Target legal tech influencers, WhatsApp groups of lawyers/agents, Facebook ads in key cities.

---

**Document Control**  
This PRD is a living document. All changes after v1.0 should be tracked with version history and stakeholder sign-off.

**End of PRD v1.0**

---

*Built with research from current Nigerian practices, Supreme Court guidance, and best practices for digital government-adjacent public services. Ready for product, design, and engineering teams to turn into reality.*