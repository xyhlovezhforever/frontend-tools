import { Link } from 'react-router-dom';

const GROUPS = [
  {
    label: '数据处理',
    tools: [
      { to: '/json',       icon: '{}',  name: 'JSON 格式化',    desc: '格式化、压缩、语法高亮、树形预览' },
      { to: '/json-csv',   icon: '⇄',   name: 'JSON ↔ CSV',    desc: '数组与 CSV 双向互转，自动推断类型' },
      { to: '/base64',     icon: 'b64', name: 'Base64 编解码',  desc: '支持 UTF-8 中文的双向转换' },
      { to: '/url',        icon: 'url', name: 'URL 编解码',     desc: '组件模式与完整 URL 模式切换' },
      { to: '/regex',      icon: '.*',  name: '正则测试器',     desc: '实时高亮匹配，捕获组，8 种预设' },
      { to: '/text-stats', icon: '≡',   name: '字符统计',       desc: '字数、字节、阅读时长等 11 项指标' },
      { to: '/diff',       icon: '±',   name: '文本差异对比',   desc: '逐行 Diff，高亮增删，统一/分栏视图' },
    ],
  },
  {
    label: '转换工具',
    tools: [
      { to: '/timestamp',   icon: 'ts',  name: '时间戳转换',    desc: '秒/毫秒与日期字符串互转，实时时钟' },
      { to: '/color',       icon: '#',   name: '颜色转换',      desc: 'HEX / RGB / HSL 实时互转，取色器' },
      { to: '/number-base', icon: '0x',  name: '进制转换',      desc: '二/八/十/十六进制互转，ASCII 速查' },
      { to: '/css-unit',    icon: 'px',  name: 'CSS 单位转换',  desc: 'px / rem / em / vw / vh / pt 互转' },
    ],
  },
  {
    label: '安全 / 编码',
    tools: [
      { to: '/jwt',      icon: 'jwt', name: 'JWT 解析',      desc: '解码 Header/Payload，校验过期时间' },
      { to: '/hash',     icon: '#h',  name: 'Hash 生成',     desc: 'SHA-1/256/384/512，支持文本和文件' },
      { to: '/uuid',     icon: 'uid', name: 'UUID / ULID',   desc: 'v4 / v7 / ULID / Nano ID 批量生成' },
      { to: '/password', icon: '***', name: '密码生成器',    desc: 'CSPRNG 高强度密码，自定义规则，强度评估' },
    ],
  },
  {
    label: '生成 / 预览',
    tools: [
      { to: '/image',    icon: 'img', name: '图片压缩',       desc: '本地压缩 JPG/PNG/WebP，数据不上传' },
      { to: '/qrcode',   icon: 'qr',  name: '二维码生成',     desc: '可调尺寸、纠错等级、前后景色' },
      { to: '/favicon',  icon: 'ico', name: 'Favicon 生成',   desc: '文字图标，多尺寸 PNG 导出' },
      { to: '/lorem',    icon: 'Lm',  name: 'Lorem Ipsum',    desc: '英文/中文/混合占位文本，按词/句/段落' },
      { to: '/markdown', icon: 'md',  name: 'Markdown 预览',  desc: 'GFM + Mermaid 图表，分栏编辑' },
    ],
  },
  {
    label: '查询 / 参考',
    tools: [
      { to: '/http-status', icon: '4○',  name: 'HTTP 状态码',   desc: '收录 59 个状态码，中文说明，支持搜索' },
      { to: '/cron',        icon: '⏰',  name: 'Cron 解析',     desc: '解析 5 字段 Cron，展示下次执行时间' },
    ],
  },
];

export default function Home() {
  const total = GROUPS.reduce((s, g) => s + g.tools.length, 0);

  return (
    <>
      <div className="home-hero">
        <div className="home-hero-text">
          <h1>前端<span>工具箱</span></h1>
          <p>
            {total} 个常用开发工具，全部在浏览器本地运行。<br />
            无需安装、无需登录，数据不会上传到任何服务器。
          </p>
        </div>
        <div className="home-hero-badge">
          <span className="badge green">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#10b981" /></svg>
            数据本地处理
          </span>
          <span className="badge purple">{total} 个工具</span>
          <span className="badge">纯前端 · 无后端</span>
        </div>
      </div>

      {GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 28 }}>
          <div className="home-section-title">{g.label}</div>
          <div className="home-grid">
            {g.tools.map((t) => (
              <Link key={t.to} to={t.to} className="tool-card">
                <div className="icon-wrap">
                  <span className="icon">{t.icon}</span>
                </div>
                <div>
                  <h3>{t.name}</h3>
                  <p style={{ marginTop: 4 }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
