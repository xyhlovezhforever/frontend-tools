import { useEffect, useState } from 'react';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimestampTool() {
  const [now, setNow] = useState(Date.now());
  const [tsInput, setTsInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [tsUnit, setTsUnit] = useState<'s' | 'ms'>('s');
  const [dateInput, setDateInput] = useState(fmt(new Date()));
  const [tsResult, setTsResult] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleTsToDate = () => {
    try {
      const n = Number(tsInput);
      if (!Number.isFinite(n)) throw new Error('请输入数字');
      const ms = tsUnit === 's' ? n * 1000 : n;
      setTsResult(fmt(new Date(ms)));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDateToTs = () => {
    const d = new Date(dateInput.replace(/-/g, '/'));
    if (Number.isNaN(d.getTime())) {
      setError('无效的日期格式,请使用 YYYY-MM-DD HH:mm:ss');
      return;
    }
    setDateResult(`秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`);
    setError('');
  };

  return (
    <>
      <div className="page-header">
        <h1>时间戳转换</h1>
        <p>当前时间戳 (秒): {Math.floor(now / 1000)} · (毫秒): {now}</p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>时间戳 → 日期</h3>
        <div className="toolbar">
          <input
            className="input"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            style={{ width: 200 }}
            placeholder="时间戳"
          />
          <select
            className="select"
            value={tsUnit}
            onChange={(e) => setTsUnit(e.target.value as 's' | 'ms')}
          >
            <option value="s">秒</option>
            <option value="ms">毫秒</option>
          </select>
          <button className="btn btn-primary" onClick={handleTsToDate}>
            转换
          </button>
          {tsResult && (
            <span className="label" style={{ fontFamily: 'Consolas, monospace' }}>
              → {tsResult}
            </span>
          )}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>日期 → 时间戳</h3>
        <div className="toolbar">
          <input
            className="input"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            style={{ width: 220 }}
            placeholder="YYYY-MM-DD HH:mm:ss"
          />
          <button className="btn btn-primary" onClick={handleDateToTs}>
            转换
          </button>
        </div>
        {dateResult && (
          <pre style={{ margin: 0, fontFamily: 'Consolas, monospace', fontSize: 13 }}>
            {dateResult}
          </pre>
        )}
        {error && <div className="alert-error">{error}</div>}
      </div>
    </>
  );
}
