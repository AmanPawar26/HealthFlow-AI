# 🩺 HealthFlow AI  
**AI Copilot for Doctors – Voice to Structured Prescriptions**

---

##  Problem

Healthcare consultations are slowed by **fragmented and manual records**.

- **Patients** struggle to manage physical reports and recall past history  
- **Doctors** waste time reviewing scattered records and writing prescriptions manually  
- **Hospitals** face duplicate tests, documentation errors, and poor data visibility  

Doctors spend valuable consultation time on **documentation**, not decision-making.

---

##  Solution – HealthFlow AI

**HealthFlow AI** is an AI-powered clinical copilot that helps doctors:

-  Speak naturally during consultation  
-  Instantly convert voice → structured digital prescription  
-  Generate professional prescription PDFs  
-  Share prescriptions with patients digitally  
-  View patient history during consultation  

We reduce documentation burden so doctors can focus on **clinical care, not paperwork**.

---

## How It Works (MVP Flow)

1. **Patient Registration**  
   Basic details captured: Name, Age, Gender, Email, Phone, Allergies

2. **Voice Prescription Input**  
   Doctor speaks naturally using **Whisper Flow** voice typing

3. **AI Structuring**  
   AI extracts:
   - Diagnosis  
   - Medications (drug, dose, frequency, duration)  
   - Advice  
   - Follow-up instructions  

4. **Prescription Generation**  
   System formats a clean, professional digital prescription

5. **Patient Notification**  
   Prescription can be saved, printed, or shared digitally

---

##  Technology Stack

HealthFlow AI is designed to be **lightweight, fast, and deployable without heavy hospital IT setup**.

###  Core Frontend Architecture

- **React 19** – Modern component-based UI with efficient rendering  
- **TypeScript** – Strict type safety for patient data and prescription schemas  
- **ES Modules (ESM)** – Dependencies loaded via `esm.sh` for a build-less browser-based workflow  

---

###  AI & Intelligence

- **Google Gemini API (gemini-3-flash-preview)**  
  - Clinical extraction from voice transcripts into structured JSON  
  - Medical summarization of past visits  
  - Reasoning for formatting prescriptions and follow-up advice  

The AI acts as a **clinical documentation assistant**, not a decision-maker.

---

###  UI/UX & Design

- **Tailwind CSS** – Professional “Clinical Blue” theme and responsive layouts  
- **Lucide React** – Medical and workflow icons (Stethoscope, Mic, ShieldCheck, etc.)  
- **Inter Font Family** – High legibility for medical environments  

---

###  Data & Infrastructure

- **Web Storage API (LocalStorage)**  
  Stores patient history and UPID records locally on the doctor’s device (no heavy backend required for MVP)

- **Native Browser Print Engine**  
  Generates professional medical PDFs directly from the app

---

###  Standard Web APIs Used

- `fetch` with retry/backoff for reliable AI communication  
- `navigator.clipboard` for fast text handling  
- Standard DOM events for smooth integration with external voice tools  

---

### 🎙 Workflow Integration

- **Whisper Flow (External Voice Tool)**  
  The app uses standard HTML `<textarea>` elements so doctors can use system-level voice typing (Ctrl + Win) to dictate prescriptions directly into the app.

---

##  Key Features in MVP

-  Voice → Structured Prescription  
-  Patient history display  
-  Professional prescription PDF generation  
-  Works without hospital backend integration  
-  End-to-end working demo  

---

##  Future Scope

- Drug interaction and allergy alerts  
- Lab & radiology report integration  
- Multi-doctor access and analytics dashboard  

---

##  Product Demo

 **Demo Link:** _[https://score-arc-32835846.figma.site/]  

---

##  Who It’s For

- OPD-heavy hospitals  
- Clinics with high patient load  
- Doctors facing documentation burnout  

---

##  Business Model (Planned)

**B2B SaaS for hospitals and clinics**  
₹50,000 – ₹2,00,000 per month per hospital (based on size)

---

##  Vision

To build an **AI assistant layer for clinical workflows** that reduces doctor burnout and makes healthcare documentation effortless.
