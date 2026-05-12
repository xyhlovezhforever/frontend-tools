import { NavLink } from 'react-router-dom';

const GROUPS = [
  {
    label: '数据处理',
    items: [
      { to: '/json',       icon: '{}',  label: 'JSON 格式化'  },
      { to: '/json-csv',   icon: '⇄',   label: 'JSON ↔ CSV'  },
      { to: '/base64',     icon: 'b64', label: 'Base64'       },
      { to: '/url',        icon: 'url', label: 'URL 编解码'   },
      { to: '/regex',      icon: '.*',  label: '正则测试器'   },
      { to: '/text-stats', icon: '≡',   label: '字符统计'     },
      { to: '/diff',       icon: '±',   label: '文本差异对比' },
    ],
  },
  {
    label: '转换工具',
    items: [
      { to: '/timestamp',   icon: 'ts',  label: '时间戳转换'   },
      { to: '/color',       icon: '#',   label: '颜色转换'     },
      { to: '/number-base', icon: '0x',  label: '进制转换'     },
      { to: '/css-unit',    icon: 'px',  label: 'CSS 单位转换' },
    ],
  },
  {
    label: '安全 / 编码',
    items: [
      { to: '/jwt',      icon: 'jwt', label: 'JWT 解析'   },
      { to: '/hash',     icon: '#h',  label: 'Hash 生成'  },
      { to: '/uuid',     icon: 'uid', label: 'UUID / ULID' },
      { to: '/password', icon: '***', label: '密码生成器'  },
    ],
  },
  {
    label: '生成 / 预览',
    items: [
      { to: '/image',       icon: 'img', label: '图片压缩'      },
      { to: '/qrcode',      icon: 'qr',  label: '二维码生成'    },
      { to: '/favicon',     icon: 'ico', label: 'Favicon 生成'  },
      { to: '/lorem',       icon: 'Lm',  label: 'Lorem Ipsum'  },
      { to: '/markdown',    icon: 'md',  label: 'Markdown 预览' },
    ],
  },
  {
    label: '查询 / 参考',
    items: [
      { to: '/http-status', icon: '4○',  label: 'HTTP 状态码'   },
      { to: '/cron',        icon: '⏰',  label: 'Cron 解析'     },
    ],
  },
];

export default function Sidebar() {
  const total = GROUPS.reduce((s, g) => s + g.items.length, 0);
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">T</div>
        <div className="brand-text">
          <span className="brand-name">前端工具箱</span>
          <span className="brand-sub">{total} 个工具 · 纯本地</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <span className="nav-icon">~/</span>
          <span>首页</span>
        </NavLink>
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="nav-section">{g.label}</div>
            {g.items.map((item) => (
              <NavLink key={item.to} to={item.to}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="dot" />
        Local · No Upload · v1.0
      </div>
    </aside>
  );
}
