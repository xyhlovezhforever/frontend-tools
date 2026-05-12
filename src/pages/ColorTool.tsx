import { useState } from 'react';

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
        break;
      case g1:
        h = (b1 - r1) / d + 2;
        break;
      case b1:
        h = (r1 - g1) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const s1 = s / 100;
  const l1 = l / 100;
  const c = (1 - Math.abs(2 * l1 - 1)) * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l1 - c / 2;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export default function ColorTool() {
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  const updateFromHex = (v: string) => {
    const c = hexToRgb(v);
    if (c) setRgb(c);
  };

  const updateRgb = (k: keyof RGB, v: string) => {
    const n = Math.max(0, Math.min(255, Number(v) || 0));
    setRgb({ ...rgb, [k]: n });
  };

  const updateHsl = (k: keyof HSL, v: string) => {
    const n = Math.max(0, Math.min(k === 'h' ? 360 : 100, Number(v) || 0));
    setRgb(hslToRgb({ ...hsl, [k]: n }));
  };

  return (
    <>
      <div className="page-header">
        <h1>颜色转换</h1>
        <p>HEX、RGB、HSL 实时互转,支持取色器选取。</p>
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <div className="color-preview" style={{ background: hex }} />
        <div style={{ marginBottom: 12 }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            style={{ width: '100%', height: 40, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </div>

        <div className="color-grid">
          <span>HEX</span>
          <input
            className="input"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
          />

          <span>RGB</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              type="number"
              value={rgb.r}
              onChange={(e) => updateRgb('r', e.target.value)}
              style={{ width: '33%' }}
            />
            <input
              className="input"
              type="number"
              value={rgb.g}
              onChange={(e) => updateRgb('g', e.target.value)}
              style={{ width: '33%' }}
            />
            <input
              className="input"
              type="number"
              value={rgb.b}
              onChange={(e) => updateRgb('b', e.target.value)}
              style={{ width: '33%' }}
            />
          </div>

          <span>HSL</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              type="number"
              value={hsl.h}
              onChange={(e) => updateHsl('h', e.target.value)}
              style={{ width: '33%' }}
            />
            <input
              className="input"
              type="number"
              value={hsl.s}
              onChange={(e) => updateHsl('s', e.target.value)}
              style={{ width: '33%' }}
            />
            <input
              className="input"
              type="number"
              value={hsl.l}
              onChange={(e) => updateHsl('l', e.target.value)}
              style={{ width: '33%' }}
            />
          </div>

          <span>CSS</span>
          <input
            className="input"
            readOnly
            value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) · hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
          />
        </div>
      </div>
    </>
  );
}
