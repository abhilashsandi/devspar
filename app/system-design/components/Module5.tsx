'use client';

import React, { useState } from 'react';
import Quiz from './Quiz';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Server,
  Database,
  Shield,
  Globe,
  Activity,
  Layers,
  HardDrive,
  Cpu,
  Network,
  Lock,
  Eye,
  ChevronDown,
  ChevronRight,
  Zap,
  Box,
  Archive,
  BarChart3,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  MonitorSpeaker,
  Container,
  Clock,
  Users,
  Key,
  FileText,
  Search,
  TrendingUp,
  Workflow,
  GitBranch,
} from 'lucide-react';

/* ──────────────────────────── helpers ──────────────────────────── */

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

const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as any },
  },
};

/* ──────────────────────────── section wrapper ──────────────────── */

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF9900]/20 to-[#FF9900]/5 border border-[#FF9900]/30">
          <Icon className="w-7 h-7 text-[#FF9900]" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* ──────────────────────────── collapsible card ─────────────────── */

function CollapsibleCard({
  title,
  subtitle,
  icon: Icon,
  color = '#FF9900',
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden mb-4 hover:border-[#FF9900]/30 transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left group"
      >
        <div
          className="p-2.5 rounded-lg shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-[#FF9900] transition-colors">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ──────────────────────────── info badge ───────────────────────── */

function Badge({ children, variant = 'orange' }: { children: React.ReactNode; variant?: 'orange' | 'green' | 'blue' | 'red' | 'purple' }) {
  const colors = {
    orange: 'bg-[#FF9900]/15 text-[#8a5300] dark:text-[#FF9900] border-[#FF9900]/30',
    green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    red: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
    purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
}

/* ──────────────────────────── key-value row ────────────────────── */

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-[#FF9900] font-medium text-sm min-w-[140px] shrink-0">{label}</span>
      <span className="text-gray-300 text-sm">{value}</span>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━ SVG DIAGRAMS ━━━━━━━━━━━━━━━━━━━━━━ */

/* ──── Compute Spectrum SVG ──── */

function ComputeSpectrumSVG() {
  const items = [
    { label: 'Bare Metal', sub: 'Full control', x: 60, color: '#6366f1' },
    { label: 'EC2', sub: 'Virtual machines', x: 210, color: '#8b5cf6' },
    { label: 'ECS / EKS', sub: 'Containers', x: 370, color: '#a855f7' },
    { label: 'Fargate', sub: 'Serverless containers', x: 540, color: '#d946ef' },
    { label: 'Lambda', sub: 'Functions', x: 700, color: '#FF9900' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="my-8 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
    >
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Compute Spectrum: Control ↔ Convenience
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 200" className="w-full min-w-[800px] lg:min-w-0" xmlns="http://www.w3.org/2000/svg">
        {/* gradient bar */}
        <defs>
          <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
        </defs>
        <rect x="40" y="90" width="720" height="6" rx="3" fill="url(#spectrumGrad)" opacity="0.5" />

        {/* arrow labels */}
        <text x="40" y="130" fill="#9ca3af" fontSize="11" fontFamily="sans-serif">
          ← More Control
        </text>
        <text x="650" y="130" fill="#9ca3af" fontSize="11" fontFamily="sans-serif" textAnchor="end">
          More Managed →
        </text>

        {/* nodes */}
        {items.map((item, i) => (
          <g key={i}>
            <motion.circle
              cx={item.x}
              cy="93"
              r="14"
              fill={item.color}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring" as any }}
            />
            <motion.circle
              cx={item.x}
              cy="93"
              r="20"
              fill="none"
              stroke={item.color}
              strokeWidth="1.5"
              opacity="0.3"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 + 0.1, type: "spring" as any }}
            />
            <text
              x={item.x}
              y="60"
              fill="white"
              fontSize="13"
              fontWeight="600"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {item.label}
            </text>
            <text
              x={item.x}
              y="160"
              fill="#9ca3af"
              fontSize="10"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {item.sub}
            </text>
          </g>
        ))}
      </svg>
</div>
</div>
    </motion.div>
  );
}

/* ──── Database Decision Tree SVG ──── */

function DatabaseDecisionTreeSVG() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="my-8 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
    >
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Which AWS Database Should I Use?
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 900 520" className="w-full min-w-[800px] lg:min-w-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Root node */}
        <rect x="330" y="10" width="240" height="50" rx="12" fill="#FF9900" opacity="0.9" />
        <text x="450" y="40" fill="white" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          What's your data model?
        </text>

        {/* Level 1 branches */}
        {/* Left: Relational */}
        <line x1="390" y1="60" x2="200" y2="120" stroke="#FF9900" strokeWidth="2" opacity="0.5" />
        <rect x="100" y="100" width="200" height="44" rx="10" fill="#232F3E" stroke="#FF9900" strokeWidth="1.5" />
        <text x="200" y="127" fill="#FF9900" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Relational (SQL)
        </text>

        {/* Center: Key-Value / Document */}
        <line x1="450" y1="60" x2="450" y2="120" stroke="#FF9900" strokeWidth="2" opacity="0.5" />
        <rect x="330" y="100" width="240" height="44" rx="10" fill="#232F3E" stroke="#d946ef" strokeWidth="1.5" />
        <text x="450" y="127" fill="#d946ef" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Key-Value / Document
        </text>

        {/* Right: Caching */}
        <line x1="510" y1="60" x2="700" y2="120" stroke="#FF9900" strokeWidth="2" opacity="0.5" />
        <rect x="600" y="100" width="200" height="44" rx="10" fill="#232F3E" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="700" y="127" fill="#22d3ee" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Caching / Sessions
        </text>

        {/* Level 2 – Relational sub-questions */}
        <line x1="150" y1="144" x2="150" y2="200" stroke="#FF9900" strokeWidth="1.5" opacity="0.4" />
        <rect x="30" y="195" width="240" height="40" rx="8" fill="#1a1a2e" stroke="#FF9900" strokeWidth="1" opacity="0.8" />
        <text x="150" y="220" fill="#9ca3af" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
          Need high availability?
        </text>

        {/* Yes branch */}
        <line x1="100" y1="235" x2="80" y2="290" stroke="#4ade80" strokeWidth="1.5" opacity="0.4" />
        <text x="70" y="282" fill="#4ade80" fontSize="10" fontFamily="sans-serif">Yes</text>
        <rect x="10" y="290" width="150" height="55" rx="10" fill="#064e3b" stroke="#4ade80" strokeWidth="1.5" />
        <text x="85" y="312" fill="#4ade80" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          Aurora
        </text>
        <text x="85" y="330" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          5x MySQL perf
        </text>

        {/* No branch */}
        <line x1="200" y1="235" x2="220" y2="290" stroke="#60a5fa" strokeWidth="1.5" opacity="0.4" />
        <text x="225" y="282" fill="#60a5fa" fontSize="10" fontFamily="sans-serif">No</text>
        <rect x="170" y="290" width="150" height="55" rx="10" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="245" y="312" fill="#60a5fa" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          RDS
        </text>
        <text x="245" y="330" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          Postgres / MySQL
        </text>

        {/* Level 2 – Key-Value sub-questions */}
        <line x1="450" y1="144" x2="450" y2="200" stroke="#d946ef" strokeWidth="1.5" opacity="0.4" />
        <rect x="330" y="195" width="240" height="40" rx="8" fill="#1a1a2e" stroke="#d946ef" strokeWidth="1" opacity="0.8" />
        <text x="450" y="220" fill="#9ca3af" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
          Need single-digit ms at scale?
        </text>

        {/* Yes */}
        <line x1="400" y1="235" x2="380" y2="290" stroke="#4ade80" strokeWidth="1.5" opacity="0.4" />
        <text x="368" y="282" fill="#4ade80" fontSize="10" fontFamily="sans-serif">Yes</text>
        <rect x="340" y="290" width="160" height="55" rx="10" fill="#4a1d6a" stroke="#d946ef" strokeWidth="1.5" />
        <text x="420" y="312" fill="#d946ef" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          DynamoDB
        </text>
        <text x="420" y="330" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          Auto-scaling NoSQL
        </text>

        {/* Level 2 – Caching */}
        <line x1="700" y1="144" x2="700" y2="200" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" />
        <rect x="600" y="195" width="200" height="40" rx="8" fill="#1a1a2e" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
        <text x="700" y="220" fill="#9ca3af" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
          Need data structures?
        </text>

        {/* Yes: Redis */}
        <line x1="660" y1="235" x2="640" y2="290" stroke="#4ade80" strokeWidth="1.5" opacity="0.4" />
        <text x="628" y="282" fill="#4ade80" fontSize="10" fontFamily="sans-serif">Yes</text>
        <rect x="570" y="290" width="140" height="55" rx="10" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="640" y="312" fill="#22d3ee" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          ElastiCache Redis
        </text>
        <text x="640" y="330" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          Rich data types
        </text>

        {/* No: Memcached */}
        <line x1="740" y1="235" x2="780" y2="290" stroke="#f97316" strokeWidth="1.5" opacity="0.4" />
        <text x="785" y="282" fill="#f97316" fontSize="10" fontFamily="sans-serif">No</text>
        <rect x="730" y="290" width="150" height="55" rx="10" fill="#431407" stroke="#f97316" strokeWidth="1.5" />
        <text x="805" y="312" fill="#f97316" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          Memcached
        </text>
        <text x="805" y="330" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          Simple key-value
        </text>

        {/* Bottom – Analytics */}
        <rect x="330" y="400" width="240" height="44" rx="10" fill="#232F3E" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="450" y="427" fill="#fbbf24" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Analytics / Data Warehouse?
        </text>
        <line x1="450" y1="444" x2="450" y2="470" stroke="#fbbf24" strokeWidth="1.5" opacity="0.4" />
        <rect x="360" y="465" width="180" height="50" rx="10" fill="#422006" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="450" y="488" fill="#fbbf24" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          Redshift
        </text>
        <text x="450" y="504" fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
          Columnar, petabyte-scale
        </text>
      </svg>
</div>
</div>
    </motion.div>
  );
}

/* ──── VPC Architecture SVG ──── */

function VPCArchitectureSVG() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="my-8 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
    >
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        VPC Architecture: Public &amp; Private Subnets
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 900 550" className="w-full min-w-[800px] lg:min-w-0" xmlns="http://www.w3.org/2000/svg">
        {/* Internet */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <circle cx="450" cy="35" r="25" fill="#FF9900" opacity="0.2" stroke="#FF9900" strokeWidth="1.5" />
          <text x="450" y="40" fill="#FF9900" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            Internet
          </text>
        </motion.g>

        {/* Internet Gateway */}
        <line x1="450" y1="60" x2="450" y2="95" stroke="#FF9900" strokeWidth="2" strokeDasharray="4 3" />
        <rect x="385" y="85" width="130" height="35" rx="8" fill="#232F3E" stroke="#FF9900" strokeWidth="1.5" />
        <text x="450" y="107" fill="#FF9900" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Internet Gateway
        </text>

        {/* VPC outer */}
        <rect x="50" y="140" width="800" height="380" rx="16" fill="none" stroke="#FF9900" strokeWidth="2" strokeDasharray="8 4" opacity="0.4" />
        <text x="70" y="165" fill="#FF9900" fontSize="14" fontWeight="700" fontFamily="sans-serif" opacity="0.7">
          VPC (10.0.0.0/16)
        </text>

        {/* Connection from IGW to VPC */}
        <line x1="450" y1="120" x2="450" y2="140" stroke="#FF9900" strokeWidth="2" />

        {/* ── AZ-a ── */}
        <rect x="80" y="180" width="350" height="320" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.6" />
        <text x="100" y="205" fill="#64748b" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Availability Zone A
        </text>

        {/* Public Subnet A */}
        <rect x="100" y="220" width="310" height="100" rx="10" fill="#064e3b" opacity="0.3" stroke="#4ade80" strokeWidth="1" />
        <text x="120" y="245" fill="#4ade80" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Public Subnet (10.0.1.0/24)
        </text>
        {/* ALB */}
        <rect x="130" y="260" width="100" height="40" rx="8" fill="#232F3E" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="180" y="285" fill="#60a5fa" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          ALB
        </text>
        {/* NAT Gateway */}
        <rect x="270" y="260" width="120" height="40" rx="8" fill="#232F3E" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="330" y="285" fill="#fbbf24" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          NAT Gateway
        </text>

        {/* Private Subnet A */}
        <rect x="100" y="340" width="310" height="140" rx="10" fill="#1e1b4b" opacity="0.3" stroke="#818cf8" strokeWidth="1" />
        <text x="120" y="365" fill="#818cf8" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Private Subnet (10.0.3.0/24)
        </text>
        {/* ECS */}
        <rect x="120" y="380" width="100" height="40" rx="8" fill="#232F3E" stroke="#c084fc" strokeWidth="1.5" />
        <text x="170" y="405" fill="#c084fc" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          ECS Task
        </text>
        {/* EC2 */}
        <rect x="240" y="380" width="100" height="40" rx="8" fill="#232F3E" stroke="#c084fc" strokeWidth="1.5" />
        <text x="290" y="405" fill="#c084fc" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          EC2
        </text>
        {/* RDS */}
        <rect x="150" y="435" width="120" height="35" rx="8" fill="#232F3E" stroke="#f472b6" strokeWidth="1.5" />
        <text x="210" y="457" fill="#f472b6" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          RDS Primary
        </text>

        {/* ── AZ-b ── */}
        <rect x="470" y="180" width="350" height="320" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.6" />
        <text x="490" y="205" fill="#64748b" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Availability Zone B
        </text>

        {/* Public Subnet B */}
        <rect x="490" y="220" width="310" height="100" rx="10" fill="#064e3b" opacity="0.3" stroke="#4ade80" strokeWidth="1" />
        <text x="510" y="245" fill="#4ade80" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Public Subnet (10.0.2.0/24)
        </text>
        {/* ALB target */}
        <rect x="530" y="260" width="100" height="40" rx="8" fill="#232F3E" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="580" y="285" fill="#60a5fa" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          ALB Target
        </text>

        {/* Private Subnet B */}
        <rect x="490" y="340" width="310" height="140" rx="10" fill="#1e1b4b" opacity="0.3" stroke="#818cf8" strokeWidth="1" />
        <text x="510" y="365" fill="#818cf8" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Private Subnet (10.0.4.0/24)
        </text>
        {/* ECS */}
        <rect x="510" y="380" width="100" height="40" rx="8" fill="#232F3E" stroke="#c084fc" strokeWidth="1.5" />
        <text x="560" y="405" fill="#c084fc" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          ECS Task
        </text>
        {/* EC2 */}
        <rect x="630" y="380" width="100" height="40" rx="8" fill="#232F3E" stroke="#c084fc" strokeWidth="1.5" />
        <text x="680" y="405" fill="#c084fc" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          EC2
        </text>
        {/* RDS Standby */}
        <rect x="550" y="435" width="130" height="35" rx="8" fill="#232F3E" stroke="#f472b6" strokeWidth="1.5" />
        <text x="615" y="457" fill="#f472b6" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          RDS Standby
        </text>

        {/* Connections */}
        {/* IGW → ALB */}
        <line x1="450" y1="140" x2="180" y2="260" stroke="#4ade80" strokeWidth="1.5" opacity="0.4" />
        <line x1="450" y1="140" x2="580" y2="260" stroke="#4ade80" strokeWidth="1.5" opacity="0.4" />
        {/* ALB → ECS */}
        <line x1="180" y1="300" x2="170" y2="380" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />
        <line x1="580" y1="300" x2="560" y2="380" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />

        {/* Security Group badge */}
        <rect x="600" y="150" width="200" height="28" rx="6" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" strokeWidth="1" />
        <text x="700" y="169" fill="#a78bfa" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          🔒 Security Groups (Stateful)
        </text>

        {/* NACL badge */}
        <rect x="80" y="505" width="200" height="24" rx="6" fill="#f97316" opacity="0.15" stroke="#f97316" strokeWidth="1" />
        <text x="180" y="521" fill="#fb923c" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          NACLs (Stateless, Subnet-level)
        </text>
      </svg>
</div>
</div>
    </motion.div>
  );
}

/* ──── Reference Architecture SVG ──── */

function ReferenceArchitectureSVG() {
  const nodes = [
    { label: 'Client', sub: 'Browser / Mobile', x: 80, y: 60, w: 120, h: 55, color: '#60a5fa' },
    { label: 'Route 53', sub: 'DNS', x: 260, y: 60, w: 120, h: 55, color: '#FF9900' },
    { label: 'CloudFront', sub: 'CDN', x: 440, y: 60, w: 130, h: 55, color: '#22d3ee' },
    { label: 'ALB', sub: 'Load Balancer', x: 340, y: 170, w: 120, h: 55, color: '#a78bfa' },
    { label: 'ECS / Fargate', sub: 'App Containers', x: 180, y: 280, w: 150, h: 55, color: '#c084fc' },
    { label: 'Lambda', sub: 'Event Processing', x: 470, y: 280, w: 130, h: 55, color: '#FF9900' },
    { label: 'RDS / Aurora', sub: 'SQL Database', x: 80, y: 400, w: 140, h: 55, color: '#4ade80' },
    { label: 'DynamoDB', sub: 'NoSQL Database', x: 280, y: 400, w: 140, h: 55, color: '#d946ef' },
    { label: 'ElastiCache', sub: 'Redis Cache', x: 480, y: 400, w: 140, h: 55, color: '#f97316' },
    { label: 'S3', sub: 'Object Storage', x: 650, y: 170, w: 110, h: 55, color: '#fbbf24' },
    { label: 'CloudWatch', sub: 'Monitoring', x: 680, y: 400, w: 130, h: 55, color: '#fb7185' },
  ];

  const arrows: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [3, 5],
    [4, 6], [4, 7], [5, 7], [4, 8], [2, 9],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="my-8 p-6 rounded-2xl border border-[#FF9900]/30 bg-gradient-to-br from-[#FF9900]/5 to-transparent"
    >
      <h4 className="text-sm font-semibold text-[#FF9900] uppercase tracking-wider mb-4">
        ⭐ Reference Architecture — Production-Ready AWS
      </h4>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 850 490" className="w-full min-w-[800px] lg:min-w-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#FF9900" opacity="0.6" />
          </marker>
        </defs>

        {/* Arrows */}
        {arrows.map(([from, to], i) => {
          const f = nodes[from];
          const t = nodes[to];
          const fx = f.x + f.w / 2;
          const fy = f.y + f.h / 2;
          const tx = t.x + t.w / 2;
          const ty = t.y + t.h / 2;
          return (
            <motion.line
              key={`arrow-${i}`}
              x1={fx}
              y1={fy}
              x2={tx}
              y2={ty}
              stroke="#FF9900"
              strokeWidth="1.5"
              opacity="0.35"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.35 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, type: "spring" as any, stiffness: 200 }}
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx="10"
              fill="#0f172a"
              stroke={node.color}
              strokeWidth="1.5"
            />
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx="10"
              fill={node.color}
              opacity="0.08"
            />
            <text
              x={node.x + node.w / 2}
              y={node.y + 24}
              fill={node.color}
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {node.label}
            </text>
            <text
              x={node.x + node.w / 2}
              y={node.y + 42}
              fill="#9ca3af"
              fontSize="10"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {node.sub}
            </text>
          </motion.g>
        ))}

        {/* CloudWatch monitoring lines (dashed) */}
        {[6, 7, 8].map((idx) => {
          const n = nodes[idx];
          const cw = nodes[10];
          return (
            <line
              key={`monitor-${idx}`}
              x1={n.x + n.w}
              y1={n.y + n.h / 2}
              x2={cw.x}
              y2={cw.y + cw.h / 2}
              stroke="#fb7185"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.25"
            />
          );
        })}
      </svg>
</div>
</div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAIN COMPONENT ━━━━━━━━━━━━━━━━━━━━ */


const moduleQuestions = [
  {
    "id": "1",
    "text": "Which AWS database service is a fully managed NoSQL database designed for consistent single-digit millisecond latency at any scale?",
    "options": [
      "Amazon RDS (Relational Database Service)",
      "Amazon Redshift",
      "Amazon DynamoDB",
      "Amazon S3"
    ],
    "correctAnswer": 2,
    "explanation": "DynamoDB is a fully managed, serverless, key-value NoSQL database designed to run high-performance applications at any scale with consistent single-digit millisecond latency."
  },
  {
    "id": "2",
    "text": "What is the main difference between an Application Load Balancer (ALB) and a Network Load Balancer (NLB)?",
    "options": [
      "ALB is faster than NLB.",
      "ALB operates at Layer 7 (HTTP/HTTPS) and can route based on URLs/headers, while NLB operates at Layer 4 (TCP/UDP) for ultra-low latency.",
      "ALB is only for on-premise servers, NLB is for cloud servers.",
      "There is no difference; they are aliases for the same service."
    ],
    "correctAnswer": 1,
    "explanation": "ALB is a Layer 7 proxy capable of inspecting HTTP headers and paths for intelligent routing. NLB operates at Layer 4, handling millions of requests per second at ultra-low latency using TCP/UDP."
  },
  {
    "id": "3",
    "text": "In AWS VPC networking, what is the key difference between a Security Group and a Network ACL (NACL)?",
    "options": [
      "Security Groups act at the subnet level, NACLs act at the instance level.",
      "Security Groups are stateless, NACLs are stateful.",
      "Security Groups are stateful and tied to instances/ENIs, while NACLs are stateless and tied to entire subnets.",
      "Security Groups only allow Outbound traffic, NACLs only allow Inbound traffic."
    ],
    "correctAnswer": 2,
    "explanation": "Security Groups are stateful (if you allow an inbound port, outbound response is automatically allowed) and applied to instances. NACLs are stateless (rules must be defined for both inbound and outbound) and applied to entire subnets as a perimeter defense."
  }
];

export default function Module5() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 overflow-x-hidden">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-6 text-center overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(255,153,0,0.08) 0%, transparent 70%)',
              'radial-gradient(ellipse 800px 500px at 50% 50%, rgba(255,153,0,0.12) 0%, transparent 70%)',
              'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(255,153,0,0.08) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as any }}
        />

        <motion.div {...pulse}>
          <Cloud className="w-16 h-16 text-[#FF9900] mx-auto mb-6" />
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          The Good Parts of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9900] to-[#ff6600]">
            AWS
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          AWS has <span className="text-[#FF9900] font-bold">200+</span> services, but{' '}
          <span className="text-slate-900 dark:text-white font-semibold">99% of real-world architectures</span> use the
          same ~15 core primitives. Master these, and you can build almost anything.
        </p>

        {/* Quick stat cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: 'Total Services', value: '200+', color: '#FF9900' },
            { label: 'Core Primitives', value: '~15', color: '#4ade80' },
            { label: 'Regions', value: '33', color: '#60a5fa' },
            { label: 'Availability Zones', value: '105+', color: '#d946ef' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm min-w-[140px]"
            >
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 pb-32">
        {/* ═══════════ 1. INTRODUCTION ═══════════ */}
        <Section id="introduction" icon={Info} title="Introduction: The 15 That Matter">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-gray-300 leading-relaxed mb-6 text-lg">
              The most dangerous trap in AWS is{' '}
              <span className="text-[#FF9900] font-semibold">choice overload</span>. With 200+
              services and dozens of overlapping capabilities, engineers often waste weeks evaluating
              options that don't matter. The truth? A handful of battle-tested primitives power the
              vast majority of production systems at every scale — from startups to Netflix.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            >
              {[
                { icon: Cpu, label: 'Compute', services: 'EC2, ECS, Lambda' },
                { icon: HardDrive, label: 'Storage', services: 'S3, EBS, EFS' },
                { icon: Database, label: 'Databases', services: 'RDS, DynamoDB' },
                { icon: Network, label: 'Networking', services: 'VPC, Route53, ALB' },
                { icon: Shield, label: 'Security', services: 'IAM, KMS' },
                { icon: Eye, label: 'Monitoring', services: 'CloudWatch' },
                { icon: Globe, label: 'CDN', services: 'CloudFront' },
                { icon: RefreshCw, label: 'Caching', services: 'ElastiCache' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#FF9900]/30 transition-all hover:bg-white/[0.04] group"
                >
                  <item.icon className="w-5 h-5 text-[#FF9900] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.services}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="p-5 rounded-xl border border-[#FF9900]/20 bg-[#FF9900]/5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF9900] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">The Rule of "Good Enough":</strong> Don't chase the
                    "best" AWS service for every use case. Pick the most commonly used, well-documented
                    primitive and move forward. You can always migrate later — but you can't get back
                    time lost to analysis paralysis.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Section>

        {/* ═══════════ 2. COMPUTE ═══════════ */}
        <Section id="compute" icon={Cpu} title="Compute">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-400 mb-6 leading-relaxed">
            AWS gives you a spectrum of compute options — from full OS control to zero-ops serverless.
            The right choice depends on your team size, traffic patterns, and operational maturity.
          </motion.p>

          <ComputeSpectrumSVG />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <CollapsibleCard
              title="EC2 — Elastic Compute Cloud"
              subtitle="Virtual machines with full OS control"
              icon={Server}
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  EC2 is the foundation of AWS compute. Each instance is a virtual machine running on
                  AWS's physical servers. You choose the OS, install software, and manage everything
                  above the hypervisor.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <h5 className="text-sm font-semibold text-[#FF9900] mb-3">Instance Type Families</h5>
                    <div className="space-y-2 text-sm">
                      <KVRow label="t3/t4g (Burstable)" value="Web servers, dev/test — CPU credits system" />
                      <KVRow label="m6i (General)" value="Balanced CPU/memory — most workloads start here" />
                      <KVRow label="c6i (Compute)" value="CPU-intensive — batch processing, ML inference" />
                      <KVRow label="r6i (Memory)" value="In-memory databases, real-time analytics" />
                      <KVRow label="p4d (GPU)" value="ML training, HPC, video encoding" />
                      <KVRow label="i3 (Storage)" value="High I/O — databases that need local NVMe" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <h5 className="text-sm font-semibold text-[#FF9900] mb-3">Key Concepts</h5>
                    <div className="space-y-2 text-sm">
                      <KVRow label="AMI" value="Amazon Machine Image — snapshot of OS + software. Launch instances from AMIs." />
                      <KVRow label="Security Groups" value="Virtual firewalls. Stateful — allow inbound rule auto-allows return traffic." />
                      <KVRow label="Key Pairs" value="SSH access. AWS stores public key, you keep private key." />
                      <KVRow label="Pricing" value="On-Demand, Reserved (up to 72% off), Spot (up to 90% off, can be interrupted)" />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="ECS / EKS — Container Orchestration"
              subtitle="Docker at scale with or without Kubernetes"
              icon={Box}
              color="#60a5fa"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Containers give you isolation without the overhead of full VMs. ECS is AWS-native
                  orchestration (simpler). EKS is managed Kubernetes (more portable, more complex).
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">ECS (Elastic Container Service)</h5>
                    <ul className="text-sm text-gray-400 space-y-1.5">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> AWS-native, simpler than K8s</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Task Definitions = container specs</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Services maintain desired count</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Deep ALB integration built-in</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <h5 className="text-sm font-semibold text-purple-400 mb-2">Fargate — Serverless Containers</h5>
                    <ul className="text-sm text-gray-400 space-y-1.5">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> No EC2 instances to manage</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Pay per vCPU + memory per second</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Works with both ECS and EKS</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Best for variable workloads</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Lambda — Serverless Functions"
              subtitle="Event-driven compute with zero server management"
              icon={Zap}
              color="#fbbf24"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Lambda runs your code in response to events — HTTP requests, S3 uploads, DynamoDB
                  changes, SQS messages, scheduled cron. You pay nothing when it's idle.
                </p>

                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { label: 'Max Timeout', value: '15 min', desc: 'Per invocation' },
                    { label: 'Memory', value: '128MB–10GB', desc: 'CPU scales with memory' },
                    { label: 'Cold Start', value: '100ms–5s', desc: 'Provisioned concurrency helps' },
                    { label: 'Concurrency', value: '1,000 default', desc: 'Per account per region' },
                    { label: 'Package Size', value: '250MB unzipped', desc: 'Use layers for deps' },
                    { label: 'Pricing', value: '$0.20 / 1M reqs', desc: '+ $0.0000166667/GB-s' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-lg font-bold text-yellow-400">{item.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <h5 className="text-sm font-semibold text-yellow-400 mb-2">Common Event Triggers</h5>
                  <div className="flex flex-wrap gap-2">
                    {['API Gateway', 'S3 Events', 'DynamoDB Streams', 'SQS', 'SNS', 'EventBridge', 'CloudWatch Events', 'Kinesis', 'Cognito'].map((t) => (
                      <Badge key={t} variant="orange">{t}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-red-400">Cold Start Warning:</strong> First invocation after idle
                      can take 100ms–5s depending on runtime (Java/C# worst, Python/Node best).
                      Use <strong className="text-slate-900 dark:text-white">Provisioned Concurrency</strong> for latency-sensitive
                      APIs. This keeps instances warm but costs more.
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 3. STORAGE ═══════════ */}
        <Section id="storage" icon={HardDrive} title="Storage">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-400 mb-6 leading-relaxed">
            AWS separates storage into three paradigms: object (S3), block (EBS), and file (EFS).
            Each solves a fundamentally different problem.
          </motion.p>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <CollapsibleCard
              title="S3 — Simple Storage Service"
              subtitle="Object storage with 11 nines of durability"
              icon={Archive}
              color="#4ade80"
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  S3 is infinitely scalable object storage. It's designed for{' '}
                  <strong className="text-emerald-400">99.999999999% (11 nines) durability</strong> — you're
                  more likely to be struck by lightning than lose an S3 object.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 pr-4 text-[#FF9900] font-semibold">Storage Class</th>
                        <th className="text-left py-2 pr-4 text-gray-400 font-medium">Use Case</th>
                        <th className="text-left py-2 pr-4 text-gray-400 font-medium">Retrieval</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">Standard</td>
                        <td className="py-2 pr-4">Frequently accessed data</td>
                        <td className="py-2 pr-4">Instant</td>
                        <td className="py-2"><Badge variant="orange">$$$</Badge></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">Standard-IA</td>
                        <td className="py-2 pr-4">Infrequent access, rapid retrieval</td>
                        <td className="py-2 pr-4">Instant</td>
                        <td className="py-2"><Badge variant="blue">$$</Badge></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">Glacier Instant</td>
                        <td className="py-2 pr-4">Archive w/ instant access</td>
                        <td className="py-2 pr-4">Milliseconds</td>
                        <td className="py-2"><Badge variant="green">$$</Badge></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">Glacier Flexible</td>
                        <td className="py-2 pr-4">Long-term archive</td>
                        <td className="py-2 pr-4">Minutes–hours</td>
                        <td className="py-2"><Badge variant="green">$</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">Glacier Deep</td>
                        <td className="py-2 pr-4">Compliance archives (7-10yr)</td>
                        <td className="py-2 pr-4">12–48 hours</td>
                        <td className="py-2"><Badge variant="green">¢</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <h5 className="text-sm font-semibold text-emerald-400 mb-2">S3 Static Website Hosting</h5>
                  <p className="text-sm text-gray-400">
                    S3 can host static websites (HTML, CSS, JS) directly. Pair with CloudFront for HTTPS,
                    custom domains, and global edge caching. This is how many SPAs and documentation sites
                    are deployed — zero servers needed.
                  </p>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="EBS — Elastic Block Store"
              subtitle="Persistent block storage for EC2 instances"
              icon={HardDrive}
              color="#60a5fa"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  EBS volumes are network-attached drives for EC2. Think of them like virtual hard drives
                  that persist independently of the instance lifecycle.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">SSD Types</h5>
                    <KVRow label="gp3 (General)" value="3,000 IOPS baseline. Best default. $0.08/GB-mo" />
                    <KVRow label="io2 (Provisioned)" value="Up to 64,000 IOPS. For databases needing consistent I/O" />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-500/5 border border-gray-500/15">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">HDD Types</h5>
                    <KVRow label="st1 (Throughput)" value="Big data, log processing. 500MB/s throughput" />
                    <KVRow label="sc1 (Cold)" value="Infrequent access. Cheapest block storage" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ⚠️ EBS volumes are AZ-locked. To move data across AZs, create a snapshot and restore
                  in the target AZ. Snapshots are stored in S3 (incremental).
                </p>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="EFS — Elastic File System"
              subtitle="Managed NFS — shared filesystem across instances"
              icon={Layers}
              color="#a855f7"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  EFS is a fully managed NFS file system that can be mounted by multiple EC2 instances
                  simultaneously across AZs. It grows and shrinks automatically.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">Multi-AZ</div>
                    <div className="text-xs text-gray-500 mt-1">Shared across instances</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">Auto-scaling</div>
                    <div className="text-xs text-gray-500 mt-1">Petabyte scale, pay per use</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">NFSv4</div>
                    <div className="text-xs text-gray-500 mt-1">Standard protocol</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Great for CMS content, shared configs, and container workloads via ECS/EKS volume mounts.
                  Use EFS Infrequent Access for cold data to save ~92% on storage costs.
                </p>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 4. DATABASES ═══════════ */}
        <Section id="databases" icon={Database} title="Databases">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-400 mb-6 leading-relaxed">
            The database you choose is the hardest thing to change later. AWS offers managed options for
            every data model — relational, document, key-value, columnar, and in-memory.
          </motion.p>

          <DatabaseDecisionTreeSVG />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <CollapsibleCard
              title="RDS — Relational Database Service"
              subtitle="Managed Postgres, MySQL, MariaDB, Oracle, SQL Server, Aurora"
              icon={Database}
              color="#4ade80"
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  RDS handles backups, patching, failover, and replication. You bring the SQL, AWS handles
                  the ops. Aurora is AWS's cloud-native engine — 5x faster than MySQL, 3x faster than Postgres.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <h5 className="text-sm font-semibold text-emerald-400 mb-2">Multi-AZ Deployment</h5>
                    <p className="text-sm text-gray-400 mb-2">
                      Synchronous replication to a standby in another AZ. Automatic failover in 60–120 seconds.
                      The standby is <strong className="text-slate-900 dark:text-white">not</strong> readable — it's purely for HA.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="green">Production-ready</Badge>
                      <Badge variant="blue">Auto failover</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">Read Replicas</h5>
                    <p className="text-sm text-gray-400 mb-2">
                      Asynchronous replication — up to 15 read replicas for Aurora, 5 for other engines.
                      Great for read-heavy workloads. Can be in different regions for disaster recovery.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="blue">Scale reads</Badge>
                      <Badge variant="purple">Cross-region</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="DynamoDB — NoSQL at Any Scale"
              subtitle="Fully managed key-value and document database"
              icon={Zap}
              color="#d946ef"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  DynamoDB delivers single-digit millisecond latency at any scale. No servers to manage,
                  no capacity planning (with on-demand mode). It's the default choice for any workload
                  where you can model your access patterns upfront.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-purple-400 mb-3">Core Concepts</h5>
                    <div className="space-y-1">
                      <KVRow label="Partition Key (PK)" value="Hash key — determines which partition stores your item. Must be chosen for even distribution." />
                      <KVRow label="Sort Key (SK)" value="Range key — enables range queries within a partition. PK + SK = unique item." />
                      <KVRow label="GSI" value="Global Secondary Index — alternate PK/SK for different query patterns. Eventually consistent." />
                      <KVRow label="LSI" value="Local Secondary Index — same PK, different SK. Must be defined at table creation." />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-purple-400 mb-3">Pricing Models</h5>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">On-Demand</div>
                        <div className="text-xs text-gray-400 mt-1">Pay per request. No capacity planning. Best for unpredictable traffic.</div>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">Provisioned</div>
                        <div className="text-xs text-gray-400 mt-1">Set RCU/WCU. Cheaper for predictable workloads. Auto-scaling available.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="ElastiCache — In-Memory Caching"
              subtitle="Managed Redis or Memcached"
              icon={RefreshCw}
              color="#f97316"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Sub-millisecond response times for frequently accessed data. Use as a cache layer in front
                  of your database, a session store, or for real-time leaderboards and rate limiting.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <h5 className="text-sm font-semibold text-orange-400 mb-1">Redis</h5>
                    <p className="text-xs text-gray-400">Rich data structures (sorted sets, lists, pub/sub), persistence, replication, Lua scripting. Choose Redis unless you have a specific reason not to.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-500/5 border border-gray-500/20">
                    <h5 className="text-sm font-semibold text-gray-400 mb-1">Memcached</h5>
                    <p className="text-xs text-gray-400">Simple key-value only, multi-threaded, no persistence. Slightly simpler for pure caching when you don't need data structures.</p>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Redshift — Data Warehouse"
              subtitle="Petabyte-scale columnar analytics"
              icon={BarChart3}
              color="#fbbf24"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Redshift is for analytical queries across massive datasets — think business intelligence,
                  not application backends. It uses columnar storage and massively parallel processing (MPP).
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="orange">Columnar storage</Badge>
                  <Badge variant="blue">MPP architecture</Badge>
                  <Badge variant="green">Redshift Spectrum (query S3 directly)</Badge>
                  <Badge variant="purple">Federated queries to RDS/Aurora</Badge>
                </div>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 5. NETWORKING ═══════════ */}
        <Section id="networking" icon={Network} title="Networking">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-400 mb-6 leading-relaxed">
            Networking in AWS is built around VPCs — your isolated virtual network. Every resource
            lives in a VPC. Understanding subnets, gateways, and routing is essential for any
            production deployment.
          </motion.p>

          <VPCArchitectureSVG />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <CollapsibleCard
              title="VPC — Virtual Private Cloud"
              subtitle="Your isolated network in AWS"
              icon={Network}
              color="#4ade80"
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  A VPC is your own isolated section of the AWS cloud. You define the IP range (CIDR block),
                  create subnets, configure route tables, and control traffic with security groups and NACLs.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <h5 className="text-sm font-semibold text-emerald-400 mb-2">Public Subnet</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Route table has route to Internet Gateway</li>
                      <li>• Resources get public IPs (or Elastic IPs)</li>
                      <li>• For: ALBs, bastion hosts, NAT Gateways</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                    <h5 className="text-sm font-semibold text-indigo-400 mb-2">Private Subnet</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• No direct internet access</li>
                      <li>• Outbound via NAT Gateway in public subnet</li>
                      <li>• For: App servers, databases, internal services</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
                  <h5 className="text-sm font-semibold text-[#FF9900] mb-3">Security Groups vs NACLs</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 pr-4 text-gray-400 font-medium">Feature</th>
                          <th className="text-left py-2 pr-4 text-emerald-400 font-medium">Security Groups</th>
                          <th className="text-left py-2 text-orange-400 font-medium">NACLs</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300 text-xs">
                        <tr className="border-b border-white/5">
                          <td className="py-2 pr-4">Level</td>
                          <td className="py-2 pr-4">Instance (ENI)</td>
                          <td className="py-2">Subnet</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 pr-4">State</td>
                          <td className="py-2 pr-4 text-emerald-400">Stateful</td>
                          <td className="py-2 text-orange-400">Stateless</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 pr-4">Rules</td>
                          <td className="py-2 pr-4">Allow only</td>
                          <td className="py-2">Allow + Deny</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">Evaluation</td>
                          <td className="py-2 pr-4">All rules evaluated</td>
                          <td className="py-2">Rules evaluated in order</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Route 53 — DNS Service"
              subtitle="Highly available DNS with health checking"
              icon={Globe}
              color="#22d3ee"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Route 53 is AWS's DNS service with 100% SLA. It translates domain names to IP addresses
                  and supports multiple routing policies for traffic management.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { policy: 'Simple', desc: 'Single resource. A → IP address.', color: '#60a5fa' },
                    { policy: 'Weighted', desc: 'Split traffic by percentage (A/B testing, blue-green).', color: '#4ade80' },
                    { policy: 'Latency', desc: 'Route to lowest-latency region for the user.', color: '#fbbf24' },
                    { policy: 'Failover', desc: 'Active-passive. Switch to backup on health check failure.', color: '#f87171' },
                    { policy: 'Geolocation', desc: 'Route based on user\'s geographic location.', color: '#d946ef' },
                    { policy: 'Multi-Value', desc: 'Return up to 8 healthy IPs (simple load balancing).', color: '#22d3ee' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="text-sm font-semibold mb-1" style={{ color: item.color }}>
                        {item.policy}
                      </div>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="CloudFront — Content Delivery Network"
              subtitle="450+ edge locations worldwide"
              icon={Globe}
              color="#a78bfa"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  CloudFront caches your content at AWS edge locations around the world. It supports
                  static files (S3), dynamic content (ALB/EC2), and Lambda@Edge for edge computing.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">450+</div>
                    <div className="text-xs text-gray-500">Edge Locations</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">HTTPS</div>
                    <div className="text-xs text-gray-500">Free SSL/TLS via ACM</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                    <div className="text-2xl font-bold text-purple-400">Lambda@Edge</div>
                    <div className="text-xs text-gray-500">Compute at the edge</div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="ELB — Elastic Load Balancing"
              subtitle="Distribute traffic across targets"
              icon={GitBranch}
              color="#f97316"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Load balancers distribute incoming traffic across multiple targets (EC2, containers, IPs,
                  Lambda). They're the front door to your application.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <h5 className="text-sm font-semibold text-orange-400 mb-2">
                      ALB — Application Load Balancer (Layer 7)
                    </h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• HTTP/HTTPS routing (path, host, headers)</li>
                      <li>• WebSocket support</li>
                      <li>• Target groups (EC2, ECS, Lambda, IP)</li>
                      <li>• Built-in auth (Cognito, OIDC)</li>
                    </ul>
                    <Badge variant="orange">Most common choice</Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">
                      NLB — Network Load Balancer (Layer 4)
                    </h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• TCP/UDP/TLS routing</li>
                      <li>• Millions of requests/second</li>
                      <li>• Static IP / Elastic IP per AZ</li>
                      <li>• Ultra-low latency (~100μs)</li>
                    </ul>
                    <Badge variant="blue">High-performance</Badge>
                  </div>
                </div>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 6. SECURITY ═══════════ */}
        <Section id="security" icon={Shield} title="Security">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-gray-400 mb-6 leading-relaxed">
              Security in AWS follows the <strong className="text-slate-900 dark:text-white">Shared Responsibility Model</strong>:
              AWS secures the infrastructure; you secure your configuration, data, and access control. IAM is
              the most important service you'll interact with.
            </motion.p>

            <CollapsibleCard
              title="IAM — Identity & Access Management"
              subtitle="Who can do what to which resources"
              icon={Users}
              color="#f87171"
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  IAM controls authentication (who are you?) and authorization (what can you do?). Every API
                  call to AWS is authorized through IAM. It's global — not region-specific.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-red-400">Users</span>
                      </div>
                      <p className="text-xs text-gray-400">Individual people or services. Each gets unique credentials. Never use root account.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-400">Groups</span>
                      </div>
                      <p className="text-xs text-gray-400">Collection of users. Attach policies to groups, not individual users. E.g., "Developers", "Ops".</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <Key className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Roles</span>
                      </div>
                      <p className="text-xs text-gray-400">Temporary credentials assumed by services (EC2, Lambda, ECS) or cross-account access. No passwords.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">Policies (JSON)</span>
                      </div>
                      <p className="text-xs text-gray-400">Define permissions: Effect (Allow/Deny), Action (s3:GetObject), Resource (arn:aws:s3:::my-bucket/*).</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-sm font-semibold text-red-400 mb-1">Principle of Least Privilege</h5>
                      <p className="text-sm text-gray-400">
                        Grant only the minimum permissions needed for a task. Start with zero permissions and
                        add as needed. Use IAM Access Analyzer to identify unused permissions and tighten policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="KMS — Key Management Service"
              subtitle="Managed encryption keys for data protection"
              icon={Key}
              color="#fbbf24"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  KMS manages encryption keys for your AWS services and applications. It integrates with
                  S3, EBS, RDS, DynamoDB, and dozens of other services for encryption at rest and in transit.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="orange">AES-256 encryption</Badge>
                  <Badge variant="blue">Automatic key rotation</Badge>
                  <Badge variant="green">CloudTrail audit logging</Badge>
                  <Badge variant="purple">FIPS 140-2 validated</Badge>
                </div>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 7. MONITORING ═══════════ */}
        <Section id="monitoring" icon={Activity} title="Monitoring & Scaling">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-gray-400 mb-6 leading-relaxed">
              You can't improve what you can't measure. CloudWatch, CloudTrail, and Auto Scaling Groups
              form the observability and elasticity backbone of every AWS deployment.
            </motion.p>

            <CollapsibleCard
              title="CloudWatch — Metrics, Logs & Alarms"
              subtitle="The eyes and ears of your AWS infrastructure"
              icon={Eye}
              color="#fb7185"
              defaultOpen
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  CloudWatch collects metrics, logs, and events from virtually every AWS service. It's the
                  central hub for monitoring, alerting, and dashboarding.
                </p>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/15">
                    <h5 className="text-sm font-semibold text-pink-400 mb-1">Metrics</h5>
                    <p className="text-xs text-gray-400">CPU, memory, disk, network, custom. 1-minute or 5-minute resolution. Custom metrics for application KPIs.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/15">
                    <h5 className="text-sm font-semibold text-pink-400 mb-1">Logs</h5>
                    <p className="text-xs text-gray-400">Centralized log aggregation. Log groups, streams, and Insights for querying. Retain forever or set TTL.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/15">
                    <h5 className="text-sm font-semibold text-pink-400 mb-1">Alarms</h5>
                    <p className="text-xs text-gray-400">Threshold or anomaly detection. Trigger SNS, Auto Scaling, Lambda. States: OK, ALARM, INSUFFICIENT_DATA.</p>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="CloudTrail — API Audit Trail"
              subtitle="Who did what, when, and from where"
              icon={Search}
              color="#a78bfa"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  CloudTrail records every API call made in your AWS account — console, CLI, SDK, or service.
                  It's your compliance and forensics backbone. Enabled by default for 90 days.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="purple">Management events</Badge>
                  <Badge variant="blue">Data events (S3, Lambda)</Badge>
                  <Badge variant="green">Insights events (anomalies)</Badge>
                  <Badge variant="orange">Multi-region support</Badge>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Auto Scaling Groups (ASG)"
              subtitle="Automatically adjust capacity to demand"
              icon={TrendingUp}
              color="#22d3ee"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  ASGs maintain a fleet of EC2 instances that automatically scales based on demand.
                  Define min/max/desired capacity and let scaling policies handle the rest.
                </p>

                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { type: 'Target Tracking', desc: 'Maintain a metric at a target (e.g., CPU at 50%)', color: '#22d3ee' },
                    { type: 'Step Scaling', desc: 'Scale in steps based on alarm thresholds', color: '#4ade80' },
                    { type: 'Scheduled', desc: 'Scale at specific times (e.g., business hours)', color: '#fbbf24' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                      <div className="text-sm font-semibold mb-1" style={{ color: item.color }}>
                        {item.type}
                      </div>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-sm text-gray-300">
                    <strong className="text-cyan-400">Pro tip:</strong> Combine ASG with Spot instances for
                    non-critical workloads. Use mixed instance policies (multiple instance types + purchase
                    options) for cost optimization and availability.
                  </p>
                </div>
              </div>
            </CollapsibleCard>
          </motion.div>
        </Section>

        {/* ═══════════ 8. REFERENCE ARCHITECTURE ═══════════ */}
        <Section id="reference" icon={Workflow} title="Reference Architecture">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-gray-400 mb-6 leading-relaxed">
              Here's how the ~15 core services fit together in a production-ready architecture. This
              pattern — or a subset of it — powers the majority of web applications on AWS.
            </motion.p>

            <ReferenceArchitectureSVG />

            <motion.div variants={fadeUp} className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <h5 className="text-sm font-semibold text-[#FF9900] mb-3">Request Flow</h5>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">1.</span>
                    Client makes DNS query → <strong className="text-slate-900 dark:text-white">Route 53</strong> resolves to CloudFront
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">2.</span>
                    <strong className="text-slate-900 dark:text-white">CloudFront</strong> serves cached content or forwards to ALB
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">3.</span>
                    <strong className="text-slate-900 dark:text-white">ALB</strong> routes to ECS containers based on path/host rules
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">4.</span>
                    <strong className="text-slate-900 dark:text-white">ECS/Fargate</strong> runs app logic, checks ElastiCache first
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">5.</span>
                    Cache miss → query <strong className="text-slate-900 dark:text-white">RDS/DynamoDB</strong>, populate cache
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9900] font-bold shrink-0">6.</span>
                    <strong className="text-slate-900 dark:text-white">Lambda</strong> handles async events (S3 uploads, queue processing)
                  </li>
                </ol>
              </div>

              <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <h5 className="text-sm font-semibold text-[#FF9900] mb-3">Why This Works</h5>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">High Availability:</strong> Multi-AZ across every layer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Scalability:</strong> ALB + ASG/Fargate auto-scales horizontally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Performance:</strong> CloudFront caching + ElastiCache reduce latency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Security:</strong> Private subnets, security groups, IAM roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Cost-effective:</strong> Serverless where possible, reserved for predictable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Observable:</strong> CloudWatch monitors every component</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Key takeaway */}
            <motion.div
              variants={fadeUp}
              className="mt-8 p-6 rounded-2xl border border-[#FF9900]/30 bg-gradient-to-br from-[#FF9900]/10 to-transparent text-center"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Master These 15 Services, Build Anything
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                You don't need to know all 200+ AWS services. EC2, ECS, Lambda, S3, RDS, DynamoDB,
                ElastiCache, VPC, Route 53, CloudFront, ALB, IAM, KMS, CloudWatch, and Auto Scaling — these
                are the primitives that power 99% of production architectures. Start here, go deep, and add
                specialized services only when you hit a specific need.
              </p>
            </motion.div>
          </motion.div>
        </Section>
      </div>
    

      {/* Module Quiz */}
      <Quiz title="AWS Cloud Primitives" questions={moduleQuestions} />
    </div>
  );
}
