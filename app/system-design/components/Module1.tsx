'use client';

import React, { useState } from 'react';
import Quiz from './Quiz';
import InteractiveLoadBalancer from './InteractiveLoadBalancer';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Server,
  Network,
  GitBranch,
  Shield,
  Zap,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Monitor,
  Database,
  Cloud,
  Box,
  Activity,
  RefreshCw,
  Send,
  Filter,
  Radio,
  Hexagon,
  Globe,
  AlertTriangle,
  TrendingUp,
  Users,
  Lock,
  Eye,
  Settings,
  Cpu,
  HardDrive,
  Workflow,
  MessageSquare,
  LayoutGrid,
  Target,
  CircleDot,
  Blocks,
  Cable,
  ArrowUpDown,
  Scale,
  Timer,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  Code2,
  Rocket,
  Puzzle,
  Binary,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Shared animation variants
   ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as any },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as any },
  },
};

const slideIn = (dir: 'left' | 'right' = 'left') => ({
  hidden: { opacity: 0, x: dir === 'left' ? -40 : 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
});

/* ─────────────────────────────────────────────
   Section wrapper
   ───────────────────────────────────────────── */
interface SectionProps {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ id, number, title, icon, children }: SectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeUp}
      className="mb-16"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start sm:items-center gap-3 sm:gap-4 group cursor-pointer"
      >
        <span className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-slate-900 dark:text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          {number}
        </span>
        <span className="text-slate-900 dark:text-white">{icon}</span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors flex-1 text-left mt-1 sm:mt-0">
          {title}
        </h2>
        {open ? (
          <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        )}
      </button>
      <div className="mt-4 ml-0 md:ml-16 border-l-0 md:border-l-2 border-slate-300 dark:border-slate-700 pl-0 md:pl-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────
   Reusable card
   ───────────────────────────────────────────── */
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-300/60 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Concept badge
   ───────────────────────────────────────────── */
