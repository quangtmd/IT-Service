// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Octahedron, Icosahedron, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

const CyberShape: React.FC = () => {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.2;
      outerRef.current.rotation.y += delta * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.4;
      innerRef.current.rotation.y -= delta * 0.5;
    }
  });

  return (
      <>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
            <group>
                {/* Outer Wireframe */}
                <Icosahedron ref={outerRef} args={[2, 1]}>
                <meshStandardMaterial 
                    color="#00f3ff" 
                    wireframe 
                    emissive="#00f3ff" 
                    emissiveIntensity={0.3} 
                    transparent
                    opacity={0.25}
                />
                </Icosahedron>
                
                {/* Inner Solid Core */}
                <Octahedron ref={innerRef} args={[1, 0]}>
                <meshStandardMaterial 
                    color="#3b82f6" 
                    roughness={0.1} 
                    metalness={0.9} 
                    emissive="#2563eb"
                    emissiveIntensity={1.2}
                />
                </Octahedron>
            </group>
        </Float>
        <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={0.5} />
      </>
  );
};

export default CyberShape;
