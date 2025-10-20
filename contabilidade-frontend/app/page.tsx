import React from 'react';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-primary">
        Olá, sistema de gestão!
        <Header />
      </h1>
    </main>
  );
}
