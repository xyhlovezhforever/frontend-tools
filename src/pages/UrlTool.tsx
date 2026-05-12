import { useState } from 'react';

type Mode = 'encode' | 'decode';

export default function UrlTool() {
  const [input, setInput] = useState('https://example.com/search?q=你好 世界&page=1');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [error, setError] = useState('');
  const [component, setComponent] = useState(true);

  const run = (text = input, m = mode, comp = component) => {
    setError('');
    try {
      if (m === 'encode') {
        setOutput(comp ? encodeURIComponent(text) : encodeURI(text));
      } else {
        setOutput(comp ? decodeURIComponent(text) : decodeURI(text));
      }
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const handleSwap = () => {
    const next: Mode = mode === 'encode' ? 'decode' : 'encode';
    setMode(next);
    setInput(output);
    setOutput('');
    run(output, next, component);
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  };

  const handleInputChange = (v: string) => {
    setInput(v);
    run(v, mode, component);
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    run(input, m, component);
  };

  const handleComponentChange = (c: boolean) => {
    setComponent(c);
    run(input, mode, c);
  };

  return (
    <>
      <div className="page-header">
        <h1>URL 编解码</h1>
        <p>encodeURIComponent / decodeURIComponent,支持完整 URL 模式与组件模式互切。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <button
            className={`btn ${mode === 'encode' ? 'btn-primary' : ''}`}
            onClick={() => handleModeChange('encode')}
          >
            编码 Encode
          </button>
          <button
            className={`btn ${mode === 'decode' ? 'btn-primary' : ''}`}
            onClick={() => handleModeChange('decode')}
          >
            解码 Decode
          </button>
          <button className="btn" onClick={handleSwap} title="互换输入输出并切换模式">
            ⇄ 互换
          </button>
          <span style={{ flex: 1 }} />
          <label className="label">
            <input
              type="checkbox"
              checked={component}
              onChange={(e) => handleComponentChange(e.target.checked)}
            />
            组件模式 (encodeURIComponent)
          </label>
        </div>

        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>输入</div>
            <textarea
              className="code-area"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="在此输入内容..."
              spellCheck={false}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              输出
              <button
                className="btn"
                style={{ marginLeft: 8, padding: '2px 10px', fontSize: 12 }}
                onClick={() => copy(output)}
                disabled={!output}
              >
                复制
              </button>
            </div>
            <textarea
              className="code-area"
              value={output}
              readOnly
              placeholder="结果将实时显示..."
              spellCheck={false}
            />
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <b>组件模式</b>:编码所有特殊字符(含 <code>/?#&=</code>),适合编码单个查询参数值。
          &nbsp;|&nbsp;
          <b>完整 URL 模式</b>:保留合法 URL 字符(如 <code>:/?#[]@!$&'()*+,;=</code>),适合整条 URL。
        </div>
      </div>
    </>
  );
}
