import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Codex 插件指南｜中文精选',
  description: '用中文了解 Codex 插件用途，按任务筛选并生成安全的安装 Prompt。',
  openGraph: {
    title: 'Codex 插件指南｜中文精选',
    description: '先说你要做什么，再决定装什么。用中文筛选插件并生成安装 Prompt。',
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
    title: 'Codex 插件指南｜中文精选',
    description: '先说你要做什么，再决定装什么。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
