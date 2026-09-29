'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ArrowDown, Activity } from 'lucide-react';

export default function InteractiveLoadBalancer() {
  const [requests, setRequests] = useState<{ id: number; node: number }[]>([]);
  const [requestCount, setRequestCount] = useState(0);

  const sendRequests = () => {
    const newRequests = Array.from({ length: 12 }).map((_, i) => ({
      id: requestCount + i,
      node: i % 3 // Round robin load balancing
    }));
    setRequestCount(c => c + 12);
    setRequests(prev => [...prev, ...newRequests]);
    
    // Auto clear after animation
    setTimeout(() => {
      setRequests(prev => prev.filter(r => !newRequests.find(nr => nr.id === r.id)));
    }, 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Load Balancer Simulation (Round Robin)
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">Click to send a burst of traffic and watch it distribute evenly.</p>
        </div>
        <button 
          onClick={sendRequests}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          Send Traffic Burst
        </button>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Load Balancer Node */}
        <div className="w-32 h-12 bg-blue-900/50 border-2 border-blue-500 rounded-lg flex items-center justify-center font-bold text-blue-100 z-10 mb-12 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          Load Balancer
        </div>

        {/* Requests animating down */}
        <div className="absolute top-12 left-0 right-0 h-12">
          <AnimatePresence>
            {requests.map(req => {
              // Calculate destination X offset based on node index
              const targetX = req.node === 0 ? -120 : req.node === 1 ? 0 : 120;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], y: 60, x: targetX }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut", delay: (req.id % 12) * 0.1 }}
                  className="absolute left-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                  style={{ marginLeft: '-6px' }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Backend Servers */}
        <div className="flex gap-8 md:gap-16">
          {[0, 1, 2].map(nodeId => (
            <div key={nodeId} className="flex flex-col items-center">
              <ArrowDown className="w-6 h-6 text-slate-600 mb-2" />
              <div className="w-20 h-24 bg-white dark:bg-slate-800 border border-slate-600 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <Server className="w-8 h-8 text-slate-600 dark:text-slate-400 mb-2" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Node {nodeId + 1}</span>
                
                {/* Node flash on receive */}
                <AnimatePresence>
                  {requests.filter(r => r.node === nodeId).map(r => (
                    <motion.div
                      key={`flash-${r.id}`}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 1 + (r.id % 12) * 0.1 }}
                      className="absolute inset-0 bg-blue-500/30 mix-blend-screen"
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
