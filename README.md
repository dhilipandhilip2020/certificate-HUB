# Certificate Creator Hub

Build a complete modern web application called "Certificate Distribution System".

IMPORTANT:
This is an admin-only system used by a college/event coordinator to generate and distribute participation/achievement certificates to students by email.

The application should be simple enough for a non-technical user to operate.

==================================================
1. TECHNOLOGY
==================================================

Use:
- React
- TypeScript
- Tailwind CSS
- Supabase for database, authentication, storage and backend functionality
- Supabase Edge Functions for secure certificate generation/email operations
- Use a secure email service such as Resend for sending emails
- Never expose API keys or email credentials in frontend code.

Create a clean, responsive interface that works on desktop and mobile.

==================================================
2. ADMIN LOGIN
==================================================

Create an Admin Login page.

Fields:
- Email
- Password
- Login button

Only authenticated administrators should access the dashboard.

Include:
- Logout
- Protected dashboard routes
- Session handling

==================================================
3. ADMIN DASHBOARD
==================================================

Create a professional dashboard with:

Cards:
- Total Students
- Certificates Generated
- Emails Sent
- Emails Failed

Navigation/sidebar:

Dashboard
Students
Certificate Template
Generate Certificates
Email Distribution
Email History
Settings
Logout

Use a professional blue/white/gray academic/college-style design.

==================================================
4. STUDENT DATA / EXCEL UPLOAD
==================================================

Create a Students page.

Allow the admin to upload an Excel (.xlsx) file.

Expected columns:

Name
Email
Gender
Department
Class
Event
Certificate Type

Example:

Name: Kavin B
Email: kavin@gmail.com
Gender: Male
Department: EEE
Class: EEE A
Event: Electro Hunt 2026
Certificate Type: Participation

After uploading Excel:

1. Read the Excel file.
2. Display the imported students in a table.
3. Show validation errors.
4. Detect duplicate email addresses.
5. Allow the admin to remove/edit a student.
6. Allow filtering by Department/Class/Event.
7. Allow searching by student name or email.

Important:
Do not send any emails immediately after Excel upload.

The admin must explicitly click "Generate Certificates" and later "Send Certificates".

==================================================
5. CERTIFICATE TEMPLATE
==================================================

Create a Certificate Template page.

Allow admin to upload:
- PNG
- JPG/JPEG
- PDF if supported

The certificate should be used as the background/template.

Create a visual certificate editor/preview.

The admin should be able to configure:

Student name:
- X position
- Y position
- Font
- Font size
- Bold
- Alignment
- Letter spacing if possible

Also provide a preview using a sample student name.

The certificate should preserve the original template design.

==================================================
6. MR / MRS HANDLING
==================================================

The certificate template may contain:

"Mr.    Mrs."

before the student's name.

Use the Gender column from Excel.

If Gender = Male:
- Keep "Mr."
- Strike through "Mrs."

If Gender = Female:
- Strike through "Mr."
- Keep "Mrs."

The strike-through must appear directly on the title only.

Do NOT put a strike-through under or through the student's name.

Provide a preview so the administrator can verify this before generating certificates.

==================================================
7. CERTIFICATE GENERATION
==================================================

Create a Generate Certificates page.

Show all imported students in a table.

Columns:

Student Name
Email
Gender
Department
Class
Certificate Status
Actions

Allow:
- Select individual students
- Select all
- Filter by class/department
- Generate selected
- Generate all

Generate an individual certificate for every selected student.

The student's name should be placed at the exact configured position on the certificate.

Output should preferably be PDF.

Filename format:

Certificate_Student_Name.pdf

Example:

Certificate_Kavin_B.pdf

Do not overwrite certificates incorrectly when two students have similar names.

Use a unique certificate ID internally.

==================================================
8. PREVIEW
==================================================

Before generating all certificates, show a preview.

Example:

Student:
Kavin B

Gender:
Male

Email:
kavin@gmail.com

Certificate Preview:
[show actual generated certificate]

Buttons:

Previous
Next
Generate This Certificate
Generate All

==================================================
9. EMAIL DISTRIBUTION
==================================================

Create an Email Distribution page.

Allow the admin to configure:

From Name:
Certificate Distribution Team

