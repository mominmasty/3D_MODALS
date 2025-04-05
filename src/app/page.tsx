'use client';

import { FC } from 'react';
import Image from 'next/image';

interface CardProps {
  title: string;
  imageUrl: string;
}

const Card: FC<CardProps> = ({ title,imageUrl }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
      <h3 className="text-2xl font-bold text-center mb-6 text-white">{title}</h3>
      <div className="relative w-full h-48 mb-4">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-md"
          priority={false}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md"></div>
      </div>
    </div>
  );
};

const Home: FC = () => {
  const cards = [
    { 
      title: 'Card 1', 
      imageUrl: '/images/card1.jpg'
    },
    { 
      title: 'Card 2', 
      imageUrl: '/images/card2.jpg'
    },
    { 
      title: 'Card 3', 
      imageUrl: '/images/card3.jpg'
    },
    { 
      title: 'Card 4', 
      imageUrl: '/images/card4.jpg'
    },
    { 
      title: 'Card 5', 
      imageUrl: '/images/card5.jpg'
    },
    { 
      title: 'Card 6', 
      imageUrl: '/images/card6.jpg'
    },
    { 
      title: 'Card 7', 
      imageUrl: '/images/card7.jpg'
    },
    { 
      title: 'Card 8', 
      imageUrl: '/images/card8.jpg'
    },
    { 
      title: 'Card 9', 
      imageUrl: '/images/card9.jpg'
    },
  ];

  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-4xl font-bold text-center mb-8 text-white">3D Models</h1>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Card 
                key={index} 
                title={card.title} 
                imageUrl={card.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
