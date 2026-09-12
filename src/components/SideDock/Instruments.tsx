import type { ChangeEvent } from 'react';

export function PanelHeader({ title }: { title: string }) {
 return <header className="mv-panel-header">
  <div className="mv-nameplate"><h1>MULTIVAC READING TERMINAL</h1><p>ARCHIVO DE LA HUMANIDAD</p></div>
  <div className="mv-work"><span>OBRA</span><strong>{title}</strong></div>
 </header>;
}

export function CalibrationScale({ min, max, value, label, onChange }: {
 min: number; max: number; value: number; label: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
 const ticks = [min, ...[10,20,30,40,50].filter(n => n > min && n < max), max];
 return <div className="mv-calibration">
  <input type="range" min={min} max={max} value={value} onChange={onChange} aria-label={label}/>
  <div className="mv-scale-labels" aria-hidden="true">{ticks.map(n => <span key={n} style={{left:`${(n-min)/(max-min)*100}%`}}>{n}</span>)}</div>
 </div>;
}

export function PageOrSpreadDisplay({ current, end, total }: { current: number; end: number; total: number }) {
 return <div className="sidedock-page-readout" aria-live="polite" aria-atomic="true">
  <span className="readout-prefix">{end > current ? 'PLIEGO' : 'PÁGINA'}</span>
  <span className="readout-current">{String(current).padStart(2,'0')}{end > current && `—${String(end).padStart(2,'0')}`}</span>
  <span className="readout-total">/ {total}</span>
 </div>;
}
