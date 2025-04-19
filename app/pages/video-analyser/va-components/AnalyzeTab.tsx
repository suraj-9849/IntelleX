'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  PlayIcon,
  MonitorStopIcon as StopIcon,
  CameraIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { NotificationPanel } from './NotificationPanel';
import { detectEvents, type VideoEvent } from '../actions';
import { useDangerSound } from './useDangerSound';

interface AnalyzeTabProps {
  onError: (error: string | null) => void;
  onWatchUrlChange: (url: string) => void;
}

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ onError, onWatchUrlChange }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [ipAddress, setIpAddress] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [events, setEvents] = useState<VideoEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamKey, setStreamKey] = useState(0);

  const { playSound, stopSound } = useDangerSound('/danger_alert.mp3');

  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!imgRef.current || !canvasRef.current || !isAnalyzing) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Failed to get canvas context.');
      return;
    }

    try {
      const MAX_DIM = 480;
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;
      if (aspectRatio > 1) {
        newWidth = MAX_DIM;
        newHeight = MAX_DIM / aspectRatio;
      } else {
        newHeight = MAX_DIM;
        newWidth = MAX_DIM * aspectRatio;
      }
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.imageSmoothingQuality = 'low';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      setIsLoading(true);
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create image blob');
        const { events: newEvents } = await detectEvents(blob);

        const eventsWithTimestamp = newEvents.map((event) => ({
          ...event,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          }),
        }));

        if (eventsWithTimestamp.some((e) => e.isDangerous)) {
          playSound();
        }

        setEvents((prev) => [...eventsWithTimestamp, ...prev].slice(0, 10));
        setError(null);
        onError(null);
        setIsLoading(false);
      }, 'image/jpeg', 0.6);
    } catch (err) {
      console.error('Error analyzing frame:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to analyze frame: ${msg}`);
      onError(`Failed to analyze frame: ${msg}`);
      setIsLoading(false);
    }
  }, [isAnalyzing, playSound, onError]);

  const startAnalysis = () => {
    if (!ipAddress) {
      const msg = 'Please enter an IP address with port.';
      setError(msg);
      onError(msg);
      return;
    }
    const baseUrl = ipAddress.startsWith('http://') ? ipAddress : `http://${ipAddress}`;
    const possible = [
      `${baseUrl}/video`, `${baseUrl}/stream`, `${baseUrl}/mjpg/video.mjpg`,
      `${baseUrl}:8080/video`, `${baseUrl}:8080/stream`, `${baseUrl}:8080/mjpg/video.mjpg`,
    ];

    (async () => {
      for (const url of possible) {
        try {
          const ctrl = new AbortController();
          const id = setTimeout(() => ctrl.abort(), 5000);
          const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
          clearTimeout(id);
          if (res.ok) {
            setStreamUrl(url);
            setVideoUrl(url);
            onWatchUrlChange(baseUrl);
            setIsAnalyzing(true);
            setError(null);
            onError(null);
            setStreamKey((k) => k + 1);
            return;
          }
        } catch {
          // ignore
        }
      }
      const msg = 'Could not find a valid video stream. Please check the IP.';
      setError(msg);
      onError(msg);
    })();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    stopSound();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resolveEvent = (i: number) => {
    const arr = [...events]; arr.splice(i, 1); setEvents(arr);
    if (!arr.some((e) => e.isDangerous)) stopSound();
  };

  const reloadStream = () => setStreamKey((k) => k + 1);

  useEffect(() => {
    if (isAnalyzing) {
      intervalRef.current = setInterval(captureAndAnalyzeFrame, 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAnalyzing, captureAndAnalyzeFrame]);

  return (
    <div className='flex h-full'>
      <div className='relative w-3/4 pr-4'>
        <Card className='flex h-full flex-col border-2 border-blue-900/50 shadow-lg shadow-blue-900/30'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold tracking-tight text-blue-200'>
              Real-time Intelligent Surveillance
            </CardTitle>
          </CardHeader>
          <CardContent className='relative flex-grow'>
            <div className='mb-4 flex flex-col gap-4'>
              <div className='flex gap-4'>
                <Input placeholder='Camera IP Address (192.168.1.3:8080/video)'
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className='flex-grow border-blue-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500'
                />
                <Button onClick={startAnalysis} disabled={isAnalyzing} className='bg-green-700 hover:bg-green-600'>
                  <PlayIcon className='mr-2' /> Start
                </Button>
                <Button onClick={stopAnalysis} disabled={!isAnalyzing} variant='destructive' className='bg-red-800 hover:bg-red-700'>
                  <StopIcon className='mr-2' /> Stop
                </Button>
              </div>
            </div>
            <div className='relative h-[calc(100vh-250px)] overflow-hidden rounded-lg border-2 border-blue-900/30 bg-black'>
              {isAnalyzing ? (
                <div className='relative h-full w-full'>
                  <img
                    key={streamKey}
                    ref={imgRef}
                    src={`${videoUrl}?${streamKey}`}
                    alt='Live Camera Stream'
                    crossOrigin='anonymous'
                    className='h-full w-full object-contain'
                    onError={() => {
                      setError(`Failed to load video stream from ${videoUrl}`);
                      stopAnalysis();
                    }}
                  />
                  <Button onClick={reloadStream} className='absolute right-2 top-2 bg-blue-600 hover:bg-blue-500' size='sm'>
                    <RefreshCwIcon className='mr-2 h-4 w-4' /> Reload Stream
                  </Button>
                </div>
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <CameraIcon className='h-24 w-24 text-blue-500 opacity-50' />
                </div>
              )}

              {isAnalyzing && isLoading && (
                <div className='absolute right-2 top-2'><Badge variant='destructive' className='animate-pulse'>Analyzing...</Badge></div>
              )}

              {error && (
                <div className='absolute inset-0 flex items-center justify-center bg-red-900/70 p-4 text-white'>
                  <div className='text-center'>
                    <p className='mb-2 text-lg font-bold'>Stream Error</p>
                    <p>{error}</p>
                    <Button onClick={() => setError(null)} variant='outline' className='mt-4'>Dismiss</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <NotificationPanel events={events} onResolveEvent={resolveEvent} />
    </div>
  );
};