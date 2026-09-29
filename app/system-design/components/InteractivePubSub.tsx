'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Database, MessageSquare } from 'lucide-react';

export default function InteractivePubSub() {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [msgCount, setMsgCount] = useState(0);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMsg = { id: msgCount, text: input };
    setMsgCount(c => c + 1);
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== newMsg.id));
    }, 4000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-6 my-8 overflow-hidden">
      <div className="mb-6">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Interactive Pub/Sub (Kafka/RabbitMQ style)
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">Publish a message and watch it fan out to multiple independent consumer groups.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
        {/* Publisher */}
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-600 z-10">
          <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">Publisher Service</h5>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Event payload..." 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg text-slate-900 dark:text-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Message Broker / Topic */}
        <div className="relative flex-1 min-w-[200px] h-32 flex items-center justify-center border-y-2 border-dashed border-purple-500/30">
          <span className="text-purple-400 font-bold uppercase tracking-widest text-xs absolute top-2">Events Topic</span>
          
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute bg-purple-500 text-slate-900 dark:text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg shadow-purple-500/20"
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Consumers */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 z-10">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-600 relative overflow-hidden">
            <h5 className="font-bold text-emerald-400 mb-1 text-sm">Email Consumer</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Listens for events to send emails</p>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={`c1-${msg.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-xs text-emerald-300 bg-emerald-900/30 p-2 rounded mb-1 border border-emerald-500/30"
                >
                  📨 Email sent: {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-600 relative overflow-hidden">
            <h5 className="font-bold text-blue-400 mb-1 text-sm">Analytics Consumer</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Updates dashboards based on events</p>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={`c2-${msg.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-xs text-blue-300 bg-blue-900/30 p-2 rounded mb-1 border border-blue-500/30"
                >
                  📊 Data logged: {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
