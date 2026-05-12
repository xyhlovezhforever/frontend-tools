import { useMemo, useState } from 'react';

type Op = 'eq' | 'ins' | 'del';
interface Chunk { op: Op; lines: string[] }

function diff(oldText: string, newText: string): Chunk[] {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const m = a.length, n = b.length;

  // Myers diff (shortest edit script) via DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i]![j] = a[i - 1] === b[j - 1] ? dp[i - 1]![j - 1]! : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);

  // backtrack
  const chunks: Chunk[] = [];
  let i = m, j = n;
  const ops: { op: Op; line: string }[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ op: 'eq', line: a[i - 1]! }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! <= dp[i - 1]![j]!)) {
      ops.unshift({ op: 'ins', line: b[j - 1]! }); j--;
    } else {
      ops.unshift({ op: 'del', line: a[i - 1]! }); i--;
    }
  }

  // group consecutive ops
  for (const item of ops) {
    const last = chunks[chunks.length - 1];
    if (last && last.op === item.op) last.lines.push(item.line);
    else chunks.push({ op: item.op, lines: [item.line] });
  }
  return chunks;
}

const OP_STYLE: Record<Op, { bg: string; border: string; prefix: string; color: string }> = {
  eq:  { bg: 'transparent',        border: 'transparent',       prefix: '  ', color: 'var(--text)' },
  ins: { bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.3)', prefix: '+ ', color: '#065f46' },
  del: { bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.25)', prefix: '– ', color: '#991b1b' },
};

const DEMO_OLD = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const user = "Alice";
greet(user);`;

const DEMO_NEW = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
}

const user = "Bob";
greet(user, "Hi");`;

export default function DiffTool() {
  const [left, setLeft] = useState(DEMO_OLD);
  const [right, setRight] = useState(DEMO_NEW);
  const [mode, setMode] = useState<'unified' | 'split'>('unified');

  const chunks = useMemo(() => diff(left, right), [left, right]);

  const stats = useMemo(() => {
    let ins = 0, del = 0;
    for (const c of chunks) {
      if (c.op === 'ins') ins += c.lines.length;
      if (c.op === 'del') del += c.lines.length;
    }
    return { ins, del };
  }, [chunks]);

  return (
    <>
      <div className="page-header">
        <h1>文本差异对比</h1>
        <p>逐行 Diff，高亮新增/删除，支持统一视图和分栏视图。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <button className={`btn ${mode === 'unified' ? 'btn-primary' : ''}`} onClick={() => setMode('unified')}>统一视图</button>
          <button className={`btn ${mode === 'split' ? 'btn-primary' : ''}`} onClick={() => setMode('split')}>分栏视图</button>
          <span style={{ flex: 1 }} />
          {stats.ins > 0 && <span style={{ fontSize: 12, color: '#065f46', fontWeight: 700 }}>+{stats.ins} 行</span>}
          {stats.del > 0 && <span style={{ fontSize: 12, color: '#991b1b', fontWeight: 700 }}>–{stats.del} 行</span>}
        </div>

        <div className={mode === 'split' ? 'row' : ''}>
          <div style={mode === 'split' ? {} : undefined}>
            <div className="label" style={{ marginBottom: 6 }}>原文</div>
            <textarea className="code-area" style={{ minHeight: 200 }} value={left}
              onChange={(e) => setLeft(e.target.value)} spellCheck={false} />
          </div>
          <div style={mode === 'split' ? {} : { marginTop: 12 }}>
            <div className="label" style={{ marginBottom: 6 }}>新文</div>
            <textarea className="code-area" style={{ minHeight: 200 }} value={right}
              onChange={(e) => setRight(e.target.value)} spellCheck={false} />
          </div>
        </div>
      </div>

      {/* Diff 结果 */}
      <div className="panel">
        <div className="label" style={{ marginBottom: 10 }}>差异结果</div>

        {mode === 'unified' ? (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, lineHeight: 1.7, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {chunks.map((chunk, ci) => {
              const s = OP_STYLE[chunk.op];
              return chunk.lines.map((line, li) => (
                <div key={`${ci}-${li}`} style={{
                  padding: '1px 14px',
                  background: s.bg,
                  borderLeft: `3px solid ${s.border}`,
                  color: s.color,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  <span style={{ userSelect: 'none', marginRight: 8, opacity: 0.5 }}>{s.prefix}</span>
                  {line}
                </div>
              ));
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* 左：原文 del+eq */}
            {(['del', 'eq'] as Op[]).map((opFilter, col) => (
              <div key={col} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '4px 12px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {col === 0 ? '原文' : '新文'}
                </div>
                {chunks.filter((c) => c.op === opFilter || (col === 1 && c.op === 'ins') || (col === 0 && c.op === 'del') || c.op === 'eq').map((chunk, ci) => {
                  const show = chunk.op === 'eq' || (col === 0 && chunk.op === 'del') || (col === 1 && chunk.op === 'ins');
                  if (!show) return chunk.lines.map((_, li) => (
                    <div key={`${ci}-${li}`} style={{ padding: '1px 14px', background: '#f8f9fb', color: 'transparent', userSelect: 'none' }}>·</div>
                  ));
                  const s = OP_STYLE[chunk.op];
                  return chunk.lines.map((line, li) => (
                    <div key={`${ci}-${li}`} style={{ padding: '1px 14px', background: s.bg, color: s.color, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {line || ' '}
                    </div>
                  ));
                })}
              </div>
            ))}
          </div>
        )}

        {stats.ins === 0 && stats.del === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            两段文本完全相同
          </div>
        )}
      </div>
    </>
  );
}
