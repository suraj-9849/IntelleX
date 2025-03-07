'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import {
  Upload,
  Search,
  AlertTriangle,
  Shield,
  Maximize2,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import VideoPlayer from '@/components/video-player';
import { detectEvents, type VideoEvent } from './actions';
import type { Timestamp } from '@/app/types';

export default function InvestigatePage() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [investigationPrompt, setInvestigationPrompt] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [dangerousFrames, setDangerousFrames] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureFrame = async (
    video: HTMLVideoElement,
    time: number
  ): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas context');
      return null;
    }

    try {
      video.currentTime = time;
    } catch (error) {
      console.error('Error setting video time:', error);
      return null;
    }

    await new Promise((resolve) => {
      video.onseeked = resolve;
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleInvestigate = async () => {
    if (!videoUrl || !investigationPrompt) {
      alert('Please upload a video and provide an investigation prompt');
      return;
    }

    setIsAnalyzing(true);
    setTimestamps([]);
    setDangerousFrames([]);
    setUploadProgress(0);

    try {
      const video = document.createElement('video');
      video.src = videoUrl;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve(true);
        video.onerror = () => reject(new Error('Failed to load video'));
      });

      const duration = video.duration;
      if (!duration || duration === Infinity || isNaN(duration)) {
        throw new Error('Invalid video duration');
      }

      const interval = 3;
      const newTimestamps: Timestamp[] = [];
      const newDangerousFrames: string[] = [];

      for (let time = 0; time < duration; time += interval) {
        const progress = Math.floor((time / duration) * 100);
        setUploadProgress(progress);

        const frame = await captureFrame(video, time);
        if (frame) {
          try {
            const result = await detectEvents(frame, investigationPrompt);

            if (result.events && result.events.length > 0) {
              result.events.forEach((event: VideoEvent) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                const timestampStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                newTimestamps.push({
                  timestamp: timestampStr,
                  description: event.description,
                  isDangerous: event.isDangerous,
                });

                if (event.isDangerous) {
                  newDangerousFrames.push(frame);
                }
              });
            }
          } catch (error) {
            console.error('Error analyzing frame:', error);
          }
        }
      }

      setTimestamps(newTimestamps);
      setDangerousFrames(newDangerousFrames);
      setIsAnalyzing(false);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error analyzing video:', error);
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: {
    target: { files: FileList | null };
  }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setVideoUrl(localUrl);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const handleTimestampClick = (timestamp: string) => {
    if (!videoRef.current) return;

    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + seconds;
    videoRef.current.currentTime = timeInSeconds;
    videoRef.current.play();
  };

  return (
    <div className='min-h-screen  p-8 text-white'>
      <div className='container mx-auto max-w-7xl'>
        <div className='mb-12 text-center'>
          <h1 className='mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-5xl font-extrabold text-transparent'>
            IntelliInvestigate
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-slate-400'>
            Uncover hidden insights with AI-powered video investigation
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-2'>
          <Card className='border-slate-700 bg-slate-800/60 shadow-2xl backdrop-blur-lg'>
            <CardHeader>
              <CardTitle className='flex items-center text-xl'>
                <Upload className='mr-3 text-blue-500' />
                Video Investigation Setup
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Video Upload Area */}
              <div className='rounded-2xl border-2 border-dashed border-slate-700 p-8 text-center transition-colors hover:border-blue-500'>
                <input
                  type='file'
                  accept='video/*'
                  className='hidden'
                  id='video-upload'
                  onChange={handleFileUpload}
                  disabled={isUploading || isAnalyzing}
                />
                <label htmlFor='video-upload' className='block cursor-pointer'>
                  {videoUrl ? (
                    <VideoPlayer
                      url={videoUrl}
                      timestamps={timestamps}
                      ref={videoRef}
                    />
                  ) : (
                    <div className='flex flex-col items-center'>
                      <Upload className='mb-4 h-16 w-16 animate-bounce text-blue-500' />
                      <p className='text-lg text-slate-400'>
                        Click to upload or drag and drop a video
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Investigation Prompt */}
              <div className='space-y-4'>
                <Textarea
                  placeholder='Enter your specific investigation prompt (e.g., "Find students smoking in the hallway")'
                  value={investigationPrompt}
                  onChange={(e) => setInvestigationPrompt(e.target.value)}
                  className='min-h-[120px] border-slate-700 bg-slate-900 text-white focus:border-blue-500'
                />

                <Button
                  onClick={handleInvestigate}
                  disabled={!videoUrl || !investigationPrompt || isAnalyzing}
                  className='w-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 hover:from-blue-700 hover:to-indigo-600'
                >
                  <Search className='mr-2' />
                  Start Investigation
                </Button>
              </div>

              {/* Progress Indicator */}
              {(isUploading || isAnalyzing) && (
                <div className='mt-4'>
                  <Progress
                    value={uploadProgress}
                    className='w-full bg-slate-700 bg-gradient-to-r from-blue-500 to-indigo-500'
                  />
                  <p className='mt-2 animate-pulse text-center text-sm text-slate-400'>
                    {isUploading
                      ? 'Uploading video...'
                      : 'Analyzing video content...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investigation Results Section */}
          <Card className='border-slate-700 bg-slate-800/60 shadow-2xl backdrop-blur-lg'>
            <CardHeader>
              <CardTitle className='flex items-center text-xl'>
                <Shield className='mr-3 text-red-500' />
                Investigation Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timestamps.length > 0 ? (
                <div className='space-y-6'>
                  {/* Summary Statistics */}
                  <div className='grid grid-cols-2 gap-4'>
                    <Card className='bg-slate-900 shadow-md'>
                      <CardContent className='p-4 text-center'>
                        <p className='text-slate-400'>Total Timestamps</p>
                        <p className='text-2xl font-bold text-blue-500'>
                          {timestamps.length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className='bg-slate-900 shadow-md'>
                      <CardContent className='p-4 text-center'>
                        <p className='text-slate-400'>Suspicious Frames</p>
                        <p className='text-2xl font-bold text-red-500'>
                          {dangerousFrames.length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timestamps List */}
                  <div className='max-h-64 overflow-y-auto'>
                    {timestamps.map((timestamp, index) => (
                      <div
                        key={index}
                        className='flex cursor-pointer items-center justify-between border-b border-slate-700 p-3 transition-colors hover:bg-slate-700/50'
                        onClick={() =>
                          handleTimestampClick(timestamp.timestamp)
                        }
                      >
                        <div>
                          <Badge
                            variant={
                              timestamp.isDangerous
                                ? 'destructive'
                                : 'secondary'
                            }
                            className='mr-2'
                          >
                            {timestamp.timestamp}
                          </Badge>
                          <span>{timestamp.description}</span>
                        </div>
                        {timestamp.isDangerous && (
                          <AlertTriangle className='text-red-500' size={20} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Suspicious Frames Gallery */}
                  {dangerousFrames.length > 0 && (
                    <div className='mt-6'>
                      <h3 className='mb-4 flex items-center text-xl font-semibold text-red-500'>
                        <AlertTriangle className='mr-2' />
                        Suspicious Frames
                      </h3>
                      <div className='grid grid-cols-3 gap-4'>
                        {dangerousFrames.map((frame, index) => (
                          <div
                            key={index}
                            className='group relative cursor-pointer'
                            onClick={() => setSelectedFrame(frame)}
                          >
                            <img
                              src={frame}
                              alt={`Suspicious Frame ${index + 1}`}
                              className='rounded-lg border-2 border-red-500/50 shadow-lg transition-transform duration-300 group-hover:scale-105'
                            />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100'>
                              <Maximize2 className='text-white' />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='p-8 text-center text-slate-400'>
                  <Shield className='mx-auto mb-4 h-16 w-16 text-slate-600' />
                  <p className='text-lg'>
                    Upload a video and provide a prompt to start investigation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Screen Frame Modal */}
      <Dialog
        open={!!selectedFrame}
        onOpenChange={() => setSelectedFrame(null)}
      >
        <DialogContent className='max-w-6xl border-none bg-transparent'>
          <div className='relative'>
            <img
              src={selectedFrame || ''}
              alt='Full Screen Frame'
              className='mx-auto max-h-[80vh] max-w-full rounded-2xl shadow-2xl'
            />
            <button
              onClick={() => setSelectedFrame(null)}
              className='absolute right-4 top-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/40'
            >
              <X className='text-white' />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
