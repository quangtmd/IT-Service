import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const CyberShape = () => {
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
    <Float speed={3} rotationIntensity={1.5} floatIntensity={1}>
      <group>
        {/* Outer Wireframe */}
        <Icosahedron ref={outerRef} args={[1.8, 0]}>
          <meshStandardMaterial 
            color="#00f3ff" 
            wireframe 
            emissive="#00f3ff" 
            emissiveIntensity={0.5} 
            transparent
            opacity={0.3}
          />
        </Icosahedron>
        
        {/* Inner Solid Core */}
        <Octahedron ref={innerRef} args={[1, 0]}>
          <meshStandardMaterial 
            color="#3b82f6" 
            roughness={0.1} 
            metalness={0.9} 
            emissive="#2563eb"
            emissiveIntensity={1}
          />
        </Octahedron>
      </group>
    </Float>
  );
};

export default CyberShape;