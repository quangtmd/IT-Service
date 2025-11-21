
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed, geometryType }: { position: [number, number, number], color: string, speed: number, geometryType: 'box' | 'torus' | 'octahedron' }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 0.5;
      
      // Gentle floating movement independent of Float component
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.002;
    }
  });

  let Geometry;
  switch (geometryType) {
    case 'torus':
      Geometry = <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />;
      break;
    case 'octahedron':
      Geometry = <octahedronGeometry args={[1, 0]} />;
      break;
    case 'box':
    default:
      Geometry = <boxGeometry args={[1, 1, 1]} />;
      break;
  }

  return (
    <Float speed={speed * 2} rotationIntensity={1} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        position={position}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        {Geometry}
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.8} 
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
          wireframe={geometryType === 'octahedron'} // Wireframe for tech look
        />
      </mesh>
    </Float>
  );
};

const TechShapes: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ef4444" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />
      <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} />

      {/* Background Elements */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating 3D Objects */}
      <group>
        {/* Main Red Shape */}
        <FloatingShape position={[3, 1, 0]} color="#ef4444" speed={0.5} geometryType="torus" />
        
        {/* Secondary Blue Shape */}
        <FloatingShape position={[-3, -1, 1]} color="#3b82f6" speed={0.4} geometryType="box" />
        
        {/* Wireframe Tech Shape */}
        <FloatingShape position={[-2, 2, -2]} color="#10b981" speed={0.3} geometryType="octahedron" />
        
        {/* Small decorative shapes */}
        <FloatingShape position={[4, -2, -3]} color="#f59e0b" speed={0.6} geometryType="box" />
        <FloatingShape position={[0, 3, -5]} color="#8b5cf6" speed={0.2} geometryType="octahedron" />
      </group>

      <Environment preset="city" />
    </>
  );
};

export default TechShapes;
