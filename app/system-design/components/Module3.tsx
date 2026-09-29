'use client';

import React, { useState, useEffect } from 'react';
import Quiz from './Quiz';
import InteractivePubSub from './InteractivePubSub';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Layers,
  Globe,
  Zap,
  Triangle,
  MessageSquare,
  RefreshCw,
  Shield,
  Search,
  Database,
  Activity,
  Server,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Network,
  Container,
  Radio,
  GitBranch,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Code2,
  ExternalLink,
  Workflow,
  CircleDot,
  Cpu,
  HardDrive,
  Lock,
  Unlock,
  BarChart3,
  Settings,
  Cloud,
  Route,
} from 'lucide-react';

/* ─────────────────────── helpers ─────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as any },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

const SectionTitle = ({
  icon: Icon,
  number,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  subtitle: string;
}) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    className="mb-8"
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 text-sm font-bold">
        {number}
      </span>
      <Icon className="w-6 h-6 text-blue-400" />
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    <p className="text-slate-600 dark:text-slate-400 text-sm ml-[52px]">{subtitle}</p>
  </motion.div>
);

const InfoCard = ({
  title,
  children,
  accent = 'blue',
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => {
  const borderColors: Record<string, string> = {
    blue: 'border-blue-500/30 hover:border-blue-500/60',
    purple: 'border-purple-500/30 hover:border-purple-500/60',
    green: 'border-emerald-500/30 hover:border-emerald-500/60',
    orange: 'border-orange-500/30 hover:border-orange-500/60',
    pink: 'border-pink-500/30 hover:border-pink-500/60',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
  };
  const titleColors: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    pink: 'text-pink-400',
    cyan: 'text-cyan-400',
  };
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`bg-slate-800/60 backdrop-blur rounded-xl border ${borderColors[accent]} p-6 transition-colors duration-300`}
    >
      <h3 className={`text-lg font-semibold mb-3 ${titleColors[accent]}`}>{title}</h3>
      <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-2">{children}</div>
    </motion.div>
  );
};

const Divider = () => (
  <div className="my-16 flex items-center gap-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
    <div className="w-2 h-2 rounded-full bg-purple-500/50" />
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
  </div>
);

/* ─────────────────── ANIMATED SVG COMPONENTS ─────────────────── */

/** SCS Architecture Diagram */
const SCSDiagram = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const scsNodes = [
    { label: 'SCS: Orders', x: 80, y: 60, color: '#818cf8' },
    { label: 'SCS: Catalog', x: 300, y: 60, color: '#34d399' },
    { label: 'SCS: Users', x: 520, y: 60, color: '#f472b6' },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
    >
      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
        Self-Contained Systems Architecture
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 680 320" className="w-full max-w-2xl mx-auto min-w-[680px] lg:min-w-0">
        {/* Browser bar */}
        <rect x="180" y="10" width="320" height="30" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="340" y="30" textAnchor="middle" fill="#94a3b8" fontSize="11">Browser</text>

        {/* Connections from browser */}
        {scsNodes.map((node, i) => (
          <motion.line
            key={`conn-${i}`}
            x1="340"
            y1="40"
            x2={node.x + 70}
            y2={node.y}
            stroke={node.color}
            strokeWidth="1.5"
            strokeDasharray="6 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
          />
        ))}

        {/* SCS Boxes */}
        {scsNodes.map((node, i) => (
          <g key={i}>
            <motion.rect
              x={node.x}
              y={node.y}
              width="140"
              height="200"
              rx="8"
              fill="#0f172a"
              stroke={activeNode === i ? node.color : '#475569'}
              strokeWidth={activeNode === i ? 2 : 1}
              onMouseEnter={() => setActiveNode(i)}
              onMouseLeave={() => setActiveNode(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              style={{ cursor: 'pointer' }}
            />
            <text x={node.x + 70} y={node.y + 22} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="bold">
              {node.label}
            </text>
            {/* Internal layers */}
            {['UI Layer', 'Logic', 'Data Store'].map((layer, li) => (
              <g key={li}>
                <rect
                  x={node.x + 12}
                  y={node.y + 36 + li * 52}
                  width="116"
                  height="40"
                  rx="4"
                  fill={`${node.color}15`}
                  stroke={`${node.color}40`}
                  strokeWidth="1"
                />
                <text
                  x={node.x + 70}
                  y={node.y + 60 + li * 52}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {layer}
                </text>
              </g>
            ))}
          </g>
        ))}

        {/* Async link between SCS */}
        <motion.path
          d="M220 200 Q 300 250 370 200"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
        />
        <text x="300" y="248" textAnchor="middle" fill="#fbbf24" fontSize="9">
          async events
        </text>
        <motion.path
          d="M440 200 Q 520 250 590 200"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
        />
        <text x="520" y="248" textAnchor="middle" fill="#fbbf24" fontSize="9">
          async events
        </text>

        {/* Legend */}
        <rect x="200" y="280" width="280" height="30" rx="6" fill="#1e293b80" stroke="#334155" strokeWidth="1" />
        <text x="340" y="300" textAnchor="middle" fill="#64748b" fontSize="10">
          Each SCS = independent deployment, own DB, own UI
        </text>
      </svg>
</div>
</div>
    </motion.div>
  );
};

/** ESI Assembly Diagram */
const ESIDiagram = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
  >
    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
      Edge Side Includes — Request Assembly Flow
    </h4>
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 260" className="w-full max-w-2xl mx-auto min-w-[700px] lg:min-w-0">
      {/* Client */}
      <motion.rect x="20" y="90" width="100" height="50" rx="8" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5"
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} />
      <text x="70" y="120" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="bold">Client</text>

      {/* Arrow 1 */}
      <motion.line x1="120" y1="115" x2="190" y2="115" stroke="#475569" strokeWidth="1.5"
        markerEnd="url(#arrowGray)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />

      {/* Varnish / CDN */}
      <motion.rect x="190" y="70" width="140" height="90" rx="10" fill="#0f172a" stroke="#f472b6" strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} />
      <text x="260" y="100" textAnchor="middle" fill="#f472b6" fontSize="12" fontWeight="bold">Varnish / CDN</text>
      <text x="260" y="118" textAnchor="middle" fill="#94a3b8" fontSize="9">ESI Processor</text>
      <text x="260" y="132" textAnchor="middle" fill="#64748b" fontSize="8">&lt;esi:include .../&gt;</text>
      <text x="260" y="148" textAnchor="middle" fill="#64748b" fontSize="8">parses &amp; replaces</text>

      {/* Arrows to backends */}
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1="330"
          y1={95 + i * 20}
          x2="420"
          y2={40 + i * 70}
          stroke="#34d399"
          strokeWidth="1"
          strokeDasharray="4 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ delay: 0.7 + i * 0.15, duration: 0.6 }}
        />
      ))}

      {/* Backend Fragments */}
      {[
        { label: 'Header SVC', y: 20, color: '#34d399' },
        { label: 'Product SVC', y: 90, color: '#60a5fa' },
        { label: 'Cart SVC', y: 160, color: '#fbbf24' },
      ].map((svc, i) => (
        <g key={i}>
          <motion.rect x="420" y={svc.y} width="120" height="45" rx="6" fill="#1e293b" stroke={svc.color} strokeWidth="1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.15 }} />
          <text x="480" y={svc.y + 20} textAnchor="middle" fill={svc.color} fontSize="10" fontWeight="bold">{svc.label}</text>
          <text x="480" y={svc.y + 34} textAnchor="middle" fill="#64748b" fontSize="8">HTML fragment</text>
        </g>
      ))}

      {/* Assembled page arrow */}
      <motion.line x1="540" y1="112" x2="600" y2="112" stroke="#818cf8" strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3 }} />
      <motion.rect x="600" y="85" width="90" height="55" rx="8" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} />
      <text x="645" y="108" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="bold">Assembled</text>
      <text x="645" y="124" textAnchor="middle" fill="#64748b" fontSize="9">Full Page</text>

      {/* Arrow marker */}
      <defs>
        <marker id="arrowGray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
      </defs>
    </svg>
</div>
</div>
  </motion.div>
);