function Badge({
  children,
  color = 'blue',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    green: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
    amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    red: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    pink: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colors[color] || colors.blue}`}
    >
      {children}
    </span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 1 – Design vs Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DesignVsArchitecture() {
  return (
    <Section
      id="design-vs-architecture"
      number={1}
      title="What is Design vs Architecture"
      icon={<Lightbulb className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        Before building any system, understanding the distinction between <strong className="text-slate-900 dark:text-white">software design</strong> and{' '}
        <strong className="text-slate-900 dark:text-white">software architecture</strong> is foundational. They operate at different levels of abstraction and address
        different concerns—yet both are essential for creating robust systems.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={slideIn('left')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-blue-500/30 h-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <Code2 className="w-8 h-8 text-blue-400 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Software Design</h3>
              <Badge color="blue">Tactical</Badge>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Software design is <em>tactical</em>—it focuses on the low-level, component-level decisions. It answers:
              &quot;How should this specific module work?&quot;
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" /> Class diagrams, method signatures, interfaces</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" /> Design patterns (Singleton, Factory, Observer)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" /> Data structures and algorithm choices</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" /> Error handling and validation logic</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" /> Module-level responsibilities (SOLID principles)</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={slideIn('right')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-purple-500/30 h-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <Blocks className="w-8 h-8 text-purple-400 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Software Architecture</h3>
              <Badge color="purple">Strategic</Badge>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Software architecture is <em>strategic</em>—it addresses the high-level structure, major components, and their interactions.
              It answers: &quot;How should the entire system be organized?&quot;
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 shrink-0" /> System decomposition into subsystems</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 shrink-0" /> Communication protocols between services</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 shrink-0" /> Technology stack decisions</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 shrink-0" /> Quality attribute trade-offs (perf vs security)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 shrink-0" /> Deployment topology and infrastructure</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Visual: Scale diagram */}
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Abstraction Spectrum</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 120" className="w-full min-w-[800px] lg:min-w-0" aria-label="Abstraction spectrum from code to architecture">
          <defs>
            <linearGradient id="spectrumGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect x="50" y="50" width="700" height="16" rx="8" fill="url(#spectrumGrad)" opacity="0.3" />
          <motion.rect
            x="50" y="50" width="700" height="16" rx="8" fill="url(#spectrumGrad)"
            initial={{ width: 0 }} whileInView={{ width: 700 }}
            transition={{ duration: 1.5, ease: "easeOut" as any }}
            viewport={{ once: true }}
          />
          {/* Labels */}
          <text x="50" y="40" fill="#93c5fd" fontSize="13" fontWeight="600">Code</text>
          <text x="180" y="40" fill="#a78bfa" fontSize="13" fontWeight="600">Design Patterns</text>
          <text x="370" y="40" fill="#c084fc" fontSize="13" fontWeight="600">Components</text>
          <text x="530" y="40" fill="#e879f9" fontSize="13" fontWeight="600">Subsystems</text>
          <text x="660" y="40" fill="#f472b6" fontSize="13" fontWeight="600">Architecture</text>
          {/* Markers */}
          {[50, 200, 390, 560, 700].map((x, i) => (
            <circle key={i} cx={x} cy="58" r="6" fill="white" stroke="#1e293b" strokeWidth="2" />
          ))}
          <text x="50" y="95" fill="#94a3b8" fontSize="11">Low-level / Tactical</text>
          <text x="610" y="95" fill="#94a3b8" fontSize="11">High-level / Strategic</text>
        </svg>
</div>
</div>
      </Card>

      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          <Lightbulb className="inline w-5 h-5 text-amber-400 mr-2" />
          Why Design Before Building?
        </h4>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Fixing an architectural flaw after deployment can cost <strong className="text-red-400">100x more</strong> than catching it in the design
          phase. Architecture decisions are the hardest to reverse—they affect every module, every team, and every deployment.
          Good architecture enables good design; bad architecture makes even the best design patterns futile. The earlier you invest in
          thoughtful design, the lower your technical debt and the faster your team can iterate.
        </p>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 2 – Waterfall Model
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function WaterfallModel() {
  const steps = [
    { label: 'Requirements', color: '#3b82f6', icon: '📋', desc: 'Gather and document all system requirements upfront. Stakeholders define what the system must do.' },
    { label: 'Design', color: '#8b5cf6', icon: '📐', desc: 'Create system architecture & detailed design documents. Define data models, interfaces, and algorithms.' },
    { label: 'Implementation', color: '#06b6d4', icon: '💻', desc: 'Write code based on design specs. Each module is built according to the design documents.' },
    { label: 'Testing', color: '#10b981', icon: '🧪', desc: 'Verify against requirements. Unit, integration, system, and acceptance testing phases.' },
    { label: 'Deployment', color: '#f59e0b', icon: '🚀', desc: 'Release to production. The system goes live for end users.' },
    { label: 'Maintenance', color: '#ef4444', icon: '🔧', desc: 'Bug fixes, patches, and enhancements after deployment.' },
  ];

  return (
    <Section
      id="waterfall"
      number={2}
      title="Waterfall Model"
      icon={<ArrowDown className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The <strong className="text-slate-900 dark:text-white">Waterfall Model</strong> (introduced by Winston Royce, 1970) is a <em>sequential, phase-driven</em>{' '}
        approach. Each phase must be completed before the next begins—like water flowing downward, it doesn&apos;t flow back up.
        While often criticized for rigidity, it remains foundational knowledge and is still used in regulated industries (healthcare,
        aerospace, government) where requirements are well-defined and changes are costly.
      </p>

      {/* Animated Waterfall SVG */}
      <Card className="mb-6 overflow-x-auto">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Waterfall Flow Diagram</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 900 500" className="w-full min-w-[600px]" aria-label="Waterfall model steps flowing downward">
          <defs>
            <filter id="dropShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>
          {steps.map((step, i) => {
            const x = 60 + i * 130;
            const y = 40 + i * 72;
            return (
              <g key={step.label}>
                {/* Connection arrow */}
                {i < steps.length - 1 && (
                  <motion.line
                    x1={x + 110} y1={y + 45}
                    x2={x + 140} y2={y + 82}
                    stroke={step.color} strokeWidth="3" strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ delay: i * 0.2 + 0.3, duration: 0.4 }}
                    viewport={{ once: true }}
                  />
                )}
                {/* Step box */}
                <motion.g
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <rect
                    x={x} y={y} width="120" height="50" rx="10"
                    fill={step.color} opacity="0.15" stroke={step.color} strokeWidth="2"
                    filter="url(#dropShadow)"
                  />
                  <text x={x + 60} y={y + 20} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {step.icon} {step.label}
                  </text>
                  <text x={x + 60} y={y + 38} textAnchor="middle" fill="#94a3b8" fontSize="9">
                    Phase {i + 1}
                  </text>
                </motion.g>
              </g>
            );
          })}
          {/* Arrow marker */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
</div>
</div>
      </Card>

      {/* Step details */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {steps.map((step, i) => (
          <motion.div key={step.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Card className="h-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-2xl">{step.icon}</span>
                <h5 className="text-slate-900 dark:text-white font-semibold">{step.label}</h5>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{step.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Advantages</h5>
            <ul className="text-slate-700 dark:text-slate-300 space-y-1 text-sm">
              <li>• Simple, easy to understand and manage</li>
              <li>• Well-documented with clear milestones</li>
              <li>• Works for small projects with fixed requirements</li>
              <li>• Easy to measure progress (phase completion)</li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Disadvantages</h5>
            <ul className="text-slate-700 dark:text-slate-300 space-y-1 text-sm">
              <li>• No working software until late in the process</li>
              <li>• Very difficult to accommodate changes</li>
              <li>• High risk—problems discovered late are expensive</li>
              <li>• Poor fit for complex, evolving requirements</li>
            </ul>
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 3 – Agile Methods
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AgileMethods() {
  const principles = [
    {
      title: 'Individuals & Interactions',
      over: 'Processes & Tools',
      desc: 'Value people and communication over rigid processes. Face-to-face conversation is the most efficient form of communication.',
      icon: <Users className="w-8 h-8 text-blue-400 shrink-0" />,
    },
    {
      title: 'Working Software',
      over: 'Comprehensive Documentation',
      desc: 'Deliver functional software frequently. Documentation is important but working code is the primary measure of progress.',
      icon: <Code2 className="w-8 h-8 text-green-400 shrink-0" />,
    },
    {
      title: 'Customer Collaboration',
      over: 'Contract Negotiation',
      desc: 'Engage customers continuously. Requirements evolve through collaboration, not rigid contracts.',
      icon: <MessageSquare className="w-8 h-8 text-purple-400 shrink-0" />,
    },
    {
      title: 'Responding to Change',
      over: 'Following a Plan',
      desc: 'Welcome changing requirements, even late in development. Agile processes harness change for competitive advantage.',
      icon: <RefreshCw className="w-8 h-8 text-amber-400 shrink-0" />,
    },
  ];

  return (
    <Section
      id="agile"
      number={3}
      title="Agile Methods"
      icon={<RefreshCw className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The <strong className="text-slate-900 dark:text-white">Agile Manifesto</strong> (2001) was created by 17 software practitioners who sought an alternative to
        heavyweight, documentation-driven processes. Agile is not a single methodology—it&apos;s a <em>mindset</em> expressed through
        frameworks like Scrum, Kanban, and XP. Architecture in Agile is <strong className="text-slate-900 dark:text-white">evolutionary</strong>: it emerges
        incrementally rather than being fully defined upfront.
      </p>

      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">The Four Agile Manifesto Values</h4>
      <motion.div className="grid md:grid-cols-2 gap-6 mb-8" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {principles.map((p, i) => (
          <motion.div key={p.title} variants={fadeUp} custom={i}>
            <Card className="h-full hover:border-blue-500/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">{p.icon}</div>
                <div>
                  <h5 className="text-slate-900 dark:text-white font-bold text-lg">{p.title}</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">over {p.over}</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{p.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Agile Iteration SVG */}
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Agile Iterative Cycle</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 300" className="w-full max-w-xl mx-auto min-w-[600px] lg:min-w-0" aria-label="Agile iterative cycle diagram">
          {/* Center */}
          <motion.circle cx="300" cy="150" r="40" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
          />
          <text x="300" y="145" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Working</text>
          <text x="300" y="160" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Software</text>

          {/* Cycle nodes */}
          {[
            { label: 'Plan', angle: -90, color: '#3b82f6' },
            { label: 'Design', angle: -18, color: '#8b5cf6' },
            { label: 'Build', angle: 54, color: '#06b6d4' },
            { label: 'Test', angle: 126, color: '#10b981' },
            { label: 'Review', angle: 198, color: '#f59e0b' },
          ].map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const cx = 300 + Math.cos(rad) * 120;
            const cy = 150 + Math.sin(rad) * 120;
            return (
              <g key={node.label}>
                <motion.circle
                  cx={cx} cy={cy} r="30" fill={node.color} opacity="0.15"
                  stroke={node.color} strokeWidth="2"
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.15 + 0.2 }}
                  viewport={{ once: true }}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                  {node.label}
                </text>
                {/* Arrow to next */}
                {(() => {
                  const nextAngle = ([-90, -18, 54, 126, 198][(i + 1) % 5] * Math.PI) / 180;
                  const nx = 300 + Math.cos(nextAngle) * 120;
                  const ny = 150 + Math.sin(nextAngle) * 120;
                  const mx = (cx + nx) / 2;
                  const my = (cy + ny) / 2;
                  return (
                    <motion.line
                      x1={cx + Math.cos(Math.atan2(ny - cy, nx - cx)) * 32}
                      y1={cy + Math.sin(Math.atan2(ny - cy, nx - cx)) * 32}
                      x2={nx - Math.cos(Math.atan2(ny - cy, nx - cx)) * 32}
                      y2={ny - Math.sin(Math.atan2(ny - cy, nx - cx)) * 32}
                      stroke={node.color} strokeWidth="2" opacity="0.5"
                      strokeDasharray="6 4"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      transition={{ delay: i * 0.15 + 0.4 }}
                      viewport={{ once: true }}
                    />
                  );
                })()}
              </g>
            );
          })}
          {/* Sprint label */}
          <text x="300" y="290" textAnchor="middle" fill="#94a3b8" fontSize="12">
            Each sprint: 1-4 weeks → Shippable increment
          </text>
        </svg>
</div>
</div>
      </Card>

      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          <Lightbulb className="inline w-5 h-5 text-amber-400 mr-2" />
          Architecture in Agile: Evolutionary Design
        </h4>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          In Agile, architecture is not a &quot;Big Design Up Front&quot; (BDUF). Instead, it evolves over iterations. The team starts with a
          <strong className="text-slate-900 dark:text-white"> minimal architecture</strong> that supports the first few stories, then refactors and extends it as
          understanding grows. Key practices include: <Badge color="blue">Last Responsible Moment</Badge>{' '}
          <Badge color="purple">Emergent Design</Badge>{' '}<Badge color="green">Continuous Refactoring</Badge>{' '}
          <Badge color="amber">Architecture Spikes</Badge>. The goal is to defer decisions until you have enough information to make them well.
        </p>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 4 – Quality Attributes
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function QualityAttributes() {
  const attrs = [
    {
      name: 'Performance',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      desc: 'Response time, throughput, and resource utilization. Measured via latency (p50, p95, p99), requests/second, and CPU/memory usage.',
      metric: 'p99 < 200ms',
    },
    {
      name: 'Scalability',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/30',
      desc: 'Ability to handle growth—more users, data, or transactions—without degraded performance. Horizontal & vertical.',
      metric: '10x load → linear cost',
    },
    {
      name: 'Availability',
      icon: <Activity className="w-8 h-8" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      desc: 'System uptime percentage. Five Nines (99.999%) = only 5.26 minutes of downtime per year. Requires redundancy, failover, and health monitoring.',
      metric: '99.999% = 5.26 min/yr',
    },
    {
      name: 'Security',
      icon: <Lock className="w-8 h-8" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      desc: 'Protection against unauthorized access, data breaches, and attacks. Includes authentication, authorization, encryption, and audit logging.',
      metric: 'Zero trust + E2E encryption',
    },
    {
      name: 'Maintainability',
      icon: <Settings className="w-8 h-8" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      desc: 'Ease of modifying, fixing, and extending the system. Measured by coupling, cohesion, code complexity, and time-to-fix metrics.',
      metric: 'Low coupling, high cohesion',
    },
    {
      name: 'Reliability',
      icon: <Shield className="w-8 h-8" />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      desc: 'Probability of failure-free operation over time. Includes fault tolerance, graceful degradation, and MTBF/MTTR metrics.',
      metric: 'MTBF > 720 hrs',
    },
  ];

  return (
    <Section
      id="quality-attributes"
      number={4}
      title="Quality Attributes"
      icon={<Shield className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        Quality attributes (also called <strong className="text-slate-900 dark:text-white">non-functional requirements</strong>) define <em>how</em> a system
        performs its functions, not <em>what</em> it does. They are the primary drivers of architectural decisions. Choosing an architecture
        is fundamentally about making trade-offs between competing quality attributes.
      </p>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {attrs.map((a, i) => (
          <motion.div key={a.name} variants={fadeUp} custom={i}>
            <Card className={`h-full border ${a.bg}`}>
              <div className={`${a.color} mb-3`}>{a.icon}</div>
              <h5 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{a.name}</h5>
              <Badge color={a.color.replace('text-', '').split('-')[0]}>{a.metric}</Badge>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">{a.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Five Nines breakdown */}
      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Availability Levels (The &quot;Nines&quot;)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Level</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Availability</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Downtime / Year</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Downtime / Month</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {[
                ['Two Nines', '99%', '3.65 days', '7.31 hours'],
                ['Three Nines', '99.9%', '8.77 hours', '43.83 min'],
                ['Four Nines', '99.99%', '52.60 min', '4.38 min'],
                ['Five Nines', '99.999%', '5.26 min', '26.30 sec'],
                ['Six Nines', '99.9999%', '31.56 sec', '2.63 sec'],
              ].map(([level, avail, yr, mo], i) => (
                <tr key={level} className={`border-b border-slate-200 dark:border-slate-800 ${i === 3 ? 'bg-blue-500/10' : ''}`}>
                  <td className="py-2 font-medium text-slate-900 dark:text-white">{level}</td>
                  <td className="py-2">{avail}</td>
                  <td className="py-2">{yr}</td>
                  <td className="py-2">{mo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
          ★ Five Nines is highlighted — the gold standard for mission-critical systems (banking, healthcare, telecom).
        </p>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 5 – Architectural Structures
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ArchitecturalStructures() {
  const categories = [
    {
      title: 'Static / Module Structures',
      color: 'blue',
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      desc: 'Focus on how the system is divided into implementation units (modules) and their compile-time relationships.',
      items: [
        { name: 'Decomposition', detail: 'Breaking the system into modules based on functionality' },
        { name: 'Layered', detail: 'Organizing modules into horizontal layers of abstraction' },
        { name: 'Class / Generalization', detail: 'Inheritance and interface hierarchies (OOP)' },
        { name: 'Data Model', detail: 'Entity relationships and data schemas' },
        { name: 'Uses / Depends-On', detail: 'Which modules depend on which other modules' },
      ],
    },
    {
      title: 'Dynamic / C&C Structures',
      color: 'purple',
      icon: <Activity className="w-6 h-6 text-purple-400" />,
      desc: 'Focus on runtime behavior—how components interact and communicate during execution.',
      items: [
        { name: 'Communication', detail: 'How components exchange data (sync/async, protocols)' },
        { name: 'Concurrency', detail: 'Threads, processes, parallelism, and synchronization' },
        { name: 'Client-Server', detail: 'Request-response interactions between consumers and providers' },
        { name: 'Shared Data', detail: 'Components accessing common data repositories' },
        { name: 'Process', detail: 'Runtime processes and their interactions' },
      ],
    },
    {
      title: 'Deployment / Allocation Structures',
      color: 'green',
      icon: <Server className="w-6 h-6 text-green-400" />,
      desc: 'Focus on how software maps to non-software structures: hardware, teams, and file systems.',
      items: [
        { name: 'Deployment', detail: 'Mapping software to hardware nodes and infrastructure' },
        { name: 'Work Assignment', detail: 'Mapping modules to development teams' },
        { name: 'Implementation', detail: 'Mapping modules to file/directory structures' },
        { name: 'Install', detail: 'Mapping to installation configurations and environments' },
      ],
    },
  ];

  return (
    <Section
      id="arch-structures"
      number={5}
      title="Architectural Structures"
      icon={<Blocks className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        Software architecture is not a single structure—it&apos;s a <strong className="text-slate-900 dark:text-white">collection of structures</strong>. Each
        structure is a set of elements and the relationships between them. Different structures reveal different properties of the system.
        Bass, Clements & Kazman categorize them into three groups:
      </p>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {categories.map((cat, ci) => (
          <motion.div key={cat.title} variants={fadeUp} custom={ci} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Card className={`h-full border-${cat.color}-500/30`}>
              <div className="flex items-center gap-3 mb-3">
                {cat.icon}
                <h4 className="text-slate-900 dark:text-white font-bold">{cat.title}</h4>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{cat.desc}</p>
              <ul className="space-y-3">
                {cat.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-2">
                    <CircleDot className={`w-4 h-4 text-${cat.color}-400 mt-0.5 shrink-0`} />
                    <div>
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{item.name}</span>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Visual relationship */}
      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">How Structures Relate</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 200" className="w-full min-w-[700px] lg:min-w-0" aria-label="Architectural structures relationship">
          {/* Three pillars */}
          {[
            { x: 100, label: 'Module', sub: '(Static)', color: '#3b82f6' },
            { x: 350, label: 'C&C', sub: '(Dynamic)', color: '#8b5cf6' },
            { x: 600, label: 'Allocation', sub: '(Deploy)', color: '#10b981' },
          ].map((p, i) => (
            <g key={p.label}>
              <motion.rect
                x={p.x - 70} y="30" width="140" height="80" rx="12"
                fill={p.color} opacity="0.15" stroke={p.color} strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
              />
              <text x={p.x} y="65" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{p.label}</text>
              <text x={p.x} y="85" textAnchor="middle" fill="#94a3b8" fontSize="11">{p.sub}</text>
            </g>
          ))}
          {/* Connecting lines */}
          <motion.line x1="170" y1="70" x2="280" y2="70" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.6 }} viewport={{ once: true }} />
          <motion.line x1="420" y1="70" x2="530" y2="70" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.8 }} viewport={{ once: true }} />
          <text x="225" y="62" textAnchor="middle" fill="#64748b" fontSize="10">maps to</text>
          <text x="475" y="62" textAnchor="middle" fill="#64748b" fontSize="10">deployed on</text>
          {/* Bottom label */}
          <text x="350" y="160" textAnchor="middle" fill="#94a3b8" fontSize="12">
            Together, these structures give a complete view of the architecture.
          </text>
        </svg>
</div>
</div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 6 – Centralized vs Decentralized
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CentralizedVsDecentralized() {
  return (
    <Section
      id="centralized-vs-decentralized"
      number={6}
      title="Centralized vs Decentralized Architecture"
      icon={<Network className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The fundamental question of control distribution: Does one node control the others, or do all nodes share responsibility equally?
        This decision affects fault tolerance, scalability, and complexity.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Centralized */}
        <motion.div variants={slideIn('left')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-blue-500/30 h-full">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" /> Centralized
            </h4>
            <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 300 220" className="w-full mb-4 min-w-[300px] lg:min-w-0" aria-label="Centralized architecture with controller and workers">
              {/* Controller */}
              <motion.circle cx="150" cy="60" r="35" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              />
              <text x="150" y="56" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Controller</text>
              <text x="150" y="70" textAnchor="middle" fill="#93c5fd" fontSize="9">(Master)</text>
              {/* Workers */}
              {[50, 150, 250].map((x, i) => (
                <g key={i}>
                  <line x1="150" y1="95" x2={x} y2="155" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
                  <circle cx={x} cy="170" r="25" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x={x} y="174" textAnchor="middle" fill="#93c5fd" fontSize="10">W{i + 1}</text>
                </g>
              ))}
            </svg>
</div>
</div>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>✅ Single point of coordination</li>
              <li>✅ Easier to manage and debug</li>
              <li>✅ Consistent decision-making</li>
              <li>⚠️ Single point of failure</li>
              <li>⚠️ Controller becomes bottleneck at scale</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge color="blue">Kubernetes</Badge>
              <Badge color="blue">Apache Spark</Badge>
              <Badge color="blue">Load Balancers</Badge>
            </div>
          </Card>
        </motion.div>

        {/* Decentralized */}
        <motion.div variants={slideIn('right')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-purple-500/30 h-full">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" /> Decentralized
            </h4>
            <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 300 220" className="w-full mb-4 min-w-[300px] lg:min-w-0" aria-label="Decentralized architecture with equal peer nodes">
              {/* Equal nodes in mesh */}
              {[
                { x: 150, y: 50 },
                { x: 70, y: 120 },
                { x: 230, y: 120 },
                { x: 100, y: 195 },
                { x: 200, y: 195 },
              ].map((n, i, arr) => (
                <g key={i}>
                  {/* Lines to all other nodes */}
                  {arr.slice(i + 1).map((m, j) => (
                    <line key={j} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="#8b5cf6" strokeWidth="1" opacity="0.3" />
                  ))}
                  <motion.circle
                    cx={n.x} cy={n.y} r="22" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#c4b5fd" fontSize="10">P{i + 1}</text>
                </g>
              ))}
            </svg>
</div>
</div>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>✅ No single point of failure</li>
              <li>✅ Scales naturally with more nodes</li>
              <li>✅ Higher fault tolerance</li>
              <li>⚠️ Complex consensus algorithms needed</li>
              <li>⚠️ Harder to maintain consistency</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge color="purple">Blockchain</Badge>
              <Badge color="purple">BitTorrent</Badge>
              <Badge color="purple">Cassandra</Badge>
            </div>
          </Card>
        </motion.div>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 7 – Layered Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LayeredArchitecture() {
  const layers = [
    { name: 'Presentation Layer', color: '#3b82f6', desc: 'UI components, views, user interaction' },
    { name: 'Application Layer', color: '#8b5cf6', desc: 'Use cases, orchestration, application logic' },
    { name: 'Domain / Business Layer', color: '#06b6d4', desc: 'Core business rules, entities, domain logic' },
    { name: 'Infrastructure Layer', color: '#10b981', desc: 'Database, external APIs, file system, frameworks' },
  ];

  return (
    <Section
      id="layered"
      number={7}
      title="Layered Architecture"
      icon={<Layers className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        Layered architecture organizes code into <strong className="text-slate-900 dark:text-white">horizontal layers</strong>, each with a specific role.
        Each layer only depends on the layer directly below it—promoting separation of concerns and modularity.
        The key distinction is between <strong className="text-slate-900 dark:text-white">open</strong> and <strong className="text-slate-900 dark:text-white">closed</strong> layers.
      </p>

      {/* Stack SVG */}
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Layer Stack Diagram</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 360" className="w-full min-w-[700px] lg:min-w-0" aria-label="Layered architecture stack with four layers">
          {layers.map((layer, i) => {
            const y = 30 + i * 80;
            return (
              <g key={layer.name}>
                <motion.rect
                  x="100" y={y} width="500" height="60" rx="12"
                  fill={layer.color} opacity="0.12" stroke={layer.color} strokeWidth="2"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                />
                <text x="350" y={y + 25} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  {layer.name}
                </text>
                <text x="350" y={y + 45} textAnchor="middle" fill="#94a3b8" fontSize="11">
                  {layer.desc}
                </text>
                {/* Downward arrow */}
                {i < layers.length - 1 && (
                  <motion.polygon
                    points={`350,${y + 62} 343,${y + 72} 357,${y + 72}`}
                    fill={layer.color} opacity="0.6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.6 }}
                    transition={{ delay: i * 0.15 + 0.3 }}
                    viewport={{ once: true }}
                  />
                )}
              </g>
            );
          })}
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-500/30">
          <h5 className="text-slate-900 dark:text-white font-bold mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" /> Closed Layers
          </h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            Each layer can <em>only</em> call the layer directly below it. No skipping layers.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            <strong className="text-slate-900 dark:text-white">Benefit:</strong> Strong isolation, changes in one layer don&apos;t cascade.{' '}
            <strong className="text-slate-900 dark:text-white">Trade-off:</strong> Can introduce unnecessary pass-through layers.
          </p>
        </Card>
        <Card className="border-amber-500/30">
          <h5 className="text-slate-900 dark:text-white font-bold mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" /> Open Layers
          </h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            A layer can be bypassed—upper layers can call any layer below them.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            <strong className="text-slate-900 dark:text-white">Benefit:</strong> Better performance, avoids unnecessary indirection.{' '}
            <strong className="text-slate-900 dark:text-white">Trade-off:</strong> Tighter coupling, harder to swap layers.
          </p>
        </Card>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 8 – N-Tier Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function NTierArchitecture() {
  const tiers = [
    { name: 'Presentation Tier', icon: <Monitor className="w-8 h-8 text-blue-400 shrink-0" />, color: '#3b82f6', items: ['Web Browser', 'Mobile App', 'Desktop Client'], desc: 'User-facing interface. Renders UI and captures user input. Runs on client machines.' },
    { name: 'Business / Logic Tier', icon: <Cpu className="w-8 h-8 text-purple-400 shrink-0" />, color: '#8b5cf6', items: ['API Server', 'Application Logic', 'Business Rules'], desc: 'Core processing. Validates data, applies business rules, coordinates workflows. Runs on application servers.' },
    { name: 'Data Tier', icon: <Database className="w-8 h-8 text-green-400 shrink-0" />, color: '#10b981', items: ['SQL Database', 'NoSQL Store', 'File Storage'], desc: 'Persistent storage. Manages data access, CRUD operations, and data integrity. Runs on database servers.' },
  ];

  return (
    <Section
      id="n-tier"
      number={8}
      title="N-Tier Architecture"
      icon={<Server className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        N-Tier architecture physically separates the system into <strong className="text-slate-900 dark:text-white">tiers</strong>—each tier runs on its
        own infrastructure. The most common is the <strong className="text-slate-900 dark:text-white">3-Tier</strong> model. It&apos;s crucial to distinguish:
        <strong className="text-slate-900 dark:text-white"> Layers</strong> are logical separations; <strong className="text-slate-900 dark:text-white">Tiers</strong> are physical separations.
      </p>

      {/* Tier diagram */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {tiers.map((tier, i) => (
          <motion.div key={tier.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Card className="h-full text-center">
              <div className="flex justify-center mb-3">{tier.icon}</div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-2">{tier.name}</h5>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{tier.desc}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {tier.items.map((item) => (
                  <Badge key={item} color={['blue', 'purple', 'green'][i]}>{item}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connection SVG */}
      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Tiers vs Layers</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-blue-400 font-semibold mb-2">Layers (Logical)</h5>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>• Conceptual separation within code</li>
              <li>• Can run on the same machine</li>
              <li>• Enforced by code organization</li>
              <li>• E.g., MVC within a single app</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-400 font-semibold mb-2">Tiers (Physical)</h5>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>• Physical separation on infrastructure</li>
              <li>• Each tier on separate hardware/VM</li>
              <li>• Network communication between tiers</li>
              <li>• E.g., web server + app server + DB server</li>
            </ul>
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 9 – MVC Pattern
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MVCPattern() {
  return (
    <Section
      id="mvc"
      number={9}
      title="MVC Pattern"
      icon={<LayoutGrid className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">Model-View-Controller (MVC)</strong> is one of the oldest and most widely used architectural patterns
        (1979, Trygve Reenskaug). It separates an application into three interconnected components, each with a distinct responsibility,
        promoting organized code and parallel development.
      </p>

      {/* MVC SVG Diagram */}
      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">MVC Interaction Cycle</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 350" className="w-full min-w-[700px] lg:min-w-0" aria-label="MVC pattern showing Model, View, Controller cycle">
          {/* View */}
          <motion.g initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} viewport={{ once: true }}>
            <rect x="260" y="20" width="180" height="80" rx="16" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="2" />
            <text x="350" y="55" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">View</text>
            <text x="350" y="75" textAnchor="middle" fill="#93c5fd" fontSize="11">UI / Presentation</text>
          </motion.g>

          {/* Controller */}
          <motion.g initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
            <rect x="50" y="200" width="180" height="80" rx="16" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="2" />
            <text x="140" y="235" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Controller</text>
            <text x="140" y="255" textAnchor="middle" fill="#c4b5fd" fontSize="11">Input Logic</text>
          </motion.g>

          {/* Model */}
          <motion.g initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }}>
            <rect x="470" y="200" width="180" height="80" rx="16" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="2" />
            <text x="560" y="235" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Model</text>
            <text x="560" y="255" textAnchor="middle" fill="#6ee7b7" fontSize="11">Data & Business Logic</text>
          </motion.g>

          {/* Arrows */}
          {/* User → View */}
          <text x="350" y="12" textAnchor="middle" fill="#94a3b8" fontSize="10">👤 User</text>

          {/* View → Controller */}
          <motion.path d="M 270 100 Q 180 150 170 195" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.6 }} viewport={{ once: true }} />
          <text x="190" y="145" fill="#93c5fd" fontSize="10">User action</text>

          {/* Controller → Model */}
          <motion.path d="M 230 240 L 465 240" fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowPurple)"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.8 }} viewport={{ once: true }} />
          <text x="350" y="232" textAnchor="middle" fill="#c4b5fd" fontSize="10">Updates data</text>

          {/* Model → View */}
          <motion.path d="M 530 195 Q 470 140 440 105" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowGreen)"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 1.0 }} viewport={{ once: true }} />
          <text x="510" y="140" fill="#6ee7b7" fontSize="10">Notifies</text>

          {/* Markers */}
          <defs>
            <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <marker id="arrowPurple" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
            </marker>
            <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
          </defs>
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Model', color: 'green', desc: 'Manages data, business rules, and state. Notifies observers (View) when data changes. Independent of UI.' },
          { name: 'View', color: 'blue', desc: 'Renders the UI. Observes the Model for changes and updates the display. Should contain no business logic.' },
          { name: 'Controller', color: 'purple', desc: 'Handles user input and translates it into operations on the Model. Acts as the intermediary.' },
        ].map((c) => (
          <Card key={c.name} className={`border-${c.color}-500/30`}>
            <h5 className={`text-${c.color}-400 font-bold mb-2`}>{c.name}</h5>
            <p className="text-slate-700 dark:text-slate-300 text-sm">{c.desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 10 – Client-Server
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ClientServer() {
  return (
    <Section
      id="client-server"
      number={10}
      title="Client-Server Architecture"
      icon={<Monitor className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The <strong className="text-slate-900 dark:text-white">Client-Server</strong> model is a two-layered distributed architecture.{' '}
        <strong className="text-slate-900 dark:text-white">Clients</strong> initiate requests; <strong className="text-slate-900 dark:text-white">servers</strong> process them and return responses.
        This is the foundation of the web—every HTTP request follows this pattern. Variants include thin client, thick client, and
        three-tier client-server.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 250" className="w-full min-w-[700px] lg:min-w-0" aria-label="Client-server request response diagram">
          {/* Clients */}
          {[80, 80, 80].map((_, i) => {
            const y = 40 + i * 70;
            return (
              <g key={i}>
                <motion.rect
                  x="30" y={y} width="150" height="50" rx="10"
                  fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"
                  initial={{ x: -50, opacity: 0 }} whileInView={{ x: 30, opacity: 1 }}
                  transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                />
                <text x="105" y={y + 30} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  Client {i + 1}
                </text>
                {/* Request arrow */}
                <motion.line x1="185" y1={y + 20} x2="440" y2="130" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: i * 0.15 + 0.3 }} viewport={{ once: true }} />
                {/* Response arrow */}
                <motion.line x1="440" y1="140" x2="185" y2={y + 35} stroke="#10b981" strokeWidth="1.5" opacity="0.4" strokeDasharray="5 3"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: i * 0.15 + 0.5 }} viewport={{ once: true }} />
              </g>
            );
          })}
          {/* Server */}
          <motion.rect
            x="440" y="80" width="200" height="100" rx="14"
            fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }} viewport={{ once: true }}
          />
          <text x="540" y="125" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Server</text>
          <text x="540" y="145" textAnchor="middle" fill="#6ee7b7" fontSize="11">Processes & Responds</text>

          {/* Legend */}
          <line x1="250" y1="235" x2="290" y2="235" stroke="#3b82f6" strokeWidth="2" />
          <text x="295" y="239" fill="#94a3b8" fontSize="10">Request</text>
          <line x1="370" y1="235" x2="410" y2="235" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
          <text x="415" y="239" fill="#94a3b8" fontSize="10">Response</text>
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Client Responsibilities</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>• Initiates communication</li>
            <li>• Renders user interface</li>
            <li>• Handles user input</li>
            <li>• May cache data locally</li>
          </ul>
        </Card>
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Server Responsibilities</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>• Listens for incoming requests</li>
            <li>• Processes business logic</li>
            <li>• Manages shared resources</li>
            <li>• Returns responses</li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 11 – Peer-to-Peer
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PeerToPeer() {
  const types = [
    {
      name: 'Pure P2P',
      desc: 'All peers are completely equal. No central server at all. Each peer acts as both client and server. Discovery via flooding.',
      color: 'blue',
      examples: 'Gnutella (original)',
    },
    {
      name: 'Hybrid P2P',
      desc: 'Some peers have special roles (super-peers or index servers) that help with discovery, but data transfer is still peer-to-peer.',
      color: 'purple',
      examples: 'Skype (legacy), Napster',
    },
    {
      name: 'Structured P2P',
      desc: 'Peers organized using a Distributed Hash Table (DHT). Lookup is efficient and deterministic—O(log n) hops.',
      color: 'green',
      examples: 'BitTorrent (DHT), Chord, Kademlia',
    },
  ];

  return (
    <Section
      id="p2p"
      number={11}
      title="Peer-to-Peer (P2P) Architecture"
      icon={<Users className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        In P2P, every node (peer) is both a <strong className="text-slate-900 dark:text-white">consumer and provider</strong> of resources.
        There is no dedicated server—peers collaborate directly. P2P excels at distributing large files and creating
        resilient, censorship-resistant systems.
      </p>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {types.map((t, i) => (
          <motion.div key={t.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Card className="h-full">
              <Badge color={t.color}>{t.name}</Badge>
              <h5 className="text-slate-900 dark:text-white font-bold mt-3 mb-2">{t.name}</h5>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">{t.desc}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs"><strong>Examples:</strong> {t.examples}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* P2P mesh SVG */}
      <Card>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">P2P Network Topology</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 500 250" className="w-full max-w-md mx-auto min-w-[500px] lg:min-w-0" aria-label="Peer-to-peer mesh network">
          {[
            { x: 250, y: 40 },
            { x: 100, y: 110 },
            { x: 400, y: 110 },
            { x: 60, y: 200 },
            { x: 190, y: 210 },
            { x: 310, y: 210 },
            { x: 440, y: 200 },
          ].map((n, i, arr) => (
            <g key={i}>
              {arr.slice(i + 1).filter((_, j) => (i + j) % 2 === 0 || j < 2).map((m, j) => (
                <motion.line
                  key={j} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
                  stroke="#3b82f6" strokeWidth="1" opacity="0.3"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                />
              ))}
              <motion.circle
                cx={n.x} cy={n.y} r="18" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"
                initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" as any }}
                viewport={{ once: true }}
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">Peer</text>
            </g>
          ))}
        </svg>
</div>
</div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 12 – Broker Pattern
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BrokerPattern() {
  return (
    <Section
      id="broker"
      number={12}
      title="Broker Pattern"
      icon={<Cable className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The <strong className="text-slate-900 dark:text-white">Broker Pattern</strong> introduces an intermediary (<strong className="text-slate-900 dark:text-white">broker</strong>)
        that coordinates communication between distributed components. Clients don&apos;t need to know the server&apos;s location or protocol—the
        broker handles service discovery, marshalling, and routing. Essential for distributed systems where services may move, scale, or change.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 220" className="w-full min-w-[700px] lg:min-w-0" aria-label="Broker pattern with clients, broker, and servers">
          {/* Clients */}
          {['Client A', 'Client B'].map((label, i) => (
            <g key={label}>
              <motion.rect
                x="30" y={40 + i * 90} width="130" height="55" rx="10"
                fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"
                initial={{ x: -30, opacity: 0 }} whileInView={{ x: 30, opacity: 1 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
              />
              <text x="95" y={73 + i * 90} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{label}</text>
              <motion.line x1="165" y1={67 + i * 90} x2="255" y2="115" stroke="#94a3b8" strokeWidth="1.5"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }} />
            </g>
          ))}

          {/* Broker */}
          <motion.rect
            x="255" y="70" width="180" height="90" rx="16"
            fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="2"
            initial={{ scale: 0.8 }} whileInView={{ scale: 1 }}
            transition={{ delay: 0.3 }} viewport={{ once: true }}
          />
          <text x="345" y="105" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">Broker</text>
          <text x="345" y="125" textAnchor="middle" fill="#fbbf24" fontSize="10">Route • Discover • Marshal</text>
          <text x="345" y="145" textAnchor="middle" fill="#94a3b8" fontSize="9">Service Registry</text>

          {/* Servers */}
          {['Service X', 'Service Y'].map((label, i) => (
            <g key={label}>
              <motion.rect
                x="530" y={40 + i * 90} width="130" height="55" rx="10"
                fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1.5"
                initial={{ x: 30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.4 }} viewport={{ once: true }}
              />
              <text x="595" y={73 + i * 90} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{label}</text>
              <motion.line x1="435" y1="115" x2="525" y2={67 + i * 90} stroke="#94a3b8" strokeWidth="1.5"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.1 }} viewport={{ once: true }} />
            </g>
          ))}
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Key Responsibilities</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>• <strong className="text-slate-900 dark:text-white">Service Registration</strong> — services register with the broker</li>
            <li>• <strong className="text-slate-900 dark:text-white">Service Discovery</strong> — clients find services via broker</li>
            <li>• <strong className="text-slate-900 dark:text-white">Message Routing</strong> — broker routes requests to appropriate services</li>
            <li>• <strong className="text-slate-900 dark:text-white">Protocol Translation</strong> — marshal/unmarshal between formats</li>
          </ul>
        </Card>
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Real-World Examples</h5>
          <div className="flex flex-wrap gap-2">
            <Badge color="amber">Apache Kafka</Badge>
            <Badge color="amber">RabbitMQ</Badge>
            <Badge color="amber">CORBA</Badge>
            <Badge color="amber">MQTT Broker</Badge>
            <Badge color="amber">API Gateway</Badge>
            <Badge color="amber">Service Mesh</Badge>
          </div>
        </Card>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 13 – Pipe and Filter
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PipeAndFilter() {
  const stages = [
    { name: 'Source', color: '#3b82f6', desc: 'Raw Input' },
    { name: 'Filter A', color: '#8b5cf6', desc: 'Parse' },
    { name: 'Filter B', color: '#06b6d4', desc: 'Transform' },
    { name: 'Filter C', color: '#10b981', desc: 'Validate' },
    { name: 'Filter D', color: '#f59e0b', desc: 'Enrich' },
    { name: 'Sink', color: '#ef4444', desc: 'Output' },
  ];

  return (
    <Section
      id="pipe-filter"
      number={13}
      title="Pipe and Filter Architecture"
      icon={<Filter className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        The <strong className="text-slate-900 dark:text-white">Pipe and Filter</strong> pattern processes data through a sequence of independent transformation
        stages. Each <strong className="text-slate-900 dark:text-white">filter</strong> takes input, processes it, and produces output. <strong className="text-slate-900 dark:text-white">Pipes</strong>{' '}
        connect filters, passing data between them. Filters are independent and reusable—they don&apos;t know about the other filters in the pipeline.
      </p>

      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Data Pipeline Diagram</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 900 140" className="w-full min-w-[600px]" aria-label="Pipe and filter pipeline with sequential stages">
          {stages.map((stage, i) => {
            const x = 30 + i * 145;
            return (
              <g key={stage.name}>
                {/* Pipe (arrow) */}
                {i > 0 && (
                  <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }}>
                    <line x1={x - 30} y1="65" x2={x - 5} y2="65" stroke="#94a3b8" strokeWidth="2" />
                    <polygon points={`${x - 8},58 ${x},65 ${x - 8},72`} fill="#94a3b8" />
                    <text x={x - 18} y="90" textAnchor="middle" fill="#64748b" fontSize="9">pipe</text>
                  </motion.g>
                )}
                {/* Filter box */}
                <motion.rect
                  x={x} y="35" width="115" height="60" rx="12"
                  fill={stage.color} opacity="0.15" stroke={stage.color} strokeWidth="2"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                />
                <text x={x + 57} y="60" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{stage.name}</text>
                <text x={x + 57} y="78" textAnchor="middle" fill="#94a3b8" fontSize="10">{stage.desc}</text>
              </g>
            );
          })}
          {/* Flow label */}
          <text x="450" y="130" textAnchor="middle" fill="#64748b" fontSize="11">
            Data flows left → right through independent, composable stages
          </text>
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Characteristics</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>• Each filter is independent and stateless</li>
            <li>• Filters can be reordered, added, or removed</li>
            <li>• Supports parallel processing</li>
            <li>• Great for data transformation pipelines</li>
          </ul>
        </Card>
        <Card>
          <h5 className="text-slate-900 dark:text-white font-semibold mb-2">Real-World Examples</h5>
          <div className="flex flex-wrap gap-2">
            <Badge color="blue">Unix Pipes</Badge>
            <Badge color="purple">ETL Pipelines</Badge>
            <Badge color="cyan">Compilers</Badge>
            <Badge color="green">Stream Processing</Badge>
            <Badge color="amber">Image Processing</Badge>
          </div>
        </Card>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 14 – Event-Driven Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function EventDriven() {
  return (
    <Section
      id="event-driven"
      number={14}
      title="Event-Driven Architecture"
      icon={<Zap className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        In <strong className="text-slate-900 dark:text-white">Event-Driven Architecture (EDA)</strong>, components communicate by producing and consuming{' '}
        <strong className="text-slate-900 dark:text-white">events</strong>—significant state changes or occurrences. Producers don&apos;t know who will consume
        their events, creating loose coupling. EDA is the backbone of reactive, real-time systems.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 280" className="w-full min-w-[700px] lg:min-w-0" aria-label="Event-driven architecture with producers, event channel, and consumers">
          {/* Producers */}
          <text x="80" y="25" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">Producers</text>
          {['Order Svc', 'User Svc', 'Payment Svc'].map((label, i) => (
            <g key={label}>
              <motion.rect
                x="20" y={40 + i * 70} width="120" height="50" rx="10"
                fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"
                initial={{ x: -20, opacity: 0 }} whileInView={{ x: 20, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              />
              <text x="80" y={70 + i * 70} textAnchor="middle" fill="white" fontSize="11">{label}</text>
              <motion.line x1="145" y1={65 + i * 70} x2="260" y2="140" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }} />
            </g>
          ))}

          {/* Event Channel */}
          <motion.rect
            x="260" y="90" width="180" height="100" rx="16"
            fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="2"
            animate={{ boxShadow: ['0 0 0px #f59e0b', '0 0 20px #f59e0b', '0 0 0px #f59e0b'] }}
          />
          <text x="350" y="125" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Event Channel</text>
          <text x="350" y="145" textAnchor="middle" fill="#fbbf24" fontSize="10">Queue / Bus</text>
          <motion.text x="350" y="175" textAnchor="middle" fill="#94a3b8" fontSize="9"
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡ Events flowing...
          </motion.text>

          {/* Consumers */}
          <text x="580" y="25" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">Consumers</text>
          {['Email Svc', 'Analytics', 'Inventory'].map((label, i) => (
            <g key={label}>
              <motion.line x1="445" y1="140" x2="520" y2={65 + i * 70} stroke="#10b981" strokeWidth="1.5" opacity="0.5"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.1 }} viewport={{ once: true }} />
              <motion.rect
                x="520" y={40 + i * 70} width="120" height="50" rx="10"
                fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1.5"
                initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.4 }} viewport={{ once: true }}
              />
              <text x="580" y={70 + i * 70} textAnchor="middle" fill="white" fontSize="11">{label}</text>
            </g>
          ))}
        </svg>
</div>
</div>
      </Card>

      <Card>
        <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Key Benefits of EDA</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ul className="text-slate-700 dark:text-slate-300 space-y-1">
            <li>✅ Loose coupling between producers and consumers</li>
            <li>✅ Easy to add new consumers without changing producers</li>
            <li>✅ Supports real-time processing</li>
          </ul>
          <ul className="text-slate-700 dark:text-slate-300 space-y-1">
            <li>✅ Natural fit for microservices</li>
            <li>✅ Enables event sourcing and CQRS patterns</li>
            <li>⚠️ Eventual consistency—harder to reason about</li>
          </ul>
        </div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 15 – Publish-Subscribe
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PubSub() {
  return (
    <Section
      id="pub-sub"
      number={15}
      title="Publish-Subscribe Pattern"
      icon={<Radio className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">Pub/Sub</strong> is a specific form of event-driven messaging. <strong className="text-slate-900 dark:text-white">Publishers</strong>{' '}
        emit messages to <strong className="text-slate-900 dark:text-white">topics</strong>. <strong className="text-slate-900 dark:text-white">Subscribers</strong> declare interest in
        topics and receive matching messages. The <strong className="text-slate-900 dark:text-white">Event Bus</strong> (or message broker) manages the routing.
        Publishers and subscribers are completely decoupled—they don&apos;t know each other exists.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 300" className="w-full min-w-[700px] lg:min-w-0" aria-label="Publish-subscribe with publishers, event bus with topics, and subscribers">
          {/* Publishers */}
          {['Pub 1', 'Pub 2'].map((label, i) => (
            <g key={label}>
              <motion.rect x="30" y={50 + i * 120} width="100" height="50" rx="10" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} />
              <text x="80" y={80 + i * 120} textAnchor="middle" fill="white" fontSize="12">{label}</text>
            </g>
          ))}

          {/* Event Bus */}
          <motion.rect x="200" y="30" width="280" height="240" rx="16" fill="#f59e0b" opacity="0.08" stroke="#f59e0b" strokeWidth="2"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} />
          <text x="340" y="55" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold">Event Bus</text>

          {/* Topics */}
          {['Topic A', 'Topic B', 'Topic C'].map((topic, i) => (
            <motion.g key={topic} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }}>
              <rect x="230" y={75 + i * 60} width="220" height="40" rx="8" fill="#f59e0b" opacity="0.15" stroke="#fbbf24" strokeWidth="1" />
              <text x="340" y={100 + i * 60} textAnchor="middle" fill="white" fontSize="11">{topic}</text>
            </motion.g>
          ))}

          {/* Subscribers */}
          {['Sub 1', 'Sub 2', 'Sub 3'].map((label, i) => (
            <g key={label}>
              <motion.rect x="560" y={50 + i * 80} width="100" height="50" rx="10" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1.5"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} viewport={{ once: true }} />
              <text x="610" y={80 + i * 80} textAnchor="middle" fill="white" fontSize="12">{label}</text>
            </g>
          ))}

          {/* Connection lines (simplified) */}
          <line x1="135" y1="75" x2="225" y2="95" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <line x1="135" y1="170" x2="225" y2="155" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <line x1="455" y1="95" x2="555" y2="75" stroke="#10b981" strokeWidth="1" opacity="0.4" />
          <line x1="455" y1="155" x2="555" y2="155" stroke="#10b981" strokeWidth="1" opacity="0.4" />
          <line x1="455" y1="155" x2="555" y2="235" stroke="#10b981" strokeWidth="1" opacity="0.4" />
        </svg>
</div>
</div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge color="amber">Google Pub/Sub</Badge>
        <Badge color="amber">AWS SNS/SQS</Badge>
        <Badge color="amber">Redis Pub/Sub</Badge>
        <Badge color="amber">NATS</Badge>
        <Badge color="amber">Apache Kafka</Badge>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 16 – Hexagonal Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HexagonalArchitecture() {
  return (
    <Section
      id="hexagonal"
      number={16}
      title="Hexagonal Architecture (Ports & Adapters)"
      icon={<Hexagon className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">Hexagonal Architecture</strong> (Alistair Cockburn, 2005) isolates the core domain logic from all
        external concerns. The domain sits at the center; <strong className="text-slate-900 dark:text-white">ports</strong> define interfaces the domain needs;{' '}
        <strong className="text-slate-900 dark:text-white">adapters</strong> implement those interfaces for specific technologies. The result: your business logic
        is completely testable and independent of frameworks, databases, and UIs.
      </p>

      <Card className="mb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hexagonal Structure</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 400" className="w-full min-w-[700px] lg:min-w-0" aria-label="Hexagonal architecture with core domain, ports, and adapters">
          <defs>
            <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Outer hexagon */}
          <motion.polygon
            points="350,30 560,120 560,280 350,370 140,280 140,120"
            fill="none" stroke="url(#hexGrad)" strokeWidth="2" opacity="0.4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ transformOrigin: '350px 200px' }}
          />

          {/* Inner hexagon - core */}
          <motion.polygon
            points="350,110 440,155 440,245 350,290 260,245 260,155"
            fill="#8b5cf6" opacity="0.1" stroke="#8b5cf6" strokeWidth="2"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            style={{ transformOrigin: '350px 200px' }}
          />
          <text x="350" y="190" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Domain</text>
          <text x="350" y="210" textAnchor="middle" fill="#c4b5fd" fontSize="11">Core Logic</text>
          <text x="350" y="230" textAnchor="middle" fill="#94a3b8" fontSize="9">Pure business rules</text>

          {/* Ports & Adapters */}
          {[
            { label: 'REST API', port: 'HTTP Port', x: 130, y: 80, color: '#3b82f6' },
            { label: 'CLI', port: 'Input Port', x: 80, y: 200, color: '#06b6d4' },
            { label: 'Queue', port: 'Msg Port', x: 130, y: 320, color: '#10b981' },
            { label: 'PostgreSQL', port: 'DB Port', x: 520, y: 80, color: '#f59e0b' },
            { label: 'S3 Storage', port: 'Store Port', x: 580, y: 200, color: '#ef4444' },
            { label: 'SMTP', port: 'Notif Port', x: 520, y: 320, color: '#ec4899' },
          ].map((adapter, i) => (
            <motion.g key={adapter.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              viewport={{ once: true }}
            >
              <rect x={adapter.x - 45} y={adapter.y - 15} width="90" height="35" rx="8"
                fill={adapter.color} opacity="0.15" stroke={adapter.color} strokeWidth="1.5" />
              <text x={adapter.x} y={adapter.y + 2} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{adapter.label}</text>
              <text x={adapter.x} y={adapter.y + 14} textAnchor="middle" fill="#94a3b8" fontSize="8">{adapter.port}</text>
            </motion.g>
          ))}
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-purple-500/30">
          <h5 className="text-purple-400 font-bold mb-2">Core Domain</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Pure business logic. No framework imports, no database queries, no HTTP references. Fully unit-testable.</p>
        </Card>
        <Card className="border-blue-500/30">
          <h5 className="text-blue-400 font-bold mb-2">Ports (Interfaces)</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Contracts that define what the domain needs from the outside world. Defined by the domain, implemented by adapters.</p>
        </Card>
        <Card className="border-green-500/30">
          <h5 className="text-green-400 font-bold mb-2">Adapters (Implementations)</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Concrete implementations connecting to real tech: REST, gRPC, PostgreSQL, Redis, S3, SMTP, etc.</p>
        </Card>
      </div>

      <div className="mt-8">
        <h5 className="text-slate-900 dark:text-white font-bold mb-2">TypeScript Hexagonal Example</h5>
        <CodeBlock language="typescript" code={`// 1. Core Domain (No Dependencies)
export class User {
  constructor(public id: string, public email: string) {}
}

// 2. Port (Interface defined by Domain)
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

// 3. Adapter (Implementation relying on DB, lives outside Domain)
import { Client } from 'pg';
export class PostgresUserRepository implements UserRepository {
  constructor(private db: Client) {}
  
  async save(user: User) {
    await this.db.query('INSERT INTO users (id, email) VALUES (<Card className="border-purple-500/30">
          <h5 className="text-purple-400 font-bold mb-2">Core Domain</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Pure business logic. No framework imports, no database queries, no HTTP references. Fully unit-testable.</p>
        </Card>
        <Card className="border-blue-500/30">
          <h5 className="text-blue-400 font-bold mb-2">Ports (Interfaces)</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Contracts that define what the domain needs from the outside world. Defined by the domain, implemented by adapters.</p>
        </Card>
        <Card className="border-green-500/30">
          <h5 className="text-green-400 font-bold mb-2">Adapters (Implementations)</h5>
          <p className="text-slate-700 dark:text-slate-300 text-sm">Concrete implementations connecting to real tech: REST, gRPC, PostgreSQL, Redis, S3, SMTP, etc.</p>
        </Card>
      </div>, $2)', [user.id, user.email]);
  }
  // ...
}`} />
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 17 – Serverless Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ServerlessArchitecture() {
  return (
    <Section
      id="serverless"
      number={17}
      title="Serverless Architecture"
      icon={<Cloud className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">Serverless</strong> doesn&apos;t mean &quot;no servers&quot;—it means you don&apos;t manage them.
        Cloud providers handle provisioning, scaling, and maintenance. Your code runs as <strong className="text-slate-900 dark:text-white">stateless functions</strong>{' '}
        triggered by events: HTTP requests, database changes, queue messages, schedules. You pay only for execution time.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 220" className="w-full min-w-[700px] lg:min-w-0" aria-label="Serverless architecture with events triggering cloud functions">
          {/* Events */}
          {[
            { label: 'HTTP', y: 30 },
            { label: 'Queue', y: 90 },
            { label: 'Schedule', y: 150 },
          ].map((ev, i) => (
            <g key={ev.label}>
              <motion.rect x="30" y={ev.y} width="100" height="40" rx="8" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} />
              <text x="80" y={ev.y + 25} textAnchor="middle" fill="white" fontSize="11">⚡ {ev.label}</text>
              <motion.line x1="135" y1={ev.y + 20} x2="220" y2="110" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }} />
            </g>
          ))}

          {/* Cloud Functions */}
          <motion.rect x="220" y="60" width="200" height="100" rx="16" fill="#3b82f6" opacity="0.1" stroke="#3b82f6" strokeWidth="2"
            initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} transition={{ delay: 0.4 }} viewport={{ once: true }} />
          <text x="320" y="100" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">☁️ Cloud Functions</text>
          <text x="320" y="120" textAnchor="middle" fill="#93c5fd" fontSize="10">Stateless • Auto-scaling</text>
          <text x="320" y="140" textAnchor="middle" fill="#64748b" fontSize="9">Pay-per-execution</text>

          {/* Backend Services */}
          {[
            { label: 'Database', y: 30 },
            { label: 'Storage', y: 90 },
            { label: 'Auth', y: 150 },
          ].map((svc, i) => (
            <g key={svc.label}>
              <motion.line x1="425" y1="110" x2="530" y2={svc.y + 20} stroke="#10b981" strokeWidth="1.5" opacity="0.4"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.6 + i * 0.1 }} viewport={{ once: true }} />
              <motion.rect x="530" y={svc.y} width="120" height="40" rx="8" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1.5"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }} viewport={{ once: true }} />
              <text x="590" y={svc.y + 25} textAnchor="middle" fill="white" fontSize="11">{svc.label}</text>
            </g>
          ))}
        </svg>
</div>
</div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color="blue">AWS Lambda</Badge>
        <Badge color="blue">Google Cloud Functions</Badge>
        <Badge color="blue">Azure Functions</Badge>
        <Badge color="blue">Cloudflare Workers</Badge>
        <Badge color="blue">Vercel Edge Functions</Badge>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-green-400 font-semibold mb-2">Pros</h5>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>✅ Zero infrastructure management</li>
              <li>✅ Auto-scaling to zero and infinity</li>
              <li>✅ Pay only for what you use</li>
              <li>✅ Fast time-to-market</li>
            </ul>
          </div>
          <div>
            <h5 className="text-red-400 font-semibold mb-2">Cons</h5>
            <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
              <li>⚠️ Cold start latency</li>
              <li>⚠️ Vendor lock-in</li>
              <li>⚠️ Difficult to debug/test locally</li>
              <li>⚠️ Execution time limits</li>
            </ul>
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 18 – Monolithic Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MonolithicArchitecture() {
  return (
    <Section
      id="monolithic"
      number={18}
      title="Monolithic Architecture"
      icon={<Box className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        A <strong className="text-slate-900 dark:text-white">monolith</strong> is a single, unified application where all components—UI, business logic,
        data access—are packaged and deployed as <strong className="text-slate-900 dark:text-white">one unit</strong>. It&apos;s the default starting point for most
        applications and remains the right choice for many use cases. The key risk is that as the codebase grows, it becomes
        tightly coupled and difficult to scale independently.
      </p>

      <Card className="mb-6">
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 260" className="w-full min-w-[700px] lg:min-w-0" aria-label="Monolithic architecture as a single deployment unit">
          {/* Big monolith box */}
          <motion.rect x="100" y="20" width="500" height="200" rx="20"
            fill="#8b5cf6" opacity="0.08" stroke="#8b5cf6" strokeWidth="2"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          />
          <text x="350" y="50" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Single Deployment Unit</text>

          {/* Internal modules */}
          {[
            { label: 'UI Layer', x: 130, y: 70, w: 130, color: '#3b82f6' },
            { label: 'Auth Module', x: 280, y: 70, w: 130, color: '#06b6d4' },
            { label: 'API Routes', x: 430, y: 70, w: 130, color: '#10b981' },
            { label: 'Business Logic', x: 130, y: 140, w: 200, color: '#f59e0b' },
            { label: 'Data Access', x: 350, y: 140, w: 210, color: '#ef4444' },
          ].map((mod, i) => (
            <motion.g key={mod.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }}>
              <rect x={mod.x} y={mod.y} width={mod.w} height="50" rx="8"
                fill={mod.color} opacity="0.15" stroke={mod.color} strokeWidth="1" />
              <text x={mod.x + mod.w / 2} y={mod.y + 30} textAnchor="middle" fill="white" fontSize="11">{mod.label}</text>
            </motion.g>
          ))}

          {/* Single DB */}
          <motion.rect x="280" y="235" width="140" height="20" rx="5" fill="#64748b" opacity="0.3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8 }} viewport={{ once: true }} />
          <text x="350" y="250" textAnchor="middle" fill="#94a3b8" fontSize="10">Single Database</text>
        </svg>
</div>
</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-green-400 font-semibold mb-2">When to Choose Monolith</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>✅ Small team (1-10 developers)</li>
            <li>✅ Early-stage product / MVP</li>
            <li>✅ Simple domain with clear boundaries</li>
            <li>✅ Low operational complexity</li>
            <li>✅ Shared data model, strong consistency needed</li>
          </ul>
        </Card>
        <Card>
          <h5 className="text-red-400 font-semibold mb-2">When It Becomes Problematic</h5>
          <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
            <li>⚠️ Team grows beyond 2 pizza teams</li>
            <li>⚠️ Deploy cycle becomes a bottleneck</li>
            <li>⚠️ Different modules need different scaling</li>
            <li>⚠️ Technology decisions become permanent</li>
            <li>⚠️ A bug in one module crashes everything</li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 19 – Scalability
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ScalabilitySection() {
  return (
    <Section
      id="scalability"
      number={19}
      title="Scalability: Vertical vs Horizontal"
      icon={<TrendingUp className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">Scalability</strong> is the ability of a system to handle increased load by adding resources.
        There are two fundamental approaches, each with distinct trade-offs.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Vertical */}
        <motion.div variants={slideIn('left')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-blue-500/30 h-full">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-blue-400" /> Vertical Scaling (Scale Up)
            </h4>
            <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 300 200" className="w-full mb-4 min-w-[300px] lg:min-w-0" aria-label="Vertical scaling: making one server bigger">
              {/* Small server growing */}
              <motion.rect x="50" y="120" width="80" height="60" rx="8" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2" />
              <text x="90" y="155" textAnchor="middle" fill="white" fontSize="10">4 CPU</text>
              <text x="90" y="170" textAnchor="middle" fill="#93c5fd" fontSize="9">16 GB</text>

              {/* Arrow */}
              <motion.path d="M 145 150 L 170 150" stroke="white" strokeWidth="2" markerEnd="url(#arrowWhite)"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.4 }}
                viewport={{ once: true }} />

              {/* Big server */}
              <motion.rect x="180" y="60" width="100" height="120" rx="10" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="2"
                initial={{ height: 60, y: 120 }}
                whileInView={{ height: 120, y: 60 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              />
              <text x="230" y="110" textAnchor="middle" fill="white" fontSize="10">32 CPU</text>
              <text x="230" y="125" textAnchor="middle" fill="#93c5fd" fontSize="9">256 GB</text>
              <text x="230" y="140" textAnchor="middle" fill="#93c5fd" fontSize="9">NVMe SSD</text>
            </svg>
</div>
</div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Add more power to an existing machine: more CPU, RAM, faster storage.</p>
            <ul className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
              <li>✅ Simpler—no distributed systems complexity</li>
              <li>✅ No code changes needed</li>
              <li>⚠️ Hardware limits (can&apos;t scale forever)</li>
              <li>⚠️ Single point of failure remains</li>
              <li>⚠️ Expensive at high end</li>
            </ul>

            <defs>
              <marker id="arrowWhite" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="white" />
              </marker>
            </defs>
          </Card>
        </motion.div>

        {/* Horizontal */}
        <motion.div variants={slideIn('right')} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-green-500/30 h-full">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-green-400" /> Horizontal Scaling (Scale Out)
            </h4>
            <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 300 200" className="w-full mb-4 min-w-[300px] lg:min-w-0" aria-label="Horizontal scaling: adding more servers">
              {/* Single server */}
              <motion.rect x="30" y="80" width="60" height="50" rx="8" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="2" />
              <text x="60" y="110" textAnchor="middle" fill="white" fontSize="9">Srv 1</text>

              {/* Arrow */}
              <motion.path d="M 100 105 L 120 105" stroke="white" strokeWidth="2"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.4 }}
                viewport={{ once: true }} />

              {/* Multiple servers */}
              {[0, 1, 2, 3].map((i) => (
                <motion.g key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <rect x={130 + (i % 2) * 75} y={60 + Math.floor(i / 2) * 65} width="60" height="50" rx="8"
                    fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="2" />
                  <text x={160 + (i % 2) * 75} y={90 + Math.floor(i / 2) * 65} textAnchor="middle" fill="white" fontSize="9">
                    Srv {i + 1}
                  </text>
                </motion.g>
              ))}
            </svg>
</div>
</div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Add more machines to distribute the load. Each handles a portion of traffic.</p>
            <ul className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
              <li>✅ Virtually unlimited scale</li>
              <li>✅ Built-in redundancy / fault tolerance</li>
              <li>✅ Cost-effective with commodity hardware</li>
              <li>⚠️ Distributed systems complexity</li>
              <li>⚠️ Requires load balancing & state management</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <Card>
        <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Comparison Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400">Aspect</th>
                <th className="text-left py-2 text-blue-400">Vertical</th>
                <th className="text-left py-2 text-green-400">Horizontal</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {[
                ['Cost curve', 'Exponential', 'Linear'],
                ['Complexity', 'Low', 'High (distributed)'],
                ['Downtime for upgrade', 'Yes (restart needed)', 'No (rolling deploys)'],
                ['Fault tolerance', 'None (SPOF)', 'Built-in redundancy'],
                ['Max scale', 'Hardware ceiling', 'Virtually unlimited'],
                ['Data consistency', 'Easy (single node)', 'Hard (CAP theorem)'],
              ].map(([aspect, v, h]) => (
                <tr key={aspect} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 text-slate-900 dark:text-white font-medium">{aspect}</td>
                  <td className="py-2">{v}</td>
                  <td className="py-2">{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 20 – Bottlenecks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Bottlenecks() {
  const causes = [
    { name: 'Database Queries', icon: <Database className="w-5 h-5 text-red-400" />, solution: 'Indexing, query optimization, read replicas, caching (Redis)' },
    { name: 'Network Latency', icon: <Globe className="w-5 h-5 text-red-400" />, solution: 'CDNs, edge computing, connection pooling, gRPC over REST' },
    { name: 'CPU-Bound Processing', icon: <Cpu className="w-5 h-5 text-red-400" />, solution: 'Async processing, worker queues, horizontal scaling, algorithm optimization' },
    { name: 'Memory Leaks', icon: <HardDrive className="w-5 h-5 text-red-400" />, solution: 'Profiling, garbage collection tuning, memory-efficient data structures' },
    { name: 'Single Point of Failure', icon: <AlertTriangle className="w-5 h-5 text-red-400" />, solution: 'Redundancy, load balancers, circuit breakers, health checks' },
    { name: 'Lock Contention', icon: <Lock className="w-5 h-5 text-red-400" />, solution: 'Lock-free data structures, optimistic concurrency, sharding' },
  ];

  return (
    <Section
      id="bottlenecks"
      number={20}
      title="Bottlenecks: Causes & Resolution"
      icon={<AlertTriangle className="w-6 h-6" />}
    >
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        A <strong className="text-slate-900 dark:text-white">bottleneck</strong> is any component that limits the overall system throughput. No matter how fast
        the rest of the system is, performance is bounded by the slowest component (Amdahl&apos;s Law). Identifying and resolving
        bottlenecks is a continuous process—fixing one often reveals the next.
      </p>

      <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
      >
        {causes.map((c, i) => (
          <motion.div key={c.name} variants={fadeUp} custom={i}>
            <Card className="h-full border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {c.icon}
                <h5 className="text-slate-900 dark:text-white font-semibold text-sm">{c.name}</h5>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                <strong className="text-green-400">Fix:</strong> {c.solution}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Resolution strategies */}
      <Card>
        <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Systematic Bottleneck Resolution</h4>
        <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 100" className="w-full min-w-[800px] lg:min-w-0" aria-label="Bottleneck resolution pipeline">
          {[
            { label: 'Monitor', color: '#3b82f6', desc: 'APM, Logs' },
            { label: 'Profile', color: '#8b5cf6', desc: 'CPU, Memory' },
            { label: 'Identify', color: '#06b6d4', desc: 'Find root cause' },
            { label: 'Optimize', color: '#10b981', desc: 'Apply fix' },
            { label: 'Validate', color: '#f59e0b', desc: 'Load test' },
          ].map((step, i) => {
            const x = 30 + i * 155;
            return (
              <g key={step.label}>
                {i > 0 && (
                  <motion.line x1={x - 25} y1="45" x2={x - 5} y2="45" stroke="#94a3b8" strokeWidth="2"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }} />
                )}
                <motion.rect x={x} y="20" width="130" height="50" rx="10" fill={step.color} opacity="0.15" stroke={step.color} strokeWidth="2"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                />
                <text x={x + 65} y="42" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{step.label}</text>
                <text x={x + 65} y="58" textAnchor="middle" fill="#94a3b8" fontSize="9">{step.desc}</text>
              </g>
            );
          })}
        </svg>
</div>
</div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
          <strong className="text-slate-900 dark:text-white">Remember:</strong> Premature optimization is the root of all evil (Knuth). Always measure first,
          then optimize the actual bottleneck—not what you <em>think</em> is slow.
        </p>
      </Card>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE OF CONTENTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TableOfContents() {
  const items = [
    { id: 'design-vs-architecture', label: 'Design vs Architecture' },
    { id: 'waterfall', label: 'Waterfall Model' },
    { id: 'agile', label: 'Agile Methods' },
    { id: 'quality-attributes', label: 'Quality Attributes' },
    { id: 'arch-structures', label: 'Architectural Structures' },
    { id: 'centralized-vs-decentralized', label: 'Centralized vs Decentralized' },
    { id: 'layered', label: 'Layered Architecture' },
    { id: 'n-tier', label: 'N-Tier Architecture' },
    { id: 'mvc', label: 'MVC Pattern' },
    { id: 'client-server', label: 'Client-Server' },
    { id: 'p2p', label: 'Peer-to-Peer (P2P)' },
    { id: 'broker', label: 'Broker Pattern' },
    { id: 'pipe-filter', label: 'Pipe and Filter' },
    { id: 'event-driven', label: 'Event-Driven Architecture' },
    { id: 'pub-sub', label: 'Publish-Subscribe' },
    { id: 'hexagonal', label: 'Hexagonal Architecture' },
    { id: 'serverless', label: 'Serverless Architecture' },
    { id: 'monolithic', label: 'Monolithic Architecture' },
    { id: 'scalability', label: 'Scalability' },
    { id: 'bottlenecks', label: 'Bottlenecks' },
  ];

  return (
    <motion.nav
      className="mb-16 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 bg-slate-200/60 dark:bg-slate-800/30 backdrop-blur-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-400" /> Table of Contents
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-all text-sm"
          >
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-6">{String(i + 1).padStart(2, '0')}</span>
            {item.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN MODULE COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const moduleQuestions = [
  {
    "id": "1",
    "text": "What is the primary difference between Software Design and Software Architecture?",
    "options": [
      "Design is strategic (long-term decisions), Architecture is tactical (short-term implementation).",
      "Architecture focuses on high-level structures and attributes (scalability, availability), while Design focuses on module-level implementation and code structure.",
      "They are synonymous terms for the exact same process.",
      "Architecture only applies to backend systems, while Design applies to front-end UIs."
    ],
    "correctAnswer": 1,
    "explanation": "Architecture deals with the macro-level system structure, deployment, and quality attributes (scalability, availability). Design is tactical, dealing with how specific components and algorithms are implemented."
  },
  {
    "id": "2",
    "text": "In Hexagonal Architecture (Ports & Adapters), what is the primary purpose of a Port?",
    "options": [
      "To connect the application to the internet via TCP/IP.",
      "To define an interface that the core domain requires to communicate with the outside world, without depending on a specific implementation.",
      "To act as a reverse proxy for load balancing incoming HTTP requests.",
      "To directly execute SQL queries against the database."
    ],
    "correctAnswer": 1,
    "explanation": "Ports are simply interfaces defined by the core domain. They dictate *what* the domain needs (e.g., IUserRepository) without caring *how* it is implemented. Adapters then implement these ports."
  },
  {
    "id": "3",
    "text": "Which architectural strategy is best suited for scaling a stateless web server that is experiencing high CPU load?",
    "options": [
      "Vertical Scaling (scaling up the server RAM).",
      "Database Sharding (partitioning the data).",
      "Horizontal Scaling (adding more server instances behind a load balancer).",
      "Implementing the Singleton Pattern."
    ],
    "correctAnswer": 2,
    "explanation": "For stateless components under heavy CPU load, Horizontal Scaling (scaling out) is the most effective and resilient strategy, allowing a load balancer to distribute traffic across many smaller nodes."
  }
];

export default function Module1() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Module 1 of System Design
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            Software Architecture
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              & Scalability
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive deep-dive into architectural patterns, quality attributes, scalability strategies,
            and the fundamental decisions that shape every software system.
          </p>
        </motion.header>

        {/* Table of Contents */}
        <TableOfContents />

        {/* All 20 Sections */}
        <DesignVsArchitecture />
        <WaterfallModel />
        <AgileMethods />
        <QualityAttributes />
        <ArchitecturalStructures />
        <CentralizedVsDecentralized />
        <LayeredArchitecture />
        <NTierArchitecture />
        <MVCPattern />
        <ClientServer />
        <PeerToPeer />
        <BrokerPattern />
        <PipeAndFilter />
        <EventDriven />
        <PubSub />
        <HexagonalArchitecture />
        <ServerlessArchitecture />
        <MonolithicArchitecture />
        <ScalabilitySection />
        <Bottlenecks />

        {/* Footer */}
        <motion.footer
          className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Module 1 Complete — 20 Topics Covered
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Software Architecture & Scalability • System Design Series
          </p>
        </motion.footer>
      </div>
    

      {/* Module Quiz */}
      <Quiz title="Architecture & Scalability" questions={moduleQuestions} />
    </div>
  );
}
