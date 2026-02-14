"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CloudSun, Wind, Droplets, Sun, Eye, Gauge, Umbrella, Thermometer, Search, Info, Snowflake, Triangle, Sunrise, Sunset, Cloud, CloudRain, CloudLightning, ThermometerSun, Waves, Cloudy, MapPin, Activity, Moon } from 'lucide-react';
import { generateSEOStory } from '@/lib/seo-story-engine';
import { ROMANIA_COUNTIES } from '@/lib/counties-data';

const getWeatherIcon = (code, isNight = false) => {
  const iconClass = "h-6 w-6 transition-all duration-300";
  if (isNight) return <Moon className={`${iconClass} text-slate-400 animate-pulse`} />;
  if (code === 0) return <Sun className={`${iconClass} text-yellow-500 hover:rotate-90`} />;
  if (code <= 3) return <CloudSun className={`${iconClass} text-blue-400`} />;
  if (code <= 48) return <Cloudy className={`${iconClass} text-slate-400`} />;
  if (code <= 67) return <CloudRain className={`${iconClass} text-blue-500`} />;
  if (code <= 99) return <CloudLightning className={`${iconClass} text-indigo-600`} />;
  return <CloudSun className={`${iconClass} text-slate-400`} />;
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
};

export default function WeatherView({ weather, nearbyPlaces, ORASE_PRINCIPALE, MOUNTAIN_RESORTS_ZONES, ALL_COASTAL_RESORTS, VARFURI_MUNTE }) {
  const router = useRouter();
  const [cityInput, setCityInput] = useState('');
  const [theme, setTheme] = useState('white');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('weather-theme='))?.split('=')[1];
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.cookie = `weather-theme=${newTheme}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const handleSearch = () => {
    if (cityInput) router.push(`/vreme/${cityInput.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const currentTemp = Math.round(weather.current.temperature_2m);
  const isHot = currentTemp > 30;
  const isCold = currentTemp < 5;

  return (
    <div className="space-y-4">
      {/* Animated Background Definition */}
      <style jsx global>{`
        .weather-module {
          font-family: 'Inter', sans-serif !important;
        }
        @keyframes subtle-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .md3-card-light {
          background: #ffffff;
          border: 1px solid #f1f5f9;
        }
        .text-md3-navy {
          color: #1e293b;
        }
        .temp-display {
          font-weight: 200;
          letter-spacing: -0.05em;
        }
      `}</style>

      <div className="weather-module space-y-4">
        {/* Search Bar - MD3 Compact */}
        <div className={`p-1 rounded-[6px] shadow-sm border flex gap-1 mb-4 ${theme === 'blue' ? 'bg-[#242b3a] border-[#374151]' : 'bg-white border-slate-100'}`}>
          <label htmlFor="city-search" className="sr-only">Cauta localitate</label>
          <input
            id="city-search"
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cauta alt oras..."
            className={`flex-1 px-4 outline-none font-medium text-sm rounded ${theme === 'blue' ? 'bg-[#1a1d2d] text-white placeholder-slate-500' : 'bg-transparent text-slate-700 placeholder-slate-400'}`}
          />
          <button
            onClick={handleSearch}
            aria-label="Cauta"
            className="bg-blue-600 text-white px-4 py-1.5 rounded-[4px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Cauta</span>
          </button>
        </div>

        {theme === 'blue' ? (
          /* METEOBLUE DARK THEME */
          <div className="bg-[#171b28] text-white p-6 rounded-[8px] shadow-xl overflow-x-hidden font-sans">
            {/* Header: Title & Current compact */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-4xl font-bold">Vremea</h1>
                <p className="text-slate-400 text-sm mt-1">Județul {weather.region}, România</p>
                <div className="flex gap-2 mt-4">
                  {['white', 'blue', 'grey'].map((t) => (
                    <button
                      key={t}
                      onClick={() => changeTheme(t)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${theme === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Sun className="h-12 w-12 text-yellow-400" />
                <div className="text-right">
                  <p className="text-5xl font-light">{currentTemp}°C</p>
                  <p className="text-sm text-slate-400">{weather.current.wind_speed_10m} km/h | {new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-lg overflow-hidden border border-slate-800 mb-8">
              {weather.daily.time.slice(0, 7).map((time, i) => {
                const date = new Date(time);
                const dayName = date.toLocaleDateString('ro-RO', { weekday: 'short' }).toUpperCase();
                const dayDate = date.getDate() + '/' + (date.getMonth() + 1);
                const maxTemp = Math.round(weather.daily.temperature_2m_max[i]);
                const minTemp = Math.round(weather.daily.temperature_2m_min[i]);
                const precipProb = weather.daily.precipitation_probability_max[i];

                return (
                  <div key={time} className="bg-[#242b3a] flex flex-col items-center py-4 px-2 hover:bg-[#2d3548] transition-colors group cursor-pointer relative">
                    <div className="text-center mb-4">
                      <p className="text-[11px] font-bold text-slate-300">{dayName}</p>
                      <p className="text-[10px] text-slate-500">{i === 0 ? 'Astăzi' : i === 1 ? 'Mâine' : dayDate}</p>
                    </div>

                    <div className="h-12 w-12 flex items-center justify-center mb-4">
                      {getWeatherIcon(weather.daily.weather_code[i])}
                    </div>

                    <div className="space-y-1 mb-4 w-full">
                      <div className="bg-[#4caf50] text-[#1a1d2d] text-center rounded-[4px] py-1 text-xs font-bold shadow-sm">{maxTemp}°C</div>
                      <div className="bg-[#2e7d32] text-white text-center rounded-[4px] py-1 text-xs font-bold shadow-sm">{minTemp}°C</div>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-2 mt-auto w-full border-t border-slate-700/50 pt-3">
                      <div className="flex items-center justify-center gap-1">
                        <Triangle className="h-2 w-2 rotate-180 fill-current opacity-50" />
                        <span>{weather.daily.wind_speed_10m_max[i]} km/h</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-2 w-2 text-blue-400" />
                        <span>{precipProb}%</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Sun className="h-2 w-2 text-yellow-500" />
                        <span>{Math.round(weather.daily.sunshine_duration[i] / 3600)} h</span>
                      </div>
                    </div>

                    {/* Predictability icons - 4 static circles */}
                    <div className="flex justify-center gap-1 mt-4 opacity-30">
                      {[1, 2, 3, 4].map(n => <Activity key={n} className="h-2.5 w-2.5" />)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hourly Detail Mock Section */}
            <div className="bg-[#242b3a] rounded-lg p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Prognoza detaliată</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                  <span className="text-blue-500 underline cursor-pointer">3h</span>
                  <div className="w-8 h-4 bg-blue-600 rounded-full relative"><div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div></div>
                  <span className="text-slate-500">1h</span>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {weather.hourly.time.slice(0, 8).map((time, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-bold">{new Date(time).getHours()}⁰⁰</span>
                    <div className="scale-75">{getWeatherIcon(weather.hourly.weather_code[i])}</div>
                    <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded">{Math.round(weather.hourly.temperature_2m[i])}°</span>
                    <span className="text-[9px] text-slate-500">{Math.round(weather.hourly.apparent_temperature[i])}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800 pt-8">
              <div className="flex items-center gap-4">
                <Sunrise className="h-8 w-8 text-orange-400 opacity-60" />
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Răsărit / Apus</p>
                  <p className="text-xs font-bold">{formatTime(weather.daily.sunrise[0])} - {formatTime(weather.daily.sunset[0])}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-500/10 rounded flex items-center justify-center">
                  <Sun className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Index UV</p>
                  <p className="text-xs font-bold">{weather.daily.uv_index_max[0]} (Moderat)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-blue-500 opacity-60" />
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Presiune</p>
                  <p className="text-xs font-bold">{Math.round(weather.current.surface_pressure)} hPa</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ORIGINAL MD3 THEME */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Card - Split Layout */}
            <div className="lg:col-span-8 rounded-[6px] p-8 md3-card-light shadow-sm relative overflow-hidden flex flex-col min-h-[440px]">
              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h1 className="text-5xl font-extrabold mb-1 tracking-tight uppercase text-slate-900">{weather.cityName}</h1>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 bg-blue-600 rounded-full"></div>
                      <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">
                        JUDETUL {weather.region} • {currentYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'white', label: 'Alb' },
                      { id: 'blue', label: 'Blue' },
                      { id: 'grey', label: 'Grey' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => changeTheme(t.id)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${theme === t.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center flex-grow">
                  {/* Left: Temp & Basic Info */}
                  <div className="md:col-span-5 flex flex-col justify-center border-r border-slate-50 pr-8">
                    <div className="relative mb-6">
                      <span className="text-[140px] leading-none temp-display text-slate-900 block translate-x-[-10px]">
                        {currentTemp}°
                      </span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] leading-relaxed">
                        PROGNOZĂ: {Math.round(weather.current.apparent_temperature)}°C REALFEEL
                      </p>
                      <div className="flex items-center gap-4 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        <span className="opacity-40">MIN: {Math.round(weather.daily.temperature_2m_min[0])}°</span>
                        <span className="opacity-40">MAX: {Math.round(weather.daily.temperature_2m_max[0])}°</span>
                      </div>
                      {/* Sunrise/Sunset at bottom of left column */}
                      <div className="flex gap-8 pt-4">
                        <div className="flex items-center gap-3">
                          <Sunrise className="h-4 w-4 text-orange-400" />
                          <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">RĂSĂRIT</p>
                            <p className="text-xs font-black text-slate-800">{formatTime(weather.daily.sunrise?.[0])}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Sunset className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">APUS</p>
                            <p className="text-xs font-black text-slate-800">{formatTime(weather.daily.sunset?.[0])}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: 12 Indicators */}
                  <div className="md:col-span-7 grid grid-cols-3 gap-x-6 gap-y-10">
                    {[
                      { l: 'Vânt', v: `${weather.current.wind_speed_10m} km/h`, i: Wind },
                      { l: 'Umiditate', v: `${weather.current.relative_humidity_2m}%`, i: Droplets },
                      { l: 'UV Max', v: weather.daily.uv_index_max[0], i: Sun },
                      { l: 'Aer (AQI)', v: weather.hourly.pm10[0] > 50 ? 'Moderat' : 'Excelent', i: Gauge },
                      { l: 'Presiune', v: `${Math.round(weather.current.surface_pressure)}hPa`, i: Activity },
                      { l: 'Sanse Pl.', v: `${weather.daily.precipitation_probability_max[0]}%`, i: Umbrella },
                      { l: 'Vizibilitate', v: `${weather.current.visibility / 1000}km`, i: Eye },
                      { l: 'Punct Rouă', v: `${Math.round(weather.current.dew_point_2m)}°`, i: Droplets },
                      { l: 'Noros', v: `${weather.current.cloud_cover}%`, i: Cloudy },
                      { l: 'Precipitații', v: `${weather.daily.precipitation_sum[0]}mm`, i: CloudRain },
                      { l: 'Meteo Max', v: `${Math.round(weather.daily.temperature_2m_max[0])}°`, i: ThermometerSun },
                      { l: 'Valuri', v: '0.4m', i: Waves },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <item.i className="h-4 w-4 text-blue-600 opacity-80" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">{item.l}</span>
                        </div>
                        <p className="text-[17px] font-black text-slate-800 tracking-tight leading-none">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Hourly Forecast */}
            <div className="lg:col-span-4">
              <section className="bg-white p-3 rounded-[6px] border border-slate-100 shadow-sm h-full flex flex-col">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] mb-2 flex items-center gap-3">
                  <div className="p-1 px-2 bg-blue-50 rounded-full"><Activity className="h-3 w-3 text-blue-600" /></div>
                  EVOLUȚIE ORARĂ
                </h2>
                <div className="grid grid-cols-6 gap-x-1 gap-y-1 flex-grow content-start">
                  {weather.hourly.time.slice(0, 24).map((time, index) => {
                    const hour = new Date(time).getHours();
                    const tempValue = Math.round(weather.hourly.temperature_2m[index]);
                    const isNight = hour < 6 || hour > 20;
                    const isCurrentHour = index === 0;

                    return (
                      <div key={time} className={`flex flex-col items-center py-1 rounded-[4px] border ${isCurrentHour ? 'border-blue-200 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}>
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{hour}:00</span>
                        <div className="mb-0.5 transform scale-[0.75]">
                          {getWeatherIcon(weather.hourly.weather_code[index], isNight)}
                        </div>
                        <span className="text-[12px] font-extrabold text-slate-900">{tempValue}°</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {generateSEOStory(weather.cityName, weather, currentYear)}

      {/* Footer Design Fixes - Balanced & Full Width */}
      <footer className="mt-6 space-y-2">
        <div className="flex flex-col lg:flex-row gap-2 items-stretch">
          {/* Top 3 boxes with forced stretch */}
          <div className="bg-white p-4 rounded-[6px] border border-slate-100 flex-1 flex flex-col shadow-sm">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 border-b border-slate-50 pb-1 flex items-center gap-2">
              <div className="h-3 w-1 bg-blue-600 rounded-full"></div>
              REȘEDINȚE DE JUDEȚ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 grid-flow-row">
              {ORASE_PRINCIPALE.map(oras => (
                <a key={oras} href={`/vreme/${oras.toLowerCase().replace(/\s+/g, '-')}`} className="text-[9px] font-bold text-slate-500 hover:text-blue-600 truncate bg-slate-50 hover:bg-white px-2 py-1.5 rounded-[2px] border border-transparent hover:border-blue-100 transition-all">
                  {oras}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-[6px] border border-slate-100 flex-1 flex flex-col shadow-sm">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 border-b border-slate-50 pb-1 flex items-center gap-2">
              <div className="h-3 w-1 bg-blue-600 rounded-full"></div>
              STAȚIUNI MONTANE
            </h3>
            <div className="flex flex-col gap-1">
              {MOUNTAIN_RESORTS_ZONES.map((zone, zIdx) => (
                <div key={zIdx} className="space-y-0.5">
                  <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded inline-block">{zone.zone}</p>
                  <div className="flex flex-wrap gap-0.5">
                    {zone.items.map(item => (
                      <a key={item.slug} href={`/vreme/${item.slug}`} className="text-[9px] font-extrabold text-slate-600 hover:text-white hover:bg-blue-600 bg-white px-1.5 py-0.5 rounded-[2px] transition-all border border-slate-100 shadow-sm">
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-white p-4 rounded-[6px] border border-slate-100 flex-1 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 border-b border-slate-50 pb-1 flex items-center gap-2">
                <div className="h-3 w-1 bg-blue-600 rounded-full"></div>
                LITORAL ROMÂNESC
              </h3>
              <div className="flex flex-wrap gap-1">
                {ALL_COASTAL_RESORTS.map(s => (
                  <a key={s.slug} href={`/vreme/${s.slug}`} className="text-[9px] font-bold text-blue-700 bg-blue-50/50 px-2 py-1 rounded-[2px] border border-blue-50 hover:bg-blue-600 hover:text-white transition-all">
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-[6px] border border-slate-100 flex-1 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 border-b border-slate-50 pb-1 flex items-center gap-2">
                <div className="h-3 w-1 bg-blue-600 rounded-full"></div>
                VÂRFURI +2500M
              </h3>
              <div className="flex flex-wrap gap-1">
                {VARFURI_MUNTE.map(s => (
                  <a key={s.slug} href={`/vreme/${s.slug}`} className="text-[9px] font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-[2px] border border-slate-100 hover:border-blue-500 hover:bg-white transition-all">
                    {s.name} <span className="text-[8px] opacity-70 ml-1">({s.alt}m)</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Localitati pe judete - Requirement 6: Full Width */}
        <div className="bg-white p-3 rounded-[6px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">Index Complet: Localități pe Județe</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-x-2 gap-y-1">
            {ROMANIA_COUNTIES.map(judet => (
              <a key={judet.slug} href={`/vreme/judet/${judet.slug}`} className="text-[9px] font-black text-blue-600 hover:underline flex items-center gap-1">
                <MapPin className="h-2 w-2 opacity-50" /> {judet.name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
