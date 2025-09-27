import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '외과 및 응급의학 4지선다 퀴즈',
  description: 'quiz.md에 정리된 실제 문제와 해설을 그대로 제공하는 의학 4지선다형 퀴즈'
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
