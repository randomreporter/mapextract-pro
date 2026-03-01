import Link from 'next/link';
import { ArrowRight, MapPin, Database, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center p-8 lg:p-24 relative overflow-hidden">

      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400 opacity-20 blur-[100px] pointer-events-none" />

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center mt-12">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8">
          <Zap className="h-4 w-4 mr-2" />
          No Google Places API Key Required
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
          Extract Google Maps <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Data in Seconds.
          </span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mb-12">
          Automate data collection for lead generation, sales, and local marketing. Export structured business profiles including emails, phones, and precise GPS coordinates directly to Excel.
        </p>

        <Link
          href="/search"
          className="group flex h-14 items-center justify-center rounded-full bg-slate-900 px-8 text-lg font-semibold text-white transition-all hover:bg-slate-800 hover:scale-105 shadow-xl shadow-slate-900/20"
        >
          Start Scraping Now
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl w-full">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
            <MapPin className="text-blue-600 h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Live Scraping</h3>
          <p className="text-slate-600">A real browser automation engine searches and extracts live map listings.</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
            <Database className="text-purple-600 h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Rich Data Extraction</h3>
          <p className="text-slate-600">Name, address, phone number, website URLs, coordinates, and exact map links.</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
            <Zap className="text-emerald-600 h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Clean Excel Exports</h3>
          <p className="text-slate-600">Download formatted .xlsx files with clickable hyperlinks instantly.</p>
        </div>
      </div>
    </main>
  )
}
