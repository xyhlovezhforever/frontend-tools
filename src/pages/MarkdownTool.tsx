import { marked } from 'marked';
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

// ---- mermaid 初始化(只需一次) ----
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
});

// ---- marked:把 ```mermaid 块转成可被 mermaid.run 识别的 div ----
const renderer = new marked.Renderer();

// mermaid 代码块 → <div class="mermaid">
const originalCode = renderer.code.bind(renderer);
renderer.code = (token) => {
  if (token.lang === 'mermaid') {
    return `<div class="mermaid">${token.text}</div>`;
  }
  return originalCode(token);
};

// 外链新窗口打开
renderer.link = ({ href, text }) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

marked.use({ renderer, gfm: true, breaks: true });

// ---- 默认示例,含 mermaid 图表 ----
const DEFAULT_MD = `# Markdown + Mermaid 预览

## 流程图

\`\`\`mermaid
flowchart LR
  A[用户输入] --> B{校验}
  B -->|通过| C[处理业务]
  B -->|失败| D[返回错误]
  C --> E[返回结果]
\`\`\`

## 序列图

\`\`\`mermaid
sequenceDiagram
  participant 浏览器
  participant API
  participant DB
  浏览器->>API: POST /login
  API->>DB: 查询用户
  DB-->>API: 返回用户信息
  API-->>浏览器: 返回 JWT
\`\`\`

## 饼图

\`\`\`mermaid
pie title 工具使用分布
  "JSON 格式化" : 35
  "图片压缩" : 25
  "二维码" : 20
  "其他" : 20
\`\`\`

## 普通 Markdown

**加粗**、*斜体*、\`行内代码\`

| 工具 | 功能 |
| --- | --- |
| JSON | 格式化 / 高亮 |
| Mermaid | 图表渲染 |

> 所有内容在浏览器本地渲染,数据不上传。
`;

function copyHtml(html: string) {
  try { navigator.clipboard.writeText(html); } catch { /* ignore */ }
}

let mermaidCounter = 0;

export default function MarkdownTool() {
  const [md, setMd] = useState(DEFAULT_MD);
  const [view, setView] = useState<'split' | 'preview' | 'source'>('split');
  const previewRef = useRef<HTMLDivElement>(null);

  // 每次 md 或 view 变化时:写 innerHTML → 触发 mermaid.run
  useEffect(() => {
    if (view === 'source' || !previewRef.current) return;

    const html = marked.parse(md) as string;
    previewRef.current.innerHTML = html || '<p style="color:#9ca3af">预览将显示在这里...</p>';

    // 给每个 mermaid div 加唯一 id(mermaid.run 需要)
    const nodes = previewRef.current.querySelectorAll<HTMLDivElement>('div.mermaid');
    nodes.forEach((el) => {
      if (!el.id) el.id = `mermaid-${++mermaidCounter}`;
      // 清掉上次渲染遗留的 SVG,让 mermaid 重新渲染
      el.removeAttribute('data-processed');
    });

    if (nodes.length > 0) {
      mermaid.run({ nodes: Array.from(nodes) }).catch(() => {
        // 语法错误时 mermaid 会在 div 内自行写错误提示,不影响其余渲染
      });
    }
  }, [md, view]);

  const rawHtml = marked.parse(md) as string;

  return (
    <>
      <div className="page-header">
        <h1>Markdown 预览</h1>
        <p>实时渲染 GFM Markdown,支持 Mermaid 图表(流程图 / 序列图 / 饼图等)。</p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* 工具栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            background: '#fafbfc',
          }}
        >
          {(['split', 'source', 'preview'] as const).map((v) => (
            <button
              key={v}
              className={`btn ${view === v ? 'btn-primary' : ''}`}
              style={{ padding: '4px 12px', fontSize: 13 }}
              onClick={() => setView(v)}
            >
              {{ split: '分栏', source: '源码', preview: '预览' }[v]}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button className="btn" style={{ fontSize: 12 }} onClick={() => copyHtml(rawHtml)}>
            复制 HTML
          </button>
          <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => setMd('')}>
            清空
          </button>
        </div>

        {/* 内容区 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: view === 'split' ? '1fr 1fr' : '1fr',
            minHeight: 520,
          }}
        >
          {view !== 'preview' && (
            <textarea
              className="code-area"
              style={{
                minHeight: 520,
                border: 'none',
                borderRight: view === 'split' ? '1px solid var(--border)' : 'none',
                borderRadius: 0,
                resize: 'none',
                background: '#fafbfc',
              }}
              value={md}
              onChange={(e) => setMd(e.target.value)}
              placeholder="在此输入 Markdown..."
              spellCheck={false}
            />
          )}

          {view !== 'source' && (
            <div
              ref={previewRef}
              className="md-body"
              style={{ padding: '20px 24px', overflow: 'auto' }}
            />
          )}
        </div>
      </div>
    </>
  );
}
