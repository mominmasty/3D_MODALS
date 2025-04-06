'use client';

import { FC } from 'react';
import ModelCard from './components/ModelCard';

// Define available models
const models = [
  {
    title: 'Square',
    filename: 'Square'
  },
  // Add more models here as needed
];

const Home: FC = () => {
  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-4xl font-bold text-center mb-8 text-white">3D Models</h1>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <ModelCard
                key={index}
                title={model.title}
                filename={model.filename}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
