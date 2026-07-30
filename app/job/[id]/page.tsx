'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Job, Clip } from '@/lib/supabase';

export default function JobDetail() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchData() {
    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (jobData) setJob(jobData as Job);
    const { data: clipsData } = await supabase.from('clips').select('*').eq('job_id', jobId).order('clip_index', { ascending: true });
    if (clipsData) setClips(clipsData as Clip[]);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  function copyCaption(clip: Clip) {
    navigator.clipboard.writeText(`${clip.title || ''}\n\n${clip.caption || ''}`);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Memuat...</p>
      </main>
    );
  }

  const isProcessing = ['pending', 'downloading', 'processing'].includes(job.status);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-cyan-500/20 pointer-events-none" />
      <div className="relative max-w-lg mx-auto p-5 pb-24">
        <Link href="/" className="text-sm text-cyan-400 mb-4 inline-flex items-center gap-1">← Kembali</Link>

        <h1 className="text-xl font-bold mb-1">{job.video_title || 'Memproses...'}</h1>
        <p className="text-xs text-gray-500 mb-3 break-all">{job.youtube_url}</p>

        {isProcessing && (
          <div className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/30 rounded-2xl p-4 mb-6 text-sm text-sky-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Sedang diproses, halaman ini auto-update...
          </div>
        )}
        {job.status === 'failed' && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-6 text-sm text-rose-300">
            Gagal: {job.error_message}
          </div>
        )}

        <div className="space-y-5">
          {clips.map((clip, idx) => (
            <div key={clip.id} className="rounded-2xl p-[2px] bg-gradient-to-br from-pink-500/40 via-fuchsia-500/40 to-cyan-400/40">
              <div className="bg-[#0f0f16] rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold flex-1 truncate">{clip.title}</p>
                </div>

                {clip.video_url ? (
                  <video src={clip.video_url} controls className="w-full rounded-xl mb-3 max-h-[500px] bg-black" />
                ) : (
                  <div className="w-full aspect-[9/16] max-h-[300px] bg-white/5 rounded-xl mb-3 flex items-center justify-center text-gray-500 text-sm animate-pulse">
                    Belum siap
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3">{clip.caption}</p>

                <div className="flex gap-2">
                  {clip.video_url && (
                    <a href={clip.video_url} download className="flex-1 text-center bg-gradient-to-r from-pink-500 to-cyan-400 text-sm font-semibold py-2.5 rounded-xl active:scale-[0.97] transition">
                      ⬇ Download
                    </a>
                  )}
                  <button onClick={() => copyCaption(clip)} className="flex-1 bg-white/10 text-sm font-semibold py-2.5 rounded-xl active:scale-[0.97] transition">
                    {copiedId === clip.id ? '✓ Tersalin' : '📋 Copy Caption'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {clips.length === 0 && job.status === 'done' && (
            <p className="text-sm text-gray-500">Tidak ada clip.</p>
          )}
        </div>
      </div>
    </main>
  );
}
