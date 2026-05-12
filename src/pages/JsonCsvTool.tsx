import { useState } from 'react';

function jsonToCSV(json: string): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error('JSON 必须是数组（每个元素为一行对象）');
  if (data.length === 0) return '';
  const keys = [...new Set(data.flatMap((row) => Object.keys(row as object)))];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = data.map((row) => keys.map((k) => escape((row as Record<string, unknown>)[k])).join(','));
  return [keys.join(','), ...rows].join('\n');
}

function csvToJSON(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV 至少需要标题行和一行数据');

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cells.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  };

  const headers = parseRow(lines[0]!);
  const rows = lines.slice(1).map((line) => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => {
      const v = vals[i] ?? '';
      const n = Number(v);
      return [h, v === '' ? null : !isNaN(n) && v !== '' ? n : v === 'true' ? true : v === 'false' ? false : v];
    }));
  });
  return JSON.stringify(rows, null, 2);
}

const DEMO_JSON = `[
  {"name":"Alice","age":28,"role":"admin","active":true},
  {"name":"Bob","age":34,"role":"user","active":false},
  {"name":"Carol","age":22,"role":"user","active":true}
]`;

const DEMO_CSV = `name,age,role,active
Alice,28,admin,true
Bob,34,user,false
Carol,22,user,true`;

export default function JsonCsvTool() {
  const [mode, setMode] = useState<'j2c' | 'c2j'>('j2c');
  const [input, setInput] = useState(DEMO_JSON);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = () => {
    setError('');
    try {
      setOutput(mode === 'j2c' ? jsonToCSV(input) : csvToJSON(input));
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const switchMode = (m: typeof mode) => {
    setMode(m);
    setInput(m === 'j2c' ? DEMO_JSON : DEMO_CSV);
    setOutput('');
    setError('');
  };

  const download = () => {
    if (!output) return;
    const ext = mode === 'j2c' ? 'csv' : 'json';
    const mime = mode === 'j2c' ? 'text/csv' : 'application/json';
    const blob = new Blob([output], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="page-header">
        <h1>JSON ↔ CSV 转换</h1>
        <p>JSON 数组与 CSV 双向互转，自动推断数字、布尔类型，支持下载。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <button className={`btn ${mode === 'j2c' ? 'btn-primary' : ''}`} onClick={() => switchMode('j2c')}>
            JSON → CSV
          </button>
          <button className={`btn ${mode === 'c2j' ? 'btn-primary' : ''}`} onClick={() => switchMode('c2j')}>
            CSV → JSON
          </button>
          <button className="btn" onClick={run}>转换</button>
          <button className="btn" onClick={download} disabled={!output}>下载</button>
          <button className="btn" onClick={() => output && navigator.clipboard.writeText(output)} disabled={!output}>复制结果</button>
        </div>

        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 8 }}>
              {mode === 'j2c' ? 'JSON 输入' : 'CSV 输入'}
            </div>
            <textarea
              className="code-area"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'j2c' ? '粘贴 JSON 数组...' : '粘贴 CSV 内容...'}
              spellCheck={false}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>
              {mode === 'j2c' ? 'CSV 输出' : 'JSON 输出'}
            </div>
            <textarea
              className="code-area"
              value={output}
              readOnly
              placeholder="点击「转换」后结果显示在这里..."
              spellCheck={false}
            />
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}
      </div>
    </>
  );
}
