'use client';

import React, { FC, Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Grid } from '@react-three/drei';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      mesh: any;
      group: any;
      perspectiveCamera: any;
    }
  }
}

interface ModelProps {
  filename: string;
}

// Simple fallback component for errors
const FallbackCube = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const Model: FC<ModelProps> = ({ filename }) => {
  const group = useRef<THREE.Group>(null);
  const modelPath = `/models/${filename}.glb`;
  
  // Use a safe approach to loading the model
  let gltf;
  try {
    gltf = useGLTF(modelPath);
  } catch (error) {
    console.error("Error loading model:", error);
    return <FallbackCube />;
  }
  
  // Extract animations if they exist
  const { scene, animations = [] } = gltf;
  
  // Set up animations
  const { actions, mixer } = useAnimations(animations, group);
  
  // Play animations when component mounts
  useEffect(() => {
    console.log('Model loaded successfully');
    console.log('Available animations:', Object.keys(actions));
    
    // Play all animations if available
    if (animations.length > 0) {
      Object.values(actions).forEach(action => {
        if (action) action.play();
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, animations, mixer]);
  
  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={0.8} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Pre-load the Square model to ensure it's available
useGLTF.preload('/models/Square.glb');

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error('3D Model Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ModelWithErrorHandling: FC<ModelProps> = (props: ModelProps) => {
  return (
    <ErrorBoundary fallback={<FallbackCube />}>
      <Model {...props} />
    </ErrorBoundary>
  );
};

interface ModelViewerProps {
  filename: string;
  isOpen: boolean;
  onClose: () => void;
}

const ModelViewer: FC<ModelViewerProps> = ({ filename, isOpen, onClose }) => {
  console.log('ModelViewer render:', { filename, isOpen });
  const [canvasError, setCanvasError] = useState(false);
  
  if (!isOpen) return null;

  // Reset canvas error when component re-renders
  useEffect(() => {
    setCanvasError(false);
  }, [filename, isOpen]);

  // Handle canvas errors
  const handleCanvasError = (event: any) => {
    console.error('Canvas error:', event);
    setCanvasError(true);
  };

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black opacity-75" onClick={onClose}></div>
      <div className="absolute inset-0">
        {canvasError ? (
          <div className="flex items-center justify-center h-full text-white">
            <div className="bg-red-800 p-4 rounded">Error loading 3D model</div>
          </div>
        ) : (
          <Canvas 
            camera={{ 
              position: [3, 2, 3], 
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            shadows
            onCreated={state => {
              state.gl.setClearColor('#111');
            }}
            onError={handleCanvasError}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 7]} intensity={1.5} castShadow />
            <Suspense fallback={<FallbackCube />}>
              <ModelWithErrorHandling filename={filename} />
            </Suspense>
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={1}
              maxDistance={10}
            />
          </Canvas>
        )}
      </div>
    </div>
  );
};

export default ModelViewer;
