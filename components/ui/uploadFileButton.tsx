'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const UploadFileButton = () => {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Here you would typically handle the file upload to your server
      console.log('File selected:', file);
    }
  };

  return (
    <div className='relative z-10'>
      <button
        onClick={() => fileInputRef.current?.click()}
        className='flex w-64 items-center justify-center rounded-md bg-white px-4 py-3 text-black shadow-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white'
      >
        {fileName ? (
          <span className='truncate'>{fileName}</span>
        ) : (
          <>
            <Upload className='mr-2 h-5 w-5' />
            Upload Video
          </>
        )}
      </button>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleUpload}
        accept='video/*'
        className='hidden'
      />
    </div>
  );
};

export default UploadFileButton;
