'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Search,
  Film,
  Clock,
  Plus,
  ChevronRight,
  ArrowLeft,
  Filter,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SavedVideo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  timestamps: {
    timestamp: string;
    description: string;
    isDangerous?: boolean;
  }[];
}

export default function SavedVideosPage() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([]);
  const [sortOrder, setSortOrder] = useState<
    'newest' | 'oldest' | 'alphabetical'
  >('newest');
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem('savedVideos') || '[]');
    setSavedVideos(videos);
    setFilteredVideos(sortVideos(videos, sortOrder));
  }, []);

  useEffect(() => {
    const filtered = savedVideos.filter(
      (video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.timestamps.some((timestamp) =>
          timestamp.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredVideos(sortVideos(filtered, sortOrder));
  }, [searchTerm, savedVideos, sortOrder]);

  const sortVideos = (videos: SavedVideo[], order: string) => {
    const sorted = [...videos];
    switch (order) {
      case 'newest':
        return sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      case 'oldest':
        return sorted.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const handleDelete = (id: string) => {
    const updatedVideos = savedVideos.filter((video) => video.id !== id);
    setSavedVideos(updatedVideos);
    localStorage.setItem('savedVideos', JSON.stringify(updatedVideos));
    setIsDeleteDialogOpen(false);
    setVideoToDelete(null);
  };

  const confirmDelete = (id: string) => {
    setVideoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleVideoHover = (id: string, isHovering: boolean) => {
    const videoElement = videoRefs.current[id];
    if (videoElement) {
      if (isHovering) {
        videoElement.currentTime = 0;
        videoElement.play().catch((e) => console.log('Autoplay prevented', e));
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    }
  };

  const getVideoDuration = (video: SavedVideo) => {
    const videoElement = videoRefs.current[video.id];
    if (videoElement && videoElement.duration) {
      const minutes = Math.floor(videoElement.duration / 60);
      const seconds = Math.floor(videoElement.duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return '--:--';
  };

  return (
    <div className='flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white'>
      <div className='relative mx-auto mb-8 w-full max-w-6xl p-8'>
        <div className='absolute inset-0 z-0 opacity-10'>
          <div className='absolute -inset-[10px] animate-pulse rounded-full bg-purple-600 blur-3xl'></div>
          <div className='absolute -right-[40%] top-[30%] h-72 w-72 animate-pulse rounded-full bg-blue-500 blur-3xl'></div>
          <div className='absolute -left-[40%] top-[60%] h-72 w-72 animate-pulse rounded-full bg-indigo-500 blur-3xl'></div>
        </div>

        <div className='relative z-10 text-center'>
          <h1 className='mb-2 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-5xl font-bold text-transparent'>
            Video Library
          </h1>
          <p className='mx-auto max-w-2xl text-zinc-400'>
            Browse, search and manage your analyzed videos collection
          </p>
        </div>
      </div>

      <div className='mx-auto w-full max-w-6xl px-4 pb-12'>
        <div className='mb-8 flex flex-col items-center space-y-4 rounded-xl border border-zinc-800 bg-black p-4 shadow-xl sm:flex-row sm:justify-between sm:space-y-0'>
          <div className='relative w-full sm:max-w-md'>
            <Input
              type='text'
              placeholder='Search videos or timestamps...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-full border-zinc-700 bg-zinc-800/80 py-2 pl-10 pr-4 text-white placeholder-zinc-400 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
            />
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400'
              size={18}
            />
          </div>

          <div className='flex w-full flex-wrap justify-end gap-3 sm:w-auto'>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='icon'
                className={`border-zinc-700 ${isGridView ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-400'}`}
                onClick={() => setIsGridView(true)}
              >
                <svg
                  width='15'
                  height='15'
                  viewBox='0 0 15 15'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect
                    x='1'
                    y='1'
                    width='5'
                    height='5'
                    rx='1'
                    fill='currentColor'
                  />
                  <rect
                    x='9'
                    y='1'
                    width='5'
                    height='5'
                    rx='1'
                    fill='currentColor'
                  />
                  <rect
                    x='1'
                    y='9'
                    width='5'
                    height='5'
                    rx='1'
                    fill='currentColor'
                  />
                  <rect
                    x='9'
                    y='9'
                    width='5'
                    height='5'
                    rx='1'
                    fill='currentColor'
                  />
                </svg>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className={`border-zinc-700 ${!isGridView ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-400'}`}
                onClick={() => setIsGridView(false)}
              >
                <svg
                  width='15'
                  height='15'
                  viewBox='0 0 15 15'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect
                    x='1'
                    y='2'
                    width='13'
                    height='3'
                    rx='1'
                    fill='currentColor'
                  />
                  <rect
                    x='1'
                    y='7'
                    width='13'
                    height='3'
                    rx='1'
                    fill='currentColor'
                  />
                  <rect
                    x='1'
                    y='12'
                    width='13'
                    height='1'
                    rx='0.5'
                    fill='currentColor'
                  />
                </svg>
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='ml-2 border-zinc-700 text-white hover:bg-zinc-800'
                >
                  <Filter className='mr-2 h-4 w-4' />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='bg-zinc-900 text-white'>
                <DropdownMenuItem
                  className={sortOrder === 'newest' ? 'bg-zinc-800' : ''}
                  onClick={() => setSortOrder('newest')}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === 'oldest' ? 'bg-zinc-800' : ''}
                  onClick={() => setSortOrder('oldest')}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === 'alphabetical' ? 'bg-zinc-800' : ''}
                  onClick={() => setSortOrder('alphabetical')}
                >
                  Alphabetical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href='/pages/upload'>
              <Button className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'>
                <Plus className='mr-2 h-4 w-4' />
                Add Video
              </Button>
            </Link>
          </div>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-xl border border-zinc-800 bg-black p-4 shadow-xl'>
            <div className='flex items-center space-x-4'>
              <div className='rounded-full bg-indigo-900/20 p-3'>
                <Film className='h-6 w-6 text-indigo-400' />
              </div>
              <div>
                <p className='text-sm text-zinc-400'>Total Videos</p>
                <p className='text-2xl font-bold text-white'>
                  {savedVideos.length}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-zinc-800 bg-black p-4 shadow-xl'>
            <div className='flex items-center space-x-4'>
              <div className='rounded-full bg-purple-900/20 p-3'>
                <Clock className='h-6 w-6 text-purple-400' />
              </div>
              <div>
                <p className='text-sm text-zinc-400'>Total Timestamps</p>
                <p className='text-2xl font-bold text-white'>
                  {savedVideos.reduce(
                    (acc, video) => acc + video.timestamps.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-zinc-800 bg-black p-4 shadow-xl'>
            <div className='flex items-center space-x-4'>
              <div className='rounded-full bg-pink-900/20 p-3'>
                <svg
                  className='h-6 w-6 text-pink-400'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div>
                <p className='text-sm text-zinc-400'>Last Added</p>
                <p className='text-md font-medium text-white'>
                  {savedVideos.length > 0
                    ? new Date(
                        parseInt(
                          savedVideos.sort(
                            (a, b) => parseInt(b.id) - parseInt(a.id)
                          )[0].id
                        )
                      ).toLocaleDateString()
                    : 'No videos'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isGridView ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className='group relative overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20'
                onMouseEnter={() => handleVideoHover(video.id, true)}
                onMouseLeave={() => handleVideoHover(video.id, false)}
              >
                <div className='relative aspect-video cursor-pointer overflow-hidden bg-zinc-900'>
                  <video
                    ref={(el) => {
                      videoRefs.current[video.id] = el;
                    }}
                    src={video.url}
                    className='h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105'
                    preload='metadata'
                    muted
                    loop
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='absolute bottom-4 left-4 right-4 flex justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <Badge className='bg-black/70 backdrop-blur-sm'>
                      {video.timestamps.length} timestamps
                    </Badge>
                    <Badge className='bg-black/70 backdrop-blur-sm'>
                      {getVideoDuration(video)}
                    </Badge>
                  </div>
                  <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <Link href={`/pages/video/${video.id}`}>
                      <Button
                        size='icon'
                        className='h-12 w-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30'
                      >
                        <PlayCircle className='h-6 w-6 text-white' />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className='p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h2 className='truncate text-lg font-semibold tracking-wide text-white'>
                      {video.name}
                    </h2>
                    {video.timestamps.some((t) => t.isDangerous) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-900/20'>
                              <AlertTriangle className='h-3 w-3 text-red-400' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className='bg-zinc-800 text-white'>
                            Contains potentially sensitive content
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <Link
                      href={`/pages/video/${video.id}`}
                      className='flex items-center text-sm font-medium text-indigo-400 transition-colors duration-200 hover:text-indigo-300'
                    >
                      View Details
                      <ChevronRight className='ml-1 h-4 w-4' />
                    </Link>
                    <Button
                      onClick={() => confirmDelete(video.id)}
                      variant='ghost'
                      size='icon'
                      className='text-zinc-400 hover:bg-red-900/20 hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className='group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black p-4 shadow-xl transition-all duration-300 hover:bg-zinc-900/50 sm:flex-row sm:items-center'
              >
                <div
                  className='relative mr-4 h-24 w-full cursor-pointer overflow-hidden rounded-lg sm:h-20 sm:w-36'
                  onMouseEnter={() => handleVideoHover(video.id, true)}
                  onMouseLeave={() => handleVideoHover(video.id, false)}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[video.id] = el;
                    }}
                    src={video.url}
                    className='h-full w-full object-cover'
                    preload='metadata'
                    muted
                    loop
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <PlayCircle className='h-8 w-8 text-white' />
                  </div>
                </div>

                <div className='mt-4 flex-grow sm:mt-0'>
                  <div className='flex items-center'>
                    <h2 className='mr-2 text-lg font-semibold text-white'>
                      {video.name}
                    </h2>
                    {video.timestamps.some((t) => t.isDangerous) && (
                      <Badge className='bg-red-900/20 text-red-400'>
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400'>
                    <Badge className='bg-zinc-800'>
                      {video.timestamps.length} timestamps
                    </Badge>
                    <span>•</span>
                    <span>{getVideoDuration(video)}</span>
                    <span>•</span>
                    <span>
                      {new Date(parseInt(video.id)).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className='mt-4 flex justify-end gap-2 sm:mt-0'>
                  <Link href={`/pages/video/${video.id}`}>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-zinc-700 hover:bg-indigo-900/20 hover:text-indigo-400'
                    >
                      View
                    </Button>
                  </Link>
                  <Button
                    onClick={() => confirmDelete(video.id)}
                    variant='ghost'
                    size='sm'
                    className='text-zinc-400 hover:bg-red-900/20 hover:text-red-400'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && (
          <div className='mt-8 flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-black p-16 text-center'>
            <div className='mb-6 rounded-full bg-zinc-900/50 p-6'>
              <Film className='h-12 w-12 text-zinc-600' />
            </div>
            <h3 className='mb-2 text-xl font-medium text-white'>
              {searchTerm
                ? 'No videos match your search'
                : 'No videos in your library'}
            </h3>
            <p className='mb-6 max-w-md text-zinc-400'>
              {searchTerm
                ? 'Try a different search term or clear the search to see all videos.'
                : 'Upload and analyze your first video to get started with automatic timestamp generation.'}
            </p>
            <Link href='/pages/upload'>
              <Button className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'>
                <Plus className='mr-2 h-4 w-4' />
                Upload your first video
              </Button>
            </Link>
          </div>
        )}

        <div className='mt-12 flex justify-center'>
          <Link href='/pages/upload'>
            <Button
              variant='outline'
              className='border-zinc-700 text-white hover:bg-zinc-800'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Analyzer
            </Button>
          </Link>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='border-zinc-700 bg-zinc-900 text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-xl'>Delete Video</DialogTitle>
            <DialogDescription className='text-zinc-400'>
              Are you sure you want to delete this video? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              className='border-zinc-700 text-white hover:bg-zinc-800'
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => videoToDelete && handleDelete(videoToDelete)}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
