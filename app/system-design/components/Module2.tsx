'use client';

import React, { useState } from 'react';
import Quiz from './Quiz';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Layers,
  Globe,
  Zap,
  Shield,
  Settings,
  GitBranch,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Cloud,
  Package,
  Code2,
  Users,
  Building2,
  Workflow,
  Container,
  Network,
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Cpu,
  HardDrive,
  Lock,
  Unlock,
  RefreshCw,
  Target,
  Puzzle,
  LayoutGrid,
  FileCode,
  Terminal,
  Rocket,
  Timer,
  Bug,
  Wrench,
  Scale,
  Maximize2,
  Minimize2,
  Eye,
  BarChart3,
  MessageSquare,
  CircleDot,
} from 'lucide-react';

/* ─────────────────────── animation variants ─────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as any },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.5, type: "spring" as any, stiffness: 120 },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────── section wrapper ─────────────────────── */
function Section({
  id,
  title,
  icon: Icon,
  color,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-slate-900 dark:text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* ─────────────────────── info card ─────────────────────── */
function InfoCard({
  title,
  children,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  gradient?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className={`rounded-2xl border border-white/10 p-6 backdrop-blur-sm ${
        gradient || 'bg-white/5'
      }`}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   1 — MONOLITH VS MICROSERVICES ANIMATED SVG
   ═══════════════════════════════════════════════════════════════════ */
function MonolithVsMicroservicesSVG() {
  const [showMicro, setShowMicro] = useState(false);

  return (
    <div className="my-8">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowMicro(!showMicro)}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 dark:text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          {showMicro ? 'Show Monolith' : 'Show Microservices'}
        </button>
      </div>
      <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 380" className="w-full max-w-3xl mx-auto min-w-[800px] lg:min-w-0">
        <defs>
          <linearGradient id="monoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="msGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="msGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="msGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="msGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence mode="wait">
          {!showMicro ? (
            <motion.g
              key="monolith"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <text x="400" y="30" textAnchor="middle" fill="#f87171" fontSize="20" fontWeight="bold">
                Monolithic Architecture
              </text>

              {/* Single big box */}
              <rect x="200" y="50" width="400" height="280" rx="16" fill="url(#monoGrad)" opacity="0.15" stroke="#ef4444" strokeWidth="2" />
              <rect x="200" y="50" width="400" height="280" rx="16" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
              </rect>

              {/* Internal modules tightly coupled */}
              {[
                { x: 250, y: 80, w: 140, h: 50, label: 'User Module', color: '#fca5a5' },
                { x: 410, y: 80, w: 140, h: 50, label: 'Product Module', color: '#fca5a5' },
                { x: 250, y: 150, w: 140, h: 50, label: 'Order Module', color: '#fca5a5' },
                { x: 410, y: 150, w: 140, h: 50, label: 'Payment Module', color: '#fca5a5' },
                { x: 250, y: 220, w: 140, h: 50, label: 'Shipping Module', color: '#fca5a5' },
                { x: 410, y: 220, w: 140, h: 50, label: 'Analytics Module', color: '#fca5a5' },
              ].map((m, i) => (
                <g key={i}>
                  <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="8" fill={m.color} opacity="0.2" stroke={m.color} strokeWidth="1" />
                  <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 5} textAnchor="middle" fill={m.color} fontSize="12" fontWeight="600">
                    {m.label}
                  </text>
                </g>
              ))}

              {/* Coupling lines */}
              {[
                [320, 130, 480, 150],
                [320, 130, 320, 220],
                [480, 130, 480, 220],
                [320, 200, 480, 220],
                [390, 105, 410, 105],
                [390, 175, 410, 175],
                [390, 245, 410, 245],
                [320, 270, 480, 270],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeDasharray="4 2" />
              ))}

              {/* Shared DB */}
              <ellipse cx="400" cy="300" rx="60" ry="18" fill="#fca5a5" opacity="0.3" stroke="#ef4444" strokeWidth="1.5" />
              <text x="400" y="305" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">
                Shared DB
              </text>

              {/* Warning labels */}
              <text x="400" y="360" textAnchor="middle" fill="#f87171" fontSize="13" opacity="0.8">
                ⚠ Tightly coupled • Single deployment • Single point of failure
              </text>
            </motion.g>
          ) : (
            <motion.g
              key="microservices"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <text x="400" y="30" textAnchor="middle" fill="#22d3ee" fontSize="20" fontWeight="bold">
                Microservices Architecture
              </text>

              {/* Individual services */}
              {[
                { x: 40, y: 55, label: 'User Service', grad: 'url(#msGrad1)', db: 'User DB' },
                { x: 220, y: 55, label: 'Product Service', grad: 'url(#msGrad2)', db: 'Product DB' },
                { x: 400, y: 55, label: 'Order Service', grad: 'url(#msGrad3)', db: 'Order DB' },
                { x: 580, y: 55, label: 'Payment Service', grad: 'url(#msGrad4)', db: 'Payment DB' },
                { x: 130, y: 210, label: 'Shipping Svc', grad: 'url(#msGrad1)', db: 'Ship DB' },
                { x: 490, y: 210, label: 'Analytics Svc', grad: 'url(#msGrad2)', db: 'Analytics DB' },
              ].map((s, i) => (
                <g key={i}>
                  <rect x={s.x} y={s.y} width="150" height="100" rx="12" fill={s.grad} opacity="0.15" stroke={s.grad.includes('msGrad1') ? '#06b6d4' : s.grad.includes('msGrad2') ? '#8b5cf6' : s.grad.includes('msGrad3') ? '#f59e0b' : '#10b981'} strokeWidth="1.5" />
                  <text x={s.x + 75} y={s.y + 35} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                    {s.label}
                  </text>
                  {/* Own DB */}
                  <ellipse cx={s.x + 75} cy={s.y + 75} rx="40" ry="12" fill="white" opacity="0.1" stroke="white" strokeWidth="0.5" />
                  <text x={s.x + 75} y={s.y + 79} textAnchor="middle" fill="white" fontSize="9" opacity="0.7">
                    {s.db}
                  </text>
                </g>
              ))}

              {/* API Gateway */}
              <rect x="270" y="195" width="180" height="40" rx="20" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="360" y="220" textAnchor="middle" fill="#22d3ee" fontSize="13" fontWeight="bold">
                API Gateway
              </text>

              {/* Communication arrows */}
              {[
                [115, 155, 280, 200],
                [295, 155, 330, 200],
                [475, 155, 400, 200],
                [655, 155, 440, 200],
                [280, 235, 205, 240],
                [440, 235, 490, 240],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06b6d4" strokeWidth="1" opacity="0.5" strokeDasharray="5 3">
                  <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.5s" repeatCount="indefinite" />
                </line>
              ))}

              {/* Message Bus */}
              <rect x="100" y="330" width="600" height="30" rx="15" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1" />
              <text x="400" y="350" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="600">
                Event Bus / Message Queue (Kafka, RabbitMQ)
              </text>

              {/* Bus connections */}
              {[130, 310, 490].map((x, i) => (
                <line key={i} x1={x + 75} y1={i < 1 ? 310 : 310} x2={x + 75} y2={330} stroke="#8b5cf6" strokeWidth="1" opacity="0.4" strokeDasharray="3 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1s" repeatCount="indefinite" />
                </line>
              ))}

              <text x="400" y="378" textAnchor="middle" fill="#22d3ee" fontSize="13" opacity="0.8">
                ✓ Independent deploy • Own databases • Resilient • Scalable
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
</div>
</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2 — BOUNDED CONTEXT MAP SVG
   ═══════════════════════════════════════════════════════════════════ */
function BoundedContextMapSVG() {
  return (
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 500" className="w-full max-w-3xl mx-auto my-8 min-w-[800px] lg:min-w-0">
      <defs>
        <linearGradient id="bcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="bcGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="bcGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="bcGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="bcGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <text x="400" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="bold">
        E-Commerce Bounded Context Map
      </text>

      {/* Catalog Context */}
      <rect x="20" y="50" width="230" height="170" rx="16" fill="url(#bcGrad1)" stroke="#06b6d4" strokeWidth="1.5" />
      <text x="135" y="78" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">
        📦 Catalog Context
      </text>
      <text x="40" y="100" fill="#94a3b8" fontSize="11">
        • Product aggregate
      </text>
      <text x="40" y="118" fill="#94a3b8" fontSize="11">
        • Category value object
      </text>
      <text x="40" y="136" fill="#94a3b8" fontSize="11">
        • Price value object
      </text>
      <text x="40" y="154" fill="#94a3b8" fontSize="11">
        • Inventory entity
      </text>
      <text x="40" y="178" fill="#67e8f9" fontSize="10" fontWeight="600">
        Team: Product Engineering
      </text>
      <text x="40" y="196" fill="#67e8f9" fontSize="10">
        Tech: Spring Boot + PostgreSQL
      </text>

      {/* Order Context */}
      <rect x="285" y="50" width="230" height="170" rx="16" fill="url(#bcGrad2)" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="400" y="78" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
        🛒 Order Context
      </text>
      <text x="305" y="100" fill="#94a3b8" fontSize="11">
        • Order aggregate root
      </text>
      <text x="305" y="118" fill="#94a3b8" fontSize="11">
        • OrderLine entity
      </text>
      <text x="305" y="136" fill="#94a3b8" fontSize="11">
        • ShippingAddress VO
      </text>
      <text x="305" y="154" fill="#94a3b8" fontSize="11">
        • OrderStatus enum
      </text>
      <text x="305" y="178" fill="#c4b5fd" fontSize="10" fontWeight="600">
        Team: Commerce Platform
      </text>
      <text x="305" y="196" fill="#c4b5fd" fontSize="10">
        Tech: Go + MongoDB
      </text>

      {/* Payment Context */}
      <rect x="550" y="50" width="230" height="170" rx="16" fill="url(#bcGrad3)" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="665" y="78" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">
        💳 Payment Context
      </text>
      <text x="570" y="100" fill="#94a3b8" fontSize="11">
        • Payment aggregate
      </text>
      <text x="570" y="118" fill="#94a3b8" fontSize="11">
        • Transaction entity
      </text>
      <text x="570" y="136" fill="#94a3b8" fontSize="11">
        • PaymentMethod VO
      </text>
      <text x="570" y="154" fill="#94a3b8" fontSize="11">
        • Refund entity
      </text>
      <text x="570" y="178" fill="#fcd34d" fontSize="10" fontWeight="600">
        Team: FinTech Squad
      </text>
      <text x="570" y="196" fill="#fcd34d" fontSize="10">
        Tech: Java + Stripe SDK
      </text>

      {/* Customer Context */}
      <rect x="80" y="290" width="230" height="170" rx="16" fill="url(#bcGrad4)" stroke="#10b981" strokeWidth="1.5" />
      <text x="195" y="318" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">
        👤 Customer Context
      </text>
      <text x="100" y="340" fill="#94a3b8" fontSize="11">
        • Customer aggregate
      </text>
      <text x="100" y="358" fill="#94a3b8" fontSize="11">
        • Address entity
      </text>
      <text x="100" y="376" fill="#94a3b8" fontSize="11">
        • LoyaltyPoints VO
      </text>
      <text x="100" y="394" fill="#94a3b8" fontSize="11">
        • Preferences VO
      </text>
      <text x="100" y="418" fill="#6ee7b7" fontSize="10" fontWeight="600">
        Team: CRM & Identity
      </text>
      <text x="100" y="436" fill="#6ee7b7" fontSize="10">
        Tech: Node.js + DynamoDB
      </text>

      {/* Shipping Context */}
      <rect x="480" y="290" width="230" height="170" rx="16" fill="url(#bcGrad5)" stroke="#ec4899" strokeWidth="1.5" />
      <text x="595" y="318" textAnchor="middle" fill="#f472b6" fontSize="14" fontWeight="bold">
        🚚 Shipping Context
      </text>
      <text x="500" y="340" fill="#94a3b8" fontSize="11">
        • Shipment aggregate
      </text>
      <text x="500" y="358" fill="#94a3b8" fontSize="11">
        • TrackingInfo entity
      </text>
      <text x="500" y="376" fill="#94a3b8" fontSize="11">
        • Carrier VO
      </text>
      <text x="500" y="394" fill="#94a3b8" fontSize="11">
        • DeliveryWindow VO
      </text>
      <text x="500" y="418" fill="#f9a8d4" fontSize="10" fontWeight="600">
        Team: Logistics
      </text>
      <text x="500" y="436" fill="#f9a8d4" fontSize="10">
        Tech: Python + Redis
      </text>

      {/* Relationship arrows */}
      {/* Catalog → Order (Upstream/Downstream) */}
      <line x1="250" y1="135" x2="285" y2="135" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrowCyan)">
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
      </line>
      <text x="267" y="125" textAnchor="middle" fill="#67e8f9" fontSize="8" fontWeight="bold">
        U/D
      </text>

      {/* Order → Payment (Customer/Supplier) */}
      <line x1="515" y1="135" x2="550" y2="135" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
      </line>
      <text x="532" y="125" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">
        C/S
      </text>

      {/* Customer → Order */}
      <line x1="250" y1="340" x2="380" y2="220" stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite" />
      </line>
      <text x="300" y="270" fill="#34d399" fontSize="8" fontWeight="bold">
        Conformist
      </text>

      {/* Order → Shipping */}
      <line x1="450" y1="220" x2="530" y2="310" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="5 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite" />
      </line>
      <text x="505" y="270" fill="#f472b6" fontSize="8" fontWeight="bold">
        ACL
      </text>

      {/* Arrow marker */}
      <defs>
        <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="#06b6d4" />
        </marker>
      </defs>

      {/* Legend */}
      <rect x="280" y="475" width="240" height="22" rx="11" fill="white" opacity="0.05" />
      <text x="400" y="491" textAnchor="middle" fill="#64748b" fontSize="10">
        U/D = Upstream/Downstream · C/S = Customer/Supplier · ACL = Anti-Corruption Layer
      </text>
    </svg>
</div>
</div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3 — DOCKER LAYERS SVG
   ═══════════════════════════════════════════════════════════════════ */
function DockerLayersSVG() {
  const layers = [
    { label: 'Application Code', color: '#06b6d4', desc: 'COPY . /app', size: '~50 MB' },
    { label: 'Dependencies (npm/pip)', color: '#8b5cf6', desc: 'RUN npm install', size: '~200 MB' },
    { label: 'Runtime (Node.js/JDK)', color: '#f59e0b', desc: 'FROM node:18-alpine', size: '~120 MB' },
    { label: 'OS Libraries', color: '#10b981', desc: 'Alpine Linux packages', size: '~30 MB' },
    { label: 'Base OS (Alpine)', color: '#ec4899', desc: 'Minimal Linux kernel', size: '~5 MB' },
    { label: 'Host Kernel (Shared)', color: '#64748b', desc: 'Linux kernel — shared by all containers', size: 'Shared' },
  ];

  return (
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 700 420" className="w-full max-w-2xl mx-auto my-8 min-w-[700px] lg:min-w-0">
      <text x="350" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="bold">
        Docker Image Layers (Union Filesystem)
      </text>

      {layers.map((layer, i) => {
        const y = 50 + i * 58;
        const width = 500 - i * 20;
        const x = (700 - width) / 2;
        const isShared = i === layers.length - 1;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={width}
              height={48}
              rx="8"
              fill={layer.color}
              opacity={isShared ? 0.15 : 0.2}
              stroke={layer.color}
              strokeWidth={isShared ? 2 : 1.5}
              strokeDasharray={isShared ? '8 4' : 'none'}
            >
              {!isShared && (
                <animate attributeName="opacity" values="0.15;0.25;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              )}
            </rect>
            <text x={x + 14} y={y + 22} fill="white" fontSize="13" fontWeight="bold">
              {layer.label}
            </text>
            <text x={x + 14} y={y + 38} fill={layer.color} fontSize="10" opacity="0.9">
              {layer.desc}
            </text>
            <text x={x + width - 14} y={y + 30} textAnchor="end" fill={layer.color} fontSize="11" fontWeight="600">
              {layer.size}
            </text>
            {i < layers.length - 1 && (
              <text x={x + width + 10} y={y + 30} fill="#64748b" fontSize="18">
                {i < layers.length - 2 ? '↕' : ''}
              </text>
            )}
          </g>
        );
      })}

      {/* Arrows showing read-only vs read-write */}
      <rect x="90" y="385" width="14" height="14" rx="3" fill="#06b6d4" opacity="0.3" stroke="#06b6d4" strokeWidth="1" />
      <text x="112" y="396" fill="#94a3b8" fontSize="11">
        Read-Write (top layer)
      </text>
      <rect x="280" y="385" width="14" height="14" rx="3" fill="#64748b" opacity="0.3" stroke="#64748b" strokeWidth="1" />
      <text x="302" y="396" fill="#94a3b8" fontSize="11">
        Read-Only (cached layers)
      </text>
      <rect x="470" y="385" width="14" height="14" rx="3" fill="#64748b" opacity="0.15" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2" />
      <text x="492" y="396" fill="#94a3b8" fontSize="11">
        Shared Kernel
      </text>
    </svg>
</div>
</div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   4 — MIGRATION TIMELINE SVG (STRANGLER FIG)
   ═══════════════════════════════════════════════════════════════════ */
function MigrationTimelineSVG() {
  return (
    <div className="w-full overflow-x-auto slick-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
<div className="rounded-xl bg-slate-900 p-3 sm:p-4 ring-1 ring-white/10">
<svg viewBox="0 0 800 340" className="w-full max-w-3xl mx-auto my-8 min-w-[800px] lg:min-w-0">
      <text x="400" y="25" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="bold">
        Strangler Fig Migration Pattern
      </text>

      {/* Timeline line */}
      <line x1="60" y1="180" x2="740" y2="180" stroke="#334155" strokeWidth="3" />

      {/* Monolith shrinking */}
      {[
        { x: 100, h: 120, label: 'Phase 1', desc: 'Full Monolith', monoH: 120, microH: 0 },
        { x: 240, h: 120, label: 'Phase 2', desc: 'Extract Auth', monoH: 100, microH: 20 },
        { x: 380, h: 120, label: 'Phase 3', desc: 'Extract Orders', monoH: 60, microH: 60 },
        { x: 520, h: 120, label: 'Phase 4', desc: 'Extract Catalog', monoH: 30, microH: 90 },
        { x: 660, h: 120, label: 'Phase 5', desc: 'Decomposed', monoH: 0, microH: 120 },
      ].map((phase, i) => {
        const monoY = 180 - phase.monoH;
        const microY = 180;

        return (
          <g key={i}>
            {/* Monolith (red, shrinking above line) */}
            {phase.monoH > 0 && (
              <rect x={phase.x - 30} y={monoY} width="60" height={phase.monoH} rx="6" fill="#ef4444" opacity="0.25" stroke="#ef4444" strokeWidth="1">
                <animate attributeName="opacity" values="0.2;0.3;0.2" dur="3s" repeatCount="indefinite" />
              </rect>
            )}
            {/* Microservices (cyan, growing below line) */}
            {phase.microH > 0 && (
              <rect x={phase.x - 30} y={microY} width="60" height={phase.microH} rx="6" fill="#06b6d4" opacity="0.25" stroke="#06b6d4" strokeWidth="1">
                <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2.5s" repeatCount="indefinite" />
              </rect>
            )}
            {/* Timeline dot */}
            <circle cx={phase.x} cy="180" r="6" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
            {/* Labels */}
            <text x={phase.x} y={320} textAnchor="middle" fill="#94a3b8" fontSize="10">
              {phase.desc}
            </text>
            <text x={phase.x} y={336} textAnchor="middle" fill="#64748b" fontSize="9">
              {phase.label}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x="260" y="42" width="12" height="12" rx="3" fill="#ef4444" opacity="0.4" />
      <text x="278" y="53" fill="#f87171" fontSize="11">
        Monolith (shrinking)
      </text>
      <rect x="420" y="42" width="12" height="12" rx="3" fill="#06b6d4" opacity="0.4" />
      <text x="438" y="53" fill="#22d3ee" fontSize="11">
        Microservices (growing)
      </text>
    </svg>
</div>
</div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPANDABLE SECTION COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
function Expandable({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors text-left"
      >
        <span className="text-slate-900 dark:text-white font-medium text-sm">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
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
            <div className="p-4 text-gray-300 text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN MODULE 2 COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const moduleQuestions = [
  {
    "id": "1",
    "text": "According to Domain-Driven Design (DDD), what is a Bounded Context?",
    "options": [
      "A strict limit on the amount of CPU and Memory a microservice can consume.",
      "A linguistic and semantic boundary within which a specific domain model is defined and strictly applies.",
      "The physical network boundary that separates public subnets from private subnets.",
      "A database transaction that ensures ACID properties."
    ],
    "correctAnswer": 1,
    "explanation": "A Bounded Context defines the boundary within which a specific ubiquitous language and model applies. For example, a \"User\" means something different in a Billing context vs a Support context."
  },
  {
    "id": "2",
    "text": "What is the main advantage of the Strangler Fig pattern for legacy migration?",
    "options": [
      "It forces a complete rewrite of the system from scratch in one go.",
      "It instantly deletes the legacy database to force adoption of the new system.",
      "It allows incremental, low-risk replacement of legacy functionality by routing specific traffic to new microservices over time.",
      "It automatically converts monolithic code into Docker containers."
    ],
    "correctAnswer": 2,
    "explanation": "The Strangler Fig pattern allows teams to incrementally migrate pieces of a monolith to new services, using a proxy to route traffic. This minimizes risk compared to a \"big bang\" rewrite."
  },
  {
    "id": "3",
    "text": "Why is \"Integration via a Shared Database\" generally considered an anti-pattern in microservices architectures?",
    "options": [
      "Because relational databases cannot hold more than a few gigabytes of data.",
      "It violates the principle of independent deployability and creates tight coupling between services.",
      "It is strictly forbidden by Docker and Kubernetes.",
      "It makes the application too fast, causing race conditions."
    ],
    "correctAnswer": 1,
    "explanation": "Microservices should own their own data. Sharing a database creates tight coupling; if one team changes the schema, it breaks the other services relying on it, destroying independent deployability."
  }
];

export default function Module2() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-sm font-medium mb-6"
          >
            <Box className="w-4 h-4" />
            Module 2 — System Design
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Microservice Principles
            <br />& Concepts
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            From monoliths to independently deployable services — master the architecture
            that powers Netflix, Amazon, and modern distributed systems.
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* ═══════════════ 1. WHAT ARE MICROSERVICES ═══════════════ */}
        <Section id="what-are-microservices" title="What Are Microservices?" icon={Box} color="from-cyan-500 to-blue-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <motion.p variants={fadeUp} className="text-gray-300 leading-relaxed text-base">
              Microservices are an architectural style where an application is structured as a collection of{' '}
              <span className="text-cyan-400 font-semibold">independently deployable, loosely-coupled services</span>,
              each running in its own process, communicating via lightweight mechanisms (often HTTP/REST or messaging).
              Each service is built around a specific <span className="text-cyan-400 font-semibold">business capability</span> and
              can be developed, deployed, and scaled independently.
            </motion.p>

            <MonolithVsMicroservicesSVG />

            <div className="grid md:grid-cols-2 gap-4">
              <InfoCard title="Key Characteristics" icon={CheckCircle2} delay={0}>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Single Responsibility:</strong> Each service does one thing well — e.g., User Authentication, Order Processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Own Data Store:</strong> No shared databases. Each service manages its own persistence layer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Independently Deployable:</strong> Deploy one service without redeploying the entire application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Technology Agnostic:</strong> Each service can use different languages, frameworks, databases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Organized Around Business:</strong> Teams own entire business capabilities, not technical layers</span>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard title="E-Commerce Example" icon={Building2} delay={1}>
                <p className="mb-3">
                  Consider an e-commerce platform decomposed into microservices:
                </p>
                <div className="space-y-2">
                  {[
                    { svc: 'Product Catalog Service', tech: 'Spring Boot + PostgreSQL', owns: 'Product info, categories, search' },
                    { svc: 'Order Service', tech: 'Go + MongoDB', owns: 'Cart, orders, order history' },
                    { svc: 'Payment Service', tech: 'Node.js + Stripe API', owns: 'Payment processing, refunds' },
                    { svc: 'User Service', tech: 'Python + DynamoDB', owns: 'Auth, profiles, preferences' },
                    { svc: 'Notification Service', tech: 'Go + Redis + SendGrid', owns: 'Email, SMS, push notifications' },
                    { svc: 'Shipping Service', tech: 'Java + PostgreSQL', owns: 'Logistics, tracking, carriers' },
                  ].map((s, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-900 dark:text-white font-medium text-xs">{s.svc}</span>
                      <span className="text-gray-500 text-xs ml-2">({s.tech})</span>
                      <p className="text-gray-400 text-xs mt-0.5">Owns: {s.owns}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 2. ADVANTAGES ═══════════════ */}
        <Section id="advantages" title="Advantages of Microservices" icon={TrendingUp} color="from-green-500 to-emerald-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Users,
                  title: 'Scaling Development',
                  color: 'text-green-400',
                  content:
                    'Multiple teams can work independently on different services without blocking each other. Each team owns a bounded context and can make decisions autonomously. Amazon\'s "two-pizza teams" model — small teams (6-10 people) that own entire services end-to-end. This enables organizations to scale from tens to thousands of developers.',
                },
                {
                  icon: Code2,
                  title: 'Technology Freedom',
                  color: 'text-blue-400',
                  content:
                    'Each service can use the best technology for its specific problem domain. A machine learning recommendation engine can use Python/TensorFlow, while a high-throughput event processor uses Go, and a CRUD admin service uses Ruby on Rails. This polyglot approach prevents technology lock-in and allows teams to adopt new technologies incrementally.',
                },
                {
                  icon: Rocket,
                  title: 'Continuous Delivery',
                  color: 'text-purple-400',
                  content:
                    'Smaller, focused codebases are easier to understand, test, and deploy. Each service has its own CI/CD pipeline. Netflix deploys thousands of times per day across hundreds of microservices. Canary releases and blue-green deployments become practical at the service level, reducing risk per deployment.',
                },
                {
                  icon: Shield,
                  title: 'Robustness & Fault Isolation',
                  color: 'text-yellow-400',
                  content:
                    'If the recommendation service crashes, customers can still browse products and make purchases. Circuit breakers (like Hystrix/Resilience4j) prevent cascading failures. Each service runs in its own process — a memory leak in one service doesn\'t affect others. Bulkhead pattern isolates failures to individual components.',
                },
                {
                  icon: RefreshCw,
                  title: 'Resilience',
                  color: 'text-rose-400',
                  content:
                    'Graceful degradation is built into the architecture. Services implement retry logic, fallbacks, and timeout policies. If the inventory service is slow, the catalog service can return cached data or show "check availability" instead of failing entirely. Health checks and auto-healing ensure services recover automatically.',
                },
                {
                  icon: Maximize2,
                  title: 'Independent Scaling',
                  color: 'text-cyan-400',
                  content:
                    'Scale only the services that need it. During Black Friday, you might need 50 instances of the Order Service but only 3 instances of the Admin Service. This is far more cost-effective than scaling an entire monolith. Kubernetes HPA (Horizontal Pod Autoscaler) can scale individual services based on CPU, memory, or custom metrics.',
                },
              ].map((adv, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  custom={i}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/8 group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <adv.icon className={`w-5 h-5 ${adv.color}`} />
                    <h3 className="text-slate-900 dark:text-white font-semibold">{adv.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{adv.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 3. CHALLENGES ═══════════════ */}
        <Section id="challenges" title="Challenges of Microservices" icon={AlertTriangle} color="from-red-500 to-orange-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: Settings,
                  title: 'Operations Complexity',
                  severity: 'High',
                  color: 'border-red-500/30',
                  content:
                    'Instead of deploying one application, you now manage dozens or hundreds of services. Each needs monitoring, logging, CI/CD pipelines, alerting, and infrastructure. You need centralized logging (ELK Stack), distributed tracing (Jaeger/Zipkin), service mesh (Istio/Linkerd), container orchestration (Kubernetes), and extensive DevOps tooling. Without mature operations, microservices become unmanageable.',
                  mitigation: 'Invest heavily in platform engineering, GitOps, and infrastructure-as-code before decomposing.',
                },
                {
                  icon: Timer,
                  title: 'Network Latency & Reliability',
                  severity: 'High',
                  color: 'border-orange-500/30',
                  content:
                    'In-process function calls (nanoseconds) become network calls (milliseconds). The "distributed computing fallacies" become reality — the network is NOT reliable, latency is NOT zero, bandwidth is NOT infinite. A single user request might traverse 5-10 services, each adding latency. Service-to-service calls can fail due to network partitions, DNS issues, or timeouts.',
                  mitigation: 'Implement circuit breakers, retries with backoff, caching, async communication, and latency budgets.',
                },
                {
                  icon: Database,
                  title: 'Data Consistency',
                  severity: 'Medium',
                  color: 'border-yellow-500/30',
                  content:
                    'With each service owning its data, you lose ACID transactions across services. An order placement requires updating inventory, creating an order record, and processing payment — all in different databases. You must embrace eventual consistency via the Saga pattern (choreography or orchestration). Compensating transactions handle partial failures.',
                  mitigation: 'Use Saga pattern, event sourcing, CQRS, and design for eventual consistency from the start.',
                },
                {
                  icon: Bug,
                  title: 'Distributed Debugging',
                  severity: 'Medium',
                  color: 'border-purple-500/30',
                  content:
                    'A bug that spans multiple services is extremely hard to reproduce and diagnose. Logs are scattered across services. Timing-dependent issues (race conditions, eventual consistency delays) are nearly impossible to reproduce locally. You need correlation IDs propagated through all service calls, centralized log aggregation, and distributed tracing to reconstruct request flows.',
                  mitigation: 'Mandate correlation IDs, invest in distributed tracing (OpenTelemetry), and build comprehensive integration tests.',
                },
              ].map((ch, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className={`p-5 rounded-2xl bg-white/5 border ${ch.color} hover:bg-white/8 transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ch.icon className="w-5 h-5 text-red-400" />
                      <h3 className="text-slate-900 dark:text-white font-semibold">{ch.title}</h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ch.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {ch.severity} Impact
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{ch.content}</p>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-xs font-medium">
                      💡 Mitigation: <span className="text-green-300 font-normal">{ch.mitigation}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 4. DDD & BOUNDED CONTEXTS ═══════════════ */}
        <Section id="ddd-bounded-contexts" title="Domain-Driven Design & Bounded Contexts" icon={Target} color="from-violet-500 to-purple-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">Why DDD Matters for Microservices</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong className="text-violet-400">Domain-Driven Design (DDD)</strong> provides the intellectual framework for
                decomposing a system into microservices. Eric Evans' key insight: the most critical complexity in software is in the{' '}
                <em className="text-violet-300">domain model</em>, not the technology. DDD gives us tools to manage this complexity
                by establishing clear boundaries between different parts of the system.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoCard title="Bounded Context" icon={Box} delay={0}>
                <p className="mb-3">
                  A <strong className="text-slate-900 dark:text-white">Bounded Context</strong> is a boundary within which a particular domain model
                  is defined and applicable. The same real-world concept can have different meanings in different contexts:
                </p>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-white/5">
                    <span className="text-violet-400 font-medium text-xs">In Order Context:</span>
                    <span className="text-gray-400 text-xs ml-2">"Product" = SKU + quantity + price at time of purchase</span>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="text-cyan-400 font-medium text-xs">In Catalog Context:</span>
                    <span className="text-gray-400 text-xs ml-2">"Product" = full description + images + categories + reviews</span>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="text-green-400 font-medium text-xs">In Shipping Context:</span>
                    <span className="text-gray-400 text-xs ml-2">"Product" = weight + dimensions + fragility flag</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Each bounded context maintains its own model of the same real-world entity, avoiding a bloated shared model.
                </p>
              </InfoCard>

              <InfoCard title="Upstream & Downstream Teams" icon={GitBranch} delay={1}>
                <p className="mb-3">
                  Context relationships define how teams interact. The <strong className="text-slate-900 dark:text-white">upstream</strong> team
                  provides data/services that the <strong className="text-slate-900 dark:text-white">downstream</strong> team depends on.
                </p>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-white/5 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Upstream (Supplier):</strong> Defines the API/contract. Has more power in the relationship. E.g., Catalog Service defines what product data is available.</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 flex items-start gap-2">
                    <ArrowDown className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Downstream (Consumer):</strong> Must adapt to the upstream's model. E.g., Order Service consumes product data from Catalog.</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Partnership:</strong> Two teams cooperate, jointly evolving APIs. Equal power. E.g., Order and Payment teams co-develop checkout flow.</span>
                  </div>
                </div>
              </InfoCard>
            </div>

            <BoundedContextMapSVG />

            <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" />
                Key DDD Building Blocks
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { term: 'Entity', desc: 'Object with a distinct identity that persists over time (e.g., Order #12345)' },
                  { term: 'Value Object', desc: 'Immutable object defined by its attributes, no identity (e.g., Address, Money)' },
                  { term: 'Aggregate', desc: 'Cluster of entities and VOs treated as a single unit for data changes. Has an Aggregate Root.' },
                  { term: 'Domain Event', desc: 'Something significant that happened in the domain (e.g., OrderPlaced, PaymentReceived)' },
                  { term: 'Repository', desc: 'Abstraction for data access — mediates between domain and data mapping layers' },
                  { term: 'Ubiquitous Language', desc: 'Shared language between developers and domain experts, used consistently in code and conversation' },
                ].map((block, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-violet-400 font-semibold text-sm">{block.term}</span>
                    <p className="text-gray-400 text-xs mt-1">{block.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Section>

        {/* ═══════════════ 5. STRATEGIC DESIGN PATTERNS ═══════════════ */}
        <Section id="strategic-patterns" title="Strategic Design Patterns" icon={Puzzle} color="from-pink-500 to-rose-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Context mapping patterns define how bounded contexts relate and communicate. Choosing the right pattern is crucial
              for team autonomy, system stability, and development velocity.
            </p>
            <div className="space-y-4">
              {[
                {
                  pattern: 'Customer / Supplier',
                  icon: '🤝',
                  color: 'from-cyan-500/20 to-cyan-600/5',
                  border: 'border-cyan-500/20',
                  description:
                    'The upstream (supplier) team considers the downstream (customer) team\'s needs when planning. The downstream team acts as a customer with input into the upstream\'s priorities. This creates a formal relationship where the supplier commits to supporting the customer\'s needs.',
                  example:
                    'Order Service (customer) depends on Product Catalog (supplier). The catalog team prioritizes API features that the order team needs, like bulk price lookups.',
                  when: 'When the upstream team is cooperative and willing to accommodate downstream needs.',
                },
                {
                  pattern: 'Conformist',
                  icon: '📋',
                  color: 'from-yellow-500/20 to-yellow-600/5',
                  border: 'border-yellow-500/20',
                  description:
                    'The downstream team conforms to the upstream model as-is, with no negotiation. The downstream team simply uses the upstream\'s model directly without any translation. This eliminates the complexity of translation but couples the downstream to the upstream\'s model.',
                  example:
                    'Your service integrates with a third-party payment gateway (Stripe). You conform to Stripe\'s API model because you have no power to change it.',
                  when: 'When the upstream is external, unwilling to accommodate, or when the models are close enough that translation adds no value.',
                },
                {
                  pattern: 'Anti-Corruption Layer (ACL)',
                  icon: '🛡️',
                  color: 'from-purple-500/20 to-purple-600/5',
                  border: 'border-purple-500/20',
                  description:
                    'The downstream team creates a translation layer that converts the upstream\'s model into its own domain model. This isolates the downstream from changes in the upstream and prevents the upstream\'s concepts from "corrupting" the downstream\'s clean model.',
                  example:
                    'Shipping service creates an ACL to translate the legacy ERP system\'s complex product schema into its simple weight-and-dimensions model.',
                  when: 'When integrating with legacy systems, external services, or when the upstream model is complex/messy and you want to protect your clean model.',
                },
                {
                  pattern: 'Separate Ways',
                  icon: '🔀',
                  color: 'from-red-500/20 to-red-600/5',
                  border: 'border-red-500/20',
                  description:
                    'No integration at all. Two bounded contexts have no connection — they solve their problems independently, even if there is some overlap. This eliminates coupling entirely but may lead to duplicated functionality.',
                  example:
                    'The marketing analytics team builds their own user tracking independently from the main user service. Overlap is acceptable given the integration cost.',
                  when: 'When the integration cost exceeds the benefit, or when the contexts are genuinely independent.',
                },
                {
                  pattern: 'Shared Kernel',
                  icon: '🔗',
                  color: 'from-green-500/20 to-green-600/5',
                  border: 'border-green-500/20',
                  description:
                    'Two bounded contexts share a small, well-defined subset of their domain model. Both teams must agree on changes to the shared kernel. This reduces duplication but creates a tight coupling point that requires coordination.',
                  example:
                    'Order and Payment contexts share a Money value object and Currency enum. Changes require both teams\' approval via shared library versioning.',
                  when: 'When two contexts have a natural overlap and the coordination cost is low (often same team or very close teams).',
                },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  variants={slideRight}
                  custom={i}
                  className={`p-5 rounded-2xl bg-gradient-to-r ${p.color} border ${p.border}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xl">{p.icon}</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-base">{p.pattern}</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{p.description}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <span className="text-xs text-cyan-400 font-semibold">Example:</span>
                      <p className="text-gray-400 text-xs mt-1">{p.example}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <span className="text-xs text-green-400 font-semibold">When to use:</span>
                      <p className="text-gray-400 text-xs mt-1">{p.when}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 6. MICRO VS MACRO ARCHITECTURE ═══════════════ */}
        <Section id="micro-macro" title="Micro vs. Macro Architecture" icon={LayoutGrid} color="from-amber-500 to-orange-600">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              The key organizational decision in microservices: which decisions are made centrally (<strong className="text-amber-400">macro</strong>)
              vs. which each team decides independently (<strong className="text-cyan-400">micro</strong>). Getting this balance wrong
              leads to either chaos (too much micro freedom) or a "distributed monolith" (too much macro control).
            </p>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-left text-slate-900 dark:text-white font-semibold">Decision Area</th>
                    <th className="p-4 text-center text-amber-400 font-semibold">Macro (Centralized)</th>
                    <th className="p-4 text-center text-cyan-400 font-semibold">Micro (Per-Service)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { area: 'Communication Protocol', macro: 'REST vs gRPC vs messaging', micro: '—', macroCheck: true, microCheck: false },
                    { area: 'Authentication & AuthZ', macro: 'OAuth2/JWT standard', micro: '—', macroCheck: true, microCheck: false },
                    { area: 'Monitoring & Logging', macro: 'OpenTelemetry + ELK', micro: '—', macroCheck: true, microCheck: false },
                    { area: 'CI/CD Pipeline Standard', macro: 'Deployment conventions', micro: '—', macroCheck: true, microCheck: false },
                    { area: 'Service Discovery', macro: 'Consul / K8s DNS', micro: '—', macroCheck: true, microCheck: false },
                    { area: 'Programming Language', macro: '—', micro: 'Team choice', macroCheck: false, microCheck: true },
                    { area: 'Framework', macro: '—', micro: 'Spring / Express / Gin', macroCheck: false, microCheck: true },
                    { area: 'Database Technology', macro: '—', micro: 'SQL / NoSQL / Graph', macroCheck: false, microCheck: true },
                    { area: 'Internal Architecture', macro: '—', micro: 'Hexagonal, Clean, etc.', macroCheck: false, microCheck: true },
                    { area: 'Testing Strategy', macro: 'Contract testing required', micro: 'Unit/integration approach', macroCheck: true, microCheck: true },
                    { area: 'API Versioning', macro: 'Versioning scheme (v1, v2)', micro: 'Version lifecycle mgmt', macroCheck: true, microCheck: true },
                    { area: 'Data Ownership', macro: 'No shared DB rule', micro: 'Schema design', macroCheck: true, microCheck: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-slate-900 dark:text-white font-medium">{row.area}</td>
                      <td className="p-4 text-center">
                        {row.macroCheck ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {row.macro}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.microCheck ? (
                          <span className="inline-flex items-center gap-1 text-cyan-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {row.micro}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-300 text-sm">
                <strong>Rule of Thumb:</strong> Centralize decisions that affect <em>interoperability</em> between services.
                Decentralize decisions that are <em>internal</em> to a service. The goal is maximum team autonomy with minimum
                integration friction.
              </p>
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 7. ISA PRINCIPLES ═══════════════ */}
        <Section id="isa-principles" title="ISA (Independent Systems Architecture) Principles" icon={Layers} color="from-teal-500 to-cyan-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              ISA defines nine principles for building truly independent systems. These principles ensure that microservices
              remain independently deployable and don't devolve into a "distributed monolith."
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  num: 1,
                  title: 'Must Be Independent',
                  desc: 'Each system must be independently deployable. A change in one system must never require changes in another system.',
                  icon: Unlock,
                },
                {
                  num: 2,
                  title: 'Own UI, Logic & Data',
                  desc: 'Each system includes its own UI, business logic, and data storage. No shared databases or UIs across systems.',
                  icon: Layers,
                },
                {
                  num: 3,
                  title: 'Own Continuous Delivery Pipeline',
                  desc: 'Each system has its own independent CI/CD pipeline. Deploy at any time without coordinating with other teams.',
                  icon: Rocket,
                },
                {
                  num: 4,
                  title: 'Standardized Communication',
                  desc: 'Communication between systems uses standardized protocols (REST, messaging). No proprietary RPC between systems.',
                  icon: MessageSquare,
                },
                {
                  num: 5,
                  title: 'Standardized Authentication',
                  desc: 'A shared authentication/authorization mechanism (e.g., OAuth2/JWT) so users have single sign-on across systems.',
                  icon: Lock,
                },
                {
                  num: 6,
                  title: 'Resilience to Failures',
                  desc: 'Each system must handle the unavailability of other systems gracefully. Circuit breakers, fallbacks, and timeouts are mandatory.',
                  icon: Shield,
                },
                {
                  num: 7,
                  title: 'Integration at UI Level',
                  desc: 'Preferred integration is at the UI level (micro-frontends, SSI). This is the loosest coupling. Avoid backend-to-backend synchronous calls.',
                  icon: Eye,
                },
                {
                  num: 8,
                  title: 'Asynchronous Communication Preferred',
                  desc: 'Prefer asynchronous messaging (events, message queues) over synchronous REST calls between systems to reduce temporal coupling.',
                  icon: Zap,
                },
                {
                  num: 9,
                  title: 'Optional Standardized Operations',
                  desc: 'Operations standards (monitoring, logging, deployment) may be shared but are optional. Teams can choose their own operational tooling.',
                  icon: Settings,
                },
              ].map((principle, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  custom={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all group"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
                      {principle.num}
                    </span>
                    <principle.icon className="w-4 h-4 text-teal-400" />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">{principle.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{principle.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 8. MIGRATION STRATEGIES ═══════════════ */}
        <Section id="migration" title="Migration Strategies" icon={Workflow} color="from-indigo-500 to-blue-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3 flex items-center gap-2">
                🌳 The Strangler Fig Pattern
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Named after the strangler fig tree that grows around a host tree, eventually replacing it entirely. The pattern
                involves incrementally replacing parts of a monolithic application with new microservices, routing traffic to the
                new services via a facade/proxy layer. The monolith shrinks over time until it can be completely decommissioned.
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { step: '1', title: 'Identify Boundary', desc: 'Find a seam in the monolith — a bounded context that can be extracted with minimal dependencies.' },
                  { step: '2', title: 'Build New Service', desc: 'Implement the functionality as a new microservice with its own database, API, and deployment pipeline.' },
                  { step: '3', title: 'Route via Facade', desc: 'Place an API gateway/facade that routes requests to the new service while the monolith still handles other features.' },
                  { step: '4', title: 'Remove from Monolith', desc: 'Once the new service is stable, remove the old code from the monolith. Repeat for the next boundary.' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
                      {s.step}
                    </span>
                    <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">{s.title}</h4>
                    <p className="text-gray-400 text-xs">{s.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <MigrationTimelineSVG />

            <div className="grid md:grid-cols-2 gap-4">
              <InfoCard title="Incremental Extraction" icon={GitBranch} delay={0}>
                <p className="mb-3">Strategies for choosing what to extract first:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold text-xs mt-0.5">1.</span>
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Low-hanging fruit first:</strong> Extract simple, well-bounded features (e.g., email notifications) to build team confidence and infrastructure.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold text-xs mt-0.5">2.</span>
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">High-value extraction:</strong> Extract features that would benefit most from independent scaling or faster deployment cycles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold text-xs mt-0.5">3.</span>
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Extract by change frequency:</strong> Features that change often benefit most from independent deployment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold text-xs mt-0.5">4.</span>
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Data separation first:</strong> Often the hardest part. Start by giving the module its own database schema, then extract the service.</span>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard title="Async Communication with Legacy" icon={MessageSquare} delay={1}>
                <p className="mb-3">Integrate new microservices with the legacy monolith using asynchronous patterns:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Change Data Capture (CDC):</strong> Use Debezium to stream database changes from the monolith's DB to Kafka. New services consume events without modifying the monolith code.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Event Publishing:</strong> Add a minimal event publisher to the monolith that publishes domain events to a message broker (RabbitMQ/Kafka).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">API Gateway Routing:</strong> Use an API gateway (Kong, NGINX) to gradually route endpoints from monolith to new services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-xs"><strong className="text-slate-900 dark:text-white">Feature Flags:</strong> Use feature flags to toggle between monolith and microservice implementations, enabling safe rollback.</span>
                  </li>
                </ul>
              </InfoCard>
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 9. DOCKER & CONTAINERS ═══════════════ */}
        <Section id="docker-containers" title="Docker & Containers" icon={Package} color="from-blue-500 to-sky-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-4">
              <InfoCard title="Shared Kernel" icon={Cpu} delay={0}>
                <p>
                  Unlike VMs, containers share the host OS kernel. This makes them extremely lightweight — a container can
                  start in <strong className="text-slate-900 dark:text-white">milliseconds</strong> vs. minutes for a VM. The kernel provides process
                  isolation via <strong className="text-cyan-400">namespaces</strong> (PID, network, mount, user) and resource
                  limits via <strong className="text-cyan-400">cgroups</strong> (CPU, memory, I/O).
                </p>
              </InfoCard>
              <InfoCard title="Isolated Networking" icon={Network} delay={1}>
                <p>
                  Each container gets its own network namespace with a virtual ethernet interface. Containers communicate via{' '}
                  <strong className="text-slate-900 dark:text-white">Docker bridge networks</strong> (default), overlay networks (Swarm/K8s), or
                  host networking. Port mapping (<code className="text-cyan-400 text-xs">-p 8080:80</code>) exposes container
                  ports to the host. Docker Compose creates a shared network for multi-container apps.
                </p>
              </InfoCard>
              <InfoCard title="Layered Filesystem" icon={Layers} delay={2}>
                <p>
                  Docker uses a <strong className="text-slate-900 dark:text-white">Union Filesystem</strong> (OverlayFS) where each Dockerfile
                  instruction creates a new layer. Layers are cached and shared between images — if 10 services use{' '}
                  <code className="text-cyan-400 text-xs">FROM node:18-alpine</code>, that base image is stored only once.
                  The top layer is read-write; all lower layers are read-only.
                </p>
              </InfoCard>
            </motion.div>

            <DockerLayersSVG />

            <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-900 dark:text-white font-semibold text-sm">Dockerfile — Production Node.js</span>
                </div>
                <pre className="p-4 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                  <code>{`# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -S appgroup && \\
    adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
USER appuser
CMD ["node", "dist/server.js"]`}</code>
                </pre>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-green-400" />
                  <span className="text-slate-900 dark:text-white font-semibold text-sm">docker-compose.yml — Microservices Stack</span>
                </div>
                <pre className="p-4 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                  <code>{`version: '3.8'
services:
  api-gateway:
    build: ./gateway
    ports: ["8080:8080"]
    depends_on: [user-svc, order-svc]
    networks: [backend]
    environment:
      - JWT_SECRET=\${JWT_SECRET}

  user-svc:
    build: ./services/user
    networks: [backend]
    depends_on: [user-db, redis]
    environment:
      - DB_URL=postgres://user-db:5432/users

  order-svc:
    build: ./services/order
    networks: [backend]
    depends_on: [order-db, kafka]

  user-db:
    image: postgres:15-alpine
    volumes: [user-data:/var/lib/postgresql/data]
    networks: [backend]

  order-db:
    image: mongo:7
    volumes: [order-data:/data/db]
    networks: [backend]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    networks: [backend]

  redis:
    image: redis:7-alpine
    networks: [backend]

volumes:
  user-data:
  order-data:

networks:
  backend:
    driver: bridge`}</code>
                </pre>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                Essential Docker Commands
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  { cmd: 'docker build -t myapp:1.0 .', desc: 'Build image from Dockerfile' },
                  { cmd: 'docker run -d -p 8080:3000 myapp', desc: 'Run container in detached mode' },
                  { cmd: 'docker compose up -d', desc: 'Start all services in background' },
                  { cmd: 'docker compose down -v', desc: 'Stop and remove containers + volumes' },
                  { cmd: 'docker exec -it <id> sh', desc: 'Shell into running container' },
                  { cmd: 'docker logs -f <container>', desc: 'Stream container logs' },
                  { cmd: 'docker network ls', desc: 'List Docker networks' },
                  { cmd: 'docker system prune -a', desc: 'Remove all unused data' },
                ].map((c, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/5 flex items-start gap-3">
                    <code className="text-cyan-400 text-xs font-mono shrink-0">{c.cmd}</code>
                    <span className="text-gray-500 text-xs">— {c.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Section>

        {/* ═══════════════ 10. TECHNOLOGY CHOICES ═══════════════ */}
        <Section id="tech-choices" title="Technology Choices" icon={Code2} color="from-emerald-500 to-green-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            {/* Reactive Manifesto */}
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                The Reactive Manifesto
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Modern microservices should be <strong className="text-slate-900 dark:text-white">reactive systems</strong> — responsive, resilient,
                elastic, and message-driven. The Reactive Manifesto defines four traits:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    trait: 'Responsive',
                    color: 'text-green-400',
                    desc: 'The system responds in a timely manner. Responsiveness is the cornerstone of usability. Consistent response times establish reliable upper bounds, simplifying error handling and building user confidence.',
                  },
                  {
                    trait: 'Resilient',
                    color: 'text-blue-400',
                    desc: 'The system stays responsive in the face of failure. Achieved through replication, containment, isolation, and delegation. Failures are contained within each component, isolating components from each other.',
                  },
                  {
                    trait: 'Elastic',
                    color: 'text-purple-400',
                    desc: 'The system stays responsive under varying workload. It reacts to changes in input rate by scaling resources up or down. No central bottlenecks or contention points.',
                  },
                  {
                    trait: 'Message-Driven',
                    color: 'text-yellow-400',
                    desc: 'Relies on asynchronous message-passing to establish boundaries between components. Non-blocking communication enables efficient resource use, back-pressure, and location transparency.',
                  },
                ].map((t, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className={`font-bold text-sm mb-1 ${t.color}`}>{t.trait}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Spring Boot */}
              <motion.div variants={fadeUp} custom={0} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <span className="text-xl">🍃</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold">Spring Boot</h3>
                    <span className="text-gray-500 text-xs">Java / Kotlin — Enterprise Standard</span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-gray-400 text-xs">
                  <li>• <strong className="text-slate-900 dark:text-white">Spring Cloud:</strong> Service discovery (Eureka), config server, circuit breaker (Resilience4j), API gateway (Spring Cloud Gateway)</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Spring Boot Actuator:</strong> Production-ready features — health checks, metrics, monitoring endpoints</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Spring Data:</strong> Unified data access for JPA, MongoDB, Redis, Elasticsearch</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Spring Security:</strong> OAuth2 resource server, JWT validation, method-level security</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Spring Kafka/AMQP:</strong> First-class event-driven support with Kafka Streams and RabbitMQ</li>
                  <li>• <strong className="text-slate-900 dark:text-white">GraalVM Native:</strong> Compile to native binary for instant startup (ideal for serverless)</li>
                  <li className="text-green-400 font-medium mt-2">Best for: Enterprise systems, complex business logic, strong typing</li>
                </ul>
              </motion.div>

              {/* Go */}
              <motion.div variants={fadeUp} custom={1} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-xl">🐹</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold">Go (Golang)</h3>
                    <span className="text-gray-500 text-xs">Google's Systems Language</span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-gray-400 text-xs">
                  <li>• <strong className="text-slate-900 dark:text-white">Goroutines:</strong> Lightweight concurrency — millions of goroutines on a single machine. Perfect for high-throughput services</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Static Binary:</strong> Compiles to a single static binary with no dependencies. Docker images as small as 5MB (FROM scratch)</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Fast Startup:</strong> ~10ms startup time. Ideal for Kubernetes where pods scale up/down frequently</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Standard Library:</strong> Excellent HTTP server, JSON handling, crypto — minimal external dependencies</li>
                  <li>• <strong className="text-slate-900 dark:text-white">gRPC Native:</strong> Protocol Buffers and gRPC are first-class citizens in the Go ecosystem</li>
                  <li>• <strong className="text-slate-900 dark:text-white">Low Memory:</strong> Typical Go microservice uses 10-50MB RAM vs. 200-500MB for Java</li>
                  <li className="text-cyan-400 font-medium mt-2">Best for: API gateways, proxies, high-throughput data pipelines, infrastructure services</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* ═══════════════ 11. ORGANIZATIONAL ASPECTS ═══════════════ */}
        <Section id="organizational" title="Organizational Aspects" icon={Building2} color="from-rose-500 to-pink-600">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            {/* Conway's Law */}
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                Conway's Law
              </h3>
              <blockquote className="border-l-4 border-rose-500 pl-4 my-4 text-gray-300 italic text-sm">
                "Organizations which design systems are constrained to produce designs which are copies of the communication
                structures of these organizations." — Melvin Conway, 1968
              </blockquote>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Conway's Law is not just an observation — it's a force of nature in software engineering. If you have four teams,
                you will inevitably get a four-component architecture. The <strong className="text-slate-900 dark:text-white">Inverse Conway Maneuver</strong>{' '}
                uses this insight strategically: organize your teams to match the architecture you want.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-red-500/20">
                  <h4 className="text-red-400 font-semibold text-sm mb-2">❌ Anti-Pattern: Layer Teams</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>• Frontend Team → builds all UIs</p>
                    <p>• Backend Team → builds all APIs</p>
                    <p>• Database Team → manages all schemas</p>
                    <p className="text-red-400 mt-2 font-medium">Result: Every feature requires 3 teams to coordinate. Slow delivery, high coupling.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-green-500/20">
                  <h4 className="text-green-400 font-semibold text-sm mb-2">✅ Pattern: Feature Teams</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>• Order Team → owns order UI + API + DB</p>
                    <p>• Payment Team → owns payment UI + API + DB</p>
                    <p>• Catalog Team → owns catalog UI + API + DB</p>
                    <p className="text-green-400 mt-2 font-medium">Result: Each team independently delivers end-to-end features. Fast delivery.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* DevOps */}
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-pink-400" />
                DevOps Culture & Practices
              </h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Microservices <strong className="text-slate-900 dark:text-white">require</strong> DevOps. "You build it, you run it" (Werner Vogels, Amazon CTO).
                Teams own their services in production — from development through deployment to monitoring and on-call support.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  {
                    title: 'CI/CD Pipeline',
                    icon: Rocket,
                    items: [
                      'Automated testing on every commit',
                      'Container image builds & scanning',
                      'Canary/blue-green deployments',
                      'Automated rollback on failure',
                      'Infrastructure as Code (Terraform/Pulumi)',
                    ],
                  },
                  {
                    title: 'Observability',
                    icon: Eye,
                    items: [
                      'Distributed tracing (Jaeger/Zipkin)',
                      'Centralized logging (ELK/Grafana Loki)',
                      'Metrics & dashboards (Prometheus/Grafana)',
                      'Alerting & on-call (PagerDuty/OpsGenie)',
                      'SLOs, SLIs, and error budgets',
                    ],
                  },
                  {
                    title: 'Platform Engineering',
                    icon: Settings,
                    items: [
                      'Internal Developer Platform (IDP)',
                      'Self-service infrastructure provisioning',
                      'Golden path templates for new services',
                      'Service catalog & API documentation',
                      'Shared libraries for cross-cutting concerns',
                    ],
                  },
                ].map((pillar, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <pillar.icon className="w-4 h-4 text-pink-400" />
                      <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{pillar.title}</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {pillar.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                          <CircleDot className="w-3 h-3 text-pink-400/60 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <h4 className="text-pink-400 font-semibold text-sm mb-2">The Three Ways of DevOps</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="text-xs text-gray-400">
                    <span className="text-slate-900 dark:text-white font-medium">1. Flow:</span> Optimize the flow of work from left (dev) to right (ops).
                    Reduce batch sizes, limit WIP, eliminate waste.
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="text-slate-900 dark:text-white font-medium">2. Feedback:</span> Create fast feedback loops from right to left.
                    Monitoring, alerting, automated testing, post-mortems.
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="text-slate-900 dark:text-white font-medium">3. Continual Learning:</span> Foster a culture of experimentation and
                    learning from failures. Blameless post-mortems, chaos engineering.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-10 pb-8 border-t border-white/5"
        >
          <p className="text-gray-500 text-sm">
            Module 2 — Microservice Principles & Concepts
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Part of the System Design Learning Path
          </p>
        </motion.div>
      </div>
    

      {/* Module Quiz */}
      <Quiz title="Microservices & DDD" questions={moduleQuestions} />
    </div>
  );
}
