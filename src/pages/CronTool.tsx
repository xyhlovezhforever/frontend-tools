import { useMemo, useState } from 'react';

interface Field { name: string; hint: string; min: number; max: number; extra?: string[] }

const FIELDS: Field[] = [
  { name: '分钟',  hint: '0–59',          min: 0, max: 59 },
  { name: '小时',  hint: '0–23',          min: 0, max: 23 },
  { name: '日',    hint: '1–31',          min: 1, max: 31, extra: ['L', 'W'] },
  { name: '月',    hint: '1–12',          min: 1, max: 12 },
  { name: '星期',  hint: '0–7 (0=周日)',  min: 0, max: 7,  extra: ['L', '#'] },
];

const PRESETS = [
  { label: '每分钟',        expr: '* * * * *' },
  { label: '每小时',        expr: '0 * * * *' },
  { label: '每天 0 点',     expr: '0 0 * * *' },
  { label: '每天 9 点',     expr: '0 9 * * *' },
  { label: '每周一 9 点',   expr: '0 9 * * 1' },
  { label: '每月 1 日',     expr: '0 0 1 * *' },
  { label: '每 15 分钟',    expr: '*/15 * * * *' },
  { label: '工作日 8~18',   expr: '0 8-18 * * 1-5' },
  { label: '每季度首日',    expr: '0 0 1 1,4,7,10 *' },
  { label: '每年元旦',      expr: '0 0 1 1 *' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function parsePart(part: string, min: number, max: number): Set<number> | 'any' {
  if (part === '*') return 'any';
  const set = new Set<number>();
  for (const seg of part.split(',')) {
    if (seg.includes('/')) {
      const [range, step] = seg.split('/');
      const s = parseInt(step ?? '1');
      const [lo, hi] = range === '*' ? [min, max] : (range ?? '').split('-').map(Number);
      for (let i = (lo ?? min); i <= (hi ?? max); i += s) set.add(i);
    } else if (seg.includes('-')) {
      const [lo, hi] = seg.split('-').map(Number);
      for (let i = (lo ?? min); i <= (hi ?? max); i++) set.add(i);
    } else {
      const n = parseInt(seg);
      if (!isNaN(n)) set.add(n);
    }
  }
  return set;
}

function nextTimes(expr: string, count = 8): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  try {
    const [mm, hh, dd, mo, wd] = parts.map((p, i) => parsePart(p, FIELDS[i]!.min, FIELDS[i]!.max));
    const results: Date[] = [];
    const now = new Date();
    const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
    let safety = 0;
    while (results.length < count && safety++ < 200000) {
      const ok = (
        (mo === 'any' || (mo as Set<number>).has(cur.getMonth() + 1)) &&
        (dd === 'any' || (dd as Set<number>).has(cur.getDate())) &&
        (wd === 'any' || (wd as Set<number>).has(cur.getDay()) || ((wd as Set<number>).has(7) && cur.getDay() === 0)) &&
        (hh === 'any' || (hh as Set<number>).has(cur.getHours())) &&
        (mm === 'any' || (mm as Set<number>).has(cur.getMinutes()))
      );
      if (ok) results.push(new Date(cur));
      cur.setMinutes(cur.getMinutes() + 1);
    }
    return results;
  } catch { return []; }
}

function describe(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return '格式无效，需要 5 个字段';
  const [mm, hh, dd, mo, wd] = parts;
  if (expr === '* * * * *') return '每分钟执行一次';
  if (mm === '0' && hh === '*') return '每小时整点执行';
  if (mm === '0' && hh !== '*' && dd === '*' && mo === '*' && wd === '*') return `每天 ${hh}:00 执行`;
  if (mm?.startsWith('*/')) return `每 ${mm.slice(2)} 分钟执行一次`;
  if (hh?.startsWith('*/')) return `每 ${hh.slice(2)} 小时执行一次`;
  const parts2: string[] = [];
  if (mm !== '*') parts2.push(`分钟: ${mm}`);
  if (hh !== '*') parts2.push(`小时: ${hh}`);
  if (dd !== '*') parts2.push(`日期: ${dd}`);
  if (mo !== '*') parts2.push(`月: ${mo}`);
  if (wd !== '*') parts2.push(`星期: ${wd}`);
  return parts2.join(', ');
}

export default function CronTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [error, setError] = useState('');

  const validate = (e: string) => {
    const p = e.trim().split(/\s+/);
    if (p.length !== 5) setError('需要 5 个字段：分 时 日 月 周');
    else setError('');
  };

  const nexts = useMemo(() => nextTimes(expr), [expr]);
  const desc = useMemo(() => describe(expr), [expr]);

  const pad = (n: string | number, len = 2) => String(n).padStart(len, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${DAYS[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return (
    <>
      <div className="page-header">
        <h1>Cron 表达式解析</h1>
        <p>解析标准 5 字段 Cron，展示下次执行时间，内置常用预设。</p>
      </div>

      <div className="panel">
        {/* 输入 */}
        <div className="label" style={{ marginBottom: 8 }}>Cron 表达式</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input className="input" style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}
            value={expr} onChange={(e) => { setExpr(e.target.value); validate(e.target.value); }} />
          <button className="btn" onClick={() => navigator.clipboard.writeText(expr)}>复制</button>
        </div>

        {/* 字段标注 */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          {expr.trim().split(/\s+/).map((p, i) => (
            <div key={i} style={{ flex: 1, padding: '6px 0', borderLeft: i ? '1px solid var(--border)' : 'none', paddingLeft: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>{p}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{FIELDS[i]?.name}</div>
              <div style={{ color: 'var(--text-placeholder)', fontSize: 10 }}>{FIELDS[i]?.hint}</div>
            </div>
          ))}
        </div>

        {/* 人类语言描述 */}
        {!error && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-soft)', borderRadius: 'var(--r-sm)', border: '1px solid var(--accent-border)', fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>
            {desc}
          </div>
        )}
        {error && <div className="alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        {/* 预设 */}
        <div className="label" style={{ marginBottom: 8 }}>预设</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 0 }}>
          {PRESETS.map((p) => (
            <button key={p.expr} className={`btn ${expr === p.expr ? 'btn-primary' : ''}`}
              style={{ fontSize: 12 }}
              onClick={() => { setExpr(p.expr); validate(p.expr); }}>
              {p.label}
              <span style={{ marginLeft: 4, fontFamily: 'JetBrains Mono, monospace', opacity: 0.7, fontSize: 11 }}>
                {p.expr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 下次执行 */}
      {nexts.length > 0 && (
        <div className="panel">
          <div className="label" style={{ marginBottom: 12 }}>接下来 8 次执行时间</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {nexts.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 12px', borderRadius: 'var(--r-sm)',
                background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                border: `1px solid ${i === 0 ? 'var(--accent-border)' : 'var(--border)'}`,
              }}>
                <span style={{ width: 20, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>#{i + 1}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--accent)' : 'var(--text)' }}>
                  {fmt(d)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 字段参考 */}
      <div className="panel">
        <div className="label" style={{ marginBottom: 12 }}>字段语法参考</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['符号', '含义', '示例'].map((h) => (
                  <th key={h} style={{ padding: '7px 12px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-sub)', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['*', '任意值', '* 代表每分钟/每小时…'],
                ['n', '具体值', '5 代表第 5 分钟'],
                ['n-m', '范围', '1-5 代表 1 到 5'],
                ['*/n', '步长', '*/15 代表每 15 个单位'],
                ['a,b,c', '列表', '1,3,5 代表 1、3、5'],
                ['L', '最后', '日字段 L 代表本月最后一天'],
                ['W', '最近工作日', '15W 代表离 15 日最近的工作日'],
                ['#', '第几个星期几', '2#3 代表第 3 个星期二'],
              ].map(([sym, mean, ex]) => (
                <tr key={sym}>
                  <td style={{ padding: '6px 12px', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontWeight: 700 }}>{sym}</td>
                  <td style={{ padding: '6px 12px', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>{mean}</td>
                  <td style={{ padding: '6px 12px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
