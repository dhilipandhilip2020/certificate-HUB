# Certificate Distribution System
### Mahendra Engineering College (Autonomous)
**Department of Electrical and Electronics Engineering (EEE)**

A complete, modern web application for generating, managing, uploading, and distributing event certificates to students. The system supports instant student access via **Mobile Number Verification** as well as an advanced **Administrator Console** for batch certificate generation and distribution.

---

## 🌟 Key Features

### 📱 1. Student Mobile Verification Portal (`/`)
- **Passwordless Mobile Login**: Students enter their registered mobile number (e.g., `6380161093`) to log in.
- **Instant Certificate Retrieval**: Upon mobile number verification, the next page automatically opens displaying student details, event info, and live certificate preview.
- **Direct PDF & Image Download**: Students can preview and download high-resolution certificates directly to their mobile or desktop devices.
- **Local & Cloud Storage**: Works with uploaded PDF/Image certificates as well as dynamically generated PDF certificates.

### 🛡️ 2. Administrator Management Console (`/_authenticated/*`)
- **Secure Admin Authentication**: Email/password authentication protecting management routes (`/dashboard`, `/students`, `/template`, `/generate`, `/distribution`, `/history`, `/settings`).
- **Upload Certificate by Mobile Number**: Allows administrators to directly upload pre-designed PDF or Image certificates and bind them to a specific student mobile number for instant student retrieval.
- **Excel Student Import**: Batch import participants from `.xlsx`/`.csv` files with column mapping, duplicate detection, and validation checks.
- **Visual Certificate Template Editor**: Configure font size, font family, color, position, alignment, and title rules (*Mr.* / *Mrs.* handling based on gender).
- **Automated PDF Generator**: Render individual student certificates with exact text positioning using `pdf-lib`.
- **Email Distribution System**: Bulk email certificates to students with audit history and status tracking.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 + TypeScript |
| **Routing** | `@tanstack/react-router` + `@tanstack/react-start` |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Shadcn UI Components |
| **State & Data** | `@tanstack/react-query` (React Query) |
| **PDF & Excel** | `pdf-lib`, `xlsx` |
| **Backend & Database** | Supabase (Authentication, PostgreSQL Database, Storage Buckets) |
| **Fallback Engine** | `mobile-cert-store` (Local Storage Persistence for instant verification) |
| **Build & Deploy** | Vite, Nitro, Cloudflare Workers preset |

---

## 📂 Project Architecture

```
certificate-creator-hub/
├── public/
│   └── certificates/           # Pre-seeded static certificate assets (e.g. 6380161093.jpeg)
├── src/
│   ├── components/
│   │   ├── AdminLayout.tsx     # Admin dashboard sidebar and navigation shell
│   │   └── ui/                 # Reusable UI component library (Buttons, Dialogs, Inputs, Tabs)
│   ├── integrations/
│   │   └── supabase/           # Supabase client configuration
│   ├── lib/
│   │   ├── cert-service.ts     # Certificate PDF generation and storage service
│   │   ├── mobile-cert-store.ts# Unified mobile lookup & local certificate upload engine
│   │   ├── pdf-certificate.ts  # PDF canvas overlay engine using pdf-lib
│   │   └── utils.ts            # Helper functions and class utilities
│   ├── routes/
│   │   ├── __root.tsx          # Root app wrapper & HTML head metadata
│   │   ├── index.tsx           # Student Mobile Login & Admin Login entrance
│   │   ├── download.tsx        # Student Certificate View & Download Portal
│   │   └── _authenticated/     # Protected Admin Routes
│   │       ├── dashboard.tsx   # Overview statistics
│   │       ├── students.tsx    # Student management & Upload Certificate by Mobile
│   │       ├── template.tsx    # Visual certificate template editor
│   │       ├── generate.tsx    # Batch PDF certificate generation
│   │       ├── distribution.tsx# Email dispatch manager
│   │       └── history.tsx     # Delivery logs & history
│   ├── router.tsx              # Router initialization
│   ├── server.ts              # TanStack Start server handler
│   └── styles.css              # Global styles and custom token utilities
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd certificate-creator-hub-main
npm install
```

### 3. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or displayed port).

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## 💡 How to Test the Application

### Student Mobile Verification Flow
1. Open the home page (`/`).
2. Select **Student Login**.
3. Enter the test registered mobile number: `6380161093`.
4. Click **Verify & Open Certificate**.
5. The next page will open, displaying the student details (*Dhilip - ELECTRO HUNT '26*) along with live certificate preview and **Download Certificate** options.

### Admin Certificate Upload Flow
1. Go to the home page (`/`), select **Admin Login**.
2. Sign in with your admin credentials.
3. In the sidebar, navigate to **Students**.
4. Click **Upload Certificate by Mobile**.
5. Enter a mobile number (e.g. `9876543210`), Student Name, Event Name, and upload a certificate file (PDF, PNG, or JPG).
6. Click **Save & Link to Mobile**.
7. Return to the Student Login page (`/`) and enter `9876543210` to view the newly uploaded certificate instantly!

---

## 📜 License
Developed for **Mahendra Engineering College (Autonomous)** - Department of Electrical and Electronics Engineering. All rights reserved.
