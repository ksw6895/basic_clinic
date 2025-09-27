import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '외과 및 응급의학 4지선다 퀴즈',
  description: 'knowledge.json 기반 카테고리별 4지선다형 의학 퀴즈'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
