import { useEffect, useState } from 'react';

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
const ALGOS: Algo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function digest(algo: Algo, data: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function HashTool() {
  const [text, setText] = useState('Hello, 前端工具箱！');
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [upperCase, setUpperCase] = useState(false);
  const [compareVal, setCompareVal] = useState('');

  const compute = async () => {
    setLoading(true);
    try {
      const enc = new TextEncoder();
      const buf = mode === 'text'
        ? enc.encode(text).buffer
        : file ? await file.arrayBuffer() : null;
      if (!buf) return;
      const results: Record<string, string> = {};
      for (const algo of ALGOS) {
        results[algo] = await digest(algo, buf as ArrayBuffer);
      }
      setHashes(results);
    } finally {
      setLoading(false);
    }
  };

  // 文字模式实时计算
  useEffect(() => {
    if (mode === 'text') compute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, mode]);

  const fmt = (h: string) => upperCase ? h.toUpperCase() : h;

  const compareResult = (h: string): 'match' | 'mismatch' | null => {
    if (!compareVal.trim()) return null;
    return fmt(h).toLowerCase() === compareVal.trim().toLowerCase() ? 'match' : 'mismatch';
  };

  return (
    <>
      <div className="page-header">
        <h1>Hash 生成</h1>
        <p>使用浏览器原生 SubtleCrypto API 计算 SHA-1 / SHA-256 / SHA-384 / SHA-512，支持文本和文件。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <button className={`btn ${mode === 'text' ? 'btn-primary' : ''}`} onClick={() => { setMode('text'); setHashes({}); }}>文本</button>
          <button className={`btn ${mode === 'file' ? 'btn-primary' : ''}`} onClick={() => { setMode('file'); setHashes({}); }}>文件</button>
          <span style={{ flex: 1 }} />
          <label className="label" style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={upperCase} onChange={(e) => setUpperCase(e.target.checked)} />
            大写
          </label>
        </div>

        {mode === 'text' ? (
          <textarea
            className="code-area"
            style={{ minHeight: 120 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要计算 Hash 的文本..."
          />
        ) : (
          <div>
            <label style={{ display: 'block' }}>
              <div className="dropzone" style={{ padding: '28px 24px' }}>
                {file
                  ? `${file.name}  (${humanSize(file.size)})`
                  : '点击选择文件或拖拽到此处'}
                <input type="file" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setHashes({}); } }} />
              </div>
            </label>
            {file && (
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={compute} disabled={loading}>
                {loading ? '计算中...' : '计算 Hash'}
              </button>
            )}
          </div>
        )}

        {/* 校验输入 */}
        <div style={{ marginTop: 14 }}>
          <div className="label" style={{ marginBottom: 6 }}>校验值（粘贴后自动对比）</div>
          <input
            className="input"
            style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            value={compareVal}
            onChange={(e) => setCompareVal(e.target.value)}
            placeholder="粘贴已知 hash 值进行比对..."
          />
        </div>
      </div>

      {/* 结果 */}
      {Object.keys(hashes).length > 0 && (
        <div className="panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALGOS.map((algo) => {
              const h = hashes[algo]!;
              const cr = compareResult(h);
              return (
                <div key={algo} style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${cr === 'match' ? 'var(--green-border)' : cr === 'mismatch' ? 'var(--red-border)' : 'var(--border)'}`,
                  background: cr === 'match' ? 'var(--green-soft)' : cr === 'mismatch' ? 'var(--red-soft)' : 'var(--bg-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>
                      {algo}
                      <span style={{ marginLeft: 6, color: 'var(--text-placeholder)' }}>{h.length / 2 * 8} bit</span>
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {cr === 'match' && <span style={{ fontSize: 11, color: '#065f46', fontWeight: 700 }}>✓ 匹配</span>}
                      {cr === 'mismatch' && <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>✗ 不匹配</span>}
                      <button className="btn" style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={() => navigator.clipboard.writeText(fmt(h))}>
                        复制
                      </button>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5,
                    wordBreak: 'break-all', lineHeight: 1.6,
                    color: cr === 'match' ? '#065f46' : cr === 'mismatch' ? 'var(--red)' : 'var(--text)',
                  }}>
                    {fmt(h)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
