"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VremeaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecționăm automat către București dacă cineva intră doar pe /vreme
    router.replace('/vreme/bucuresti');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400 font-bold animate-pulse">Se încarcă prognoza...</p>
    </div>
  );
}
