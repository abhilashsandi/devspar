"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Server, Layers, Cloud, ShieldAlert, Network, BookOpen, Sun, Moon, Globe, CheckCircle2
} from 'lucide-react';

import Module1 from '../components/Module1';
import Module2 from '../components/Module2';
import Module3 from '../components/Module3';
import Module4 from '../components/Module4';
import Module5 from '../components/Module5';
import SearchCommandPalette from '../components/SearchCommandPalette';
import TableOfContents from '../components/TableOfContents';
import { useProgress } from '../components/useProgress';
import ArchitectureSandbox from '../components/ArchitectureSandbox';

const modules = [
  {
    id: "module-1",
    title: "Software Architecture & Scalability",
    description: "The foundational blueprints of system design. Understand the difference between designing a feature and architecting a system.",
    icon: <Layers className="w-6 h-6 text-blue-400" />,
    gradient: "from-blue-100 dark:from-blue-900/40 to-cyan-100 dark:to-cyan-900/20",
    border: "border-blue-200 dark:border-blue-500/30",
    Component: Module1
  },
  {
    id: "module-2",
    title: "Microservice Principles",
    description: "Breaking down the Monolith. Why the tech industry shifted to distributed micro-architectures and the trade-offs involved.",
    icon: <Server className="w-6 h-6 text-purple-400" />,
    gradient: "from-purple-100 dark:from-purple-900/40 to-pink-100 dark:to-pink-900/20",
    border: "border-purple-200 dark:border-purple-500/30",
    Component: Module2
  },
  {
    id: "module-3",
    title: "Practical Implementation",
    description: "Taking microservices to production. The critical infrastructure components required to make distributed systems work.",
    icon: <Network className="w-6 h-6 text-emerald-400" />,
    gradient: "from-emerald-100 dark:from-emerald-900/40 to-teal-100 dark:to-teal-900/20",
    border: "border-emerald-200 dark:border-emerald-500/30",
    Component: Module3
  },
  {
    id: "module-4",
    title: "Real-World Cases & Outages",
    description: "Deep dive into complex system designs and autopsy reports of catastrophic global outages.",
    icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
    gradient: "from-orange-100 dark:from-orange-900/40 to-amber-100 dark:to-amber-900/20",
    border: "border-orange-200 dark:border-orange-500/30",
    Component: Module4
  },
  {
    id: "module-5",
    title: "The Good Parts of AWS",
    description: "Cutting through the 200+ AWS services. The foundational primitives you actually need to build scalable infrastructure.",
    icon: <Cloud className="w-6 h-6 text-amber-500" />,
    gradient: "from-amber-100 dark:from-amber-900/40 to-yellow-100 dark:to-yellow-900/20",
    border: "border-amber-200 dark:border-amber-500/30",
    Component: Module5
  },
  {
    id: "module-6",
    title: "Interactive Sandbox",
    description: "Put your knowledge to the test. Build and scale an architecture to survive massive traffic spikes.",
    icon: <Globe className="w-6 h-6 text-indigo-400" />,
    gradient: "from-indigo-100 dark:from-indigo-900/40 to-blue-100 dark:to-blue-900/20",
    border: "border-indigo-200 dark:border-indigo-500/30",
    Component: ArchitectureSandbox
  }
];

export default function SystemDesignMasterclass() {
  const [activeModule, setActiveModule] = useState(0);
  const { progress } = useProgress();
  // This page used to manage its own `dark` class on <html>, independently of the site's theme
  // toggle (next-themes, in the root layout). Since next-themes also controls that same class,
  // the two fought for control — next-themes always won after mount, so this page's own toggle
  // button looked like it worked (the icon flipped) but had no lasting effect on what actually
  // rendered. Using next-themes here too makes this page's theme the same single source of truth
  // as the rest of the site.
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== 'light'; // matches the previous default (dark) before the theme is known

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-500/30 pb-20 transition-colors duration-300">
      
      {/* Global Progress Bar */}
      <div className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(progress.completedModules.length / modules.length) * 100}%` }} />

      <SearchCommandPalette onSelect={setActiveModule} />
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 rounded-full scale-90 sm:scale-100 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xl hover:scale-110 transition-transform"
        title="Toggle Light/Dark Mode"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Header */}
      <header className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <BookOpen className="w-4 h-4" />
            Complete Study Guide
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            System Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Masterclass</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Everything you need to architect scalable, resilient backend systems. No fluff, just the core engineering principles, real-world autopsies, and cloud fundamentals.
          </p>
        </motion.div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-[90rem] mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Sticky Navigation) */}
          <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-2 z-40 bg-slate-50/95 dark:bg-[#0a0f1c]/95 backdrop-blur-xl pb-4 lg:bg-transparent lg:dark:bg-transparent lg:pb-0 pt-2 lg:pt-8 -mx-4 px-4 lg:mx-0 lg:px-0 rounded-b-xl lg:rounded-none shadow-sm lg:shadow-none">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 lg:mb-6 ml-2 hidden lg:block">Modules</h3>
              <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible snap-x pb-2 slick-scrollbar">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 ml-2 lg:hidden">Modules</h3>
              {modules.map((mod, idx) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(idx)}
                  className={`min-w-[260px] lg:min-w-0 w-full text-left p-3 lg:p-4 rounded-2xl transition-all flex items-center gap-3 lg:gap-4 group snap-center ${
                    activeModule === idx 
                      ? `bg-gradient-to-r ${mod.gradient} border ${mod.border} shadow-lg shadow-black/20 transform scale-[1.02]` 
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${
                    activeModule === idx ? 'bg-black/20' : 'bg-slate-100 dark:bg-slate-900 group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
                  }`}>
                    {mod.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 tracking-wider uppercase">Module {idx + 1}</div>
                    <div className={`font-semibold text-sm md:text-base ${activeModule === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>
                      {mod.title}
                    </div>
                  </div>
                {progress.completedModules.includes(mod.id) && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl"
              >
                {/* Content Header */}
                <div className={`px-4 sm:px-8 md:px-12 py-6 sm:py-12 bg-gradient-to-br ${modules[activeModule].gradient} border-b ${modules[activeModule].border}`}>
                  <span className="text-slate-600 dark:text-white/70 font-medium tracking-wider uppercase text-sm mb-4 block">
                    Module {activeModule + 1}
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                    {modules[activeModule].title}
                  </h2>
                  <p className="text-xl text-slate-700 dark:text-white/80 max-w-3xl leading-relaxed">
                    {modules[activeModule].description}
                  </p>
                </div>
                
                {/* Scrollable Content Body - Now rendering the massive separate components */}
                <div className="p-2 sm:p-6 md:p-12">
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      {React.createElement(modules[activeModule].Component)}
                    </div>
                    {/* Only show TOC for actual modules, not sandbox */}
                    {activeModule < 5 && <TableOfContents moduleIdx={activeModule} />}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </main>

    </div>
  );
}
