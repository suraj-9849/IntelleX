'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SavedVideo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  timestamps: { timestamp: string; description: string }[];
}

export default function SavedVideosPage() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([]);

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem('savedVideos') || '[]');
    setSavedVideos(videos);
    setFilteredVideos(videos);
  }, []);

  useEffect(() => {
    const filtered = savedVideos.filter(
      (video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.timestamps.some((timestamp) =>
          timestamp.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredVideos(filtered);
  }, [searchTerm, savedVideos]);

  const handleDelete = (id: string) => {
    const updatedVideos = savedVideos.filter((video) => video.id !== id);
    setSavedVideos(updatedVideos);
    localStorage.setItem('savedVideos', JSON.stringify(updatedVideos));
  };

  return (
    <div className='min-h-screen bg-black p-4 text-white'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-center text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]'>
          Saved Videos
        </h1>
        <div className='relative mb-6'>
          <Input
            type='text'
            placeholder='Search videos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-full border-zinc-700 bg-zinc-800 py-2 pl-10 pr-4 text-white placeholder-zinc-400 focus:border-transparent focus:ring-2 focus:ring-white'
          />
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400'
            size={18}
          />
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className='group overflow-hidden rounded-lg bg-zinc-900 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-lg hover:shadow-purple-900/20'
            >
              <div className='group'>
                <div className='aspect-video'>
                  <video
                    src={video.url}
                    className='h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105'
                  />
                </div>
                <div className='p-4'>
                  <h2 className='mb-2 text-lg font-semibold tracking-wide'>
                    {video.name}
                  </h2>
                  <div className='flex items-center justify-between'>
                    <Link
                      href={`/pages/video/${video.id}`}
                      className='text-sm font-medium uppercase tracking-wider text-white transition-colors duration-200 hover:text-gray-300'
                    >
                      View Analysis
                    </Link>
                    <Button
                      onClick={() => handleDelete(video.id)}
                      variant='destructive'
                      size='icon'
                      className='rounded-full'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredVideos.length === 0 && (
          <p className='mt-8 text-center text-lg font-light text-zinc-400'>
            {searchTerm
              ? 'No videos match your search.'
              : 'No saved videos yet.'}
          </p>
        )}
        <div className='mt-12 text-center'>
          <Link
            href='/pages/upload'
            className='text-lg font-medium tracking-wide text-white transition-colors duration-200 hover:text-gray-300'
          >
            Back to Analyzer
          </Link>
        </div>
      </div>
    </div>
  );
}
