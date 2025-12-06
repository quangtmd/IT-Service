
// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, color, scale, geometryType }: any) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometryType === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {geometryType === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
        {geometryType === 'torus' && <torusGeometry args={[0.7, 0.2, 16, 32]} />}
        <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.15} 
            wireframe 
            emissive={color}
            emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

export const FloatingElements = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <FloatingShape position={[-4, 2, -2]} color="#3b82f6" scale={1.5} geometryType="octahedron" />
      <FloatingShape position={[4, -2, -1]} color="#ef4444" scale={1.2} geometryType="box" />
      <FloatingShape position={[0, 3, -3]} color="#10b981" scale={1} geometryType="torus" />
      <FloatingShape position={[-3, -3, 0]} color="#f59e0b" scale={0.8} geometryType="octahedron" />
      <FloatingShape position={[5, 1, -4]} color="#8b5cf6" scale={1.8} geometryType="torus" />
    </>
  );
};