/** CAP Theorem Animated Triangle */
const CAPTriangle = () => {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const caps: { label: string; short: string; x: number; y: number; desc: string; color: string }[] = [
    { label: 'Consistency', short: 'C', x: 300, y: 40, desc: 'Every read gets the most recent write', color: '#818cf8' },
    { label: 'Availability', short: 'A', x: 100, y: 250, desc: 'Every request gets a response', color: '#34d399' },
    { label: 'Partition Tolerance', short: 'P', x: 500, y: 250, desc: 'System works despite network failures', color: '#f472b6' },
  ];

  const combos = [
    { pair: 'CP', label: 'CP: MongoDB, HBase', x: 420, y: 130, color: '#c084fc' },
    { pair: 'AP', label: 'AP: Cassandra, DynamoDB', x: 300, y: 270, color: '#fbbf24' },
    { pair: 'CA', label: 'CA: Traditional RDBMS', x: 160, y: 130, color: '#38bdf8' },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
    >
      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
        CAP Theorem — Pick Two (in the presence of partitions)
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 310" className="w-full max-w-xl mx-auto min-w-[600px] lg:min-w-0">
        {/* Triangle edges */}
        <motion.polygon
          points="300,50 90,260 510,260"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
        {/* Pulsing center */}
        <motion.circle
          cx="300"
          cy="185"
          r="20"
          fill="#818cf820"
          stroke="#818cf850"
          strokeWidth="1"
          animate={{ r: [18, 24, 18], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
        <text x="300" y="189" textAnchor="middle" fill="#94a3b8" fontSize="9">CAP</text>

        {/* Vertices */}
        {caps.map((c, i) => (
          <g
            key={i}
            onMouseEnter={() => setHighlighted(c.short)}
            onMouseLeave={() => setHighlighted(null)}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx={c.x}
              cy={c.y}
              r="28"
              fill={highlighted === c.short ? `${c.color}30` : '#1e293b'}
              stroke={c.color}
              strokeWidth={highlighted === c.short ? 2.5 : 1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2, type: "spring" as any }}
            />
            <text x={c.x} y={c.y + 5} textAnchor="middle" fill={c.color} fontSize="16" fontWeight="bold">
              {c.short}
            </text>
            <text x={c.x} y={c.y + (i === 0 ? -38 : 50)} textAnchor="middle" fill={c.color} fontSize="11" fontWeight="600">
              {c.label}
            </text>
            {highlighted === c.short && (
              <motion.text
                x={c.x}
                y={c.y + (i === 0 ? -52 : 65)}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {c.desc}
              </motion.text>
            )}
          </g>
        ))}

        {/* Combo labels */}
        {combos.map((cb, i) => (
          <motion.text
            key={i}
            x={cb.x}
            y={cb.y}
            textAnchor="middle"
            fill={cb.color}
            fontSize="9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1 + i * 0.2 }}
          >
            {cb.label}
          </motion.text>
        ))}
      </svg>
</div>
</div>
    </motion.div>
  );
};

/** API Gateway SVG Diagram */
const APIGatewayDiagram = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
  >
    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
      API Gateway — Single Entry Point Pattern
    </h4>
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 720 300" className="w-full max-w-2xl mx-auto min-w-[720px] lg:min-w-0">
      {/* Clients */}
      {['Web App', 'Mobile', 'Partner'].map((c, i) => (
        <g key={i}>
          <motion.rect
            x="20"
            y={30 + i * 90}
            width="100"
            height="50"
            rx="8"
            fill="#1e293b"
            stroke="#818cf8"
            strokeWidth="1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          />
          <text x="70" y={60 + i * 90} textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="bold">{c}</text>
        </g>
      ))}

      {/* Lines to gateway */}
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1="120"
          y1={55 + i * 90}
          x2="220"
          y2="150"
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
      ))}

      {/* Gateway */}
      <motion.rect
        x="220"
        y="60"
        width="180"
        height="180"
        rx="12"
        fill="#0f172a"
        stroke="#f472b6"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      />
      <text x="310" y="90" textAnchor="middle" fill="#f472b6" fontSize="13" fontWeight="bold">API Gateway</text>
      {['Auth / JWT', 'Rate Limiting', 'Routing', 'Load Balancing', 'Logging'].map((feat, i) => (
        <g key={i}>
          <rect x="240" y={100 + i * 26} width="140" height="20" rx="4" fill="#f472b610" stroke="#f472b630" strokeWidth="0.5" />
          <text x="310" y={114 + i * 26} textAnchor="middle" fill="#94a3b8" fontSize="9">{feat}</text>
        </g>
      ))}

      {/* Lines to services */}
      {[0, 1, 2, 3].map((i) => (
        <motion.line
          key={i}
          x1="400"
          y1="150"
          x2="490"
          y2={40 + i * 70}
          stroke="#34d399"
          strokeWidth="1"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8 + i * 0.1 }}
        />
      ))}

      {/* Backend services */}
      {['User SVC', 'Order SVC', 'Product SVC', 'Payment SVC'].map((s, i) => (
        <g key={i}>
          <motion.rect
            x="490"
            y={20 + i * 70}
            width="110"
            height="42"
            rx="6"
            fill="#1e293b"
            stroke="#34d399"
            strokeWidth="1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          />
          <text x="545" y={46 + i * 70} textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">{s}</text>
        </g>
      ))}

      {/* BFF label */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <rect x="620" y="130" width="90" height="50" rx="6" fill="#1e293b80" stroke="#fbbf2480" strokeWidth="1" />
        <text x="665" y="152" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">BFF Variant</text>
        <text x="665" y="168" textAnchor="middle" fill="#64748b" fontSize="8">Gateway per client</text>
      </motion.g>
    </svg>
</div>
</div>
  </motion.div>
);

/** Service Discovery Animated SVG */
const ServiceDiscoveryDiagram = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
    >
      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
        Service Discovery — Registration &amp; Lookup (Animated)
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 260" className="w-full max-w-xl mx-auto min-w-[600px] lg:min-w-0">
        {/* Registry */}
        <rect x="220" y="20" width="160" height="70" rx="10" fill="#0f172a" stroke="#c084fc" strokeWidth="2" />
        <text x="300" y="50" textAnchor="middle" fill="#c084fc" fontSize="13" fontWeight="bold">Service Registry</text>
        <text x="300" y="68" textAnchor="middle" fill="#64748b" fontSize="9">Consul / Eureka</text>

        {/* Services */}
        {[
          { label: 'SVC A', x: 60, y: 170 },
          { label: 'SVC B', x: 240, y: 170 },
          { label: 'SVC C', x: 420, y: 170 },
        ].map((svc, i) => (
          <g key={i}>
            <rect
              x={svc.x}
              y={svc.y}
              width="120"
              height="50"
              rx="8"
              fill="#1e293b"
              stroke={tick === i ? '#34d399' : '#475569'}
              strokeWidth={tick === i ? 2 : 1}
            />
            <text x={svc.x + 60} y={svc.y + 22} textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
              {svc.label}
            </text>
            <text x={svc.x + 60} y={svc.y + 38} textAnchor="middle" fill="#64748b" fontSize="8">
              10.0.{i}.{i + 1}:808{i}
            </text>
            {/* Heartbeat line */}
            <motion.line
              x1={svc.x + 60}
              y1={svc.y}
              x2="300"
              y2="90"
              stroke={tick === i ? '#c084fc' : '#47556940'}
              strokeWidth={tick === i ? 1.5 : 0.5}
              strokeDasharray="4 3"
            />
            {tick === i && (
              <motion.circle
                cx={svc.x + 60}
                cy={svc.y - 5}
                r="4"
                fill="#c084fc"
                initial={{ cy: svc.y, opacity: 1 }}
                animate={{ cy: 95, opacity: 0 }}
                transition={{ duration: 1 }}
              />
            )}
          </g>
        ))}

        {/* Heartbeat label */}
        <text x="300" y="140" textAnchor="middle" fill="#64748b" fontSize="9">
          ↑ heartbeat / register ↑
        </text>

        {/* Client-side discovery label */}
        <rect x="10" y="240" width="580" height="18" rx="3" fill="#1e293b60" />
        <text x="300" y="254" textAnchor="middle" fill="#94a3b8" fontSize="9">
          Client-side: caller queries registry → gets IP → calls directly | Server-side: load balancer queries registry
        </text>
      </svg>
</div>
</div>
    </motion.div>
  );
};

/** Saga Pattern Flow SVG */
const SagaDiagram = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
  >
    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
      Saga Pattern — Choreography vs Orchestration
    </h4>
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 340" className="w-full max-w-2xl mx-auto min-w-[700px] lg:min-w-0">
      {/* Choreography (top) */}
      <text x="350" y="20" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="bold">
        Choreography (Event-Driven)
      </text>
      {['Order SVC', 'Payment SVC', 'Inventory SVC', 'Shipping SVC'].map((s, i) => (
        <g key={`ch-${i}`}>
          <motion.rect
            x={40 + i * 165}
            y={35}
            width="130"
            height="40"
            rx="6"
            fill="#1e293b"
            stroke="#818cf8"
            strokeWidth="1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
          />
          <text x={105 + i * 165} y={60} textAnchor="middle" fill="#c4b5fd" fontSize="10">{s}</text>
          {i < 3 && (
            <motion.line
              x1={170 + i * 165}
              y1={55}
              x2={205 + i * 165}
              y2={55}
              stroke="#fbbf24"
              strokeWidth="1.5"
              markerEnd="url(#arrowYellow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            />
          )}
        </g>
      ))}
      <text x="350" y="95" textAnchor="middle" fill="#fbbf24" fontSize="9">
        Events flow service → service (no central coordinator)
      </text>

      {/* Divider */}
      <line x1="40" y1="115" x2="660" y2="115" stroke="#334155" strokeWidth="1" />

      {/* Orchestration (bottom) */}
      <text x="350" y="140" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">
        Orchestration (Central Coordinator)
      </text>

      {/* Orchestrator */}
      <motion.rect
        x="250"
        y="150"
        width="200"
        height="45"
        rx="8"
        fill="#0f172a"
        stroke="#34d399"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      />
      <text x="350" y="178" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">Saga Orchestrator</text>

      {/* Services below orchestrator */}
      {['Order', 'Payment', 'Inventory', 'Ship'].map((s, i) => (
        <g key={`or-${i}`}>
          <motion.rect
            x={55 + i * 160}
            y={230}
            width="100"
            height="35"
            rx="6"
            fill="#1e293b"
            stroke="#34d399"
            strokeWidth="1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          />
          <text x={105 + i * 160} y={252} textAnchor="middle" fill="#6ee7b7" fontSize="9">{s}</text>
          <motion.line
            x1="350"
            y1="195"
            x2={105 + i * 160}
            y2={230}
            stroke="#34d39960"
            strokeWidth="1"
            strokeDasharray="4 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          />
        </g>
      ))}

      {/* Compensating note */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
        <rect x="200" y="280" width="300" height="50" rx="6" fill="#7f1d1d20" stroke="#ef444440" strokeWidth="1" />
        <text x="350" y="300" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">Compensating Transactions</text>
        <text x="350" y="316" textAnchor="middle" fill="#94a3b8" fontSize="8">
          On failure → each step has a rollback action (e.g., refund payment)
        </text>
      </motion.g>

      <defs>
        <marker id="arrowYellow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
      </defs>
    </svg>
</div>
</div>
  </motion.div>
);

