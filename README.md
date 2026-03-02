# TitraSmart 3D 🧪

**An AI-Agentic Digital Twin for Analytical Chemistry**

---

## 🔬 Project Overview

**TitraSmart 3D** is a high-fidelity, web-native virtual laboratory designed to bridge the gap between theoretical chemistry and precise manual technique. Unlike traditional 2D simulations, TitraSmart 3D utilizes WebGPU-accelerated 3D rendering to provide a **"Digital Twin"** of the *Standardization of NaOH with KHP* experiment.

The core innovation of the platform is its **Predictive Analytics Engine**. By monitoring real-time titration data—specifically the $pH$ and the rate of change ($\Delta pH / \Delta V$)—an Agentic AI Tutor provides proactive, "just-in-time" feedback, coaching students to transition from "Rapid Pour" to "Dropwise" additions before they overshoot the equivalence point.

---

## 🚀 Key Features

- **High-Fidelity 3D Environment**: Interactive lab bench featuring a buret, Erlenmeyer flask, and analytical balance built with Vue 3 and TresJS.
- **Predictive AI Assistant**: A Decision Tree-powered tutor that identifies the "S-Curve" signature to warn users of approaching endpoints.
- **Real-Time Analytics**: Live calculation of $\frac{\Delta pH}{\Delta V}$ to visualize the first derivative of the titration curve.
- **Standardization Workflow**: 100% feature-complete simulation including KHP massing, buret rinsing, and molarity calculations.
- **Persistent Session Logs**: Automated data collection for student performance review and ML model retraining via Supabase.

---

## 🛠️ Technical Stack (2026 Titanium Stack)

- **Frontend**: Vue.js 3 (Vapor Mode) & TresJS (Three.js for Vue)
- **Styling**: Vanilla CSS (Premium Micro-interactions)
- **3D Rendering**: WebGPU via Three.js
- **AI/ML**: Scikit-learn (Decision Tree Classifier) & LangGraph
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + Real-time WebSockets)

---

## 📁 Important Project Structure excluding the chore scripts, git, env, node_modules and etc

```plaintext
├── src/
│   ├── api/               
│   │   └── supabase.ts    # Single source for DB & Auth
│   ├── assets/            
│   │   ├── models/        # .glb files (Buret, Flask, Balance)
│   │   └── styles/        # Tailwind & Global CSS
│   ├── services/          
│   │   ├── auth.service.ts   # Login/Logout logic
│   │   └── lab.service.ts    # ALL database calls (Save log, Get history)
│   ├── components/        
│   │   ├── lab/           # 3D TresJS (Buret.vue, Flask.vue, Liquid.vue)
│   │   ├── hud/           # 2D Overlays (AI-Tutor.vue, pH-Meter.vue)
│   │   └── shared/        # UI Kit (BaseButton.vue, BaseCard.vue)
│   ├── core/              # THE ENGINE (Framework Agnostic)
│   │   ├── chemistry/     # titrationMath.ts (pH & Molarity formulas)
│   │   ├── ai/
│   │   │   ├── model.json # THE BRAIN: Imported directly into Vue
│   │   │   └── predictor.ts # The JS logic that uses model.json
│   │   └── physics/       # flowLogic.ts (Drop rates & timing)
│   ├── composables/       # VUE GLUE (Reactive Logic)
│   │   ├── useTitration.ts # Main state: volume, pH, titration progress
│   │   └── useSensor.ts    # Real-time ΔpH/ΔV & AI prediction trigger
│   ├── router/            # Vue Router Configuration (e.g. routes.ts, guards.ts, index.ts)
│   ├── store/             # Global State (Pinia)
│   │   └── labState.ts    # Current session data
│   ├── types/             
│   │   └── index.ts       # TypeScript interfaces (Session, Log, ChemData)
│   ├── views/             
│   │   ├── auth/
│   │   │   ├── LoginView.vue       # The entry point
│   │   │   └── RegisterView.vue    # Student signup
│   │   ├── lab/
│   │   │   ├── components/         # View-specific sub-components (e.g. LabControls.vue)
│   │   │   ├── LabStageView.vue    # The MAIN 3D TresJS Scene
│   │   │   ├── WeighingView.vue    # The Initial KHP massing stage
│   │   │   └── ResultsView.vue     # Final analysis & AI feedback
│   │   └── dashboard/
│   │       └── StudentHistory.vue  # List of previous lab attempts
│   ├── App.vue
│   └── main.ts
├── ai/                    # The "Training Lab"
│   ├── titration_v1.ipynb # Your Google Colab notebook (saved here)
│   ├── dataset.csv        # The data
│   └── export_model.py    # Script to convert Tree -> JSON/ONNX
```

---

## 🧪 The Science Behind the AI

The AI Assistant evaluates the titration state based on the slope of the curve. The primary metric used for prediction is:

$$\text{Slope} = \frac{\Delta pH}{\Delta V}$$

| $\Delta pH / \Delta V$ Value | AI Guidance |
| :--- | :--- |
| $< 2$ | "Steady flow: Continue titration." |
| $2 - 8$ | "Slowing down recommended: Approaching curve." |
| $> 8$ | "Warning: Near Endpoint! Switch to Dropwise." |

---

## ⚙️ Development Setup

### Prerequisites
- Node.js (v22+)
- pnpm or npm
- Python 3.12+ (for AI services)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/titrasmart-3d.git
   cd titrasmart-3d
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Linting:**
   ```bash
   pnpm lint
   ```

---

## 🗺️ Roadmap

- [x] **Epic 1**: Environment (3D Assets & Navigation)
- [ ] **Epic 2**: The Brain (pH Calculations & Stoichiometry)
- [ ] **Epic 3**: The Assistant (Decision Tree & UI Overlay)
- [ ] **Epic 4**: Standardization (KHP Weighing & Results)

---

## 📝 License

This project is licensed under the **MIT License**.