import React, { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import {
  Shield,
  Lock,
  Share2,
  User,
  Database,
  ThumbsUp,
  FileText,
  Sparkles,
  Zap,
  Code,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Wand2,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

// --- Configuration Helpers ---
const safeParseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn("Invalid JSON provided to VITE_FIREBASE_CONFIG.", error);
    return null;
  }
};

const firebaseConfig = safeParseJson(import.meta.env.VITE_FIREBASE_CONFIG);
const firebaseEnabled = Boolean(firebaseConfig);
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
const auth = firebaseEnabled ? getAuth(app) : null;
const db = firebaseEnabled ? getFirestore(app) : null;
const appId = import.meta.env.VITE_APP_ID || "demo-app-id";

// --- API Configuration ---
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
const aiEnabled = Boolean(apiKey);
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;

// --- Demo Mode (runs when Firebase config is missing) ---
const demoUser = { uid: "demo-user", displayName: "Demo Developer" };
const demoProjects = [
  {
    id: "demo-1",
    title: "Resilient Event Grid",
    role: "Platform Engineer",
    challenge: "Move 1M TPS with strict SLOs across regions.",
    solution:
      "Event mesh over Kafka with idempotent workers and circuit-breakers.",
    impact: "Cut p99 latency from 320ms to 95ms while halving incident volume.",
    techStack: ["Go", "Kafka", "Postgres", "Linkerd"],
    redactionLevel: "high",
    userName: "Demo Developer",
    vouches: 18,
  },
  {
    id: "demo-2",
    title: "Zero-Trust Feature Flags",
    role: "Security Engineer",
    challenge: "Ship flags without exposing tenant data.",
    solution:
      "Policy-enforced edge SDK with signed payloads and short-lived tokens.",
    impact:
      "Blocked 96% of invalid rollouts pre-prod and sped approvals by 40%.",
    techStack: ["Node.js", "Redis", "Open Policy Agent"],
    redactionLevel: "medium",
    userName: "Demo Developer",
    vouches: 9,
  },
  {
    id: "demo-3",
    title: "Adaptive Retrieval Layer",
    role: "ML Engineer",
    challenge: "Keep LLM grounding fresh without hot-patching.",
    solution: "Hybrid vector + keyword index with TTL-driven freshness lanes.",
    impact: "Raised factuality scores by 21% and reduced refresh costs by 30%.",
    techStack: ["Python", "Elasticsearch", "Redis", "gRPC"],
    redactionLevel: "top-secret",
    userName: "Demo Developer",
    vouches: 13,
  },
];

// --- AI Helpers ---

// 1. Smart Draft (Existing)
const generateProjectDetails = async (rawText) => {
  if (!aiEnabled) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a technical writer assisting a developer. 
              Analyze the following project description and extract structured data. 
              Crucially, ANONYMIZE any specific company names (e.g., change "Google" to "Major Tech Company").
              
              Input Text: "${rawText}"
              
              Output strictly valid JSON with these keys:
              - title: A generic, professional title (e.g., "High-Throughput Event Processor").
              - role: The developer's role.
              - techStack: A comma-separated string of tools/languages.
              - challenge: The technical problem or constraint (max 2 sentences).
              - solution: The architectural approach (abstracted, max 2 sentences).
              - impact: The measurable result.
              - sensitivity: Suggest 'medium', 'high', or 'top-secret' based on complexity.`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
};

// 2. Security Audit (New)
const auditProjectContent = async (formData) => {
  if (!aiEnabled) return { safe: true, warnings: [] };
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this project draft for potential NDA breaches or PII. 
              Look for specific company names, internal project codenames, leaked credentials, or specific IP addresses.
              Context: ${JSON.stringify(formData)}
              
              Return strictly valid JSON:
              {
                "safe": boolean,
                "warnings": [string] (list of specific potential issues, or empty if safe)
              }`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    return { safe: true, warnings: [] }; // Fallback
  }
};