/** Circuit Breaker Animated State Machine */
const CircuitBreakerSVG = () => {
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');

  useEffect(() => {
    const seq: Array<'closed' | 'open' | 'half-open'> = ['closed', 'open', 'half-open', 'closed'];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % seq.length;
      setState(seq[idx]);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const stateColors: Record<string, string> = {
    closed: '#34d399',
    open: '#ef4444',
    'half-open': '#fbbf24',
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
    >
      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 text-center">
        Circuit Breaker — State Machine (Animated)
      </h4>
      <p className="text-xs text-center mb-4">
        Current state:{' '}
        <span className="font-bold" style={{ color: stateColors[state] }}>
          {state.toUpperCase()}
        </span>
      </p>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 600 240" className="w-full max-w-xl mx-auto min-w-[600px] lg:min-w-0">
        {/* Closed state */}
        <motion.circle
          cx="100"
          cy="120"
          r="50"
          fill={state === 'closed' ? '#34d39920' : '#1e293b'}
          stroke={state === 'closed' ? '#34d399' : '#475569'}
          strokeWidth={state === 'closed' ? 3 : 1.5}
          animate={{ scale: state === 'closed' ? 1.05 : 1 }}
          transition={{ type: "spring" as any }}
        />
        <text x="100" y="115" textAnchor="middle" fill={state === 'closed' ? '#34d399' : '#94a3b8'} fontSize="12" fontWeight="bold">
          CLOSED
        </text>
        <text x="100" y="132" textAnchor="middle" fill="#64748b" fontSize="8">
          Requests pass
        </text>

        {/* Open state */}
        <motion.circle
          cx="500"
          cy="120"
          r="50"
          fill={state === 'open' ? '#ef444420' : '#1e293b'}
          stroke={state === 'open' ? '#ef4444' : '#475569'}
          strokeWidth={state === 'open' ? 3 : 1.5}
          animate={{ scale: state === 'open' ? 1.05 : 1 }}
          transition={{ type: "spring" as any }}
        />
        <text x="500" y="115" textAnchor="middle" fill={state === 'open' ? '#ef4444' : '#94a3b8'} fontSize="12" fontWeight="bold">
          OPEN
        </text>
        <text x="500" y="132" textAnchor="middle" fill="#64748b" fontSize="8">
          Fail fast
        </text>

        {/* Half-Open state */}
        <motion.circle
          cx="300"
          cy="50"
          r="45"
          fill={state === 'half-open' ? '#fbbf2420' : '#1e293b'}
          stroke={state === 'half-open' ? '#fbbf24' : '#475569'}
          strokeWidth={state === 'half-open' ? 3 : 1.5}
          animate={{ scale: state === 'half-open' ? 1.05 : 1 }}
          transition={{ type: "spring" as any }}
        />
        <text x="300" y="46" textAnchor="middle" fill={state === 'half-open' ? '#fbbf24' : '#94a3b8'} fontSize="11" fontWeight="bold">
          HALF-OPEN
        </text>
        <text x="300" y="62" textAnchor="middle" fill="#64748b" fontSize="8">
          Test request
        </text>

        {/* Arrows between states */}
        {/* Closed → Open */}
        <motion.path
          d="M 150 105 Q 300 70 450 105"
          fill="none"
          stroke={state === 'closed' ? '#ef4444' : '#47556960'}
          strokeWidth="1.5"
          strokeDasharray="5 3"
          markerEnd="url(#arrowRed)"
        />
        <text x="300" y="98" textAnchor="middle" fill="#ef4444" fontSize="8">
          failure threshold
        </text>

        {/* Open → Half-Open */}
        <motion.path
          d="M 460 85 Q 400 50 345 55"
          fill="none"
          stroke={state === 'open' ? '#fbbf24' : '#47556960'}
          strokeWidth="1.5"
          strokeDasharray="5 3"
          markerEnd="url(#arrowAmber)"
        />
        <text x="420" y="60" textAnchor="middle" fill="#fbbf24" fontSize="8">
          timeout
        </text>

        {/* Half-Open → Closed (success) */}
        <motion.path
          d="M 260 65 Q 180 60 140 85"
          fill="none"
          stroke={state === 'half-open' ? '#34d399' : '#47556960'}
          strokeWidth="1.5"
          strokeDasharray="5 3"
          markerEnd="url(#arrowGreen)"
        />
        <text x="175" y="60" textAnchor="middle" fill="#34d399" fontSize="8">
          success
        </text>

        {/* Half-Open → Open (failure) */}
        <motion.path
          d="M 340 65 Q 420 60 460 85"
          fill="none"
          stroke={state === 'half-open' ? '#ef4444' : '#47556960'}
          strokeWidth="1.5"
          strokeDasharray="5 3"
          markerEnd="url(#arrowRed)"
        />
        <text x="420" y="50" textAnchor="middle" fill="#ef4444" fontSize="8">
          failure
        </text>

        {/* Legend */}
        <rect x="140" y="195" width="320" height="35" rx="6" fill="#1e293b60" stroke="#334155" strokeWidth="1" />
        <text x="300" y="210" textAnchor="middle" fill="#94a3b8" fontSize="9">
          Libraries: Hystrix (Java) • Polly (.NET) • resilience4j • opossum (Node)
        </text>
        <text x="300" y="224" textAnchor="middle" fill="#64748b" fontSize="8">
          Prevents cascading failures in distributed systems
        </text>

        <defs>
          <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>
</div>
</div>
    </motion.div>
  );
};

/** Kubernetes Architecture SVG */
const KubernetesDiagram = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-6"
  >
    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
      Kubernetes Cluster Architecture
    </h4>
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 320" className="w-full max-w-2xl mx-auto min-w-[700px] lg:min-w-0">
      {/* Cluster boundary */}
      <rect x="10" y="10" width="680" height="300" rx="12" fill="none" stroke="#326ce530" strokeWidth="2" strokeDasharray="6 4" />
      <text x="50" y="32" fill="#326ce5" fontSize="11" fontWeight="bold">K8s Cluster</text>

      {/* Control Plane */}
      <motion.rect
        x="30" y="45" width="640" height="70" rx="8" fill="#326ce510" stroke="#326ce540" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      />
      <text x="60" y="68" fill="#60a5fa" fontSize="11" fontWeight="bold">Control Plane</text>
      {['API Server', 'etcd', 'Scheduler', 'Controller Mgr'].map((c, i) => (
        <g key={i}>
          <rect x={60 + i * 155} y={78} width="130" height="28" rx="5" fill="#1e293b" stroke="#326ce540" strokeWidth="1" />
          <text x={125 + i * 155} y={96} textAnchor="middle" fill="#93c5fd" fontSize="9">{c}</text>
        </g>
      ))}

      {/* Worker Nodes */}
      {[0, 1].map((ni) => (
        <motion.g
          key={ni}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + ni * 0.2 }}
        >
          <rect
            x={30 + ni * 330}
            y={135}
            width="310"
            height="155"
            rx="8"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="1"
          />
          <text x={50 + ni * 330} y={155} fill="#94a3b8" fontSize="10" fontWeight="bold">
            Worker Node {ni + 1}
          </text>
          {/* Pods */}
          {[0, 1, 2].map((pi) => (
            <g key={pi}>
              <rect
                x={45 + ni * 330 + pi * 95}
                y={165}
                width="85"
                height="55"
                rx="6"
                fill="#1e293b"
                stroke="#34d39960"
                strokeWidth="1"
              />
              <text x={87 + ni * 330 + pi * 95} y={183} textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">
                Pod
              </text>
              {/* Container inside pod */}
              <rect
                x={53 + ni * 330 + pi * 95}
                y={190}
                width="68"
                height="22"
                rx="3"
                fill="#34d39910"
                stroke="#34d39930"
                strokeWidth="0.5"
              />
              <text x={87 + ni * 330 + pi * 95} y={205} textAnchor="middle" fill="#6ee7b7" fontSize="7">
                Container
              </text>
            </g>
          ))}
          {/* kubelet / kube-proxy */}
          <rect x={45 + ni * 330} y={230} width="85" height="22" rx="4" fill="#1e293b80" stroke="#47556980" strokeWidth="0.5" />
          <text x={87 + ni * 330} y={245} textAnchor="middle" fill="#64748b" fontSize="8">kubelet</text>
          <rect x={140 + ni * 330} y={230} width="85" height="22" rx="4" fill="#1e293b80" stroke="#47556980" strokeWidth="0.5" />
          <text x={182 + ni * 330} y={245} textAnchor="middle" fill="#64748b" fontSize="8">kube-proxy</text>
          <rect x={235 + ni * 330} y={230} width="85" height="22" rx="4" fill="#1e293b80" stroke="#47556980" strokeWidth="0.5" />
          <text x={277 + ni * 330} y={245} textAnchor="middle" fill="#64748b" fontSize="8">Container RT</text>
        </motion.g>
      ))}

      {/* Service abstraction */}
      <motion.rect
        x="220" y="262" width="260" height="28" rx="6" fill="#818cf810" stroke="#818cf850" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
      />
      <text x="350" y="280" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="bold">
        K8s Service → stable endpoint → routes to Pods
      </text>
    </svg>
