import { useState } from 'react';

function utf8Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function utf8Decode(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [text, setText] = useState('Hello, 前端工具箱');
  const [b64, setB64] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setB64(utf8Encode(text));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDecode = () => {
    try {
      setText(utf8Decode(b64.trim()));
      setError('');
    } catch (e) {
      setError('Base64 解码失败:' + (e as Error).message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Base64 编解码</h1>
        <p>支持 UTF-8 中文,文本与 Base64 双向转换。</p>
      </div>

      <div className="panel">
        <div className="row">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              原始文本
            </div>
            <textarea
              className="code-area"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此输入原始文本..."
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              Base64
            </div>
            <textarea
              className="code-area"
              value={b64}
              onChange={(e) => setB64(e.target.value)}
              placeholder="在此粘贴 Base64..."
            />
          </div>
        </div>

        <div className="toolbar" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={handleEncode}>
            ↓ 编码 (文本 → Base64)
          </button>
          <button className="btn" onClick={handleDecode}>
            ↑ 解码 (Base64 → 文本)
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}
      </div>
    </>
  );
}