Email Subject:
Certificate of Participation – Electro Hunt 2026

Email body:

Dear {{student_name}},

Congratulations!

Please find attached your certificate for participating in {{event_name}}.

Thank you for your participation.

Regards,
Certificate Distribution Team

Support variables:

{{student_name}}
{{event_name}}
{{department}}
{{class}}
{{certificate_id}}

Attach the student's generated PDF certificate.

Use a secure backend email service such as Resend through a Supabase Edge Function.

Never expose the Resend API key in frontend code.

==================================================
10. BULK EMAIL SENDING
==================================================

Create:

"Send All Certificates"

and

"Send Selected Certificates"

buttons.

Before sending, show a confirmation:

"You are about to send certificates to 125 students. Continue?"

After confirmation:

- Send emails individually.
- Do not send duplicate emails accidentally.
- Track each email.
- Show progress.
- Show successful count.
- Show failed count.

Example:

Sending Certificates...

[████████████░░░░] 75%

75 / 100 sent

==================================================
11. EMAIL STATUS
==================================================

Create an Email History page.

Table:

Student Name
Email
Certificate
Sent Date
Status
Attempts
Action

Status:

Pending
Generated
Sent
Failed

For failed emails provide:

"Retry"

button.

Do not regenerate the certificate unnecessarily when retrying an email.

==================================================
12. CERTIFICATE HISTORY
==================================================

Store:

Student name
Email
Certificate ID
Certificate file path
Generated date
Email status
Email sent date
Event
Department
Class

Allow the admin to search and filter the history.

==================================================
13. DATABASE
==================================================

Create appropriate Supabase tables.

Suggested tables:

profiles
students
events
certificate_templates
certificates
email_logs

Use relationships between tables.

Add Row Level Security so only authenticated admins can access administrative data.

==================================================
14. FILE STORAGE
==================================================

Use Supabase Storage.

Create appropriate storage locations/buckets for:

- Certificate templates
- Generated certificates

Do not expose private files publicly unnecessarily.

Use secure access/download URLs where appropriate.

==================================================
15. USER INTERFACE
==================================================

Design should look professional and suitable for a college administration system.

Style:

- Modern
- Clean
- Professional
- White background
- Blue primary color
- Subtle shadows
- Rounded cards
- Clear buttons
- Good typography
- Responsive layout

Dashboard should look polished, not like a basic HTML form.

Use icons where appropriate.

==================================================
16. IMPORTANT SAFETY / ERROR HANDLING
==================================================

Validate:

- Missing student name
- Invalid email
- Missing gender
- Duplicate email
- Unsupported certificate file
- Missing certificate template
- Missing student name position
- Failed certificate generation
- Failed email sending

Show clear error messages.

Never send an email if the email address is invalid.

Never expose API keys, passwords, service-role keys or secrets in client-side code.

==================================================
17. WORKFLOW
==================================================

The complete workflow should be:

Admin Login
      ↓
Dashboard
      ↓
Upload Excel
      ↓
Review Students
      ↓
Upload Certificate Template
      ↓
Configure Name Position
      ↓
Configure Mr/Mrs
      ↓
Preview Certificate
      ↓
Generate Certificates
      ↓
Review Generated Certificates
      ↓
Compose Email
      ↓
Send Selected / Send All
      ↓
Track Email Status
      ↓
Retry Failed Emails

==================================================
18. SAMPLE DATA
==================================================

Initially create sample students so the interface can be tested:

Kavin B
kavin@example.com
Male
EEE
EEE A

Nandha Gopal A
nandha@example.com
Male
EEE
EEE A

Priya S
priya@example.com
Female
EEE
EEE A

Do not actually send emails to these sample addresses.

==================================================
19. VERY IMPORTANT
==================================================

First build the complete UI and database structure.

Make the application functional rather than just creating static screens.

If any functionality requires an external API key, create the required environment variable/secret configuration and clearly identify where the administrator must add it.

Do not hard-code API keys.

Make the certificate generation and email functionality modular so it can be tested safely before bulk sending.

Also include a "Test Email" function that sends only to the administrator's configured test email before bulk distribution.

Build the project cleanly with reusable components and clear error handling.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee800545-3f10-4c9d-b311-2df85814bd8d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
