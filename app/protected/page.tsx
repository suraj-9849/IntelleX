'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { CameraFeed } from '@/components/camera-feed';
import { CameraModal } from '@/components/camera-modal';
import { EventFeed } from '@/components/event-feed';
import { StatsOverview } from '@/components/stats-overview';
import { locations, events } from '@/lib/data';

export default function ProtectedPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [mainCamera, setMainCamera] = useState<string | null>(null);
  const [videoTimes, setVideoTimes] = useState<Record<string, number>>({});
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null);

  // Flatten all cameras for easier access
  const allCameras = locations.flatMap(location => location.cameras);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push('/sign-in');
          return;
        }

        // Set the first camera as the main camera on initial load
        if (allCameras.length > 0) {
          setMainCamera(allCameras[0].id);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to check auth:', err);
        router.push('/sign-in');
      }
    };

    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/sign-in');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth, router, allCameras]);

  const handleTimeUpdate = (cameraId: string, time: number) => {
    setVideoTimes((prev) => ({
      ...prev,
      [cameraId]: time,
    }));
  };

  const handleEventClick = (cameraId: string, timestamp: number) => {
    setSelectedCamera(cameraId);
    // Update the video time for this camera to jump to the incident
    setVideoTimes((prev) => ({
      ...prev,
      [cameraId]: timestamp,
    }));
  };

  const handleMarqueeVideoClick = (cameraId: string) => {
    setSelectedCamera(cameraId);
  };

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500'></div>
      </div>
    );
  }

  // Find the main camera object
  const mainCameraObj = allCameras.find(camera => camera.id === mainCamera);

  return (
    <div className='flex w-full flex-1'>
      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='container mx-auto py-6'>
          {/* Main Camera Display */}
          {mainCameraObj && (
            <div className='mb-6'>
              <div className='relative aspect-video overflow-hidden rounded-lg'>
                <CameraFeed
                  camera={mainCameraObj}
                  onTimeUpdate={(time) => handleTimeUpdate(mainCameraObj.id, time)}
                />
                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4'>
                  <div className='font-medium text-white'>{mainCameraObj.name}</div>
                  <div className='text-sm text-white/75'>{mainCameraObj.address}</div>
                </div>
              </div>
            </div>
          )}

          {/* Marquee Camera Scrolling */}
          <div className='relative overflow-hidden'>
            <div className='flex animate-marquee space-x-4 py-2'>
              {locations.flatMap((location) =>
                location.cameras.map((camera) => (
                  <button
                    key={camera.id}
                    onClick={() => handleMarqueeVideoClick(camera.id)}
                    onMouseEnter={() => setHoveredCamera(camera.id)}
                    onMouseLeave={() => setHoveredCamera(null)}
                    className={`relative h-32 w-56 flex-shrink-0 overflow-hidden rounded-lg transition-opacity duration-300 hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hoveredCamera && hoveredCamera !== camera.id
                        ? 'opacity-70'
                        : 'opacity-100'
                    }`}
                  >
                    <CameraFeed
                      camera={camera}
                      onTimeUpdate={(time) => handleTimeUpdate(camera.id, time)}
                    />
                    <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2'>
                      <div className='text-sm font-medium text-white'>{camera.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className='hidden w-96 overflow-auto border-l border-gray-200 p-6 dark:border-gray-800 lg:block'>
        <StatsOverview />
        <div className='mt-6'>
          <EventFeed
            events={events}
            videoTimes={videoTimes}
            onEventHover={setHoveredCamera}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Camera Modal - Now used for both event clicks and marquee video clicks */}
      {selectedCamera && (
        <CameraModal
          open={true}
          onOpenChange={(open) => !open && setSelectedCamera(null)}
          cameraId={selectedCamera}
          currentTime={videoTimes[selectedCamera]}
          date={new Date()}
        />
      )}
    </div>
  );
}