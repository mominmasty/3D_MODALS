"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

interface SquareProps {
  onClose?: () => void;
}

export default function Scene({ onClose }: SquareProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [color, setColor] = useState<string>('#ff4444');
    const [score, setScore] = useState<number>(0);
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const moveSpeed = 0.05;
    const jumpForce = 0.1;
    const gravity = 0.004;
    const velocityRef = useRef({ y: 0 });
    const keys = useRef({ w: false, a: false, s: false, d: false });
    const isJumping = useRef(false);

    // Color effect
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.setStyle(color);
        }
    }, [color]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(2, 2, 4);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(2, 4, 2);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        // Platform
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.2, 5),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );
        platform.position.y = -0.1;
        platform.receiveShadow = true;
        scene.add(platform);

        // Grid
        const grid = new THREE.GridHelper(5, 10);
        grid.position.y = 0.001;
        scene.add(grid);  

        // Cube
        const material = new THREE.MeshStandardMaterial({ color });
        materialRef.current = material;
        const cube = new THREE.Mesh(
            new RoundedBoxGeometry(0.5, 0.5, 0.5, 8, 0.1),
            material
        );
        cube.position.y = 0.25;
        cube.castShadow = true;
        scene.add(cube);
        cubeRef.current = cube;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Input handlers
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === ' ' && !isJumping.current) {
                velocityRef.current.y = jumpForce;
                isJumping.current = true;
                setScore(prev => prev + 1);
            } else if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key in keys.current) {
                keys.current[key as keyof typeof keys.current] = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Animation
        function animate() {
            if (!cube) return;

            // Physics
            velocityRef.current.y -= gravity;
            cube.position.y += velocityRef.current.y;

            if (cube.position.y <= 0.25) {
                cube.position.y = 0.25;
                velocityRef.current.y = 0;
                isJumping.current = false;
            }

            // Movement
            if (keys.current.w) {
                cube.position.z -= moveSpeed;
                if (!isJumping.current) cube.rotation.x += 0.1;
            }
            if (keys.current.s) {
                cube.position.z += moveSpeed;
                if (!isJumping.current) cube.rotation.x -= 0.1;
            }
            if (keys.current.a) {
                cube.position.x -= moveSpeed;
                if (!isJumping.current) cube.rotation.z += 0.1;
            }
            if (keys.current.d) {
                cube.position.x += moveSpeed;
                if (!isJumping.current) cube.rotation.z -= 0.1;
            }

            // Bounds
            cube.position.x = Math.max(-2.25, Math.min(2.25, cube.position.x));
            cube.position.z = Math.max(-2.25, Math.min(2.25, cube.position.z));

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            
            // Properly remove the canvas element
            if (containerRef.current) {
                const canvas = containerRef.current.querySelector('canvas');
                if (canvas) {
                    canvas.remove();
                }
                // Alternative approach if needed
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
            
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        };
    }, []);

    return (
        <div className="relative w-full h-full flex">
            <div className="flex-1 relative">
                <div ref={containerRef} className="absolute inset-0" />
            </div>
            <div className="w-80 h-full bg-gray-900 p-6 text-white overflow-y-auto flex flex-col shadow-xl z-10 relative">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Customize</h2>
                    <button 
                        onClick={onClose || (() => window.history.pushState({}, '', '/'))}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-12 cursor-pointer rounded"
                    />
                    <span>Change cube color</span>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Mouse Controls</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-200">
                            <li><strong>Left-click and drag:</strong> Rotate the camera</li>
                            <li><strong>Right-click and drag:</strong> Pan the camera</li>
                            <li><strong>Scroll wheel:</strong> Zoom in and out</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Movement Controls</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-200">
                            <li><strong>W:</strong> Move forward</li>
                            <li><strong>S:</strong> Move backward</li>
                            <li><strong>A:</strong> Move left</li>
                            <li><strong>D:</strong> Move right</li>
                            <li><strong>Space:</strong> Jump</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Score</h3>
                        <p className="text-3xl font-bold text-green-400">{score}</p>
                        <p className="text-sm mt-1 text-gray-400">Score increases when you jump!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
