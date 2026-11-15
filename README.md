# ASTRA — Astronaut Health Intelligence System
**2026 NASA Space Apps Challenge Project**
*Partner Integration: Canadian Space Agency (CSA / ASC) Research*

[![NASA Space Apps](https://img.shields.io/badge/NASA-Space_Apps_2026-0B3D91?style=flat&logo=nasa)](https://www.spaceappschallenge.org/)
[![CSA Partner](https://img.shields.io/badge/Space_Agency_Partner-Canadian_Space_Agency_(CSA)-E02424?style=flat)](https://www.asc-csa.gc.ca/)
[![Status](https://img.shields.io/badge/Status-Operational_Prototype-06B6D4?style=flat)]()
[![Offline First](https://img.shields.io/badge/Architecture-Offline--First_IndexedDB-emerald?style=flat)]()

ASTRA (**Astronaut Health Intelligence System**) is an intelligent aerospace health monitoring platform designed for astronauts on long-duration exploration missions (such as Deep Space Gateway orbits and Mars transit simulations).

During extended spaceflight, astronauts face severe physiological and behavioral challenges due to microgravity, cephalad fluid redistribution, radiation exposure, isolation, sleep disruption, cardiovascular remodeling, and autonomic fatigue. ASTRA provides autonomous, individual-calibrated monitoring that runs entirely without internet connectivity when deep space communication delays or blackouts occur.

---

## 1. Canadian Space Agency (CSA) Partner Research Integration

ASTRA directly incorporates published research from the **Canadian Space Agency (CSA)** to ground its monitoring taxonomy and clinical countermeasure architecture:

### 1.1. CSA Space Health Study (Bio-Monitor Framework)
- **Official URL:** [https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp](https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp)
- **Scientific Role in ASTRA:** The Canadian Bio-Monitor smart shirt study defines the foundational 5-indicator taxonomy used to structure ASTRA's telemetry suite:
  1. **Heart Rate & HRV (ECG):** Ambient and resting heart rate monitoring with autonomic balance.
  2. **Respiration Rate:** Dual chest plethysmography breathing dynamics.
  3. **Blood Oxygen (SpO2):** Peripheral pulse oximetry in pressurized habitats.
  4. **Exercise & Physical Activity:** Accelerometry tracking daily countermeasure compliance.
  5. **Wellness Questionnaire:** Standardized subjective daily self-check-in schema.

### 1.2. CSA TBone Study (Bone Microarchitecture & Recovery)
- **Official URL:** [https://www.asc-csa.gc.ca/eng/sciences/tbone.asp](https://www.asc-csa.gc.ca/eng/sciences/tbone.asp)
- **Published Findings Integrated into ASTRA:**
  - **17 astronauts** participated in the study aboard the International Space Station.
  - **More than 50% of astronauts** had not regained their pre-flight bone density even **one year after returning from space**.
  - **Bone recovery was directly related to mission duration**; longer space missions caused significantly slower and less complete trabecular bone recovery.
- **Visual Research Summary:** ASTRA features dedicated interactive charts comparing 1-year bone recovery distributions, mission duration vs. bone density loss, and tibia vs. radius trabecular microarchitecture.
- **Operational Application:** Drives ASTRA's **Physical Fitness Countermeasure Module**, enforcing daily ARED resistive loads (>100 kg deadlifts/squats) and T2 harness axial foot strikes to counter long-term osteopenic degradation.

---

## 2. Data Authenticity Framework (Three Strict Categories)

To maintain absolute scientific integrity, ASTRA distinguishes and labels three discrete categories of information throughout the application:

| Category | Description | Application Implementation |
|---|---|---|
| **Category A: Published Research Data** | Documented empirical findings and study architecture from official CSA publications. | TBone study 17-astronaut recovery statistics, Bio-Monitor indicator taxonomy, official research URLs. |
| **Category B: Simulated Telemetry** | Synthetic physiological readings generated for astronaut Dr. Elena Vance to demonstrate the multi-sol mission experience. | Vital signs (HR, SpO2, BP, Temp), sleep stages, and exercise entries. Clearly labeled with no raw files claimed. |
| **Category C: Prototype Analytics** | Algorithmic evaluations computed by ASTRA from input telemetry. | Dynamic 14-day baselines ($\mu, \sigma, \text{P10}, \text{P90}$), Z-scores, Isolation Forest anomaly alerts, and recovery metrics. |

---

## 3. Core Architecture & Scientific Features

### 3.1. Personalized Microgravity Baselines vs Fixed Universal Thresholds
Standard universal clinical thresholds (e.g. 60–100 BPM) fail in human spaceflight due to individual conditioning, cephalad fluid redistribution, and space anemia. ASTRA establishes a personalized 14-day baseline for each astronaut and detects statistically significant deviations ($> +1.8\sigma$ to $+2.5\sigma$).

### 3.2. Hybrid Anomaly Detection Engine
- **Multivariate Machine Learning:** Scikit-Learn `IsolationForest` fitted across multi-dimensional physiological features (`resting_heart_rate`, `spo2`, `blood_pressure_sys`, `sleep_duration`, `hrv`, `body_temp`).
- **Explainable Compound Rules:** Identifies compound autonomic stress (e.g. resting HR elevated for 3 days combined with declining restorative sleep).
- **Medically Reviewed Recommendations:** Actionable checklists and recovery extensions aligned with aerospace medical protocols.

### 3.3. True Offline-First Architecture
Deep space transit missions experience comm blackouts and round-trip delays up to 24 minutes. ASTRA is engineered with an **offline-first IndexedDB database (via Dexie.js)**:
- Core UI, interactive graphs, and client-side baseline estimators load without network access.
- Crew members can log vitals, sleep check-ins, and exercise sessions offline.
- When downlink connection is restored, automatic or manual batch sync reconciles with ground telemetry.

---

## 4. Navigation & Modules

ASTRA features a 9-page aerospace telemetry navigation layout:

1. **Overview:** Mission Sol counter, astronaut profile (Dr. Elena Vance, Artemis VII), 6 overview cards with sparklines, interactive 24h/7d/30d multi-metric charts, and ECLSS habitat life support telemetry.
2. **Vital Signs:** Deep dive into cardiovascular telemetry, SpO2 saturation safety envelopes, arterial hemodynamics (Systolic, Diastolic, MAP), and Heart Rate Variability (rMSSD) with CSA Bio-Monitor reference citations.
3. **Health Intelligence:** The core ML & baseline analytics hub. Displays personalized baseline matrix ($\mu, \sigma, \text{median}, \text{P10}, \text{P90}$), active explainable alerts with severity badges, clinical countermeasure checklists, baseline recalculator, and simulation scenario switcher.
4. **Mental & Sleep:** Daily astronaut subjective check-in (Mood, Stress, Energy, Fatigue, Sleep Quality) based on the CSA Space Health study schema, sleep stage architecture (REM, Deep Slow-Wave, Light Sleep), and multivariate trend graphs.
5. **Physical Fitness:** Astronaut microgravity countermeasure tracker (ARED Resistive Exercise, T2 Treadmill, CEVIS Cycle), cardiovascular responses, and bone health connection to the CSA TBone study.
6. **Space Agency Research (NEW):** Dedicated partner integration hub displaying the Canadian Space Agency TBone study findings, visual cohort graphs, Bio-Monitor framework mapping, and the Data Sources Directory.
7. **Health History:** Filterable and searchable records table spanning vitals, wellness, fitness, and alert audits with record inspection drawer and CSV export.
8. **Medical Reports:** Comprehensive mission health report generator with executive summary, baseline vs observed comparison matrix, flight surgeon digital sign-off, partner research citations, and one-click PDF/Print layout.
9. **Settings:** Astronaut profile parameters, IndexedDB cache inspector, ground sync queue manager, demo scenario regenerator, and non-diagnostic research disclaimer.

---

## 5. Quick Start & Execution

### Launching the System
```bash
# On Windows PowerShell
.\start_astra.ps1

# Or with Batch
.\start_astra.bat
```

Or manually:
```bash
# 1. Start FastAPI Backend (Port 8000)
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000

# 2. In another terminal, start React Vite Frontend (Port 5173)
cd frontend
npm run dev
```

- **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation & Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 6. Demonstration Scenarios

In the **Health Intelligence** or **Settings** module, switch between active simulation scenarios:
- **Autonomic Fatigue Cascade (Demo Scenario):** Sols 62–68 feature a gradual increase in resting heart rate (+14 BPM) combined with declining sleep duration (dropping to 4.8 hours), triggering a High Priority explainable early warning.
- **Nominal Microgravity Baseline:** Telemetry remains strictly within the individual's baseline envelope.
- **Cephalad Fluid Shift:** Simulated central fluid redistribution causing systolic blood pressure surges.
- **Hypoxic / ECLSS Dip:** Simulated localized habitat environmental SpO2 drop.

---

## 7. Data Sources and References Directory

1. **Canadian Space Agency (CSA) TBone Study:**
   Boyd, S. K. et al. *Bone health in space and recovery on Earth.* [https://www.asc-csa.gc.ca/eng/sciences/tbone.asp](https://www.asc-csa.gc.ca/eng/sciences/tbone.asp)
2. **Canadian Space Agency (CSA) Space Health Study:**
   *Bio-Monitor: How space flight improves health monitoring on Earth.* [https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp](https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp)
3. **NASA Human Research Program (HRP):**
   *Evidence Report on Human Health Risks in Space Exploration.* NASA/TP-20220015707.
4. **Machine Learning & Frameworks:**
   Scikit-Learn (`IsolationForest`), FastAPI, SQLite, IndexedDB (`Dexie.js`), Recharts, Tailwind CSS.

---

## 8. Scientific & Medical Disclaimer

ASTRA is an advanced engineering prototype developed for the 2026 NASA Space Apps Challenge. The system is designed for situational awareness, health trend tracking, and crew-ground collaboration. Algorithmic alerts reflect statistical deviations from personalized telemetry baselines and do not constitute a substitute for clinical medical assessment by licensed flight surgeons.
