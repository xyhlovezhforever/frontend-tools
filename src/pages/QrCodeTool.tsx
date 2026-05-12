import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

type Level = 'L' | 'M' | 'Q' | 'H';

export default function QrCodeTool() {
  const [text, setText] = useState('https://github.com');
  const [size, setSize] = useState(280);
  const [level, setLevel] = useState<Level>('M');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) {
      setError(text ? '' : '');
      return;
    }
    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: level,
        color: { dark: fg, light: bg },
      },
      (err) => {
        if (err) setError(err.message);
        else setError('');
      },
    );
  }, [text, size, level, fg, bg]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <>
      <div className="page-header">
        <h1>二维码生成</h1>
        <p>将任意文本或链接生成二维码,可调整尺寸、纠错等级和颜色。</p>
      </div>

      <div className="panel">
        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              内容
            </div>
            <textarea
              className="code-area"
              style={{ minHeight: 160 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入文本或网址..."
            />

            <div className="toolbar" style={{ marginTop: 12 }}>
              <label className="label">
                尺寸
                <input
                  className="input"
                  type="number"
                  style={{ width: 80 }}
                  min={100}
                  max={1024}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value) || 280)}
                />
                px
              </label>
              <label className="label">
                纠错
                <select
                  className="select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                >
                  <option value="L">L · 7%</option>
                  <option value="M">M · 15%</option>
                  <option value="Q">Q · 25%</option>
                  <option value="H">H · 30%</option>
                </select>
              </label>
              <label className="label">
                前景
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
              </label>
              <label className="label">
                背景
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
              </label>
            </div>

            {error && <div className="alert-error">{error}</div>}
          </div>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              预览
            </div>
            <div className="qr-output">
              <canvas ref={canvasRef} />
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={handleDownload} disabled={!text}>
                下载 PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
