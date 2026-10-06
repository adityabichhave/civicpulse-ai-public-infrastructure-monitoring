# 🚦 CivicPulse AI

### AI-Powered Public Infrastructure Monitoring & Response Platform

> **Detect → Analyze → Prioritize → Dispatch → Repair → Resolve**

CivicPulse AI is a smart-city infrastructure monitoring platform that uses **multimodal AI, geospatial visualization, incident prioritization, and field-operations workflows** to help authorities identify public infrastructure problems and move them toward resolution.

Instead of treating infrastructure reporting as a simple complaint-management system, CivicPulse connects the complete operational lifecycle — from a citizen or field report to AI-assisted analysis, crew dispatch, field action, and resolution tracking.

---

## 🎯 Problem

Public infrastructure issues such as:

- 🕳️ Potholes and damaged roads
- 💡 Broken streetlights
- 🚧 Damaged road barriers
- 🗑️ Waste and sanitation problems
- 💧 Water leakage or drainage issues
- ⚠️ Unsafe public infrastructure
- 🏗️ Other municipal infrastructure defects

are often reported through disconnected channels.

This creates several problems:

- Issues may not be prioritized according to actual risk.
- Similar or duplicate complaints can consume operational resources.
- Field teams may not know which issue should be handled first.
- Location and severity information may be difficult to visualize.
- Authorities lack a single operational view of active infrastructure problems.
- Reporting an issue does not automatically translate into an efficient response.

---

## 💡 Our Solution

**CivicPulse AI** creates a unified intelligence layer between infrastructure reports and field operations.

A submitted report can be analyzed using AI to estimate:

- Infrastructure defect
- Category
- Severity
- Priority
- Risk score
- Hazard summary
- Recommended department
- Estimated SLA
- Required equipment
- Field technician checklist
- Environmental impact
- AI confidence

The result is an operational workflow rather than just a reporting form.

### Core Workflow

```text
Citizen / Field Report
        ↓
Image + Description + Location
        ↓
AI Infrastructure Analysis
        ↓
Severity + Risk + Priority
        ↓
Incident Management
        ↓
AI-Assisted Dispatch
        ↓
Field Technician
        ↓
Repair / Field Notes
        ↓
Resolution
        ↓
Analytics & Insights
```

---

# ✨ Key Features

## 🤖 1. Multimodal AI Inspection

CivicPulse can analyze an infrastructure report using an image and/or textual description.

The AI inspection can return structured information including:

| AI Output | Purpose |
|---|---|
| Defect Name | Identifies the detected infrastructure problem |
| Category | Classifies the issue |
| Severity | Rates the seriousness on a 1–5 scale |
| Priority | Determines operational urgency |
| Risk Score | Estimates risk from 0–100 |
| Hazard Summary | Explains the potential danger |
| Department | Suggests the responsible department |
| SLA | Estimates response time |
| Equipment | Suggests required field equipment |
| Technician Checklist | Provides field-action guidance |
| Environmental Impact | Estimates environmental implications |
| Confidence | Indicates AI confidence in the assessment |

The Gemini integration is performed **server-side**, keeping the API key out of the frontend.

---

## 🗺️ 2. Interactive Infrastructure Map

CivicPulse provides a geospatial view of reported incidents.

The map can be used to understand:

- Incident locations
- Active infrastructure problems
- Severity distribution
- Geographic concentration
- Operational areas
- Crew activity

This creates a single spatial view of infrastructure health.

---

## 🚨 3. Severity & Risk-Based Prioritization

Not every infrastructure issue has the same urgency.

CivicPulse evaluates incidents using severity and risk information so that critical hazards can receive greater attention.

Example:

```text
Low-risk cosmetic issue
        ↓
Normal priority

Damaged road with moderate public impact
        ↓
High priority

Major road hazard near high-traffic area
        ↓
Critical priority
```

