import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { DangerAlert } from './DangerAlert';
import { VideoEvent } from '../actions';

interface NotificationPanelProps {
  events: VideoEvent[];
  onResolveEvent: (index: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  events,
  onResolveEvent,
}) => {
  return (
    <div className='w-1/4 overflow-y-auto border-l-2 border-blue-900/30 bg-gray-800/60 p-4 backdrop-blur-sm'>
      <div className='sticky top-0 z-10 mb-4 rounded-lg bg-gray-900/80 pb-2'>
        <h2 className='flex items-center p-2 text-xl font-bold text-blue-300'>
          <AlertTriangleIcon className='mr-2 text-yellow-500' />
          Event Log
        </h2>
      </div>

      {events.length === 0 ? (
        <div className='py-8 text-center text-gray-500'>No events detected</div>
      ) : (
        <div className='space-y-2'>
          {events.map((event, index) => (
            <DangerAlert
              key={index}
              event={event}
              onResolve={() => onResolveEvent(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
