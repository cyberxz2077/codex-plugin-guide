import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://codex-plugin-guide.cyberxz2077.chatgpt.site/'),
  title: 'Codex 插件指南｜全量目录',
  description: '用中文浏览 Codex 插件市场的全部公开插件，按分类和任务检索并生成安全的安装 Prompt。',
  openGraph: {
    title: 'Codex 插件指南｜全量目录',
    description: '浏览 Codex 插件市场全部公开插件，了解用途与组成，再决定装什么。',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1672,
        height: 941,
        alt: 'Codex 插件指南',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codex 插件指南｜全量目录',
    description: '先了解插件用途，再决定装什么。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
