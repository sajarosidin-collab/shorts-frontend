'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Job } from '@/lib/supabase';

export default function Home() {
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data as Job[]);
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setMessage('');
    const { error } = await supabase.from('jobs').insert({ youtube_url: url.trim(), status: 'pending' });
    setLoading(false);
    if (error) {
      setMessage('Gagal: ' + error.message);
    } else {
      setMessage('✅ Ditambahkan! Proses di Colab untuk memulai.');
      setUrl('');
      fetchJobs();
    }
  }

  function statusStyle(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-amber-400 text-amber-950',
      downloading: 'bg-sky-400 text-sky-950 animate-pulse',
      processing: 'bg-sky-400 text-sky-950 animate-pulse',
      done: 'bg-emerald-400 text-emerald-950',
      failed: 'bg-rose-500 text-white',
    };
    return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${map[status] || 'bg-gray-500 text-white'}`;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-cyan-500/20 pointer-events-none" />
      <div className="relative max-w-lg mx-auto p-5 pb-24">
        <div className="pt-6 pb-8 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
            AI Shorts Maker
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Shorts Automation
          </h1>
          <p className="text-gray-400 text-sm mt-2">Paste link, dapetin klip siap posting</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 mb-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Tempel link YouTube..."
              className="w-full p-4 rounded-2xl bg-[#0a0a0f] text-sm placeholder-gray-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 disabled:opacity-50 p-4 rounded-2xl font-bold text-sm shadow-lg shadow-fuchsia-500/30 active:scale-[0.98] transition"
          >
            {loading ? 'Menambahkan...' : '✨ Proses Video'}
          </button>
          {message && <p className="text-sm text-gray-400 mt-3 text-center">{message}</p>}
        </form>

        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="w-1 h-5 rounded bg-gradient-to-b from-pink-500 to-cyan-400" />
          Riwayat
        </h2>
        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-gray-500 text-sm">Belum ada job.</p>}
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/job/${job.id}`}
              className="block bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 active:scale-[0.98] transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{job.video_title || job.youtube_url}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(job.created_at).toLocaleString('id-ID')}</p>
                </div>
                <span className={statusStyle(job.status)}>{job.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
