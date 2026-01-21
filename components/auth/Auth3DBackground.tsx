
// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, PerspectiveCamera, Float, Icosahedron, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      // Move grid towards camera to simulate infinite movement
      gridRef.current.position.z = (state.clock.elapsedTime * 2) % 10;
    }
  });

  return (
    <group ref={gridRef} position={[0, -2, 0]}>
      <gridHelper args={[60, 60, 0xff0055, 0x2a0a4a]} position={[0, 0, -10]} />
      <gridHelper args={[60, 60, 0x00f3ff, 0x0a1a4a]} position={[0, 0, -40]} />
    </group>
  );
};

const FloatingShape = ({ position, color, type, scale = 1, speed = 1 }: any) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    
    useFrame((state, delta) => {
        if(meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5 * speed;
            meshRef.current.rotation.y += delta * 0.2 * speed;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                {type === 'icosahedron' ? (
                    <icosahedronGeometry args={[1, 0]} />
                ) : (
                    <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
                )}
                <meshStandardMaterial 
                    color={color} 
                    wireframe 
                    transparent 
                    opacity={0.3} 
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    )
}

const SceneContent = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
            <pointLight position={[-10, 5, -5]} intensity={1} color="#ff0055" />
            
            <MovingGrid />
            
            <FloatingShape position={[-4, 1, -2]} color="#00f3ff" type="icosahedron" scale={1.5} speed={0.8} />
            <FloatingShape position={[4, -1, -3]} color="#ff0055" type="torus" scale={1.2} speed={1.2} />
            <FloatingShape position={[0, 3, -5]} color="#cc00ff" type="icosahedron" scale={0.8} speed={0.5} />

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={150} scale={15} size={3} speed={0.4} opacity={0.5} color="#ffffff" />
            
            <fog attach="fog" args={['#050a14', 5, 30]} />
            <color attach="background" args={['#050a14']} />
        </>
    )
}

const Auth3DBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <Canvas>
         <SceneContent />
      </Canvas>
      {/* Overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
    </div>
  );
};

export default Auth3DBackground;
