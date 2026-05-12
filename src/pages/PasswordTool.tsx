import { useCallback, useState } from 'react';

const SETS = {
  upper:   { chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', label: '大写字母 A–Z' },
  lower:   { chars: 'abcdefghijklmnopqrstuvwxyz', label: '小写字母 a–z' },
  digits:  { chars: '0123456789',                  label: '数字 0–9' },
  symbols: { chars: '!@#$%^&*()-_=+[]{}|;:,.<>?',  label: '特殊字符' },
  similar: { chars: 'il1Lo0O',                      label: '排除易混淆字符 (il1Lo0O)' },
};

function entropy(len: number, pool: number): number {
  return Math.round(len * Math.log2(pool));
}

function strengthLabel(bits: number): { label: string; color: string; width: string } {
  if (bits < 40)  return { label: '极弱', color: '#ef4444', width: '15%' };
  if (bits < 60)  return { label: '弱',   color: '#f59e0b', width: '35%' };
  if (bits < 80)  return { label: '中等', color: '#eab308', width: '55%' };
  if (bits < 100) return { label: '强',   color: '#10b981', width: '75%' };
  return { label: '极强', color: '#6366f1', width: '100%' };
}

function generate(len: number, opts: Record<string, boolean>, excludeSimilar: boolean): string {
  let pool = '';
  if (opts.upper)   pool += SETS.upper.chars;
  if (opts.lower)   pool += SETS.lower.chars;
  if (opts.digits)  pool += SETS.digits.chars;
  if (opts.symbols) pool += SETS.symbols.chars;
  if (excludeSimilar) {
    const bad = new Set(SETS.similar.chars);
    pool = pool.split('').filter((c) => !bad.has(c)).join('');
  }
  if (!pool) return '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((n) => pool[n % pool.length]!).join('');
}

export default function PasswordTool() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: false });
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => generate(20, { upper: true, lower: true, digits: true, symbols: false }, false))
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const pool = [
    opts.upper ? SETS.upper.chars : '',
    opts.lower ? SETS.lower.chars : '',
    opts.digits ? SETS.digits.chars : '',
    opts.symbols ? SETS.symbols.chars : '',
  ].join('').split('').filter((c) => !(excludeSimilar && SETS.similar.chars.includes(c))).filter((v, i, a) => a.indexOf(v) === i).length;

  const bits = entropy(len, pool || 1);
  const strength = strengthLabel(bits);

  const gen = useCallback((l = len, o = opts, es = excludeSimilar, c = count) => {
    setPasswords(Array.from({ length: c }, () => generate(l, o, es)));
    setCopiedIdx(null);
  }, [len, opts, excludeSimilar, count]);

  const copy = (idx: number, pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <>
      <div className="page-header">
        <h1>密码生成器</h1>
        <p>使用浏览器 CSPRNG 生成高强度随机密码，支持批量生成，密码不离开浏览器。</p>
      </div>

      <div className="panel">
        {/* 长度 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="label">密码长度</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{len}</span>
          </div>
          <input type="range" min={4} max={128} value={len} style={{ width: '100%' }}
            onChange={(e) => { setLen(Number(e.target.value)); gen(Number(e.target.value)); }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            <span>4</span><span>128</span>
          </div>
        </div>

        {/* 字符集 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
          {(['upper', 'lower', 'digits', 'symbols'] as const).map((k) => (
            <label key={k} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              borderRadius: 'var(--r-sm)', border: `1px solid ${opts[k] ? 'var(--accent-border)' : 'var(--border)'}`,
              background: opts[k] ? 'var(--accent-soft)' : 'var(--bg-subtle)',
              cursor: 'pointer', transition: 'all var(--ease)', userSelect: 'none',
            }}>
              <input type="checkbox" checked={opts[k]} onChange={(e) => {
                const next = { ...opts, [k]: e.target.checked };
                setOpts(next); gen(len, next);
              }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: opts[k] ? 'var(--accent)' : 'var(--text-sub)' }}>
                {SETS[k].label}
              </span>
            </label>
          ))}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
            borderRadius: 'var(--r-sm)', border: `1px solid ${excludeSimilar ? 'var(--accent-border)' : 'var(--border)'}`,
            background: excludeSimilar ? 'var(--accent-soft)' : 'var(--bg-subtle)',
            cursor: 'pointer', transition: 'all var(--ease)', userSelect: 'none', gridColumn: '1 / -1',
          }}>
            <input type="checkbox" checked={excludeSimilar} onChange={(e) => {
              setExcludeSimilar(e.target.checked); gen(len, opts, e.target.checked);
            }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: excludeSimilar ? 'var(--accent)' : 'var(--text-sub)' }}>
              {SETS.similar.label}
            </span>
          </label>
        </div>

        {/* 强度 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="label">密码强度</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: strength.color }}>{strength.label} · {bits} bits</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 99, transition: 'width 0.3s ease, background 0.3s ease' }} />
          </div>
        </div>

        <div className="toolbar">
          <label className="label">
            数量
            <input className="input" type="number" min={1} max={50} value={count} style={{ width: 64 }}
              onChange={(e) => { const v = Math.max(1, Math.min(50, Number(e.target.value))); setCount(v); gen(len, opts, excludeSimilar, v); }} />
          </label>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={() => gen()}>重新生成</button>
          <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(passwords.join('\n'))}>复制全部</button>
        </div>

        {/* 密码列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {passwords.map((pw, i) => (
            <div key={i}
              onClick={() => copy(i, pw)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                border: '1px solid transparent',
                transition: 'all var(--ease)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13.5, letterSpacing: 0.5, wordBreak: 'break-all' }}>
                {pw}
              </span>
              <span style={{ fontSize: 11, color: copiedIdx === i ? 'var(--green)' : 'var(--text-placeholder)', flexShrink: 0, marginLeft: 12 }}>
                {copiedIdx === i ? '已复制 ✓' : '点击复制'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
