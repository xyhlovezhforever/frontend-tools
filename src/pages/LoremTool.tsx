import { useState } from 'react';

const WORDS_EN = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum`.split(' ');

const WORDS_ZH = `的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心力理样无远力`.split('');

type Lang = 'en' | 'zh' | 'mixed';
type Unit = 'words' | 'sentences' | 'paragraphs';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sentence(lang: Lang, wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    if (lang === 'en') words.push(WORDS_EN[rand(0, WORDS_EN.length - 1)]!);
    else if (lang === 'zh') words.push(WORDS_ZH[rand(0, WORDS_ZH.length - 1)]!);
    else words.push(Math.random() > 0.5 ? WORDS_EN[rand(0, WORDS_EN.length - 1)]! : WORDS_ZH[rand(0, WORDS_ZH.length - 1)]!);
  }
  const sep = lang === 'en' ? ' ' : '';
  const text = words.join(sep);
  const punct = lang === 'zh' ? '。' : '.';
  return text.charAt(0).toUpperCase() + text.slice(1) + punct;
}

function generate(lang: Lang, unit: Unit, count: number, startLorem: boolean): string {
  if (unit === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      if (lang === 'en') words.push(WORDS_EN[rand(0, WORDS_EN.length - 1)]!);
      else if (lang === 'zh') words.push(WORDS_ZH[rand(0, WORDS_ZH.length - 1)]!);
      else words.push(Math.random() > 0.5 ? WORDS_EN[rand(0, WORDS_EN.length - 1)]! : WORDS_ZH[rand(0, WORDS_ZH.length - 1)]!);
    }
    const sep = lang === 'zh' ? '' : ' ';
    let text = words.join(sep);
    if (startLorem && lang !== 'zh') text = 'Lorem ipsum dolor sit amet ' + text;
    return text;
  }
  if (unit === 'sentences') {
    const sents = Array.from({ length: count }, () => sentence(lang, rand(8, 18)));
    if (startLorem && lang !== 'zh') sents[0] = 'Lorem ipsum dolor sit amet consectetur adipiscing elit.';
    return sents.join(' ');
  }
  // paragraphs
  const paras = Array.from({ length: count }, () => {
    const sents = Array.from({ length: rand(3, 6) }, () => sentence(lang, rand(8, 18)));
    return sents.join(lang === 'zh' ? '' : ' ');
  });
  if (startLorem && lang !== 'zh') paras[0] = 'Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + paras[0];
  return paras.join('\n\n');
}

export default function LoremTool() {
  const [lang, setLang] = useState<Lang>('en');
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [count, setCount] = useState(3);
  const [startLorem, setStartLorem] = useState(true);
  const [output, setOutput] = useState(() => generate('en', 'paragraphs', 3, true));
  const [copied, setCopied] = useState(false);

  const gen = (l = lang, u = unit, c = count, s = startLorem) => {
    setOutput(generate(l, u, c, s));
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const charCount = output.length;

  return (
    <>
      <div className="page-header">
        <h1>Lorem Ipsum 生成器</h1>
        <p>生成占位文本，支持英文、中文、混合，可按词/句/段落控制数量。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          {(['en', 'zh', 'mixed'] as Lang[]).map((l) => (
            <button key={l} className={`btn ${lang === l ? 'btn-primary' : ''}`}
              onClick={() => { setLang(l); gen(l); }}>
              {{ en: '英文', zh: '中文', mixed: '混合' }[l]}
            </button>
          ))}
          <span style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', margin: '0 4px' }} />
          {(['words', 'sentences', 'paragraphs'] as Unit[]).map((u) => (
            <button key={u} className={`btn ${unit === u ? 'btn-primary' : ''}`}
              onClick={() => { setUnit(u); gen(lang, u); }}>
              {{ words: '词', sentences: '句子', paragraphs: '段落' }[u]}
            </button>
          ))}
          <input className="input" type="number" min={1} max={100} value={count} style={{ width: 64 }}
            onChange={(e) => { const v = Math.max(1, Math.min(100, Number(e.target.value))); setCount(v); gen(lang, unit, v); }} />
          <label className="label" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={startLorem} onChange={(e) => { setStartLorem(e.target.checked); gen(lang, unit, count, e.target.checked); }} />
            以 Lorem ipsum 开头
          </label>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={() => gen()}>重新生成</button>
          <button className={`btn ${copied ? 'btn-primary' : ''}`} onClick={copy}>
            {copied ? '已复制 ✓' : '复制'}
          </button>
        </div>

        <textarea
          className="code-area"
          style={{ minHeight: 320, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          spellCheck={false}
        />

        <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{wordCount} 词</span>
          <span>{charCount} 字符</span>
          <span>{output.split('\n\n').filter(Boolean).length} 段落</span>
        </div>
      </div>
    </>
  );
}
