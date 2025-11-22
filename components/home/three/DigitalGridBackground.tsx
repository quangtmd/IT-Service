// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Move grid towards camera to simulate flying through a tunnel
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

const EnergyParticles = () => {
    const mesh = useRef<THREE.Points>(null!);
    const count = 200;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 50;
        }
        return positions;
    }, [count]);
    
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.position.z = (state.clock.getElapsedTime() * 2) % 20;
        }
    });

    return (
        <points ref={mesh} position={[0,0,-10]}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#00f3ff" />
        </points>
    );
};


const DigitalGridBackground: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <fog attach="fog" args={['#0B1120', 5, 25]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#00aaff" />
      <MovingGrid />
      <EnergyParticles />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

export default DigitalGridBackground;
