'use client';

import { FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface EarthProps {
  onClose: () => void;
}

const Earth: FC<EarthProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Earth setup
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const textureLoader = new THREE.TextureLoader();

    // Load all textures with reduced sizes
    const colorTexture = textureLoader.load('/textures/earth_color_21K.png', () => setIsLoading(false));
    const landOceanTexture = textureLoader.load('/textures/earth_landocean_16K.png');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds_8K.png');
    const topographyTexture = textureLoader.load('/textures/topography_21K.png');

    // Adjust texture properties
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    landOceanTexture.colorSpace = THREE.SRGBColorSpace;

    // Create Earth material with optimized settings
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      map: colorTexture,
      normalMap: topographyTexture,
      normalScale: new THREE.Vector2(0.02, 0.02),
      roughnessMap: landOceanTexture,
      roughness: 0.6,
      metalness: 0.0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
      displacementMap: topographyTexture,
      displacementScale: 0.1,
      displacementBias: -0.05,
    });

    // Create Earth mesh
    const earth = new THREE.Mesh(geometry, earthMaterial);
    scene.add(earth);

    // Create clouds layer with optimized settings
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cloudsGeometry = new THREE.SphereGeometry(2.02, 32, 32);
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(clouds);

    // Optimized lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = false;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    // Optimized animation loop
    let frameId: number;
    const animate = () => {
      if (!isMounted) return;
      frameId = requestAnimationFrame(animate);
      earth.rotation.y += 0.0005;
      clouds.rotation.y += 0.0007;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      geometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
    };
  }, [isMounted]);

  if (!isMounted) {
    return <div className="w-full h-screen bg-black" />;
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl animate-pulse">Loading Earth...</div>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default Earth;