// 3. Impact Enhancer (New)
const enhanceProjectImpact = async (challenge, solution, currentImpact) => {
  if (!aiEnabled || !currentImpact) return currentImpact;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Rewrite this impact statement to be more quantitative, professional, and executive-friendly.
              Context - Challenge: ${challenge}, Solution: ${solution}.
              Current Impact: ${currentImpact}.
              
              Return strictly valid JSON: { "enhancedImpact": "string" }`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text)
      .enhancedImpact;
  } catch (error) {
    return currentImpact;
  }
};

// 4. Architect Chat (New)
const queryArchitect = async (history, projectContext, userQuestion) => {
  if (!aiEnabled)
    return "Architect offline. Add VITE_GOOGLE_API_KEY to enable chat.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are the "Ghost Architect" of this project. 
              Project Data: ${JSON.stringify(projectContext)}.
              
              Answer the user's question based ONLY on the provided data.
              - Do NOT invent implementation details not present in the JSON.
              - If the user asks for code or specific details not listed, say "That detail is classified."
              - Maintain a professional, slightly mysterious "operative" persona.
              - Keep answers short (max 2 sentences).
              
              Chat History: ${JSON.stringify(history)}
              User Question: ${userQuestion}`,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Connection failed."
    );
  } catch (error) {
    console.error("Architect chat failed", error);
    return "Secure link unstable. Try again.";
  }
};

// --- Components ---

