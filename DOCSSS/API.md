This is a solid, frictionless architecture. Translating that guest-first, auto-saving flow into a backend requires a clean set of RESTful API routes.

To support this exact journey, the backend should expose endpoints categorized into **Drafts** (for the silent saving process), **Payments**, **Webhooks** (to handle the offline payment drops), and the **Public Ledger**.

Here is the recommended API route structure to power this flow:

### 1. Drafts Module (Application State)

These routes handle Step 2 and Step 3. Because there are no user accounts, the `draftId` becomes the temporary token identifying the session.

| Method | Endpoint | Purpose | Request Body / Params |
| --- | --- | --- | --- |
| **POST** | `/api/v1/drafts/init` | Starts a new application or resumes an existing one. If the email has a pending draft, it returns that state. | `{ "email": "string" }` |
| **PATCH** | `/api/v1/drafts/:draftId` | Silently updates the application state as the user types (Old Name, New Name, Reason). | `{ "oldName": "...", "newName": "..." }` |
| **POST** | `/api/v1/drafts/:draftId/affidavit` | Handles the multipart file upload for the court affidavit image. | `FormData (file)` |
| **POST** | `/api/v1/drafts/:draftId/save-link` | Explicitly triggers the email with the temporary resume link if they click "Save for Later". | None |
| **DELETE** | `/api/v1/drafts/:draftId` | Allows the user to disregard an existing draft and start fresh, clearing the state. | None |

### 2. Payments & Checkout Module

These routes handle Step 4.

| Method | Endpoint | Purpose | Request Body / Params |
| --- | --- | --- | --- |
| **POST** | `/api/v1/payments/initialize` | Validates the completed draft and calls the Paystack API to generate the checkout URL for the ₦7,000 fee. | `{ "draftId": "string" }` |
| **GET** | `/api/v1/payments/verify/:reference` | A synchronous fallback to verify a payment via Paystack if the user successfully returns to the frontend. | Params: `reference` |

### 3. Webhooks Module

This is the most critical route for the "Network Dropped" edge case mentioned in the flow.

| Method | Endpoint | Purpose | Request Body / Params |
| --- | --- | --- | --- |
| **POST** | `/api/v1/webhooks/paystack` | Listens for the `charge.success` event from Paystack. This route automatically converts the Draft into a Published Notice, generates the PNN, and triggers the final email/SMS to the user. | Paystack Event Payload |

### 4. Notices Module (The Public Ledger)

These routes handle Step 5, allowing banks, NIMC, and the public to interact with the published data.

| Method | Endpoint | Purpose | Request Body / Params |
| --- | --- | --- | --- |
| **GET** | `/api/v1/notices/:pnn` | Fetches a specific public notice by its Public Notice Number (PNN) for instant verification by an official. | Params: `pnn` |
| **GET** | `/api/v1/notices` | Returns a paginated feed of the most recently published public notices for the public dashboard. | Query: `?page=1&limit=20` |
| **POST** | `/api/v1/notices/search` | Allows searching for a notice by Old Name or New Name. | `{ "query": "string" }` |

---

Would you like me to draft the NestJS Controller code or the Data Transfer Objects (DTOs) for the Drafts module to get the auto-saving logic started?