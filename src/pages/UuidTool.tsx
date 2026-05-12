import { useState } from 'react';

/* ---------- UUID v4 ---------- */
function uuidv4(): string {
  return crypto.randomUUID();
}

/* ---------- UUID v7 (time-ordered) ---------- */
function uuidv7(): string {
  const now = BigInt(Date.now());
  const ms = now & 0xffffffffffffn;
  const rnd = crypto.getRandomValues(new Uint8Array(10));
  // version 7 layout: 48-bit unix-ts-ms | 4-bit ver=7 | 12-bit rand | 2-bit var | 62-bit rand
  const hi = (ms << 16n) | 0x7000n | BigInt(rnd[0]! & 0x0f) << 8n | BigInt(rnd[1]!);
  const lo = 0x8000000000000000n | (BigInt(rnd[2]! & 0x3f) << 56n) |
    (BigInt(rnd[3]!) << 48n) | (BigInt(rnd[4]!) << 40n) |
    (BigInt(rnd[5]!) << 32n) | (BigInt(rnd[6]!) << 24n) |
    (BigInt(rnd[7]!) << 16n) | (BigInt(rnd[8]!) << 8n) | BigInt(rnd[9]!);
  const hex = hi.toString(16).padStart(16, '0') + lo.toString(16).padStart(16, '0');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/* ---------- ULID ---------- */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function ulid(): string {
  const now = Date.now();
  let t = now;
  let ts = '';
  for (let i = 9; i >= 0; i--) {
    ts = ENCODING[t % 32]! + ts;
    t = Math.floor(t / 32);
  }
  let rand = '';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let bits = 0n;
  for (const b of bytes) bits = (bits << 8n) | BigInt(b);
  for (let i = 0; i < 16; i++) {
    rand = ENCODING[Number(bits % 32n)]! + rand;
    bits /= 32n;
  }
  return ts + rand;
}

/* ---------- Nano ID ---------- */
const NANO_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function nanoid(size = 21): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).map((b) => NANO_ALPHA[b % 64]!).join('');
}

type Format = 'uuidv4' | 'uuidv7' | 'ulid' | 'nanoid';

function generate(fmt: Format, nanoLen: number): string {
  switch (fmt) {
    case 'uuidv4':  return uuidv4();
    case 'uuidv7':  return uuidv7();
    case 'ulid':    return ulid();
    case 'nanoid':  return nanoid(nanoLen);
  }
}

const FORMAT_INFO: Record<Format, { label: string; desc: string; example: string }> = {
  uuidv4:  { label: 'UUID v4', desc: '128-bit 随机，RFC 4122 标准，最通用', example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' },
  uuidv7:  { label: 'UUID v7', desc: '时间有序（毫秒级），B-tree 索引友好，推荐作数据库主键', example: '018xxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx' },
  ulid:    { label: 'ULID',    desc: '26 字符、时间有序、字典序可排、大小写不敏感', example: '01ARYZ6S41TPTWGI81G0' },
  nanoid:  { label: 'Nano ID', desc: '短且 URL 安全，可自定义长度，碰撞率极低', example: 'V1StGXR8_Z5jdHi6B-myT' },
};

export default function UuidTool() {
  const [fmt, setFmt] = useState<Format>('uuidv4');
  const [count, setCount] = useState(10);
  const [nanoLen, setNanoLen] = useState(21);
  const [upper, setUpper] = useState(false);
  const [hyphen, setHyphen] = useState(true);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 10 }, () => generate('uuidv4', 21)));

  const gen = (f = fmt, c = count, nl = nanoLen) => {
    setIds(Array.from({ length: c }, () => generate(f, nl)));
  };

  const post = (id: string) => {
    let s = id;
    if (!hyphen && (fmt === 'uuidv4' || fmt === 'uuidv7')) s = s.replace(/-/g, '');
    return upper ? s.toUpperCase() : s.toLowerCase();
  };

  const copyAll = () => navigator.clipboard.writeText(ids.map(post).join('\n'));

  return (
    <>
      <div className="page-header">
        <h1>UUID / ULID 生成器</h1>
        <p>生成 UUID v4、UUID v7、ULID、Nano ID，批量生成可一键复制。</p>
      </div>

      {/* 格式选择 */}
      <div className="panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {(Object.keys(FORMAT_INFO) as Format[]).map((f) => (
            <div key={f} onClick={() => { setFmt(f); gen(f); }}
              style={{
                padding: '12px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                border: `1.5px solid ${fmt === f ? 'var(--accent-border)' : 'var(--border)'}`,
                background: fmt === f ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                transition: 'all var(--ease)',
              }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: fmt === f ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>
                {FORMAT_INFO[f].label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{FORMAT_INFO[f].desc}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-placeholder)', marginTop: 6 }}>
                {FORMAT_INFO[f].example}
              </div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <label className="label">
            数量
            <input className="input" type="number" min={1} max={1000} value={count} style={{ width: 72 }}
              onChange={(e) => { const v = Math.max(1, Math.min(1000, Number(e.target.value))); setCount(v); gen(fmt, v); }} />
          </label>
          {fmt === 'nanoid' && (
            <label className="label">
              长度
              <input className="input" type="number" min={4} max={128} value={nanoLen} style={{ width: 72 }}
                onChange={(e) => { const v = Math.max(4, Math.min(128, Number(e.target.value))); setNanoLen(v); gen(fmt, count, v); }} />
            </label>
          )}
          {(fmt === 'uuidv4' || fmt === 'uuidv7') && (
            <label className="label" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={hyphen} onChange={(e) => setHyphen(e.target.checked)} />
              带连字符
            </label>
          )}
          <label className="label" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
            大写
          </label>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={() => gen()}>重新生成</button>
          <button className="btn btn-primary" onClick={copyAll}>复制全部</button>
        </div>

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {ids.map((id, i) => (
            <div key={i}
              onClick={() => navigator.clipboard.writeText(post(id))}
              style={{
                padding: '6px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                color: 'var(--text)', background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                transition: 'background var(--ease)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              title="点击复制">
              <span>{post(id)}</span>
              <span style={{ fontSize: 10, color: 'var(--text-placeholder)', flexShrink: 0 }}>点击复制</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
