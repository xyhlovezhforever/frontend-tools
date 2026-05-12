import { useEffect, useMemo, useState } from 'react';

function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],])/g,
    (match, key, str, bool, nullVal, num, bracket) => {
      if (key) return `<span class="tk-key">${key}</span>`;
      if (str) return `<span class="tk-string">${str}</span>`;
      if (bool) return `<span class="tk-boolean">${bool}</span>`;
      if (nullVal) return `<span class="tk-null">${nullVal}</span>`;
      if (num) return `<span class="tk-number">${num}</span>`;
      if (bracket) return `<span class="tk-bracket">${bracket}</span>`;
      return match;
    },
  );
}

export default function JsonTool() {
  const [input, setInput] = useState<string>(
    '{\n  "name": "前端工具箱",\n  "version": 1,\n  "features": ["json", "image", "qrcode"],\n  "enabled": true\n}',
  );
  const [error, setError] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }, [input]);

  useEffect(() => {
    if (!input.trim()) {
      setError('');
      return;
    }
    try {
      JSON.parse(input);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  const apply = (next: string) => setInput(next);

  const handleFormat = () => {
    if (parsed === null) return;
    apply(JSON.stringify(parsed, null, indent));
  };

  const handleMinify = () => {
    if (parsed === null) return;
    apply(JSON.stringify(parsed));
  };

  const handleEscape = () => {
    apply(JSON.stringify(input));
  };

  const handleUnescape = () => {
    try {
      const v = JSON.parse(input);
      if (typeof v !== 'string') {
        setError('反转义需要输入是一个 JSON 字符串');
        return;
      }
      apply(v);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
    } catch {
      /* ignore */
    }
  };

  const handleClear = () => apply('');

  const previewHtml = useMemo(() => {
    if (parsed === null) return '';
    return highlightJson(JSON.stringify(parsed, null, 2));
  }, [parsed]);

  return (
    <>
      <div className="page-header">
        <h1>JSON 格式化 / 预览</h1>
        <p>格式化、压缩、转义,实时校验并彩色高亮预览。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <button className="btn btn-primary" onClick={handleFormat}>
            格式化
          </button>
          <button className="btn" onClick={handleMinify}>
            压缩
          </button>
          <button className="btn" onClick={handleEscape}>
            转义
          </button>
          <button className="btn" onClick={handleUnescape}>
            反转义
          </button>
          <button className="btn" onClick={handleCopy}>
            复制
          </button>
          <button className="btn btn-danger" onClick={handleClear}>
            清空
          </button>
          <span style={{ flex: 1 }} />
          <label className="label">
            缩进
            <select
              className="select"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
            </select>
          </label>
        </div>

        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              输入
            </div>
            <textarea
              className="code-area"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴 JSON..."
              spellCheck={false}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              预览
            </div>
            <div
              className="json-tree"
              dangerouslySetInnerHTML={{
                __html: error
                  ? ''
                  : previewHtml || '<span style="color:#9ca3af">输入 JSON 后在此预览...</span>',
              }}
            />
          </div>
        </div>

        {error && <div className="alert-error">解析错误:{error}</div>}
      </div>
    </>
  );
}
