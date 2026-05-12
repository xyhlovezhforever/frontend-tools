import { useState } from 'react';

const BREAKPOINTS = [
  { label: 'Mobile', px: 375 },
  { label: 'Tablet', px: 768 },
  { label: 'Desktop', px: 1440 },
  { label: '4K', px: 3840 },
];

export default function CssUnitTool() {
  const [rootPx, setRootPx] = useState(16);
  const [viewW, setViewW] = useState(1440);
  const [viewH, setViewH] = useState(900);
  const [input, setInput] = useState('16');
  const [from, setFrom] = useState<'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt' | '%'>('px');
  const [emBase, setEmBase] = useState(16);

  function toPx(val: number, unit: typeof from): number {
    switch (unit) {
      case 'px':  return val;
      case 'rem': return val * rootPx;
      case 'em':  return val * emBase;
      case 'vw':  return (val / 100) * viewW;
      case 'vh':  return (val / 100) * viewH;
      case 'pt':  return val * 1.3333333;
      case '%':   return (val / 100) * emBase;
    }
  }

  function fromPx(px: number, unit: typeof from): number {
    switch (unit) {
      case 'px':  return px;
      case 'rem': return px / rootPx;
      case 'em':  return px / emBase;
      case 'vw':  return (px / viewW) * 100;
      case 'vh':  return (px / viewH) * 100;
      case 'pt':  return px / 1.3333333;
      case '%':   return (px / emBase) * 100;
    }
  }

  const num = parseFloat(input);
  const valid = !isNaN(num);
  const basePx = valid ? toPx(num, from) : 0;

  const UNITS: (typeof from)[] = ['px', 'rem', 'em', 'vw', 'vh', 'pt', '%'];

  const fmt = (n: number) => {
    if (!isFinite(n)) return '—';
    const s = n.toPrecision(6).replace(/\.?0+$/, '');
    return s;
  };

  return (
    <>
      <div className="page-header">
        <h1>CSS 单位转换</h1>
        <p>px / rem / em / vw / vh / pt / % 实时互转，可自定义根字号与视口尺寸。</p>
      </div>

      {/* 配置 */}
      <div className="panel">
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <label className="label">
            根字号 (root)
            <input className="input" type="number" style={{ width: 72 }}
              value={rootPx} min={1} max={64}
              onChange={(e) => setRootPx(Number(e.target.value) || 16)} />
            px
          </label>
          <label className="label">
            em 基准
            <input className="input" type="number" style={{ width: 72 }}
              value={emBase} min={1} max={200}
              onChange={(e) => setEmBase(Number(e.target.value) || 16)} />
            px
          </label>
          <label className="label">
            视口宽
            <input className="input" type="number" style={{ width: 80 }}
              value={viewW} min={1}
              onChange={(e) => setViewW(Number(e.target.value) || 1440)} />
            px
          </label>
          <label className="label">
            视口高
            <input className="input" type="number" style={{ width: 80 }}
              value={viewH} min={1}
              onChange={(e) => setViewH(Number(e.target.value) || 900)} />
            px
          </label>
          <span style={{ flex: 1 }} />
          {BREAKPOINTS.map((b) => (
            <button key={b.px} className="btn" style={{ fontSize: 11 }}
              onClick={() => setViewW(b.px)}>
              {b.label} {b.px}px
            </button>
          ))}
        </div>
      </div>

      {/* 输入 */}
      <div className="panel">
        <div className="label" style={{ marginBottom: 10 }}>输入值</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
          <input
            className="input"
            type="number"
            style={{ width: 140, fontSize: 20, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0"
          />
          <select className="select" value={from} onChange={(e) => setFrom(e.target.value as typeof from)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          {valid && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              = <strong style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{fmt(basePx)}</strong> px
            </span>
          )}
        </div>

        {/* 结果表格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {UNITS.map((unit) => {
            const val = valid ? fromPx(basePx, unit) : null;
            const isActive = unit === from;
            return (
              <div
                key={unit}
                onClick={() => { if (val !== null) { setInput(fmt(val)); setFrom(unit); } }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'}`,
                  background: isActive ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--ease)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: isActive ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 6 }}>{unit}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                  {val !== null ? fmt(val) : '—'}
                </div>
                {val !== null && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {fmt(val)}{unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 常用字号对照 */}
      <div className="panel">
        <div className="label" style={{ marginBottom: 12 }}>常用字号对照（根字号 {rootPx}px）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[10,12,13,14,16,18,20,24,28,32,36,48,64,72].map((p) => (
            <div key={p}
              onClick={() => { setInput(String(p)); setFrom('px'); }}
              style={{ padding: '6px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', fontSize: 12 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{p}px</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{fmt(p / rootPx)}rem</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
