# CivicPulse AI

### AI-Powered Public Infrastructure Monitoring & Municipal Operations Platform

> **See. Prioritize. Dispatch. Resolve.**

CivicPulse is an AI-powered municipal infrastructure monitoring platform designed to help public works teams detect, classify, prioritize, and respond to infrastructure defects faster.

The platform combines **multimodal AI inspection, operational dashboards, GIS visualization, crew dispatch optimization, field workflows, notifications, and offline synchronization** into a single municipal operations interface.

---

## 🚧 Problem

Public infrastructure issues such as:

- Potholes
- Damaged roads
- Flooded or blocked drainage
- Broken streetlights
- Structural damage
- Damaged sidewalks
- Water infrastructure failures

are often reported late, manually classified, or prioritized without enough contextual information.

This can lead to:

- Delayed maintenance
- Increased public safety risks
- Poor crew allocation
- Repeated complaints
- Inefficient field operations
- Lack of real-time visibility for municipal authorities

CivicPulse addresses this by turning field observations into structured, actionable infrastructure intelligence.

---

# 💡 Solution

CivicPulse creates an operational pipeline:

```text
Citizen / Field Report
        ↓
Photo + Description + Location
        ↓
AI Infrastructure Inspection
        ↓
Defect Classification
        ↓
Severity & Risk Assessment
        ↓
Department Recommendation
        ↓
Priority & SLA
        ↓
Municipal Dispatch
        ↓
Field Technician
        ↓
Resolution

The goal is not simply to detect infrastructure defects, but to help municipal teams decide what needs attention, how urgently it should be handled, and which crew should respond.
✨ Key Features
🤖 AI Infrastructure Inspection
CivicPulse uses Google's Gemini API through the server-side @google/genai SDK.
The /api/analyze-issue endpoint accepts:
- Infrastructure images
- Citizen/field descriptions
- Location information
- Coordinates
- Category hints
The uploaded image is passed to Gemini as image data for multimodal analysis.    Pasted markdown    Pasted markdown
The AI produces structured information including:
- Engineering defect name
- Infrastructure category
- Severity
- Priority
- Public safety risk score
- Hazard summary
- Recommended municipal department
- Estimated resolution SLA
- Required equipment/materials
- Field technician checklist
- Environmental impact
- Confidence score
🧠 AI-Powered Dispatch Optimization
CivicPulse also provides an AI dispatch workflow.
The /api/optimize-dispatch endpoint evaluates active incidents using information such as:
- Incident severity
- Priority
- Infrastructure category
- Location
- Coordinates
- Current status
- Number of available crews
- Target municipal sector
Gemini generates a structured dispatch plan containing:
- Dispatch strategy
- Crew assignments
- Incident sequences
- Estimated work hours
- Route summaries
- Urgent SLA alerts
This allows the system to move beyond detection and assist with operational decision-making.    Pasted markdown
🗺️ Interactive GIS Operations Map
The CivicPulse command center provides an interactive infrastructure map for monitoring incidents and municipal operations.
The map interface supports visualization of:
- Infrastructure incidents
- Street networks
- Municipal sectors
- Hazard areas
- Active field crews
- Critical infrastructure alerts
Reports can also be positioned using an interactive map-based location picker.
🚨 Priority & Severity Management
Each infrastructure defect can be evaluated according to:
Severity
L1 — Minor
L2 — Low
L3 — Moderate
L4 — Urgent
L5 — Critical

Priority
Critical
High
Medium
Low

The system also produces a public safety risk score between 0 and 100.
👷 Field Technician Console
CivicPulse includes a field-oriented technician workflow designed for use in:
- Field vehicles
- Mobile devices
- Outdoor environments
- Gloved operation
Technicians can:
- View assigned incidents
- Start work
- Follow repair checklists
- Add field notes
- Update work status
- Record progress
- Complete assigned tasks
📡 Offline Synchronization
Field operations may occur in areas with unreliable connectivity.
CivicPulse includes an offline synchronization layer that can queue:
- Status updates
- New reports
- Checklist changes
- Field notes
When connectivity is restored, queued changes can be synchronized with the central application.
A connection-loss simulation mode is also available for demonstrations.
🔔 Notifications
CivicPulse provides operational notifications for important infrastructure events.
The interface includes:
- Floating alert notifications
- Notification center
- Unread counters
- Quick actions
- Web Audio notification chimes
This allows operators to quickly identify urgent infrastructure events.
📊 Analytics & Operations Dashboard
The command center provides operational analytics including:
- Active incidents
- Critical hazards
- Crew engagement
- Infrastructure category distribution
- Intake vs. resolution trends
- Mean Time to Resolution
- Municipal sector performance
- Infrastructure workload distribution
These views help authorities understand both current workload and operational trends.
🏗️ Supported Infrastructure Domains
CivicPulse currently supports infrastructure classifications including:
- Roadways
- Drainage
- Lighting
- Bridges & Structures
- Sidewalks
- Water Mains
- Traffic Signals
The AI inspection service maps reported defects into these municipal infrastructure categories.    Pasted markdown
🔄 Operational Lifecycle
Every issue follows a structured lifecycle:
REPORTED
    ↓
TRIAGED
    ↓
DISPATCHED
    ↓
IN PROGRESS
    ↓
RESOLVED

This gives municipal operators a clear view of where every infrastructure issue stands.
🧩 AI Fallback System
CivicPulse is designed to remain usable even when the Gemini API is unavailable.
If the Gemini API key is not configured, the server uses an internal heuristic inspection engine.
If a Gemini request fails, the server also returns a fallback analysis rather than blocking the reporting workflow.    Pasted markdown    Pasted markdown
This is particularly useful for:
- Local development
- Offline demonstrations
- API outages
- Hackathon environments with limited API availability
🏛️ System Architecture
┌──────────────────────────────────────────┐
│              CIVICPULSE UI               │
│                                          │
│ Dashboard │ Map │ Reports │ Analytics    │
│ Dispatch  │ Field Console │ Notifications│
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│          EXPRESS / VITE SERVER           │
│                                          │
│ /api/health                              │
│ /api/analyze-issue                       │
│ /api/optimize-dispatch                   │
└───────────────┬───────────────┬──────────┘
                │               │
                ▼               ▼
       ┌────────────────┐  ┌──────────────┐
       │  Gemini API    │  │  Heuristic   │
       │                │  │  Fallback    │
       │ Multimodal AI  │  │              │
       └────────────────┘  └──────────────┘
                │
                ▼
       Structured AI Results
                │
                ▼
       Municipal Operations

🛠️ Technology Stack
Frontend
- React
- TypeScript
- Vite
- CSS
- Interactive map components
- Recharts / data visualization
- Web Audio API
Backend
- Node.js
- Express
- TypeScript
- Vite middleware
Artificial Intelligence
- Google Gemini API
- @google/genai
- Multimodal image analysis
- Structured JSON generation
- AI dispatch optimization
- Heuristic fallback engine
Storage / Client Operations
- Browser local storage
- Offline synchronization layer
- Client-side application state
🔐 Environment Variables
Create a .env file in the project root.
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"

You can obtain a Gemini API key from Google AI Studio.
Security
Never commit your .env file to GitHub.
The repository intentionally includes:
.env.example

but excludes:
.env

The Gemini API key is accessed only by the server through:
process.env.GEMINI_API_KEY

🚀 Getting Started
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/civicpulse-ai-public-infrastructure-monitoring.git

Move into the project:
cd civicpulse-ai-public-infrastructure-monitoring

2. Install dependencies
npm install

3. Configure environment variables
Create .env:
cp .env.example .env

Then add your Gemini API key:
GEMINI_API_KEY="your_actual_api_key"
APP_URL="http://localhost:3000"

4. Start the development server
npm run dev

The application will be available at:
http://localhost:3000

🩺 Health Check
CivicPulse exposes a health endpoint:
GET /api/health

Open:
http://localhost:3000/api/health

The endpoint reports service status and whether a Gemini API key is configured.    Pasted markdown
🤖 AI API Endpoints
Infrastructure Analysis
POST /api/analyze-issue

Accepts:
imageBase64
imageMimeType
description
locationName
latitude
longitude
categoryHint

Returns structured infrastructure analysis.
AI Dispatch Optimization
POST /api/optimize-dispatch

Accepts:
incidents
crewCount
targetSector

Returns an AI-generated dispatch plan.
📁 Project Structure
civicpulse-ai-public-infrastructure-monitoring/
│
├── src/
│   ├── components/
│   │   ├── AnalyticsView.tsx
│   │   ├── DispatchOptimizerModal.tsx
│   │   ├── FieldTechnicianView.tsx
│   │   ├── Header.tsx
│   │   ├── IncidentDetailDrawer.tsx
│   │   ├── IncidentListView.tsx
│   │   ├── InteractiveMap.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationToast.tsx
│   │   └── ReportIssueModal.tsx
│   │
│   ├── data/
│   │   └── mockIncidents.ts
│   │
│   ├── types/
│   │   └── infrastructure.ts
│   │
│   ├── utils/
│   │   ├── audioChime.ts
│   │   └── offlineSync.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── server.ts
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── .env.example
├── .gitignore
└── README.md

🎬 Recommended Hackathon Demo Flow
The strongest demonstration flow is:
1. Report an infrastructure issue
Open the Report Issue interface.
Upload a pothole / damaged road image.
2. AI Inspection
CivicPulse sends the image and report information to the server.
The server sends the image to Gemini for infrastructure analysis.
Show:
Defect
Pothole

Category
Roadways

Severity
L4

Priority
HIGH

Risk Score
82

Recommended Department
Bureau of Street Maintenance

3. Location
Place the incident on the GIS map.
4. Municipal Dashboard
Show the newly reported incident appearing in the command center.
5. AI Dispatch
Open AI Dispatch.
Generate a crew allocation plan based on:
- Incident severity
- Location
- Crew availability
- Sector
- Operational priority
6. Field Technician
Switch to the field technician console.
Show:
Assigned
    ↓
In Progress
    ↓
Checklist
    ↓
Field Notes
    ↓
Resolved

7. Analytics
Finish by showing:
- Active incidents
- Critical hazards
- Resolution trends
- Infrastructure distribution
- Crew workload
This demonstrates the complete lifecycle:
Detect → Analyze → Prioritize → Dispatch → Repair → Resolve

🎯 Project Objective
CivicPulse is designed around a simple principle:
Infrastructure monitoring should not stop at identifying a problem. It should help the people responsible for fixing it decide what to do next.

By combining multimodal AI with geospatial visualization and field operations, CivicPulse aims to reduce the gap between public reporting and municipal action.
🔮 Future Scope
Potential future extensions include:
- Real-time municipal IoT integration
- CCTV-based continuous infrastructure monitoring
- Vehicle-mounted road inspection
- Computer vision damage measurement
- Automatic duplicate report detection
- Predictive infrastructure failure detection
- Historical maintenance intelligence
- Ward-level infrastructure health scores
- SMS / WhatsApp citizen notifications
- Integration with municipal work-order systems
- Advanced geospatial clustering
- Computer vision-based pothole dimension estimation
- Predictive maintenance scheduling
👥 Team
Project: CivicPulse AI
Domain: Artificial Intelligence + Smart Cities + Public Infrastructure
Type: Hackathon Project
📜 License
This project is intended for educational, research, and hackathon purposes.
Add an appropriate open-source license before public production use.

### Then update your local README

Since you've **already committed** the old README, after replacing it run:

```bash
git add README.md
git commit -m "Improve project documentation"

Then later, when your GitHub remote is correct:
git push