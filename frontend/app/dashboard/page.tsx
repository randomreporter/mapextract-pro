import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Database, Search, FileDown, Clock, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Fetch jobs from API (using dummy data for UI scaffolding, real integration happens via API)
    const jobs = [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Your Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage your MapExtract history and exports.</p>
                </div>
                <Link
                    href="/search"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all shadow-lg shadow-blue-600/20"
                >
                    <Search className="h-5 w-5 mr-2" />
                    New Scrape
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-600">Total Scrapes</h3>
                        <Database className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-600">Records Extracted</h3>
                        <MapPin className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-600">Credits Remaining</h3>
                        <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold">100</p>
                    <p className="text-xs text-slate-400 mt-2">Free Tier</p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-6">Recent Jobs</h2>
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                {jobs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">No scraping history yet</h3>
                        <p className="text-slate-500 max-w-sm mt-2">Run your first Maps extraction to see the results history appear here.</p>
                        <Link href="/search" className="mt-6 text-blue-600 font-medium hover:underline">Start Scraping</Link>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Job ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Results</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* Job rows would go here */}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
