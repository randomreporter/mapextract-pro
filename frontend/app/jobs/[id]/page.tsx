'use client';

import { useEffect, useState } from 'react';
import { Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface Job {
    id: string;
    status: 'running' | 'done' | 'failed';
    progress: number;
    results: any[];
    error: string | null;
    createdAt: string;
}

const ALL_COLUMNS = [
    { id: 'name', label: 'Name' },
    { id: 'address', label: 'Address' },
    { id: 'phone', label: 'Phone' },
    { id: 'website', label: 'Website' },
    { id: 'category', label: 'Category' },
    { id: 'rating', label: 'Rating' },
    { id: 'reviewCount', label: 'Reviews' },
];

export default function JobPage({ params }: { params: { id: string } }) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.id));

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchJob = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/jobs/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setJob(data);

                    if (data.status === 'done' || data.status === 'failed') {
                        clearInterval(interval);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch job', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
        interval = setInterval(fetchJob, 2000);

        return () => clearInterval(interval);
    }, [params.id]);

    const toggleColumn = (id: string) => {
        setSelectedColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const downloadFile = (format: 'xlsx' | 'csv') => {
        if (!job || job.status !== 'done') return;
        // In a real app we would pass selectedColumns to API to filter export
        const columnsParam = selectedColumns.join(',');
        window.location.href = `http://localhost:3001/api/jobs/${job.id}/export?format=${format}&columns=${columnsParam}`;
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading job details...</div>;
    if (!job) return <div className="p-8 text-center text-red-500">Job not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Status Header */}
            <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        Extraction Job
                        {job.status === 'running' && <span className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> In Progress</span>}
                        {job.status === 'done' && <span className="flex items-center text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium"><CheckCircle2 className="h-4 w-4 mr-1" /> Completed</span>}
                        {job.status === 'failed' && <span className="flex items-center text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium"><AlertCircle className="h-4 w-4 mr-1" /> Failed</span>}
                    </h1>
                    <p className="text-slate-500 font-mono text-sm">ID: {job.id}</p>
                </div>

                <div className="mt-6 md:mt-0 flex gap-4">
                    <button
                        onClick={() => downloadFile('csv')}
                        disabled={job.status !== 'done'}
                        className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-semibold flex items-center transition-all disabled:opacity-50"
                    >
                        Download .CSV
                    </button>
                    <button
                        onClick={() => downloadFile('xlsx')}
                        disabled={job.status !== 'done'}
                        className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold flex items-center transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            {job.error && (
                <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center">
                    <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p className="font-medium">{job.error}</p>
                </div>
            )}

            {/* Progress UX Setup (when running) */}
            {job.status === 'running' && (
                <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-100 shadow-sm text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6 relative">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin absolute" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Scraping Map Records...</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        The headless browser is currently navigating map results. This can take several minutes depending on the max results requested.
                    </p>
                </div>
            )}

            {/* Results Table & Column Toggle (when done) */}
            {job.status === 'done' && (
                <>
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Export Columns Configuration</h3>
                        <div className="flex flex-wrap gap-2">
                            {ALL_COLUMNS.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => toggleColumn(col.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedColumns.includes(col.id)
                                            ? 'bg-slate-900 justify-center text-white border-transparent'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {col.label}
                                    {selectedColumns.includes(col.id) && <CheckCircle2 className="inline h-4 w-4 ml-1.5 opacity-70" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                    <tr>
                                        {ALL_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(col => (
                                            <th key={col.id} className="px-6 py-4">{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {job.results.map((result, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            {ALL_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(col => (
                                                <td key={col.id} className="px-6 py-4">
                                                    {col.id === 'website' && result[col.id] ? (
                                                        <a href={result[col.id]} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a>
                                                    ) : (
                                                        <span className="text-slate-700 line-clamp-2">{result[col.id] || '-'}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {job.results.length === 0 && (
                                        <tr>
                                            <td colSpan={100} className="px-6 py-12 text-center text-slate-500">No results were extracted.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
