'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import VideoPlayer from '@/components/video-player';
import TimestampList from '@/components/timestamp-list';
import { Timeline } from '@/app/components/Timeline';
import type { Timestamp } from '@/app/types';

interface SavedVideo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  timestamps: Timestamp[];
}

export default function VideoPage() {
  const [video, setVideo] = useState<SavedVideo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedVideos: SavedVideo[] = JSON.parse(
      localStorage.getItem('savedVideos') || '[]'
    );
    const foundVideo = savedVideos.find((v) => v.id === params.id);
    console.log('Found video:', foundVideo);
    if (foundVideo) {
      setVideo(foundVideo);
    } else {
      router.push('/saved-videos');
    }
  }, [params.id, router]);

  // Track video time and duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      console.log('Current time:', video.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log('Video duration:', video.duration);
      setVideoDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Initial load if video is already loaded
    if (video.duration) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const handleTimestampClick = (timestamp: string) => {
    if (!videoRef.current) return;

    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + seconds;
    videoRef.current.currentTime = timeInSeconds;
    videoRef.current.play();
  };

  if (!video) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black text-white'>
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black p-4 text-white'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-center text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]'>
          {video.name}
        </h1>
        <div className='space-y-4'>
          <VideoPlayer
            url={video.url}
            timestamps={video.timestamps}
            ref={videoRef}
          />

          {/* Timeline component */}
          <div className='mt-4 w-full space-y-2 rounded-lg bg-gray-900/50 p-4 backdrop-blur-sm'>
            <h2 className='text-xl font-semibold text-white'>
              Key Moments Timeline
            </h2>
            <Timeline
              events={video.timestamps.map((ts) => {
                console.log('Processing timestamp:', ts);
                // Handle both MM:SS and raw seconds formats
                let timeInSeconds;
                if (
                  typeof ts.timestamp === 'string' &&
                  ts.timestamp.includes(':')
                ) {
                  const [minutes, seconds] = ts.timestamp
                    .split(':')
                    .map(Number);
                  timeInSeconds = minutes * 60 + seconds;
                } else {
                  timeInSeconds = Number(ts.timestamp);
                }
                console.log('Converted to seconds:', timeInSeconds);
                return {
                  startTime: timeInSeconds,
                  endTime: timeInSeconds + 3, // Each event lasts 3 seconds
                  type: ts.isDangerous ? 'warning' : 'normal',
                  label: ts.description,
                };
              })}
              totalDuration={videoDuration || 100} // Provide a default duration
              currentTime={currentTime}
            />
          </div>

          <div className='mt-4 flex justify-end'>
            <Button
              onClick={async () => {
                try {
                  // Create download link directly from video URL
                  const downloadUrl = video.url;

                  const a = document.createElement('a');
                  a.href = downloadUrl;
                  const downloadName = video.name.toLowerCase().endsWith('.mp4')
                    ? video.name
                    : `${video.name}.mp4`;
                  a.download = downloadName;
                  a.setAttribute('type', 'video/mp4');
                  a.setAttribute('extension', 'mp4');

                  // download
                  document.body.appendChild(a);
                  a.click();

                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Download error:', error);
                  alert('Failed to download video. Please try again.');
                }
              }}
              className='flex items-center gap-2 border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
            >
              <Download className='h-4 w-4' />
              Download MP4
            </Button>
          </div>
          <TimestampList
            timestamps={video.timestamps}
            onTimestampClick={handleTimestampClick}
          />
        </div>
        <div className='mt-8 text-center'>
          <Link
            href='/pages/saved-videos'
            className='text-purple-400 hover:text-purple-300'
          >
            Back to Saved Videos
          </Link>
        </div>
      </div>
    </div>
  );
}
