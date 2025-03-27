import React from 'react';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  StopCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoEvent } from '../actions';

interface DangerAlertProps {
  event: VideoEvent;
  onResolve: () => void;
}

export const DangerAlert: React.FC<DangerAlertProps> = ({
  event,
  onResolve,
}) => {
  const dangerColor = event.isDangerous
    ? 'bg-red-900/70 border-red-700'
    : 'bg-green-900/70 border-green-700';
  const Icon = event.isDangerous ? AlertTriangleIcon : CheckCircleIcon;

  return (
    <div
      className={`rounded-lg border p-3 ${dangerColor} mb-2 flex animate-pulse items-center space-x-3`}
    >
      <div className='flex w-full items-center space-x-3'>
        <Icon
          className={`h-8 w-8 ${event.isDangerous ? 'text-red-400' : 'text-green-400'}`}
        />
        <div className='flex-grow'>
          <p
            className={`text-sm font-medium ${event.isDangerous ? 'text-red-200' : 'text-green-200'}`}
          >
            {event.timestamp} - {event.description}
          </p>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={onResolve}
          className='bg-white/20 text-white hover:bg-white/30'
        >
          <StopCircleIcon className='mr-2 h-4 w-4' /> Resolve
        </Button>
      </div>
    </div>
  );
};
