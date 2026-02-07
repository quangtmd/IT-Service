
// @ts-nocheck
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// A complex "Tech Core" shape: A wireframe sphere surrounding a solid glowing core
const CyberCore = ({ position }: { position: [number, number, number] }) => {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.2;
      outerRef.current.rotation.x += delta * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y += delta * 0.5;
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      innerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position} 
             onPointerOver={() => setHover(true)}
             onPointerOut={() => setHover(false)}>
        
        {/* Outer Wireframe Shield */}
        <mesh ref={outerRef} scale={hovered ? 2.2 : 2}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial 
            color="#00f3ff" 
            wireframe 
            transparent 
            opacity={0.3} 
            emissive="#00f3ff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Inner Energy Core */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            roughness={0.1}
            metalness={0.8}
            emissive="#2563eb"
            emissiveIntensity={2}
          />
        </mesh>
      </group>
    </Float>
  );
};

// Floating data blocks appearing as chips or data packets
const DataBlock = ({ position, rotationSpeed }: { position: [number, number, number], rotationSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color="#64748b" 
          roughness={0.2} 
          metalness={0.9} 
          wireframe
        />
      </mesh>
    </Float>
  );
};

// A digital grid floor to give perspective
const DigitalGrid = () => {
    const gridRef = useRef<THREE.Group>(null!);
    
    useFrame((state, delta) => {
        if(gridRef.current) {
            gridRef.current.rotation.z += delta * 0.05;
        }
    });

    return (
        <group ref={gridRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
             <gridHelper args={[40, 40, 0x00f3ff, 0x1e293b]} />
        </group>
    )
}

const TechShapes: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      {/* Cyber Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00f3ff" distance={20} />
      <pointLight position={[-10, -10, 10]} intensity={2} color="#ec4899" distance={20} />
      <spotLight position={[0, 0, 10]} intensity={1} angle={0.5} penumbra={1} color="#ffffff" />

      {/* Environment / Atmosphere */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* Digital Particles (Data Stream) */}
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#00f3ff" />
      <Sparkles count={100} scale={10} size={4} speed={0.2} opacity={0.3} color="#ec4899" />

      {/* Floating Tech Objects */}
      <group>
        {/* Main Core - The "Brain" */}
        <CyberCore position={[3, 0, 0]} />
        
        {/* Satellite Nodes */}
        <DataBlock position={[-3, 2, 2]} rotationSpeed={0.5} />
        <DataBlock position={[-4, -2, 0]} rotationSpeed={0.3} />
        <DataBlock position={[-2, 0, 3]} rotationSpeed={0.7} />
        
        {/* Background Grid for Depth */}
        <DigitalGrid />
      </group>
    </>
  );
};

export default TechShapes;
