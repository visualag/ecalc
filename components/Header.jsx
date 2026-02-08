'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, CloudSun, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [userWeather, setUserWeather] = useState(null);

  useEffect(() => {
    async function getLocalWeather() {
      try {
        // Detectam locatia dupa IP
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        const city = ipData.city || 'Bucuresti';

        // Luam temperatura pentru locatia respectiva
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current=temperature_2m,is_day&timezone=auto`);
        const weatherData = await weatherRes.json();

        setUserWeather({
          city: city,
          temp: Math.round(weatherData.current.temperature_2m),
          isDay: weatherData.current.is_day,
          slug: city.toLowerCase().replace(/\s+/g, '-')
        });
      } catch (err) {
        console.error("Vremea locala nu a putut fi incarcata");
      }
    }
    getLocalWeather();
  }, []);

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">eCalc.ro</h1>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mt-1">Calculatoare Fiscale</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Buton Vreme Dinamic */}
            <Link href={userWeather ? `/vreme/${userWeather.slug}` : '/vreme/bucuresti'}>
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 border-2 flex items-center gap-2 px-3">
                {userWeather ? (
                  <>
                    {userWeather.isDay ? <Sun className="h-4 w-4 text-yellow-500 animate-pulse" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                    <span className="hidden sm:inline font-bold">{userWeather.city}:</span> 
                    <span className="font-black text-blue-400">{userWeather.temp}°</span>
                  </>
                ) : (
                  <>
                    <CloudSun className="h-4 w-4 text-blue-400" />
                    <span className="font-bold">Vremea</span>
                  </>
                )}
              </Button>
            </Link>

            {/* Butoane Navigatie */}
            <Link href="/">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold hidden sm:flex">
                Calculatoare
              </Button>
            </Link>
            
            <Link href="/admin-pro">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Admin Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
