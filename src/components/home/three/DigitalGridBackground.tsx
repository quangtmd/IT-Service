
// @ts-nocheck
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Loop the position to create infinite effect with smoother speed
      // Directly modifying position.z is valid for a Group in Three.js
      gridRef.current.position.z = (state.clock.elapsedTime * 4) % 20;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5, -10]}>
      <gridHelper args={[100, 50, '#00f3ff', '#1e3a8a']} position={[0, 0, 0]} />
      <gridHelper args={[100, 50, '#00f3ff', '#1e3a8a']} position={[0, 0, -100]} />
    </group>
  );
};

const WarpStars = () => {
    const meshRef = useRef<THREE.Points>(null!);
    const count = 1000;

    // Use a Float32Array directly for positions and store speeds in a separate ref
    // to avoid re-creating them on every render or having closure issues
    const [positions, speeds] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100; // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 60; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
            spd[i] = Math.random() * 0.5 + 0.1;
        }
        return [pos, spd];
    }, [count]);

    useFrame((state) => {
        if (meshRef.current && meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
            const geom = meshRef.current.geometry;
            const currentPositions = geom.attributes.position.array as Float32Array;
            
            for (let i = 0; i < count; i++) {
                // Move stars towards camera
                let z = currentPositions[i * 3 + 2];
                z += speeds[i] * 5; 
                
                if (z > 20) {
                    z = -80; // Reset far behind
                    // Optional: Randomize X/Y on reset for variety
                    currentPositions[i * 3] = (Math.random() - 0.5) * 100;
                    currentPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
                }
                currentPositions[i * 3 + 2] = z;
            }
            geom.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    usage={THREE.DynamicDrawUsage} 
                />
            </bufferGeometry>
            <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.8} sizeAttenuation={true} />
        </points>
    );
};


const DigitalGridBackground: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <fog attach="fog" args={['#0B1120', 5, 40]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#00aaff" />
      
      <MovingGrid />
      <WarpStars />
      
      {/* Distant background stars */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
    </>
  );
};

export default DigitalGridBackground;
