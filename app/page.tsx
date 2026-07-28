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
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
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

    const { error } = await supabase.from('jobs').insert({
      youtube_url: url.trim(),
      status: 'pending'
    });

    setLoading(false);

    if (error) {
      setMessage('Gagal menambah job: ' + error.message);
    } else {
      setMessage('Job berhasil ditambahkan! Buka Colab untuk memprosesnya.');
      setUrl('');
      fetchJobs();
    }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      downloading: 'bg-blue-500',
      processing: 'bg-blue-500',
      done: 'bg-green-500',
      failed: 'bg-red-500'
    };
    return `px-2 py-1 rounded text-xs text-white ${colors[status] || 'bg-gray-500'}`;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Shorts Automation</h1>
      <p className="text-gray-400 text-sm mb-6">Paste link YouTube, sistem otomatis potong jadi Shorts.</p>

      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 mb-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 p-3 rounded font-medium text-sm"
        >
          {loading ? 'Menambahkan...' : 'Proses Video'}
        </button>
        {message && <p className="text-sm text-gray-400 mt-2">{message}</p>}
      </form>

      <h2 className="text-lg font-semibold mb-3">Riwayat Job</h2>
      <div className="space-y-2">
        {jobs.length === 0 && (
          <p className="text-gray-500 text-sm">Belum ada job.</p>
        )}
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/job/${job.id}`}
            className="block bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{job.video_title || job.youtube_url}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(job.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <span className={statusBadge(job.status)}>{job.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
