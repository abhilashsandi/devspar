'use client';

import React, { useEffect, useState } from 'react';

export default function TableOfContents({ moduleIdx }: { moduleIdx: number }) {
  const [headings, setHeadings] = useState<{ id: string; title: string; top: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // A bit hacky: wait for render, then find all h2s and h3s in the main content container
    const scanHeadings = () => {
      const elements = Array.from(document.querySelectorAll('h2, h3')).filter(
        el => el.textContent && el.textContent.length > 3
      );
      
      const newHeadings = elements.map((el, index) => {
        if (!el.id) {
          el.id = `heading-${moduleIdx}-${index}`;
        }
        return {
          id: el.id,
          title: el.textContent || '',
          top: (el as HTMLElement).offsetTop
        };
      }).filter(h => !h.title.includes('Module ')); // Filter out the main big header

      setHeadings(newHeadings);
    };

    // Timeout to allow content to render fully, especially after tab switch
    const t = setTimeout(scanHeadings, 500);
    return () => clearTimeout(t);
  }, [moduleIdx]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 150; // offset
      
      let current = '';
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          if (el.offsetTop <= scrollY) {
            current = heading.id;
          } else {
            break;
          }
        }
      }
      
      if (current !== activeId) {
        setActiveId(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, activeId]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-8 relative">
      <div className="sticky top-24 max-h-[80vh] overflow-y-auto slick-scrollbar pr-2">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">On this page</h4>
        <ul className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800">
          {headings.map(heading => (
            <li key={heading.id}>
              <button
                onClick={() => {
                  const el = document.getElementById(heading.id);
                  if (el) {
                    window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                  }
                }}
                className={`text-left text-sm py-1 pl-4 block w-full transition-colors ${
                  activeId === heading.id
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-l-2 -ml-[2px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {heading.title.length > 35 ? heading.title.substring(0, 32) + '...' : heading.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