</div>
</div>
  </motion.div>
);

/* ─────────────────── Collapsible Section ─────────────────── */
const Collapsible = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-300/50 dark:border-slate-700/50 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-200/60 dark:bg-slate-800/40 hover:bg-slate-300/60 dark:hover:bg-slate-800/70 transition-colors text-left"
      >
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ██  MODULE 3: PRACTICAL IMPLEMENTATION                     ██
   ══════════════════════════════════════════════════════════════ */

const moduleQuestions = [
  {
    "id": "1",
    "text": "According to the CAP Theorem, if a distributed system experiences a network Partition (P), what trade-off must it make?",
    "options": [
      "It must choose between Consistency (C) and Availability (A).",
      "It must choose between Concurrency (C) and Asynchrony (A).",
      "It must shut down immediately to prevent data corruption.",
      "It can magically guarantee both Consistency and Availability."
    ],
    "correctAnswer": 0,
    "explanation": "The CAP theorem states that during a network Partition (which is inevitable in distributed systems), a system must choose between being Available (but potentially returning stale data) or Consistent (returning an error instead of stale data)."
  },
  {
    "id": "2",
    "text": "What is the primary purpose of the Circuit Breaker pattern?",
    "options": [
      "To permanently block IP addresses of malicious users.",
      "To gracefully handle and prevent cascading failures when a downstream service is struggling or unresponsive.",
      "To shut off power to the data center during an electrical surge.",
      "To route traffic to the fastest available database replica."
    ],
    "correctAnswer": 1,
    "explanation": "A Circuit Breaker detects when a downstream service is failing. It \"trips\" (opens) to immediately fail fast instead of waiting for timeouts, giving the struggling service time to recover and preventing upstream services from also failing."
  },
  {
    "id": "3",
    "text": "In the Saga pattern, how does \"Choreography\" differ from \"Orchestration\"?",
    "options": [
      "Choreography uses a central controller, while Orchestration uses events.",
      "Choreography relies on services publishing and reacting to events independently, while Orchestration relies on a central controller coordinating the transactions.",
      "Choreography is only used for monoliths, Orchestration is for microservices.",
      "They are exactly the same thing."
    ],
    "correctAnswer": 1,
    "explanation": "Choreography is decentralized (services react to each other's events like dancers). Orchestration is centralized (a central Orchestrator service tells each service exactly what to do, like a conductor)."
  }
];

