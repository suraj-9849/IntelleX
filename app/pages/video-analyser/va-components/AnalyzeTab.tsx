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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg');
      setIsLoading(true);

      const { events: newEvents } = await detectEvents(base64Image);

      const eventsWithTimestamp = newEvents.map((event: any) => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return {
          ...event,
          timestamp: formattedTime,
        };
      });

      if (eventsWithTimestamp.some((event: any) => event.isDangerous)) {
        playSound();
      }

      setEvents((prev) => {
        const updatedEvents = [...eventsWithTimestamp, ...prev].slice(0, 10);
        return updatedEvents;
      });

      setError(null);
      onError(null);
    } catch (error) {
      console.error('Error analyzing frame:', error);
      const errorMessage = `Failed to analyze frame: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAnalyzing, playSound, onError]);

  const startAnalysis = () => {
    if (!ipAddress) {
      const errorMsg = 'Please enter an IP address with port.';
      setError(errorMsg);
      onError(errorMsg);
      return;
    }

    const baseUrl = ipAddress.startsWith('http://')
      ? ipAddress
      : `http://${ipAddress}`;

    const possibleVideoUrls = [
      `${baseUrl}/video`,
      `${baseUrl}/stream`,
      `${baseUrl}/mjpg/video.mjpg`,
      `${baseUrl}:8080/video`,
      `${baseUrl}:8080/stream`,
      `${baseUrl}:8080/mjpg/video.mjpg`,
    ];

    const tryStreamUrls = async () => {
      for (const url of possibleVideoUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            setStreamUrl(url);
            setVideoUrl(url);
            // Pass the base URL to the parent component for watching
            onWatchUrlChange(baseUrl);
            setIsAnalyzing(true);
            setError(null);
            onError(null);
            setStreamKey((prev) => prev + 1);
            return;
          }
        } catch (err) {
          console.log(`Failed to connect to ${url}`);
        }
      }

      const errorMsg =
        'Could not find a valid video stream. Please check the IP and try a specific video URL.';
      setError(errorMsg);
      onError(errorMsg);
    };

    tryStreamUrls();
  };


  const stopAnalysis = () => {
    setIsAnalyzing(false);
    stopSound();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resolveEvent = (index: number) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    setEvents(updatedEvents);

    if (!updatedEvents.some((event) => event.isDangerous)) {
      stopSound();
    }
  };

  const reloadStream = () => {
    setStreamKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isAnalyzing) {
      intervalRef.current = setInterval(captureAndAnalyzeFrame, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
                <Input
                  placeholder='Camera IP Address (192.168.1.3:8080/video)'
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className='flex-grow border-blue-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500'
                />
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className='bg-green-700 hover:bg-green-600'
                >
                  <PlayIcon className='mr-2' /> Start
                </Button>
                <Button
                  onClick={stopAnalysis}
                  disabled={!isAnalyzing}
                  variant='destructive'
                  className='bg-red-800 hover:bg-red-700'
                >
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
                  <Button
                    onClick={reloadStream}
                    className='absolute right-2 top-2 bg-blue-600 hover:bg-blue-500'
                    size='sm'
                  >
                    <RefreshCwIcon className='mr-2 h-4 w-4' /> Reload Stream
                  </Button>
                </div>
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <CameraIcon className='h-24 w-24 text-blue-500 opacity-50' />
                </div>
              )}

              {isAnalyzing && isLoading && (
                <div className='absolute right-2 top-2'>
                  <Badge variant='destructive' className='animate-pulse'>
                    Analyzing...
                  </Badge>
                </div>
              )}

              {error && (
                <div className='absolute inset-0 flex items-center justify-center bg-red-900/70 p-4 text-white'>
                  <div className='text-center'>
                    <p className='mb-2 text-lg font-bold'>Stream Error</p>
                    <p>{error}</p>
                    <Button
                      onClick={() => setError(null)}
                      variant='outline'
                      className='mt-4'
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
      <NotificationPanel events={events} onResolveEvent={resolveEvent} />
    </div>
  );
};
