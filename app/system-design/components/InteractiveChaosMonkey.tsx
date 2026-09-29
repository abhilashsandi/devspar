'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function InteractiveChaosMonkey() {
  const [nodes, setNodes] = useState([
    { id: 1, healthy: true, load: 33 },
    { id: 2, healthy: true, load: 33 },
    { id: 3, healthy: true, load: 34 }
  ]);
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(r => r + 10);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const killNode = (id: number) => {
    setNodes(prev => {
      const newNodes = prev.map(n => n.id === id ? { ...n, healthy: false, load: 0 } : n);
      const healthyCount = newNodes.filter(n => n.healthy).length;
      if (healthyCount > 0) {
        const loadPerNode = 100 / healthyCount;
        return newNodes.map(n => n.healthy ? { ...n, load: Math.round(loadPerNode) } : n);
      }
      return newNodes;
    });
  };

  const recoverNode = (id: number) => {
    setNodes(prev => {
      const newNodes = prev.map(n => n.id === id ? { ...n, healthy: true } : n);
      const healthyCount = newNodes.filter(n => n.healthy).length;
      const loadPerNode = 100 / healthyCount;
      return newNodes.map(n => n.healthy ? { ...n, load: Math.round(loadPerNode) } : n);
    });
  };

  const healthyCount = nodes.filter(n => n.healthy).length;

  return (
    <div className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-8 overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Interactive Chaos Monkey
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">Click a server to terminate it and watch the load balancer reroute traffic.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-emerald-400">{requests}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Requests</div>
        </div>
      </div>

      {healthyCount === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">SYSTEM OUTAGE</h2>
          <p className="text-red-300 mb-6">All backend nodes are down.</p>
          <button onClick={() => setNodes(nodes.map(n => ({ ...n, healthy: true, load: 33 })))} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white rounded-lg font-bold transition-colors">
            Restart Cluster
          </button>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 md:gap-8">
        {nodes.map(node => (
          <div key={node.id} className="relative">
            {/* Traffic stream simulation */}
            {node.healthy && (
              <motion.div
                className="absolute -top-12 left-1/2 w-1 bg-emerald-500/50"
                style={{ height: '40px', transform: 'translateX(-50%)' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
            
            <motion.button
              onClick={() => node.healthy ? killNode(node.id) : recoverNode(node.id)}
              className={`w-24 h-32 md:w-32 md:h-40 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                node.healthy 
                  ? 'bg-white dark:bg-slate-800 border-emerald-500/50 hover:border-red-500 hover:bg-red-900/20' 
                  : 'bg-slate-50 dark:bg-slate-900 border-red-500/50 opacity-50 hover:opacity-100 hover:border-emerald-500 hover:bg-emerald-900/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Server className={`w-10 h-10 ${node.healthy ? 'text-emerald-400' : 'text-red-500'}`} />
              
              <div className="text-center">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Node {node.id}</div>
                <div className={`text-lg font-mono font-bold ${
                  node.load > 60 ? 'text-orange-400' : node.healthy ? 'text-emerald-400' : 'text-red-500'
                }`}>
                  {node.load}%
                </div>
              </div>

              {node.healthy && node.load > 60 && (
                <AlertTriangle className="absolute -top-2 -right-2 w-5 h-5 text-orange-500 animate-bounce" />
              )}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}