export default function Module3() {
  return (
    <section className="space-y-12">
      {/* Module header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-medium mb-4">
          <Cpu className="w-3.5 h-3.5" />
          Module 3 — Practical Implementation
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Architecture Patterns &amp; Real-World Implementation
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
          From self-contained systems to Kubernetes orchestration — deep dive into the patterns,
          protocols, and trade-offs that power modern distributed architectures.
        </p>
      </motion.div>

      {/* ──────────────────── 1. SELF-CONTAINED SYSTEMS ──────────────────── */}
      <div>
        <SectionTitle
          icon={Box}
          number="01"
          title="Self-Contained Systems (SCS)"
          subtitle="Autonomous web applications with their own UI, logic, and data store"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="What is an SCS?" accent="purple">
            <p>
              A <strong className="text-purple-300">Self-Contained System</strong> is an autonomous web application
              that owns its <em>complete vertical slice</em>: user interface, business logic, and persistent data.
              Unlike traditional microservices that expose only APIs, each SCS delivers its own HTML pages,
              making it independently deployable and usable.
            </p>
            <p>
              The SCS architecture was popularized by the <em>innoQ</em> consulting group as a pragmatic
              approach to decomposing monoliths — especially for teams that want service autonomy without
              the operational complexity of micro-frontends.
            </p>
          </InfoCard>

          <InfoCard title="SCS vs Microservices" accent="blue">
            <ul className="space-y-1">
              <li>• <strong className="text-blue-300">Granularity:</strong> SCS = coarser-grained (one per bounded context); microservices = finer-grained (many per context)</li>
              <li>• <strong className="text-blue-300">UI ownership:</strong> SCS includes its own web UI; microservices typically delegate UI to a separate frontend</li>
              <li>• <strong className="text-blue-300">Communication:</strong> SCS prefer async + links between UIs; microservices rely on APIs (REST/gRPC)</li>
              <li>• <strong className="text-blue-300">Team size:</strong> SCS = one team per system; microservices might have 3-10 services per team</li>
              <li>• <strong className="text-blue-300">Data:</strong> Both own their data; SCS explicitly forbids shared databases</li>
            </ul>
          </InfoCard>
        </div>

        <InfoCard title="Key SCS Principles" accent="green">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-emerald-400 font-semibold mb-1">🔹 Autonomous</p>
              <p>Each SCS can be developed, tested, deployed, and scaled independently. No coordination needed with other SCS for releases.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-1">🔹 Web-Native Integration</p>
              <p>SCS integrate at the UI level using links and redirects — the simplest and most resilient integration approach. No shared frontend runtime.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-1">🔹 Asynchronous Communication</p>
              <p>Data replication via events. No synchronous inter-SCS calls during request handling. This prevents cascading failures and tight coupling.</p>
            </div>
          </div>
        </InfoCard>

        <SCSDiagram />

        <Collapsible title="💡 When to choose SCS over Microservices">
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <p>
              SCS shines when your organization has <strong>3-8 teams</strong>, each owning a distinct business domain
              (e.g., checkout, catalog, user management). The key indicator is: <em>"Does each team need to deliver
              complete user-facing features independently?"</em>
            </p>
            <p>
              If yes → SCS. If the teams primarily build backend services consumed by a single frontend team → traditional microservices.
              Many real-world architectures use a <strong>hybrid</strong>: SCS for the main verticals, with fine-grained microservices
              behind each SCS for internal decomposition.
            </p>
          </div>
        </Collapsible>
      </div>

      <Divider />

      {/* ──────────────────── 2. FRONTEND INTEGRATION ──────────────────── */}
      <div>
        <SectionTitle
          icon={Globe}
          number="02"
          title="Frontend Integration Strategies"
          subtitle="Monolithic vs modular frontends — links, redirects, transclusion, and ROCA"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Monolithic Frontend" accent="orange">
            <p>
              A single frontend application (often a SPA) that calls multiple backend services. This is the
              <strong className="text-orange-300"> most common approach</strong> but creates a deployment bottleneck:
              all teams must coordinate releases of the single frontend codebase.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              <strong>Problems:</strong> Coupling between teams, slow CI/CD, technology lock-in, and a single
              point of failure for all user-facing features.
            </p>
          </InfoCard>

          <InfoCard title="Modular Frontend (Micro Frontends)" accent="cyan">
            <p>
              Each team owns and deploys its own frontend fragment. The browser assembles the full page from
              independently deployed pieces. Approaches include:
            </p>
            <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <li>• <strong className="text-cyan-300">Links &amp; Redirects:</strong> Simplest. Each SCS is a standalone page. Navigation = hyperlinks. Zero coupling.</li>
              <li>• <strong className="text-cyan-300">iframes:</strong> Embed one SCS inside another. Strong isolation but poor UX (scrolling, sizing).</li>
              <li>• <strong className="text-cyan-300">JavaScript Transclusion:</strong> One SCS loads a fragment from another via <code className="text-xs bg-white dark:bg-slate-800 px-1 rounded">fetch()</code> + DOM injection.</li>
              <li>• <strong className="text-cyan-300">Web Components:</strong> Encapsulated custom elements. Framework-agnostic.</li>
              <li>• <strong className="text-cyan-300">Module Federation:</strong> Webpack 5 / Vite feature to share JS modules at runtime between builds.</li>
            </ul>
          </InfoCard>
        </div>

        <InfoCard title="ROCA — Resource-Oriented Client Architecture" accent="pink">
          <p>
            ROCA is an architectural style for web applications that emphasizes <strong className="text-pink-300">server-rendered HTML</strong>,
            progressive enhancement, and REST principles. The key rules:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div className="space-y-1">
              <p>✅ Server renders full HTML pages (no JSON APIs for UI)</p>
              <p>✅ Every significant UI state has a unique URL</p>
              <p>✅ Browser history works correctly (back/forward)</p>
              <p>✅ JavaScript only <em>enhances</em> — page works without it</p>
            </div>
            <div className="space-y-1">
              <p>❌ No single-page application (SPA) patterns</p>
              <p>❌ No client-side routing that breaks the URL</p>
              <p>❌ No API calls that replace the entire page content</p>
              <p>❌ No server-side sessions for page state</p>
            </div>
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-xs">
            ROCA aligns naturally with SCS because each system renders its own HTML — no shared JavaScript framework needed.
            Modern implementations use libraries like <strong>htmx</strong> or <strong>Hotwire/Turbo</strong> to add interactivity
            while staying server-rendered.
          </p>
        </InfoCard>

        <CodeBlock
          language="html"
          code={`<!-- JavaScript Transclusion Example -->
<div id="product-recommendations">
  <!-- Fragment loaded from Recommendations SCS -->
</div>

<script>
  fetch('https://recommendations.internal/fragment/user/42')
    .then(res => res.text())
    .then(html => {
      document.getElementById('product-recommendations').innerHTML = html;
    })
    .catch(() => {
      // Graceful degradation — hide the section
      document.getElementById('product-recommendations').style.display = 'none';
    });
</script>`}
        />
      </div>

      <Divider />

      {/* ──────────────────── 3. ESI ──────────────────── */}
      <div>
        <SectionTitle
          icon={Layers}
          number="03"
          title="Edge Side Includes (ESI)"
          subtitle="Server-side HTML fragment assembly at the CDN / reverse proxy layer"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="How ESI Works" accent="pink">
            <p>
              ESI is a markup language (W3C spec, 2001) that lets a <strong className="text-pink-300">caching proxy</strong>
              (like Varnish, Akamai, or Fastly) assemble a page from multiple backend fragments before sending it to the client.
            </p>
            <p className="mt-2">
              The origin server returns HTML containing <code className="text-xs bg-white dark:bg-slate-800 px-1 rounded">&lt;esi:include&gt;</code> tags.
              The ESI processor fetches each referenced fragment (potentially from different backends), replaces the tags
              with the fragment content, and sends the assembled page to the browser.
            </p>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-xs">
              Each fragment can have its own <strong>cache TTL</strong>. A product description might cache for 1 hour
              while a shopping cart fragment is never cached — all on the same page.
            </p>
          </InfoCard>

          <InfoCard title="ESI vs SSI" accent="blue">
            <table className="w-full text-xs mt-1">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700">
                  <th className="text-left py-1.5 text-slate-600 dark:text-slate-400 font-medium">Feature</th>
                  <th className="text-left py-1.5 text-blue-400 font-medium">ESI</th>
                  <th className="text-left py-1.5 text-emerald-400 font-medium">SSI</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-1.5">Processed by</td><td>CDN / Reverse Proxy</td><td>Web Server (Nginx/Apache)</td></tr>
                <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-1.5">Caching</td><td>Per-fragment cache control</td><td>No per-fragment caching</td></tr>
                <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-1.5">Error handling</td><td>&lt;esi:try&gt; / &lt;esi:except&gt;</td><td>None (breaks page)</td></tr>
                <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-1.5">Conditional logic</td><td>&lt;esi:choose&gt; / &lt;esi:when&gt;</td><td>Limited #if directives</td></tr>
                <tr><td className="py-1.5">Multi-origin</td><td>Yes — fragments from different hosts</td><td>Same server only</td></tr>
              </tbody>
            </table>
          </InfoCard>
        </div>

        <ESIDiagram />

        <CodeBlock
          language="html"
          code={`<!-- ESI Template served by origin backend -->
<html>
<body>
  <!-- Header fragment (cached 24h) -->
  <esi:include src="/fragments/header" />

  <!-- Product content (cached 1h) -->
  <esi:include src="/services/product/42/fragment" />

  <!-- Shopping cart (never cached, per-user) -->
  <esi:try>
    <esi:attempt>
      <esi:include src="/services/cart/fragment" />
    </esi:attempt>
    <esi:except>
      <div class="cart-fallback">Cart unavailable</div>
    </esi:except>
  </esi:try>

  <esi:include src="/fragments/footer" />
</body>
</html>

<!-- Varnish VCL config to enable ESI processing -->
<!-- sub vcl_backend_response { set beresp.do_esi = true; } -->`}
        />
      </div>

      <Divider />

      {/* ──────────────────── 4. ASYNCHRONOUS MICROSERVICES ──────────────────── */}
      <div>
        <SectionTitle
          icon={Zap}
          number="04"
          title="Asynchronous Microservices"
          subtitle="Event-driven architecture, Event Sourcing, and data replication patterns"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Event-Driven Architecture" accent="green">
            <p>
              Instead of services calling each other synchronously, they communicate by <strong className="text-emerald-300">
              publishing events</strong> to a message broker. Consumers process events at their own pace.
            </p>
            <div className="mt-3 space-y-2">
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-emerald-400 font-semibold text-xs mb-1">Domain Events</p>
                <p className="text-xs">Something that happened: <code className="bg-slate-700 px-1 rounded">OrderPlaced</code>, <code className="bg-slate-700 px-1 rounded">PaymentReceived</code>, <code className="bg-slate-700 px-1 rounded">ItemShipped</code>. Named in past tense.</p>
              </div>
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-emerald-400 font-semibold text-xs mb-1">Integration Events</p>
                <p className="text-xs">Cross-service events published to a broker. Slim payload + reference ID. Consumers fetch details if needed.</p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Event Sourcing" accent="purple">
            <p>
              Instead of storing current state, store a <strong className="text-purple-300">sequence of state-changing events</strong>.
              The current state is derived by replaying events. The event log is the source of truth.
            </p>
            <div className="mt-3 bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-lg text-xs font-mono space-y-1">
              <p className="text-purple-300"># Event Store for Order #42</p>
              <p>1. OrderCreated &#123; items: [A, B], total: $150 &#125;</p>
              <p>2. ItemRemoved &#123; item: B, newTotal: $80 &#125;</p>
              <p>3. PaymentAuthorized &#123; method: "card", amount: $80 &#125;</p>
              <p>4. OrderConfirmed &#123; estimatedDelivery: "2024-03-15" &#125;</p>
              <p className="text-slate-500 dark:text-slate-400"># Current state = replay all events → confirmed order, $80, 1 item</p>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-xs">
              <strong>Benefits:</strong> Full audit trail, temporal queries ("what was the state at time T?"),
              easy debugging, and natural fit with CQRS (Command Query Responsibility Segregation).
            </p>
          </InfoCard>
        </div>

        <InfoCard title="Data Replication & Challenges" accent="orange">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-orange-400 font-semibold mb-2">Replication Patterns</p>
              <ul className="space-y-1.5 text-xs">
                <li>• <strong>Change Data Capture (CDC):</strong> Database log → events. Tools: Debezium, Maxwell.</li>
                <li>• <strong>Event-Carried State Transfer:</strong> Events contain enough data for consumers to build local views.</li>
                <li>• <strong>Materialized Views:</strong> Each service builds read-optimized projections from events.</li>
                <li>• <strong>Outbox Pattern:</strong> Write event to an &quot;outbox&quot; table in the same DB transaction → poller publishes to broker.</li>
              </ul>
            </div>
            <div>
              <p className="text-orange-400 font-semibold mb-2">Key Challenges</p>
              <ul className="space-y-1.5 text-xs">
                <li>⚠️ <strong>Eventual Consistency:</strong> Consumers may see stale data. Design UIs to handle this.</li>
                <li>⚠️ <strong>Ordering:</strong> Events may arrive out of order. Use partitioning keys or sequence numbers.</li>
                <li>⚠️ <strong>Idempotency:</strong> Consumers must handle duplicate events (at-least-once delivery).</li>
                <li>⚠️ <strong>Schema Evolution:</strong> Event schemas change over time. Use versioning or Avro/Protobuf schemas.</li>
                <li>⚠️ <strong>Debugging:</strong> Tracing a request across async boundaries requires correlation IDs and distributed tracing (Jaeger, Zipkin).</li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </div>

      <Divider />

      {/* ──────────────────── 5. CAP THEOREM ──────────────────── */}
      <div>
        <SectionTitle
          icon={Triangle}
          number="05"
          title="CAP Theorem"
          subtitle="The fundamental trade-off in distributed data stores"
        />

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <InfoCard title="Consistency (C)" accent="purple">
            <p>
              Every read receives the <strong className="text-purple-300">most recent write</strong> or an error.
              All nodes see the same data at the same time. Achieved via consensus protocols (Raft, Paxos)
              or single-leader replication.
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <strong>Linearizability</strong> is the strongest form: operations appear to execute atomically
              and in real-time order. Expensive in distributed systems due to coordination overhead.
            </p>
          </InfoCard>

          <InfoCard title="Availability (A)" accent="green">
            <p>
              Every request receives a <strong className="text-emerald-300">non-error response</strong> — without
              guarantee that it contains the most recent write. The system always responds, even if some nodes
              are partitioned.
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              In practice, &quot;available&quot; means the system continues to serve requests. An &quot;unavailable&quot; system
              returns errors or hangs indefinitely during a partition.
            </p>
          </InfoCard>

          <InfoCard title="Partition Tolerance (P)" accent="pink">
            <p>
              The system continues to <strong className="text-pink-300">operate despite network partitions</strong>
              (messages lost or delayed between nodes). In any real distributed system, partitions <em>will</em> happen.
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Since P is non-negotiable in distributed systems, the real choice is between <strong>CP</strong> (consistent
              but may reject requests during partition) and <strong>AP</strong> (available but may return stale data).
            </p>
          </InfoCard>
        </div>

        <CAPTriangle />

        <InfoCard title="Eventual Consistency in Practice" accent="cyan">
          <p>
            Most modern distributed systems choose <strong className="text-cyan-300">eventual consistency</strong> (AP):
            all replicas will converge to the same state <em>eventually</em>, but reads may return stale data in the meantime.
          </p>
          <div className="mt-3 grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-lg">
              <p className="text-cyan-400 font-semibold mb-1">Techniques for Managing EC</p>
              <ul className="space-y-1">
                <li>• <strong>Read-your-writes:</strong> After writing, read from the leader (not replicas)</li>
                <li>• <strong>Causal consistency:</strong> Preserve happens-before ordering using vector clocks</li>
                <li>• <strong>Conflict resolution:</strong> Last-writer-wins, CRDTs, or application-level merge</li>
                <li>• <strong>Tunable consistency:</strong> Cassandra lets you choose consistency per query (ONE, QUORUM, ALL)</li>
              </ul>
            </div>
            <div className="bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-lg">
              <p className="text-cyan-400 font-semibold mb-1">PACELC Extension</p>
              <p>
                If there is a <strong>P</strong>artition, choose <strong>A</strong> or <strong>C</strong>;
                <strong>E</strong>lse (no partition), choose <strong>L</strong>atency or <strong>C</strong>onsistency.
                This captures the latency/consistency trade-off during normal operation.
              </p>
              <ul className="mt-1 space-y-1">
                <li>• DynamoDB: PA/EL (availability + low latency)</li>
                <li>• MongoDB: PC/EC (consistency in all cases)</li>
                <li>• Cassandra: PA/EL (tunable)</li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </div>

      <Divider />

      {/* ──────────────────── 6. MESSAGING ──────────────────── */}
      <div>
        <SectionTitle
          icon={MessageSquare}
          number="06"
          title="Messaging Systems"
          subtitle="Kafka, RabbitMQ, and Atom feeds compared"
        />

        <InfoCard title="Messaging Comparison" accent="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Feature</th>
                  <th className="text-left py-2 px-2 text-blue-400 font-semibold">Apache Kafka</th>
                  <th className="text-left py-2 px-2 text-orange-400 font-semibold">RabbitMQ</th>
                  <th className="text-left py-2 px-2 text-emerald-400 font-semibold">Atom Feeds (HTTP)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Model</td>
                  <td className="py-2 px-2">Distributed log (append-only)</td>
                  <td className="py-2 px-2">Message broker (queues + exchanges)</td>
                  <td className="py-2 px-2">HTTP-based feed (pull model)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Delivery</td>
                  <td className="py-2 px-2">Pull (consumers poll partitions)</td>
                  <td className="py-2 px-2">Push (broker delivers to consumers)</td>
                  <td className="py-2 px-2">Pull (HTTP GET on feed URL)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Retention</td>
                  <td className="py-2 px-2">Configurable (days, weeks, forever)</td>
                  <td className="py-2 px-2">Until consumed + acknowledged</td>
                  <td className="py-2 px-2">Application-defined pages</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Ordering</td>
                  <td className="py-2 px-2">Per-partition ordering guaranteed</td>
                  <td className="py-2 px-2">Per-queue (single consumer)</td>
                  <td className="py-2 px-2">Chronological in feed</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Throughput</td>
                  <td className="py-2 px-2">Very high (millions/sec)</td>
                  <td className="py-2 px-2">High (tens of thousands/sec)</td>
                  <td className="py-2 px-2">Low (HTTP overhead)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Consumer Groups</td>
                  <td className="py-2 px-2">Native (partition assignment)</td>
                  <td className="py-2 px-2">Competing consumers pattern</td>
                  <td className="py-2 px-2">N/A (each consumer tracks position)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Replay</td>
                  <td className="py-2 px-2">✅ Reset consumer offset</td>
                  <td className="py-2 px-2">❌ Messages deleted after ack</td>
                  <td className="py-2 px-2">✅ Paginate through history</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Routing</td>
                  <td className="py-2 px-2">Topics + partitions</td>
                  <td className="py-2 px-2">Exchanges (direct, topic, fanout, headers)</td>
                  <td className="py-2 px-2">URL per feed</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Best for</td>
                  <td className="py-2 px-2">Event streaming, log aggregation, CQRS</td>
                  <td className="py-2 px-2">Task queues, RPC, complex routing</td>
                  <td className="py-2 px-2">Simple integration, low coupling, REST-friendly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </InfoCard>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <InfoCard title="Kafka Deep Dive" accent="blue">
            <ul className="space-y-1 text-xs">
              <li>• Topics split into <strong>partitions</strong> for parallelism</li>
              <li>• Each partition is an ordered, immutable log</li>
              <li>• Consumer groups enable horizontal scaling</li>
              <li>• Kafka Streams / ksqlDB for stream processing</li>
              <li>• Schema Registry (Avro/Protobuf) for evolution</li>
              <li>• Exactly-once semantics via transactions</li>
              <li>• Kafka Connect for CDC integration</li>
            </ul>
          </InfoCard>
          <InfoCard title="RabbitMQ Deep Dive" accent="orange">
            <ul className="space-y-1 text-xs">
              <li>• AMQP 0-9-1 protocol (also STOMP, MQTT)</li>
              <li>• <strong>Exchanges</strong> route messages to queues</li>
              <li>• Dead Letter Exchanges (DLX) for failed messages</li>
              <li>• Priority queues for ordering by importance</li>
              <li>• Publisher confirms for reliability</li>
              <li>• Shovel / Federation for multi-datacenter</li>
              <li>• Best for request-reply and work distribution</li>
            </ul>
          </InfoCard>
          <InfoCard title="Atom Feeds" accent="green">
            <ul className="space-y-1 text-xs">
              <li>• RFC 4287 — XML-based syndication format</li>
              <li>• Events published as feed entries</li>
              <li>• Consumers poll via HTTP GET</li>
              <li>• Pagination via <code className="bg-white dark:bg-slate-800 px-0.5 rounded">rel=&quot;next&quot;</code> / <code className="bg-white dark:bg-slate-800 px-0.5 rounded">rel=&quot;prev&quot;</code> links</li>
              <li>• Leverages HTTP caching (ETags, 304)</li>
              <li>• <strong>Zero infrastructure</strong> — any HTTP server works</li>
              <li>• Ideal for low-volume, low-coupling scenarios</li>
            </ul>
          </InfoCard>
        </div>
      </div>

      <Divider />

      {/* ──────────────────── 7. SYNCHRONOUS COMMUNICATION ──────────────────── */}
      <div>
        <SectionTitle
          icon={RefreshCw}
          number="07"
          title="Synchronous Communication"
          subtitle="REST vs gRPC vs GraphQL — protocols, trade-offs, and when to use each"
        />

        <InfoCard title="Protocol Comparison" accent="purple">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Feature</th>
                  <th className="text-left py-2 px-2 text-blue-400 font-semibold">REST</th>
                  <th className="text-left py-2 px-2 text-purple-400 font-semibold">gRPC</th>
                  <th className="text-left py-2 px-2 text-pink-400 font-semibold">GraphQL</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Protocol</td>
                  <td className="py-2 px-2">HTTP/1.1 or HTTP/2</td>
                  <td className="py-2 px-2">HTTP/2 (required)</td>
                  <td className="py-2 px-2">HTTP (typically POST)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Data Format</td>
                  <td className="py-2 px-2">JSON (text-based)</td>
                  <td className="py-2 px-2">Protocol Buffers (binary)</td>
                  <td className="py-2 px-2">JSON (text-based)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Contract</td>
                  <td className="py-2 px-2">OpenAPI / Swagger</td>
                  <td className="py-2 px-2">.proto files (IDL)</td>
                  <td className="py-2 px-2">Schema (SDL)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Code Gen</td>
                  <td className="py-2 px-2">Optional (openapi-generator)</td>
                  <td className="py-2 px-2">Built-in (protoc compiler)</td>
                  <td className="py-2 px-2">Optional (codegen tools)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Streaming</td>
                  <td className="py-2 px-2">SSE, WebSockets (separate)</td>
                  <td className="py-2 px-2">Native (unary, server, client, bidi)</td>
                  <td className="py-2 px-2">Subscriptions (WebSocket)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Performance</td>
                  <td className="py-2 px-2">Good</td>
                  <td className="py-2 px-2">Excellent (binary, HTTP/2 multiplexing)</td>
                  <td className="py-2 px-2">Variable (depends on query complexity)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Browser Support</td>
                  <td className="py-2 px-2">✅ Native</td>
                  <td className="py-2 px-2">⚠️ Requires gRPC-Web proxy</td>
                  <td className="py-2 px-2">✅ Native</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Over/Under-fetching</td>
                  <td className="py-2 px-2">Common problem</td>
                  <td className="py-2 px-2">Fixed by .proto schema</td>
                  <td className="py-2 px-2">Solved — client specifies fields</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-medium text-slate-600 dark:text-slate-400">Best For</td>
                  <td className="py-2 px-2">Public APIs, CRUD, web/mobile clients</td>
                  <td className="py-2 px-2">Inter-service, low latency, polyglot</td>
                  <td className="py-2 px-2">Frontend-driven, mobile apps, aggregation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </InfoCard>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <CodeBlock
            language="http"
            code={`# REST Example
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <token>

# Response
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "orders": [...]  ← over-fetching
}`}
          />
          <CodeBlock
            language="protobuf"
            code={`// gRPC .proto definition
syntax = "proto3";

service UserService {
  rpc GetUser (UserRequest)
    returns (UserResponse);
  rpc StreamOrders (UserRequest)
    returns (stream Order);
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
}`}
          />
          <CodeBlock
            language="graphql"
            code={`# GraphQL Query
query {
  user(id: 42) {
    name
    email
    orders(last: 5) {
      id
      total
      status
    }
  }
}

# Client gets exactly what
# it asked for — no over-
# or under-fetching.`}
          />
        </div>
      </div>

      <Divider />

      {/* ──────────────────── 8. API GATEWAY PATTERN ──────────────────── */}
      <div>
        <SectionTitle
          icon={Shield}
          number="08"
          title="API Gateway Pattern"
          subtitle="Single entry point for all client requests — authentication, routing, rate limiting"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Core Responsibilities" accent="pink">
            <div className="space-y-2">
              {[
                { icon: '🔐', title: 'Authentication & Authorization', desc: 'Validate JWTs, API keys, OAuth tokens before routing to services. Centralized auth policy.' },
                { icon: '⚡', title: 'Rate Limiting & Throttling', desc: 'Protect services from abuse. Token bucket or sliding window per client/IP/API key.' },
                { icon: '🔀', title: 'Request Routing', desc: 'Route /users/** → User Service, /orders/** → Order Service. Path-based or header-based routing.' },
                { icon: '📊', title: 'Load Balancing', desc: 'Distribute requests across service instances. Round-robin, least connections, or weighted.' },
                { icon: '📝', title: 'Logging & Monitoring', desc: 'Centralized access logs, request tracing (correlation IDs), metrics (latency, error rates).' },
                { icon: '🔄', title: 'Response Transformation', desc: 'Aggregate responses from multiple services, transform payloads, add CORS headers.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className="text-pink-300 font-medium text-xs">{item.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="BFF Pattern (Backend for Frontend)" accent="cyan">
            <p>
              The <strong className="text-cyan-300">Backend for Frontend</strong> pattern creates a
              <em> separate API gateway per client type</em>: one for web, one for mobile, one for third-party.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded">
                <p className="text-cyan-400 font-semibold">Why BFF?</p>
                <p>Different clients have different needs. Mobile needs smaller payloads and different data shapes.
                Web needs server-rendered HTML. Partners need stable, versioned APIs. One gateway can&apos;t optimize for all.</p>
              </div>
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded">
                <p className="text-cyan-400 font-semibold">Implementation</p>
                <p>Each BFF is a lightweight Node.js/Go service that aggregates and transforms backend service responses
                for its specific client. Owned by the frontend team that consumes it.</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              <strong>Popular Gateways:</strong> Kong, AWS API Gateway, Envoy, Traefik, NGINX, Spring Cloud Gateway, Zuul
            </div>
          </InfoCard>
        </div>

        <APIGatewayDiagram />

        <CodeBlock
          language="yaml"
          code={`# Kong API Gateway - Example Configuration
services:
  - name: user-service
    url: http://user-svc.internal:8080
    routes:
      - name: user-routes
        paths: ["/api/v1/users"]
        methods: ["GET", "POST", "PUT"]
    plugins:
      - name: jwt              # Validate JWT tokens
      - name: rate-limiting     # 100 req/min per consumer
        config:
          minute: 100
          policy: redis
      - name: cors
        config:
          origins: ["https://app.example.com"]
      - name: request-transformer
        config:
          add:
            headers: ["X-Request-ID:$(uuid)"]`}
        />
      </div>

      <Divider />

      {/* ──────────────────── 9. SERVICE DISCOVERY ──────────────────── */}
      <div>
        <SectionTitle
          icon={Search}
          number="09"
          title="Service Discovery"
          subtitle="How services find each other in dynamic, auto-scaling environments"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Client-Side Discovery" accent="blue">
            <p>
              The <strong className="text-blue-300">client queries the service registry</strong> directly to get
              the list of available instances, then uses client-side load balancing to pick one.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>✅ No additional network hop (no load balancer in the path)</li>
              <li>✅ Client can implement smart routing (locality-aware, latency-based)</li>
              <li>❌ Client must implement discovery logic + health checking</li>
              <li>❌ Language-specific: each client language needs a discovery library</li>
            </ul>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <strong>Example:</strong> Netflix Eureka + Ribbon. Spring Cloud DiscoveryClient.
            </p>
          </InfoCard>

          <InfoCard title="Server-Side Discovery" accent="green">
            <p>
              The client sends requests to a <strong className="text-emerald-300">load balancer / router</strong>
              which queries the registry and forwards the request to an available instance.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>✅ Client is simple — just calls a single endpoint</li>
              <li>✅ Language-agnostic: works with any client</li>
              <li>❌ Additional network hop through the load balancer</li>
              <li>❌ Load balancer must be highly available (potential SPOF)</li>
            </ul>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <strong>Example:</strong> AWS ALB + ECS Service Discovery, Kubernetes Service + kube-proxy, Consul + Envoy sidecar.
            </p>
          </InfoCard>
        </div>

        <ServiceDiscoveryDiagram />

        <InfoCard title="Service Registry Implementations" accent="purple">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">Registry</th>
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">Consensus</th>
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">Health Checks</th>
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">KV Store</th>
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">DNS Interface</th>
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400">Multi-DC</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 text-purple-400 font-medium">Consul</td>
                  <td className="py-2 px-2">Raft</td>
                  <td className="py-2 px-2">HTTP, TCP, gRPC, script</td>
                  <td className="py-2 px-2">✅</td>
                  <td className="py-2 px-2">✅</td>
                  <td className="py-2 px-2">✅ Native</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 text-purple-400 font-medium">Eureka</td>
                  <td className="py-2 px-2">Peer-to-peer</td>
                  <td className="py-2 px-2">Heartbeat-based</td>
                  <td className="py-2 px-2">❌</td>
                  <td className="py-2 px-2">❌</td>
                  <td className="py-2 px-2">✅ Zone-aware</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-2 text-purple-400 font-medium">etcd</td>
                  <td className="py-2 px-2">Raft</td>
                  <td className="py-2 px-2">TTL-based leases</td>
                  <td className="py-2 px-2">✅</td>
                  <td className="py-2 px-2">❌</td>
                  <td className="py-2 px-2">Manual</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-purple-400 font-medium">ZooKeeper</td>
                  <td className="py-2 px-2">ZAB</td>
                  <td className="py-2 px-2">Ephemeral nodes</td>
                  <td className="py-2 px-2">✅ (znodes)</td>
                  <td className="py-2 px-2">❌</td>
                  <td className="py-2 px-2">Observer nodes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>

      <Divider />

      {/* ──────────────────── 10. DATABASE PER SERVICE & SAGA ──────────────────── */}
      <div>
        <SectionTitle
          icon={Database}
          number="10"
          title="Database per Service & Saga Pattern"
          subtitle="Polyglot persistence and distributed transaction management"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Database per Service" accent="blue">
            <p>
              Each microservice <strong className="text-blue-300">owns its own database</strong> — no shared schemas,
              no shared tables, no cross-service joins. This is the cornerstone of service independence.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded">
                <p className="text-blue-400 font-semibold">Polyglot Persistence</p>
                <p>Each service picks the best database for its workload:</p>
                <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-400">
                  <li>• User Service → PostgreSQL (relational, complex queries)</li>
                  <li>• Product Catalog → MongoDB (flexible schema, search)</li>
                  <li>• Session Store → Redis (in-memory, fast reads)</li>
                  <li>• Analytics → ClickHouse (columnar, OLAP)</li>
                  <li>• Social Graph → Neo4j (graph relationships)</li>
                  <li>• Event Store → EventStoreDB or Kafka</li>
                </ul>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Challenge:</strong> Cross-service queries require API composition or CQRS materialized views.
                No more <code className="bg-slate-700 px-0.5 rounded">SELECT ... JOIN</code> across domains.
              </p>
            </div>
          </InfoCard>

          <InfoCard title="The Saga Pattern" accent="orange">
            <p>
              Sagas manage <strong className="text-orange-300">distributed transactions</strong> across multiple services
              without 2PC (two-phase commit). A saga is a sequence of local transactions, where each step
              has a <em>compensating transaction</em> to undo its work on failure.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded">
                <p className="text-orange-400 font-semibold">Example: Place Order Saga</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                  <li>Order Service → Create order (pending)</li>
                  <li>Payment Service → Charge customer</li>
                  <li>Inventory Service → Reserve items</li>
                  <li>Shipping Service → Schedule delivery</li>
                  <li>Order Service → Confirm order</li>
                </ol>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  If step 3 fails → compensate step 2 (refund) → compensate step 1 (cancel order)
                </p>
              </div>
            </div>
          </InfoCard>
        </div>

        <SagaDiagram />

        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Choreography Sagas" accent="purple">
            <p className="text-xs">
              Each service <strong className="text-purple-300">listens for events and emits events</strong>.
              No central coordinator. Simple for 3-4 step flows but becomes hard to trace and debug
              as the number of participants grows (the &quot;spaghetti events&quot; problem).
            </p>
            <ul className="mt-2 space-y-0.5 text-xs">
              <li>✅ Loosely coupled — services don&apos;t know about each other</li>
              <li>✅ No single point of failure</li>
              <li>❌ Hard to understand the overall flow</li>
              <li>❌ Cyclic dependencies can emerge</li>
              <li>❌ Difficult to add new steps</li>
            </ul>
          </InfoCard>

          <InfoCard title="Orchestration Sagas" accent="green">
            <p className="text-xs">
              A <strong className="text-emerald-300">central orchestrator</strong> (saga coordinator) tells each
              participant what to do and handles compensations on failure. The flow is explicitly defined
              in the orchestrator&apos;s code.
            </p>
            <ul className="mt-2 space-y-0.5 text-xs">
              <li>✅ Clear, readable flow definition</li>
              <li>✅ Easy to add/reorder steps</li>
              <li>✅ Centralized error handling and retries</li>
              <li>❌ Orchestrator can become a bottleneck / SPOF</li>
              <li>❌ Risk of &quot;god service&quot; that knows too much</li>
            </ul>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <strong>Tools:</strong> Temporal.io, Camunda, AWS Step Functions, Netflix Conductor
            </p>
          </InfoCard>
        </div>
      </div>

      <Divider />

      {/* ──────────────────── 11. CIRCUIT BREAKER ──────────────────── */}
      <div>
        <SectionTitle
          icon={Activity}
          number="11"
          title="Circuit Breaker Pattern"
          subtitle="Preventing cascading failures with automatic fault detection and recovery"
        />

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <InfoCard title="Closed (Normal)" accent="green">
            <p>
              Requests flow normally. The breaker counts failures. If the failure count exceeds a
              <strong className="text-emerald-300"> threshold</strong> within a time window, the breaker
              <strong> trips</strong> to the Open state.
            </p>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <p>Example: 5 failures in 60 seconds → trip</p>
              <p>Or: 50% error rate over last 100 calls → trip</p>
            </div>
          </InfoCard>

          <InfoCard title="Open (Failing Fast)" accent="orange">
            <p>
              All requests <strong className="text-orange-300">fail immediately</strong> without calling the
              downstream service. Returns a fallback response or error. After a <strong>timeout period</strong>,
              transitions to Half-Open.
            </p>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <p>Timeout: typically 30-60 seconds</p>
              <p>Fallback: cached response, default value, or graceful error</p>
            </div>
          </InfoCard>

          <InfoCard title="Half-Open (Testing)" accent="cyan">
            <p>
              Allows a <strong className="text-cyan-300">limited number of test requests</strong> through
              to see if the service has recovered. If they succeed → back to Closed. If they fail → back to Open.
            </p>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <p>Typically allows 1-3 test requests</p>
              <p>Success threshold: e.g., 3 consecutive successes</p>
            </div>
          </InfoCard>
        </div>

        <CircuitBreakerSVG />

        <CodeBlock
          language="typescript"
          code={`// Circuit Breaker Implementation (simplified)
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private readonly threshold: number = 5,      // failures to trip
    private readonly timeout: number = 30000,     // ms before half-open
    private readonly halfOpenMax: number = 3      // test requests allowed
  ) {}

  async call<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenMax) {
        this.state = 'CLOSED';    // recovered!
        this.failureCount = 0;
      }
    }
    this.failureCount = 0;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';         // trip the breaker
    }
  }
}`}
        />

        <Collapsible title="🔧 Related Resilience Patterns">
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
            <div>
              <p className="text-blue-400 font-semibold">Retry with Backoff</p>
              <p className="text-xs">Retry failed requests with exponential backoff (1s, 2s, 4s, 8s...) + jitter. Prevents thundering herd. Combine with circuit breaker — don&apos;t retry when breaker is open.</p>
            </div>
            <div>
              <p className="text-purple-400 font-semibold">Bulkhead</p>
              <p className="text-xs">Isolate resource pools per downstream service. If Service A&apos;s thread pool is exhausted, Service B&apos;s pool is unaffected. Like watertight compartments in a ship.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">Timeout</p>
              <p className="text-xs">Always set timeouts on outgoing calls. A missing timeout means one slow service can consume all threads/connections. Typical: 2-5s for internal services, 10-30s for external.</p>
            </div>
            <div>
              <p className="text-orange-400 font-semibold">Rate Limiter</p>
              <p className="text-xs">Protect downstream services from being overwhelmed. Token bucket or sliding window. Apply at the caller side (client-side rate limiting) or at the service boundary.</p>
            </div>
          </div>
        </Collapsible>
      </div>

      <Divider />

      {/* ──────────────────── 12. KUBERNETES ──────────────────── */}
      <div>
        <SectionTitle
          icon={Server}
          number="12"
          title="Kubernetes (K8s)"
          subtitle="Container orchestration — Pods, Services, Deployments, and Auto-scaling"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="Core Concepts" accent="blue">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-blue-400 font-semibold">Pod</p>
                <p>The smallest deployable unit. Contains one or more containers sharing the same network namespace
                (localhost) and storage volumes. Usually one application container + sidecars (logging, proxy).</p>
              </div>
              <div>
                <p className="text-blue-400 font-semibold">Service</p>
                <p>Stable network endpoint (virtual IP + DNS name) that routes traffic to a set of Pods selected by labels.
                Types: ClusterIP (internal), NodePort (external via node ports), LoadBalancer (cloud LB).</p>
              </div>
              <div>
                <p className="text-blue-400 font-semibold">Deployment</p>
                <p>Declarative definition of desired state: which container image, how many replicas, update strategy.
                The Deployment controller ensures actual state matches desired state via ReplicaSets.</p>
              </div>
              <div>
                <p className="text-blue-400 font-semibold">Namespace</p>
                <p>Virtual cluster within a physical cluster. Used for environment isolation (dev/staging/prod)
                or team separation. Resources within a namespace are isolated by default.</p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Auto-scaling" accent="green">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-emerald-400 font-semibold">Horizontal Pod Autoscaler (HPA)</p>
                <p>Scales the number of Pod replicas based on observed metrics (CPU, memory, or custom metrics).
                Checks metrics every 15s by default. Uses a stabilization window to prevent flapping.</p>
                <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded mt-1 font-mono text-[10px]">
                  <p>desiredReplicas = ceil(currentReplicas × (currentMetricValue / targetMetricValue))</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Example: 3 pods × (80% CPU / 50% target) = ceil(4.8) = 5 pods</p>
                </div>
              </div>
              <div>
                <p className="text-emerald-400 font-semibold">Vertical Pod Autoscaler (VPA)</p>
                <p>Adjusts CPU/memory requests and limits for containers. Recommends or automatically
                applies optimal resource sizing. Cannot run simultaneously with HPA on the same metric.</p>
              </div>
              <div>
                <p className="text-emerald-400 font-semibold">Cluster Autoscaler</p>
                <p>Adds or removes worker nodes based on pending Pods that can&apos;t be scheduled (scale up)
                or underutilized nodes (scale down). Cloud-provider specific.</p>
              </div>
              <div>
                <p className="text-emerald-400 font-semibold">KEDA (Event-Driven Autoscaling)</p>
                <p>Scales based on external event sources: Kafka lag, RabbitMQ queue depth, HTTP request rate,
                cron schedules. Can scale to zero (unlike HPA min=1).</p>
              </div>
            </div>
          </InfoCard>
        </div>

        <KubernetesDiagram />

        <CodeBlock
          language="yaml"
          code={`# Kubernetes Deployment + Service + HPA
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0    # zero-downtime deploys
  template:
    metadata:
      labels:
        app: order-service
        version: v2.1.0
    spec:
      containers:
        - name: order-service
          image: registry.example.com/order-service:v2.1.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: order-db-secret
                  key: url
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"`}
        />

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <InfoCard title="Deployment Strategies" accent="purple">
            <ul className="space-y-1 text-xs">
              <li>• <strong className="text-purple-300">Rolling Update:</strong> Gradual replacement (default). Zero downtime.</li>
              <li>• <strong className="text-purple-300">Blue/Green:</strong> Two identical environments. Switch traffic instantly.</li>
              <li>• <strong className="text-purple-300">Canary:</strong> Route small % of traffic to new version. Monitor. Gradually increase.</li>
              <li>• <strong className="text-purple-300">Recreate:</strong> Kill all old → start new. Simple but has downtime.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Tools: Argo Rollouts, Flagger, Istio traffic splitting
            </p>
          </InfoCard>

          <InfoCard title="Networking" accent="cyan">
            <ul className="space-y-1 text-xs">
              <li>• <strong className="text-cyan-300">Ingress:</strong> HTTP/HTTPS routing from external → Services. TLS termination.</li>
              <li>• <strong className="text-cyan-300">Service Mesh:</strong> Istio/Linkerd. Sidecar proxies for mTLS, retries, observability.</li>
              <li>• <strong className="text-cyan-300">NetworkPolicy:</strong> Firewall rules between Pods (deny all, allow specific).</li>
              <li>• <strong className="text-cyan-300">CoreDNS:</strong> Internal DNS for service discovery (service.namespace.svc.cluster.local).</li>
            </ul>
          </InfoCard>

          <InfoCard title="Observability" accent="orange">
            <ul className="space-y-1 text-xs">
              <li>• <strong className="text-orange-300">Metrics:</strong> Prometheus + Grafana. Scrape /metrics endpoints.</li>
              <li>• <strong className="text-orange-300">Logging:</strong> Fluentd/Fluent Bit → Elasticsearch/Loki. Structured JSON logs.</li>
              <li>• <strong className="text-orange-300">Tracing:</strong> Jaeger/Zipkin/Tempo. Distributed request tracing with OpenTelemetry.</li>
              <li>• <strong className="text-orange-300">Alerting:</strong> Alertmanager rules. PagerDuty/Slack integration.</li>
            </ul>
          </InfoCard>
        </div>
      </div>

      {/* ──────────────────── MODULE SUMMARY ──────────────────── */}
      <Divider />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Module 3 Complete
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto mb-6">
          You&apos;ve covered the practical building blocks of modern distributed systems — from self-contained
          systems and frontend integration to Kubernetes orchestration. Each pattern involves trade-offs;
          the art of architecture is choosing the right combination for your specific context.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'SCS', 'Frontend Integration', 'ESI', 'Async Events', 'CAP Theorem',
            'Messaging', 'REST/gRPC/GraphQL', 'API Gateway', 'Service Discovery',
            'Saga Pattern', 'Circuit Breaker', 'Kubernetes',
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"
            >
              {tag}
            </span>
          ))}
        

      {/* Module Quiz */}
      <Quiz title="Practical Distributed Systems" questions={moduleQuestions} />
    </div>
      </motion.div>
    </section>
  );
}