This helps shift infrastructure management from **first-come-first-served reporting** toward **risk-aware prioritization**.

---

## 🚚 4. AI-Assisted Crew Dispatch

CivicPulse includes an AI-assisted dispatch workflow for assigning infrastructure incidents to field teams.

The dispatch workflow considers incident information and operational constraints to generate a recommended response plan.

The system is designed to help answer:

- Which incidents should be handled first?
- Which crew should respond?
- What equipment may be required?
- Which operational area should be targeted?
- How can field workload be distributed?

---

## 👷 5. Field Technician Console

Field technicians receive a dedicated operational view.

The workflow supports:

```text
Assigned
   ↓
Dispatched
   ↓
In Progress
   ↓
Field Checklist
   ↓
Field Notes
   ↓
Resolved
```

This gives field teams actionable information instead of only showing a complaint description.

---

## 🔄 6. Incident Lifecycle Management

CivicPulse models infrastructure issues through a complete lifecycle:

```text
Reported
   ↓
Triaged
   ↓
Dispatched
   ↓
In Progress
   ↓
Resolved
```

This allows administrators to understand where an issue currently stands and where operational attention is required.

---

## 📊 7. Infrastructure Analytics

The analytics dashboard provides an operational overview of infrastructure incidents.

It can surface metrics such as:

- Active incidents
- Critical hazards
- Resolution trends
- Infrastructure distribution
- Crew workload

The goal is to turn individual incident reports into **city-level operational intelligence**.

---

## 🔔 8. Notifications

CivicPulse includes notification functionality for important operational events.

The application also supports notification/audio feedback to make important state changes more visible during demonstrations and field workflows.

---

## 📱 9. Offline-Friendly Field Workflow

Field operations can occur in environments with unreliable connectivity.

CivicPulse includes an offline-sync utility to support field workflows where network availability may be limited.

The intended workflow is:

```text
Field Action
    ↓
Local / Offline State
    ↓
Connectivity Available
    ↓
Synchronization
```

---

## 🧠 10. AI Fallback

The system is designed with a fallback mechanism.

If the Gemini API is unavailable or not configured, CivicPulse can use a structured heuristic analyzer instead of completely stopping the infrastructure-analysis workflow.

This makes the project easier to demonstrate and more resilient during development.

---

# 🏗️ System Architecture

```text
                         CIVICPULSE AI
                              │
              ┌───────────────┴───────────────┐
              │                               │
        Citizen / Field                Administrator
           Report                          Dashboard
              │                               │
              └───────────────┬───────────────┘
                              ↓
                    Incident Management
                              │
              ┌───────────────┴───────────────┐
              │                               │
       Image + Description              Location Data
              │                               │
              ↓                               ↓
        Gemini AI Layer              Geospatial Layer
              │                               │
              └───────────────┬───────────────┘
                              ↓
                  Risk / Severity / Priority
                              │
                              ↓
                    Dispatch Optimization
                              │
                              ↓
                    Field Technician
                              │
                              ↓
                    Repair / Field Notes
                              │
                              ↓
                         Resolution
                              │
                              ↓
                    Analytics & Insights
```

---

# 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Flow
- CSS
- Lucide React
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- `tsx`
- dotenv

### Artificial Intelligence

- Google Gemini API
- `@google/genai`
- Multimodal image + text analysis
- Structured JSON AI responses
- Heuristic fallback analysis

### Mapping & Visualization

- Interactive GIS-style map interface
- React-based visualization components
- Geospatial incident representation

### Development Tools

- Git
- GitHub
- npm
- Vite

---

# 📁 Project Structure

