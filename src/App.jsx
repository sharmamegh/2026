import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
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
  X
} from 'lucide-react';

// --- Configuration Helpers ---
const safeParseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Invalid JSON provided to VITE_FIREBASE_CONFIG.', error);
    return null;
  }
};

const firebaseConfig = safeParseJson(import.meta.env.VITE_FIREBASE_CONFIG);
const firebaseEnabled = Boolean(firebaseConfig);
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
const auth = firebaseEnabled ? getAuth(app) : null;
const db = firebaseEnabled ? getFirestore(app) : null;
const appId = import.meta.env.VITE_APP_ID || 'demo-app-id';

// --- API Configuration ---
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
const aiEnabled = Boolean(apiKey);
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;

// --- Demo Mode (runs when Firebase config is missing) ---
const demoUser = { uid: 'demo-user', displayName: 'Demo Developer' };
const demoProjects = [
  {
    id: 'demo-1',
    title: 'Resilient Event Grid',
    role: 'Platform Engineer',
    challenge: 'Move 1M TPS with strict SLOs across regions.',
    solution: 'Event mesh over Kafka with idempotent workers and circuit-breakers.',
    impact: 'Cut p99 latency from 320ms to 95ms while halving incident volume.',
    techStack: ['Go', 'Kafka', 'Postgres', 'Linkerd'],
    redactionLevel: 'high',
    userName: 'Demo Developer',
    vouches: 18
  },
  {
    id: 'demo-2',
    title: 'Zero-Trust Feature Flags',
    role: 'Security Engineer',
    challenge: 'Ship flags without exposing tenant data.',
    solution: 'Policy-enforced edge SDK with signed payloads and short-lived tokens.',
    impact: 'Blocked 96% of invalid rollouts pre-prod and sped approvals by 40%.',
    techStack: ['Node.js', 'Redis', 'Open Policy Agent'],
    redactionLevel: 'medium',
    userName: 'Demo Developer',
    vouches: 9
  },
  {
    id: 'demo-3',
    title: 'Adaptive Retrieval Layer',
    role: 'ML Engineer',
    challenge: 'Keep LLM grounding fresh without hot-patching.',
    solution: 'Hybrid vector + keyword index with TTL-driven freshness lanes.',
    impact: 'Raised factuality scores by 21% and reduced refresh costs by 30%.',
    techStack: ['Python', 'Elasticsearch', 'Redis', 'gRPC'],
    redactionLevel: 'top-secret',
    userName: 'Demo Developer',
    vouches: 13
  }
];

// --- AI Helpers ---

