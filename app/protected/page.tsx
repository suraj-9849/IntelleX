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
  const [videoTimes, setVideoTimes] = useState<Record<string, number>>({});
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null);

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
  }, [supabase.auth, router]);

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

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-1'>
      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='container mx-auto py-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {locations.flatMap((location) =>
              location.cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  onMouseEnter={() => setHoveredCamera(camera.id)}
                  onMouseLeave={() => setHoveredCamera(null)}
                  className={`relative aspect-video overflow-hidden rounded-lg transition-opacity duration-300 hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hoveredCamera && hoveredCamera !== camera.id
                      ? 'opacity-30'
                      : 'opacity-100'
                  }`}
                >
                  <CameraFeed
                    camera={camera}
                    onTimeUpdate={(time) => handleTimeUpdate(camera.id, time)}
                  />
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4'>
                    <div className='font-medium text-white'>{camera.name}</div>
                    <div className='text-sm text-white/75'>
                      {camera.address}
                    </div>
                  </div>
                </button>
              ))
            )}
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

      {/* Camera Modal */}
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
