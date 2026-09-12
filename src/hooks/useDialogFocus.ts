import { useEffect, useRef } from 'react';

export function useDialogFocus(open: boolean, onClose: () => void) {
 const ref = useRef<HTMLDivElement>(null);
 useEffect(() => {
  if (!open) return;
  const previous = document.activeElement as HTMLElement | null;
  const panel = ref.current;
  const controls = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]') || []);
  controls()[0]?.focus();
  const keydown = (event: KeyboardEvent) => {
   if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); }
   if (event.key !== 'Tab') return;
   const items = controls();
   const first = items[0], last = items[items.length - 1];
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  document.addEventListener('keydown', keydown, true);
  return () => { document.removeEventListener('keydown', keydown, true); previous?.focus(); };
 }, [open, onClose]);
 return ref;
}
