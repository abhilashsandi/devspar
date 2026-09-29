'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Book } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  moduleIdx: number;
  type: 'module' | 'concept' | 'interactive';
}

const searchData: SearchItem[] = [
  { id: 'm1', title: 'Software Architecture & Scalability', moduleIdx: 0, type: 'module' },
  { id: 'c1-1', title: 'Software Design vs Architecture', moduleIdx: 0, type: 'concept' },
  { id: 'c1-2', title: 'Load Balancers', moduleIdx: 0, type: 'interactive' },
  { id: 'm2', title: 'Microservice Principles', moduleIdx: 1, type: 'module' },
  { id: 'c2-1', title: 'Monolith vs Microservices', moduleIdx: 1, type: 'concept' },
  { id: 'm3', title: 'Practical Implementation', moduleIdx: 2, type: 'module' },
  { id: 'c3-1', title: 'Pub/Sub Patterns (Kafka/RabbitMQ)', moduleIdx: 2, type: 'interactive' },
  { id: 'm4', title: 'Real-World Cases & Outages', moduleIdx: 3, type: 'module' },
  { id: 'c4-1', title: 'Chaos Monkey', moduleIdx: 3, type: 'interactive' },
  { id: 'm5', title: 'The Good Parts of AWS', moduleIdx: 4, type: 'module' },
  { id: 'c5-1', title: 'AWS Primitives (S3, EC2, DynamoDB)', moduleIdx: 4, type: 'concept' },
];

export default function SearchCommandPalette({ onSelect }: { onSelect: (moduleIdx: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = searchData.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {/* Search trigger button (for mobile or clickers) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-3 right-14 sm:top-6 sm:right-20 z-50 p-2 sm:p-3 rounded-full scale-90 sm:scale-100 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xl hover:scale-110 transition-transform flex items-center gap-2"
      >
        <Search className="w-5 h-5" />
        <span className="hidden md:inline text-xs font-semibold px-2 py-1 bg-slate-300 dark:bg-slate-700 rounded-md">Cmd K</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for concepts, architectures, components..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No results found for "{query}"
                  </div>
                ) : (
                  filtered.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelect(item.moduleIdx);
                        setIsOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl group transition-colors"
                    >
                      <Book className="w-4 h-4 text-slate-400 mr-3 group-hover:text-blue-500" />
                      <div className="flex-1">
                        <div className="text-slate-900 dark:text-slate-200 font-medium">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Module {item.moduleIdx + 1} • {item.type}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
