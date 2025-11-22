
// @ts-nocheck

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles, Icosahedron, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

const AbstractShape = ({ position, color, scale, type, speed = 1 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2 * speed;
      meshRef.current.rotation.y += delta * 0.3 * speed;
      if (hovered) {
          meshRef.current.rotation.z += delta * 1;
      }
    }
  });

  const materialProps = {
    color: color,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.6,
    emissive: color,
    emissiveIntensity: hovered ? 0.8 : 0.2,
    wireframe: type === 'wireframe'
  };

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        position={position} 
        scale={hovered ? scale * 1.1 : scale}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        {type === 'icosahedron' && <Icosahedron args={[1, 1]} />}
        {type === 'torus' && <Torus args={[0.7, 0.2, 16, 32]} />}
        {type === 'octahedron' && <Octahedron args={[1, 0]} />}
        
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </Float>
  );
};

export const FloatingElements = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ef4444" />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />

      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.4} color="#ffffff" />
      
      <group position={[0, -0.5, 0]}>
          {/* Central Core representing Stability */}
          <AbstractShape position={[0, 0, 0]} color="#3b82f6" scale={1.8} type="icosahedron" speed={0.5} />
          
          {/* Orbiting Elements representing Services */}
          <AbstractShape position={[-3, 2, 1]} color="#ef4444" scale={0.8} type="octahedron" speed={1.5} />
          <AbstractShape position={[3, -1.5, -1]} color="#10b981" scale={0.8} type="octahedron" speed={1.2} />
          <AbstractShape position={[0, 2.5, -2]} color="#f59e0b" scale={0.6} type="torus" speed={2} />
          <AbstractShape position={[-2.5, -2, 2]} color="#8b5cf6" scale={0.7} type="torus" speed={1.8} />
          
          {/* Background decorative wireframes */}
          <mesh position={[0, 0, -5]} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[15, 15, 10, 10]} />
              <meshBasicMaterial color="#1e3a8a" wireframe transparent opacity={0.05} />
          </mesh>
      </group>
    </>
  );
};

export default FloatingElements;
