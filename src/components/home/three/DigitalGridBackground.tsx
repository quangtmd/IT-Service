
// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Loop the position to create infinite effect but SLOWER (gentle)
      // Speed reduced from 4 to 1.5
      gridRef.current.position.z = (state.clock.elapsedTime * 1.5) % 20;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5, -10]}>
      <gridHelper args={[100, 50, '#00f3ff', '#1e3a8a']} position={[0, 0, 0]} />
      <gridHelper args={[100, 50, '#00f3ff', '#1e3a8a']} position={[0, 0, -100]} />
    </group>
  );
};

const GentleParticles = () => {
    const meshRef = useRef<THREE.Points>(null!);
    const count = 1000;

    // Use a Float32Array directly for positions and store speeds in a separate ref
    const [positions, speeds] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100; // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 60; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
            spd[i] = Math.random() * 0.2 + 0.05; // Much slower speeds (0.05 - 0.25)
        }
        return [pos, spd];
    }, [count]);

    useFrame((state) => {
        if (meshRef.current && meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
            const geom = meshRef.current.geometry;
            const currentPositions = geom.attributes.position.array as Float32Array;
            
            for (let i = 0; i < count; i++) {
                // Move stars gently towards camera
                let z = currentPositions[i * 3 + 2];
                z += speeds[i] * 2; // Reduced multiplier for gentle drift
                
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
            <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.6} sizeAttenuation={true} />
        </points>
    );
};

const MouseParallaxGroup = ({ children }: { children: React.ReactNode }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const { pointer } = useThree();

    useFrame(() => {
        if (groupRef.current) {
            // Gentle rotation based on mouse position
            // Interpolate towards the mouse position for smoothness
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.05, 0.05);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -pointer.x * 0.05, 0.05);
        }
    });

    return <group ref={groupRef}>{children}</group>;
};


const DigitalGridBackground: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <fog attach="fog" args={['#0B1120', 5, 40]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#00aaff" />
      
      <MouseParallaxGroup>
          <MovingGrid />
          <GentleParticles />
          {/* Distant background stars - standard static stars for depth */}
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      </MouseParallaxGroup>
    </>
  );
};

export default DigitalGridBackground;
