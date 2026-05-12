import { useMemo, useState } from 'react';

interface Match {
  index: number;
  value: string;
  groups: (string | undefined)[];
}

function buildHighlight(text: string, matches: Match[], flags: string): string {
  if (!matches.length) return escHtml(text);
  const isGlobal = flags.includes('g');
  const targets = isGlobal ? matches : [matches[0]];
  let result = '';
  let cursor = 0;
  for (const m of targets) {
    result += escHtml(text.slice(cursor, m.index));
    result += `<mark>${escHtml(m.value)}</mark>`;
    cursor = m.index + m.value.length;
    if (!isGlobal) break;
  }
  result += escHtml(text.slice(cursor));
  return result;
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const FLAG_LIST = ['g', 'i', 'm', 's', 'u'] as const;
const FLAG_DESC: Record<string, string> = {
  g: '全局 (global)',
  i: '忽略大小写 (ignoreCase)',
  m: '多行 (multiline)',
  s: '点匹配换行 (dotAll)',
  u: 'Unicode',
};

const PRESETS = [
  { label: '邮箱', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { label: '手机号', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'gi' },
  { label: 'IPv4', pattern: '(?:\\d{1,3}\\.){3}\\d{1,3}', flags: 'g' },
  { label: '中文', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
  { label: '十六进制颜色', pattern: '#[0-9a-fA-F]{3,6}\\b', flags: 'g' },
  { label: 'HTML 标签', pattern: '<\\/?[a-zA-Z][^>]*>', flags: 'gi' },
  { label: '数字', pattern: '-?\\d+(\\.\\d+)?', flags: 'g' },
];

export default function RegexTool() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('gi');
  const [testStr, setTestStr] = useState(
    '联系我们: alice@example.com 或 bob@company.org\n邮件地址: support@tools.io',
  );

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  const result = useMemo(() => {
    if (!pattern) return { matches: [] as Match[], error: '', html: escHtml(testStr) };
    try {
      const re = new RegExp(pattern, flags.replace(/g/g, '') + 'g');
      const matches: Match[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(testStr)) !== null) {
        matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
        if (!flags.includes('g')) break;
        if (m[0] === '') re.lastIndex++;
      }
      const html = buildHighlight(testStr, matches, flags);
      return { matches, error: '', html };
    } catch (e) {
      return { matches: [] as Match[], error: (e as Error).message, html: escHtml(testStr) };
    }
  }, [pattern, flags, testStr]);

  const loadPreset = (p: { pattern: string; flags: string }) => {
    setPattern(p.pattern);
    setFlags(p.flags);
  };

  return (
    <>
      <div className="page-header">
        <h1>正则测试器</h1>
        <p>实时匹配高亮,显示所有捕获组,内置常用正则预设。</p>
      </div>

      <div className="panel">
        <div className="label" style={{ marginBottom: 6 }}>正则表达式</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 20, color: 'var(--text-muted)', lineHeight: 1 }}>/</span>
          <input
            className="input"
            style={{ flex: 1, fontFamily: 'Consolas, monospace', fontSize: 14 }}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
            spellCheck={false}
          />
          <span style={{ fontSize: 20, color: 'var(--text-muted)', lineHeight: 1 }}>/</span>
          <span style={{ fontFamily: 'Consolas, monospace', fontSize: 14, color: 'var(--primary)', minWidth: 40 }}>
            {flags || '—'}
          </span>
        </div>

        <div className="toolbar" style={{ gap: 6, marginBottom: 10 }}>
          {FLAG_LIST.map((f) => (
            <button
              key={f}
              className={`btn ${flags.includes(f) ? 'btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => toggleFlag(f)}
              title={FLAG_DESC[f]}
            >
              {f}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>预设:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className="btn"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => loadPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {result.error && <div className="alert-error" style={{ marginBottom: 10 }}>{result.error}</div>}

        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>测试文本</div>
            <textarea
              className="code-area"
              style={{ minHeight: 200 }}
              value={testStr}
              onChange={(e) => setTestStr(e.target.value)}
              placeholder="在此输入测试字符串..."
              spellCheck={false}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              高亮预览
              <span
                style={{
                  marginLeft: 8,
                  background: result.matches.length ? '#fef9c3' : 'transparent',
                  border: result.matches.length ? '1px solid #fde047' : 'none',
                  borderRadius: 4,
                  padding: '1px 8px',
                  fontSize: 12,
                  color: result.matches.length ? '#92400e' : 'var(--text-muted)',
                }}
              >
                {result.matches.length} 个匹配
              </span>
            </div>
            <div
              className="json-tree"
              style={{ minHeight: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              dangerouslySetInnerHTML={{ __html: result.html || '<span style="color:#9ca3af">高亮将显示在这里...</span>' }}
            />
          </div>
        </div>
      </div>

      {result.matches.length > 0 && (
        <div className="panel">
          <div className="label" style={{ marginBottom: 10 }}>
            匹配详情({Math.min(result.matches.length, 50)} / {result.matches.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.matches.slice(0, 50).map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 80px 1fr',
                  gap: 8,
                  alignItems: 'start',
                  fontSize: 13,
                  fontFamily: 'Consolas, monospace',
                  background: i % 2 ? '#fafbfc' : '#fff',
                  borderRadius: 4,
                  padding: '4px 8px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <span style={{ color: 'var(--text-muted)' }}>pos {m.index}</span>
                <span>
                  <mark style={{ background: '#fef08a', borderRadius: 2, padding: '0 2px' }}>{m.value}</mark>
                  {m.groups.length > 0 && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: 10, fontSize: 12 }}>
                      组: {m.groups.map((g, gi) => `$${gi + 1}=${g ?? 'undefined'}`).join(' ')}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
