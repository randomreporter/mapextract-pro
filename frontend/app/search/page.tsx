'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';

export default function SearchPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [maxResults, setMaxResults] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword || !location) {
            setError('Please provide both keyword and location');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3001/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, location, maxResults }),
            });

            if (!res.ok) {
                throw new Error('Failed to start scraping job');
            }

            const data = await res.json();
            router.push(`/jobs/${data.jobId}`);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-16 p-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">New Extraction</h1>
                    <p className="text-slate-500">Enter a category and city to start scraping live coordinates.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Keyword</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Plumbers, Dentists, Software Agencies..."
                                className="pl-10 w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all px-4"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. London, Brooklyn NY, Seattle..."
                                className="pl-10 w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all px-4"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">Max Results</label>
                            <span className="text-sm font-bold text-blue-600">{maxResults}</span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SlidersHorizontal className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                step="10"
                                className="w-full h-12 acccent-blue-600 ml-10 rounded-2xl cursor-pointer"
                                value={maxResults}
                                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                Initializing Engines...
                            </>
                        ) : (
                            'Scrape Data'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