```text
civicpulse-ai-public-infrastructure-monitoring/
│
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
│
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    │
    ├── components/
    │   ├── AnalyticsView.tsx
    │   ├── DispatchOptimizerModal.tsx
    │   ├── FieldTechnicianView.tsx
    │   ├── Header.tsx
    │   ├── IncidentDetailDrawer.tsx
    │   ├── IncidentListView.tsx
    │   ├── InteractiveMap.tsx
    │   ├── NotificationCenter.tsx
    │   ├── NotificationToast.tsx
    │   └── ReportIssueModal.tsx
    │
    ├── data/
    │   └── mockIncidents.ts
    │
    ├── types/
    │   └── infrastructure.ts
    │
    └── utils/
        ├── audioChime.ts
        └── offlineSync.ts
```

---

# 🔐 Environment Variables

Create a local `.env` file in the project root.

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### Important

Never commit your real `.env` file or API key to GitHub.

The repository is configured so that `.env` files are ignored while `.env.example` remains available as a safe configuration template.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/adityabichhave/civicpulse-ai-public-infrastructure-monitoring.git
```

```bash
cd civicpulse-ai-public-infrastructure-monitoring
```

## 2. Install dependencies

```bash
npm install
```

If npm reports a peer-dependency conflict during installation, use:

```bash
npm install --legacy-peer-deps
```

## 3. Configure environment variables

Create `.env`:

```bash
cp .env.example .env
```

Then add your Gemini API key:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

## 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# ❤️ Health Check

CivicPulse exposes a health endpoint:

```text
GET /api/health
```

Open:

```text
http://localhost:3000/api/health
```

The endpoint reports server status and whether the Gemini API key is configured.

Example:

```json
{
  "ok": true,
  "geminiConfigured": true
}
```

---

# 🤖 AI API

## Analyze Infrastructure Issue

```text
POST /api/analyze-issue
```

The endpoint accepts information such as:

- Image
- Image MIME type
- Description
- Location name
- Latitude
- Longitude
- Category hint

The AI returns structured infrastructure-analysis information.

Conceptually:

```json
{
  "defectName": "Road Pothole",
  "category": "Road",
  "severity": 4,
  "priority": "High",
  "riskScore": 82,
  "hazardSummary": "Potential vehicle and pedestrian hazard",
  "recommendedDepartment": "Road Maintenance",
  "estimatedSlaHours": 24,
  "requiredEquipment": [],
  "fieldTechnicianChecklist": [],
  "environmentalImpact": "Low",
  "confidence": 0.91
}
```

---

# 🚚 AI Dispatch Optimization

```text
POST /api/optimize-dispatch
```

The dispatch endpoint accepts incident information and operational constraints such as:

- Active incidents
- Crew count
- Target sector

The system can generate an AI-assisted dispatch plan.

If AI is unavailable, the application can fall back to structured logic.

---

# 🔁 Incident Lifecycle

CivicPulse follows a complete infrastructure-management lifecycle:

### 1. Report

A citizen or field operator submits an infrastructure issue.

### 2. Analyze

The system analyzes the submitted information using AI.

### 3. Prioritize

The issue receives severity, risk, and priority information.

### 4. Dispatch

The incident is assigned to an appropriate field workflow.

### 5. Repair

The field technician investigates and performs the required action.

### 6. Resolve

The issue is marked as resolved and becomes part of the operational history.

```text
REPORT
  ↓
ANALYZE
  ↓
PRIORITIZE
  ↓
DISPATCH
  ↓
REPAIR
  ↓
