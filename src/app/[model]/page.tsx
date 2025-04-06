'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Square from '../components/models/Square';

export default function ModelPage() {
  const params = useParams();
  const router = useRouter();
  const [modelName, setModelName] = useState<string | null>(null);

  useEffect(() => {
    if (params.model) {
      // Convert to string if it's an array
      const modelParam = Array.isArray(params.model) ? params.model[0] : params.model;
      
      // Check if the model exists
      if (modelParam.toLowerCase() === 'square') {
        setModelName('Square');
      } else {
        // Redirect to home if model doesn't exist
        router.push('/');
      }
    }
  }, [params, router]);

  const handleCloseModel = () => {
    router.push('/');
  };

  // Render the appropriate component based on the model name
  const renderModel = () => {
    if (!modelName) return null;
    
    // Map model names to components
    const componentMap: Record<string, React.ReactNode> = {
      'Square': <Square onClose={handleCloseModel} />
      // Add more components as needed
    };
    
    return componentMap[modelName] || null;
  };

  return (
    <main className="min-h-screen bg-black">
      {renderModel()}
    </main>
  );
} 