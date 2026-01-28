'use client';

import { Header } from '@/components/layout/header';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7]">
      <Header />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
    </div>
  );
}
