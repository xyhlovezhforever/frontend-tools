import { useEffect, useRef, useState } from 'react';

const SIZES = [16, 32, 48, 64, 128, 256];
const SHAPES = ['square', 'rounded', 'circle'] as const;
type Shape = typeof SHAPES[number];

const PRESETS = [
  { bg: '#6366f1', fg: '#ffffff', text: 'T' },
  { bg: '#0f172a', fg: '#f8fafc', text: 'A' },
  { bg: '#10b981', fg: '#ffffff', text: 'G' },
  { bg: '#f59e0b', fg: '#1a1d2e', text: 'S' },
  { bg: '#ef4444', fg: '#ffffff', text: 'R' },
  { bg: '#3b82f6', fg: '#ffffff', text: 'B' },
];

export default function FaviconTool() {
  const [text, setText] = useState('T');
  const [bg, setBg] = useState('#6366f1');
  const [fg, setFg] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(56);
  const [shape, setShape] = useState<Shape>('rounded');
  const [size, setSize] = useState(64);
  const [bold, setBold] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);

    // 背景
    ctx.save();
    const r = shape === 'circle' ? size / 2 : shape === 'rounded' ? size * 0.18 : 0;
    if (r > 0) {
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.clip();
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();

    // 文字
    const scaledFont = Math.round((fontSize / 256) * size);
    ctx.font = `${bold ? 800 : 400} ${scaledFont}px -apple-system, 'Inter', sans-serif`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 2), size / 2, size / 2 + scaledFont * 0.04);
  };

  useEffect(draw, [text, bg, fg, fontSize, shape, size, bold]);

  const download = (s: number) => {
    const tmpCvs = document.createElement('canvas');
    tmpCvs.width = s; tmpCvs.height = s;
    const ctx = tmpCvs.getContext('2d')!;
    const r = shape === 'circle' ? s / 2 : shape === 'rounded' ? s * 0.18 : 0;
    if (r > 0) {
      ctx.beginPath(); ctx.roundRect(0, 0, s, s, r); ctx.clip();
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, s, s);
    const scaledFont = Math.round((fontSize / 256) * s);
    ctx.font = `${bold ? 800 : 400} ${scaledFont}px -apple-system, 'Inter', sans-serif`;
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 2), s / 2, s / 2 + scaledFont * 0.04);
    const a = document.createElement('a');
    a.href = tmpCvs.toDataURL('image/png');
    a.download = `favicon-${s}x${s}.png`;
    a.click();
  };

  return (
    <>
      <div className="page-header">
        <h1>Favicon 生成器</h1>
        <p>快速生成文字 Favicon，支持多尺寸导出 PNG。</p>
      </div>

      <div className="row">
        {/* 控制面板 */}
        <div className="panel" style={{ flex: '0 0 300px' }}>
          {/* 预设 */}
          <div className="label" style={{ marginBottom: 8 }}>预设</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {PRESETS.map((p) => (
              <div
                key={p.bg}
                onClick={() => { setBg(p.bg); setFg(p.fg); setText(p.text); }}
                style={{
                  width: 36, height: 36, borderRadius: 8, background: p.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: p.fg, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  border: bg === p.bg ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'border-color var(--ease)',
                }}
              >
                {p.text}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>文字（1~2 个字符）</div>
              <input className="input" style={{ width: '100%', fontSize: 18, fontWeight: 700, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}
                value={text} maxLength={2} onChange={(e) => setText(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: 6 }}>背景色</div>
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                  style={{ width: '100%', height: 38, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', cursor: 'pointer' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: 6 }}>文字色</div>
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
                  style={{ width: '100%', height: 38, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', cursor: 'pointer' }} />
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>圆角形状</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {SHAPES.map((s) => (
                  <button key={s} className={`btn ${shape === s ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: 12 }}
                    onClick={() => setShape(s)}>
                    {{ square: '直角', rounded: '圆角', circle: '圆形' }[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>字号 ({fontSize})</div>
              <input type="range" min={20} max={120} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>预览尺寸</div>
              <select className="select" style={{ width: '100%' }} value={size}
                onChange={(e) => setSize(Number(e.target.value))}>
                {SIZES.map((s) => <option key={s} value={s}>{s}×{s}</option>)}
              </select>
            </div>

            <label className="label" style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
              粗体
            </label>
          </div>
        </div>

        {/* 预览 + 下载 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', boxShadow: 'var(--shadow-md)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{size}×{size}px 预览</span>
            </div>
          </div>

          <div className="panel">
            <div className="label" style={{ marginBottom: 12 }}>下载各尺寸 PNG</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SIZES.map((s) => (
                <button key={s} className="btn" onClick={() => download(s)}>
                  {s}×{s}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              建议同时提供 16×16（浏览器标签页）、32×32（书签栏）、180×180（iOS 桌面图标）三种尺寸。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
