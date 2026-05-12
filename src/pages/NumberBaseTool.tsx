import { useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASES: { base: Base; label: string; prefix: string; chars: RegExp }[] = [
  { base: 2,  label: '二进制 (BIN)', prefix: '0b', chars: /^[01]*$/ },
  { base: 8,  label: '八进制 (OCT)', prefix: '0o', chars: /^[0-7]*$/ },
  { base: 10, label: '十进制 (DEC)', prefix: '',   chars: /^-?[0-9]*$/ },
  { base: 16, label: '十六进制 (HEX)', prefix: '0x', chars: /^[0-9a-fA-F]*$/ },
];

function toNum(value: string, base: Base): bigint | null {
  const v = value.trim();
  if (!v || v === '-') return null;
  try {
    return BigInt(base === 10 ? v : `0${base === 2 ? 'b' : base === 8 ? 'o' : 'x'}${v}`);
  } catch {
    return null;
  }
}

function fromNum(n: bigint, base: Base): string {
  if (n < 0n) {
    return base === 10 ? n.toString() : `-${(-n).toString(base as number)}`;
  }
  return n.toString(base as number);
}

// ASCII / Unicode 辅助
function toAscii(n: bigint): string {
  if (n >= 0n && n <= 127n) {
    const c = String.fromCharCode(Number(n));
    if (n >= 32n && n <= 126n) return `'${c}'`;
    const map: Record<number, string> = { 0:'NUL',9:'TAB',10:'LF',13:'CR',27:'ESC',32:'SPC' };
    return map[Number(n)] ?? `\\x${Number(n).toString(16).padStart(2,'0')}`;
  }
  return '';
}

export default function NumberBaseTool() {
  const [values, setValues] = useState<Record<Base, string>>({ 2: '', 8: '', 10: '255', 16: 'ff' });
  const [error, setError] = useState('');

  const handleChange = (val: string, base: Base) => {
    setError('');
    const cfg = BASES.find((b) => b.base === base)!;
    const clean = base === 16 ? val.replace(/[^0-9a-fA-F]/g, '') : val;
    if (!cfg.chars.test(clean)) return;

    const n = toNum(clean, base);
    if (clean === '' || clean === '-') {
      setValues({ 2: '', 8: '', 10: clean, 16: '' });
      return;
    }
    if (n === null) { setError('解析失败'); return; }

    setValues({
      2:  fromNum(n, 2),
      8:  fromNum(n, 8),
      10: fromNum(n, 10),
      16: fromNum(n, 16),
    });
  };

  const n10 = toNum(values[10], 10);
  const ascii = n10 !== null ? toAscii(n10) : '';

  return (
    <>
      <div className="page-header">
        <h1>数字进制转换</h1>
        <p>二进制、八进制、十进制、十六进制实时互转，支持负数与 ASCII 提示。</p>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {BASES.map(({ base, label, prefix }) => (
            <div key={base}>
              <div className="label" style={{ marginBottom: 6 }}>{label}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {prefix && (
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                    color: 'var(--text-muted)', padding: '0 4px',
                  }}>{prefix}</span>
                )}
                <input
                  className="input"
                  style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 15, letterSpacing: base === 2 ? 2 : 0 }}
                  value={values[base]}
                  onChange={(e) => handleChange(e.target.value, base)}
                  placeholder={`输入${label.split(' ')[0]}数...`}
                  spellCheck={false}
                />
                <button className="btn" style={{ fontSize: 12 }}
                  onClick={() => navigator.clipboard.writeText(prefix + values[base])}>
                  复制
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {n10 !== null && (
          <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: '十进制', val: n10.toString() },
              { label: '位数 (BIN)', val: `${n10 < 0n ? '-' : ''}${fromNum(n10 < 0n ? -n10 : n10, 2).length} bit` },
              ...(ascii ? [{ label: 'ASCII / Unicode', val: ascii }] : []),
              { label: 'U+码点', val: n10 >= 0n && n10 <= 0x10FFFFn ? `U+${n10.toString(16).toUpperCase().padStart(4,'0')}` : '—' },
            ].map(({ label, val }) => (
              <div key={label} style={{
                padding: '6px 14px', borderRadius: 99, background: 'var(--bg-subtle)',
                border: '1px solid var(--border)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>{label}</span>
                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 常用速查表 */}
      <div className="panel">
        <div className="label" style={{ marginBottom: 12 }}>常用值速查</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['DEC', 'HEX', 'BIN', 'ASCII'].map((h) => (
                  <th key={h} style={{ padding: '6px 14px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-sub)', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,8,9,10,13,32,48,65,97,127,255].map((d) => (
                <tr key={d} style={{ cursor: 'pointer' }}
                  onClick={() => handleChange(String(d), 10)}>
                  <td style={{ padding: '5px 14px', border: '1px solid var(--border)', color: 'var(--tk-number)' }}>{d}</td>
                  <td style={{ padding: '5px 14px', border: '1px solid var(--border)', color: 'var(--tk-key)' }}>{d.toString(16).toUpperCase()}</td>
                  <td style={{ padding: '5px 14px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{d.toString(2).padStart(8,'0')}</td>
                  <td style={{ padding: '5px 14px', border: '1px solid var(--border)', color: 'var(--text-sub)' }}>{toAscii(BigInt(d))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
