import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CameraIcon } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

export const IPCamera: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [cameraUrl, setCameraUrl] = useState<string>('');

  const handleStartCamera = () => {
    setCameraUrl(ipAddress);
  };

  return (
    <div className='flex h-full'>
      <div className='relative w-3/4 pr-4'>
        <Card className='flex h-full flex-col border-2 border-blue-900/50 shadow-lg shadow-blue-900/30'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold tracking-tight text-blue-200'>
              IP Camera Viewer
            </CardTitle>
          </CardHeader>
          <CardContent className='relative flex-grow'>
            <div className='mb-4 flex flex-col gap-4'>
              <div className='flex gap-4'>
                <Input
                  placeholder='Camera IP Address (http://example.com/video)'
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className='flex-grow border-blue-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500'
                />
                <Button
                  onClick={handleStartCamera}
                  className='bg-green-700 hover:bg-green-600'
                >
                  View Camera
                </Button>
              </div>
            </div>

            <div className='relative h-[calc(100vh-250px)] overflow-hidden rounded-lg border-2 border-blue-900/30 bg-black'>
              {cameraUrl ? (
                <img
                  src={cameraUrl}
                  alt='IP Camera Stream'
                  crossOrigin='anonymous'
                  className='h-full w-full object-contain'
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <CameraIcon className='h-24 w-24 text-blue-500 opacity-50' />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <NotificationPanel events={[]} onResolveEvent={() => {}} />
    </div>
  );
};