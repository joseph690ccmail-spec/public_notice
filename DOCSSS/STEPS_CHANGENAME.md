Step-by-step user journey, completely redesigned to reflect the frictionless, guest-first experience:

1. **Get an Affidavit:** Prerequisite done at any Nigerian High Court.
The user goes to a physical court to swear a Change of Name affidavit. This remains the legal foundation of the process.


2. **Start the Application:** No login or password required.
The user visits the website and clicks "Publish Name Change" to jump straight into the form. They enter their **Email** first—this automatically saves their progress and texts them a temporary link to resume later if their internet drops, or something happens. (there should be check here to find out if there was a process that had begun before then resume, but still provide option to disregard and start afresh (with warning)). The system should save their progress silently in the background (using browser localStorage or a silent API call). The only time the system should actively send them an email before payment is if they explicitly click a "Save for Later" button, or if they reach the payment page and abandon it.


3. **Fill Details & Upload:** Input details and attach the legal proof.
The user enters their **Old Name**, **New Name**, and the **Reason** for the change (e.g., Marriage). They then upload a clear picture of their court affidavit and upload it.


4. **Pay the Fee:** Instant online checkout.
The user reviews their application to ensure no spelling errors, then pays the standard publication fee securely via a local payment gateway (Paystack, 7000 naira).


5. **Done & Published:** Permanent digital certificate generated.
The system instantly publishes the notice to the public database. The user receives their permanent **Public Notice Number (PNN)** and digital certificate via email and SMS. They can now give this PNN to any bank or NIMC official to instantly verify their name change online.