// 1. Smart Draft (Existing)
const generateProjectDetails = async (rawText) => {
  if (!aiEnabled) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
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
              - sensitivity: Suggest 'medium', 'high', or 'top-secret' based on complexity.`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this project draft for potential NDA breaches or PII. 
              Look for specific company names, internal project codenames, leaked credentials, or specific IP addresses.
              Context: ${JSON.stringify(formData)}
              
              Return strictly valid JSON:
              {
                "safe": boolean,
                "warnings": [string] (list of specific potential issues, or empty if safe)
              }`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Rewrite this impact statement to be more quantitative, professional, and executive-friendly.
              Context - Challenge: ${challenge}, Solution: ${solution}.
              Current Impact: ${currentImpact}.
              
              Return strictly valid JSON: { "enhancedImpact": "string" }`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );
    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text).enhancedImpact;
  } catch (error) {
    return currentImpact;
  }
};

// 4. Architect Chat (New)
const queryArchitect = async (history, projectContext, userQuestion) => {
  if (!aiEnabled) return 'Architect offline. Add VITE_GOOGLE_API_KEY to enable chat.';
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the "Ghost Architect" of this project. 
              Project Data: ${JSON.stringify(projectContext)}.
              
              Answer the user's question based ONLY on the provided data.
              - Do NOT invent implementation details not present in the JSON.
              - If the user asks for code or specific details not listed, say "That detail is classified."
              - Maintain a professional, slightly mysterious "operative" persona.
              - Keep answers short (max 2 sentences).
              
              Chat History: ${JSON.stringify(history)}
              User Question: ${userQuestion}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connection failed.';
  } catch (error) {
    console.error('Architect chat failed', error);
    return 'Secure link unstable. Try again.';
  }
};

// --- Components ---

// 1. Navigation
const Navbar = ({ view, setView, user }) => (
  <nav className="bg-white border-b-2 border-black sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('feed')}>
        <div className="bg-black text-white p-1 rounded-sm">
          <Shield className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-black">Ghost<span className="italic">Work</span></span>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setView('feed')}
          className={`text-sm font-bold transition-colors ${view === 'feed' ? 'underline decoration-2 underline-offset-4' : 'text-zinc-500 hover:text-black'}`}
        >
          Discover
        </button>
        <button 
          onClick={() => setView('create')}
          className={`text-sm font-bold transition-colors ${view === 'create' ? 'underline decoration-2 underline-offset-4' : 'text-zinc-500 hover:text-black'}`}
        >
          Share Work
        </button>
        <button 
          onClick={() => setView('profile')}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${view === 'profile' ? 'underline decoration-2 underline-offset-4' : 'text-zinc-500 hover:text-black'}`}
        >
          {user ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {user.displayName ? user.displayName.split(' ')[0] : 'Dev'}
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
  const [mode, setMode] = useState('input'); 
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New State for AI Features
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    techStack: '',
    challenge: '',
    solution: '',
    impact: '',
    redactionLevel: 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAIAnalyze = async () => {
    if (!rawInput.trim()) return;
    setIsGenerating(true);
    const result = await generateProjectDetails(rawInput);
    if (result) {
      setFormData({
        title: result.title || '',
        role: result.role || '',
        techStack: result.techStack || '',
        challenge: result.challenge || '',
        solution: result.solution || '',
        impact: result.impact || '',
        redactionLevel: result.sensitivity || 'high'
      });
      setMode('review');
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
    const betterImpact = await enhanceProjectImpact(formData.challenge, formData.solution, formData.impact);
    if (betterImpact) {
      setFormData(prev => ({ ...prev, impact: betterImpact }));
    }
    setIsEnhancing(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!db) {
      console.warn('Firestore is not configured; running in demo mode.');
      setView('feed');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), {
        ...formData,
        userId: user.uid,
        userName: user.displayName || 'Anonymous Developer',
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
        vouches: 0,
        createdAt: serverTimestamp(),
        views: 0
      });
      setView('feed');
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-black mb-3">
          Document Your Architecture
        </h2>
        <p className="text-zinc-600 max-w-lg mx-auto">
          Share your engineering wins without breaching NDAs. <br/>
          Use our AI to automatically abstract sensitive details.
        </p>
      </div>

      {mode === 'input' && (
        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg">Smart Draft</h3>
          </div>
          
          <textarea 
            rows={6}
            placeholder="e.g. I worked at [Big Bank] building a trading engine in Rust that handled 1M TPS. We had to fork Kafka to handle the load..."
            className="w-full bg-zinc-50 border-2 border-black p-4 text-black placeholder:text-zinc-400 focus:outline-none focus:bg-white mb-6 resize-none font-mono text-sm"
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-bold uppercase">
              * Your input is processed securely
            </span>
            <button 
              onClick={handleAIAnalyze}
              disabled={!rawInput || isGenerating}
              className="bg-black hover:bg-zinc-800 text-white px-6 py-3 font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Abstracting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Process Description
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {mode === 'review' && (
        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <FileText className="w-5 h-5" /> Review Draft
            </h3>
            <div className="flex gap-4 items-center">
               <button 
                  onClick={handleAudit}
                  disabled={isAuditing}
                  className={`text-xs font-bold flex items-center gap-1 px-3 py-1 border border-black hover:bg-zinc-100 ${auditResult?.safe === false ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                >
                  {isAuditing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <ShieldAlert className="w-3 h-3"/>}
                  {auditResult ? (auditResult.safe ? 'Draft Secure' : 'Risks Detected') : 'Audit Security'}
               </button>
               <button 
                onClick={() => setMode('input')}
                className="text-xs font-bold underline hover:text-zinc-600"
              >
                Start Over
              </button>
            </div>
          </div>
          
          {/* Audit Warnings */}
          {auditResult && !auditResult.safe && (
             <div className="mb-6 bg-red-50 border border-red-200 p-4">
                <h4 className="text-red-700 font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Potential NDA Breaches:</h4>
                <ul className="list-disc list-inside text-xs text-red-600 font-mono">
                   {auditResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
             </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Project Title</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-black p-2 font-bold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Your Role</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-black p-2 font-bold"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Technical Challenge</label>
              <textarea 
                rows={2}
                className="w-full bg-white border-2 border-black p-2 text-sm"
                value={formData.challenge}
                onChange={e => setFormData({...formData, challenge: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Architecture Solution</label>
              <textarea 
                rows={2}
                className="w-full bg-white border-2 border-black p-2 text-sm"
                value={formData.solution}
                onChange={e => setFormData({...formData, solution: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-zinc-500 uppercase">Impact</label>
                  <button 
                    onClick={handleEnhanceImpact}
                    disabled={isEnhancing || !formData.impact}
                    className="text-[10px] font-bold text-purple-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    {isEnhancing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                    Enhance
                  </button>
                </div>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-black p-2 text-sm pr-8"
                  value={formData.impact}
                  onChange={e => setFormData({...formData, impact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tech Stack</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-black p-2 text-sm"
                  value={formData.techStack}
                  onChange={e => setFormData({...formData, techStack: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sensitivity Level</label>
              <div className="flex gap-2">
                {['medium', 'high', 'top-secret'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({...formData, redactionLevel: level})}
                    className={`px-3 py-1 text-xs font-bold border-2 border-black transition-all ${
                      formData.redactionLevel === level 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black hover:bg-zinc-100'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !firebaseEnabled}
              className="bg-black hover:bg-zinc-800 text-white px-8 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : firebaseEnabled ? 'Publish Project' : 'Connect Firebase to Publish'} <ArrowRight className="w-4 h-4" />
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
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleVouch = async () => {
    if (!user || isVouched || !db) return;
    setIsVouched(true);
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'projects', project.id);
    await updateDoc(ref, {
      vouches: increment(1)
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    const architectResponse = await queryArchitect(chatHistory, project, userMsg);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: architectResponse }]);
    setIsChatting(false);
  };

  return (
    <div className="bg-white border-2 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group flex flex-col h-full relative">
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-black leading-tight mb-1">{project.title}</h3>
          <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
            <span>{project.userName}</span>
            <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
            <span className="text-black">{project.role}</span>
          </div>
        </div>
        <div className="bg-zinc-100 border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {project.redactionLevel === 'top-secret' ? 'Restricted' : project.redactionLevel === 'high' ? 'Private' : 'Confidential'}
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-grow">
        <div>
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Challenge</h4>
          <p className="text-black text-sm leading-relaxed">{project.challenge}</p>
        </div>
        
        <div>
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Solution</h4>
          <p className="text-black text-sm leading-relaxed">{project.solution}</p>
        </div>

        <div className="bg-zinc-50 p-2 border border-zinc-200">
           <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Key Impact</h4>
           <div className="text-black font-bold text-sm">
              {project.impact}
           </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack && project.techStack.map((tech, i) => (
            <span key={i} className="text-[10px] bg-white text-black px-2 py-1 border border-zinc-300 font-bold">
              {tech}
            </span>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-black border-dashed">
          <div className="flex gap-2">
             <button 
               onClick={handleVouch}
               disabled={!user || isVouched}
               className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all ${
                 isVouched 
                 ? 'text-green-600 bg-green-50' 
                 : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
               }`}
             >
               <ThumbsUp className={`w-3.5 h-3.5 ${isVouched ? 'fill-green-600' : ''}`} />
               <span>{project.vouches || 0}</span>
             </button>
             
             <button 
               onClick={() => setIsChatOpen(!isChatOpen)}
               className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all ${
                 isChatOpen ? 'bg-black text-white' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
               }`}
             >
               <MessageSquare className="w-3.5 h-3.5" />
               <span>Ask Architect</span>
             </button>
          </div>
          
          <button className="text-zinc-400 hover:text-black transition-colors">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat Interface */}
        {isChatOpen && (
          <div className="mt-4 border-2 border-black bg-zinc-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Secure Uplink: Ghost Architect</span>
                <button onClick={() => setIsChatOpen(false)}><X className="w-3 h-3 hover:text-red-500"/></button>
             </div>
             
             <div className="h-32 overflow-y-auto mb-2 space-y-2 border border-zinc-200 bg-white p-2">
                {chatHistory.length === 0 && (
                   <p className="text-xs text-zinc-400 italic text-center mt-8">Ask about the stack or constraints...</p>
                )}
                {chatHistory.map((msg, idx) => (
                   <div key={idx} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-zinc-100 ml-4' : 'bg-blue-50 text-blue-800 mr-4'}`}>
                      {msg.text}
                   </div>
                ))}
                {isChatting && <div className="text-xs text-zinc-400 italic">Typing...</div>}
             </div>

             <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Is this scalable?"
                  className="flex-1 bg-white border border-zinc-300 px-2 py-1 text-xs focus:outline-none focus:border-black"
                />
                <button type="submit" disabled={isChatting} className="bg-black text-white px-2 py-1 hover:bg-zinc-800 disabled:opacity-50">
                   <Send className="w-3 h-3" />
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
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'projects'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b-2 border-black pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Project Feed</h1>
          <p className="text-zinc-600">
            Real-world architecture patterns, anonymized for sharing.
          </p>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm mt-4 md:mt-0">
           <div className="text-right">
              <div className="text-3xl font-bold text-black">{projects.length}</div>
              <div className="text-zinc-400 font-bold uppercase text-xs">Projects</div>
           </div>
           <div className="text-right">
              <div className="text-3xl font-bold text-black">
                {projects.reduce((acc, curr) => acc + (curr.vouches || 0), 0)}
              </div>
              <div className="text-zinc-400 font-bold uppercase text-xs">Validations</div>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-lg">
          <Code className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No projects yet</h3>
          <p className="text-zinc-500 mb-6">Be the first to share your architecture.</p>
          <button 
            onClick={() => setView('create')}
            className="bg-black text-white px-6 py-3 font-bold rounded hover:bg-zinc-800 transition-colors"
          >
            Start Draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
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
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myData = allData.filter(p => p.userId === user.uid);
      setMyProjects(myData);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
           <Lock className="w-6 h-6 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Private Access</h2>
        <p className="text-zinc-500 max-w-md mb-8">
          Please wait while we secure your connection...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
       <div className="bg-white border-2 border-black p-8 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-24 h-24 border-2 border-black bg-zinc-100 flex items-center justify-center overflow-hidden rounded-full">
             {user.photoURL ? <img src={user.photoURL} className="w-full h-full grayscale" /> : <User className="w-10 h-10 text-zinc-400" />}
          </div>
          <div className="flex-1 text-center md:text-left">
             <div className="inline-block bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 font-bold uppercase mb-2 rounded-full">Verified Developer</div>
             <h2 className="text-3xl font-bold text-black mb-1">{user.displayName || 'Developer'}</h2>
             <div className="text-zinc-500 text-sm mb-6">Senior Member • Joined 2024</div>
             
             <div className="flex gap-6 justify-center md:justify-start">
                <div>
                   <span className="block font-bold text-black text-xl">{myProjects.length}</span>
                   <span className="text-zinc-500 text-xs font-bold uppercase">Shared</span>
                </div>
                <div>
                   <span className="block font-bold text-black text-xl">
                     {myProjects.reduce((acc, curr) => acc + (curr.vouches || 0), 0)}
                   </span>
                   <span className="text-zinc-500 text-xs font-bold uppercase">Validations</span>
                </div>
             </div>
          </div>
       </div>

       <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
         <h3 className="text-xl font-bold text-black flex items-center gap-2">
           <Database className="w-5 h-5" /> Your Portfolio
         </h3>
         <button onClick={() => setView('create')} className="text-sm font-bold underline">Add New</button>
       </div>
       
       {myProjects.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 border border-zinc-200 rounded-lg">
             <p className="text-zinc-500 mb-4 font-medium">You haven't documented any work yet.</p>
             <button onClick={() => setView('create')} className="text-black hover:text-zinc-600 font-bold underline">Create your first entry</button>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map(project => (
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
  const [view, setView] = useState('feed'); // 'feed', 'create', 'profile'
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
           const codeNames = ['Dev', 'Engineer', 'Architect', 'Builder', 'Maker'];
           const randomName = `${codeNames[Math.floor(Math.random() * codeNames.length)]}_${Math.floor(Math.random() * 999)}`;
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
      <div className="min-h-screen bg-white flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-6 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-black font-bold tracking-widest text-sm uppercase animate-pulse">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      <Navbar view={view} setView={setView} user={user} />
      {!firebaseEnabled && (
        <div className="bg-amber-50 border-b-2 border-black text-sm text-amber-800 text-center py-3 px-4">
          Demo mode active. Add VITE_FIREBASE_CONFIG, VITE_APP_ID, and VITE_GOOGLE_API_KEY in .env to enable sync & AI.
        </div>
      )}
      
      <main className="pb-20">
        {view === 'feed' && <Feed user={user} setView={setView} />}
        {view === 'create' && <CreateProject user={user} setView={setView} />}
        {view === 'profile' && <Profile user={user} setView={setView} />}
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