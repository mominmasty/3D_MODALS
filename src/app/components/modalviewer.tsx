'use client';

import React, { FC, Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Define proper types instead of using namespace and any
type ThreePrimitiveProps = {
  object: THREE.Object3D;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
};

// Define proper types for other Three.js elements
type ThreeElementProps = {
  intensity?: number;
  position?: [number, number, number];
  args?: any[];
  color?: string | number;
};

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
  const [modelError, setModelError] = useState<Error | null>(null);
  
  // Always initialize hooks - they should never be conditional
  const { scene: gltfScene, animations = [] } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, group);
  
  // Handle errors through a state instead of early return
  useEffect(() => {
    try {
      // Model loading check
      if (!gltfScene) {
        throw new Error("Failed to load model");
      }
      
      console.log('Model loaded successfully');
      console.log('Available animations:', Object.keys(actions));
      
      // Play all animations if available
      if (animations.length > 0) {
        Object.values(actions).forEach(action => {
          if (action) action.play();
        });
      }
    } catch (error) {
      console.error("Error handling model:", error);
      setModelError(error as Error);
    }
    
    // Cleanup on unmount
    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, animations, mixer, gltfScene]);
  
  if (modelError) return <FallbackCube />;
  
  return (
    <group ref={group}>
      <primitive 
        object={gltfScene} 
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
  
  // Move hook before any conditional returns
  useEffect(() => {
    if (isOpen) {
      setCanvasError(false);
    }
  }, [filename, isOpen]);
  
  // Handle canvas errors with proper type
  const handleCanvasError = (event: unknown) => {
    console.error('Canvas error:', event);
    setCanvasError(true);
  };
  
  if (!isOpen) return null;

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
