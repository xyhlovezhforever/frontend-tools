import { useMemo, useState } from 'react';

interface Stats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  linesNonEmpty: number;
  bytes: number;
  chineseCh: number;
  readMinutes: number;
  sentences: number;
  paragraphs: number;
  longestLine: number;
}

function calcStats(text: string): Stats {
  const lines = text.split('\n');
  const bytes = new TextEncoder().encode(text).length;
  const chineseCh = (text.match(/[一-鿿㐀-䶿]/g) ?? []).length;
  const words = (text.match(/\b\w+\b/g) ?? []).length + chineseCh;
  const sentences = (text.match(/[.!?。！？]+/g) ?? []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);
  const readMinutes = Math.max(1, Math.round(words / 200));
  const longestLine = Math.max(0, ...lines.map((l) => l.length));

  return {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words,
    lines: lines.length,
    linesNonEmpty: lines.filter((l) => l.trim()).length,
    bytes,
    chineseCh,
    readMinutes,
    sentences,
    paragraphs,
    longestLine,
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: '#f8f9ff',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

export default function TextStatsTool() {
  const [text, setText] = useState(
    '前端工具箱是一个纯前端、本地运行的工具集合。\n\n所有功能在浏览器中完成,数据不上传到任何服务器。支持 JSON 格式化、图片压缩、二维码生成等常用开发工具。\n\nThis is a frontend toolbox. All processing is done locally in the browser.',
  );

  const stats = useMemo(() => calcStats(text), [text]);

  return (
    <>
      <div className="page-header">
        <h1>字符统计</h1>
        <p>实时统计字数、行数、字节数、阅读时长等信息,支持中英文混排。</p>
      </div>

      <div className="panel">
        <textarea
          className="code-area"
          style={{ minHeight: 260 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴或输入文本..."
        />
      </div>

      <div
        className="panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        <StatCard label="总字符" value={stats.chars} />
        <StatCard label="去空格字符" value={stats.charsNoSpace} />
        <StatCard label="单词 / 中文字" value={stats.words} />
        <StatCard label="中文字" value={stats.chineseCh} />
        <StatCard label="句子" value={stats.sentences} />
        <StatCard label="段落" value={stats.paragraphs} />
        <StatCard label="总行数" value={stats.lines} />
        <StatCard label="非空行" value={stats.linesNonEmpty} />
        <StatCard label="最长行" value={`${stats.longestLine} 字符`} />
        <StatCard label="字节 (UTF-8)" value={`${stats.bytes} B`} />
        <StatCard label="预计阅读" value={`约 ${stats.readMinutes} 分钟`} />
      </div>
    </>
  );
}
