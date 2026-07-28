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
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    if (jobData) setJob(jobData as Job);

    const { data: clipsData } = await supabase
      .from('clips')
      .select('*')
      .eq('job_id', jobId)
      .order('clip_index', { ascending: true });
    if (clipsData) setClips(clipsData as Clip[]);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  function copyCaption(clip: Clip) {
    const text = `${clip.title || ''}\n\n${clip.caption || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-blue-400 mb-4 inline-block">← Kembali</Link>

      <h1 className="text-xl font-bold mb-1">{job.video_title || 'Memproses...'}</h1>
      <p className="text-xs text-gray-500 mb-1 break-all">{job.youtube_url}</p>
      <p className="text-sm text-gray-400 mb-6">
        Status: <span className="font-medium">{job.status}</span>
        {job.video_duration_seconds && ` · ${Math.round(job.video_duration_seconds / 60)} menit`}
      </p>

      {job.status === 'failed' && (
        <div className="bg-red-950 border border-red-800 rounded p-3 mb-6 text-sm text-red-300">
          Gagal: {job.error_message}
        </div>
      )}

      {(job.status === 'pending' || job.status === 'downloading' || job.status === 'processing') && (
        <div className="bg-blue-950 border border-blue-800 rounded p-3 mb-6 text-sm text-blue-300">
          Video sedang diproses. Halaman ini akan otomatis update.
        </div>
      )}

      <div className="space-y-4">
        {clips.map((clip) => (
          <div key={clip.id} className="bg-gray-900 border border-gray-800 rounded p-3">
            {clip.video_url ? (
              <video
                src={clip.video_url}
                controls
                className="w-full rounded mb-3 max-h-[500px] bg-black"
              />
            ) : (
              <div className="w-full aspect-[9/16] max-h-[300px] bg-gray-800 rounded mb-3 flex items-center justify-center text-gray-500 text-sm">
                Belum siap
              </div>
            )}

            <p className="text-sm font-medium mb-1">{clip.title}</p>
            <p className="text-xs text-gray-400 mb-3">{clip.caption}</p>

            <div className="flex gap-2">
              {clip.video_url && (
                <a
                  href={clip.video_url}
                  download
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-sm py-2 rounded"
                >
                  Download
                </a>
              )}
              <button
                onClick={() => copyCaption(clip)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded"
              >
                {copiedId === clip.id ? 'Tersalin!' : 'Copy Caption'}
              </button>
            </div>
          </div>
        ))}

        {clips.length === 0 && job.status === 'done' && (
          <p className="text-sm text-gray-500">Tidak ada clip yang dihasilkan.</p>
        )}
      </div>
    </main>
  );
}
