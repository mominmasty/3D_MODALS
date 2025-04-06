'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import ModelViewer from './modalviewer';

interface ModelCardProps {
  title: string;
  filename: string;
}

const ModelCard: FC<ModelCardProps> = ({ title, filename }) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the model-specific route
    router.push(`/${filename.toLowerCase()}`);
  };

  return (
    <div 
      className="bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700"
      onClick={handleClick}
    >
      <h3 className="text-2xl font-bold text-center mb-6 text-white">{title}</h3>
      <div className="relative w-full h-48 mb-4">
        <div className="absolute inset-0 bg-black rounded-md cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <ModelViewer
              filename={filename}
              isOpen={true}
              onClose={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard; 