First, a quick reality check: in software engineering, there is no such thing as "100% safe." Security is a continuous process of risk mitigation, not a final destination. However, given the legal and financial implications of the Public Notice Network, you can build an enterprise-grade fortress around this MVP that makes it prohibitively difficult to exploit.

Since we are dealing with a guest-first architecture and legal documents in Nigeria, the attack vectors are primarily data scraping, fake document uploads, webhook spoofing, and session hijacking.

Here is the comprehensive security checklist and the specific NestJS architecture (Middlewares, Controllers, and Utils) needed to lock this down.

### 1. Global Middlewares (The First Line of Defense)

These should be applied globally in your `main.ts` file before requests even hit your controllers.

* **Helmet (`helmet`):** Secures app by setting crucial HTTP response headers (preventing clickjacking, sniffing, etc.).
* **Strict CORS Policy:** Do not use `cors: true`. Explicitly whitelist only your exact frontend domain (e.g., `https://publicnotice.ng`) and the payment gateway webhook IPs.
* **Global Rate Limiting (`@nestjs/throttler`):** * **Strict Limit on OTP/Emails:** Prevent attackers from using your `/api/v1/drafts/save-link` endpoint to spam Nigerian phone numbers (SMS bombing).
* **Strict Limit on Search:** Prevent malicious actors from writing scripts to scrape the `/api/v1/notices` endpoint to steal citizen data. Limit searches to something like 10 per minute per IP.



### 2. Controller Security (Data Validation & Access)

Because users aren't logging in, your controllers need strict rules to ensure they are handling the right data for the right session.

* **Strict DTO Validation (`class-validator` & `class-transformer`):** Use NestJS `ValidationPipe` globally with `whitelist: true` and `forbidNonWhitelisted: true`. If an attacker tries to inject extra fields (like `isPaid: true` or `isAdmin: true`) into the JSON payload, the controller will strip them out or throw an error.
* **Draft Hijacking Prevention:** Since `draftId` is the only thing linking a user to their session, make sure the ID is a secure, unguessable UUIDv4. To be extra safe, store a hashed version of the user's IP or a browser fingerprint in the draft record. If the IP suddenly changes during the 5-minute form-filling process, flag it.

### 3. File Upload Utils (Cloudflare R2 / AWS S3)

Handling images (Affidavits) is one of the biggest security risks. Malicious files can compromise your server, or exposed buckets can leak sensitive court documents.

* **Never Upload Directly from Frontend to Public Buckets:** The frontend should send the file to your NestJS backend, OR the backend should generate a **Pre-Signed URL** that the frontend uses to upload directly to Cloudflare R2 securely.
* **Strict size limits (e.g. 8MB), re-validate magic bytes + MIME after upload, and consider basic content checks.
* **MIME Type & Magic Number Validation:** Don't just check the `.jpg` extension. Use a utility to check the file's "magic numbers" (file signatures) to ensure an uploaded file isn't actually an executable script masquerading as an image.
* **EXIF Data Stripping Util:** When users take photos of their affidavits with their phones, the image metadata often contains the exact GPS coordinates of their home. Use a utility like `sharp` to strip all EXIF data before sending it to Cloudflare R2.
* **Private Buckets:** The Cloudflare R2 bucket holding the affidavits must be completely private. Only the backend should be able to fetch the image to serve to the Admin for verification.

### 4. Payment Security Utils (The Webhook Fortress)

This is where you protect the revenue and prevent fake public notices from going live.

* **Webhook Signature Verification (Critical Util):** Attackers will figure out your webhook URL (`/api/v1/webhooks/paystack`) and send fake "payment successful" JSON payloads to force the system to publish their notice.
* **The Fix:** Follow the exact documentaion of paystack and integrate it according to their security rules


* **Idempotency Checks:** Ensure your webhook controller checks if a `draftId` or payment reference has *already* been processed. This prevents race conditions or duplicate webhook events from publishing the same notice twice.

### 5. Compliance & Data Privacy (NDPA)

To comply with the Nigeria Data Protection Act (NDPA) and ensure banks trust your system:

* **Data Masking on the Public Ledger:** When someone searches for a notice, never return the user's email in the JSON response. The controller must explicitly omit these fields.
* **Immutability Logs:** If an admin corrects a typo in a notice, the database must log *who* made the change and *when*.

---

Layer,Tool,What to Do,Why It Helps Against IP Rotation
Edge Rate Limiting,Cloudflare Advanced Rate Limiting,Create a rule for /api/v1/notices. Count using IP + JA3/JA4 fingerprint + ASN (not just IP),Much harder to rotate around