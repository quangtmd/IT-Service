
// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Move grid towards camera to simulate flying
      // Loop the position to create infinite effect
      gridRef.current.position.z = (state.clock.elapsedTime * 8) % 20;
    }
  });

  return (
    <group ref={gridRef} position={[0, -2, -20]}>
       {/* Bottom Grid - Cyan */}
      <gridHelper args={[80, 40, 0x00f3ff, 0x1e3a8a]} position={[0, -2, 0]} />
       {/* Top Grid - Fainter */}
      <gridHelper args={[80, 40, 0x1e3a8a, 0x020617]} position={[0, 10, 0]} rotation={[Math.PI, 0, 0]} />
      
      {/* Second layer for density */}
      <gridHelper args={[80, 40, 0x00f3ff, 0x1e3a8a]} position={[0, -2, -80]} />
    </group>
  );
};

const WarpStars = () => {
    const mesh = useRef<THREE.Points>(null!);
    const count = 1000;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            // Random positions in a tunnel-like distribution
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 100;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            speeds[i] = Math.random() * 0.5 + 0.1;
        }
        return { positions, speeds };
    }, [count]);
    
    useFrame((state) => {
        if (mesh.current) {
            const positions = mesh.current.geometry.attributes.position.array;
            
            for (let i = 0; i < count; i++) {
                // Move stars towards camera
                positions[i * 3 + 2] += particles.speeds[i] * 5; // Speed multiplier
                
                // Reset if they pass the camera
                if (positions[i * 3 + 2] > 20) {
                     positions[i * 3 + 2] = -80;
                }
            }
            mesh.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute 
                    attach="attributes-position" 
                    count={count} 
                    array={particles.positions} 
                    itemSize={3} 
                />
            </bufferGeometry>
            <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.8} sizeAttenuation={true} />
        </points>
    );
};


const DigitalGridBackground: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={60} />
      {/* Deep Space Background Color */}
      <color attach="background" args={['#020617']} />
      
      {/* Fog for depth fading */}
      <fog attach="fog" args={['#020617', 5, 60]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
      
      <MovingGrid />
      <WarpStars />
      
      {/* Distant Static Stars */}
      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0} />
    </>
  );
};

export default DigitalGridBackground;