// 1. Navigation
const Navbar = ({ view, setView, user }) => (
  <nav
    className="glass sticky top-0 z-50 border-b border-gray-200"
    style={{
      backdropFilter: "blur(12px)",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    }}
  >
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView("feed")}
      >
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">
          <span className="gradient-text">Ghost</span>
          <span className="italic font-light">Work</span>
        </span>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={() => setView("feed")}
          className={`text-sm font-semibold transition-all relative ${
            view === "feed"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Discover
          {view === "feed" && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setView("create")}
          className={`text-sm font-semibold transition-all relative ${
            view === "create"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Share Work
          {view === "create" && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setView("profile")}
          className={`flex items-center gap-2 text-sm font-semibold transition-all px-3 py-1.5 rounded-lg ${
            view === "profile"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {user ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {user.displayName ? user.displayName.split(" ")[0] : "Dev"}
            </span>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </div>
    </div>
  </nav>
);

// 2. Create Project Wizard (Updated with Audit & Enhance)
const CreateProject = ({ user, setView }) => {
  const [mode, setMode] = useState("input");
  const [rawInput, setRawInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // New State for AI Features
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    role: "",
    techStack: "",
    challenge: "",
    solution: "",
    impact: "",
    redactionLevel: "high",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAIAnalyze = async () => {
    if (!rawInput.trim()) return;
    setIsGenerating(true);
    const result = await generateProjectDetails(rawInput);
    if (result) {
      setFormData({
        title: result.title || "",
        role: result.role || "",
        techStack: result.techStack || "",
        challenge: result.challenge || "",
        solution: result.solution || "",
        impact: result.impact || "",
        redactionLevel: result.sensitivity || "high",
      });
      setMode("review");
      setAuditResult(null); // Reset audit on new draft
    }
    setIsGenerating(false);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const result = await auditProjectContent(formData);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const handleEnhanceImpact = async () => {
    if (!formData.impact) return;
    setIsEnhancing(true);
    const betterImpact = await enhanceProjectImpact(
      formData.challenge,
      formData.solution,
      formData.impact
    );
    if (betterImpact) {
      setFormData((prev) => ({ ...prev, impact: betterImpact }));
    }
    setIsEnhancing(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!db) {
      console.warn("Firestore is not configured; running in demo mode.");
      setView("feed");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "projects"),
        {
          ...formData,
          userId: user.uid,
          userName: user.displayName || "Anonymous Developer",
          techStack: formData.techStack
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          vouches: 0,
          createdAt: serverTimestamp(),
          views: 0,
        }
      );
      setView("feed");
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="mb-12 text-center animate-fade-in">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          Document Your Architecture
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Share your engineering wins without breaching NDAs. <br />
          Use our AI to automatically abstract sensitive details.
        </p>
      </div>

      {mode === "input" && (
        <div className="card animate-slide-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl">Smart Draft</h3>
          </div>

          <textarea
            rows={6}
            placeholder="e.g. I worked at [Big Bank] building a trading engine in Rust that handled 1M TPS. We had to fork Kafka to handle the load..."
            className="font-mono text-sm"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
          />

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Your input is processed securely
            </span>
            <button
              onClick={handleAIAnalyze}
              disabled={!rawInput || isGenerating}
              className="btn btn-primary"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Abstracting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Process Description
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {mode === "review" && (
        <div className="card card-elevated animate-fade-in">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <h3 className="font-bold text-2xl flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Review Draft
            </h3>
            <div className="flex gap-3 items-center">
              <button
                onClick={handleAudit}
                disabled={isAuditing}
                className={`text-xs font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  auditResult?.safe === false
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "btn-secondary"
                }`}
              >
                {isAuditing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <ShieldAlert className="w-3 h-3" />
                )}
                {auditResult
                  ? auditResult.safe
                    ? "Draft Secure"
                    : "Risks Detected"
                  : "Audit Security"}
              </button>
              <button
                onClick={() => setMode("input")}
                className="btn btn-ghost text-xs"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Audit Warnings */}
          {auditResult && !auditResult.safe && (
            <div className="alert alert-error mb-6">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Potential NDA Breaches:
              </h4>
              <ul className="list-disc list-inside text-xs font-mono space-y-1">
                {auditResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                  Project Title
                </label>
                <input
                  type="text"
                  className="font-semibold"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                  Your Role
                </label>
                <input
                  type="text"
                  className="font-semibold"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                Technical Challenge
              </label>
              <textarea
                rows={2}
                value={formData.challenge}
                onChange={(e) =>
                  setFormData({ ...formData, challenge: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                Architecture Solution
              </label>
              <textarea
                rows={2}
                value={formData.solution}
                onChange={(e) =>
                  setFormData({ ...formData, solution: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Impact
                  </label>
                  <button
                    onClick={handleEnhanceImpact}
                    disabled={isEnhancing || !formData.impact}
                    className="text-xs font-semibold text-purple-600 flex items-center gap-1 hover:text-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {isEnhancing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    Enhance
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.impact}
                  onChange={(e) =>
                    setFormData({ ...formData, impact: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">
                Sensitivity Level
              </label>
              <div className="flex gap-3">
                {["medium", "high", "top-secret"].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setFormData({ ...formData, redactionLevel: level })
                    }
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.redactionLevel === level
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !firebaseEnabled}
              className="btn btn-primary px-8 py-3"
            >
              {isSubmitting
                ? "Publishing..."
                : firebaseEnabled
                ? "Publish Project"
                : "Connect Firebase to Publish"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Project Card (Updated with Ask Architect Chat)
const ProjectCard = ({ project, user }) => {
  const [isVouched, setIsVouched] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleVouch = async () => {
    if (!user || isVouched || !db) return;
    setIsVouched(true);
    const ref = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "projects",
      project.id
    );
    await updateDoc(ref, {
      vouches: increment(1),
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsChatting(true);

    const architectResponse = await queryArchitect(
      chatHistory,
      project,
      userMsg
    );

    setChatHistory((prev) => [
      ...prev,
      { role: "ai", text: architectResponse },
    ]);
    setIsChatting(false);
  };

  return (
    <div className="card group relative overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <div className="text-sm text-gray-600 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {project.userName}
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="font-semibold text-gray-900">{project.role}</span>
          </div>
        </div>
        <div
          className={`badge ${
            project.redactionLevel === "top-secret"
              ? "badge-error"
              : project.redactionLevel === "high"
              ? "badge-warning"
              : "badge-primary"
          }`}
        >
          {project.redactionLevel === "top-secret"
            ? "Restricted"
            : project.redactionLevel === "high"
            ? "Private"
            : "Confidential"}
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            Challenge
          </h4>
          <p className="text-gray-700 leading-relaxed">{project.challenge}</p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Code className="w-3 h-3" />
            Solution
          </h4>
          <p className="text-gray-700 leading-relaxed">{project.solution}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Key Impact
          </h4>
          <div className="text-gray-900 font-semibold">{project.impact}</div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-5">
          {project.techStack &&
            project.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                {tech}
              </span>
            ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleVouch}
              disabled={!user || isVouched}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                isVouched
                  ? "text-green-600 bg-green-50 border border-green-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${isVouched ? "fill-green-600" : ""}`}
              />
              <span>{project.vouches || 0}</span>
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                isChatOpen
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Architect</span>
            </button>
          </div>

          <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Interface */}
        {isChatOpen && (
          <div className="mt-4 border border-gray-200 bg-white rounded-lg p-4 shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                <Database className="w-3 h-3" />
                Secure Uplink: Ghost Architect
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-36 overflow-y-auto mb-3 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {chatHistory.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center mt-10">
                  Ask about the stack or constraints...
                </p>
              )}
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-white ml-6 border border-gray-200"
                      : "bg-blue-50 text-blue-900 mr-6 border border-blue-200"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isChatting && (
                <div className="text-xs text-gray-400 italic flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Typing...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Is this scalable?"
                className="flex-1 text-xs"
              />
              <button
                type="submit"
                disabled={isChatting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Feed View
const Feed = ({ user, setView }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled) {
      setProjects(demoProjects);
      setLoading(false);
      return;
    }
    if (!db || !user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "projects")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-8 border-b border-gray-200">
        <div className="animate-slide-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Project Feed
          </h1>
          <p className="text-gray-600 text-lg">
            Real-world architecture patterns, anonymized for sharing.
          </p>
        </div>

        <div className="hidden md:flex gap-12 text-sm mt-6 md:mt-0">
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {projects.length}
            </div>
            <div className="text-gray-500 font-semibold uppercase text-xs tracking-wider mt-1">
              Projects
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {projects.reduce((acc, curr) => acc + (curr.vouches || 0), 0)}
            </div>
            <div className="text-gray-500 font-semibold uppercase text-xs tracking-wider mt-1">
              Validations
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Be the first to share your architecture.
          </p>
          <button
            onClick={() => setView("create")}
            className="btn btn-primary px-8 py-3"
          >
            Start Draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

// 5. User Profile View
const Profile = ({ user, setView }) => {
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    if (!firebaseEnabled) {
      setMyProjects(demoProjects);
      return;
    }
    if (!db || !user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "projects")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const myData = allData.filter((p) => p.userId === user.uid);
        setMyProjects(myData);
      },
      (err) => console.error(err)
    );
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-md">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Private Access
        </h2>
        <p className="text-gray-600 max-w-md leading-relaxed">
          Please wait while we secure your connection...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="card card-elevated mb-12 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="relative">
          <div className="w-28 h-28 border-4 border-white rounded-full overflow-hidden shadow-lg">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block badge badge-success mb-3">
            Verified Developer
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {user.displayName || "Developer"}
          </h2>
          <div className="text-gray-600 text-sm mb-6 flex items-center gap-2 justify-center md:justify-start">
            <Shield className="w-4 h-4" />
            Senior Member • Joined 2024
          </div>

          <div className="flex gap-8 justify-center md:justify-start">
            <div>
              <span className="block font-bold text-gray-900 text-2xl">
                {myProjects.length}
              </span>
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Shared
              </span>
            </div>
            <div>
              <span className="block font-bold text-gray-900 text-2xl">
                {myProjects.reduce((acc, curr) => acc + (curr.vouches || 0), 0)}
              </span>
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Validations
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          Your Portfolio
        </h3>
        <button onClick={() => setView("create")} className="btn btn-secondary">
          Add New
        </button>
      </div>

      {myProjects.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl">
          <p className="text-gray-600 mb-6 text-lg">
            You haven't documented any work yet.
          </p>
          <button onClick={() => setView("create")} className="btn btn-primary">
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map((project) => (
            <ProjectCard key={project.id} project={project} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("feed"); // 'feed', 'create', 'profile'
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setUser(demoUser);
      setIsAuthReady(true);
      return;
    }
    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
        if (auth.currentUser && !auth.currentUser.displayName) {
          const codeNames = [
            "Dev",
            "Engineer",
            "Architect",
            "Builder",
            "Maker",
          ];
          const randomName = `${
            codeNames[Math.floor(Math.random() * codeNames.length)]
          }_${Math.floor(Math.random() * 999)}`;
          await updateProfile(auth.currentUser, { displayName: randomName });
        }
      } catch (error) {
        console.error("Auth failed:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mx-auto mb-6 rounded-2xl shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="text-gray-900 font-semibold tracking-wide text-lg mb-2">
            <span className="gradient-text">Ghost</span>
            <span className="italic font-light">Work</span>
          </div>
          <div className="text-gray-500 text-sm animate-pulse">
            Initializing secure connection...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar view={view} setView={setView} user={user} />
      {!firebaseEnabled && (
        <div className="alert alert-warning border-l-4 rounded-none text-center py-3 px-6">
          <p className="text-sm font-medium">
            Demo mode active. Add VITE_FIREBASE_CONFIG, VITE_APP_ID, and
            VITE_GOOGLE_API_KEY in .env to enable sync & AI.
          </p>
        </div>
      )}

      <main className="pb-20">
        {view === "feed" && <Feed user={user} setView={setView} />}
        {view === "create" && <CreateProject user={user} setView={setView} />}
        {view === "profile" && <Profile user={user} setView={setView} />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-8 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
        <p className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-3 h-3 text-black" /> GhostWork Platform
        </p>
        <p>Built for developers, by developers.</p>
      </footer>
    </div>
  );
}
