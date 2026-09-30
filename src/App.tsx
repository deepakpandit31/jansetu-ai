import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Code2,
  Database,
  Cpu,
  RefreshCw,
  Wifi,
  X,
} from 'lucide-react';
import { CitizenMobileApp } from '../apps/mobile/src/CitizenMobileApp';
import { GovernmentDashboard } from '../apps/web/src/GovernmentDashboard';
import { UserRole, CitizenRequest } from '../packages/shared/src/types';

export function App() {
  const [currentAppMode, setCurrentAppMode] = useState<
    'citizen' | 'government' | 'demo-flow' | 'architecture'
  >('government');
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);
  const [activeGovRole, setActiveGovRole] = useState<UserRole>('DISTRICT_OFFICER');
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<CitizenRequest | null>(null);
  const [sharedLang, setSharedLang] = useState<string>(() => {
    return localStorage.getItem('jansetu_selected_lang') || 'hi';
  });

  // Global Toast for offline drafts synchronization
  const [appToast, setAppToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    const handleSync = (e: any) => {
      const count = e?.detail?.count || 1;
      const timestamp =
        e?.detail?.timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setAppToast({
        visible: true,
        title: 'Network Reconnected',
        message:
          count === 1
            ? '1 pending offline draft has been successfully synced to the backend.'
            : `${count} pending offline drafts have been successfully synced to the backend.`,
        timestamp,
      });

      const timer = setTimeout(() => {
        setAppToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 4500);

      return () => clearTimeout(timer);
    };

    window.addEventListener('jansetu:offline-drafts-synced', handleSync);
    return () => window.removeEventListener('jansetu:offline-drafts-synced', handleSync);
  }, []);

  // Demo Walkthrough Progress
  const [demoStep, setDemoStep] = useState<number>(1);

  const demoStepsList = [
    {
      step: 1,
      title: 'Open Citizen Mobile App',
      description: 'Switch to the Citizen Mobile Application interface.',
      actionName: 'Go to Mobile App',
      run: () => {
        setCurrentAppMode('citizen');
        setDemoStep(2);
      },
    },
    {
      step: 2,
      title: 'Select Language (हिन्दी)',
      description: 'Citizen chooses preferred language from 13 supported Indian languages.',
      actionName: 'Set Hindi & Continue',
      run: () => {
        setCurrentAppMode('citizen');
        setDemoStep(3);
      },
    },
    {
      step: 3,
      title: 'Citizen Voice Recording',
      description: 'Tap microphone and record: "हमारे गांव में सड़क बहुत खराब है और बारिश के समय एम्बुलेंस नहीं आ पाती।"',
      actionName: 'Simulate Voice Input',
      run: () => {
        setCurrentAppMode('citizen');
        setDemoStep(4);
      },
    },
    {
      step: 4,
      title: 'AI Multi-Stage Ingest & Verification',
      description: 'Gemini AI extracts problem, classifies category as ROAD, secondary impact as EMERGENCY_HEALTHCARE, and assigns HIGH urgency.',
      actionName: 'Verify AI Output',
      run: () => {
        setCurrentAppMode('citizen');
        setDemoStep(5);
      },
    },
    {
      step: 5,
      title: 'Citizen Confirms & Submits Request',
      description: 'Request submitted to backend REST API with GPS geotag and status history.',
      actionName: 'Submit to Database',
      run: () => {
        setCurrentAppMode('citizen');
        setDemoStep(6);
      },
    },
    {
      step: 6,
      title: 'Open Government Web Command Center',
      description: 'Switch to Government Dashboard. See the newly submitted request reflected in live statistics.',
      actionName: 'View Government Dashboard',
      run: () => {
        setCurrentAppMode('government');
        setDemoStep(7);
      },
    },
    {
      step: 7,
      title: 'Geospatial National Map & Clustering',
      description: 'System clusters nearby road reports into Chohtan-Shivnagar Hotspot #1.',
      actionName: 'Inspect Map Hotspots',
      run: () => {
        setCurrentAppMode('government');
        setDemoStep(8);
      },
    },
    {
      step: 8,
      title: 'Explainable Hotspot Priority Breakdown',
      description: 'Review multi-factor priority score (86.8/100): Demand 23.5/25, Impact 21.8/25, Gap 18.2/20, Urgency 12.8/15, Access 10.5/15.',
      actionName: 'Inspect Score Factors',
      run: () => {
        setCurrentAppMode('government');
        setDemoStep(9);
      },
    },
    {
      step: 9,
      title: 'AI Recommendation & Evidence Dossier',
      description: 'Examine REC-2026-01 (All-Weather Bituminous Upgrade) with citizen quotations and limitations.',
      actionName: 'View AI Recommendation',
      run: () => {
        setCurrentAppMode('government');
        setDemoStep(10);
      },
    },
    {
      step: 10,
      title: 'What-If Infrastructure Simulator',
      description: 'Simulate civil intervention: projected coverage increases from 45% to 78%, reaching +31,700 citizens and reducing gap score.',
      actionName: 'Execute Simulator',
      run: () => {
        setCurrentAppMode('government');
        setDemoStep(1);
      },
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* GLOBAL TOP NAVIGATION & MONOREPO APP SWITCHER */}
      <header className="h-13 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 select-none shadow-md">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-extrabold text-white text-xs shadow-xs">
              JS
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                JANSETU AI
                <span className="text-[10px] text-teal-300 font-medium hidden sm:inline">
                  • Citizen-to-Government Infrastructure Intelligence
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-[280px] sm:max-w-none shrink-0">
          <button
            onClick={() => setCurrentAppMode('citizen')}
            className={`flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-lg font-semibold transition shrink-0 ${
              currentAppMode === 'citizen'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen Mobile App</span>
            <span className="sm:hidden">Citizen</span>
          </button>

          <button
            onClick={() => setCurrentAppMode('government')}
            className={`flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-lg font-semibold transition shrink-0 ${
              currentAppMode === 'government'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Government Dashboard</span>
            <span className="sm:hidden">Govt</span>
          </button>

          <button
            onClick={() => setCurrentAppMode('demo-flow')}
            className={`flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-lg font-semibold transition shrink-0 ${
              currentAppMode === 'demo-flow'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guided Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={() => setCurrentAppMode('architecture')}
            className={`flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg font-semibold transition shrink-0 ${
              currentAppMode === 'architecture'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Monorepo & API</span>
            <span className="sm:hidden">Docs</span>
          </button>
        </div>

        {/* Right Options */}
        <div className="flex items-center space-x-2">
          {currentAppMode === 'citizen' && (
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 transition"
              title="Toggle mobile device frame"
            >
              {deviceFrame ? 'Full Screen' : 'Device Frame'}
            </button>
          )}

          <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded hidden md:inline">
            PostGIS • Gemini 3.8
          </span>
        </div>
      </header>

      {/* Global Toast for Offline Draft Sync (Triggers when outside mobile frame) */}
      {appToast?.visible && currentAppMode !== 'citizen' && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-14 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="bg-slate-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md rounded-xl p-3 text-white max-w-sm flex items-start gap-2.5 ring-1 ring-emerald-500/20">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  {appToast.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">{appToast.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">{appToast.message}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>Backend synchronization confirmed</span>
              </div>
            </div>
            <button
              onClick={() => setAppToast((prev) => (prev ? { ...prev, visible: false } : null))}
              className="text-slate-400 hover:text-white transition p-1 -mr-1 -mt-1 rounded-md"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* WORKSPACE VIEW CONTAINER */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* VIEW 1: CITIZEN MOBILE APP */}
        {currentAppMode === 'citizen' && (
          <div className="flex-1 h-full w-full flex items-center justify-center bg-slate-950 p-0 md:p-3 overflow-hidden">
            {deviceFrame ? (
              /* Responsive Smartphone Shell: Full viewport on mobile (<md), centered phone frame on desktop (>=md) */
              <div className="w-full h-full md:max-w-[420px] md:h-[94vh] md:max-h-[840px] bg-slate-900 md:rounded-[42px] p-0 md:p-3 shadow-2xl md:border-4 md:border-slate-700 flex flex-col relative md:ring-1 md:ring-white/10">
                {/* Speaker & camera notch - desktop preview only */}
                <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 items-center justify-center">
                  <div className="w-10 h-1 bg-slate-800 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-slate-900 ml-2" />
                </div>

                <div className="w-full h-full md:rounded-[32px] overflow-hidden bg-white flex flex-col">
                  <CitizenMobileApp
                    onOpenDashboard={() => setCurrentAppMode('government')}
                    onRequestCreated={(req) => setLastSubmittedRequest(req)}
                    initialLang={sharedLang}
                    onLanguageChange={setSharedLang}
                  />
                </div>
              </div>
            ) : (
              /* Full-Width Citizen Portal */
              <div className="w-full h-full max-w-4xl mx-auto rounded-none md:rounded-xl overflow-hidden shadow-xl border-0 md:border md:border-slate-800">
                <CitizenMobileApp
                  onOpenDashboard={() => setCurrentAppMode('government')}
                  onRequestCreated={(req) => setLastSubmittedRequest(req)}
                  initialLang={sharedLang}
                  onLanguageChange={setSharedLang}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: GOVERNMENT WEB PLATFORM */}
        {currentAppMode === 'government' && (
          <div className="flex-1 h-full w-full overflow-hidden">
            <GovernmentDashboard
              onSwitchToMobile={() => setCurrentAppMode('citizen')}
              activeRole={activeGovRole}
              onRoleChange={(role) => setActiveGovRole(role)}
              initialLang={sharedLang}
              onLanguageChange={setSharedLang}
            />
          </div>
        )}

        {/* VIEW 3: GUIDED 20-STEP HACKATHON DEMO WALKTHROUGH */}
        {currentAppMode === 'demo-flow' && (
          <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-[#0B1220] max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Section 57 Verification Flow
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Complete Hackathon Demo Flow (Citizen Voice ➔ Infrastructure Priority)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Follow this 10-phase sequence (covering all 20 steps) to demonstrate end-to-end evidence conversion.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentAppMode('citizen');
                  setDemoStep(1);
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                Start Demo at Step 1 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoStepsList.map((item) => (
                <div
                  key={item.step}
                  className={`p-4 rounded-xl border transition ${
                    demoStep === item.step
                      ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      Phase {item.step} of 10
                    </span>
                    {demoStep > item.step && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={item.run}
                      className="bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
                    >
                      {item.actionName} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Canonical Test Statement Box */}
            <div className="bg-[#080D18] border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Canonical Evaluation Statement:
              </h4>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm font-medium text-white italic">
                "हमारे गांव में सड़क बहुत खराब है और बारिश के समय एम्बुलेंस नहीं आ पाती।"
              </div>
              <div className="text-xs text-slate-400">
                AI extracts: Language: Hindi • Primary: Road Infrastructure • Impact: Emergency Healthcare Access • Urgency: High • Geocoding: Barmer District.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: MONOREPO ARCHITECTURE & API SPEC */}
        {currentAppMode === 'architecture' && (
          <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-[#0B1220] max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                Engineering Specification
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                JanSetu AI Monorepo Architecture & Database Specs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Clean full-stack monorepo uniting React Native mobile, Next.js / React government dashboard, and Node.js PostGIS backend.
              </p>
            </div>

            {/* Monorepo Directory Layout */}
            <div className="bg-[#080D18] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Monorepo Workspace Structure:
              </h3>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
{`jan-setu-ai/
  ├── apps/
  │   ├── mobile/             # Citizen React Native & Expo application
  │   │   ├── src/CitizenMobileApp.tsx (13 languages, voice recording, camera, GPS, tracking)
  │   ├── web/                # Government Web Command Center
  │   │   ├── src/GovernmentDashboard.tsx (KPIs, requests table, geospatial map, simulator)
  │   └── server/             # Express.js REST API & PostGIS intelligence
  │       ├── src/routes/api.ts (Auth, requests, AI, hotspots, recommendations, simulator)
  │       ├── src/ai/geminiService.ts (Gemini 3.8 multimodal analysis & AI Copilot)
  │       ├── src/analytics/priorityEngine.ts (Transparent 5-factor scoring engine)
  │       ├── src/analytics/simulatorEngine.ts (What-If scenario impact calculator)
  │       └── src/db/inMemoryDb.ts & seedData.ts (Realistic synthetic data across 12 states)
  ├── packages/
  │   ├── shared/             # Types, 13-language i18n schemas, category constants
  │   └── validation/         # Zod schemas for request validation & RBAC
  ├── server.ts               # Production & Dev unified server entry point (port 3000)
  └── metadata.json           # Application identity & permissions`}
              </pre>
            </div>

            {/* REST API Endpoints Table */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Live Backend REST Endpoints:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-teal-400 font-bold">POST /api/requests</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Submit geotagged voice/text/photo request with AI verification</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-teal-400 font-bold">POST /api/ai/analyze-request</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Structured Gemini 3.8 prompt analysis & language normalization</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-teal-400 font-bold">GET /api/hotspots</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Aggregated demand clusters with 5-factor priority breakdown</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-teal-400 font-bold">POST /api/simulation</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">What-If scenario calculator (coverage, population reach, ROI)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-teal-400 font-bold">PATCH /api/recommendations/:id/status</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Human-in-the-loop review (Approve for Planning, Reject)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-mono text-purple-400 font-bold">POST /api/ai/copilot</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Evidence-grounded assistant querying real structured platform data</p>
                </div>
              </div>
            </div>

            {/* Explainable Priority Scoring Model */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-2 text-xs">
              <h3 className="font-bold text-teal-400 uppercase tracking-wider text-xs">
                Transparent Priority Scoring Formula:
              </h3>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200">
                Priority Score (0-100) = Citizen Demand (25) + Population Impact (25) + Infrastructure Gap (20) + Urgency Severity (15) + Accessibility Deficit (15)
              </div>
              <p className="text-slate-400 text-[11px]">
                The system explicitly separates verified citizen demand counts from model estimates and displays every component factor transparently.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
