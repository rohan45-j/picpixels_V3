'use client';

import { useEffect } from 'react';

interface CustomHeadInjectorProps {
  scripts?: string;
}

export function CustomHeadInjector({ scripts }: CustomHeadInjectorProps) {
  useEffect(() => {
    if (!scripts || !scripts.trim()) return;

    // Parse HTML string into DOM nodes and inject into document.head
    const temp = document.createElement('div');
    temp.innerHTML = scripts;

    const injectedElements: HTMLElement[] = [];

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName.toLowerCase() === 'script') {
          const script = document.createElement('script');
          Array.from(el.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.text = el.innerHTML;
          document.head.appendChild(script);
          injectedElements.push(script);
        } else {
          const clone = el.cloneNode(true) as HTMLElement;
          document.head.appendChild(clone);
          injectedElements.push(clone);
        }
      }
    });

    return () => {
      injectedElements.forEach((el) => {
        try {
          if (el.parentNode && el.parentNode.contains(el)) {
            el.parentNode.removeChild(el);
          } else if (typeof el.remove === 'function') {
            el.remove();
          }
        } catch {
          // Ignore if node is already detached
        }
      });
    };
  }, [scripts]);

  return null;
}
