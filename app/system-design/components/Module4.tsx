'use client';

import React, { useState, useEffect } from 'react';
import Quiz from './Quiz';
import InteractiveChaosMonkey from './InteractiveChaosMonkey';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Users,
  Zap,
  AlertTriangle,
  Shield,
  Server,
  Globe,
  Clock,
  ChevronDown,
  ChevronRight,
  Activity,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Database,
  Cloud,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowDown,
  BarChart3,
  Layers,
  GitBranch,
  GitMerge,
  Radio,
  Cpu,
  HardDrive,
  Network,
  Wrench,
  BookOpen,
  Eye,
  Flame,
  CircuitBoard,
  ShieldAlert,
  Siren,
  Bug,
  Timer,
  TrendingDown,
  TriangleAlert,
  BadgeAlert,
  type LucideIcon,
} from 'lucide-react';

/* ─────────────────────────── helpers ─────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as any },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─────────────────────────────────────────────────────────────── */
/*  Sub‑section 1: Google Docs — Collaborative Editing Design     */
/* ─────────────────────────────────────────────────────────────── */

function CollaborativeEditingSVG() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto min-w-[700px] lg:min-w-0">
      <defs>
        <linearGradient id="m4-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <filter id="m4-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="700" height="340" rx="16" fill="url(#m4-bg)" />

      {/* ── User A ── */}
      <motion.g
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <rect x="30" y="40" width="140" height="70" rx="10" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="100" y="68" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">
          User A
        </text>
        <text x="100" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Insert &quot;X&quot; @ pos 3
        </text>
      </motion.g>

      {/* ── User B ── */}
      <motion.g
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <rect x="530" y="40" width="140" height="70" rx="10" fill="#3b1f3b" stroke="#e879f9" strokeWidth="1.5" />
        <text x="600" y="68" textAnchor="middle" fill="#e879f9" fontSize="13" fontWeight="bold">
          User B
        </text>
        <text x="600" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Insert &quot;Y&quot; @ pos 3
        </text>
      </motion.g>

      {/* ── Server (OT Engine) ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <rect x="255" y="130" width="190" height="70" rx="12" fill="#1a1a2e" stroke="#fbbf24" strokeWidth="2" />
        <text x="350" y="158" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold">
          OT / CRDT Engine
        </text>
        <text x="350" y="178" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Transform & Resolve
        </text>
      </motion.g>

      {/* ── Animated arrows ── */}
      {step >= 1 && (
        <motion.line
          x1="170" y1="80" x2="255" y2="155"
          stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
          markerEnd="url(#arrowBlue)"
        />
      )}
      {step >= 1 && (
        <motion.line
          x1="530" y1="80" x2="445" y2="155"
          stroke="#e879f9" strokeWidth="2" strokeDasharray="6 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        />
      )}

      {/* ── Resolved document ── */}
      {step >= 2 && (
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <rect x="230" y="230" width="240" height="80" rx="10" fill="#0f2818" stroke="#4ade80" strokeWidth="2" />
          <text x="350" y="258" textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="bold">
            ✓ Conflict Resolved
          </text>
          <text x="350" y="280" textAnchor="middle" fill="#86efac" fontSize="11">
            &quot;HELXYO&quot; — consistent on both clients
          </text>
        </motion.g>
      )}

      {step >= 3 && (
        <>
          <motion.line
            x1="350" y1="200" x2="350" y2="230"
            stroke="#4ade80" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.line
            x1="350" y1="310" x2="100" y2="310"
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.line
            x1="350" y1="310" x2="600" y2="310"
            stroke="#e879f9" strokeWidth="1" strokeDasharray="4 4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        </>
      )}

      {step >= 4 && (
        <>
          <motion.text
            x="100" y="330" textAnchor="middle" fill="#38bdf8" fontSize="10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            A sees: HELXYO ✓
          </motion.text>
          <motion.text
            x="600" y="330" textAnchor="middle" fill="#e879f9" fontSize="10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            B sees: HELXYO ✓
          </motion.text>
        </>
      )}
    </svg>
</div>
</div>
  );
}

function GoogleDocsSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  const architectureComponents = [
    {
      icon: Globe,
      title: 'API Gateway',
      desc: 'Routes HTTP & WebSocket connections. Auth, rate‑limiting, session affinity.',
      color: 'text-sky-400',
      bg: 'bg-sky-950/40',
      border: 'border-sky-700/40',
    },
    {
      icon: Radio,
      title: 'WebSocket Layer',
      desc: 'Persistent full‑duplex channels for keystroke‑level real‑time sync.',
      color: 'text-violet-400',
      bg: 'bg-violet-950/40',
      border: 'border-violet-700/40',
    },
    {
      icon: Cpu,
      title: 'OT / CRDT Engine',
      desc: 'Transforms concurrent operations or merges CRDT states for consistency.',
      color: 'text-amber-400',
      bg: 'bg-amber-950/40',
      border: 'border-amber-700/40',
    },
    {
      icon: Database,
      title: 'Document Store',
      desc: 'Versioned snapshots & operation logs. Supports undo & version history.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-700/40',
    },
    {
      icon: Users,
      title: 'Presence Service',
      desc: 'Tracks active cursors, selections, and user presence indicators.',
      color: 'text-pink-400',
      bg: 'bg-pink-950/40',
      border: 'border-pink-700/40',
    },
  ];

  const otVsCrdt = [
    { aspect: 'Model', ot: 'Transform operations against each other', crdt: 'Mathematical data structures that auto‑merge' },
    { aspect: 'Server Role', ot: 'Central arbitrator required', crdt: 'Fully decentralized / peer‑to‑peer' },
    { aspect: 'Ordering', ot: 'Requires total order from server', crdt: 'Operations commute — order irrelevant' },
    { aspect: 'Complexity', ot: 'O(n²) transform pairs can explode', crdt: 'Metadata overhead per character' },
    { aspect: 'Offline Support', ot: 'Weak — needs server round‑trip', crdt: 'Strong — merge anytime' },
    { aspect: 'Proven At', ot: 'Google Docs (Jupiter protocol)', crdt: 'Figma, Yjs, Automerge' },
    { aspect: 'Consistency', ot: 'Convergence via transformation', crdt: 'Strong eventual consistency (SEC)' },
    { aspect: 'Latency', ot: 'Low if server is nearby', crdt: 'Low — local‑first apply' },
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={0}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <FileText className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Google Docs — Collaborative Editing Design</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">How real‑time multi‑user document editing actually works</p>
        </div>
      </div>

      {/* ── Document Model ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-sky-300 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Document Model — Characters with Positional Indices
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          A document isn&apos;t stored as a flat string. Each character is a discrete object with a <strong className="text-sky-300">positional index</strong>.
          Operations are expressed as: <code className="px-2 py-0.5 rounded bg-slate-700 text-sky-300 text-sm">Insert(&apos;X&apos;, pos=3)</code> or
          <code className="px-2 py-0.5 rounded bg-slate-700 text-rose-300 text-sm ml-1">Delete(pos=5)</code>.
        </p>
        <div className="bg-slate-900/80 rounded-xl p-4 font-mono text-sm border border-slate-300/50 dark:border-slate-700/50">
          <div className="flex items-center gap-1 flex-wrap">
            {['H', 'E', 'L', 'L', 'O'].map((ch, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" as any, stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-sky-900/60 border border-sky-500/40 text-sky-300 font-bold text-lg">
                  {ch}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">pos {i}</span>
              </motion.div>
            ))}
            <span className="text-slate-600 mx-2">→</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">Each character is addressable</span>
          </div>
        </div>

        {/* Concurrency conflict illustration */}
        <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-500/20">
          <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" /> Concurrency Conflict
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            User A inserts <code className="text-sky-300">&apos;X&apos;</code> at pos 3. Simultaneously, User B inserts <code className="text-fuchsia-300">&apos;Y&apos;</code> at pos 3.
            Without conflict resolution, they&apos;d diverge:
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
            <div className="bg-slate-900/80 rounded-lg p-3 border border-sky-500/30">
              <span className="text-sky-400 text-xs block mb-1">User A&apos;s view:</span>
              H E L <span className="text-sky-400 font-bold">X</span> L O
            </div>
            <div className="bg-slate-900/80 rounded-lg p-3 border border-fuchsia-500/30">
              <span className="text-fuchsia-400 text-xs block mb-1">User B&apos;s view:</span>
              H E L <span className="text-fuchsia-400 font-bold">Y</span> L O
            </div>
          </div>
          <p className="text-xs text-red-400 mt-2">⚠ Documents diverge! We need OT or CRDTs to resolve this.</p>
        </div>
      </motion.div>

      {/* ── OT Deep Dive ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-amber-700/30 p-6 space-y-4">
        <button onClick={() => toggle('ot')} className="w-full text-left flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
            <GitMerge className="w-5 h-5" /> Operational Transformation (OT)
          </h3>
          {expanded === 'ot' ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5 text-amber-400" />}
        </button>
        <AnimatePresence>
          {expanded === 'ot' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-3"
            >
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                OT is a <strong className="text-amber-300">server‑centric</strong> algorithm. When the server receives concurrent operations,
                it <em>transforms</em> one against the other so both can be applied in sequence and converge.
              </p>
              <div className="bg-slate-900/80 rounded-xl p-4 font-mono text-sm border border-amber-700/30 space-y-2">
                <p className="text-slate-600 dark:text-slate-400">// User A: Insert(&apos;X&apos;, 3) | User B: Insert(&apos;Y&apos;, 3)</p>
                <p className="text-amber-300">// Server receives A first, transforms B:</p>
                <p className="text-slate-700 dark:text-slate-300">Transform(Insert(&apos;Y&apos;, 3), Insert(&apos;X&apos;, 3))</p>
                <p className="text-emerald-400">→ Insert(&apos;Y&apos;, 4)  // B&apos;s position shifted right</p>
                <p className="text-slate-600 dark:text-slate-400 mt-2">// Result: H E L X Y L O — same on both clients</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mt-3">
                <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-700/30">
                  <span className="text-amber-400 font-semibold block mb-1">Step 1</span>
                  <span className="text-slate-700 dark:text-slate-300">Client sends op to server</span>
                </div>
                <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-700/30">
                  <span className="text-amber-400 font-semibold block mb-1">Step 2</span>
                  <span className="text-slate-700 dark:text-slate-300">Server transforms against concurrent ops</span>
                </div>
                <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-700/30">
                  <span className="text-amber-400 font-semibold block mb-1">Step 3</span>
                  <span className="text-slate-700 dark:text-slate-300">Broadcast transformed op to all clients</span>
                </div>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-amber-950/30 border border-amber-600/20 text-sm text-slate-700 dark:text-slate-300">
                <strong className="text-amber-300">Google&apos;s Jupiter Protocol:</strong> Used in Google Docs.
                The server maintains a single linear history. Each client tracks its own revision and the server transforms
                incoming ops against any ops the client hasn&apos;t yet acknowledged. This is why you see the
                &quot;Saving...&quot; indicator — it&apos;s waiting for server acknowledgment.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── CRDT Deep Dive ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-violet-700/30 p-6 space-y-4">
        <button onClick={() => toggle('crdt')} className="w-full text-left flex items-center justify-between">
          <h3 className="text-lg font-semibold text-violet-300 flex items-center gap-2">
            <GitBranch className="w-5 h-5" /> CRDTs — Conflict‑free Replicated Data Types
          </h3>
          {expanded === 'crdt' ? <ChevronDown className="w-5 h-5 text-violet-400" /> : <ChevronRight className="w-5 h-5 text-violet-400" />}
        </button>
        <AnimatePresence>
          {expanded === 'crdt' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-3"
            >
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                CRDTs are <strong className="text-violet-300">mathematically guaranteed</strong> to converge.
                Each operation is designed to <em>commute</em> — the order of application doesn&apos;t matter.
                No central server needed.
              </p>
              <div className="bg-slate-900/80 rounded-xl p-4 text-sm border border-violet-700/30 space-y-3">
                <div>
                  <span className="text-violet-400 font-semibold">G‑Counter (Grow‑only Counter):</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Each node has its own counter. Value = sum of all. Only increments → always converges.</p>
                </div>
                <div>
                  <span className="text-violet-400 font-semibold">LWW‑Register (Last‑Writer‑Wins):</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Each write has a timestamp. Highest timestamp wins. Simple but may lose data.</p>
                </div>
                <div>
                  <span className="text-violet-400 font-semibold">RGA (Replicated Growable Array):</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Used for text. Each character has a unique ID (timestamp + nodeID). Insertions reference the predecessor ID, not a position.</p>
                </div>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-violet-950/30 border border-violet-600/20 text-sm text-slate-700 dark:text-slate-300">
                <strong className="text-violet-300">Why Figma chose CRDTs:</strong> Designers often work offline or on flaky connections.
                CRDTs let you edit locally and sync later — the math guarantees convergence. Figma uses a custom CRDT
                that&apos;s more memory‑efficient than standard approaches.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── OT vs CRDT Comparison ── */}
      <motion.div variants={fadeUp} className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" /> OT vs CRDT Comparison
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Aspect</th>
              <th className="text-left py-3 px-4 text-amber-400 font-medium">OT</th>
              <th className="text-left py-3 px-4 text-violet-400 font-medium">CRDT</th>
            </tr>
          </thead>
          <tbody>
            {otVsCrdt.map((row, i) => (
              <motion.tr
                key={row.aspect}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{row.aspect}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.ot}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.crdt}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── Architecture Components ── */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" /> System Components
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architectureComponents.map((c) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              className={`${c.bg} rounded-xl border ${c.border} p-4 hover:scale-[1.02] transition-transform`}
            >
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <h4 className={`font-semibold ${c.color}`}>{c.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Animated Conflict Resolution SVG ── */}
      <motion.div variants={fadeUp} className="mt-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" /> Animated Conflict Resolution
        </h3>
        <CollaborativeEditingSVG />
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">Animation loops every ~11s — watch the full cycle</p>
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub‑section 2: Facebook 2021 Outage                          */
/* ─────────────────────────────────────────────────────────────── */

interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'info' | 'resolved';
  icon: LucideIcon;
}

const fbTimeline: TimelineEvent[] = [
  {
    time: 'T+0min',
    title: 'Routine Maintenance Initiated',
    detail: 'Network team runs a command to assess backbone capacity between Facebook data centers. This is a standard maintenance operation.',
    severity: 'info',
    icon: Wrench,
  },
  {
    time: 'T+0min',
    title: 'Buggy Command Executes',
    detail: 'A bug in the audit tool causes it to interpret the command as "disconnect ALL backbone connections" instead of assessing them. The entire backbone network is severed.',
    severity: 'critical',
    icon: Bug,
  },
  {
    time: 'T+1min',
    title: 'DNS Withdraws BGP Routes',
    detail: 'With no backbone, DNS servers determine they cannot serve traffic and withdraw all BGP route advertisements. Facebook\'s IP blocks vanish from the global internet routing table.',
    severity: 'critical',
    icon: WifiOff,
  },
  {
    time: 'T+3min',
    title: 'Facebook Vanishes from the Internet',
    detail: 'facebook.com, instagram.com, whatsapp.com all become unreachable. DNS queries return NXDOMAIN. 3.5 billion users affected worldwide.',
    severity: 'critical',
    icon: Globe,
  },
  {
    time: 'T+10min',
    title: 'Engineers Locked Out',
    detail: 'VPNs, internal tools, badge access systems, even the internal wiki — ALL run on the same network that just went down. Engineers cannot remotely access anything.',
    severity: 'critical',
    icon: Lock,
  },
  {
    time: 'T+30min',
    title: 'Physical Break‑in with Angle Grinders',
    detail: 'Engineers physically travel to data centers. Door badge systems are down. They use ANGLE GRINDERS to cut through locked server room doors to reach the hardware.',
    severity: 'high',
    icon: Flame,
  },
  {
    time: 'T+~6hrs',
    title: 'Services Gradually Restored',
    detail: 'BGP routes re‑advertised. DNS propagation takes additional time. Full restoration takes ~6 hours. Estimated cost: ~$100M in revenue + stock decline.',
    severity: 'resolved',
    icon: CheckCircle2,
  },
];

const severityColors: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  critical: { dot: 'bg-red-500', border: 'border-red-500/40', bg: 'bg-red-950/30', text: 'text-red-400' },
  high: { dot: 'bg-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-950/30', text: 'text-orange-400' },
  medium: { dot: 'bg-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-950/30', text: 'text-amber-400' },
  info: { dot: 'bg-slate-500', border: 'border-slate-500/40', bg: 'bg-slate-800/40', text: 'text-slate-600 dark:text-slate-400' },
  resolved: { dot: 'bg-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30', text: 'text-emerald-400' },
};

function FacebookOutageSection() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={1}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <Siren className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Facebook Outage — Oct 4, 2021</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
              6 HOURS DOWN
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
              ~$100M LOST
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 font-semibold">
              3.5B USERS
            </span>
          </div>
        </div>
      </div>

      {/* ── Incident Report Header ── */}
      <motion.div variants={fadeUp} className="bg-red-950/20 rounded-2xl border border-red-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Incident Investigation Report</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          On October 4, 2021, a routine maintenance command triggered the most significant outage in Facebook&apos;s history.
          A bug in an internal audit tool caused the <strong className="text-red-300">complete disconnection of Facebook&apos;s backbone network</strong>,
          cascading into a total loss of DNS, BGP routes, and all services — including the tools engineers needed to fix it.
        </p>
      </motion.div>

      {/* ── Timeline ── */}
      <div className="relative pl-6 space-y-1">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-600 via-red-500 to-emerald-500" />

        {fbTimeline.map((ev, i) => {
          const colors = severityColors[ev.severity];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Dot */}
              <motion.div
                className={`absolute -left-6 top-5 w-[14px] h-[14px] rounded-full ${colors.dot} border-2 border-slate-900 z-10`}
                animate={ev.severity === 'critical' ? { scale: [1, 1.3, 1], boxShadow: ['0 0 0px rgba(239,68,68,0.5)', '0 0 12px rgba(239,68,68,0.8)', '0 0 0px rgba(239,68,68,0.5)'] } : {}}
                transition={ev.severity === 'critical' ? { repeat: Infinity, duration: 1.5 } : {}}
              />

              <div className={`ml-4 ${colors.bg} rounded-xl border ${colors.border} p-4 mb-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold ${colors.text}`}>{ev.time}</span>
                  <ev.icon className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-xs uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-semibold border ${colors.border}`}>
                    {ev.severity}
                  </span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold">{ev.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{ev.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Lessons Learned ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-amber-700/30 p-5 space-y-3">
        <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Lessons Learned
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Out‑of‑Band Access', desc: 'Management networks MUST be independent of production. If your fix‑it tools run on the broken system, you can\'t fix anything.', icon: Shield },
            { title: 'BGP/DNS Blast Radius', desc: 'Withdrawing all BGP routes = vanishing from the internet. Use canary deployments for network changes.', icon: Globe },
            { title: 'Physical Access Plans', desc: 'Badge systems shouldn\'t depend on the network they protect. Mechanical overrides are essential.', icon: Unlock },
            { title: 'Automation Safety', desc: 'Critical commands need dry‑run modes, rollback capabilities, and blast‑radius limits built in.', icon: ShieldAlert },
          ].map((l) => (
            <div key={l.title} className="bg-amber-950/20 rounded-lg border border-amber-700/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <l.icon className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 font-semibold text-sm">{l.title}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub‑section 3: AWS Dec 2021 Outage                           */
/* ─────────────────────────────────────────────────────────────── */

function AWSDecOutageSection() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={2}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <Cloud className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AWS US‑EAST‑1 Outage — Dec 7, 2021</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
              ~8 HOURS
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
              US-EAST-1
            </span>
          </div>
        </div>
      </div>

      {/* ── Root Cause Visualization ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-orange-700/30 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
          <Network className="w-5 h-5" /> Root Cause: Internal Network Congestion
        </h3>

        {/* Animated SVG – Network Congestion */}
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 220" className="w-full max-w-2xl mx-auto min-w-[600px] lg:min-w-0">
          <defs>
            <linearGradient id="m4-aws-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a0f00" />
              <stop offset="100%" stopColor="#1e1207" />
            </linearGradient>
          </defs>
          <rect width="600" height="220" rx="14" fill="url(#m4-aws-bg)" />

          {/* Public-facing services */}
          <rect x="30" y="20" width="120" height="50" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <text x="90" y="42" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Public APIs</text>
          <text x="90" y="56" textAnchor="middle" fill="#64748b" fontSize="9">EC2, S3, Lambda</text>

          {/* Internal network (congested) */}
          <motion.rect
            x="200" y="20" width="200" height="50" rx="8"
            fill="#451a03" stroke="#f97316" strokeWidth="2"
            animate={{ stroke: ['#f97316', '#ef4444', '#f97316'] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <text x="300" y="42" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">Internal Network</text>
          <text x="300" y="56" textAnchor="middle" fill="#fb923c" fontSize="9">⚠ CONGESTED</text>

          {/* Traffic particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`particle-${i}`}
              r="3"
              fill="#f97316"
              animate={{
                cx: [200, 250, 300, 350, 400],
                cy: [45, 40 + i * 3, 45, 50 - i * 2, 45],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: "linear" as any }}
            />
          ))}

          {/* Monitoring */}
          <motion.rect
            x="450" y="20" width="120" height="50" rx="8"
            fill="#1e0000" stroke="#ef4444" strokeWidth="1.5"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x="510" y="42" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">Monitoring</text>
          <text x="510" y="56" textAnchor="middle" fill="#fca5a5" fontSize="9">ALSO DOWN ✗</text>

          {/* Cascade arrows */}
          <line x1="150" y1="45" x2="195" y2="45" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
          <line x1="405" y1="45" x2="445" y2="45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Impact boxes */}
          {[
            { x: 60, label: 'DynamoDB', color: '#f97316' },
            { x: 210, label: 'CloudWatch', color: '#ef4444' },
            { x: 360, label: 'Lambda', color: '#ef4444' },
          ].map((svc, i) => (
            <motion.g key={svc.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              <rect x={svc.x} y="110" width="130" height="40" rx="6" fill="#1e0000" stroke={svc.color} strokeWidth="1" />
              <text x={svc.x + 65} y="130" textAnchor="middle" fill={svc.color} fontSize="10" fontWeight="bold">{svc.label}</text>
              <text x={svc.x + 65} y="142" textAnchor="middle" fill="#fca5a5" fontSize="8">DEGRADED</text>
              <line x1={svc.x + 65} y1="70" x2={svc.x + 65} y2="108" stroke={svc.color} strokeWidth="1" strokeDasharray="3 3" />
            </motion.g>
          ))}

          {/* Key insight */}
          <rect x="100" y="170" width="400" height="35" rx="8" fill="#1a0505" stroke="#ef4444" strokeWidth="1" />
          <text x="300" y="192" textAnchor="middle" fill="#fca5a5" fontSize="11">
            Monitoring ran on the same internal network → couldn&apos;t observe the failure
          </text>
        </svg>
</div>
</div>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            An automated process to scale capacity on AWS&apos;s internal network triggered unexpected behavior,
            causing <strong className="text-orange-300">massive congestion on the internal network</strong> connecting
            AWS services within US‑EAST‑1.
          </p>
          <p>
            The internal network carried not just customer traffic, but also <strong className="text-red-300">monitoring,
            control plane, and service‑to‑service communication</strong>. When it congested, AWS couldn&apos;t even
            see that there was a problem.
          </p>
        </div>
      </motion.div>

      {/* ── Key Insight ── */}
      <motion.div variants={fadeUp} className="bg-red-950/20 rounded-2xl border border-red-500/20 p-5 space-y-3">
        <h3 className="text-lg font-semibold text-red-300 flex items-center gap-2">
          <Eye className="w-5 h-5" /> The Hidden Dependency Problem
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-950/30 rounded-lg border border-red-700/20 p-3">
            <span className="text-red-400 font-semibold text-sm block mb-1">Monitoring ≠ Independent</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">CloudWatch, internal dashboards, and alerting all used the same congested network. No visibility into the outage.</p>
          </div>
          <div className="bg-red-950/30 rounded-lg border border-red-700/20 p-3">
            <span className="text-red-400 font-semibold text-sm block mb-1">Control Plane Shared Path</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">API calls to manage resources (launch instances, update configs) were also stuck in the congested network.</p>
          </div>
          <div className="bg-orange-950/30 rounded-lg border border-orange-700/20 p-3">
            <span className="text-orange-400 font-semibold text-sm block mb-1">Blast Radius of US‑EAST‑1</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">The oldest and largest AWS region. Many services have hard dependencies on it even from other regions.</p>
          </div>
          <div className="bg-emerald-950/30 rounded-lg border border-emerald-700/20 p-3">
            <span className="text-emerald-400 font-semibold text-sm block mb-1">Lesson: Independent Comms</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">Monitoring and management must use physically separate communication channels from production traffic.</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub‑section 4: AWS Kinesis Nov 2020 Outage                   */
/* ─────────────────────────────────────────────────────────────── */

function ThreadExplosionSVG() {
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setExploded((e) => !e), 3000);
    return () => clearInterval(id);
  }, []);

  const threadCount = 20;

  return (
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto min-w-[600px] lg:min-w-0">
      <defs>
        <linearGradient id="m4-kinesis-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0a1a" />
          <stop offset="100%" stopColor="#1a0a0a" />
        </linearGradient>
      </defs>
      <rect width="600" height="280" rx="14" fill="url(#m4-kinesis-bg)" />

      {/* Server box */}
      <rect x="220" y="30" width="160" height="60" rx="10" fill="#1e1b2e" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="300" y="55" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="bold">Kinesis Front‑End</text>
      <text x="300" y="72" textAnchor="middle" fill="#7c3aed" fontSize="9">Thread Pool</text>

      {/* Thread burst */}
      {Array.from({ length: threadCount }).map((_, i) => {
        const angle = (i / threadCount) * Math.PI * 2;
        const baseRadius = 50;
        const burstRadius = 110;
        const r = exploded ? burstRadius : baseRadius;
        const cx = 300 + Math.cos(angle) * r;
        const cy = 170 + Math.sin(angle) * r;
        return (
          <motion.g key={`thread-${i}`}>
            <motion.line
              x1={300}
              y1={170}
              x2={cx}
              y2={cy}
              stroke={exploded ? '#ef4444' : '#8b5cf6'}
              strokeWidth={exploded ? 1.5 : 1}
              strokeOpacity={0.6}
              animate={{
                x2: cx,
                y2: cy,
                stroke: exploded ? '#ef4444' : '#8b5cf6',
              }}
              transition={{ duration: 0.8, ease: "easeOut" as any }}
            />
            <motion.circle
              r={exploded ? 5 : 3}
              fill={exploded ? '#ef4444' : '#8b5cf6'}
              animate={{
                cx,
                cy,
                r: exploded ? 5 : 3,
                fill: exploded ? '#ef4444' : '#8b5cf6',
              }}
              transition={{ duration: 0.8, ease: "easeOut" as any }}
            />
          </motion.g>
        );
      })}

      {/* Center node */}
      <motion.circle
        cx={300} cy={170} r={12}
        animate={{
          fill: exploded ? '#ef4444' : '#8b5cf6',
          r: exploded ? 16 : 12,
        }}
        transition={{ duration: 0.5 }}
        stroke="#1e1b2e"
        strokeWidth={2}
      />

      {/* Labels */}
      <motion.text
        x={300} y={258} textAnchor="middle" fontSize="11" fontWeight="bold"
        animate={{ fill: exploded ? '#ef4444' : '#a78bfa' }}
        transition={{ duration: 0.5 }}
      >
        {exploded ? '⚠ EXCEEDED OS THREAD LIMIT — CRASH' : '✓ Normal: threads within limit'}
      </motion.text>

      {/* Thread counter */}
      <motion.text
        x={300} y={275} textAnchor="middle" fontSize="9"
        fill="#94a3b8"
      >
        {exploded ? `Threads: ~${threadCount * 500} (limit: ~10,000)` : `Threads: ~${threadCount * 200} (capacity added)`}
      </motion.text>

      {/* OS limit line */}
      {exploded && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <line x1="100" y1="130" x2="500" y2="130" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 4" />
          <text x="520" y="133" fill="#ef4444" fontSize="9">OS limit</text>
        </motion.g>
      )}
    </svg>
</div>
</div>
  );
}

function AWSKinesisSection() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={3}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <CircuitBoard className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AWS Kinesis Outage — Nov 25, 2020</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
              US-EAST-1
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
              CASCADING FAILURE
            </span>
          </div>
        </div>
      </div>

      {/* ── Root Cause ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-purple-700/30 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
          <Cpu className="w-5 h-5" /> Root Cause: OS Thread Limit Exceeded
        </h3>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="bg-purple-950/30 rounded-lg border border-purple-700/20 p-4">
            <h4 className="text-purple-300 font-semibold mb-2">Step 1: Capacity Addition</h4>
            <p>AWS added new capacity to Kinesis front‑end servers in US‑EAST‑1. Each server handles many Kinesis shards,
              with each shard requiring multiple OS threads for processing.</p>
          </div>

          <div className="bg-red-950/30 rounded-lg border border-red-700/20 p-4">
            <h4 className="text-red-300 font-semibold mb-2">Step 2: Thread Explosion</h4>
            <p>The new capacity meant each server now handled more shards → more threads. The total thread count
              <strong className="text-red-300"> exceeded the operating system&apos;s per‑process thread limit</strong>.
              Servers began crashing.</p>
          </div>

          <div className="bg-orange-950/30 rounded-lg border border-orange-700/20 p-4">
            <h4 className="text-orange-300 font-semibold mb-2">Step 3: Cache Construction Failure</h4>
            <p>When servers restarted, they needed to rebuild their metadata caches by querying other services.
              But so many servers were restarting simultaneously that the cache construction
              <strong className="text-orange-300"> created a thundering herd</strong> — overwhelming the metadata service.</p>
          </div>

          <div className="bg-red-950/30 rounded-lg border border-red-700/20 p-4">
            <h4 className="text-red-300 font-semibold mb-2">Step 4: Cascade into Dependent Services</h4>
            <p>Services that depended on Kinesis began failing:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { name: 'CloudWatch', desc: 'Monitoring & alarms' },
                { name: 'Cognito', desc: 'Authentication' },
                { name: 'Auto Scaling', desc: 'Instance management' },
                { name: 'Lambda', desc: 'Event triggers' },
                { name: 'CloudFormation', desc: 'Infrastructure as Code' },
              ].map((svc) => (
                <span key={svc.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-950/40 border border-red-700/30 text-xs">
                  <XCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-300 font-semibold">{svc.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">— {svc.desc}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Thread Explosion SVG ── */}
      <motion.div variants={fadeUp}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" /> Thread Explosion Visualization
        </h3>
        <ThreadExplosionSVG />
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">Animation alternates between normal and crash states</p>
      </motion.div>

      {/* ── Hidden Dependency Map ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" /> The Cascade Chain
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {[
            { label: 'New Capacity', color: 'bg-purple-900/40 border-purple-600/40 text-purple-300' },
            { label: '→' },
            { label: 'Thread Limit', color: 'bg-red-900/40 border-red-600/40 text-red-300' },
            { label: '→' },
            { label: 'Server Crash', color: 'bg-red-900/40 border-red-600/40 text-red-300' },
            { label: '→' },
            { label: 'Cache Stampede', color: 'bg-orange-900/40 border-orange-600/40 text-orange-300' },
            { label: '→' },
            { label: 'Kinesis Down', color: 'bg-red-900/40 border-red-600/40 text-red-300' },
            { label: '→' },
            { label: 'CloudWatch Down', color: 'bg-red-900/60 border-red-500/40 text-red-400' },
            { label: '→' },
            { label: 'Cognito Down', color: 'bg-red-900/60 border-red-500/40 text-red-400' },
            { label: '→' },
            { label: 'Auto Scaling Down', color: 'bg-red-900/60 border-red-500/40 text-red-400' },
          ].map((item, i) =>
            item.color ? (
              <motion.span
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`px-3 py-1.5 rounded-lg border font-medium ${item.color}`}
              >
                {item.label}
              </motion.span>
            ) : (
              <ArrowRight key={i} className="w-4 h-4 text-slate-600" />
            )
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub‑section 5: Design Lessons                                */
/* ─────────────────────────────────────────────────────────────── */

function DesignLessonsSection() {
  const lessons = [
    {
      icon: TrendingDown,
      title: 'Cascading Failures',
      color: 'text-red-400',
      bg: 'bg-red-950/30',
      border: 'border-red-700/30',
      points: [
        'A single component failure can propagate through dependency chains',
        'Tight coupling amplifies blast radius — one service takes down ten',
        'Positive feedback loops: failing service increases load on remaining instances → they fail too',
        'Example: Kinesis → CloudWatch → Auto Scaling → everything',
      ],
    },
    {
      icon: ShieldAlert,
      title: 'Circuit Breakers',
      color: 'text-amber-400',
      bg: 'bg-amber-950/30',
      border: 'border-amber-700/30',
      points: [
        'Stop calling a failing service after N failures — "trip" the breaker',
        'States: Closed (normal) → Open (failing, reject calls) → Half‑Open (test recovery)',
        'Prevents thundering herds and cascade propagation',
        'Libraries: Hystrix (Java), Polly (.NET), resilience4j, opossum (Node.js)',
        'Must be combined with fallback strategies (cached data, degraded mode, default response)',
      ],
    },
    {
      icon: Radio,
      title: 'Out‑of‑Band Management',
      color: 'text-sky-400',
      bg: 'bg-sky-950/30',
      border: 'border-sky-700/30',
      points: [
        'Management/monitoring channels MUST be physically independent from production',
        'If your VPN, badge system, and wiki run on the same network as production — you can\'t fix production',
        'Dedicated management network, satellite comms, or cellular backup for critical ops',
        'Facebook learned this the hard way with angle grinders',
      ],
    },
    {
      icon: Bug,
      title: 'Testing Automation Safety',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-700/30',
      points: [
        'Every automated change tool needs: dry‑run mode, blast‑radius limits, automatic rollback',
        'Canary deployments: apply to 1% → 10% → 50% → 100% with health checks between',
        'Chaos engineering: intentionally break things in controlled ways (Netflix Chaos Monkey)',
        'Game days: simulate outages regularly so teams practice recovery',
        'Pre‑commit hooks for infrastructure changes that validate safety constraints',
      ],
    },
    {
      icon: Layers,
      title: 'Dependency Awareness',
      color: 'text-violet-400',
      bg: 'bg-violet-950/30',
      border: 'border-violet-700/30',
      points: [
        'Map ALL dependencies — including hidden ones (shared networks, shared auth, shared DNS)',
        'Every service should know its critical path dependencies vs. nice‑to‑have dependencies',
        'Graceful degradation: if a non‑critical dependency fails, continue with reduced functionality',
        'Kinesis outage revealed that CloudWatch depended on Kinesis for log ingestion — a hidden critical dependency',
      ],
    },
    {
      icon: Timer,
      title: 'Recovery & Thundering Herds',
      color: 'text-pink-400',
      bg: 'bg-pink-950/30',
      border: 'border-pink-700/30',
      points: [
        'When many servers restart simultaneously, they can overwhelm shared dependencies (cache, DB)',
        'Stagger restarts with jitter — don\'t restart everything at once',
        'Cache warming should be gradual, not all‑at‑once',
        'Use exponential backoff with jitter for retries',
        'Pre‑compute and persist caches so cold starts are fast',
      ],
    },
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={4}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Design Lessons from Real Outages</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Patterns and principles learned the hard way</p>
        </div>
      </div>

      {/* ── Circuit Breaker State Machine SVG ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-amber-700/30 p-5">
        <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Circuit Breaker State Machine
        </h3>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 180" className="w-full max-w-2xl mx-auto min-w-[600px] lg:min-w-0">
          <rect width="600" height="180" rx="14" fill="#0f1219" />

          {/* Closed state */}
          <motion.rect
            x="30" y="55" width="130" height="60" rx="12"
            fill="#052e16" stroke="#22c55e" strokeWidth="2"
            animate={{ strokeOpacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x="95" y="82" textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="bold">CLOSED</text>
          <text x="95" y="100" textAnchor="middle" fill="#86efac" fontSize="9">Normal traffic</text>

          {/* Open state */}
          <motion.rect
            x="235" y="55" width="130" height="60" rx="12"
            fill="#450a0a" stroke="#ef4444" strokeWidth="2"
            animate={{ strokeOpacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <text x="300" y="82" textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="bold">OPEN</text>
          <text x="300" y="100" textAnchor="middle" fill="#fca5a5" fontSize="9">Reject all calls</text>

          {/* Half-Open state */}
          <motion.rect
            x="440" y="55" width="130" height="60" rx="12"
            fill="#1c1917" stroke="#f59e0b" strokeWidth="2"
            animate={{ strokeOpacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
          <text x="505" y="82" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold">HALF‑OPEN</text>
          <text x="505" y="100" textAnchor="middle" fill="#fde68a" fontSize="9">Test one request</text>

          {/* Arrows */}
          {/* Closed → Open */}
          <line x1="160" y1="75" x2="230" y2="75" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
          <text x="195" y="68" textAnchor="middle" fill="#f87171" fontSize="8">N failures</text>

          {/* Open → Half-Open */}
          <line x1="365" y1="75" x2="435" y2="75" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="400" y="68" textAnchor="middle" fill="#fbbf24" fontSize="8">timeout</text>

          {/* Half-Open → Closed (success) */}
          <path d="M505 120 L505 155 L95 155 L95 120" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="300" y="150" textAnchor="middle" fill="#4ade80" fontSize="8">success → reset</text>

          {/* Half-Open → Open (fail) */}
          <path d="M440 110 L375 140 L365 110" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x="400" y="140" textAnchor="middle" fill="#fca5a5" fontSize="7">fail</text>

          {/* Arrow markers */}
          <defs>
            <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
        </svg>
</div>
</div>
      </motion.div>

      {/* ── Lesson Cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.title}
            variants={fadeUp}
            className={`${lesson.bg} rounded-xl border ${lesson.border} p-5 space-y-2 hover:scale-[1.01] transition-transform`}
          >
            <div className="flex items-center gap-2">
              <lesson.icon className={`w-5 h-5 ${lesson.color}`} />
              <h4 className={`font-semibold ${lesson.color}`}>{lesson.title}</h4>
            </div>
            <ul className="space-y-1.5">
              {lesson.points.map((p, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                  <span className={`mt-1 w-1 h-1 rounded-full ${lesson.color.replace('text-', 'bg-')} flex-shrink-0`} />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Summary Checklist ── */}
      <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Resilience Engineering Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            'Circuit breakers on all external calls',
            'Out‑of‑band management network',
            'Independent monitoring infrastructure',
            'Blast‑radius limits on automation',
            'Canary deployments for infra changes',
            'Graceful degradation strategies',
            'Dependency maps (including hidden deps)',
            'Staggered restarts with jitter',
            'Chaos engineering / game days',
            'Runbooks that work when everything is down',
            'Cache warming strategies for cold starts',
            'Exponential backoff with jitter on retries',
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 py-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main Module Component                                        */
/* ─────────────────────────────────────────────────────────────── */


const moduleQuestions = [
  {
    "id": "1",
    "text": "In collaborative editing systems like Google Docs, what is the primary advantage of CRDTs over Operational Transformation (OT)?",
    "options": [
      "CRDTs require a central server to arbitrate and order all operations.",
      "CRDTs are mathematically designed to commute, meaning operations can be applied in any order without a central server, ensuring eventual consistency.",
      "CRDTs consume zero memory.",
      "CRDTs only support plain text, while OT supports images."
    ],
    "correctAnswer": 1,
    "explanation": "CRDTs (Conflict-free Replicated Data Types) use mathematical properties (commutativity) to resolve conflicts natively, allowing true decentralized peer-to-peer collaboration without a central OT server."
  },
  {
    "id": "2",
    "text": "What was the root cause that initiated the catastrophic 2021 Facebook global outage?",
    "options": [
      "A massive DDoS attack by state-sponsored hackers.",
      "A buggy maintenance command that accidentally severed the connections between Facebook's data centers, causing DNS withdrawal.",
      "A power outage at their primary Virginia data center.",
      "An expired SSL certificate on the main domain."
    ],
    "correctAnswer": 1,
    "explanation": "A routine capacity assessment command contained a bug that took down all backbone connections. This caused the DNS servers to withdraw BGP routes, erasing Facebook from the internet and locking engineers out of their own network."
  },
  {
    "id": "3",
    "text": "What is a \"Cascading Failure\"?",
    "options": [
      "When a CSS stylesheet fails to load properly.",
      "When the failure of one component increases the load on other components, causing them to overload and fail sequentially in a domino effect.",
      "When a database transaction is rolled back.",
      "A specific AWS feature for scaling down instances."
    ],
    "correctAnswer": 1,
    "explanation": "A cascading failure occurs when a small failure (like one node crashing) shifts its traffic to remaining nodes, which then become overloaded and crash, eventually taking down the entire system."
  }
];

export default function Module4() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* ── Module Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Module 4
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
            Real‑World Cases &amp; Outages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Learn from the most dramatic system failures in tech history — and the engineering
            principles that prevent them.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Google Docs Design</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Siren className="w-3 h-3 text-red-400" /> Facebook 2021</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Cloud className="w-3 h-3 text-orange-400" /> AWS Dec 2021</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CircuitBoard className="w-3 h-3 text-purple-400" /> AWS Kinesis 2020</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Design Lessons</span>
          </div>
        </motion.header>

        {/* ── Sections ── */}
        <GoogleDocsSection />

        <div className="border-t border-red-900/30" />

        <FacebookOutageSection />

        <div className="border-t border-orange-900/30" />

        <AWSDecOutageSection />

        <div className="border-t border-purple-900/30" />

        <AWSKinesisSection />

        <div className="border-t border-emerald-900/30" />

        <DesignLessonsSection />

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-10 pb-6 space-y-2"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Module 4 — Real‑World Cases &amp; Outages • System Design Learning Series
          </p>
          <p className="text-xs text-slate-600">
            Sources: Facebook Engineering Blog, AWS Post‑Mortem Reports, Figma Engineering
          </p>
        </motion.footer>
      </div>
    

      {/* Module Quiz */}
      <Quiz title="Real-World Outages & Edge Cases" questions={moduleQuestions} />
    </div>
  );
}