RESOLVE
```

---

# 🎬 Suggested Demo Flow

For a hackathon or project presentation, use this sequence:

### Step 1 — Dashboard

Start from the CivicPulse command dashboard.

Show:

- Active incidents
- Critical issues
- Map
- Analytics
- Current operational state

### Step 2 — Report an Issue

Submit an infrastructure issue with:

- Photo
- Description
- Location
- Category

### Step 3 — AI Analysis

Run AI analysis and show:

- Detected defect
- Severity
- Risk score
- Priority
- Department
- SLA
- Equipment
- Technician checklist

### Step 4 — Incident Management

Open the incident and demonstrate its lifecycle.

```text
Reported → Triaged → Dispatched → In Progress → Resolved
```

### Step 5 — Dispatch

Open the dispatch optimizer and generate a crew response plan.

### Step 6 — Field Technician

Switch to the field technician view.

Show:

- Assigned work
- Checklist
- Field notes
- Progress

### Step 7 — Analytics

Finish with analytics showing:

- Active incidents
- Critical hazards
- Resolution trends
- Infrastructure distribution
- Crew workload

### Final Message

> **CivicPulse doesn't just detect infrastructure problems — it helps turn detection into action.**

---

# 🌍 Supported Infrastructure Domains

CivicPulse is designed to support a wide range of public infrastructure monitoring use cases:

- 🛣️ Roads
- 🕳️ Potholes
- 💡 Streetlights
- 🚧 Road barriers
- 💧 Water & drainage
- 🗑️ Waste management
- 🏗️ Public construction
- ⚠️ Public safety hazards
- 🏙️ Municipal infrastructure

The architecture can be extended to additional infrastructure categories.

---

# 📈 Why CivicPulse?

Traditional reporting systems often answer:

> **"What problem was reported?"**

CivicPulse aims to answer a larger operational question:

> **"What is the problem, how dangerous is it, where is it, who should handle it, what do they need, and what happens next?"**

### Traditional Approach

```text
Complaint
   ↓
Manual Review
   ↓
Manual Assignment
   ↓
Field Visit
   ↓
Resolution
```

### CivicPulse Approach

```text
Report
   ↓
AI Analysis
   ↓
Risk Assessment
   ↓
Priority
   ↓
AI-Assisted Dispatch
   ↓
Field Technician
   ↓
Resolution
   ↓
Analytics
```

---

# 🔮 Future Scope

Potential future extensions include:

- 📡 Real-time municipal IoT integration
- 📹 CCTV-based infrastructure monitoring
- 🚗 Vehicle-mounted road inspection
- 📐 Computer-vision damage measurement
- 🔁 Automatic duplicate-report detection
- 🔮 Predictive infrastructure failure detection
- 📚 Historical maintenance intelligence
- 🏙️ Ward-level infrastructure health scores
- 📱 SMS / WhatsApp citizen notifications
- 🏢 Integration with municipal work-order systems
- 🗺️ Advanced geospatial clustering
- 📏 Computer-vision pothole dimension estimation
- 📅 Predictive maintenance scheduling

---

# 🔒 Security Considerations

- Gemini API credentials are kept on the server side.
- Environment files containing secrets are excluded from Git.
- `.env.example` is provided as a safe configuration template.
- API integrations should use environment variables rather than hard-coded credentials.

For production deployment, additional controls should be added, including:

- Authentication and authorization
- Rate limiting
- Input validation
- Secure file/image handling
- Audit logging
- HTTPS
- Database security
- Role-based access control
- Production secret management

---

# 🧪 Development Notes

CivicPulse is currently structured as a hackathon/project prototype.

The application includes mock incident data for demonstrating the dashboard and operational workflows.

The AI layer supports a fallback heuristic analyzer so that the core demo can continue even when Gemini is not configured or an AI request fails.

---

# 🏆 Hackathon Value Proposition

### CivicPulse AI combines:

**Artificial Intelligence**

+ **Computer Vision**

+ **Geospatial Intelligence**

+ **Risk-Based Prioritization**

+ **Dispatch Optimization**

+ **Field Operations**

+ **Infrastructure Analytics**

into one unified platform.

### One platform. One operational view. One complete lifecycle.

---

# 👥 Team

**Project:** CivicPulse AI  
**Domain:** Artificial Intelligence + Smart Cities + Public Infrastructure  
**Type:** Hackathon Project

---

# 📄 License

This project is intended for **educational, research, demonstration, and hackathon purposes**.

---

# ⭐ Support

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 🚦 CivicPulse AI

> **From infrastructure detection to intelligent action.**
