
```md
You are an expert full-stack engineer building a production-quality MVP for an early-stage startup.

Your task is to design and implement an **AI-assisted Claims Management Web Application** inspired by a fintech/legal claims workflow product.

You must implement the system **end-to-end**, following the specifications below exactly.  
Prioritize **clarity, correctness, pragmatism, and speed of delivery** over over-engineering.

---

## 1. TECH STACK (MANDATORY)

Use the following stack only:

- Next.js (latest stable version)
  - App Router
  - Server Actions + API Routes
- TypeScript (strict)
- Prisma ORM (i have already implemented)
- Neon PostgreSQL (relational DB) (i have already implemented)
- AWS S3 (document storage via signed URLs)
- Google Gemini AI (free tier)
- Zod (validation everywhere)
- Tailwind CSS + minimal UI components

---

## 2. HIGH-LEVEL SYSTEM ARCHITECTURE

Client (Next.js App Router)
- React UI
- Zod client-side validation
- Direct S3 uploads (signed URLs)

Server
- API Routes & Server Actions (TypeScript)
- Zod validation
- Business logic layer
- Gemini AI service
- Prisma ORM

Infrastructure
- Neon PostgreSQL → relational data
- AWS S3 → raw document storage
- Gemini AI → document understanding & reasoning

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Authentication
- Implement basic authentication (Clerk)(i have already implemented authentication)

---

### 3.2 Claim Management

#### Create Claim
Fields:
- clientName (required)
- vehicleReg (required)
- lenderName (optional)

Behavior:
- New claims start with status = `NEW`

#### View Claims
- List all claims for the logged-in user
- View detailed claim page

---

### 3.3 Claim Workflow Engine

Supported statuses:
- NEW
- REVIEW
- SUBMITTED
- APPROVED
- REJECTED

Rules:
- User can manually change status
- Every status change must be logged
- Status history is immutable (audit trail)

---

### 3.4 Document Management

Upload:
- PDF or image files only
- Files uploaded directly to AWS S3 using signed URLs

Storage:
- S3 stores raw files only
- PostgreSQL stores metadata only

S3 structure:
```

claims/{claimId}/{uuid}.{ext}

````

---

### 3.5 AI – Document Intelligence (Gemini)

Input:
- Extracted text from uploaded document

Output (structured JSON only):
- agreementNumber
- lenderName
- contractDate
- potentialIssues (array of strings)

Persistence:
- Save extracted data to:
  - Document.extractedData
  - Claim.aiExtractedData

---

### 3.6 AI – Claim Summary

Purpose:
- Provide a concise professional summary for case handlers

Output:
- 3–5 line summary text

Persistence:
- Save to Claim.aiSummary

---

### 3.7 AI – Eligibility Hint (Decision Support)

Logic:
1. Apply basic rule-based checks (e.g. missing data)
2. Ask Gemini to explain likely eligibility

Eligibility enum:
- LIKELY_VALID
- NEEDS_REVIEW
- LIKELY_INVALID

Important:
- This is not a legal decision, only a hint

---

### 3.8 Dashboard

Show:
- Total claims count
- Claims grouped by status
- Recently updated claims

---

## 4. NON-FUNCTIONAL REQUIREMENTS

- All API inputs must be validated with Zod
- AI failures must not crash the app
- Graceful fallbacks for Gemini errors
- Strict TypeScript typing everywhere
- Clean, readable, production-style code
- No over-engineering or unnecessary abstractions

---

## 5. DATABASE DESIGN (PRISMA)

Implement exactly the following schema:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  claims    Claim[]
  createdAt DateTime @default(now())
}

model Claim {
  id              String   @id @default(uuid())
  userId          String
  clientName      String
  vehicleReg      String
  lenderName      String?
  status          ClaimStatus @default(NEW)

  aiSummary       String?
  eligibility     Eligibility?
  aiExtractedData Json?

  documents       Document[]
  statusHistory   ClaimStatusHistory[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Document {
  id            String   @id @default(uuid())
  claimId       String
  fileName      String
  s3Key         String
  mimeType      String
  extractedData Json?
  createdAt     DateTime @default(now())
}

model ClaimStatusHistory {
  id        String   @id @default(uuid())
  claimId   String
  from      ClaimStatus?
  to        ClaimStatus
  changedAt DateTime @default(now())
}

enum ClaimStatus {
  NEW
  REVIEW
  SUBMITTED
  APPROVED
  REJECTED
}

enum Eligibility {
  LIKELY_VALID
  NEEDS_REVIEW
  LIKELY_INVALID
}
````

---

## 6. API ROUTES (TYPESCRIPT)

### Claims

* POST /api/claims
* GET /api/claims
* GET /api/claims/:id
* PATCH /api/claims/:id/status

### Documents

* POST /api/documents/upload-url
* POST /api/documents

### AI (Gemini)

* POST /api/ai/extract-document
* POST /api/ai/summarize-claim
* POST /api/ai/check-eligibility

All routes must:

* Use Zod validation
* Return typed responses
* Handle errors gracefully

---

## 7. GEMINI AI INTEGRATION

Create a centralized AI service:

```
/lib/ai/gemini.ts
```

Responsibilities:

* Initialize Gemini client
* Send prompts
* Enforce JSON-only output
* Parse responses safely
* Handle timeouts and retries

Prompt rules:

* Be explicit
* Short prompts
* Strict JSON output when extracting data

---

## 8. VALIDATION

Use Zod for:

* API routes
* Server actions
* Client forms

Validation errors must be user-friendly.

---

## 9. UI PAGES[app routers] (MINIMUM) 

* /login
* /dashboard
* /claims
* /claims/new
* /claims/[id]

Claim detail page must show:

* Claim info
* Status selector
* Uploaded documents
* AI extracted data
* AI summary
* Eligibility hint

---


