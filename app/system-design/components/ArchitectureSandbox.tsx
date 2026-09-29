'use client';

import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Server, Database, Globe, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ArchitectureSandbox() {
  const [placed, setPlaced] = useState<Record<string, boolean>>({
    'lb': false,
    'web': false,
    'db': false
  });
  
  const constraintsRef = useRef(null);
  
  const checkWin = () => placed['lb'] && placed['web'] && placed['db'];
  
  const handleDragEnd = (id: string, info: any) => {
    // Rough hit detection for drop zones
    const x = info.point.x;
    const y = info.point.y;
    
    // This is super simplistic hit detection based on approximate viewport coordinates
    // In a real app we'd use getBoundingClientRect on the dropzones
    // Let's just mark it placed if they drag it generally into the upper "canvas" area
    if (y < window.innerHeight * 0.7) { // If dropped above the bottom dock
      setPlaced(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="my-12 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative" ref={constraintsRef}>
      
      <div className="absolute top-4 left-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="text-blue-500" />
          Interactive Architecture Sandbox
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Drag the components from the dock to build a scalable web architecture.
        </p>
      </div>
      
      {checkWin() && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-6 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Architecture Scaled Successfully!
        </motion.div>
      )}

      {/* The Canvas */}
      <div className="mt-20 h-auto sm:h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl relative flex flex-col sm:flex-row items-center justify-around p-4 sm:p-4 gap-4 sm:gap-0">
        
        {/* Drop zones / Slots */}
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${placed['lb'] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 border-dashed'}`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tier 1</span>
          {placed['lb'] && <Server className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mb-1" />}
          {placed['lb'] && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Load Balancer</span>}
        </div>
        
        {placed['lb'] && placed['web'] && <ArrowRight className="text-slate-400 animate-pulse rotate-90 sm:rotate-0" />}
        
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${placed['web'] ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-800 border-dashed'}`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tier 2</span>
          {placed['web'] && <Server className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 mb-1" />}
          {placed['web'] && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Web Servers</span>}
        </div>

        {placed['web'] && placed['db'] && <ArrowRight className="text-slate-400 animate-pulse rotate-90 sm:rotate-0" />}

        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${placed['db'] ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 border-dashed'}`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tier 3</span>
          {placed['db'] && <Database className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 mb-1" />}
          {placed['db'] && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Database</span>}
        </div>

      </div>

      {/* The Dock */}
      <div className="mt-8 bg-slate-200 dark:bg-slate-800 p-4 rounded-2xl flex flex-wrap justify-center gap-4 sm:gap-6">
        
        {!placed['lb'] && (
          <motion.div 
            drag
            dragConstraints={constraintsRef}
            onDragEnd={(e, info) => handleDragEnd('lb', info)}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-50 hover:scale-105 transition-transform"
          >
            <Server className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mb-2 pointer-events-none" />
            <span className="text-xs sm:text-base font-bold text-slate-700 dark:text-slate-200 pointer-events-none text-center">Load Balancer</span>
          </motion.div>
        )}

        {!placed['web'] && (
          <motion.div 
            drag
            dragConstraints={constraintsRef}
            onDragEnd={(e, info) => handleDragEnd('web', info)}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-50 hover:scale-105 transition-transform"
          >
            <Server className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 mb-2 pointer-events-none" />
            <span className="text-xs sm:text-base font-bold text-slate-700 dark:text-slate-200 pointer-events-none text-center">Web Server</span>
          </motion.div>
        )}

        {!placed['db'] && (
          <motion.div 
            drag
            dragConstraints={constraintsRef}
            onDragEnd={(e, info) => handleDragEnd('db', info)}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-50 hover:scale-105 transition-transform"
          >
            <Database className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 mb-2 pointer-events-none" />
            <span className="text-xs sm:text-base font-bold text-slate-700 dark:text-slate-200 pointer-events-none text-center">Database</span>
          </motion.div>
        )}

        {checkWin() && (
          <div className="w-full text-center py-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            All components deployed to production. Traffic is flowing smoothly!
          </div>
        )}
      </div>

    </div>
  );
}
