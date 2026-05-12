import { useMemo, useState } from 'react';

function b64urlDecode(str: string): string {
  // base64url → base64
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  try {
    return atob(s + pad);
  } catch {
    throw new Error('无效的 Base64URL 编码');
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT 必须由三段组成（header.payload.signature）');
  const header = JSON.parse(b64urlDecode(parts[0]!));
  const payload = JSON.parse(b64urlDecode(parts[1]!));
  return { header, payload, signature: parts[2]! };
}

function fmtTime(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.toLocaleString()}（${ts}）`;
}

function highlight(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  const esc = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?)/g,
    (m, key, str, bool, nul, num) => {
      if (key) return `<span class="tk-key">${key}</span>`;
      if (str) return `<span class="tk-string">${str}</span>`;
      if (bool) return `<span class="tk-boolean">${bool}</span>`;
      if (nul) return `<span class="tk-null">${nul}</span>`;
      if (num) return `<span class="tk-number">${num}</span>`;
      return m;
    },
  );
}

const DEMO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzAxSEciLCJuYW1lIjoiQWxpY2UiLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwiaWF0IjoxNzE2MDAwMDAwLCJleHAiOjE3MTYwMzYwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function JwtTool() {
  const [token, setToken] = useState(DEMO);

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { data: parseJwt(token.trim()), error: '' };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [token]);

  const now = Math.floor(Date.now() / 1000);
  const exp = result?.data?.payload?.exp as number | undefined;
  const iat = result?.data?.payload?.iat as number | undefined;
  const nbf = result?.data?.payload?.nbf as number | undefined;
  const isExpired = exp !== undefined && exp < now;

  const [h, p, s] = token.trim().split('.');

  return (
    <>
      <div className="page-header">
        <h1>JWT 解析器</h1>
        <p>解码 JWT 的 Header、Payload，校验过期时间，支持复制各段。</p>
      </div>

      <div className="panel">
        <div className="label" style={{ marginBottom: 8 }}>Token</div>
        <textarea
          className="code-area"
          style={{ minHeight: 110, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="粘贴 JWT token..."
          spellCheck={false}
        />

        {/* 彩色分段展示 */}
        {result?.data && (
          <div style={{ marginTop: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, wordBreak: 'break-all', lineHeight: 1.8 }}>
            <span style={{ color: '#e11d48' }}>{h}</span>
            <span style={{ color: '#6b7280' }}>.</span>
            <span style={{ color: '#7c3aed' }}>{p}</span>
            <span style={{ color: '#6b7280' }}>.</span>
            <span style={{ color: '#0369a1' }}>{s}</span>
          </div>
        )}

        {result?.error && <div className="alert-error">{result.error}</div>}
      </div>

      {result?.data && (
        <div className="row" style={{ marginTop: 16 }}>
          {/* Header */}
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#e11d48' }}>Header</span>
              <button className="btn" style={{ fontSize: 11, padding: '3px 9px' }}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data!.header, null, 2))}>
                复制
              </button>
            </div>
            <div className="json-tree" style={{ minHeight: 'auto' }}
              dangerouslySetInnerHTML={{ __html: highlight(result.data.header) }} />
          </div>

          {/* Payload */}
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed' }}>Payload</span>
              <button className="btn" style={{ fontSize: 11, padding: '3px 9px' }}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data!.payload, null, 2))}>
                复制
              </button>
            </div>
            <div className="json-tree" style={{ minHeight: 'auto' }}
              dangerouslySetInnerHTML={{ __html: highlight(result.data.payload) }} />

            {/* 时间字段解析 */}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exp !== undefined && (
                <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: isExpired ? '#fef2f2' : '#f0fdf4',
                    color: isExpired ? '#b91c1c' : '#065f46',
                    border: `1px solid ${isExpired ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {isExpired ? '已过期' : '有效'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>exp: {fmtTime(exp)}</span>
                </div>
              )}
              {iat !== undefined && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  iat: {fmtTime(iat)}
                </div>
              )}
              {nbf !== undefined && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  nbf: {fmtTime(nbf)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
