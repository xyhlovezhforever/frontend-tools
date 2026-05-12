import { useMemo, useState } from 'react';

const STATUS_LIST = [
  // 1xx
  { code: 100, name: 'Continue', desc: '服务器已接收请求头，客户端应继续发送请求体。' },
  { code: 101, name: 'Switching Protocols', desc: '服务器同意切换协议（如 WebSocket 握手）。' },
  { code: 102, name: 'Processing', desc: '服务器正在处理请求，防止客户端超时。' },
  { code: 103, name: 'Early Hints', desc: '提前发送部分响应头（如 Link），用于资源预加载优化。' },
  // 2xx
  { code: 200, name: 'OK', desc: '请求成功。GET 返回资源，POST 返回处理结果。' },
  { code: 201, name: 'Created', desc: '资源已创建成功，响应头 Location 包含新资源 URL。' },
  { code: 202, name: 'Accepted', desc: '请求已接受但尚未处理（异步任务场景）。' },
  { code: 203, name: 'Non-Authoritative Information', desc: '响应来自第三方副本，内容可能与源服务器不同。' },
  { code: 204, name: 'No Content', desc: '请求成功但无响应体（DELETE / PUT 常用）。' },
  { code: 205, name: 'Reset Content', desc: '请求成功，客户端应重置视图（如清空表单）。' },
  { code: 206, name: 'Partial Content', desc: '分块下载/断点续传，响应 Range 请求的一部分。' },
  { code: 207, name: 'Multi-Status', desc: '多个子请求各自有独立状态（WebDAV）。' },
  { code: 208, name: 'Already Reported', desc: 'DAV 中已在本响应中列出，避免重复（WebDAV）。' },
  { code: 226, name: 'IM Used', desc: '服务器完成了对资源的 delta 编码（HTTP Delta）。' },
  // 3xx
  { code: 300, name: 'Multiple Choices', desc: '请求的资源有多个可选项，需客户端选择。' },
  { code: 301, name: 'Moved Permanently', desc: '资源已永久移动到新 URL，浏览器/爬虫会更新书签。' },
  { code: 302, name: 'Found', desc: '资源临时移动，客户端应继续使用原 URL。' },
  { code: 303, name: 'See Other', desc: 'POST 后重定向到 GET，防止重复提交（PRG 模式）。' },
  { code: 304, name: 'Not Modified', desc: '资源未修改，客户端可使用缓存（ETag / If-Modified-Since）。' },
  { code: 307, name: 'Temporary Redirect', desc: '临时重定向，方法和请求体不变（与 302 区别）。' },
  { code: 308, name: 'Permanent Redirect', desc: '永久重定向，方法和请求体不变（与 301 区别）。' },
  // 4xx
  { code: 400, name: 'Bad Request', desc: '请求语法错误、参数非法，服务器无法解析。' },
  { code: 401, name: 'Unauthorized', desc: '未认证，需要提供凭据（如 Bearer Token）。' },
  { code: 402, name: 'Payment Required', desc: '保留状态码，部分 API 用于表示付费限制。' },
  { code: 403, name: 'Forbidden', desc: '已认证但无权限，服务器拒绝执行。' },
  { code: 404, name: 'Not Found', desc: '资源不存在，或服务器不愿透露真实原因。' },
  { code: 405, name: 'Method Not Allowed', desc: '请求方法不被允许（如对 GET-only 资源发 POST）。' },
  { code: 406, name: 'Not Acceptable', desc: '服务器无法返回客户端 Accept 头要求的格式。' },
  { code: 407, name: 'Proxy Authentication Required', desc: '需先与代理服务器认证。' },
  { code: 408, name: 'Request Timeout', desc: '服务器等待客户端请求超时。' },
  { code: 409, name: 'Conflict', desc: '请求与资源当前状态冲突（如版本冲突、重复创建）。' },
  { code: 410, name: 'Gone', desc: '资源已永久删除，不同于 404（明确表达已消失）。' },
  { code: 411, name: 'Length Required', desc: '请求未包含 Content-Length 头。' },
  { code: 412, name: 'Precondition Failed', desc: '请求头中条件（If-Match 等）不满足。' },
  { code: 413, name: 'Content Too Large', desc: '请求体超过服务器允许的大小。' },
  { code: 414, name: 'URI Too Long', desc: 'URL 长度超出服务器限制。' },
  { code: 415, name: 'Unsupported Media Type', desc: '不支持请求体的 Content-Type 格式。' },
  { code: 416, name: 'Range Not Satisfiable', desc: 'Range 头指定的范围超出文件大小。' },
  { code: 417, name: 'Expectation Failed', desc: '服务器无法满足 Expect 请求头的条件。' },
  { code: 418, name: "I'm a Teapot", desc: '彩蛋：我是茶壶，不能煮咖啡。(RFC 2324)' },
  { code: 422, name: 'Unprocessable Entity', desc: '请求格式正确但语义错误（如校验失败，REST API 常用）。' },
  { code: 423, name: 'Locked', desc: '资源被锁定（WebDAV）。' },
  { code: 424, name: 'Failed Dependency', desc: '依赖的请求失败导致本请求失败（WebDAV）。' },
  { code: 425, name: 'Too Early', desc: '服务器拒绝处理可能被重放的早期数据。' },
  { code: 426, name: 'Upgrade Required', desc: '客户端需升级协议（如 HTTP/1.1 → HTTP/2）。' },
  { code: 428, name: 'Precondition Required', desc: '服务器要求请求附带条件头，防止"丢失更新"。' },
  { code: 429, name: 'Too Many Requests', desc: '请求频率超过限制，响应头 Retry-After 告知等待时间。' },
  { code: 431, name: 'Request Header Fields Too Large', desc: '请求头总大小或单个头过大。' },
  { code: 451, name: 'Unavailable For Legal Reasons', desc: '因法律原因不可访问（致敬《华氏 451 度》）。' },
  // 5xx
  { code: 500, name: 'Internal Server Error', desc: '服务器内部错误，通用兜底状态码。' },
  { code: 501, name: 'Not Implemented', desc: '服务器不支持请求的功能（如不支持某方法）。' },
  { code: 502, name: 'Bad Gateway', desc: '网关/代理收到了上游服务器的无效响应。' },
  { code: 503, name: 'Service Unavailable', desc: '服务器暂时不可用（过载或维护），Retry-After 告知。' },
  { code: 504, name: 'Gateway Timeout', desc: '网关等待上游服务器响应超时。' },
  { code: 505, name: 'HTTP Version Not Supported', desc: '服务器不支持请求中使用的 HTTP 版本。' },
  { code: 507, name: 'Insufficient Storage', desc: '服务器无法存储完成请求所需的内容（WebDAV）。' },
  { code: 508, name: 'Loop Detected', desc: '检测到无限循环（WebDAV）。' },
  { code: 511, name: 'Network Authentication Required', desc: '需要网络认证（如 WiFi Portal 登录）。' },
];

