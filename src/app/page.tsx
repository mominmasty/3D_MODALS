'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModelViewer from './components/modalviewer';
import Square from './components/models/Square';

interface CardProps {
  title: string;
  filename: string;
  onClick: () => void;
}

const Card: FC<CardProps> = ({ title, filename, onClick }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
      <h3 className="text-2xl font-bold text-center mb-6 text-white">{title}</h3>
      <div className="relative w-full h-48 mb-4">
        <div
          className="absolute inset-0 bg-black rounded-md cursor-pointer"
          onClick={onClick}
        >
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

const Home: FC = () => {
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [hasRouteChanged, setHasRouteChanged] = useState(false);

  // Initialize from localStorage or URL on component mount
  useEffect(() => {
    // Try to get state from localStorage first
    const savedModel = localStorage.getItem('activeModel');
    if (savedModel) {
      setActiveModel(savedModel);
      return;
    }

    // Otherwise check URL path
    const path = window.location.pathname.slice(1); // Remove leading slash
    
    if (path) {
      // Convert to lowercase for case-insensitive matching
      const pathLower = path.toLowerCase();
      
      // Check for direct matches first
      if (pathLower === 'square') {
        setActiveModel('Square');
        return;
      }
      
      // Find card that matches the path
      const card = cards.find(card => 
        card.title.toLowerCase().replace(/\s+/g, '-') === pathLower ||
        card.filename.toLowerCase() === pathLower
      );
      
      if (card) {
        setActiveModel(card.filename);
      }
    }
  }, []);

  // Save active model to localStorage whenever it changes
  useEffect(() => {
    if (activeModel) {
      localStorage.setItem('activeModel', activeModel);
    } else {
      localStorage.removeItem('activeModel');
    }
  }, [activeModel]);

  // Clean up any stray Three.js canvases when component mounts
  useEffect(() => {
    const cleanup = () => {
      // Remove any leftover canvases from Three.js
      const canvases = document.querySelectorAll('canvas[data-engine="three.js r175"]');
      canvases.forEach(canvas => canvas.remove());
    };
    
    // Cleanup on mount and before unmount
    cleanup();
    return cleanup;
  }, []);

  const handleModelSelect = (title: string, filename: string) => {
    // Create a clean URL path that will be recognized on reload
    // Use the filename directly for simpler matching
    const urlPath = filename.toLowerCase();
    window.history.pushState({}, '', `/${urlPath}`);
    
    // Set the active model
    setActiveModel(filename);
    setHasRouteChanged(true);
  };

  const handleCloseModel = () => {
    // Clear active model state
    setActiveModel(null);
    
    // Reset URL to homepage
    window.history.pushState({}, '', '/');
    
    // Reset route change flag
    setHasRouteChanged(false);
    
    // Clear from localStorage
    localStorage.removeItem('activeModel');
  };

  const cards = [
    {
      title: 'Square',
      filename: 'Square'
    },
    // Add more cards here
  ];

  // Dynamically render the appropriate component based on the active model
  const renderActiveModel = () => {
    if (!activeModel) return null;
    
    // Map of filenames to components with close handler
    const componentMap: Record<string, React.ReactNode> = {
      'Square': <Square onClose={handleCloseModel} />
      // Add more components as needed
    };
    
    return componentMap[activeModel] || null;
  };

  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      {!activeModel ? (
        <div>
          <h1 className="text-4xl font-bold text-center mb-8 text-white">3D Models</h1>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <Card
                  key={index}
                  title={card.title}
                  filename={card.filename}
                  onClick={() => handleModelSelect(card.title, card.filename)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderActiveModel()
      )}
    </main>
  );
};

export default Home;