const RANGE_COLOR: Record<number, { bg: string; border: string; text: string; label: string }> = {
  1: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', label: '信息' },
  2: { bg: '#f0fdf4', border: '#bbf7d0', text: '#065f46', label: '成功' },
  3: { bg: '#fefce8', border: '#fde68a', text: '#92400e', label: '重定向' },
  4: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', label: '客户端错误' },
  5: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: '服务端错误' },
};

export default function HttpStatusTool() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<typeof STATUS_LIST[0] | null>(null);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return STATUS_LIST;
    return STATUS_LIST.filter(
      (s) => s.code.toString().includes(kw) || s.name.toLowerCase().includes(kw) || s.desc.includes(kw),
    );
  }, [q]);

  const groups = useMemo(() => {
    const map = new Map<number, typeof STATUS_LIST>();
    for (const s of filtered) {
      const r = Math.floor(s.code / 100);
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(s);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <>
      <div className="page-header">
        <h1>HTTP 状态码速查</h1>
        <p>收录 {STATUS_LIST.length} 个状态码，附中文说明与使用场景，支持搜索。</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 列表 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="panel" style={{ marginBottom: 0, padding: '12px 14px' }}>
            <input className="input" style={{ width: '100%' }} value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索状态码、名称或描述…" />
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map(([range, items]) => {
              const theme = RANGE_COLOR[range]!;
              return (
                <div key={range}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>
                      {range}xx — {theme.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-placeholder)' }}>{items.length} 个</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {items.map((s) => (
                      <div key={s.code}
                        onClick={() => setSelected(s)}
                        style={{
                          display: 'flex', alignItems: 'baseline', gap: 10,
                          padding: '9px 14px', borderRadius: 'var(--r-sm)',
                          border: `1px solid ${selected?.code === s.code ? theme.border : 'var(--border)'}`,
                          background: selected?.code === s.code ? theme.bg : 'var(--bg-panel)',
                          cursor: 'pointer', transition: 'all var(--ease)',
                        }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14,
                          color: theme.text, width: 36, flexShrink: 0,
                        }}>{s.code}</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'none' }}>{s.desc.slice(0, 40)}…</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {groups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>没有匹配的状态码</div>
            )}
          </div>
        </div>

        {/* 详情 */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          {selected ? (() => {
            const range = Math.floor(selected.code / 100);
            const theme = RANGE_COLOR[range]!;
            return (
              <div className="panel">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px', borderRadius: 99,
                  background: theme.bg, border: `1px solid ${theme.border}`,
                  marginBottom: 14,
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: 22, color: theme.text }}>{selected.code}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{theme.label}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 10 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>{selected.desc}</div>
                <button className="btn" style={{ marginTop: 14, width: '100%', fontSize: 12 }}
                  onClick={() => navigator.clipboard.writeText(String(selected.code))}>
                  复制状态码
                </button>
              </div>
            );
          })() : (
            <div className="panel" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: 13 }}>
              点击左侧任意状态码<br />查看详细说明
            </div>
          )}
        </div>
      </div>
    </>
  );
}
